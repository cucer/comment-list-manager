import * as vscode from 'vscode';
import { CommentEntry } from './models';

type CommentNode = FolderNode | FileNode | LeafCommentNode;

interface FolderNode {
  type: 'folder';
  label: string;
  children: CommentNode[];
}

interface FileNode {
  type: 'file';
  label: string;
  filePath: string;
  children: CommentNode[];
}

interface LeafCommentNode {
  type: 'comment';
  comment: CommentEntry;
  label: string;
}

function isFileNode(node: CommentNode): node is FileNode {
  return node.type === 'file';
}

export class CommentTreeProvider implements vscode.TreeDataProvider<CommentNode> {
  private data: CommentNode[] = [];
  private readonly _onDidChangeTreeData = new vscode.EventEmitter<CommentNode | undefined>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  setEntries(entries: CommentEntry[]): void {
    this.data = buildTree(entries);
    this._onDidChangeTreeData.fire(undefined);
  }

  clear(): void {
    this.data = [];
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(element: CommentNode): vscode.TreeItem {
    if (element.type === 'folder') {
      return new vscode.TreeItem(element.label, vscode.TreeItemCollapsibleState.Collapsed);
    }

    if (element.type === 'file') {
      const item = new vscode.TreeItem(element.label, vscode.TreeItemCollapsibleState.Collapsed);
      item.description = element.filePath;
      return item;
    }

    const { comment } = element;
    const item = new vscode.TreeItem(element.label, vscode.TreeItemCollapsibleState.None);
    item.description = `${comment.filePath}:${comment.line}`;
    item.tooltip = comment.text;
    item.command = {
      title: 'Open Comment',
      command: 'commentListManager.openComment',
      arguments: [comment]
    };
    return item;
  }

  getChildren(element?: CommentNode): vscode.ProviderResult<CommentNode[]> {
    if (!element) {
      return this.data;
    }
    if (element.type === 'folder' || element.type === 'file') {
      return element.children;
    }
    return [];
  }
}

function buildTree(entries: CommentEntry[]): CommentNode[] {
  const folderMap = new Map<string, FolderNode>();

  for (const entry of entries) {
    const folderKey = entry.folder || '(root)';
    if (!folderMap.has(folderKey)) {
      folderMap.set(folderKey, { type: 'folder', label: folderKey, children: [] });
    }

    const folderNode = folderMap.get(folderKey)!;
    let fileNode = folderNode.children.find(
      (child): child is FileNode => child.type === 'file' && child.filePath === entry.filePath
    );

    if (!fileNode) {
      fileNode = { type: 'file', label: getFileLabel(entry.filePath), filePath: entry.filePath, children: [] };
      folderNode.children.push(fileNode);
    }

    const label = formatCommentLabel(entry);
    fileNode.children.push({ type: 'comment', comment: entry, label });
  }

  const result: FolderNode[] = Array.from(folderMap.values());
  // Sort folders and files alphabetically for consistent ordering.
  result.sort((a, b) => a.label.localeCompare(b.label));
  result.forEach((folder) => {
    folder.children.sort((a, b) => a.label.localeCompare(b.label));
    folder.children.forEach((child) => {
      if (isFileNode(child)) {
        child.children.sort((a, b) => {
          if (a.type === 'comment' && b.type === 'comment') {
            return a.comment.line - b.comment.line;
          }
          return a.label.localeCompare(b.label);
        });
      }
    });
  });

  return result;
}

function getFileLabel(path: string): string {
  const parts = path.split(/[\\/]/);
  return parts[parts.length - 1] || path;
}

function formatCommentLabel(entry: CommentEntry): string {
  const snippet = entry.text.length > 80 ? `${entry.text.slice(0, 77)}...` : entry.text;
  return `:${entry.line} · ${snippet}`;
}
