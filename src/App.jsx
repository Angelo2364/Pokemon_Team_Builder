import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import TeamSlot, { TeamMoveCard } from "./components/TeamSlot";
import TeamAnalysis from "./components/TeamAnalysis";
import { generations, ALL_TYPES, GAME_GROUPS } from "./data/generations";
import { GAME_DEX } from "./data/gamedex";
import { STAGE1, STAGE2, FINAL } from "./data/evostages";
import Footer from "./components/Footer";
import "./App.css";


// ── Cache global de dados de Pokémon — evita re-fetch ao re-adicionar ────────
const POKEMON_CACHE = {};

const PRE_FAIRY_GAMES = new Set([
  "rby",
  "gsc",
  "rse",
  "frlg",
  "dpp",
  "hgss",
  "bw",
  "bw2",
]);

// ── Tipos pré-Gen 6: Pokémon que ganharam Fairy em X/Y ───────────────────────
const PRE_FAIRY_TYPES = {
  "cleffa": ["normal"],
  "clefairy": ["normal"],
  "clefable": ["normal"],
  "igglybuff": ["normal"],
  "jigglypuff": ["normal"],
  "wigglytuff": ["normal"],
  "mime-jr": ["psychic"],
  "mr-mime": ["psychic"],
  "togepi": ["normal"],
  "togetic": ["normal", "flying"],
  "togekiss": ["normal", "flying"],
  "azurill": ["normal"],
  "marill": ["water"],
  "azumarill": ["water"],
  "snubbull": ["normal"],
  "granbull": ["normal"],
  "ralts": ["psychic"],
  "kirlia": ["psychic"],
  "gardevoir": ["psychic"],
  "mawile": ["steel"],
  "cottonee": ["grass"],
  "whimsicott": ["grass"],
};
function applyPreFairyTypes(pokemonName, types, activeGroup) {
  if (!activeGroup || !PRE_FAIRY_GAMES.has(activeGroup.id))
    return types;

  return PRE_FAIRY_TYPES[pokemonName.toLowerCase()] ?? types;
}

function exportShowdown(team) {
  return team
    .filter(Boolean)
    .map(pokemon => {
      const lines = [];

      lines.push(pokemon.name);

      if (pokemon.selectedAbility) {
        lines.push(`Ability: ${formatName2(pokemon.selectedAbility)}`);
      }

      if (pokemon.selectedNature) {
        lines.push(`${pokemon.selectedNature} Nature`);
      }

      if (pokemon.isShiny) {
        lines.push("Shiny: Yes");
      }

      pokemon.selectedMoves.forEach(move => {
        lines.push(`- ${formatName2(move)}`);
      });

      return lines.join("\n");
    })
    .join("\n\n");
}

function formatName2(name) {
  return name
    .split("-")
    .map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(" ");
}

