# Pokémon Team Builder

Uma ferramenta web para montar equipes Pokémon, planejar jornadas em diferentes jogos da franquia e consultar rapidamente quais Pokémon estão disponíveis em cada versão.

O projeto foi criado para resolver um problema que eu encontrava constantemente ao jogar Pokémon: descobrir quais Pokémon estão disponíveis em cada jogo, organizar equipes e comparar opções sem precisar abrir dezenas de abas diferentes.

---

## ✨ Funcionalidades

### 📖 Pokédex por jogo
- Pokédex regional personalizada para cada jogo.
- Ordem dos Pokémon igual à encontrada dentro do próprio game.
- Suporte a subdivisões regionais como:
  - Central Kalos
  - Coastal Kalos
  - Mountain Kalos
  - National Dex
  - e outras futuras regiões.

### 🔍 Sistema avançado de filtros
- Busca por nome.
- Filtro por tipo.
- Filtro por geração.
- Filtro por região.
- Filtro por estágio evolutivo.
- Filtro por golpes.
- Filtro por habilidades.
- Ocultar Pokémon lendários.

### ⚔️ Planejamento de equipes
- Montagem de times com até 6 Pokémon.
- Consulta rápida de informações dos membros da equipe.
- Visualização simplificada para facilitar comparações.

### 🎮 Disponibilidade por versão
- Exclusivos de versão (X/Y, Ruby/Sapphire, etc.).
- Visualização apenas dos Pokémon disponíveis na versão selecionada.
- Separação entre exclusivos e Pokémon compartilhados.

### 🔄 Evoluções
- Detecção automática de estágios evolutivos.
- Filtro para:
  - Primeiro estágio
  - Segundo estágio
  - Estágio final
- Pokémon sem evolução são tratados como estágio final.

---

## 🛠 Tecnologias Utilizadas

- React
- Vite
- JavaScript
- CSS
- PokéAPI

---

## 📦 Fonte dos Dados

Este projeto utiliza a API pública:

- :contentReference[oaicite:0]{index=0}

As Pokédex regionais e exclusividades de versão são organizadas manualmente para reproduzir com maior fidelidade a experiência dos jogos.

---

## 🚀 Objetivos Futuros

- [ ] Lista completa de golpes por jogo.
- [ ] Compatibilidade de TM/HM por geração.
- [ ] Sugestão automática de equipes.
- [ ] Comparação de cobertura de tipos.
- [ ] Exportação e importação de times.
- [ ] Sistema de favoritos.
- [ ] Modo Nuzlocke.
- [ ] Rastreador de Pokédex.

---

## 📸 Preview

Em desenvolvimento.

---

## 💡 Motivação

Existem diversas ferramentas excelentes para Pokémon, mas poucas focam na disponibilidade real dos Pokémon dentro de cada jogo e na organização por Pokédex regional.

Este projeto busca unir informações da PokéAPI com dados organizados manualmente para criar uma experiência mais prática para jogadores que gostam de planejar equipes, completar Pokédex e revisitar jogos antigos da franquia.
