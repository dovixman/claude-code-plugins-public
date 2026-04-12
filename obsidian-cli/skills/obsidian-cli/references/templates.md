# Templates

```bash
obsidian templates [total]
obsidian template:read name=<template> [title=<title>] [resolve]
obsidian template:insert name=<template>
obsidian templater:create-from-template template=<path> file=<path> [open]
```

- `resolve` processes `{{date}}`, `{{time}}`, `{{title}}` variables.
- `title` provides a value for `{{title}}`.
- `templater:create-from-template` requires the Templater plugin. `template` is relative to vault root or templates folder.
- Use `obsidian create name=<name> template=<template>` to create a file from a core template.
