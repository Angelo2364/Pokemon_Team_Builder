import { useState, useEffect, useRef } from "react";
import { TYPE_CHART, TYPE_ABBR, TYPE_COLORS, DARK_TEXT_TYPES, GAME_GROUPS, GAME_VERSION_GROUPS } from "../data/generations";
import { filterForms } from "../data/formLimits";

// ── Shared util ──────────────────────────────────────────────────────────────
function formatName(name) {
  return name.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}
export function computeWeaknesses(types) {
  const ALL_ATK = [
    "normal", "fire", "water", "electric", "grass", "ice", "fighting", "poison",
    "ground", "flying", "psychic", "bug", "rock", "ghost", "dragon", "dark", "steel", "fairy",
  ];
  const result = {};
  ALL_ATK.forEach((atk) => {
    let mult = 1;
    types.forEach((def) => {
      const c = TYPE_CHART[def]; if (!c) return;
      if (c.immuneTo.includes(atk)) mult *= 0;
      else if (c.weakTo.includes(atk)) mult *= 2;
      else if (c.resistantTo.includes(atk)) mult *= 0.5;
    });
    if (mult !== 1) result[atk] = mult;
  });
  return result;
}

// ── TypePill ─────────────────────────────────────────────────────────────────
export function TypePill({ type, size = "sm" }) {
  const bg = TYPE_COLORS[type] || "#888";
  const color = DARK_TEXT_TYPES.has(type) ? "#333" : "#fff";
  const abbr = TYPE_ABBR[type] || type.slice(0, 3).toUpperCase();
  if (size === "xs") return (
    <span style={{
      background: bg, color, fontSize: 9, fontWeight: "bold",
      padding: "1px 4px", borderRadius: 4, letterSpacing: 0.5,
      display: "inline-block", lineHeight: "14px", flexShrink: 0
    }}>
      {abbr}
    </span>
  );
  return <span className={`type-badge ${type}`}>{type}</span>;
}

// ── Modificadores de fraqueza por habilidade ─────────────────────────────────
const ABILITY_IMMUNITY = {
  "flash-fire":       { fire: 0 },
  "well-baked-body":  { fire: 0 },
  "water-absorb":     { water: 0 },
  "storm-drain":      { water: 0 },
  "dry-skin":         { water: 0, fire: 1.25 },
  "volt-absorb":      { electric: 0 },
  "motor-drive":      { electric: 0 },
  "lightning-rod":    { electric: 0 },
  "levitate":         { ground: 0 },
  "sap-sipper":       { grass: 0 },
  "earth-eater":      { ground: 0 },
  "thick-fat":        { fire: 0.5, ice: 0.5 },
  "heatproof":        { fire: 0.5 },
  "water-bubble":     { fire: 0.5 },
  "purifying-salt":   { ghost: 0.5 },
  "fluffy":           { fire: 2 },
};

