import {
  List,
  ActionPanel,
  Action,
  showToast,
  Toast,
  Form,
  useNavigation,
  closeMainWindow,
} from "@raycast/api";
import { useEffect, useState } from "react";
import { list, loadHistory } from "./clipboard";
import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

const execAsync = promisify(exec);

type Entry = { text: string; timestamp: number };
type Step = "select-key" | "enter-message" | "confirm";

interface GPGKey {
  fingerprint: string;
  userId: string;
  rawText: string;
}

export default function GPGCommand() {
  const { push, pop } = useNavigation();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [step, setStep] = useState<Step>("select-key");
  const [selectedKey, setSelectedKey] = useState<GPGKey | null>(null);
  const [messageText, setMessageText] = useState("");
  const [outputPath, setOutputPath] = useState("");

  useEffect(() => {
    async function init() {
      await loadHistory();
      setEntries(list());
      setIsLoading(false);
    }
    init();
  }, []);

  // Parse PGP keys from clipboard entries
  function findPGPKeys(entries: Entry[]): { entry: Entry; key: GPGKey }[] {
    const keys: { entry: Entry; key: GPGKey }[] = [];

    for (const entry of entries) {
      const text = entry.text;

      // Look for PGP public key block
      if (text.includes("-----BEGIN PGP PUBLIC KEY BLOCK-----") &&
          text.includes("-----END PGP PUBLIC KEY BLOCK-----")) {

        // Try to extract fingerprint from comments
        const fingerprintMatch = text.match(/fingerprint:\s*([A-F0-9\s]+)/i) ||
                                 text.match(/Key fingerprint:\s*([A-F0-9\s]+)/i);

        // Try to extract user ID
        const userIdMatch = text.match(/Key user id:\s*(.+)/i) ||
                           text.match(/uid\s*\[?[^\]]*\]?\s*(.+)/i);

        const fingerprint = fingerprintMatch
          ? fingerprintMatch[1].replace(/\s/g, "")
          : "Unknown";

        const userId = userIdMatch
          ? userIdMatch[1].trim()
          : "Unknown";

        keys.push({
          entry,
          key: {
            fingerprint,
            userId,
            rawText: text,
          }
        });
      }
    }

    return keys;
  }

  async function importKey(keyText: string): Promise<boolean> {
    try {
      const tempFile = path.join(os.tmpdir(), `temp-pgp-key-${Date.now()}.asc`);
      fs.writeFileSync(tempFile, keyText);

      const { stderr } = await execAsync(`gpg --import "${tempFile}"`);
      fs.unlinkSync(tempFile);

      if (stderr && stderr.includes("error")) {
        throw new Error(stderr);
      }

      return true;
    } catch (error: any) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Failed to import PGP key",
        message: error.message || String(error),
      });
      return false;
    }
  }

  async function encryptMessage(keyFingerprint: string, message: string, outputPath: string): Promise<boolean> {
    try {
      const tempMessage = path.join(os.tmpdir(), `temp-message-${Date.now()}.txt`);
      fs.writeFileSync(tempMessage, message);

      const cmd = `gpg --encrypt --armor --recipient "${keyFingerprint}" --output "${outputPath}" "${tempMessage}"`;
      const { stderr } = await execAsync(cmd);

      fs.unlinkSync(tempMessage);

      if (stderr && stderr.includes("error")) {
        throw new Error(stderr);
      }

      return true;
    } catch (error: any) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Encryption failed",
        message: error.message || String(error),
      });
      return false;
    }
  }

  const pgpKeys = findPGPKeys(entries);

  // Step 1: Select PGP Key from clipboard history
  if (step === "select-key") {
    return (
      <List isLoading={isLoading} searchBarPlaceholder="Search for PGP keys in clipboard history...">
        <List.Section title={`Found ${pgpKeys.length} PGP keys in clipboard history`}>
          {pgpKeys.map(({ entry, key }, index) => (
            <List.Item
              key={index}
              title={key.userId}
              subtitle={key.fingerprint.substring(0, 16) + "..."}
              accessories={[
                { text: new Date(entry.timestamp).toLocaleString() }
              ]}
              actions={
                <ActionPanel>
                  <Action
                    title="Select This Key"
                    onAction={() => {
                      setSelectedKey(key);
                      setStep("enter-message");
                    }}
                  />
                  <Action.CopyToClipboard
                    title="Copy Key Text"
                    content={key.rawText}
                  />
                </ActionPanel>
              }
            />
          ))}
        </List.Section>

        {pgpKeys.length === 0 && !isLoading && (
          <List.EmptyView
            title="No PGP keys found"
            description="Copy a PGP public key to clipboard first, then run this command again."
            icon="🔐"
          />
        )}
      </List>
    );
  }

  // Step 2: Enter message and output path
  if (step === "enter-message" && selectedKey) {
    return (
      <Form
        navigationTitle="Encrypt Message"
        actions={
          <ActionPanel>
            <Action.SubmitForm
              title="Encrypt and Save"
              onSubmit={async (values) => {
                const success = await importKey(selectedKey.rawText);
                if (!success) return;

                const encrypted = await encryptMessage(
                  selectedKey.fingerprint,
                  values.message,
                  values.outputPath
                );

                if (encrypted) {
                  await showToast({
                    style: Toast.Style.Success,
                    title: "Message encrypted",
                    message: `Saved to ${values.outputPath}`,
                  });
                  await closeMainWindow();
                }
              }}
            />
          </ActionPanel>
        }
      >
        <Form.Description title="Selected Key" text={`${selectedKey.userId} (${selectedKey.fingerprint.substring(0, 16)}...)`} />

        <Form.TextArea
          id="message"
          title="Message to Encrypt"
          placeholder="Enter the message you want to encrypt..."
          value={messageText}
          onChange={setMessageText}
        />

        <Form.TextField
          id="outputPath"
          title="Output File"
          placeholder="/path/to/encrypted_message.asc"
          value={outputPath}
          onChange={setOutputPath}
        />
      </Form>
    );
  }

  return null;
}
