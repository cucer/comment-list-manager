import * as vscode from 'vscode';
import { CommentEntry, LanguageDefinition, ScanConfig } from './models';

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

const STRING_QUOTE_CHARS = new Set(["'", '"', '`']);

/**
 * Single-pass scan that tracks whether we're inside a string literal so
 * comment markers appearing in string content (e.g. `'/*'` in this very
 * file's language definitions) aren't mistaken for real comments.
 */
function extractComments(
  text: string,
  language: LanguageDefinition
): Array<Omit<CommentEntry, 'uri' | 'filePath' | 'folder' | 'languageId'>> {
  const lineMarkers = language.lineCommentMarkers ?? [];
  const blockMarkers = [...(language.blockCommentMarkers ?? [])].sort(
    (a, b) => b[0].length - a[0].length
  );
  const entries: Array<
    Omit<CommentEntry, 'uri' | 'filePath' | 'folder' | 'languageId'>
  > = [];

  if (!lineMarkers.length && !blockMarkers.length) {
    return entries;
  }

  const n = text.length;
  let i = 0;
  let line = 1;
  let quoteChar: string | null = null;

  while (i < n) {
    const ch = text[i];

    if (quoteChar) {
      if (ch === '\\') {
        if (text[i + 1] === '\n') {
          line++;
        }
        i += 2;
        continue;
      }
      if (ch === quoteChar) {
        quoteChar = null;
      } else if (ch === '\n') {
        line++;
        if (quoteChar !== '`') {
          quoteChar = null;
        }
      }
      i++;
      continue;
    }

    const block = blockMarkers.find(([start]) => text.startsWith(start, i));
    if (block) {
      const [start, end] = block;
      const contentStart = i + start.length;
      const endIndex = text.indexOf(end, contentStart);
      const contentEnd = endIndex === -1 ? n : endIndex;
      const content = text.slice(contentStart, contentEnd).trim();
      if (content.length) {
        entries.push({ line, text: content, type: 'block', marker: start });
      }
      const consumedEnd = endIndex === -1 ? n : endIndex + end.length;
      for (let j = i; j < consumedEnd; j++) {
        if (text[j] === '\n') {
          line++;
        }
      }
      i = consumedEnd;
      continue;
    }

    const lineMarker = lineMarkers.find((marker) => text.startsWith(marker, i));
    if (lineMarker) {
      const contentStart = i + lineMarker.length;
      const newlineIndex = text.indexOf('\n', contentStart);
      const contentEnd = newlineIndex === -1 ? n : newlineIndex;
      const cleaned = text.slice(contentStart, contentEnd).trim();
      if (cleaned.length) {
        entries.push({ line, text: cleaned, type: 'line', marker: lineMarker });
      }
      i = contentEnd;
      continue;
    }

    if (STRING_QUOTE_CHARS.has(ch)) {
      quoteChar = ch;
      i++;
      continue;
    }

    if (ch === '\n') {
      line++;
    }
    i++;
  }

  return entries;
}

function joinGlobs(globs: string[]): string {
  if (globs.length === 1) {
    return globs[0];
  }
  return `{${globs.join(',')}}`;
}
