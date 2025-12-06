import * as vscode from 'vscode';

export type CommentType = 'line' | 'block';

export interface CommentEntry {
  uri: vscode.Uri;
  filePath: string;
  folder: string;
  languageId: string;
  line: number;
  text: string;
  type: CommentType;
  marker: string;
}

export interface ScanConfig {
  includeGlobs: string[];
  excludeGlobs: string[];
  maxFileSizeKb: number;
}

export interface LanguageDefinition {
  id: string;
  extensions: string[];
  lineCommentMarkers?: string[];
  blockCommentMarkers?: Array<[string, string]>;
}
