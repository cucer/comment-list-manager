# Comment List Manager

Effortlessly list every comment in your workspace—regardless of language—and jump straight to the line in one click.

## ✨ What It Does
- 🔎 Scans your workspace for comments across many languages (JS/TS, Python, Java, C/C++, Go, Ruby, Rust, PHP, Shell, SQL, HTML/CSS, YAML, Markdown, and more).
- 📂 Groups results by folder and file inside the Explorer **Comments** view.
- 📍 Shows language, folder, file, and line; clicking an item opens the file and reveals the exact line.
- ⚙️ Respects include/exclude globs and a max file size limit to keep scans fast on large repos.

## 🚀 Quick Start
1) Install dependencies: `npm install`
2) Build once or watch: `npm run compile` or `npm run watch`
3) Launch the Extension Development Host (F5 in VS Code)
4) Run the command: `Comment List Manager: Scan Workspace`
5) Browse results in the Explorer panel under **Comments** and click any entry to jump to it.

## 🔧 Settings
- `commentListManager.includeGlobs` (array): Glob patterns to include when scanning. Default covers common languages.
- `commentListManager.excludeGlobs` (array): Paths to exclude (e.g., `node_modules`, build outputs).
- `commentListManager.maxFileSizeKb` (number): Skip files larger than this size (KB). Default `1024`.

## 🧠 How It Works
- Run `Comment List Manager: Scan Workspace` from the Command Palette. You should see a notification like “X comment(s) found” and the **Comments** view (Activity Bar “Comment List” icon or Explorer views list) will show results.
- Browse results as folder → file → comment line. Click any comment to open the file and jump to that line.
- If you see nothing, the scan likely found zero comments. Add a quick `// test` or `# test` in any file and scan again to verify.
- If the **Comments** panel is hidden, expand the “Comment List” icon in the Activity Bar or enable the Comments view in the Explorer’s view list (it can be lower in the list).
- Scan scope respects your settings: adjust `commentListManager.includeGlobs` / `commentListManager.excludeGlobs` in Settings or `settings.json`.
- Under the hood: language-aware markers (line/block) with lightweight regex scanning; files are discovered via VS Code globs and skipped if over the configured size.

## 🛠 Development Notes
- Commands:  
  - `commentListManager.scanWorkspace` — scan and populate the Comments view.  
  - `commentListManager.openComment` — open a specific comment (invoked from the tree).  
- Run tests/linters if added later: `npm run compile` (TypeScript check).  
- Entry point: `src/extension.ts`; scanning logic: `src/commentScanner.ts`; tree view: `src/commentTreeProvider.ts`.

## 📦 Publishing (VS Marketplace)
- Ensure `package.json` has your `publisher` ID and correct `version`.
- Package locally: `npx vsce package` → produces `comment-list-manager-x.y.z.vsix`.
- Publish: `npx vsce login <publisher>` then `npx vsce publish`.

## 💡 Tips
- Narrow the scan on very large repos by tightening `includeGlobs` or lowering `maxFileSizeKb`.
- Add custom language markers by extending `languageDefinitions` in `src/commentScanner.ts` (future enhancement).
