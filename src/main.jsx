import React, { useMemo, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { Search, Settings2, Package, Hammer, Boxes, Star, AlertTriangle, ChevronRight, TreePine, Save } from "lucide-react";
import "./styles.css";

const TIERS = ["Stone Age", "Steam", "LV", "MV", "HV"];

const MACHINES = [
  "Forge Hammer",
  "Wiremill",
  "Lathe",
  "Compressor",
  "Bending Machine",
  "Assembler",
  "Extractor",
  "Alloy Smelter",
  "Macerator",
];

const tierRank = Object.fromEntries(TIERS.map((tier, index) => [tier, index]));

const items = [
  {
    id: "steel_ingot",
    name: "Steel Ingot",
    category: "Material",
    craftableFromTier: "Steam",
    recommendedFromTier: "Steam",
    automationFromTier: "LV",
    importance: 5,
    summary: "Steam to LV progression depends heavily on steel. Many machines, plates, rods, and EBF parts eventually consume it.",
    commonUses: ["Steam machines", "LV Machine Hull", "EBF preparation", "Plates, rods, screws"],
    stock: "Steam: keep several stacks if possible. LV: start semi-automating plates and rods.",
    warnings: ["Steel demand rises sharply before EBF and MV preparation."],
    tags: ["core", "frequent", "material"],
  },
  {
    id: "rubber",
    name: "Rubber",
    category: "Material",
    craftableFromTier: "Steam",
    recommendedFromTier: "Steam",
    automationFromTier: "LV",
    importance: 5,
    summary: "A basic but constantly consumed material for cables, circuits, and early electric components.",
    commonUses: ["Tin Cable", "Copper Cable", "Circuits", "Electric components"],
    stock: "Steam/LV: keep at least 1~2 stacks. LV onward: automate extraction if possible.",
    warnings: ["Running out of rubber slows almost every early electric crafting chain."],
    tags: ["core", "frequent", "material"],
  },
  {
    id: "copper_wire",
    name: "Copper Wire",
    category: "Wire",
    craftableFromTier: "Steam",
    recommendedFromTier: "LV",
    automationFromTier: "LV",
    importance: 5,
    summary: "A frequent wire component used in motors, circuits, and early machine parts.",
    commonUses: ["LV Electric Motor", "Basic Circuit", "Coils", "Cables"],
    stock: "LV: produce by Wiremill whenever possible.",
    warnings: ["Crafting wires manually is usually much less efficient than Wiremill processing."],
    tags: ["core", "wire", "frequent"],
  },
  {
    id: "tin_wire",
    name: "Tin Wire",
    category: "Wire",
    craftableFromTier: "Steam",
    recommendedFromTier: "LV",
    automationFromTier: "LV",
    importance: 4,
    summary: "Used mainly for early cables and LV component chains.",
    commonUses: ["Tin Cable", "LV power lines", "LV Electric Motor"],
    stock: "LV: make as needed, but keep extra if many machines are planned.",
    warnings: ["Wiremill greatly improves material efficiency."],
    tags: ["wire", "frequent"],
  },
  {
    id: "tin_cable",
    name: "Tin Cable",
    category: "Cable",
    craftableFromTier: "LV",
    recommendedFromTier: "LV",
    automationFromTier: "LV",
    importance: 5,
    summary: "The standard early cable and a common ingredient in LV components.",
    commonUses: ["LV Electric Motor", "LV machines", "LV power routing"],
    stock: "LV: keep 32~64 for machine expansion.",
    warnings: ["Cable demand spikes when building several LV machines at once."],
    tags: ["core", "cable", "frequent"],
  },
  {
    id: "iron_rod",
    name: "Iron Rod",
    category: "Component",
    craftableFromTier: "Steam",
    recommendedFromTier: "Steam",
    automationFromTier: "LV",
    importance: 4,
    summary: "A basic component used by motors, pistons, tools, and many early recipes.",
    commonUses: ["LV Electric Motor", "Pistons", "Tools", "Machine components"],
    stock: "Steam/LV: keep a small buffer. Lathe route is preferred when available.",
    warnings: ["Manual crafting is acceptable early, but repetitive later."],
    tags: ["component", "frequent"],
  },
  {
    id: "magnetic_iron_rod",
    name: "Magnetic Iron Rod",
    category: "Component",
    craftableFromTier: "LV",
    recommendedFromTier: "LV",
    automationFromTier: "LV",
    importance: 4,
    summary: "A required part for LV Electric Motors and related electric components.",
    commonUses: ["LV Electric Motor", "Electric components"],
    stock: "LV: make in batches alongside motor production.",
    warnings: ["Usually appears as a sub-step inside motor crafting."],
    tags: ["component", "frequent"],
  },
  {
    id: "lv_electric_motor",
    name: "LV Electric Motor",
    category: "Component",
    craftableFromTier: "LV",
    recommendedFromTier: "LV",
    automationFromTier: "LV",
    importance: 5,
    summary: "A core LV component used in pumps, conveyors, pistons, and many machines.",
    commonUses: ["LV Electric Pump", "LV Conveyor Module", "LV Electric Piston", "LV machines"],
    stock: "LV early: 4~8. LV late/MV prep: 16+ or semi-automated.",
    warnings: ["Assembler and Wiremill make the chain far less annoying."],
    tags: ["core", "component", "frequent", "calculator"],
  },
  {
    id: "lv_machine_hull",
    name: "LV Machine Hull",
    category: "Machine Part",
    craftableFromTier: "LV",
    recommendedFromTier: "LV",
    automationFromTier: "LV",
    importance: 5,
    summary: "The body of most LV machines. If you are expanding your base, this becomes a repeated bottleneck.",
    commonUses: ["LV machines", "Generators", "Machine upgrades"],
    stock: "LV: prepare several when planning a machine batch.",
    warnings: ["Plate and cable preparation should be done before mass crafting machines."],
    tags: ["core", "machine", "frequent"],
  },
  {
    id: "basic_circuit",
    name: "Basic Circuit",
    category: "Circuit",
    craftableFromTier: "LV",
    recommendedFromTier: "LV",
    automationFromTier: "LV",
    importance: 5,
    summary: "One of the first major circuit bottlenecks. Required by many LV machines and components.",
    commonUses: ["LV machines", "Electronic Circuit", "Machine components"],
    stock: "LV: make in batches of 8~16 if materials allow.",
    warnings: ["Circuit crafting often reveals missing rubber, wires, or plates."],
    tags: ["core", "circuit", "frequent", "calculator"],
  },
  {
    id: "lv_assembler",
    name: "LV Assembler",
    category: "Machine",
    craftableFromTier: "LV",
    recommendedFromTier: "LV",
    automationFromTier: "LV",
    importance: 5,
    summary: "A high-priority LV machine because it simplifies many repeated component crafts.",
    commonUses: ["Motors", "Circuits", "Cables", "Machine components"],
    stock: "LV: one early assembler is strongly recommended.",
    warnings: ["Many recipes become more convenient once this is available."],
    tags: ["core", "machine", "recommended"],
  },
  {
    id: "cupronickel_coil",
    name: "Cupronickel Coil",
    category: "EBF Part",
    craftableFromTier: "LV",
    recommendedFromTier: "LV",
    automationFromTier: "MV",
    importance: 4,
    summary: "An early coil material for preparing the Electric Blast Furnace path.",
    commonUses: ["Electric Blast Furnace", "Heating coils"],
    stock: "LV: prepare when planning EBF construction.",
    warnings: ["Do not overproduce before checking your exact EBF plan."],
    tags: ["ebf", "progression"],
  },
];

const recipes = [
  {
    id: "iron_rod_lathe",
    output: { itemId: "iron_rod", amount: 2 },
    inputs: [{ itemId: "iron_ingot", amount: 1 }],
    machine: "Lathe",
    tier: "LV",
    tags: ["easy", "recommended"],
  },
  {
    id: "copper_wire_wiremill",
    output: { itemId: "copper_wire", amount: 2 },
    inputs: [{ itemId: "copper_ingot", amount: 1 }],
    machine: "Wiremill",
    tier: "LV",
    tags: ["easy", "recommended"],
  },
  {
    id: "tin_wire_wiremill",
    output: { itemId: "tin_wire", amount: 2 },
    inputs: [{ itemId: "tin_ingot", amount: 1 }],
    machine: "Wiremill",
    tier: "LV",
    tags: ["easy", "recommended"],
  },
  {
    id: "tin_cable_basic",
    output: { itemId: "tin_cable", amount: 1 },
    inputs: [
      { itemId: "tin_wire", amount: 1 },
      { itemId: "rubber", amount: 1 },
    ],
    machine: "Assembler",
    tier: "LV",
    tags: ["easy", "recommended"],
  },
  {
    id: "magnetic_iron_rod_basic",
    output: { itemId: "magnetic_iron_rod", amount: 1 },
    inputs: [{ itemId: "iron_rod", amount: 1 }],
    machine: "Manual / Polarizer placeholder",
    tier: "LV",
    tags: ["placeholder"],
  },
  {
    id: "lv_electric_motor_basic",
    output: { itemId: "lv_electric_motor", amount: 1 },
    inputs: [
      { itemId: "magnetic_iron_rod", amount: 1 },
      { itemId: "copper_wire", amount: 2 },
      { itemId: "tin_cable", amount: 2 },
      { itemId: "iron_rod", amount: 2 },
    ],
    machine: "Assembler",
    tier: "LV",
    tags: ["easy", "recommended"],
  },
  {
    id: "basic_circuit_placeholder",
    output: { itemId: "basic_circuit", amount: 1 },
    inputs: [
      { itemId: "copper_wire", amount: 4 },
      { itemId: "rubber", amount: 2 },
      { itemId: "steel_ingot", amount: 1 },
    ],
    machine: "Assembler",
    tier: "LV",
    tags: ["placeholder"],
  },
];

const rawItems = {
  iron_ingot: "Iron Ingot",
  copper_ingot: "Copper Ingot",
  tin_ingot: "Tin Ingot",
};

function getItemName(id) {
  return items.find((item) => item.id === id)?.name || rawItems[id] || id.replaceAll("_", " ");
}

function canUseTier(recipeTier, userTier) {
  return tierRank[recipeTier] <= tierRank[userTier];
}

function recipeScore(recipe, userMachines) {
  let score = 0;
  if (recipe.tags?.includes("recommended")) score -= 10;
  if (recipe.tags?.includes("placeholder")) score += 6;
  if (!userMachines.includes(recipe.machine) && !recipe.machine.includes("Manual")) score += 30;
  return score;
}

function pickRecipe(itemId, userTier, userMachines) {
  const candidates = recipes.filter((recipe) => recipe.output.itemId === itemId && canUseTier(recipe.tier, userTier));
  if (!candidates.length) return null;
  return [...candidates].sort((a, b) => recipeScore(a, userMachines) - recipeScore(b, userMachines))[0];
}

function ceilDiv(a, b) {
  return Math.ceil(a / b);
}

function buildTree(itemId, amount, userTier, userMachines, depth = 0, seen = new Set()) {
  const recipe = pickRecipe(itemId, userTier, userMachines);
  if (!recipe || seen.has(itemId) || depth > 8) {
    return { itemId, amount, recipe: null, children: [] };
  }

  const batches = ceilDiv(amount, recipe.output.amount);
  const nextSeen = new Set(seen);
  nextSeen.add(itemId);

  return {
    itemId,
    amount,
    recipe,
    children: recipe.inputs.map((input) => buildTree(input.itemId, input.amount * batches, userTier, userMachines, depth + 1, nextSeen)),
  };
}

function flattenRawMaterials(node, result = {}) {
  if (!node.recipe || node.children.length === 0) {
    result[node.itemId] = (result[node.itemId] || 0) + node.amount;
    return result;
  }
  node.children.forEach((child) => flattenRawMaterials(child, result));
  return result;
}

function collectMachines(node, result = new Set()) {
  if (node.recipe?.machine) result.add(node.recipe.machine);
  node.children?.forEach((child) => collectMachines(child, result));
  return result;
}

function TreeNode({ node, level = 0 }) {
  return (
    <div className="tree-node">
      <div className="tree-row" style={{ paddingLeft: `${level * 18}px` }}>
        <span className="tree-prefix">{level === 0 ? "•" : "└"}</span>
        <div>
          <div className="tree-title">
            {getItemName(node.itemId)} <span>x{node.amount}</span>
          </div>
          {node.recipe && (
            <div className="tree-subtitle">
              via {node.recipe.machine} · {node.recipe.tier}
              {node.recipe.tags?.includes("placeholder") ? " · placeholder recipe" : ""}
            </div>
          )}
        </div>
      </div>
      {node.children.map((child, index) => (
        <TreeNode key={`${child.itemId}-${index}-${level}`} node={child} level={level + 1} />
      ))}
    </div>
  );
}

function Stars({ value }) {
  return (
    <div className="stars">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star key={index} className={index < value ? "star-on" : "star-off"} />
      ))}
    </div>
  );
}

