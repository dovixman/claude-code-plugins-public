# Templates

```bash
obsidian templates [total]
obsidian template:read name=<template> [title=<title>] [resolve]
obsidian template:insert name=<template>
```

- `resolve` processes `{{date}}`, `{{time}}`, `{{title}}` variables.
- `title` provides a value for `{{title}}`.
- Use `obsidian create name=<name> template=<template>` to create a file from a template.
