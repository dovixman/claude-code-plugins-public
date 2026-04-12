# Plugins and Themes

## Plugins

```bash
obsidian plugins [filter=core|community] [versions] [format=json|tsv|csv]
obsidian plugins:enabled [filter=core|community] [versions] [format=json|tsv|csv]
obsidian plugins:restrict on|off
obsidian plugin id=<plugin-id>
obsidian plugin:enable id=<id> [filter=core|community]
obsidian plugin:disable id=<id> [filter=core|community]
obsidian plugin:install id=<id> [enable]
obsidian plugin:uninstall id=<id>
obsidian plugin:reload id=<id>
```

`enable` flag on `plugin:install` activates after installation.

## Themes

```bash
obsidian themes [versions]
obsidian theme [name=<name>]
obsidian theme:set name=<name>
obsidian theme:install name=<name> [enable]
obsidian theme:uninstall name=<name>
```

Empty `name` on `theme:set` resets to default.

## CSS Snippets

```bash
obsidian snippets
obsidian snippets:enabled
obsidian snippet:enable name=<name>
obsidian snippet:disable name=<name>
```
