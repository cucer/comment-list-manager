import * as vscode from 'vscode';
import { CommentEntry, LanguageDefinition, ScanConfig } from './models';
// testing
const DEFAULT_INCLUDE = [
  '**/*.{ts,tsx,js,jsx,py,java,cs,cpp,c,h,go,rb,rs,php,sql,sh,bat,ps1,swift,kt,m,mm,scala,lua,pl,pm,erl,ex,exs,hs,clj,cljs,coffee,html,css,scss,less,json,xml,yml,yaml,md}',
];

const DEFAULT_EXCLUDE = [
  '**/node_modules/**',
  '**/.git/**',
  '**/.svn/**',
  '**/.hg/**',
  '**/.DS_Store/**',
  '**/dist/**',
  '**/build/**',
  '**/out/**',
  '**/package*.json',
];

const DEFAULT_MAX_FILE_SIZE_KB = 1024;

const languageDefinitions: LanguageDefinition[] = [
  {
    id: 'typescript',
    extensions: ['ts', 'tsx'],
    lineCommentMarkers: ['//'],
    blockCommentMarkers: [['/*', '*/']],
  },
  {
    id: 'javascript',
    extensions: ['js', 'jsx', 'mjs', 'cjs'],
    lineCommentMarkers: ['//'],
    blockCommentMarkers: [['/*', '*/']],
  },
  {
    id: 'python',
    extensions: ['py'],
    lineCommentMarkers: ['#'],
    blockCommentMarkers: [
      ['"""', '"""'],
      ["'''", "'''"],
    ],
  },
  {
    id: 'java',
    extensions: ['java'],
    lineCommentMarkers: ['//'],
    blockCommentMarkers: [['/*', '*/']],
  },
  {
    id: 'csharp',
    extensions: ['cs'],
    lineCommentMarkers: ['//'],
    blockCommentMarkers: [
      ['/*', '*/'],
      ['///', '\n'],
    ],
  },
  {
    id: 'c',
    extensions: ['c', 'h'],
    lineCommentMarkers: ['//'],
    blockCommentMarkers: [['/*', '*/']],
  },
  {
    id: 'cpp',
    extensions: ['cpp', 'cc', 'cxx', 'hpp', 'hh', 'hxx'],
    lineCommentMarkers: ['//'],
    blockCommentMarkers: [['/*', '*/']],
  },
  {
    id: 'go',
    extensions: ['go'],
    lineCommentMarkers: ['//'],
    blockCommentMarkers: [['/*', '*/']],
  },
  { id: 'ruby', extensions: ['rb'], lineCommentMarkers: ['#'] },
  {
    id: 'rust',
    extensions: ['rs'],
    lineCommentMarkers: ['//'],
    blockCommentMarkers: [['/*', '*/']],
  },
  {
    id: 'php',
    extensions: ['php'],
    lineCommentMarkers: ['//', '#'],
    blockCommentMarkers: [['/*', '*/']],
  },
  {
    id: 'shell',
    extensions: ['sh', 'bash', 'zsh', 'ksh'],
    lineCommentMarkers: ['#'],
  },
  {
    id: 'powershell',
    extensions: ['ps1'],
    lineCommentMarkers: ['#'],
    blockCommentMarkers: [['<#', '#>']],
  },
  {
    id: 'swift',
    extensions: ['swift'],
    lineCommentMarkers: ['//'],
    blockCommentMarkers: [['/*', '*/']],
  },
  {
    id: 'kotlin',
    extensions: ['kt', 'kts'],
    lineCommentMarkers: ['//'],
    blockCommentMarkers: [['/*', '*/']],
  },
  {
    id: 'objective-c',
    extensions: ['m', 'mm'],
    lineCommentMarkers: ['//'],
    blockCommentMarkers: [['/*', '*/']],
  },
  {
    id: 'scala',
    extensions: ['scala'],
    lineCommentMarkers: ['//'],
    blockCommentMarkers: [['/*', '*/']],
  },
  {
    id: 'lua',
    extensions: ['lua'],
    lineCommentMarkers: ['--'],
    blockCommentMarkers: [['--[[', ']]']],
  },
  { id: 'perl', extensions: ['pl', 'pm'], lineCommentMarkers: ['#'] },
  { id: 'erlang', extensions: ['erl'], lineCommentMarkers: ['%'] },
  { id: 'elixir', extensions: ['ex', 'exs'], lineCommentMarkers: ['#'] },
  {
    id: 'haskell',
    extensions: ['hs'],
    lineCommentMarkers: ['--'],
    blockCommentMarkers: [['{-', '-}']],
  },
  { id: 'clojure', extensions: ['clj', 'cljs'], lineCommentMarkers: [';'] },
  {
    id: 'sql',
    extensions: ['sql'],
    lineCommentMarkers: ['--'],
    blockCommentMarkers: [['/*', '*/']],
  },
  {
    id: 'markdown',
    extensions: ['md'],
    lineCommentMarkers: ['<!--'],
    blockCommentMarkers: [['<!--', '-->']],
  },
  { id: 'yaml', extensions: ['yml', 'yaml'], lineCommentMarkers: ['#'] },
  {
    id: 'json',
    extensions: ['json'],
    lineCommentMarkers: ['//'],
    blockCommentMarkers: [['/*', '*/']],
  },
  {
    id: 'html',
    extensions: ['html', 'htm'],
    blockCommentMarkers: [['<!--', '-->']],
  },
  {
    id: 'css',
    extensions: ['css', 'scss', 'less'],
    blockCommentMarkers: [['/*', '*/']],
  },
];

