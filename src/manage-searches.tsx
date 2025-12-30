import {
  List,
  ActionPanel,
  Action,
  Form,
  useNavigation,
  showToast,
  Toast,
  Icon,
  confirmAlert,
  Alert,
} from "@raycast/api";
import { useEffect, useState } from "react";
import {
  loadConfig,
  saveConfig,
  SearchConfig,
  SearchEngine,
  SearchGroup,
  generateId,
  getEngineById,
} from "./search-engines";

export default function Command() {
  const [config, setConfig] = useState<SearchConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadConfig().then((c) => {
      setConfig(c);
      setIsLoading(false);
    });
  }, []);

  async function updateConfig(newConfig: SearchConfig) {
    setConfig(newConfig);
    await saveConfig(newConfig);
  }

  if (!config) {
    return <List isLoading={isLoading} />;
  }

  return (
    <List isLoading={isLoading}>
      <List.Section title="Search Engines">
        {config.engines.map((engine) => (
          <EngineItem
            key={engine.id}
            engine={engine}
            config={config}
            onUpdate={updateConfig}
          />
        ))}
        <List.Item
          icon={Icon.Plus}
          title="Add Search Engine"
          actions={
            <ActionPanel>
              <Action.Push
                title="Add Engine"
                target={<EngineForm config={config} onSave={updateConfig} />}
              />
            </ActionPanel>
          }
        />
      </List.Section>

      <List.Section title="Search Groups">
        {config.groups.map((group) => (
          <GroupItem
            key={group.id}
            group={group}
            config={config}
            onUpdate={updateConfig}
          />
        ))}
        <List.Item
          icon={Icon.Plus}
          title="Add Search Group"
          actions={
            <ActionPanel>
              <Action.Push
                title="Add Group"
                target={<GroupForm config={config} onSave={updateConfig} />}
              />
            </ActionPanel>
          }
        />
      </List.Section>

      <List.Section title="Direct Search Slots (Quick Search 1-5)">
        {["1", "2", "3", "4", "5"].map((slot) => (
          <SlotItem
            key={`direct-${slot}`}
            slot={slot}
            type="direct"
            config={config}
            onUpdate={updateConfig}
          />
        ))}
      </List.Section>

      <List.Section title="Picker Slots (Search Picker 1-3)">
        {["1", "2", "3"].map((slot) => (
          <SlotItem
            key={`picker-${slot}`}
            slot={slot}
            type="picker"
            config={config}
            onUpdate={updateConfig}
          />
        ))}
      </List.Section>
    </List>
  );
}

function EngineItem({
  engine,
  config,
  onUpdate,
}: {
  engine: SearchEngine;
  config: SearchConfig;
  onUpdate: (config: SearchConfig) => Promise<void>;
}) {
  async function deleteEngine() {
    if (
      await confirmAlert({
        title: "Delete Engine",
        message: `Are you sure you want to delete "${engine.name}"?`,
        primaryAction: {
          title: "Delete",
          style: Alert.ActionStyle.Destructive,
        },
      })
    ) {
      const newConfig = {
        ...config,
        engines: config.engines.filter((e) => e.id !== engine.id),
        groups: config.groups.map((g) => ({
          ...g,
          engineIds: g.engineIds.filter((id) => id !== engine.id),
        })),
        directSlots: Object.fromEntries(
          Object.entries(config.directSlots).map(([k, v]) => [
            k,
            v === engine.id ? "" : v,
          ]),
        ),
      };
      await onUpdate(newConfig);
      await showToast({ title: "Engine deleted" });
    }
  }

  return (
    <List.Item
      icon={engine.icon || "🔍"}
      title={engine.name}
      subtitle={engine.url.replace("%s", "...")}
      actions={
        <ActionPanel>
          <Action.Push
            title="Edit"
            target={
              <EngineForm engine={engine} config={config} onSave={onUpdate} />
            }
          />
          <Action
            title="Delete"
            style={Action.Style.Destructive}
            onAction={deleteEngine}
          />
        </ActionPanel>
      }
    />
  );
}

function GroupItem({
  group,
  config,
  onUpdate,
}: {
  group: SearchGroup;
  config: SearchConfig;
  onUpdate: (config: SearchConfig) => Promise<void>;
}) {
  async function deleteGroup() {
    if (
      await confirmAlert({
        title: "Delete Group",
        message: `Are you sure you want to delete "${group.name}"?`,
        primaryAction: {
          title: "Delete",
          style: Alert.ActionStyle.Destructive,
        },
      })
    ) {
      const newConfig = {
        ...config,
        groups: config.groups.filter((g) => g.id !== group.id),
        pickerSlots: Object.fromEntries(
          Object.entries(config.pickerSlots).map(([k, v]) => [
            k,
            v === group.id ? "" : v,
          ]),
        ),
      };
      await onUpdate(newConfig);
      await showToast({ title: "Group deleted" });
    }
  }

  const engineNames = group.engineIds
    .map((id) => getEngineById(config, id)?.name)
    .filter(Boolean)
    .join(", ");

  return (
    <List.Item
      icon={Icon.List}
      title={group.name}
      subtitle={engineNames || "No engines"}
      accessories={[{ text: `${group.engineIds.length} engines` }]}
      actions={
        <ActionPanel>
          <Action.Push
            title="Edit"
            target={
              <GroupForm group={group} config={config} onSave={onUpdate} />
            }
          />
          <Action
            title="Delete"
            style={Action.Style.Destructive}
            onAction={deleteGroup}
          />
        </ActionPanel>
      }
    />
  );
}

