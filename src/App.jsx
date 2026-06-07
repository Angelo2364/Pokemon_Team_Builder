import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import TeamSlot from "./components/TeamSlot";
import TeamAnalysis from "./components/TeamAnalysis";
import { generations, ALL_TYPES, GAME_GROUPS } from "./data/generations";
import { GAME_DEX } from "./data/gamedex";
import { STAGE1, STAGE2, FINAL } from "./data/evostages";
import "./App.css";

// Formata nomes: troca hífens por espaços e capitaliza cada palavra
function formatName(name) {
  return name.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

// Seções do "Todos os jogos" — cada geração vira uma seção
const ALL_GAMES_SECTIONS = [
  { name: "Kanto",   genId: 1 },
  { name: "Johto",   genId: 2 },
  { name: "Hoenn",   genId: 3 },
  { name: "Sinnoh",  genId: 4 },
  { name: "Unova",   genId: 5 },
  { name: "Kalos",   genId: 6 },
  { name: "Alola",   genId: 7 },
  { name: "Galar",   genId: 8 },
  { name: "Paldea",  genId: 9 },
];

// ── Searchable dropdown ──────────────────────────────────────────────────────
function SearchableDropdown({ placeholder, onSearch, results, onSelect, loading, selectedName }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    function handler(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function handleQuery(v) {
    setQuery(v);
    if (v.length >= 2) { onSearch(v); setOpen(true); }
    else setOpen(false);
  }

  function handleSelect(item) {
    setQuery(""); setOpen(false); onSelect(item);
  }

  return (
    <div ref={ref} style={{ position:"relative", flex:1, minWidth:180 }}>
      <div style={{ display:"flex", alignItems:"center", gap:6,
        border:"1px solid #ccc", borderRadius:8, padding:"6px 10px",
        background:"white", cursor:"text" }}
        onClick={() => { if (selectedName) { onSelect(null); setQuery(""); } }}>
        {selectedName ? (
          <>
            <span style={{ fontSize:13, flex:1, textTransform:"capitalize" }}>{formatName(selectedName)}</span>
            <span style={{ fontSize:11, color:"#e74c3c", cursor:"pointer", fontWeight:"bold" }}>✕</span>
          </>
        ) : (
          <input style={{ border:"none", outline:"none", flex:1, fontSize:13, background:"transparent" }}
            placeholder={placeholder} value={query}
            onChange={e=>handleQuery(e.target.value)} onClick={e=>e.stopPropagation()}/>
        )}
        {loading && <span style={{ fontSize:11, color:"#888" }}>…</span>}
      </div>
      {open && results.length > 0 && (
        <div style={{ position:"absolute", top:"calc(100% + 4px)", left:0, right:0,
          background:"white", border:"1px solid #ccc", borderRadius:8,
          boxShadow:"0 4px 12px rgba(0,0,0,.15)", zIndex:500, maxHeight:220, overflowY:"auto" }}>
          {results.map(r=>(
            <div key={r.name} onClick={()=>handleSelect(r)}
              style={{ padding:"8px 12px", fontSize:13, cursor:"pointer",
                textTransform:"capitalize", borderBottom:"1px solid #f0f0f0" }}
              onMouseEnter={e=>e.currentTarget.style.background="#f5f5f5"}
              onMouseLeave={e=>e.currentTarget.style.background=""}>
              {formatName(r.name)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [started, setStarted] = useState(false);
  const [setupGame, setSetupGame] = useState("all");

  const [team, setTeam] = useState(Array(6).fill(null));
  const [pokemonList, setPokemonList] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterGame, setFilterGame] = useState("all");
  const [filterGen, setFilterGen] = useState("all");   // filtro de geração independente
  const [filterStage, setFilterStage] = useState("all");
  const [hideLegendary, setHideLegendary] = useState(false);
  const [filterVersion, setFilterVersion] = useState("all");

  const [typeFilteredIds, setTypeFilteredIds] = useState(null);
  const [moveFilteredIds, setMoveFilteredIds] = useState(null);
  const [abilityFilteredIds, setAbilityFilteredIds] = useState(null);
  const [legendaryIds, setLegendaryIds] = useState(null);

  const [moveSearchResults, setMoveSearchResults] = useState([]);
  const [abilitySearchResults, setAbilitySearchResults] = useState([]);
  const [selectedMove, setSelectedMove] = useState(null);
  const [selectedAbilityFilter, setSelectedAbilityFilter] = useState(null);
  const [moveLoading, setMoveLoading] = useState(false);
  const [abilityLoading, setAbilityLoading] = useState(false);
  const [allMoveNames, setAllMoveNames] = useState([]);
  const [allAbilityNames, setAllAbilityNames] = useState([]);

  const [detailsPokemon, setDetailsPokemon] = useState(-1);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const handleOverlayClick = useCallback(() => setDetailsPokemon(-1), []);

  useEffect(() => { setFilterVersion("all"); }, [filterGame]);

  // ── Load all Pokémon ─────────────────────────────────────────────────────
  useEffect(() => {
    async function loadAll() {
      setLoading(true);
      try {
        const results = await Promise.all(
          generations.map(async gen => {
            const r = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${gen.limit}&offset=${gen.offset}`);
            const d = await r.json();
            return d.results
              .map(p => {
                const urlParts = p.url.split("/").filter(Boolean);
                const id = Number(urlParts[urlParts.length - 1]);
                return { name: p.name, url: p.url,
                  sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
                  id, genId: gen.id };
              })
              .filter(p => p.id <= 10000);
          })
        );
        setPokemonList(results.flat());
      } catch(e) { console.error(e); }
      setLoading(false);
    }
    loadAll();
  }, []);

  useEffect(() => {
    fetch("https://pokeapi.co/api/v2/move?limit=950").then(r=>r.json())
      .then(d=>setAllMoveNames(d.results.map(m=>m.name)));
    fetch("https://pokeapi.co/api/v2/ability?limit=300").then(r=>r.json())
      .then(d=>setAllAbilityNames(d.results.map(a=>a.name)));
  }, []);

  useEffect(() => {
    if (filterType==="all") { setTypeFilteredIds(null); return; }
    let cancelled=false;
    fetch(`https://pokeapi.co/api/v2/type/${filterType}`).then(r=>r.json()).then(data=>{
      if (cancelled) return;
      setTypeFilteredIds(new Set(data.pokemon.map(p=>{
        const parts=p.pokemon.url.split("/").filter(Boolean);
        return Number(parts[parts.length-1]);
      })));
    });
    return ()=>{ cancelled=true; };
  }, [filterType]);

  async function searchMoves(q) {
    setMoveSearchResults(allMoveNames.filter(n=>n.includes(q.toLowerCase())).slice(0,20).map(n=>({name:n})));
  }
  async function selectMove(item) {
    setSelectedMove(item); setMoveFilteredIds(null);
    if (!item) return;
    setMoveLoading(true);
    try {
      const r = await fetch(`https://pokeapi.co/api/v2/move/${item.name}/`);
      const d = await r.json();
      setMoveFilteredIds(new Set(d.learned_by_pokemon.map(p=>{
        const parts=p.url.split("/").filter(Boolean); return Number(parts[parts.length-1]);
      })));
    } catch(e) { console.error(e); }
    setMoveLoading(false);
  }

  async function searchAbilities(q) {
    setAbilitySearchResults(allAbilityNames.filter(n=>n.includes(q.toLowerCase())).slice(0,20).map(n=>({name:n})));
  }
  async function selectAbility(item) {
    setSelectedAbilityFilter(item); setAbilityFilteredIds(null);
    if (!item) return;
    setAbilityLoading(true);
    try {
      const r = await fetch(`https://pokeapi.co/api/v2/ability/${item.name}/`);
      const d = await r.json();
      setAbilityFilteredIds(new Set(d.pokemon.map(p=>{
        const parts=p.pokemon.url.split("/").filter(Boolean); return Number(parts[parts.length-1]);
      })));
    } catch(e) { console.error(e); }
    setAbilityLoading(false);
  }

  useEffect(() => {
    if (!hideLegendary) { setLegendaryIds(null); return; }
    if (legendaryIds) return;
    setLegendaryIds(new Set([
      144,145,146,150,151,243,244,245,249,250,251,377,378,379,380,381,382,383,384,385,386,
      479,480,481,482,483,484,485,486,487,488,489,490,491,492,493,494,
      638,639,640,641,642,643,644,645,646,647,648,649,
      716,717,718,719,720,721,
      772,773,785,786,787,788,789,790,791,792,793,794,795,796,797,798,799,800,801,802,807,808,809,
      888,889,890,891,892,893,894,895,896,897,898,
      905,1001,1002,1003,1004,1005,1006,1007,1008,1009,1010,
    ]));
  }, [hideLegendary]);

  const activeGroup = useMemo(()=>GAME_GROUPS.find(g=>g.id===filterGame)||null, [filterGame]);
  const activeGenIds = useMemo(()=>activeGroup ? new Set(activeGroup.genIds) : null, [activeGroup]);

  // Converte aNames/bNames em Sets de nomes para filtragem eficiente
  const exclusiveNameSets = useMemo(() => {
    const excl = activeGroup?.exclusives;
    if (!excl) return null;
    return {
      a: new Set(excl.aNames),
      b: new Set(excl.bNames),
    };
  }, [activeGroup]);

  // Função auxiliar que aplica todos os filtros secundários a uma lista
  function applySecondaryFilters(list) {
    if (filterGen !== "all") list = list.filter(p => p.genId === Number(filterGen));
    if (search.trim()) list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    if (filterType !== "all" && typeFilteredIds) list = list.filter(p => typeFilteredIds.has(p.id));
    if (moveFilteredIds) list = list.filter(p => moveFilteredIds.has(p.id));
    if (abilityFilteredIds) list = list.filter(p => abilityFilteredIds.has(p.id));
    if (hideLegendary && legendaryIds) list = list.filter(p => !legendaryIds.has(p.id));
    if (filterStage === "1") list = list.filter(p => STAGE1.has(p.name));
    else if (filterStage === "2") list = list.filter(p => STAGE2.has(p.name));
    else if (filterStage === "final") list = list.filter(p => FINAL.has(p.name));
    const excl = activeGroup?.exclusives;
    if (excl && filterVersion === "a") list = list.filter(p => exclusiveNameSets.a.has(p.name));
    if (excl && filterVersion === "b") list = list.filter(p => exclusiveNameSets.b.has(p.name));
    return list;
  }

  // visibleList — usado só no grid normal (sem gamedex e sem seções)
  const visibleList = useMemo(() => {
    let list = pokemonList;
    if (activeGenIds) list = list.filter(p => activeGenIds.has(p.genId));
    if (filterGen !== "all") list = list.filter(p => p.genId === Number(filterGen));
    return applySecondaryFilters(list);
  }, [pokemonList, activeGenIds, filterGen, search, filterType, typeFilteredIds,
      moveFilteredIds, abilityFilteredIds, hideLegendary, legendaryIds,
      filterStage, filterVersion, activeGroup, exclusiveNameSets]);

  // gameDexSections — seções do gamedex pra jogos específicos
  const gameDexSections = useMemo(() => {
    if (filterGame === "all") return null;
    const sections = GAME_DEX[filterGame];
    if (!sections) return null;
    return sections.map(section => ({
      name: section.name,
      pokemon: applySecondaryFilters(
        section.pokemon
          .map(name => pokemonList.find(p => p.name === name))
          .filter(Boolean)
      ),
    })).filter(s => s.pokemon.length > 0);
  }, [filterGame, filterGen, pokemonList, search, filterType, typeFilteredIds, moveFilteredIds,
      abilityFilteredIds, hideLegendary, legendaryIds, filterStage,
      filterVersion, activeGroup, exclusiveNameSets]);

  // allGamesSections — seções por geração quando filterGame === "all"
  // Cada geração vira uma seção (Kanto, Johto, Hoenn...)
  const allGamesSections = useMemo(() => {
    if (filterGame !== "all") return null;
    return ALL_GAMES_SECTIONS
      .filter(s => filterGen === "all" || s.genId === Number(filterGen))
      .map(s => ({
        name: s.name,
        pokemon: applySecondaryFilters(
          pokemonList.filter(p => p.genId === s.genId)
        ),
      }))
      .filter(s => s.pokemon.length > 0);
  }, [filterGame, filterGen, pokemonList, search, filterType, typeFilteredIds,
      moveFilteredIds, abilityFilteredIds, hideLegendary, legendaryIds,
      filterStage, filterVersion, activeGroup, exclusiveNameSets]);

  async function addPokemon(pokemon) {
    const firstEmpty = team.findIndex(s=>s===null);
    if (firstEmpty===-1) return;
    const r = await fetch(pokemon.url);
    const d = await r.json();
    const t=[...team];
    t[firstEmpty]={
      id:d.id,
      name:d.name.charAt(0).toUpperCase()+d.name.slice(1),
      sprite:d.sprites.front_default,
      shinySprite:d.sprites.front_shiny,
      isShiny:false,
      types:d.types.map(x=>x.type.name),
      abilities:d.abilities.map(a=>a.ability.name),
      selectedAbility:d.abilities[0]?.ability?.name??"",
      stats:d.stats, moves:d.moves, selectedMoves:[],
      baseFormName: d.name, isBaseForm: true,
    };
    setTeam(t);
  }

  function removePokemon(index) {
    const t=[...team]; t[index]=null; setTeam(t); setDetailsPokemon(-1);
  }
  function clearTeam() {
    setTeam(Array(6).fill(null)); setDetailsPokemon(-1); setShowAnalysis(false);
  }
  function startGame() { setFilterGame(setupGame); setStarted(true); }
  function clearFilters() {
    setSearch(""); setFilterType("all"); setFilterGen("all");
    setFilterStage("all"); setHideLegendary(false); setFilterVersion("all");
    setSelectedMove(null); setMoveFilteredIds(null); setMoveSearchResults([]);
    setSelectedAbilityFilter(null); setAbilityFilteredIds(null); setAbilitySearchResults([]);
  }

  // ── Setup screen ──────────────────────────────────────────────────────────
  if (!started) {
    return (
      <div className="setup-screen">
        <h1>Pokémon Team Builder</h1>
        <div className="setup-card">
          <label style={{fontWeight:"bold"}}>Jogo</label>
          <select value={setupGame} onChange={e=>setSetupGame(e.target.value)}
            style={{padding:"10px",borderRadius:8,border:"1px solid #ccc",fontSize:14}}>
            <option value="all">Todos os jogos</option>
            {GAME_GROUPS.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
          <p style={{margin:0,fontSize:12,color:"#888"}}>
            Você poderá mudar o filtro de jogo dentro do builder também.
          </p>
          <button className="start-btn" onClick={startGame}>Começar →</button>
        </div>
      </div>
    );
  }

  const hasTeam = team.some(Boolean);

  // Decide qual lista de seções usar no render
  const sectionsToRender = gameDexSections ?? allGamesSections;

  // ── Builder ───────────────────────────────────────────────────────────────
  return (
    <div className="builder" onClick={handleOverlayClick}>
      <div className="builder-header">
        <h1 style={{margin:0}}>Seu Time</h1>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {hasTeam && <>
            <button className="action-btn danger" onClick={e=>{e.stopPropagation();clearTeam();}}>
              🗑 Limpar time
            </button>
            <button className={`action-btn ${showAnalysis?"active":""}`}
              onClick={e=>{e.stopPropagation();setShowAnalysis(v=>!v);}}>
              📊 {showAnalysis?"Ocultar":"Análise do time"}
            </button>
          </>}
          <button className="action-btn" onClick={e=>{e.stopPropagation();setStarted(false);clearTeam();}}>
            ← Voltar
          </button>
        </div>
      </div>

      <div className="team-container" onClick={e=>e.stopPropagation()}>
        {team.map((pokemon,index)=>(
          <TeamSlot key={index} pokemon={pokemon} index={index}
            team={team} setTeam={setTeam}
            detailsPokemon={detailsPokemon} setDetailsPokemon={setDetailsPokemon}
            removePokemon={removePokemon} filterGame={filterGame}/>
        ))}
      </div>

      {showAnalysis && hasTeam && (
        <div onClick={e=>e.stopPropagation()}>
          <TeamAnalysis team={team}/>
        </div>
      )}

      <div className="pokemon-header" onClick={e=>e.stopPropagation()}>
        <h2 style={{margin:0}}>Pokémon Disponíveis</h2>
        <div className="filters">

          <input type="text" placeholder="Buscar por nome..."
            value={search} onChange={e=>setSearch(e.target.value)}/>

          {/* Filtro de jogo */}
          <select value={filterGame} onChange={e=>{ setFilterGame(e.target.value); setFilterGen("all"); }}>
            <option value="all">Todos os jogos</option>
            {GAME_GROUPS.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}
          </select>

          {/* Filtro de exclusivos — só aparece se o jogo tiver exclusivos */}
          <select value={filterVersion}
            disabled={!activeGroup?.exclusives}
            onChange={e=>setFilterVersion(e.target.value)}
            style={{ opacity: activeGroup?.exclusives ? 1 : 0.4 }}>
            <option value="all">{!activeGroup?.exclusives ? "Sem exclusividades" : "Todos os Pokémon"}</option>
            {activeGroup?.exclusives && <>
              <option value="a">Exclusivo {activeGroup.exclusives.a}</option>
              <option value="b">Exclusivo {activeGroup.exclusives.b}</option>
            </>}
          </select>

          {/* Filtro de geração — entre exclusivos e tipo */}
          <select value={filterGen} onChange={e=>setFilterGen(e.target.value)}>
            <option value="all">Todas as gerações</option>
            {ALL_GAMES_SECTIONS.map(s=>(
              <option key={s.genId} value={s.genId}>Gen {s.genId} — {s.name}</option>
            ))}
          </select>

          {/* Filtro de tipo */}
          <select value={filterType} onChange={e=>setFilterType(e.target.value)}>
            <option value="all">Todos os tipos</option>
            {[...ALL_TYPES].sort((a,b)=>a.localeCompare(b)).map(t=><option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
          </select>

          {/* Filtro de estágio */}
          <select value={filterStage} onChange={e=>setFilterStage(e.target.value)}>
            <option value="all">Todos os estágios</option>
            <option value="final">Estágio final</option>
            <option value="2">2º estágio</option>
            <option value="1">1º estágio</option>
          </select>

          <SearchableDropdown placeholder="Filtrar por golpe…"
            onSearch={searchMoves} results={moveSearchResults}
            onSelect={selectMove} loading={moveLoading}
            selectedName={selectedMove?.name||null}/>

          <SearchableDropdown placeholder="Filtrar por habilidade…"
            onSearch={searchAbilities} results={abilitySearchResults}
            onSelect={selectAbility} loading={abilityLoading}
            selectedName={selectedAbilityFilter?.name||null}/>

          <label style={{display:"flex",alignItems:"center",gap:6,fontSize:13,cursor:"pointer",
            background:"white",padding:"7px 12px",borderRadius:8,border:"1px solid #ccc",whiteSpace:"nowrap"}}>
            <input type="checkbox" checked={hideLegendary}
              onChange={e=>setHideLegendary(e.target.checked)}/>
            Ocultar lendários
          </label>

          <button title="Limpar filtros" onClick={e=>{e.stopPropagation();clearFilters();}}
            style={{padding:"7px 11px",border:"1px solid #ccc",borderRadius:8,background:"white",
              cursor:"pointer",fontSize:15,lineHeight:1,transition:"background 0.15s"}}
            onMouseEnter={e=>e.currentTarget.style.background="#f0f0f0"}
            onMouseLeave={e=>e.currentTarget.style.background="white"}>
            ↺
          </button>
        </div>
      </div>

      {loading && (
        <div className="loading-bar" onClick={e=>e.stopPropagation()}>
          <div className="loading-bar-fill"/>
          <span>Carregando Pokémon...</span>
        </div>
      )}

      {/* Lista de Pokémon — sempre em seções */}
      <div onClick={e=>e.stopPropagation()}>
        {sectionsToRender && sectionsToRender.length === 0 ? (
          <p style={{color:"#888",fontSize:14}}>Nenhum Pokémon encontrado com esses filtros.</p>
        ) : sectionsToRender ? (
          sectionsToRender.map(section => (
            <div key={section.name} style={{marginBottom:32}}>
              <h3 className="section-heading">
                {section.name}
                <span className="section-count">{section.pokemon.length} Pokémon</span>
              </h3>
              <div className="pokemon-list">
                {section.pokemon.map(pokemon=>(
                  <div key={pokemon.id} className="pokemon-card" data-name={formatName(pokemon.name)} onClick={()=>addPokemon(pokemon)}>
                    <img src={pokemon.sprite} alt={pokemon.name} className="pokemon-list-sprite"/>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : null}
      </div>
    </div>
  );
}
