import { useState } from "react";
import { TYPE_COLORS } from "../data/generations";

function formatName(name) {
  return name.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }) +
    " " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function TeamPreview({ team }) {
  const active = team.filter(Boolean);
  if (!active.length) return <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Time vazio.</p>;

  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {active.map((p, i) => {
        const typeColors = (p.types || []).map(t => TYPE_COLORS[t] || "#ccc");
        const bg = typeColors.length >= 2
          ? `linear-gradient(to right, ${typeColors[0]} 50%, ${typeColors[1]} 50%)`
          : (typeColors[0] || "#ccc");

        return (
          <div key={i} style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
            background: "var(--card)", borderRadius: 10, padding: "6px 8px",
            border: "2px solid transparent",
            backgroundClip: "padding-box",
            outline: `2px solid ${typeColors[0] || "#ccc"}`,
            outlineOffset: 1,
            minWidth: 64,
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 8, overflow: "hidden",
              background: bg, display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <img
                src={p.isShiny ? p.shinySprite : p.sprite}
                alt={p.name}
                style={{ width: 48, height: 48, imageRendering: "pixelated", objectFit: "contain" }}
              />
            </div>
            <span style={{ fontSize: 10, fontWeight: 600, textAlign: "center", color: "var(--text)" }}>
              {formatName(p.name)}
            </span>
            <div style={{ display: "flex", gap: 2, flexWrap: "wrap", justifyContent: "center" }}>
              {(p.types || []).map(t => (
                <span key={t} style={{
                  background: TYPE_COLORS[t] || "#888",
                  color: "#fff", fontSize: 8, fontWeight: "bold",
                  padding: "1px 4px", borderRadius: 3, letterSpacing: 0.3,
                }}>
                  {t.slice(0, 3).toUpperCase()}
                </span>
              ))}
            </div>
            {p.selectedMoves?.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 1, marginTop: 2, width: "100%" }}>
                {p.selectedMoves.map((m, mi) => (
                  <span key={mi} style={{
                    fontSize: 8, color: "var(--text-muted)", textAlign: "center",
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    maxWidth: 64,
                  }}>
                    {m.replace(/-/g, " ")}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function SavedTeamsScreen({ savedTeams, onLoad, onDelete, onBack }) {
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmLoad, setConfirmLoad] = useState(null);

  function handleDelete(id) {
    if (confirmDelete === id) {
      onDelete(id);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(id);
    }
  }

  function handleLoad(id) {
    if (confirmLoad === id) {
      onLoad(id);
    } else {
      setConfirmLoad(id);
    }
  }

  return (
    <div style={{
      maxWidth: 760, margin: "0 auto", padding: "24px 16px",
      display: "flex", flexDirection: "column", gap: 20,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button className="action-btn" onClick={onBack}>←</button>
        <h1 style={{ margin: 0, fontSize: 20 }}>📂 Times Salvos</h1>
        <span style={{ fontSize: 13, color: "var(--text-muted)", marginLeft: "auto" }}>
          {savedTeams.length} {savedTeams.length === 1 ? "time" : "times"}
        </span>
      </div>

      {savedTeams.length === 0 && (
        <div style={{
          textAlign: "center", padding: "60px 20px",
          color: "var(--text-muted)", fontSize: 14,
        }}>
          <p style={{ fontSize: 32, margin: "0 0 12px" }}>📭</p>
          <p style={{ margin: 0 }}>Nenhum time salvo ainda.</p>
          <p style={{ margin: "4px 0 0", fontSize: 12 }}>
            Monte um time e clique em 💾 Salvar time.
          </p>
        </div>
      )}

      {savedTeams.map(entry => (
        <div key={entry.id} style={{
          background: "var(--card)", border: "1px solid var(--border)",
          borderRadius: 14, padding: "16px 18px",
          display: "flex", flexDirection: "column", gap: 12,
        }}>
          {/* Header do time */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
            <div style={{ flex: 1 }}>
              <span style={{ fontWeight: 700, fontSize: 15 }}>{entry.name}</span>
              <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: 8 }}>
                {formatDate(entry.savedAt)}
              </span>
              {entry.filterGame && entry.filterGame !== "all" && (
                <span style={{
                  fontSize: 10, fontWeight: "bold", padding: "2px 6px",
                  borderRadius: 5, background: "var(--card2)",
                  border: "1px solid var(--border)", color: "var(--text-muted)",
                  marginLeft: 4,
                }}>
                  🎮 {entry.filterGame}
                </span>
              )}
            </div>

            {/* Botão carregar */}
            {confirmLoad === entry.id ? (
              <div style={{ display: "flex", gap: 6 }}>
                <span style={{ fontSize: 12, color: "var(--text-muted)", alignSelf: "center" }}>
                  Substituir time atual?
                </span>
                <button
                  className="action-btn"
                  style={{ background: "#27ae60", color: "#fff", borderColor: "#27ae60" }}
                  onClick={() => { handleLoad(entry.id); setConfirmLoad(null); }}
                >
                  Sim
                </button>
                <button className="action-btn" onClick={() => setConfirmLoad(null)}>
                  Não
                </button>
              </div>
            ) : (
              <button className="action-btn" onClick={() => handleLoad(entry.id)}>
                ↩ Carregar
              </button>
            )}

            {/* Botão deletar */}
            {confirmDelete === entry.id ? (
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  className="action-btn danger"
                  onClick={() => handleDelete(entry.id)}
                >
                  Confirmar
                </button>
                <button className="action-btn" onClick={() => setConfirmDelete(null)}>
                  Cancelar
                </button>
              </div>
            ) : (
              <button className="action-btn danger" onClick={() => handleDelete(entry.id)}>
                🗑
              </button>
            )}
          </div>

          {/* Preview do time */}
          <TeamPreview team={entry.team} />
        </div>
      ))}
    </div>
  );
}
