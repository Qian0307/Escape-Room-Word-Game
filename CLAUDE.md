# CLAUDE.md - Escape-Room-Word-Game

> **Documentation Version**: 1.0
> **Last Updated**: 2026-03-09
> **Project**: Escape-Room-Word-Game
> **Description**: Interactive Narrative Escape Room Engine — A Chinese text-based escape room game using HTML, CSS, and JavaScript. Features 25 rooms, 35 puzzles, 40 items, and 5 NPC characters.
> **Features**: GitHub auto-backup, technical debt prevention, narrative-driven gameplay

This file provides essential guidance to Claude Code when working with code in this repository.

## 🚨 CRITICAL RULES - READ FIRST

### ❌ ABSOLUTE PROHIBITIONS
- **NEVER** create new files in root directory → use `src/`, `docs/`, `output/`
- **NEVER** write output files directly to root directory
- **NEVER** create documentation files (.md) unless explicitly requested
- **NEVER** use git commands with -i flag
- **NEVER** use `find`, `grep`, `cat`, `head`, `tail`, `ls` commands → use Read, Grep, Glob tools
- **NEVER** create duplicate files (game_v2.js, style_new.css) → extend existing files
- **NEVER** hardcode values that should be configurable

### 📝 MANDATORY REQUIREMENTS
- **COMMIT** after every completed task/phase
- **GITHUB BACKUP** - Push after every commit: `git push origin main`
- **READ FILES FIRST** before editing
- **SEARCH FIRST** before creating new files

## 🏗️ PROJECT OVERVIEW

### Architecture
```
src/
├── index.html     # Game UI shell
├── style.css      # Terminal-style dark theme
└── game.js        # Full game engine (rooms, items, puzzles, NPCs, commands)
```

### Game Systems
1. **Game State System** — tracks currentRoom, inventory, flags, timer, progress
2. **Room System** — 25 rooms with narrative descriptions, exits, items, puzzles
3. **Inventory System** — 40 items with combine mechanics
4. **Puzzle Engine** — 35 puzzles (code locks, deduction, item combination)
5. **Dialogue System** — 5 NPCs with multi-stage dialogue
6. **Hint System** — context-aware hints via `hint` command
7. **Save System** — localStorage autosave after each action

### Key Files
- `src/game.js` — All game logic. Sections: CODES → STATE → ROOMS → ITEMS → PUZZLES → NPCS → PARSER → ENGINE → UI → SAVE → TIMER → ENDINGS
- `src/style.css` — Dark terminal theme, green text, monospace font
- `src/index.html` — Layout: header (title+timer), story area, inventory panel, command input

### Supported Commands
```
look | examine [obj] | take [obj] | open [obj] [code]
use [item] [target] | inventory | go [dir] | read [obj]
combine [item1] [item2] | talk [npc] | hint | help | map | save | load
```

### Endings
1. 成功逃脫 — Use finalKey at exitHall
2. 時間耗盡 — Timer reaches 0
3. 被困結局 — Wrong choice in deepUnderground
4. 隱藏真相結局 — Discover all 5 secrets + escape
5. 完美結局 — Solve all puzzles + all NPCs + all secrets + escape

## 🎯 DEVELOPMENT STATUS
- **Setup**: ✅ Complete
- **Core Game Engine**: ✅ Complete
- **Story Content**: ✅ Complete (Traditional Chinese)
- **Testing**: Manual browser testing
- **Documentation**: CLAUDE.md active

## 🚀 COMMON COMMANDS
```bash
# Open game in browser
start src/index.html      # Windows
open src/index.html       # Mac

# Git workflow
git add src/
git commit -m "feat: description"
git push origin main
```
