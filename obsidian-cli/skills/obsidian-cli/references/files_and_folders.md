# Files and Folders

## Info

```bash
obsidian file [file=<name>] [path=<path>]
# Output: path, name, extension, size, created, modified

obsidian files [folder=<path>] [ext=<extension>] [total]

obsidian folder path=<path> [info=files|folders|size]

obsidian folders [folder=<path>] [total]
```

## Read

```bash
obsidian read [file=<name>] [path=<path>]
```

Defaults to active file.

## Create

```bash
obsidian create [name=<name>] [path=<path>] [content=<text>] [template=<name>] [overwrite] [open] [newtab]
```

- Without `name`/`path`, creates "Untitled".
- `overwrite` required to replace existing file.

## Append / Prepend

```bash
obsidian append content=<text> [file=<name>] [path=<path>] [inline]
obsidian prepend content=<text> [file=<name>] [path=<path>] [inline]
```

`inline` suppresses leading newline. `prepend` inserts after frontmatter.

## Open

```bash
obsidian open [file=<name>] [path=<path>] [newtab]
```

## Move / Rename

```bash
obsidian move to=<path> [file=<name>] [path=<path>]
obsidian rename name=<name> [file=<name>] [path=<path>]
```

Both auto-update internal links. `rename` preserves extension if omitted.

## Delete

```bash
obsidian delete [file=<name>] [path=<path>] [permanent]
```

Moves to trash by default. `permanent` skips trash.
