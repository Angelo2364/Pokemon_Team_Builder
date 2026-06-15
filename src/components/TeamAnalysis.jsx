import { useState } from "react";
import { ALL_TYPES, TYPE_COLORS, TYPE_CHART } from "../data/generations";
import { computeWeaknesses } from "./TeamSlot";

// Which types does a set of STAB types hit super-effectively?
function teamSTABCoverage(allTypes) {
  const covered = new Set();
  allTypes.forEach(atk => {
    ALL_TYPES.forEach(def => {
      const c = TYPE_CHART[def];
      if (!c) return;
      let mult = 1;
      if (c.immuneTo.includes(atk)) mult = 0;
      else if (c.weakTo.includes(atk)) mult = 2;
      else if (c.resistantTo.includes(atk)) mult = 0.5;
      if (mult === 2) covered.add(def);
    });
  });
  return covered;
}

export default function TeamAnalysis({ team, onHover }) {
  const active = team.filter(Boolean);
  if (!active.length) return null;

  // Mapeia índice do array `active` → índice real no `team` (que contém nulls)
  // Isso é necessário porque o onHover espera índices do team original
  const activeToTeamIdx = active.map((p) => team.indexOf(p));

  // Per-type weak/resist/immune counts + which pokemon indices contribute
  const summary = {};
  ALL_TYPES.forEach(atk => {
    let weak = 0, resist = 0, immune = 0;
    const weakIdx = [], resistIdx = [];
    active.forEach((p, i) => {
      const m = computeWeaknesses(p.types);
      const v = m[atk] ?? 1;
      if (v === 0) { immune++; resistIdx.push(activeToTeamIdx[i]); }
      else if (v >= 2) { weak++; weakIdx.push(activeToTeamIdx[i]); }
      else if (v <= 0.5) { resist++; resistIdx.push(activeToTeamIdx[i]); }
    });
    summary[atk] = { weak, resist, immune, weakIdx, resistIdx };
  });

  // Para cada tipo defensivo, quais membros do time cobrem com STAB?
  // stabCoverageIdx[defType] = Set de índices do team que batem SE naquele tipo
  const stabCoverageIdx = {};
  ALL_TYPES.forEach(def => {
    const idxSet = new Set();
    active.forEach((p, i) => {
      p.types.forEach(atk => {
        const c = TYPE_CHART[def];
        if (!c) return;
        if (c.weakTo.includes(atk)) idxSet.add(activeToTeamIdx[i]);
      });
    });
    stabCoverageIdx[def] = idxSet;
  });

  // Gaps: types that hit 2+ members while no member has that type to resist
  const weaknesses = ALL_TYPES.filter(t => summary[t].weak > 0)
    .sort((a, b) => summary[b].weak - summary[a].weak);
  const strengths = ALL_TYPES.filter(t => summary[t].resist + summary[t].immune > 0)
    .sort((a, b) => (summary[b].resist + summary[b].immune) - (summary[a].resist + summary[a].immune));

  const weaknessMessages = {
    ghost: "👻 Seu time LITERALMENTE tem medo de fantasmas.",
    fighting: "🥊 Eu, faixa verde em Karatê, DESTRUO teu time.",
    ground: "🌎 Kkkkk teu time come terra.",
    ice: "🧊 Seu time não sobreviveria a uma viagem para Sinnoh.",
    water: "💧 Olha a onda, olha a onda.",
    fire: "🔥 Teu time não aguenta 5 minutinhos no Nether.",
    flying: "🌪️ Ala, teu time tem medo de ventinho.",
    dragon: "🐉 O Burro do Shrek desenrola com dragões melhor que você.",
    grass: "🌿 O Shorty de Todo Mundo em Pânico acaba com seu time.",
    fairy: "🌈 Uui, tem medo de fadinha é?",
    steel: "⚙️ Você tá FERRADO, entendeu?? Ferro...",
    dark: "🌑 Para, ninguém tem fraqueza a Dark, esse texto nunca vai ser lido...",
    psychic: "🔮 Uuuu eu dobro colheres e derroto seu time.",
    electric: "⚡ Seu time toma choque de carregador de celular, parabéns.",
    bug: "🐛 Não, fraqueza a inseto não, sai do meu site.",
    rock: "🪨 Uma pedrada resolve mais problemas do que deveria.",
    poison: "☠️ Eu entendo, eu também nunca lembro que poison bate tanto assim...",
  };
  const teamWarnings = ALL_TYPES.filter(
    t => summary[t].weak >= 4 && weaknessMessages[t]
  );
  const gaps = ALL_TYPES.filter(t => {
    const coverageTypes = active.flatMap(p => p.types);
    return !coverageTypes.includes(t) && summary[t].weak >= 2;
  });

  const Cell = ({ type, count, mode }) => {
    const bg = TYPE_COLORS[type] || "#888";
    const indices = mode === "weak" ? summary[type].weakIdx : summary[type].resistIdx;
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, cursor: "default" }}
        onMouseEnter={() => onHover && onHover(new Set(indices))}
        onMouseLeave={() => onHover && onHover(null)}>
        <span
          className="type-badge"
          style={{
            background: bg,
            minWidth: 58,
            textAlign: "center",
            display: "block",
          }}
        >
          {type}
        </span>
        <span style={{ fontSize: 12, fontWeight: "bold", color: mode === "weak" ? "#c0392b" : "#27ae60" }}>
          {mode === "weak" ? `×${count}` : `${count}✓`}
        </span>
      </div>
    );
  };

  // Célula de cobertura STAB — com contador e ordenação
  const STABCell = ({ type }) => {
    const bg = TYPE_COLORS[type] || "#888";
    const count = stabCoverageIdx[type]?.size ?? 0;
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, cursor: "default" }}
        onMouseEnter={() => onHover && onHover(stabCoverageIdx[type])}
        onMouseLeave={() => onHover && onHover(null)}>
        <span
          className="type-badge"
          style={{
            background: bg,
            minWidth: 58,
            textAlign: "center",
            display: "block",
          }}
        >
          {type}
        </span>
        <span style={{ fontSize: 12, fontWeight: "bold", color: "#2980b9" }}>
          {count}✦
        </span>
      </div>
    );
  };

  return (
    <div className="team-analysis" onMouseLeave={() => onHover && onHover(null)}>
      <h2 style={{ marginBottom: 4 }}>
        Análise do Time
      </h2>

      <p style={{ fontSize: 16, color: "var(--text-muted)", marginTop: 0 }}>
        Passe o mouse sobre um tipo para mais detalhes.
      </p>

      {/* STAB */}
      <div className="analysis-section" style={{ marginBottom: 20, marginTop: 20 }}>
        <h3>⚡ Cobertura ofensiva STAB do time</h3>
        <p className="analysis-hint">Tipos que o time bate com super-efetividade via STAB</p>
        {(() => {
          const teamSTAB = [...new Set(active.flatMap(p => p.types))];
          const covered = teamSTABCoverage(teamSTAB);
          const missing = ALL_TYPES.filter(t => !covered.has(t));
          const coveredSorted = [...covered].sort((a, b) =>
            (stabCoverageIdx[b]?.size ?? 0) - (stabCoverageIdx[a]?.size ?? 0)
          );
          return (
            <>
              <div className="analysis-types">
                {coveredSorted.map(t => <STABCell key={t} type={t} />)}
                {!covered.size && <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Nenhuma.</p>}
              </div>
              {missing.length > 0 && (
                <div style={{ marginTop: 10 }}>
                  <p className="analysis-hint" style={{ marginBottom: 6 }}>Tipos sem cobertura super-efetiva:</p>
                  <div className="analysis-types" style={{ opacity: 0.45 }}>
                    {missing.map(t => <span key={t} className={`type-badge ${t}`}>{t}</span>)}
                  </div>
                </div>
              )}
            </>
          );
        })()}
      </div>

      <div className="analysis-grid">
        <div className="analysis-section">
          <h3>⚠ Fraquezas do time</h3>
          <p className="analysis-hint">Quantos membros são fracos a cada tipo</p>
          <div className="analysis-types">
            {weaknesses.map(t => <Cell key={t} type={t} count={summary[t].weak} mode="weak" />)}
            {!weaknesses.length && <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Nenhuma!</p>}
          </div>
        </div>
        <div className="analysis-section">
          <h3>🛡 Resistências do time</h3>
          <p className="analysis-hint">Quantos membros resistem a cada tipo</p>
          <div className="analysis-types">
            {strengths.map(t => <Cell key={t} type={t} count={summary[t].resist + summary[t].immune} mode="resist" />)}
            {!strengths.length && <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Nenhuma.</p>}
          </div>
        </div>
      </div>

      {teamWarnings.length > 0 && (
        <div className="analysis-gaps" style={{ marginTop: 8 }}>
          <h3>💀 Conselhos de amigo</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
            {teamWarnings.map(t => (
              <p key={t} style={{ margin: 0, fontSize: 13, color: "var(--text-muted)" }}>
                {weaknessMessages[t]}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
