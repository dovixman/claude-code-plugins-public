# Developer

## Dev Tools

```bash
obsidian devtools
obsidian dev:debug on|off
obsidian dev:errors [clear]
obsidian dev:console [limit=<n>] [level=log|warn|error|info|debug] [clear]
obsidian dev:screenshot [path=<filename>]
obsidian dev:mobile on|off
```

Default `limit` for `dev:console`: 50.

## DOM / CSS Inspection

```bash
obsidian dev:css selector=<css> [prop=<name>]
obsidian dev:dom selector=<css> [attr=<name>] [css=<prop>] [total] [text] [inner] [all]
```

- `text` returns text content, `inner` returns innerHTML, `all` returns all matches.

## Eval

```bash
obsidian eval code=<javascript>
```

## Chrome DevTools Protocol

```bash
obsidian dev:cdp method=<CDP.method> [params=<json>]
```

## Command Palette

```bash
obsidian commands [filter=<prefix>]
obsidian command id=<command-id>
obsidian hotkeys [total] [verbose] [format=json|tsv|csv]
obsidian hotkey id=<command-id> [verbose]
```
