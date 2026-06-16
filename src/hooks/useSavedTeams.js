import { useState, useCallback } from "react";

const STORAGE_KEY = "pokemon_saved_teams";

function loadTeams() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persistTeams(teams) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(teams));
  } catch {
    console.error("Erro ao salvar times no localStorage.");
  }
}

// Campos do pokemon que precisam ser serializados
// hiddenAbilities é um Set — precisa virar array pra JSON
function serializePokemon(p) {
  if (!p) return null;
  return {
    ...p,
    hiddenAbilities: p.hiddenAbilities ? [...p.hiddenAbilities] : [],
  };
}

function deserializePokemon(p) {
  if (!p) return null;
  return {
    ...p,
    hiddenAbilities: new Set(p.hiddenAbilities || []),
  };
}

export default function useSavedTeams() {
  const [savedTeams, setSavedTeams] = useState(loadTeams);

  const saveTeam = useCallback((team, name, filterGame) => {
    const serialized = team.map(serializePokemon);
    const newEntry = {
      id: Date.now(),
      name: name || `Time ${Date.now()}`,
      savedAt: new Date().toISOString(),
      filterGame: filterGame || "all",
      team: serialized,
    };
    setSavedTeams(prev => {
      const updated = [newEntry, ...prev];
      persistTeams(updated);
      return updated;
    });
    return newEntry.id;
  }, []);

  const deleteTeam = useCallback((id) => {
    setSavedTeams(prev => {
      const updated = prev.filter(t => t.id !== id);
      persistTeams(updated);
      return updated;
    });
  }, []);

  const loadTeam = useCallback((id) => {
    const entry = loadTeams().find(t => t.id === id);
    if (!entry) return null;
    return entry.team.map(deserializePokemon);
  }, []);

  return { savedTeams, saveTeam, deleteTeam, loadTeam };
}