// Formata nomes: troca hífens por espaços e capitaliza cada palavra
function formatName(name) {
  return name.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

// Seções do "Todos os jogos" — cada geração vira uma seção
const ALL_GAMES_SECTIONS = [
  { name: "Kanto", genId: 1 },
  { name: "Johto", genId: 2 },
  { name: "Hoenn", genId: 3 },
  { name: "Sinnoh", genId: 4 },
  { name: "Unova", genId: 5 },
  { name: "Kalos", genId: 6 },
  { name: "Alola", genId: 7 },
  { name: "Galar", genId: 8 },
  { name: "Paldea", genId: 9 },
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
    <div
      ref={ref}
      style={{
        position: "relative",
        width: 180,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          minHeight: 30,
          border: "1px solid var(--border)",
          borderRadius: 8,
          padding: "1px 10px",
          background: "var(--card)",
          cursor: "text"
        }}
        onClick={() => { if (selectedName) { onSelect(null); setQuery(""); } }}>
        {selectedName ? (
          <>
            <span style={{ fontSize: 13, flex: 1, textTransform: "capitalize" }}>{formatName(selectedName)}</span>
            <span style={{ fontSize: 11, color: "#e74c3c", cursor: "pointer", fontWeight: "bold" }}>✕</span>
          </>
        ) : (
          <input
            style={{
              border: "none",
              outline: "none",
              flex: 1,
              fontSize: 13,
              background: "transparent",
              padding: 0,
              margin: 0,
            }}
            placeholder={placeholder}
            value={query}
            onChange={e => handleQuery(e.target.value)}
            onClick={e => e.stopPropagation()}
          />
        )}
        {loading && <span style={{ fontSize: 11, color: "#888" }}>…</span>}
      </div>
      {open && results.length > 0 && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
          background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8,
          boxShadow: "0 4px 12px rgba(0,0,0,.15)", zIndex: 500, maxHeight: 220, overflowY: "auto"
        }}>
          {results.map(r => (
            <div key={r.name} onClick={() => handleSelect(r)}
              style={{
                padding: "8px 12px", fontSize: 13, cursor: "pointer",
                textTransform: "capitalize", borderBottom: "1px solid #f0f0f0"
              }}
              onMouseEnter={e => e.currentTarget.style.background = "var(--hover)"}
              onMouseLeave={e => e.currentTarget.style.background = ""}>
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
  const [dark, setDark] = useState(() => localStorage.getItem("theme") === "dark");

  useEffect(() => {
    document.body.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  const [team, setTeam] = useState(Array(6).fill(null));
  const [pendingGame, setPendingGame] = useState(null);
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
  const [highlightSlots, setHighlightSlots] = useState(null);

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
  const [stickyTeam, setStickyTeam] = useState(false);

  const [recentlyAdded, setRecentlyAdded] = useState(null);

  const teamSentinelRef = useRef(null);

  const [toast, setToast] = useState("");

  const handleOverlayClick = useCallback(() => setDetailsPokemon(-1), []);

  function showToast(message) {
    setToast(message);

    setTimeout(() => {
      setToast("");
    }, 2500);
  }

  // Sticky inteligente: ativa só quando o sentinel (abaixo do time) sai da viewport
  useEffect(() => {
    const el = teamSentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setStickyTeam(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [started]);

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
                return {
                  name: p.name, url: p.url,
                  sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
                  id, genId: gen.id
                };
              })
              .filter(p => p.id <= 10000);
          })
        );
        setPokemonList(results.flat());
      } catch (e) { console.error(e); }
      setLoading(false);
    }
    loadAll();
  }, []);

  useEffect(() => {
    fetch("https://pokeapi.co/api/v2/move?limit=950").then(r => r.json())
      .then(d => setAllMoveNames(d.results.map(m => m.name)));
    fetch("https://pokeapi.co/api/v2/ability?limit=300").then(r => r.json())
      .then(d => setAllAbilityNames(d.results.map(a => a.name)));
  }, []);

  useEffect(() => {
    if (filterType === "all") { setTypeFilteredIds(null); return; }
    let cancelled = false;
    fetch(`https://pokeapi.co/api/v2/type/${filterType}`).then(r => r.json()).then(data => {
      if (cancelled) return;
      setTypeFilteredIds(new Set(data.pokemon.map(p => {
        const parts = p.pokemon.url.split("/").filter(Boolean);
        return Number(parts[parts.length - 1]);
      })));
    });
    return () => { cancelled = true; };
  }, [filterType]);

  async function searchMoves(q) {
    setMoveSearchResults(allMoveNames.filter(n => n.includes(q.toLowerCase())).slice(0, 20).map(n => ({ name: n })));
  }
  async function selectMove(item) {
    setSelectedMove(item); setMoveFilteredIds(null);
    if (!item) return;
    setMoveLoading(true);
    try {
      const r = await fetch(`https://pokeapi.co/api/v2/move/${item.name}/`);
      const d = await r.json();
      setMoveFilteredIds(new Set(d.learned_by_pokemon.map(p => {
        const parts = p.url.split("/").filter(Boolean); return Number(parts[parts.length - 1]);
      })));
    } catch (e) { console.error(e); }
    setMoveLoading(false);
  }

  async function searchAbilities(q) {
    setAbilitySearchResults(allAbilityNames.filter(n => n.includes(q.toLowerCase())).slice(0, 20).map(n => ({ name: n })));
  }
  async function selectAbility(item) {
    setSelectedAbilityFilter(item); setAbilityFilteredIds(null);
    if (!item) return;
    setAbilityLoading(true);
    try {
      const r = await fetch(`https://pokeapi.co/api/v2/ability/${item.name}/`);
      const d = await r.json();
      setAbilityFilteredIds(new Set(d.pokemon.map(p => {
        const parts = p.pokemon.url.split("/").filter(Boolean); return Number(parts[parts.length - 1]);
      })));
    } catch (e) { console.error(e); }
    setAbilityLoading(false);
  }

  useEffect(() => {
    if (!hideLegendary) { setLegendaryIds(null); return; }
    if (legendaryIds) return;
    setLegendaryIds(new Set([
      144, 145, 146, 150, 151, 243, 244, 245, 249, 250, 251, 377, 378, 379, 380, 381, 382, 383, 384, 385, 386,
      479, 480, 481, 482, 483, 484, 485, 486, 487, 488, 489, 490, 491, 492, 493, 494,
      638, 639, 640, 641, 642, 643, 644, 645, 646, 647, 648, 649,
      716, 717, 718, 719, 720, 721,
      772, 773, 785, 786, 787, 788, 789, 790, 791, 792, 793, 794, 795, 796, 797, 798, 799, 800, 801, 802, 807, 808, 809,
      888, 889, 890, 891, 892, 893, 894, 895, 896, 897, 898,
      905, 1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008, 1009, 1010,
    ]));
  }, [hideLegendary]);

  const activeGroup = useMemo(() => GAME_GROUPS.find(g => g.id === filterGame) || null, [filterGame]);
  const activeGenIds = useMemo(() => activeGroup ? new Set(activeGroup.genIds) : null, [activeGroup]);

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
  const applySecondaryFilters = useCallback((list) => {
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
  }, [filterGen, search, filterType, typeFilteredIds, moveFilteredIds, abilityFilteredIds,
    hideLegendary, legendaryIds, filterStage, filterVersion, activeGroup, exclusiveNameSets]);

  // gameDexSections — seções do gamedex pra jogos específicos
  const gameDexSections = useMemo(() => {
    if (filterGame === "all") return null;
    const sections = GAME_DEX[filterGame];
    if (!sections) return null;
    return sections.map(section => ({
      name: section.name,
      pokemon: applySecondaryFilters(
        section.pokemon
          .map(entry => {
            // entry pode ser:
            //   "ninetales"  → Pokémon normal
            //   { name: "ninetales-alola", base: "ninetales" }
            //     → forma regional: usa o sprite da forma mas o URL do base pra adicionar ao time
            //       o campo base aponta pro Pokémon canônico que existe no pokemonList
            if (typeof entry === "string") {
              return pokemonList.find(p => p.name === entry) || null;
            }
            // objeto com forma regional
            const baseEntry = pokemonList.find(p => p.name === entry.base);
            if (!baseEntry) return null;
            // ID da forma: extraído do slug via mapeamento simples
            // O sprite da forma fica em sprites/pokemon/{id}.png onde id > 10000
            // Mas como não temos o ID sem fetch, usamos a URL da PokeAPI pra montar
            const formUrl = `https://pokeapi.co/api/v2/pokemon/${entry.name}/`;
            // Sprite: tentamos montar via slug conhecido
            // PokeAPI sprites para formas: github/PokeAPI/sprites/pokemon/other/official-artwork/
            // Mais simples: montar URL de fetch igual ao base mas com nome diferente
            return {
              ...baseEntry,
              name: entry.name,
              // sprite temporário — será atualizado no addPokemon via fetch
              sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${entry.spriteId || baseEntry.id}.png`,
              url: formUrl,
              displayName: entry.display || entry.name,
            };
          })
          .filter(Boolean)
      ),
    })).filter(s => s.pokemon.length > 0);
  }, [filterGame, pokemonList, applySecondaryFilters]);

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
  }, [filterGame, filterGen, pokemonList, applySecondaryFilters]);

  async function addPokemon(pokemon) {
    setRecentlyAdded(pokemon.name);
    setTimeout(() => setRecentlyAdded(null), 400);

    if (detailsPokemon !== -1) setDetailsPokemon(-1);
    const firstEmpty = team.findIndex(s => s === null);
    if (firstEmpty === -1) return;

    // Usa cache pra evitar re-fetch do mesmo Pokémon
    if (!POKEMON_CACHE[pokemon.url]) {
      const r = await fetch(pokemon.url);
      POKEMON_CACHE[pokemon.url] = await r.json();
    }
    const d = POKEMON_CACHE[pokemon.url];

    const t = [...team];
    t[firstEmpty] = {
      id: d.id,
      name: d.name.charAt(0).toUpperCase() + d.name.slice(1),
      sprite: d.sprites.front_default,
      shinySprite: d.sprites.front_shiny,
      isShiny: false,
      selectedNature: "",
      types: applyPreFairyTypes(d.name, d.types.map(x => x.type.name), activeGroup),
      abilities: d.abilities.map(a => a.ability.name),
      selectedAbility: d.abilities[0]?.ability?.name ?? "",
      stats: d.stats, moves: d.moves, selectedMoves: [],
      baseFormName: d.name, isBaseForm: true,
      hiddenAbilities: new Set(
        d.abilities.filter(a => a.is_hidden).map(a => a.ability.name)
      ),
    };
    setTeam(t);
  }

  function removePokemon(index) {
    const t = [...team]; t[index] = null; setTeam(t); setDetailsPokemon(-1);
  }
  function clearTeam() {
    setTeam(Array(6).fill(null)); setDetailsPokemon(-1); setShowAnalysis(false);
  }
  function startGame(id) { setFilterGame(id); setStarted(true); window.scrollTo(0, 0); }
  function clearFilters() {
    setSearch(""); setFilterType("all"); setFilterGen("all");
    setFilterStage("all"); setHideLegendary(false); setFilterVersion("all");
    setSelectedMove(null); setMoveFilteredIds(null); setMoveSearchResults([]);
    setSelectedAbilityFilter(null); setAbilityFilteredIds(null); setAbilitySearchResults([]);
  }

  // ── Setup screen ──────────────────────────────────────────────────────────
  if (!started) {
    return (
      <SetupScreen onStart={startGame} dark={dark} setDark={setDark} />
    );
  }

  const hasTeam = team.some(Boolean);

  // Decide qual lista de seções usar no render
  const sectionsToRender = gameDexSections ?? allGamesSections;

  // ── Builder ───────────────────────────────────────────────────────────────
  return (
    <div className="builder" onClick={handleOverlayClick}>

      {/* Modal de confirmação de troca de jogo */}
      {pendingGame !== null && (
        <div onClick={e => e.stopPropagation()} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
        }}>
          <div style={{
            background: "var(--card)", borderRadius: 16, padding: "28px 28px 24px",
            width: 320, boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
            display: "flex", flexDirection: "column", gap: 12,
          }}>
            <p style={{ margin: 0, fontWeight: "bold", fontSize: 15 }}>Trocar de jogo?</p>
            <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>
              Trocar o jogo vai limpar seu time atual. Tem certeza?
            </p>
            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <button className="action-btn danger" style={{ flex: 1 }} onClick={() => {
                setFilterGame(pendingGame); setFilterGen("all");
                clearTeam(); setPendingGame(null);
              }}>
                Sim, trocar
              </button>
              <button className="action-btn" style={{ flex: 1 }} onClick={() => setPendingGame(null)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="builder-header">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button className="action-btn" onClick={e => { e.stopPropagation(); setStarted(false); clearTeam(); window.scrollTo(0, 0); }}>
            ←
          </button>
          <h1 style={{ margin: 0 }}>Seu Time</h1>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {hasTeam && <>

            <button
              className="action-btn danger"
              onClick={e => {
                e.stopPropagation();
                clearTeam();
                showToast("✓ Time limpo com sucesso");
              }}

            >
              🗑 Limpar time
            </button>

            <button
              className="action-btn"
              onClick={e => {
                e.stopPropagation();

                const showdown = exportShowdown(team);

                navigator.clipboard.writeText(showdown);

                showToast("✓ Time copiado para a área de transferência");
              }}
            >
              ↱ Exportar time
            </button>

            <button className={`action-btn ${showAnalysis ? "active" : ""}`}
              onClick={e => { e.stopPropagation(); setShowAnalysis(v => !v); }}>
              📊 {showAnalysis ? "Ocultar" : "Análise do time"}
            </button>

          </>}
          <button className="action-btn" onClick={e => { e.stopPropagation(); setDark(v => !v); }}
            title={dark ? "Modo claro" : "Modo escuro"}>
            {dark ? "☀️" : "🌙"}
          </button>
        </div>
      </div>

      <div className={`team-container${stickyTeam ? " team-container--sticky" : ""}`}
        style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 20 }}
        onClick={e => e.stopPropagation()}>
        {team.map((pokemon, index) => {
          const dimmed = highlightSlots !== null && pokemon && !highlightSlots.has(index);
          return (
            <div key={index} style={{ transition: "opacity 0.2s", opacity: dimmed ? 0.2 : 1 }}>
              <TeamSlot pokemon={pokemon} index={index}
                team={team} setTeam={setTeam}
                detailsPokemon={detailsPokemon} setDetailsPokemon={setDetailsPokemon}
                removePokemon={removePokemon} filterGame={filterGame}
                panelLeft={index >= 3} />
            </div>
          );
        })}
      </div>

      {/* Sentinel invisível — fica logo ABAIXO do time.
          Quando sai da viewport (scrollou pra baixo), ativa o sticky. */}
      <div ref={teamSentinelRef} style={{ height: 1 }} />

      {/* ── Golpes do time — fora do sticky, entre o time e a pokédex ── */}
      {hasTeam && (
        <div className="team-moves-row" onClick={e => e.stopPropagation()}>
          {team.map((pokemon, index) => (
            <TeamMoveCard key={index} pokemon={pokemon} />
          ))}
        </div>
      )}

      {showAnalysis && hasTeam && (
        <div onClick={e => e.stopPropagation()}>
          <TeamAnalysis team={team} onHover={setHighlightSlots} />
        </div>
      )}

      <div className="pokemon-header" onClick={e => e.stopPropagation()}>
        <h2 style={{ margin: 0 }}>Pokémon Disponíveis</h2>
        <div className="filters">

          <input type="text" placeholder="Buscar por nome..."
            value={search} onChange={e => setSearch(e.target.value)} />

          {/* Filtro de jogo */}
          <select value={filterGame} onChange={e => {
            const next = e.target.value;
            if (hasTeam) { setPendingGame(next); }
            else { setFilterGame(next); setFilterGen("all"); }
          }}>
            <option value="all">Todos os jogos</option>
            {GAME_GROUPS.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>

          {/* Filtro de exclusivos — só aparece se o jogo tiver exclusivos */}
          <select value={filterVersion}
            disabled={!activeGroup?.exclusives}
            onChange={e => setFilterVersion(e.target.value)}
            style={{ opacity: activeGroup?.exclusives ? 1 : 0.4 }}>
            <option value="all">{!activeGroup?.exclusives ? "Sem exclusividades" : "Todos os Pokémon"}</option>
            {activeGroup?.exclusives && <>
              <option value="a">Exclusivo {activeGroup.exclusives.a}</option>
              <option value="b">Exclusivo {activeGroup.exclusives.b}</option>
            </>}
          </select>

          {/* Filtro de geração — entre exclusivos e tipo */}
          <select value={filterGen} onChange={e => setFilterGen(e.target.value)}>
            <option value="all">Todas as gerações</option>
            {ALL_GAMES_SECTIONS.map(s => (
              <option key={s.genId} value={s.genId}>Gen {s.genId} — {s.name}</option>
            ))}
          </select>

          {/* Filtro de tipo */}
          <select value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="all">Todos os tipos</option>
            {[...ALL_TYPES].sort((a, b) => a.localeCompare(b)).map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
          </select>

          {/* Filtro de estágio */}
          <select value={filterStage} onChange={e => setFilterStage(e.target.value)}>
            <option value="all">Todos os estágios</option>
            <option value="final">Estágio final</option>
            <option value="2">2º estágio</option>
            <option value="1">1º estágio</option>
          </select>

          <SearchableDropdown placeholder="Filtrar por golpe…"
            onSearch={searchMoves} results={moveSearchResults}
            onSelect={selectMove} loading={moveLoading}
            selectedName={selectedMove?.name || null} />

          <SearchableDropdown placeholder="Filtrar por habilidade…"
            onSearch={searchAbilities} results={abilitySearchResults}
            onSelect={selectAbility} loading={abilityLoading}
            selectedName={selectedAbilityFilter?.name || null} />

          <label style={{
            display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer",
            background: "var(--card)", padding: "7px 12px", borderRadius: 8, border: "1px solid var(--border)", whiteSpace: "nowrap"
          }}>
            <input type="checkbox" checked={hideLegendary}
              onChange={e => setHideLegendary(e.target.checked)} />
            Ocultar lendários
          </label>

          <button title="Limpar filtros" onClick={e => { e.stopPropagation(); clearFilters(); }}
            style={{
              padding: "7px 11px", border: "1px solid var(--border)", borderRadius: 8, background: "var(--card)",
              cursor: "pointer", fontSize: 15, lineHeight: 1, transition: "background 0.15s", color: "var(--text)"
            }}
            onMouseEnter={e => e.currentTarget.style.background = "var(--hover)"}
            onMouseLeave={e => e.currentTarget.style.background = "var(--card)"}>
            ↺
          </button>
        </div>
      </div>

      {loading && (
        <div className="loading-bar" onClick={e => e.stopPropagation()}>
          <div className="loading-bar-fill" />
          <span>Carregando Pokémon...</span>
        </div>
      )}

      {/* Lista de Pokémon — sempre em seções */}
      <div onClick={e => e.stopPropagation()}>
        {sectionsToRender && sectionsToRender.length === 0 ? (
          <p style={{ color: "#888", fontSize: 14 }}>Nenhum Pokémon encontrado com esses filtros.</p>
        ) : sectionsToRender ? (
          sectionsToRender.map(section => (
            <div key={section.name} style={{ marginBottom: 32 }}>
              <h3 className="section-heading">
                {section.name}
                <span className="section-count">{section.pokemon.length} Pokémon</span>
              </h3>
              <div className="pokemon-list">
                {section.pokemon.map(pokemon => (
                  <div
                    key={pokemon.id + pokemon.name}
                    className={`pokemon-card ${recentlyAdded === pokemon.name ? "pokemon-added" : ""
                      }`}
                    data-name={formatName(pokemon.displayName || pokemon.name)}
                    onClick={() => addPokemon(pokemon)}
                  >
                    <img
                      src={pokemon.sprite}
                      alt={pokemon.name}
                      className="pokemon-list-sprite"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : null}
      </div>
      {toast && (
        <div className="toast">
          {toast}
        </div>
      )}

      <Footer />

    </div>
  );
}

// ── Dados visuais da tela de setup ───────────────────────────────────────────
// IDs batem exatamente com GAME_GROUPS em generations.js
// Jogos com `subs` exibem botões de versão ao clicar no card
const SETUP_GENS = [
  {
    label: "Geração I",
    games: [
      { id: "rby", name: "Red / Blue / Yellow", sprite: 25 },
    ],
  },
  {
    label: "Geração II",
    games: [
      { id: "gsc", name: "Gold / Silver / Crystal", sprite: 245 },
    ],
  },
  {
    label: "Geração III",
    games: [
      { id: "rse", name: "Ruby / Sapphire / Emerald", sprite: 384 },
      { id: "frlg", name: "FireRed / LeafGreen", sprite: 6 },
    ],
  },
  {
    label: "Geração IV",
    games: [
      { id: "dpp", name: "Diamond / Pearl / Platinum", sprite: 487 },
      { id: "hgss", name: "HeartGold / SoulSilver", sprite: 250 },
    ],
  },
  {
    label: "Geração V",
    games: [
      { id: "bw", name: "Black / White", sprite: 643 },
      { id: "bw2", name: "Black 2 / White 2", sprite: 10023 },
    ],
  },
  {
    label: "Geração VI",
    games: [
      { id: "xy", name: "X / Y", sprite: 10075 },
      { id: "oras", name: "Omega Ruby / Alpha Sapphire", sprite: 10078 },
    ],
  },
  {
    label: "Geração VII",
    games: [
      { id: "sm", name: "Sun / Moon", sprite: 791 },
      { id: "usum", name: "Ultra Sun / Moon", sprite: 10156 },
      { id: "letsgo", name: "Let's Go", sprite: 151 },
    ],
  },
  {
    label: "Geração VIII",
    games: [
      { id: "swsh", name: "Sword / Shield", sprite: 890 },
      { id: "bdsp", name: "Brilliant Diamond \n Shining Pearl", sprite: 483 },
      { id: "la", name: "Legends: Arceus", sprite: 493 },
    ],
  },
  {
    label: "Geração IX",
    games: [
      { id: "sv", name: "Scarlet / Violet", sprite: 1007 },
      { id: "za", name: "Legends: Z-A", sprite: 718 },
    ],
  },
];

function SetupScreen({ onStart, dark, setDark }) {
  function select(id) {
    onStart(id);
  }

  return (
    <div className="setup-screen">
      {/* Botão dark mode — canto superior direito */}
      <button
        className="action-btn"
        onClick={() => setDark(v => !v)}
        title={dark ? "Modo claro" : "Modo escuro"}
        style={{ position: "fixed", top: 16, right: 16 }}
      >
        {dark ? "☀️" : "🌙"}
      </button>
      <h1
        style={{
          margin: "0 0 0px",
          fontSize: 22,
          fontWeight: 600,
          marginTop: 20,
          lineHeight: 1.1,
        }}
      >
        Pokémon Team Builder - By Moon ☾
      </h1>

      <p
        style={{
          margin: 0,
          fontSize: 16,
          color: "#888",
          lineHeight: 1.2,
        }}
      >
        Seja bem-vindo! Escolha um jogo e comece a planejar seu time! - V1.0
      </p>
      

      {/* Todos os jogos */}
      <div
        onClick={() => select("all")}
        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
        style={{
          background: "var(--card)",
          borderRadius: 12,
          border: "1px solid var(--border)",
          padding: "16px 14px",
          cursor: "pointer",
          position: "relative",
          overflow: "hidden",
          minHeight: 100,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          maxWidth: 640,
          width: "100%",
          boxSizing: "border-box",
          transition: "transform 0.1s",
          marginTop: 10,
        }}
      >
        <span style={{ fontSize: 16, fontWeight: 600, position: "relative", zIndex: 1 }}>
          Todos os jogos
        </span>
        <span style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4, position: "relative", zIndex: 1 }}>
          Sem restrição de geração
        </span>
        <img
          src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10147.png"
          alt=""
          style={{
            position: "absolute", right: -18, bottom: 0,
            width: 100, height: 100, objectFit: "contain",
            imageRendering: "pixelated", pointerEvents: "none",
          }}
        />
      </div>

      {/* Grid por geração */}
      <div style={{ maxWidth: 640, width: "100%" }}>
        {SETUP_GENS.map(gen => (
          <div key={gen.label} style={{ marginBottom: 10 }}>
            <div style={{
              fontSize: 10, fontWeight: 500, color: "var(--text-muted)",
              textTransform: "uppercase", letterSpacing: "0.6px",
              marginBottom: 5, marginLeft: 2,
            }}>
              {gen.label}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              {gen.games.map(game => {
                const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${game.sprite}.png`;
                return (
                  <div
                    key={game.id}
                    onClick={() => select(game.id)}
                    onMouseEnter={e => e.currentTarget.style.transform = "scale(1.03)"}
                    onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                    style={{
                      flex: 1, background: "var(--card)", borderRadius: 12,
                      border: "1px solid var(--border)", padding: "12px 10px 10px",
                      cursor: "pointer", position: "relative", overflow: "hidden",
                      minHeight: 100, display: "flex", flexDirection: "column",
                      justifyContent: "center", gap: 3, boxSizing: "border-box", transition: "transform 0.1s",
                    }}
                  >
                    <span style={{
                      whiteSpace: "pre-line", fontSize: 13, fontWeight: 600,
                      lineHeight: 1.3, position: "relative", zIndex: 1,
                    }}>
                      {game.name}
                    </span>
                    <img src={spriteUrl} alt=""
                      style={{
                        position: "absolute", right: -18, bottom: -6,
                        width: 100, height: 100, objectFit: "contain",
                        opacity: 1, pointerEvents: "none",
                        imageRendering: "pixelated",
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
    
      <Footer />

      </div>
    </div>
  );

}
