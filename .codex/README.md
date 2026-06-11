# Codex Commands

These Markdown files are Codex custom prompts adapted from `.claude/commands/`.

To make them available in Codex, copy the files from `.codex/prompts/` to your Codex home prompt directory:

```powershell
New-Item -ItemType Directory -Force "$env:USERPROFILE\.codex\prompts"
Copy-Item ".codex\prompts\*.md" "$env:USERPROFILE\.codex\prompts" -Force
```

Restart Codex or open a new chat after copying. The documented invocation form is:

- `/prompts:add-feature <feature description>`
- `/prompts:refactor <target and desired outcome>`
- `/prompts:bugfix <bug description or failing behavior>`

