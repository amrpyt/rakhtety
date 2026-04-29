# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

## Before exploring, read these

- `.planning\STATE.md` at the repo root.
- `docs/adr/` - read ADRs that touch the area you're about to work in.

If these files do not exist, proceed silently. Do not block on them.

## File structure

Single-context repo:

```
/
├── .planning/
│   └── STATE.md
├── docs/adr/
└── src/
```

## Use the glossary's vocabulary

When your output names a domain concept, use the term as defined in `.planning/STATE.md`. Do not drift to synonyms if the project glossary already picked a word.

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly rather than silently overriding it.