function SlotItem({
  slot,
  type,
  config,
  onUpdate,
}: {
  slot: string;
  type: "direct" | "picker";
  config: SearchConfig;
  onUpdate: (config: SearchConfig) => Promise<void>;
}) {
  const currentId =
    type === "direct" ? config.directSlots[slot] : config.pickerSlots[slot];

  let currentName = "Not configured";
  if (currentId) {
    if (type === "direct") {
      const engine = getEngineById(config, currentId);
      currentName = engine
        ? `${engine.icon || "🔍"} ${engine.name}`
        : "Unknown";
    } else {
      const group = config.groups.find((g) => g.id === currentId);
      currentName = group ? group.name : "Unknown";
    }
  }

  return (
    <List.Item
      icon={type === "direct" ? Icon.Link : Icon.List}
      title={`Slot ${slot}`}
      subtitle={currentName}
      actions={
        <ActionPanel>
          <Action.Push
            title="Configure"
            target={
              <SlotForm
                slot={slot}
                type={type}
                config={config}
                onSave={onUpdate}
              />
            }
          />
        </ActionPanel>
      }
    />
  );
}

function EngineForm({
  engine,
  config,
  onSave,
}: {
  engine?: SearchEngine;
  config: SearchConfig;
  onSave: (config: SearchConfig) => Promise<void>;
}) {
  const { pop } = useNavigation();
  const [name, setName] = useState(engine?.name || "");
  const [url, setUrl] = useState(engine?.url || "");
  const [icon, setIcon] = useState(engine?.icon || "");

  async function handleSubmit() {
    if (!name.trim() || !url.trim()) {
      await showToast({
        title: "Name and URL required",
        style: Toast.Style.Failure,
      });
      return;
    }
    if (!url.includes("%s")) {
      await showToast({
        title: "URL must contain %s placeholder",
        style: Toast.Style.Failure,
      });
      return;
    }

    const newEngine: SearchEngine = {
      id: engine?.id || generateId(),
      name: name.trim(),
      url: url.trim(),
      icon: icon.trim() || undefined,
    };

    const newEngines = engine
      ? config.engines.map((e) => (e.id === engine.id ? newEngine : e))
      : [...config.engines, newEngine];

    await onSave({ ...config, engines: newEngines });
    await showToast({ title: engine ? "Engine updated" : "Engine added" });
    pop();
  }

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Save" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextField
        id="name"
        title="Name"
        placeholder="YouTube"
        value={name}
        onChange={setName}
      />
      <Form.TextField
        id="url"
        title="URL"
        placeholder="https://www.youtube.com/results?search_query=%s"
        info="Use %s as placeholder for search term"
        value={url}
        onChange={setUrl}
      />
      <Form.TextField
        id="icon"
        title="Icon (emoji)"
        placeholder="🎬"
        value={icon}
        onChange={setIcon}
      />
    </Form>
  );
}

function GroupForm({
  group,
  config,
  onSave,
}: {
  group?: SearchGroup;
  config: SearchConfig;
  onSave: (config: SearchConfig) => Promise<void>;
}) {
  const { pop } = useNavigation();
  const [name, setName] = useState(group?.name || "");
  const [selectedEngines, setSelectedEngines] = useState<string[]>(
    group?.engineIds || [],
  );

  async function handleSubmit() {
    if (!name.trim()) {
      await showToast({ title: "Name required", style: Toast.Style.Failure });
      return;
    }

    const newGroup: SearchGroup = {
      id: group?.id || generateId(),
      name: name.trim(),
      engineIds: selectedEngines,
    };

    const newGroups = group
      ? config.groups.map((g) => (g.id === group.id ? newGroup : g))
      : [...config.groups, newGroup];

    await onSave({ ...config, groups: newGroups });
    await showToast({ title: group ? "Group updated" : "Group added" });
    pop();
  }

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Save" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextField
        id="name"
        title="Name"
        placeholder="Video Sites"
        value={name}
        onChange={setName}
      />
      <Form.TagPicker
        id="engines"
        title="Engines"
        value={selectedEngines}
        onChange={setSelectedEngines}
      >
        {config.engines.map((engine) => (
          <Form.TagPicker.Item
            key={engine.id}
            value={engine.id}
            title={engine.name}
            icon={engine.icon}
          />
        ))}
      </Form.TagPicker>
    </Form>
  );
}

function SlotForm({
  slot,
  type,
  config,
  onSave,
}: {
  slot: string;
  type: "direct" | "picker";
  config: SearchConfig;
  onSave: (config: SearchConfig) => Promise<void>;
}) {
  const { pop } = useNavigation();
  const currentId =
    type === "direct" ? config.directSlots[slot] : config.pickerSlots[slot];
  const [selectedId, setSelectedId] = useState(currentId || "");

  async function handleSubmit() {
    const newConfig = { ...config };
    if (type === "direct") {
      newConfig.directSlots = { ...config.directSlots, [slot]: selectedId };
    } else {
      newConfig.pickerSlots = { ...config.pickerSlots, [slot]: selectedId };
    }
    await onSave(newConfig);
    await showToast({ title: "Slot configured" });
    pop();
  }

  const items = type === "direct" ? config.engines : config.groups;

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Save" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.Dropdown
        id="selection"
        title={type === "direct" ? "Search Engine" : "Search Group"}
        value={selectedId}
        onChange={setSelectedId}
      >
        <Form.Dropdown.Item value="" title="(None)" />
        {items.map((item) => (
          <Form.Dropdown.Item
            key={item.id}
            value={item.id}
            title={item.name}
            icon={type === "direct" ? (item as SearchEngine).icon : Icon.List}
          />
        ))}
      </Form.Dropdown>
    </Form>
  );
}