const decoder = new TextDecoder('utf-8');

export async function scanWorkspace(
  config?: Partial<ScanConfig>
): Promise<CommentEntry[]> {
  const includeGlobs = config?.includeGlobs?.length
    ? config.includeGlobs
    : DEFAULT_INCLUDE;
  const excludeGlobs = config?.excludeGlobs?.length
    ? config.excludeGlobs
    : DEFAULT_EXCLUDE;
  const maxFileSizeKb = config?.maxFileSizeKb ?? DEFAULT_MAX_FILE_SIZE_KB;

  const includePattern = joinGlobs(includeGlobs);
  const excludePattern = joinGlobs(excludeGlobs);

  const fileUris = await vscode.workspace.findFiles(
    includePattern,
    excludePattern
  );
  const entries: CommentEntry[] = [];

  for (const uri of fileUris) {
    const stat = await vscode.workspace.fs.stat(uri);
    const sizeKb = stat.size / 1024;
    if (sizeKb > maxFileSizeKb) {
      continue;
    }

    const lang = detectLanguage(uri);
    const buffer = await vscode.workspace.fs.readFile(uri);
    const text = decoder.decode(buffer);

    const relativePath = vscode.workspace.asRelativePath(uri);
    const folder = relativePath.split(/[\\/]/)[0] || '(root)';

    const comments = extractComments(
      text,
      lang ?? { id: 'unknown', extensions: [] }
    );
    for (const comment of comments) {
      entries.push({
        ...comment,
        uri,
        filePath: relativePath,
        folder,
        languageId: lang?.id ?? 'unknown',
      });
    }
  }

  return entries;
}

function detectLanguage(uri: vscode.Uri): LanguageDefinition | undefined {
  const match = uri.fsPath.toLowerCase().match(/\.([^.]+)$/);
  if (!match) {
    return undefined;
  }
  const ext = match[1];
  return languageDefinitions.find((lang) => lang.extensions.includes(ext));
}

function extractComments(
  text: string,
  language: LanguageDefinition
): Array<Omit<CommentEntry, 'uri' | 'filePath' | 'folder' | 'languageId'>> {
  const lineOffsets = computeLineOffsets(text);
  const lineComments = extractLineComments(text, language, lineOffsets);
  const blockComments = extractBlockComments(text, language, lineOffsets);
  return [...lineComments, ...blockComments];
}

function extractLineComments(
  text: string,
  language: LanguageDefinition,
  lineOffsets: number[]
): Array<Omit<CommentEntry, 'uri' | 'filePath' | 'folder' | 'languageId'>> {
  const markers = language.lineCommentMarkers ?? [];
  if (!markers.length) {
    return [];
  }

  const lines = text.split(/\r?\n/);
  const entries: Array<
    Omit<CommentEntry, 'uri' | 'filePath' | 'folder' | 'languageId'>
  > = [];

  lines.forEach((lineText, index) => {
    for (const marker of markers) {
      const pos = lineText.indexOf(marker);
      if (pos !== -1) {
        const raw = lineText.slice(pos + marker.length);
        const cleaned = raw.trim();
        if (cleaned.length) {
          entries.push({
            line: index + 1,
            text: cleaned,
            type: 'line',
            marker,
          });
        }
        break;
      }
    }
  });

  return entries;
}

function extractBlockComments(
  text: string,
  language: LanguageDefinition,
  lineOffsets: number[]
): Array<Omit<CommentEntry, 'uri' | 'filePath' | 'folder' | 'languageId'>> {
  const blocks = language.blockCommentMarkers ?? [];
  if (!blocks.length) {
    return [];
  }

  const entries: Array<
    Omit<CommentEntry, 'uri' | 'filePath' | 'folder' | 'languageId'>
  > = [];

  for (const [start, end] of blocks) {
    const pattern = new RegExp(
      escapeRegex(start) + '[\\s\\S]*?' + escapeRegex(end),
      'g'
    );
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(text)) !== null) {
      const content = match[0]
        .slice(start.length, match[0].length - end.length)
        .trim();
      if (!content.length) {
        continue;
      }
      const startOffset = match.index;
      const line = lineFromOffset(startOffset, lineOffsets);
      entries.push({
        line,
        text: content,
        type: 'block',
        marker: start,
      });
    }
  }

  return entries;
}

function computeLineOffsets(text: string): number[] {
  const offsets = [0];
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '\n') {
      offsets.push(i + 1);
    }
  }
  return offsets;
}

function lineFromOffset(offset: number, offsets: number[]): number {
  let low = 0;
  let high = offsets.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (
      offsets[mid] <= offset &&
      (mid === offsets.length - 1 || offsets[mid + 1] > offset)
    ) {
      return mid + 1;
    }
    if (offsets[mid] > offset) {
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }

  return offsets.length;
}

function joinGlobs(globs: string[]): string {
  if (globs.length === 1) {
    return globs[0];
  }
  return `{${globs.join(',')}}`;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/*
TypesInstallerInitializationFailedEventteetst
sdfkşjsdklşfjlksd
*/
