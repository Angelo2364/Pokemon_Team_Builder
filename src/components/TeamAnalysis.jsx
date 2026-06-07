import { ALL_TYPES, TYPE_COLORS, DARK_TEXT_TYPES, TYPE_CHART } from "../data/generations";
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

export default function TeamAnalysis({ team }) {
  const active = team.filter(Boolean);
  if (!active.length) return null;

  // Per-type weak/resist/immune counts
  const summary = {};
  ALL_TYPES.forEach(atk => {
    let weak=0, resist=0, immune=0;
    active.forEach(p => {
      const m = computeWeaknesses(p.types);
      const v = m[atk] ?? 1;
      if (v===0) immune++;
      else if (v>=2) weak++;
      else if (v<=0.5) resist++;
    });
    summary[atk] = { weak, resist, immune };
  });

  // STAB coverage computed inline below

  // Gaps: types that hit 2+ members while no member has that type to resist
  const weaknesses = ALL_TYPES.filter(t=>summary[t].weak>0)
    .sort((a,b)=>summary[b].weak-summary[a].weak);
  const strengths = ALL_TYPES.filter(t=>summary[t].resist+summary[t].immune>0)
    .sort((a,b)=>(summary[b].resist+summary[b].immune)-(summary[a].resist+summary[a].immune));
  const gaps = ALL_TYPES.filter(t=>{
    const coverageTypes = active.flatMap(p=>p.types);
    return !coverageTypes.includes(t) && summary[t].weak>=2;
  });

  const Cell = ({ type, count, mode }) => {
    const bg = TYPE_COLORS[type]||"#888";
    const txtColor = DARK_TEXT_TYPES.has(type)?"#333":"#fff";
    const opacity = count>=4?1:count>=3?0.85:count>=2?0.7:0.5;
    return (
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
        <span style={{background:bg,color:txtColor,opacity,
          padding:"3px 8px",borderRadius:6,fontSize:11,fontWeight:"bold",
          textTransform:"capitalize",minWidth:58,textAlign:"center",display:"block"}}>
          {type}
        </span>
        <span style={{fontSize:12,fontWeight:"bold",
          color:mode==="weak"?"#c0392b":"#27ae60"}}>
          {mode==="weak"?`×${count}`:`${count}✓`}
        </span>
      </div>
    );
  };

  return (
    <div className="team-analysis">
      <h2>Análise do Time</h2>

      {/* STAB */}
      <div className="analysis-section" style={{marginBottom:20}}>
        <h3>⚡ Cobertura ofensiva STAB do time</h3>
        <p className="analysis-hint">Tipos que o time bate com super-efetividade via STAB</p>
        {(() => {
          const teamSTAB = [...new Set(active.flatMap(p=>p.types))];
          const covered = teamSTABCoverage(teamSTAB);
          const missing = ALL_TYPES.filter(t => !covered.has(t));
          return (
            <>
              <div className="analysis-types">
                {[...covered].sort().map(t=>(
                  <span key={t} className={`type-badge ${t}`}>{t}</span>
                ))}
                {!covered.size && <p style={{fontSize:13,color:"#888"}}>Nenhuma.</p>}
              </div>
              {missing.length > 0 && (
                <div style={{marginTop:10}}>
                  <p className="analysis-hint" style={{marginBottom:6}}>Tipos sem cobertura super-efetiva:</p>
                  <div className="analysis-types" style={{opacity:0.45}}>
                    {missing.map(t=><span key={t} className={`type-badge ${t}`}>{t}</span>)}
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
            {weaknesses.map(t=><Cell key={t} type={t} count={summary[t].weak} mode="weak"/>)}
            {!weaknesses.length&&<p style={{fontSize:13,color:"#888"}}>Nenhuma!</p>}
          </div>
        </div>
        <div className="analysis-section">
          <h3>🛡 Resistências do time</h3>
          <p className="analysis-hint">Quantos membros resistem a cada tipo</p>
          <div className="analysis-types">
            {strengths.map(t=><Cell key={t} type={t} count={summary[t].resist+summary[t].immune} mode="resist"/>)}
            {!strengths.length&&<p style={{fontSize:13,color:"#888"}}>Nenhuma.</p>}
          </div>
        </div>
      </div>

      {gaps.length>0&&(
        <div className="analysis-section analysis-gaps" style={{marginTop:16,borderTop:"1px solid #eee",paddingTop:16}}>
          <h3>🔴 Lacunas de cobertura</h3>
          <p className="analysis-hint">Tipos que batem em ≥2 membros sem resistência no time</p>
          <div className="analysis-types">
            {gaps.map(t=><span key={t} className={`type-badge ${t}`}>{t}</span>)}
          </div>
        </div>
      )}
    </div>
  );
}