function Badge({ children }) {
  return <span className="badge">{children}</span>;
}

function App() {
  const [query, setQuery] = useState("");
  const [tier, setTier] = useState("LV");
  const [selectedMachines, setSelectedMachines] = useState(["Wiremill", "Lathe", "Assembler"]);
  const [category, setCategory] = useState("All");
  const [selectedItemId, setSelectedItemId] = useState("lv_electric_motor");
  const [amount, setAmount] = useState(16);

  useEffect(() => {
    const saved = localStorage.getItem("gtnh-navigator-settings");
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved);
      if (parsed.tier) setTier(parsed.tier);
      if (Array.isArray(parsed.selectedMachines)) setSelectedMachines(parsed.selectedMachines);
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem("gtnh-navigator-settings", JSON.stringify({ tier, selectedMachines }));
  }, [tier, selectedMachines]);

  const categories = useMemo(() => ["All", ...Array.from(new Set(items.map((item) => item.category)))], []);

  const filteredItems = useMemo(() => {
    return items
      .filter((item) => category === "All" || item.category === category)
      .filter((item) => item.name.toLowerCase().includes(query.toLowerCase()) || item.tags.join(" ").toLowerCase().includes(query.toLowerCase()))
      .filter((item) => tierRank[item.craftableFromTier] <= tierRank[tier] + 1)
      .sort((a, b) => b.importance - a.importance || tierRank[a.craftableFromTier] - tierRank[b.craftableFromTier]);
  }, [query, category, tier]);

  const selectedItem = items.find((item) => item.id === selectedItemId) || items[0];
  const tree = useMemo(() => buildTree(selectedItem.id, Number(amount) || 1, tier, selectedMachines), [selectedItem.id, amount, tier, selectedMachines]);
  const rawMaterials = useMemo(() => flattenRawMaterials(tree), [tree]);
  const requiredMachines = useMemo(() => Array.from(collectMachines(tree)), [tree]);

  const toggleMachine = (machine) => {
    setSelectedMachines((prev) => (prev.includes(machine) ? prev.filter((m) => m !== machine) : [...prev, machine]));
  };

  const canCraftSelected = tierRank[selectedItem.craftableFromTier] <= tierRank[tier];

  return (
    <div className="app">
      <div className="container">
        <header className="hero">
          <div className="hero-inner">
            <div>
              <div className="eyebrow"><Package size={20} /> GTNH Item Navigator v0.1</div>
              <h1>Item guide + tier-aware recipe tree</h1>
              <p>A first playable prototype for Steam~HV progression. The recipe data is intentionally small and editable, so it can later be replaced with exported GTNH recipe JSON.</p>
            </div>
            <div className="state-card">
              <div className="section-title"><Settings2 size={16} /> Current state</div>
              <select value={tier} onChange={(e) => setTier(e.target.value)}>
                {TIERS.map((tierName) => <option key={tierName}>{tierName}</option>)}
              </select>
            </div>
          </div>
        </header>

        <div className="layout">
          <aside className="sidebar">
            <section className="panel">
              <div className="section-title"><Search size={16} /> Search items</div>
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="motor, cable, circuit..." />
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                {categories.map((name) => <option key={name}>{name}</option>)}
              </select>
            </section>

            <section className="panel">
              <div className="section-title"><Hammer size={16} /> Owned machines</div>
              <div className="machine-list">
                {MACHINES.map((machine) => (
                  <button key={machine} onClick={() => toggleMachine(machine)} className={selectedMachines.includes(machine) ? "machine selected" : "machine"}>
                    {selectedMachines.includes(machine) ? "✓" : "○"} {machine}
                  </button>
                ))}
              </div>
            </section>

            <section className="panel">
              <div className="section-title row-between"><span><Boxes size={16} /> Items</span><small>{filteredItems.length}</small></div>
              <div className="item-list">
                {filteredItems.map((item) => (
                  <button key={item.id} onClick={() => setSelectedItemId(item.id)} className={selectedItemId === item.id ? "item selected" : "item"}>
                    <div className="item-top">
                      <div>
                        <strong>{item.name}</strong>
                        <small>{item.category} · from {item.craftableFromTier}</small>
                      </div>
                      <ChevronRight size={16} />
                    </div>
                    <Stars value={item.importance} />
                  </button>
                ))}
              </div>
            </section>
          </aside>

          <main className="main">
            <section className="panel detail-panel">
              <div className="detail-head">
                <div>
                  <div className="badges">
                    <Badge>{selectedItem.category}</Badge>
                    <Badge>Craftable: {selectedItem.craftableFromTier}</Badge>
                    <Badge>Recommended: {selectedItem.recommendedFromTier}</Badge>
                    <Badge>Automate: {selectedItem.automationFromTier}</Badge>
                  </div>
                  <h2>{selectedItem.name}</h2>
                  <p>{selectedItem.summary}</p>
                </div>
                <div className="importance-card">
                  <small>Importance</small>
                  <Stars value={selectedItem.importance} />
                </div>
              </div>

              {!canCraftSelected && (
                <div className="warning">
                  <AlertTriangle size={20} />
                  <div>Your selected tier is <b>{tier}</b>, but this item is normally craftable from <b>{selectedItem.craftableFromTier}</b>. The calculator may stop at this item or show missing routes.</div>
                </div>
              )}

              <div className="info-grid">
                <div className="subpanel">
                  <h3>Common uses</h3>
                  <ul>{selectedItem.commonUses.map((use) => <li key={use}>{use}</li>)}</ul>
                </div>
                <div className="subpanel">
                  <h3>Stock / warning notes</h3>
                  <p>{selectedItem.stock}</p>
                  <ul>{selectedItem.warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul>
                </div>
              </div>
            </section>

            <section className="calc-layout">
              <div className="panel">
                <div className="calc-head">
                  <div>
                    <div className="section-title"><TreePine size={16} /> Recipe tree calculator</div>
                    <p>Uses the current tier and selected machine list to pick a simple available route.</p>
                  </div>
                  <label>Target amount <input type="number" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} /></label>
                </div>
                <div className="subpanel"><TreeNode node={tree} /></div>
              </div>

              <div className="side-results">
                <div className="panel">
                  <h3>Total base materials</h3>
                  <div className="result-list">
                    {Object.entries(rawMaterials).map(([id, count]) => (
                      <div key={id} className="result-row"><span>{getItemName(id)}</span><strong>x{count}</strong></div>
                    ))}
                  </div>
                </div>

                <div className="panel">
                  <h3>Required machines</h3>
                  <div className="result-list">
                    {requiredMachines.map((machine) => {
                      const owned = selectedMachines.includes(machine) || machine.includes("Manual");
                      return <div key={machine} className={owned ? "machine-needed owned" : "machine-needed missing"}>{owned ? "✓" : "!"} {machine}</div>;
                    })}
                  </div>
                </div>

                <div className="panel note">
                  <div className="section-title"><Save size={16} /> Prototype notes</div>
                  <p>Current tier and machine choices are saved in LocalStorage. Some recipes are placeholders, so replace them with verified GTNH recipes before treating numbers as authoritative.</p>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
