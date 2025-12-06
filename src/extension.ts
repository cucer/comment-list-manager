import * as vscode from 'vscode';
import { scanWorkspace } from './commentScanner';
import { CommentTreeProvider } from './commentTreeProvider';
import { CommentEntry } from './models';

export function activate(context: vscode.ExtensionContext) {
  const provider = new CommentTreeProvider();
  context.subscriptions.push(vscode.window.registerTreeDataProvider('commentListManager.commentsView', provider));

  const scanCommand = vscode.commands.registerCommand('commentListManager.scanWorkspace', async () => {
    const config = vscode.workspace.getConfiguration('commentListManager');
    const includeGlobs = config.get<string[]>('includeGlobs') ?? [];
    const excludeGlobs = config.get<string[]>('excludeGlobs') ?? [];
    const maxFileSizeKb = config.get<number>('maxFileSizeKb') ?? undefined;

    await vscode.window.withProgress(
      { location: vscode.ProgressLocation.Notification, title: 'Scanning comments...', cancellable: false },
      async () => {
        try {
          const entries = await scanWorkspace({ includeGlobs, excludeGlobs, maxFileSizeKb });
          provider.setEntries(entries);
          vscode.window.showInformationMessage(`Comment List Manager: ${entries.length} comment(s) found.`);
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          vscode.window.showErrorMessage(`Comment List Manager failed: ${message}`);
        }
      }
    );
  });

  const openCommand = vscode.commands.registerCommand(
    'commentListManager.openComment',
    async (entry: CommentEntry) => {
      if (!entry?.uri) {
        return;
      }
      const doc = await vscode.workspace.openTextDocument(entry.uri);
      const editor = await vscode.window.showTextDocument(doc, { preview: false });
      const lineIndex = Math.max(entry.line - 1, 0);
      const lineRange = doc.lineAt(lineIndex).range;
      editor.selection = new vscode.Selection(lineRange.start, lineRange.start);
      editor.revealRange(lineRange, vscode.TextEditorRevealType.InCenter);
    }
  );

  context.subscriptions.push(scanCommand, openCommand);
}

export function deactivate() {
  // no-op
}