// ── WeaknessPanel ────────────────────────────────────────────────────────────
export function WeaknessPanel({ types, ability }) {
  const base = computeWeaknesses(types);

  // Aplica modificadores da habilidade por cima das fraquezas de tipo
  const mult = { ...base };
  const abilityMods = ability ? (ABILITY_IMMUNITY[ability] || {}) : {};
  Object.entries(abilityMods).forEach(([type, mod]) => {
    if (mod === 0) {
      mult[type] = 0;
    } else {
      mult[type] = (mult[type] ?? 1) * mod;
    }
  });

  const abilityActive = Object.keys(abilityMods).length > 0;

  const sections = [
    { label: "×4 Fraco",   filter: v => v >= 4,              color: "#c0392b" },
    { label: "×2 Fraco",  filter: v => v >= 2 && v < 4,    color: "#e74c3c" },
    { label: "×1 Fraco",  filter: v => v > 1 && v < 2,     color: "#e67e22" },
    { label: "½ Resiste",  filter: v => v > 0 && v <= 0.5,  color: "#27ae60" },
    { label: "Imune",      filter: v => v === 0,             color: "#2980b9" },
  ];
  const hasAny = sections.some(({ filter }) => Object.values(mult).some(filter));
  return (
    <div className="weakness-panel">
      {abilityActive && (
        <p style={{ fontSize: 10, color: "#8e44ad", margin: "0 0 8px", fontWeight: "bold" }}>
          ✦ {formatName(ability)} aplicada
        </p>
      )}
      {!hasAny && <p style={{ fontSize: 12, color: "#888" }}>Sem fraquezas relevantes.</p>}
      {sections.map(({ label, filter, color }) => {
        const entries = Object.entries(mult).filter(([, v]) => filter(v));
        if (!entries.length) return null;
        return (
          <div key={label} style={{ marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: "bold", color }}>{label}</span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 4 }}>
              {entries.map(([t, v]) => (
                <span key={t} className={`type-badge ${t}`} title={`×${v}`}>
                  {t}{![0, 0.25, 0.5, 1, 2, 4].includes(v) ? ` ×${+v.toFixed(2)}` : ""}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── STAB coverage: which types the pokemon hits super-effectively with STAB ──
export function getSTABCoverage(types) {
  const ALL_DEF = [
    "normal", "fire", "water", "electric", "grass", "ice", "fighting", "poison",
    "ground", "flying", "psychic", "bug", "rock", "ghost", "dragon", "dark", "steel", "fairy",
  ];
  // For each defending type, check if any of our STAB types hits it super-effectively
  const superEffective = [];
  const neutral = [];
  const notVery = [];
  const immune = [];

  ALL_DEF.forEach(def => {
    const c = TYPE_CHART[def];
    if (!c) return;
    // Best multiplier among our STAB types against this defending type
    let best = 0;
    types.forEach(atk => {
      let mult = 1;
      if (c.immuneTo.includes(atk)) mult = 0;
      else if (c.weakTo.includes(atk)) mult = 2;
      else if (c.resistantTo.includes(atk)) mult = 0.5;
      if (mult > best) best = mult;
    });
    if (best === 0) immune.push(def);
    else if (best === 2) superEffective.push(def);
    else if (best === 0.5) notVery.push(def);
    else neutral.push(def);
  });

  return { superEffective, neutral, notVery, immune };
}

export function STABPanel({ types }) {
  const { superEffective, neutral, notVery, immune } = getSTABCoverage(types);
  return (
    <div style={{ paddingTop: 6 }}>
      <p style={{ fontSize: 11, color: "#888", margin: "0 0 10px" }}>
      </p>
      {[
        { label: "×2 Super efetivo", list: superEffective, color: "#c0392b" },
        { label: "½ Pouco efetivo", list: notVery, color: "#27ae60" },
        { label: "✕ Imune", list: immune, color: "#2980b9" },
      ].map(({ label, list, color }) => list.length === 0 ? null : (
        <div key={label} style={{ marginBottom: 8 }}>
          <span style={{ fontSize: 11, fontWeight: "bold", color }}>{label}</span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 4 }}>
            {list.map(t => <span key={t} className={`type-badge ${t}`}>{t}</span>)}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Learn method badge ────────────────────────────────────────────────────────
function LearnBadge({ method, level }) {
  if (method === "level-up") {
    return (
      <span style={{
        background: "#2c3e50", color: "#fff", fontSize: 9, fontWeight: "bold",
        padding: "1px 5px", borderRadius: 4, flexShrink: 0, letterSpacing: 0.3,
        fontVariantNumeric: "tabular-nums",
      }}>
        {level > 0 ? `Lv${level}` : "Lv—"}
      </span>
    );
  }
  if (method === "machine") {
    return (
      <span style={{
        background: "#8e44ad", color: "#fff", fontSize: 9, fontWeight: "bold",
        padding: "1px 5px", borderRadius: 4, flexShrink: 0, letterSpacing: 0.3,
      }}>
        TM
      </span>
    );
  }
  if (method === "egg") {
    return (
      <span style={{
        background: "#e67e22", color: "#fff", fontSize: 9, fontWeight: "bold",
        padding: "1px 5px", borderRadius: 4, flexShrink: 0, letterSpacing: 0.3,
      }}>
        EGG
      </span>
    );
  }
  if (method === "tutor") {
    return (
      <span style={{
        background: "#16a085", color: "#fff", fontSize: 9, fontWeight: "bold",
        padding: "1px 5px", borderRadius: 4, flexShrink: 0, letterSpacing: 0.3,
      }}>
        TUT
      </span>
    );
  }
  return null;
}

// ── Cache global de detalhes de golpes — persiste entre renders e rerenders ──
const MOVE_CACHE = {};
const MOVE_FETCHING = new Set(); // evita requisições duplicadas em voo

// ── Tipos pré-Gen 6 (espelhado de App.jsx) ───────────────────────────────────
const PRE_FAIRY_TYPES = {
  "cleffa":      ["normal"],
  "clefairy":    ["normal"],
  "clefable":    ["normal"],
  "igglybuff":   ["normal"],
  "jigglypuff":  ["normal"],
  "wigglytuff":  ["normal"],
  "mime-jr":     ["psychic"],
  "mr-mime":     ["psychic"],
  "togepi":      ["normal"],
  "togetic":     ["normal", "flying"],
  "togekiss":    ["normal", "flying"],
  "azurill":     ["normal"],
  "marill":      ["water"],
  "azumarill":   ["water"],
  "snubbull":    ["normal"],
  "granbull":    ["normal"],
  "ralts":       ["psychic"],
  "kirlia":      ["psychic"],
  "gardevoir":   ["psychic"],
  "mawile":      ["steel"],
  "cottonee":    ["grass"],
  "whimsicott":  ["grass"],
};
function applyPreFairyTypes(pokemonName, types, activeGroup) {
  if (!activeGroup || !activeGroup.genIds.every(id => id <= 5)) return types;
  return PRE_FAIRY_TYPES[pokemonName.toLowerCase()] ?? types;
}

// ── MovesPanel ───────────────────────────────────────────────────────────────
const DAMAGE_CLASS_ICON = { physical: "✴", special: "𖦹", status: "☯︎" };

function MovesPanel({ pokemon, index, team, setTeam, filterGame }) {
  const [moveSearch, setMoveSearch] = useState("");
  const [, forceUpdate] = useState(0); // usado pra re-render após cache popular
  const [expandedMove, setExpandedMove] = useState(null);
  const [selectedVersion, setSelectedVersion] = useState(filterGame || "all");
  const [userOverrode, setUserOverrode] = useState(false);
  const [filterDmgClass, setFilterDmgClass] = useState("all");
  const [sortPower, setSortPower] = useState(0); // 0=padrão, 1=desc, 2=asc

  useEffect(() => {
    if (!userOverrode) setSelectedVersion(filterGame || "all");
  }, [filterGame]);

  // Força fetch na montagem do componente
  useEffect(() => { forceUpdate(n => n + 1); }, []);

  const selectedMoves = pokemon.selectedMoves || [];

  // ── Build the move list filtered by version and sorted by method/level ────
  const versionGroups = selectedVersion !== "all"
    ? (GAME_VERSION_GROUPS[selectedVersion] || [])
    : null; // null = show all versions

  // Process pokemon.moves into a flat list of { name, method, level }
  // one entry per move (best/most relevant entry for the selected version)
  const processedMoves = (() => {
    const moveMap = {}; // moveName -> { method, level }

    pokemon.moves.forEach(m => {
      const name = m.move.name;
      // Filter version_group_details to only the selected version groups
      const details = versionGroups
        ? m.version_group_details.filter(d => versionGroups.includes(d.version_group.name))
        : m.version_group_details;

      if (!details.length) return; // move not available in this version

      // Pick the "best" detail: prefer level-up, then machine, then egg, then tutor
      const methodPriority = { "level-up": 0, machine: 1, egg: 2, tutor: 3 };
      const best = [...details].sort((a, b) => {
        const pa = methodPriority[a.move_learn_method.name] ?? 99;
        const pb = methodPriority[b.move_learn_method.name] ?? 99;
        if (pa !== pb) return pa - pb;
        return a.level_learned_at - b.level_learned_at;
      })[0];

      moveMap[name] = {
        method: best.move_learn_method.name,
        level: best.level_learned_at,
      };
    });

    // Sort: level-up first (by level asc), then machine, then egg, then tutor, then rest
    const methodOrder = { "level-up": 0, machine: 1, egg: 2, tutor: 3 };
    return Object.entries(moveMap)
      .sort(([nameA, a], [nameB, b]) => {
        const pa = methodOrder[a.method] ?? 4;
        const pb = methodOrder[b.method] ?? 4;
        if (pa !== pb) return pa - pb;
        if (a.method === "level-up" && b.method === "level-up") return a.level - b.level;
        return nameA.localeCompare(nameB);
      })
      .map(([name, info]) => ({ name, ...info }));
  })();

  // Filter by search query + damage class
  let filtered = processedMoves.filter(m =>
    m.name.toLowerCase().includes(moveSearch.toLowerCase())
  );
  if (filterDmgClass !== "all") {
    filtered = filtered.filter(m => MOVE_CACHE[m.name]?.damageClass === filterDmgClass);
  }
  if (sortPower === 1) {
    filtered = [...filtered].sort((a, b) =>
      (MOVE_CACHE[b.name]?.power ?? -1) - (MOVE_CACHE[a.name]?.power ?? -1)
    );
  } else if (sortPower === 2) {
    filtered = [...filtered].sort((a, b) =>
      (MOVE_CACHE[a.name]?.power ?? 9999) - (MOVE_CACHE[b.name]?.power ?? 9999)
    );
  }

  // Fetch detalhes dos golpes visíveis — cache global evita refetch
  useEffect(() => {
    const toFetch = filtered.slice(0, 80).filter(m => !MOVE_CACHE[m.name] && !MOVE_FETCHING.has(m.name));
    if (!toFetch.length) return;

    toFetch.forEach(m => MOVE_FETCHING.add(m.name));

    Promise.all(toFetch.map(async ({ name }) => {
      try {
        const r = await fetch(`https://pokeapi.co/api/v2/move/${name}/`);
        const d = await r.json();
        const descEntry = d.flavor_text_entries?.find(e => e.language.name === "en");
        MOVE_CACHE[name] = {
          type: d.type?.name || "normal",
          damageClass: d.damage_class?.name || "status",
          power: d.power ?? null,
          accuracy: d.accuracy ?? null,
          desc: descEntry?.flavor_text?.replace(/\f/g, " ") || "",
        };
      } catch {
        MOVE_CACHE[name] = { type: "normal", damageClass: "status", power: null, accuracy: null, desc: "" };
      } finally {
        MOVE_FETCHING.delete(name);
      }
    })).then(() => forceUpdate(n => n + 1));
  }, [moveSearch, selectedVersion, pokemon.id, filterDmgClass, sortPower]);

  function toggleMove(name) {
    const cur = [...selectedMoves];
    const i = cur.indexOf(name);
    if (i !== -1) cur.splice(i, 1);
    else { if (cur.length >= 4) return; cur.push(name); }
    const t = [...team]; t[index] = { ...pokemon, selectedMoves: cur }; setTeam(t);
  }

  return (
    <div className="moves-panel">
      {/* Selected move slots */}
      <div className="selected-moves">
        {[0, 1, 2, 3].map(i => {
          const mv = selectedMoves[i];
          const det = mv ? MOVE_CACHE[mv] : null;
          const bg = det ? (TYPE_COLORS[det.type] || "#333") : null;
          const tc = det && DARK_TEXT_TYPES.has(det.type) ? "#333" : "#fff";
          return (
            <div key={i} className={`move-slot ${mv ? "filled" : "empty"}`}
              style={bg ? { background: bg, color: tc, border: "none" } : {}}
              onClick={() => mv && toggleMove(mv)}>
              {mv ? (
                <span style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: "center" }}>
                  {det && <TypePill type={det.type} size="xs" />}
                  {mv.replace(/-/g, " ")}
                </span>
              ) : `— Move ${i + 1}`}
            </div>
          );
        })}
      </div>

      {/* Version selector */}
      <select
        value={selectedVersion}
        onChange={e => { setSelectedVersion(e.target.value); setUserOverrode(true); }}
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%", boxSizing: "border-box",
          padding: "5px 8px", border: "1px solid #ccc", borderRadius: 8,
          fontSize: 11, marginBottom: 6, background: "#fafafa", color: "#333",
        }}>
        <option value="all">Todos os jogos</option>
        {GAME_GROUPS.map(g => (
          <option key={g.id} value={g.id}>{g.name}</option>
        ))}
      </select>

      {/* Filtros de damage class + ordenação por power */}
      <div style={{ display: "flex", gap: 4, marginBottom: 6, alignItems: "center" }}>
        {/* Dropdown de categoria */}
        <select
          value={filterDmgClass}
          onChange={e => { e.stopPropagation(); setFilterDmgClass(e.target.value); }}
          onClick={e => e.stopPropagation()}
          style={{
            flex: 1, padding: "4px 6px", fontSize: 10, fontWeight: "bold",
            border: "1px solid #ccc", borderRadius: 6, background: filterDmgClass !== "all" ? "#333" : "#f0f0f0",
            color: filterDmgClass !== "all" ? "#fff" : "#555", cursor: "pointer",
          }}>
          <option value="all">Todos</option>
          <option value="physical">✴ Físico</option>
          <option value="special">𖦹 Especial</option>
          <option value="status">☯ Status</option>
        </select>

        {/* Botão de ciclo de ordenação por power */}
        <button
          onClick={e => { e.stopPropagation(); setSortPower(p => (p + 1) % 3); }}
          title={["Ordenar por power", "Power: maior primeiro", "Power: menor primeiro"][sortPower]}
          style={{
            padding: "4px 9px", fontSize: 10, fontWeight: "bold", cursor: "pointer",
            border: "1px solid #ccc", borderRadius: 6,
            background: sortPower > 0 ? "#333" : "#f0f0f0",
            color: sortPower > 0 ? "#fff" : "#555",
            flexShrink: 0, transition: "all 0.12s",
          }}>
          {sortPower === 0 ? "Pwr ↕" : sortPower === 1 ? "Pwr ↓" : "Pwr ↑"}
        </button>
      </div>

      {/* Search */}
      <input className="move-search" type="text" placeholder="Buscar golpe..."
        value={moveSearch} onChange={e => setMoveSearch(e.target.value)}
        onClick={e => e.stopPropagation()} />

      {/* Move list */}
      <div className="move-list">
        {filtered.length === 0 && (
          <p style={{ fontSize: 11, color: "#aaa", textAlign: "center", margin: "8px 0" }}>
            Nenhum golpe disponível nesta versão.
          </p>
        )}
        {filtered.slice(0, 80).map(m => {
          const active = selectedMoves.includes(m.name);
          const det = MOVE_CACHE[m.name];
          const mt = det?.type;
          const bg = mt ? (TYPE_COLORS[mt] || "#eee") : "#f5f5f5";
          const isExpanded = expandedMove === m.name;
          return (
            <div key={m.name}
              className={`move-option ${active ? "active" : ""} ${!active && selectedMoves.length >= 4 ? "disabled" : ""}`}
              style={mt ? {
                background: active ? "#222" : bg + "33",
                borderLeft: `5px solid ${bg}`,
                color: active ? "#fff" : "#222",
              } : {}}
              onClick={e => { e.stopPropagation(); toggleMove(m.name); }}>
              {/* Linha principal */}
              <span style={{ display: "flex", alignItems: "center", gap: 6, width: "100%" }}>
                {mt && <TypePill type={mt} size="xs" />}
                {det && (
                  <span style={{ fontSize: 13, flexShrink: 0 }} title={det.damageClass}>
                    {DAMAGE_CLASS_ICON[det.damageClass] || "◎"}
                  </span>
                )}
                <span style={{ textTransform: "capitalize", flex: 1, fontSize: 12 }}>
                  {m.name.replace(/-/g, " ")}
                </span>
                <span style={{ fontSize: 11, color: active ? "#aaa" : "#646464", flexShrink: 0, marginRight: 2 }}>
                  {det ? (det.power ? `Pwr:${det.power}` : "Pwr:—") : ""}
                </span>
                <span style={{ fontSize: 11, color: active ? "#aaa" : "#646464", flexShrink: 0, marginRight: 2 }}>
                  {det ? (det.accuracy ? `Acc:${det.accuracy}` : "Acc:—") : ""}
                </span>
                <LearnBadge method={m.method} level={m.level} />
                {det?.desc && (
                  <button
                    style={{
                      marginLeft: 3, padding: "1px 5px", fontSize: 8, fontWeight: "bold",
                      border: "1px solid currentColor", borderRadius: 4, background: "transparent",
                      cursor: "pointer", color: "inherit", opacity: 0.7, flexShrink: 0, lineHeight: 1.4,
                    }}
                    onClick={e => { e.stopPropagation(); setExpandedMove(isExpanded ? null : m.name); }}>
                    {isExpanded ? "▲" : "▼"}
                  </button>
                )}
              </span>
              {/* Descrição expandida */}
              {isExpanded && det?.desc && (
                <p style={{
                  margin: "5px 0 2px", fontSize: 13, lineHeight: 1.5,
                  color: active ? "#ddd" : "#555",
                  borderTop: `1px solid ${active ? "#444" : "#ddd"}`,
                  paddingTop: 4,
                }}>
                  {det.desc}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── AbilityDesc — seção de descrição de habilidade ──────────────────────────
function AbilityDesc({ abilityName }) {
  const [desc, setDesc] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!abilityName) return;
    let cancelled = false;
    setDesc(null);
    setLoading(true);
    fetch(`https://pokeapi.co/api/v2/ability/${abilityName}/`)
      .then(r => r.json())
      .then(d => {
        if (cancelled) return;
        const entry = d.flavor_text_entries?.find(e => e.language.name === "en");
        const effect = d.effect_entries?.find(e => e.language.name === "en");
        setDesc(effect?.short_effect || entry?.flavor_text?.replace(/\f/g, " ") || "Sem descrição disponível.");
        setLoading(false);
      })
      .catch(() => { if (!cancelled) { setDesc("Erro ao carregar."); setLoading(false); } });
    return () => { cancelled = true; };
  }, [abilityName]);

  return (
    <div style={{
      marginTop: 12, padding: "10px 12px", borderRadius: 10,
      background: "#f7f7f7", border: "1px solid #e8e8e8",
    }}>
      <span style={{ fontSize: 12, fontWeight: "bold", color: "#555", display: "block", marginBottom: 4 }}>
        Habilidade — {formatName(abilityName)}
      </span>
      {loading
        ? <span style={{ fontSize: 11, color: "#aaa" }}>Carregando...</span>
        : <span style={{ fontSize: 12, color: "#333", lineHeight: 1.5 }}>{desc}</span>
      }
    </div>
  );
}
function TeamSlot({
  pokemon,
  index,
  team,
  setTeam,
  detailsPokemon,
  setDetailsPokemon,
  removePokemon,
  filterGame,
  activeGroup,
  panelLeft,
}) {
  const [activeTab, setActiveTab] = useState("stats");
  const [forms, setForms] = useState(null);
  const [animate, setAnimate] = useState(false);

  const panelRef = useRef(null);
  const isOpen = detailsPokemon === index;

  const prevWasEmpty = useRef(true); // começa true: slot começa vazio

  useEffect(() => {
    const nowHasPokemon = !!pokemon?.id;
    const wasEmpty = prevWasEmpty.current;

    // Anima só quando o slot estava vazio e agora tem um Pokémon
    // Troca de forma: slot nunca fica vazio, então wasEmpty === false → não anima
    if (wasEmpty && nowHasPokemon) {
      setAnimate(true);
      const timer = setTimeout(() => setAnimate(false), 500);
      prevWasEmpty.current = false;
      return () => clearTimeout(timer);
    }

    prevWasEmpty.current = !nowHasPokemon;
  }, [pokemon?.id]);



  // Fecha ao clicar fora do painel — listener ativo só quando o painel está aberto
  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(e) {
      if (e.target.closest(".slot-detail-btn")) return;
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setDetailsPokemon(-1);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (!pokemon) return;
    let cancelled = false;

    async function loadForms() {
      try {
        const speciesRes = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemon.baseFormId || pokemon.id}/`);
        const speciesData = await speciesRes.json();
        const varieties = speciesData.varieties.filter(v => !v.is_default);
        if (!cancelled && varieties.length) setForms(varieties);
        else if (!cancelled) setForms(null);
      } catch { }
    }

    setForms(null);
    loadForms();
    return () => { cancelled = true; };
  }, [pokemon?.baseFormId || pokemon?.id]);

  async function switchFormKeepingBase(pokemonName, isBase = false) {
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}/`);
      const data = await res.json();
      const t = [...team];
      t[index] = {
        ...pokemon,
        id: data.id,
        name: data.name.charAt(0).toUpperCase() + data.name.slice(1),
        sprite: data.sprites.front_default,
        shinySprite: data.sprites.front_shiny,
        animatedSprite: data.sprites.versions?.['generation-v']?.['black-white']?.animated?.front_default || null,
        animatedShinySprite: data.sprites.versions?.['generation-v']?.['black-white']?.animated?.front_shiny || null,
        types: applyPreFairyTypes(data.name, data.types.map(x => x.type.name), activeGroup),
        abilities: data.abilities.map(a => a.ability.name),
        selectedAbility: data.abilities[0]?.ability?.name ?? "",
        stats: data.stats,
        moves: data.moves,
        selectedMoves: [],
        baseFormName: isBase ? pokemonName : pokemon.baseFormName,
        baseFormId: isBase ? data.id : (pokemon.baseFormId || pokemon.id),
        isBaseForm: isBase,
        hiddenAbilities: new Set(
          data.abilities.filter(a => a.is_hidden).map(a => a.ability.name)
        ),
      };
      setTeam(t);
    } catch (e) { console.error(e); }
  }

  if (!pokemon) return (
    <div className="team-slot-wrapper" style={{ background: "#ddd" }}>
      <div className="team-slot" style={{ justifyContent: "center", cursor: "default" }}>
        <span style={{ fontSize: 28, color: "#bbb", fontWeight: 300 }}>+</span>
      </div>
    </div>
  );

  const isAlternateForm = pokemon.isBaseForm === false;

  // Wrapper sempre com padding fixo — gradient pra 2 tipos, cor sólida pra 1
  const typeColors = pokemon.types.map(t => TYPE_COLORS[t] || "#ccc");
  const wrapperBg = typeColors.length >= 2
    ? `linear-gradient(to right, ${typeColors[0]} 50%, ${typeColors[1]} 50%)`
    : typeColors[0];

  return (
    <div className="team-slot-wrapper" style={{ background: wrapperBg }}>
      <div className="team-slot">

        {/* ── TOPO: botão remover (esquerda) + nome (centro) ── */}
        <div className="slot-top">
          <button className="slot-remove-btn" title="Remover"
            onClick={e => { e.stopPropagation(); removePokemon(index); }}>
            ✕
          </button>
          <span className="slot-pokemon-name">{formatName(pokemon.name)}</span>
        </div>

        {/* ── MEIO: sprite ── */}
        <img
          src={pokemon.isShiny ? pokemon.shinySprite : pokemon.sprite}
          alt={pokemon.name}
          className={`team-sprite ${animate ? "animate-add" : ""}`}
          title={pokemon.name}
        />

        {/* ── BAIXO: tipos + formas + controles ── */}
        <div className="slot-bottom">
          <div className="pokemon-types">
            {pokemon.types.map(t => (
              <span key={t} className={`type-badge ${t}`}>{t}</span>
            ))}
          </div>

          {/* Formas alternativas */}
          {(() => {
            const visibleForms = filterForms(forms || [], filterGame);
            return visibleForms.length > 0 && (
              <div className="forms-row" onClick={e => e.stopPropagation()}>
                <span style={{ fontSize: 10, color: "#888" }}>Formas:</span>
                {visibleForms.slice(0, 4).map(f => (
                  <button key={f.pokemon.name} className="form-btn"
                    onClick={() => switchFormKeepingBase(f.pokemon.name, false)}>
                    {f.pokemon.name
                      .replace((pokemon.baseFormName || pokemon.name).toLowerCase() + "-", "")
                      .replace(/-/g, " ")}
                  </button>
                ))}
              </div>
            );
          })()}

          {/* Voltar à forma base */}
          {isAlternateForm && pokemon.baseFormName && (
            <div className="forms-row" onClick={e => e.stopPropagation()}>
              <button className="form-btn"
                style={{ background: "#fff0f0", borderColor: "#e74c3c", color: "#c0392b", fontWeight: "bold" }}
                onClick={() => switchFormKeepingBase(pokemon.baseFormName, true)}>
                ↩ Forma base
              </button>
            </div>
          )}

          <div className="pokemon-controls">
            <div className="slot-ability-wrapper" onClick={e => e.stopPropagation()}>
              {pokemon.hiddenAbilities?.has(pokemon.selectedAbility) && (
                <span className="hidden-ability-badge" title="Hidden Ability">H</span>
              )}
              <select value={pokemon.selectedAbility}
                onClick={e => e.stopPropagation()}
                onChange={e => {
                  const t = [...team];
                  t[index] = { ...pokemon, selectedAbility: e.target.value };
                  setTeam(t);
                }}
                className="slot-ability-select">
                {pokemon.abilities.map(a => (
                  <option key={a} value={a}>
                    {formatName(a)}{pokemon.hiddenAbilities?.has(a) ? " (H)" : ""}
                  </option>
                ))}
              </select>
            </div>

            <button title={pokemon.isShiny ? "Shiny ativado" : "Ativar shiny"}
              className={`slot-icon-btn ${pokemon.isShiny ? "slot-icon-btn--active" : ""}`}
              onClick={e => {
                e.stopPropagation();
                const t = [...team];
                t[index] = { ...pokemon, isShiny: !pokemon.isShiny };
                setTeam(t);
              }}>
              ✦
            </button>

            <button className={`slot-detail-btn ${isOpen ? "slot-detail-btn--open" : ""}`}
              onClick={e => {
                e.stopPropagation();
                setDetailsPokemon(isOpen ? -1 : index);
              }}>
              {isOpen ? "X Fechar" : "Detalhes"}
            </button>
          </div>
        </div>

        {isOpen && (
          <div
            ref={panelRef}
            className={`stats-panel${panelLeft ? " stats-panel--left" : ""}`}
            onClick={e => e.stopPropagation()}
          >
            <div className="detail-tabs">
              {[["stats", "Stats"], ["moves", "Moves"], ["weak", "Fraquezas"], ["stab", "Coberturas"]].map(([tab, label]) => (
                <button key={tab} className={`tab-btn ${activeTab === tab ? "active" : ""}`}
                  onClick={e => { e.stopPropagation(); setActiveTab(tab); }}>
                  {label}
                </button>
              ))}
            </div>

            {activeTab === "stats" && (
              <div style={{ paddingTop: 8 }}>
                {pokemon.stats.map(stat => (
                  <div key={stat.stat.name} className="stat-row">
                    <span>{{ "hp": "HP", "attack": "ATK", "defense": "DEF", "special-attack": "SPA", "special-defense": "SPD", "speed": "SPE" }[stat.stat.name]}</span>
                    <div className="stat-bar">
                      <div className="stat-fill" style={{ width: `${(stat.base_stat / 255) * 100}%` }} />
                    </div>
                    <span className="stat-value">{stat.base_stat}</span>
                  </div>
                ))}
                <AbilityDesc abilityName={pokemon.selectedAbility} />
              </div>
            )}
            {activeTab === "moves" && (
              <MovesPanel
                pokemon={pokemon} index={index} team={team} setTeam={setTeam}
                filterGame={filterGame} />
            )}
            {activeTab === "weak" && <WeaknessPanel types={pokemon.types} ability={pokemon.selectedAbility} />}
            {activeTab === "stab" && <STABPanel types={pokemon.types} />}
          </div>
        )}
      </div>
    </div>
  );
}

// ── TeamMoveCard — golpes de um slot exibidos abaixo do time ─────────────────
export function TeamMoveCard({ pokemon }) {
  const [details, setDetails] = useState({});

  const moves = pokemon?.selectedMoves || [];

  useEffect(() => {
    if (!moves.length) return;
    let cancelled = false;
    const toFetch = moves.filter(m => !details[m]);
    if (!toFetch.length) return;
    Promise.all(toFetch.map(async name => {
      try {
        const r = await fetch(`https://pokeapi.co/api/v2/move/${name}/`);
        const d = await r.json();
        return [name, {
          type: d.type?.name || "normal",
          damageClass: d.damage_class?.name || "status",
        }];
      } catch { return [name, { type: "normal", damageClass: "status" }]; }
    })).then(results => {
      if (cancelled) return;
      setDetails(prev => { const n = { ...prev }; results.forEach(([k, v]) => { n[k] = v; }); return n; });
    });
    return () => { cancelled = true; };
  }, [moves.join(",")]);

  const DAMAGE_CLASS_ICON = { physical: "✴", special: "𖦹", status: "☯" };

  if (!pokemon) return <div className="team-move-card team-move-card--empty" />;

  const hasMoves = moves.length > 0;

  return (
    <div className="team-move-card">
      {hasMoves ? (
        <div className="team-move-grid">
          {[0, 1, 2, 3].map(i => {
            const mv = moves[i];
            const det = mv ? details[mv] : null;
            const bg = det ? (TYPE_COLORS[det.type] || "#888") : null;
            const tc = det && DARK_TEXT_TYPES.has(det.type) ? "#333" : "#fff";
            return (
              <div key={i} className="team-move-tile"
                style={bg ? { background: bg, color: tc } : {}}>
                {mv ? (
                  <div className="team-move-tile-top">
                    {det && (
                      <span className="team-move-class-icon" title={det.damageClass}>
                        {DAMAGE_CLASS_ICON[det.damageClass] || ""}
                      </span>
                    )}
                    <span className="team-move-name">{mv.replace(/-/g, " ")}</span>
                  </div>
                ) : (
                  <span className="team-move-empty-slot">— {i + 1}</span>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="team-move-no-moves">sem golpes</div>
      )}
    </div>
  );
}

export default TeamSlot;
