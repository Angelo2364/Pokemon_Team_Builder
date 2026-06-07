import { useState, useEffect } from "react";
import { TYPE_CHART, TYPE_ABBR, TYPE_COLORS, DARK_TEXT_TYPES, GAME_GROUPS, GAME_VERSION_GROUPS } from "../data/generations";

// ── Shared util ──────────────────────────────────────────────────────────────
export function computeWeaknesses(types) {
  const ALL_ATK = [
    "normal","fire","water","electric","grass","ice","fighting","poison",
    "ground","flying","psychic","bug","rock","ghost","dragon","dark","steel","fairy",
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
  const abbr = TYPE_ABBR[type] || type.slice(0,3).toUpperCase();
  if (size === "xs") return (
    <span style={{ background:bg, color, fontSize:9, fontWeight:"bold",
      padding:"1px 4px", borderRadius:4, letterSpacing:0.5,
      display:"inline-block", lineHeight:"14px", flexShrink:0 }}>
      {abbr}
    </span>
  );
  return <span className={`type-badge ${type}`}>{type}</span>;
}

// ── WeaknessPanel ────────────────────────────────────────────────────────────
export function WeaknessPanel({ types }) {
  const mult = computeWeaknesses(types);
  const sections = [
    { label:"×4 Fraco",   filter:v=>v===4,    color:"#c0392b" },
    { label:"×2 Fraco",   filter:v=>v===2,    color:"#e74c3c" },
    { label:"½ Resiste",  filter:v=>v===0.5,  color:"#27ae60" },
    { label:"¼ Resiste",  filter:v=>v===0.25, color:"#16a085" },
    { label:"Imune",      filter:v=>v===0,    color:"#2980b9" },
  ];
  const hasAny = sections.some(({ filter }) => Object.values(mult).some(filter));
  return (
    <div className="weakness-panel">
      {!hasAny && <p style={{fontSize:12,color:"#888"}}>Sem fraquezas relevantes.</p>}
      {sections.map(({ label, filter, color }) => {
        const entries = Object.entries(mult).filter(([,v])=>filter(v));
        if (!entries.length) return null;
        return (
          <div key={label} style={{ marginBottom:8 }}>
            <span style={{ fontSize:11, fontWeight:"bold", color }}>{label}</span>
            <div style={{ display:"flex", flexWrap:"wrap", gap:4, marginTop:4 }}>
              {entries.map(([t])=><span key={t} className={`type-badge ${t}`}>{t}</span>)}
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
    "normal","fire","water","electric","grass","ice","fighting","poison",
    "ground","flying","psychic","bug","rock","ghost","dragon","dark","steel","fairy",
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
    <div style={{ paddingTop:6 }}>
      <p style={{ fontSize:12, color:"#888", margin:"0 0 10px" }}>
        Cobertura ofensiva com STAB — tipos que este Pokémon acerta:
      </p>
      {[
        { label:"×2 Super efetivo", list:superEffective, color:"#c0392b" },
        { label:"×1 Normal",        list:neutral,        color:"#555" },
        { label:"½ Pouco efetivo",  list:notVery,        color:"#27ae60" },
        { label:"✕ Imune",          list:immune,         color:"#2980b9" },
      ].map(({ label, list, color }) => list.length === 0 ? null : (
        <div key={label} style={{ marginBottom:8 }}>
          <span style={{ fontSize:11, fontWeight:"bold", color }}>{label}</span>
          <div style={{ display:"flex", flexWrap:"wrap", gap:4, marginTop:4 }}>
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
        background:"#2c3e50", color:"#fff", fontSize:9, fontWeight:"bold",
        padding:"1px 5px", borderRadius:4, flexShrink:0, letterSpacing:0.3,
        fontVariantNumeric:"tabular-nums",
      }}>
        {level > 0 ? `Lv${level}` : "Lv—"}
      </span>
    );
  }
  if (method === "machine") {
    return (
      <span style={{
        background:"#8e44ad", color:"#fff", fontSize:9, fontWeight:"bold",
        padding:"1px 5px", borderRadius:4, flexShrink:0, letterSpacing:0.3,
      }}>
        TM
      </span>
    );
  }
  if (method === "egg") {
    return (
      <span style={{
        background:"#e67e22", color:"#fff", fontSize:9, fontWeight:"bold",
        padding:"1px 5px", borderRadius:4, flexShrink:0, letterSpacing:0.3,
      }}>
        EGG
      </span>
    );
  }
  if (method === "tutor") {
    return (
      <span style={{
        background:"#16a085", color:"#fff", fontSize:9, fontWeight:"bold",
        padding:"1px 5px", borderRadius:4, flexShrink:0, letterSpacing:0.3,
      }}>
        TUT
      </span>
    );
  }
  return null;
}

// ── MovesPanel ───────────────────────────────────────────────────────────────
function MovesPanel({ pokemon, index, team, setTeam, filterGame }) {
  const [moveSearch, setMoveSearch] = useState("");
  const [moveTypes, setMoveTypes] = useState({});
  // Local version selector — initialized from filterGame, but user can override
  const [selectedVersion, setSelectedVersion] = useState(filterGame || "all");

  // Sync with global filterGame when it changes, but only if user hasn't overridden
  const [userOverrode, setUserOverrode] = useState(false);
  useEffect(() => {
    if (!userOverrode) setSelectedVersion(filterGame || "all");
  }, [filterGame]);

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
      const methodPriority = { "level-up":0, machine:1, egg:2, tutor:3 };
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
    const methodOrder = { "level-up":0, machine:1, egg:2, tutor:3 };
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

  // Filter by search query
  const filtered = processedMoves.filter(m =>
    m.name.toLowerCase().includes(moveSearch.toLowerCase())
  );

  // Fetch types for visible moves
  useEffect(() => {
    let cancelled = false;
    const visible = filtered.slice(0, 80);
    const toFetch = visible.filter(m => !moveTypes[m.name]);
    if (!toFetch.length) return;
    Promise.all(toFetch.map(async ({ name }) => {
      try {
        const r = await fetch(`https://pokeapi.co/api/v2/move/${name}/`);
        const d = await r.json();
        return [name, d.type?.name || "normal"];
      } catch { return [name, "normal"]; }
    })).then(results => {
      if (cancelled) return;
      setMoveTypes(prev => { const n={...prev}; results.forEach(([k,v])=>{n[k]=v;}); return n; });
    });
    return () => { cancelled = true; };
  }, [moveSearch, selectedVersion, pokemon.id]);

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
        {[0,1,2,3].map(i => {
          const mv = selectedMoves[i];
          const mvType = mv ? (moveTypes[mv] || null) : null;
          const bg = mvType ? (TYPE_COLORS[mvType] || "#333") : null;
          const tc = mvType && DARK_TEXT_TYPES.has(mvType) ? "#333" : "#fff";
          return (
            <div key={i} className={`move-slot ${mv?"filled":"empty"}`}
              style={bg ? {background:bg,color:tc,border:"none"} : {}}
              onClick={() => mv && toggleMove(mv)}>
              {mv ? (
                <span style={{display:"flex",alignItems:"center",gap:4,justifyContent:"center"}}>
                  {mvType && <TypePill type={mvType} size="xs"/>}
                  {mv.replace(/-/g," ")}
                </span>
              ) : `— Move ${i+1}`}
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
          width:"100%", boxSizing:"border-box",
          padding:"5px 8px", border:"1px solid #ccc", borderRadius:8,
          fontSize:11, marginBottom:6, background:"#fafafa", color:"#333",
        }}>
        <option value="all">Todos os jogos</option>
        {GAME_GROUPS.map(g => (
          <option key={g.id} value={g.id}>{g.name}</option>
        ))}
      </select>

      {/* Search */}
      <input className="move-search" type="text" placeholder="Buscar golpe..."
        value={moveSearch} onChange={e => setMoveSearch(e.target.value)}
        onClick={e => e.stopPropagation()} />

      {/* Move list */}
      <div className="move-list">
        {filtered.length === 0 && (
          <p style={{fontSize:11,color:"#aaa",textAlign:"center",margin:"8px 0"}}>
            Nenhum golpe disponível nesta versão.
          </p>
        )}
        {filtered.slice(0, 80).map(m => {
          const active = selectedMoves.includes(m.name);
          const mt = moveTypes[m.name];
          const bg = mt ? (TYPE_COLORS[mt] || "#eee") : "#f5f5f5";
          return (
            <div key={m.name}
              className={`move-option ${active?"active":""} ${!active&&selectedMoves.length>=4?"disabled":""}`}
              style={mt ? {
                background: active ? "#222" : bg+"33",
                borderLeft: `3px solid ${bg}`,
                color: active ? "#fff" : "#222",
              } : {}}
              onClick={e => { e.stopPropagation(); toggleMove(m.name); }}>
              <span style={{display:"flex",alignItems:"center",gap:5,width:"100%"}}>
                {mt && <TypePill type={mt} size="xs"/>}
                <span style={{textTransform:"capitalize",flex:1}}>
                  {m.name.replace(/-/g," ")}
                </span>
                <LearnBadge method={m.method} level={m.level}/>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── TeamSlot ─────────────────────────────────────────────────────────────────
function TeamSlot({ pokemon, index, team, setTeam, detailsPokemon, setDetailsPokemon, removePokemon, filterGame }) {
  const [activeTab, setActiveTab] = useState("stats");
  const [forms, setForms] = useState(null);

  const isOpen = detailsPokemon === index;

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
        types: data.types.map(x => x.type.name),
        abilities: data.abilities.map(a => a.ability.name),
        selectedAbility: data.abilities[0]?.ability?.name ?? "",
        stats: data.stats,
        moves: data.moves,
        selectedMoves: [],
        baseFormName: isBase ? pokemonName : pokemon.baseFormName,
        baseFormId: isBase ? data.id : (pokemon.baseFormId || pokemon.id),
        isBaseForm: isBase,
      };
      setTeam(t);
    } catch(e) { console.error(e); }
  }

  if (!pokemon) return <div className="team-slot"><span>Empty</span></div>;

  const isAlternateForm = pokemon.isBaseForm === false;

  return (
    <div className="team-slot" onClick={() => removePokemon(index)}>
      <img src={pokemon.isShiny ? pokemon.shinySprite : pokemon.sprite}
        alt={pokemon.name} className="team-sprite" title={pokemon.name}/>

      <div className="pokemon-types">
        {pokemon.types.map(t => (
          <span key={t} className={`type-badge ${t}`}>{t}</span>
        ))}
      </div>

      {/* Alternate forms / Megas / Gigantamax */}
      {forms && forms.length > 0 && (
        <div className="forms-row" onClick={e => e.stopPropagation()}>
          <span style={{fontSize:10,color:"#888",marginBottom:2}}>Formas:</span>
          {forms.slice(0, 4).map(f => (
            <button key={f.pokemon.name} className="form-btn"
              onClick={() => switchFormKeepingBase(f.pokemon.name, false)}>
              {f.pokemon.name
                .replace((pokemon.baseFormName || pokemon.name).toLowerCase() + "-", "")
                .replace(/-/g, " ")}
            </button>
          ))}
        </div>
      )}

      {/* Voltar à forma base */}
      {isAlternateForm && pokemon.baseFormName && (
        <div className="forms-row" onClick={e => e.stopPropagation()}>
          <button
            className="form-btn"
            style={{ background:"#fff0f0", borderColor:"#e74c3c", color:"#c0392b", fontWeight:"bold" }}
            onClick={() => switchFormKeepingBase(pokemon.baseFormName, true)}>
            ↩ Forma base
          </button>
        </div>
      )}

      <div className="pokemon-controls">
        {/* Select de habilidade */}
        <select
          value={pokemon.selectedAbility}
          onClick={e => e.stopPropagation()}
          onChange={e => {
            const t = [...team];
            t[index] = { ...pokemon, selectedAbility: e.target.value };
            setTeam(t);
          }}
          className="slot-ability-select">
          {pokemon.abilities.map(a => <option key={a} value={a}>{a}</option>)}
        </select>

        {/* Botão shiny */}
        <button
          title={pokemon.isShiny ? "Shiny ativado" : "Ativar shiny"}
          className={`slot-icon-btn ${pokemon.isShiny ? "slot-icon-btn--active" : ""}`}
          onClick={e => {
            e.stopPropagation();
            const t = [...team];
            t[index] = { ...pokemon, isShiny: !pokemon.isShiny };
            setTeam(t);
          }}>
          ✦
        </button>

        {/* Botão detalhes */}
        <button
          className={`slot-detail-btn ${isOpen ? "slot-detail-btn--open" : ""}`}
          onClick={e => {
            e.stopPropagation();
            setDetailsPokemon(isOpen ? -1 : index);
          }}>
          {isOpen ? "✕ Fechar" : "Detalhes"}
        </button>
      </div>

      {isOpen && (
        <div className="stats-panel" onClick={e => e.stopPropagation()}>
          <div className="detail-tabs">
            {[["stats","Stats"],["moves","Moves"],["weak","Fraquezas"],["stab","STAB"]].map(([tab,label]) => (
              <button key={tab} className={`tab-btn ${activeTab===tab?"active":""}`}
                onClick={e => { e.stopPropagation(); setActiveTab(tab); }}>
                {label}
              </button>
            ))}
          </div>

          {activeTab==="stats" && (
            <div style={{paddingTop:8}}>
              {pokemon.stats.map(stat => (
                <div key={stat.stat.name} className="stat-row">
                  <span>{{"hp":"HP","attack":"ATK","defense":"DEF","special-attack":"SPA","special-defense":"SPD","speed":"SPE"}[stat.stat.name]}</span>
                  <div className="stat-bar">
                    <div className="stat-fill" style={{width:`${(stat.base_stat/255)*100}%`}}/>
                  </div>
                  <span className="stat-value">{stat.base_stat}</span>
                </div>
              ))}
            </div>
          )}
          {activeTab==="moves" && (
            <MovesPanel
              pokemon={pokemon} index={index} team={team} setTeam={setTeam}
              filterGame={filterGame}/>
          )}
          {activeTab==="weak" && <WeaknessPanel types={pokemon.types}/>}
          {activeTab==="stab" && <STABPanel types={pokemon.types}/>}
        </div>
      )}
    </div>
  );
}

export default TeamSlot;
