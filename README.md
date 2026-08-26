# Comment List Manager

List every comment in your workspace — in any supported language — and jump straight to it in one click.

## What It Does

- Scans your workspace and finds every line and block comment, across 25+ languages (see [Supported Languages](#supported-languages) below).
- Groups results by folder → file → comment in a dedicated **Comments** view in the Activity Bar.
- Clicking a comment opens its file and jumps straight to that line.
- Respects configurable include/exclude globs and a max file size limit, so scans stay fast on large repos.

## Quick Start

1. Open any folder/project in VS Code.
2. Open the Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`) and run **`Comment List Manager: Scan Workspace`**.
3. A notification shows how many comments were found, and the **Comments** view opens automatically (Activity Bar icon on the left, or find it under the Explorer's view list).
4. The results are grouped as folder → file → comment. Click any comment to jump to that exact line.
5. Made changes to your code? Run **`Comment List Manager: Refresh Comments`** (or click "Refresh" in the empty-state view) to rescan.

If nothing shows up, the scan found zero comments matching your current settings — see [Settings](#settings) below to widen the scan.

## Commands

| Command | What it does |
|---|---|
| `Comment List Manager: Scan Workspace` | Scans the workspace and populates the Comments view. |
| `Comment List Manager: Refresh Comments` | Clears the current list and rescans from scratch. |
| `Comment List Manager: Open Comment` | Opens a specific comment's file at its line (invoked by clicking a tree item, not meant to be run directly). |

## Settings

Configure these under **Settings → Extensions → Comment List Manager**, or directly in `settings.json`:

| Setting | Type | Default | Description |
|---|---|---|---|
| `commentListManager.includeGlobs` | `string[]` | common source file extensions | Glob patterns to include when scanning. |
| `commentListManager.excludeGlobs` | `string[]` | `node_modules`, `.git`, `dist`, `build`, `out`, etc. | Glob patterns to exclude when scanning. |
| `commentListManager.maxFileSizeKb` | `number` | `1024` | Files larger than this (in KB) are skipped entirely. |

## Supported Languages

TypeScript/JavaScript, Python, Java, C#, C/C++, Go, Ruby, Rust, PHP, Shell/Bash, PowerShell, Swift, Kotlin, Objective-C, Scala, Lua, Perl, Erlang, Elixir, Haskell, Clojure, SQL, Markdown, YAML, JSON (JSONC-style `//` and `/* */`), HTML, and CSS/SCSS/Less.

Each language has its own line/block comment markers defined in `src/commentScanner.ts` — see [Tips](#tips) below for how to add more.

## How It Works

The scanner reads each matched file and walks its text in a single pass, tracking whether it's currently inside a string literal (`'`, `"`, `` ` ``, with escape-character handling). This means comment markers that merely *appear* inside a string — e.g. a variable holding `"/* not a comment */"` — are correctly ignored instead of being misdetected as real comments.

**Known limitation:** this is still a lightweight, generic scanner, not a full per-language parser. Edge cases like regex literals (`/foo/`) or unusual raw-string syntax in some languages could in theory still produce a false positive. In practice this is rare.

## Development

```bash
npm install          # install dependencies
npm run watch        # compile TypeScript in watch mode
npm run compile       # one-off compile (also runs automatically before packaging)
npm run lint          # run ESLint over src/
npm run package       # build a local .vsix (see Packaging below)
```

Press **F5** in VS Code to launch an Extension Development Host with the extension loaded. It automatically opens the [`demo-samples/`](demo-samples) folder — a small set of JS/TS/Java/Python files with sample comments (including tricky cases like markers inside strings) — so you can immediately run `Scan Workspace` and see results without hunting for a test project.

**Project layout:**
- `src/extension.ts` — activation, command registration, scan orchestration.
- `src/commentScanner.ts` — language definitions and the comment-extraction scanner.
- `src/commentTreeProvider.ts` — builds and renders the folder/file/comment tree view.
- `src/models.ts` — shared TypeScript types.
- `demo-samples/` — sample files for manual testing (excluded from the packaged extension).

## Packaging & Publishing (VS Marketplace)

**Build a local `.vsix` to test before publishing:**
```bash
npm run package
```
This produces `comment-list-manager-<version>.vsix` in the project root. Install it locally with:
```bash
code --install-extension comment-list-manager-<version>.vsix
```
(Reload the VS Code window afterwards if you're updating an already-installed version.)

**Publish to the Marketplace:**
1. Bump `version` in `package.json` (or use `vsce publish patch|minor|major`, which bumps and publishes in one step).
2. If you haven't already, create a Personal Access Token at [dev.azure.com](https://dev.azure.com) (User Settings → Personal Access Tokens), scoped to **Marketplace (Manage)** for **All accessible organizations**.
3. Log in once: `npx vsce login <publisher>` (uses the token above).
4. Publish: `npx vsce publish`

## Tips

- On very large repositories, tighten `includeGlobs` or lower `maxFileSizeKb` to keep scans fast.
- Add support for another language by extending the `languageDefinitions` array in `src/commentScanner.ts` with its file extensions and line/block comment markers.
