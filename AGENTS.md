# NYL360 — Agent Roster

Documents the AI agents used to build this prototype and the workflows they powered.
Agent definitions live in `scripts/agents/`.

---

## Agents used in this build

| Agent | Definition | Role |
|---|---|---|
| Frontend Developer | `scripts/agents/engineering-frontend-developer.md` | Built all UI components and Discovery flow screens |
| Minimal Change Engineer | `scripts/agents/engineering-minimal-change-engineer.md` | Applied targeted fixes — token compliance, padding, copy — without scope creep |
| Code Reviewer | `scripts/agents/engineering-code-reviewer.md` | Audited all 34 Storybook components for design token compliance |
| Senior Developer | Built-in `code-reviewer` subagent (Claude Code) | Validated implementations before commit; caught animation bugs and unguarded effects |
| Workflow Architect | `scripts/agents/specialized-workflow-architect.md` | Scoped component work; produced build-ready specs from Figma |
| Reality Checker | `scripts/agents/testing-reality-checker.md` | Certified production readiness; defaulted to NEEDS WORK, required evidence |

---

## Multi-agent workflows

### Component build (per new component)
```
Figma MCP fetch → Parallel: Frontend Developer (component + story) + CSV agent
               → Code Reviewer token check
               → Minimal Change Engineer fixes
               → Playwright test (see tests/AGENT_TEMPLATE.md)
               → Commit
```

### Full token audit (34 components)
```
Workflow → 5 parallel Code Reviewer agents (grouped by component category)
         → Synthesize findings
         → Minimal Change Engineer batch-applies fixes
         → tokens.css primitive additions
```

### Discovery flow screens
```
Parallel: Frontend Developer (Storybook component) + Frontend Developer (flow screen + CSV)
→ Senior Developer review → Minimal Change Engineer fixes → Push
```

---

## QA harness

Every new Storybook component ships with a Playwright test following `tests/AGENT_TEMPLATE.md`:

1. **Mount smoke** — component renders without errors
2. **Text spacing** — catches inline-block whitespace collapsing (`assertTextSpacing`)
3. **Visual snapshot** — baseline PNG for regression detection

```bash
npm run test:storybook                     # run tests
npm run test:storybook:update-snapshots   # generate baselines
```

---

## Prototype keyboard shortcuts

| Key | Action |
|---|---|
| `M` | Open prototype menu |
| `G` | Toggle 12-column grid overlay |
| `Escape` | Close current flow / return to menu |
