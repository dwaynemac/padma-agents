Selección de skills y agents para proyectos PADMA.

# SKILLS

## Installation

``` 
npx skills add dwaynemac/padma-agents
```

## Updating

``` 
npx skills update dwaynemac/padma-agents
```

# JETBRAINS RULES

## Installation

```
npx jetbrains-rules add dwaynemac/padma-agents
```

This installs every file from the repository's [`jetbrains-rules/`](./jetbrains-rules) directory into `.aiassistant/rules` in the current project.

## Updating

```
npx jetbrains-rules update
```

Installed sources are tracked in `.aiassistant/jetbrains-rules-lock.json`, so `update` can refresh all previously added rule sets.

# Other useful skills
These skills are installable by ```npx skills add```:
- [railwayapp/railway-skills](https://github.com/railwayapp/railway-skills) - Railway.com CLI skills
- [TheHotwireClub/hotwire_club-skills](https://github.com/TheHotwireClub/hotwire_club-skills) - Hotwire.club CLI skills

# Repository structure
- [skills/](./skills) - contains all skills
- [agents/](./agents) - contains all agents
- [prompts/](./prompts) - contains all prompts
- [jetbrains-rules/](./jetbrains-rules) - contains JetBrains rules for AI Assistant
- [bin/](./bin) - contains the `jetbrains-rules` CLI entrypoint
- [lib/](./lib) - contains the CLI implementation
