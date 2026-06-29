import React, { useState } from 'react';
import { Copy, Check, Download, Code, FileCode, CheckSquare, Sparkles } from 'lucide-react';
import { ComposeFile } from '../types';

interface CodeViewerProps {
  files: ComposeFile[];
  selectedFileName: string;
  onSelectFile: (fileName: string) => void;
  onSyncSimulator: (screenName: string) => void;
}

export default function CodeViewer({
  files,
  selectedFileName,
  onSelectFile,
  onSyncSimulator
}: CodeViewerProps) {
  const [copied, setCopied] = useState(false);

  const activeFile = files.find(f => f.name === selectedFileName) || files[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(activeFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    const element = document.createElement("a");
    const file = new Blob([activeFile.code], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = activeFile.name;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Bidirectional interaction info
  const getScreenMapping = (fileName: string): { screen: string; name: string } | null => {
    switch (fileName) {
      case 'TastingListScreen.kt': return { screen: 'home', name: '홈 화면(리스트)' };
      case 'TastingFormScreen.kt': return { screen: 'add', name: '기록 작성 화면(폼)' };
      case 'TastingDetailScreen.kt': return { screen: 'detail', name: '상세 화면' };
      default: return null;
    }
  };

  const mapping = getScreenMapping(activeFile.name);

  // A fast and highly-optimized Kotlin code syntax highlighter with token placeholders to prevent regex collision
  const highlightKotlin = (code: string) => {
    // Escape HTML special characters
    let html = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    const tokens: string[] = [];
    const saveToken = (replacement: string) => {
      tokens.push(replacement);
      return `___TOKEN_${tokens.length - 1}___`;
    };

    // 1. Comments: // ...
    html = html.replace(/(\/\/.*)/g, (match) => saveToken(`<span class="text-neutral-500 italic">${match}</span>`));
    
    // 2. String literals: "..."
    html = html.replace(/(".*?")/g, (match) => saveToken(`<span class="text-emerald-400">${match}</span>`));

    // 3. Annotations: @Composable, @OptIn, etc.
    html = html.replace(/(@\w+)/g, (match) => saveToken(`<span class="text-amber-500 font-semibold">${match}</span>`));

    // 4. Keywords
    const keywords = [
      'package', 'import', 'class', 'object', 'enum', 'fun', 'val', 'var', 'return', 
      'interface', 'private', 'when', 'if', 'else', 'for', 'while', 'by', 'remember', 'mutableStateOf', 
      'mutableStateListOf', 'apply', 'listOf', 'find'
    ];
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b(${keyword})\\b`, 'g');
      html = html.replace(regex, (match) => saveToken(`<span class="text-violet-400 font-medium">${match}</span>`));
    });

    // 5. Types
    const types = [
      'String', 'Int', 'Float', 'Double', 'UUID', 'TastingEntry', 'FlavorProfile', 'LiquorCategory', 
      'DummyData', 'TastingJournalTheme', 'Modifier', 'Column', 'Row', 'Card', 'Text', 'Spacer', 
      'Button', 'OutlinedTextField', 'IconButton', 'Icon', 'Scaffold', 'TopAppBar', 'FloatingActionButton', 
      'LazyColumn', 'LazyRow', 'FilterChip', 'Divider', 'LinearProgressIndicator', 'ComponentActivity', 
      'Bundle', 'Surface', 'MaterialTheme', 'NavHost', 'composable', 'rememberNavController'
    ];
    types.forEach(type => {
      const regex = new RegExp(`\\b(${type})\\b`, 'g');
      html = html.replace(regex, (match) => saveToken(`<span class="text-cyan-400">${match}</span>`));
    });

    // Restore tokens in reverse order
    for (let i = tokens.length - 1; i >= 0; i--) {
      html = html.split(`___TOKEN_${i}___`).join(tokens[i]);
    }

    return html;
  };

  return (
    <div className="bg-slate-900 text-slate-100 border-4 border-slate-900 rounded-[2rem] overflow-hidden flex flex-col h-full shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
      {/* IDE Header */}
      <div className="bg-slate-950/80 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between border-b-2 border-slate-900/60 gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20">
            <FileCode className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-white text-sm">{activeFile.name}</span>
              <span className="text-[10px] bg-slate-800 text-amber-400 px-2 py-0.5 rounded border border-slate-700 font-mono font-bold uppercase tracking-wider">Kotlin</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">{activeFile.description}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition-colors border border-slate-700"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">복사됨!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>코드 복사</span>
              </>
            )}
          </button>
          
          <button
            onClick={handleDownloadFile}
            className="flex items-center space-x-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-extrabold transition-colors shadow-md"
          >
            <Download className="w-3.5 h-3.5" />
            <span>이 파일 다운로드</span>
          </button>
        </div>
      </div>

      {/* File Tabs */}
      <div className="bg-slate-950 px-4 pt-2 flex space-x-1 overflow-x-auto border-b border-slate-900 scrollbar-none">
        {files.map((file) => (
          <button
            key={file.name}
            onClick={() => onSelectFile(file.name)}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all border-t-2 border-x-2 ${
              selectedFileName === file.name
                ? 'bg-slate-900 border-slate-900 text-amber-400 font-extrabold'
                : 'bg-slate-950 border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="mr-1.5 text-[10px]">☕</span>
            {file.name}
          </button>
        ))}
      </div>

      {/* Sync banner/info if mapping exists */}
      {mapping && (
        <div className="bg-amber-500/10 border-b border-slate-900 px-6 py-2 flex items-center justify-between text-xs text-amber-200">
          <div className="flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>이 코드는 시뮬레이터의 <strong className="text-amber-300 font-extrabold">{mapping.name}</strong>에 해당합니다.</span>
          </div>
          <button
            onClick={() => onSyncSimulator(mapping.screen)}
            className="text-[10px] bg-amber-400/20 hover:bg-amber-400/35 border border-amber-400/30 text-amber-300 px-2 py-0.5 rounded-lg transition-colors font-bold"
          >
            시뮬레이터 이동하기 &rarr;
          </button>
        </div>
      )}

      {/* Code Editor Body */}
      <div className="flex-1 bg-slate-900/40 overflow-y-auto p-6 font-mono text-xs leading-relaxed custom-scrollbar min-h-[300px] max-h-[500px] xl:max-h-[550px]">
        <pre className="flex space-x-4">
          {/* Line Numbers */}
          <div className="text-slate-600 text-right select-none pr-4 border-r border-slate-800 shrink-0">
            {activeFile.code.split('\n').map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>

          {/* Syntax Highlighted Code */}
          <code 
            className="block text-slate-300 overflow-x-auto pb-4"
            dangerouslySetInnerHTML={{ __html: highlightKotlin(activeFile.code) }}
          />
        </pre>
      </div>

      {/* Android Studio Helper Tip */}
      <div className="bg-slate-950/60 px-6 py-3.5 border-t border-slate-900 flex items-start space-x-2.5 text-[11px] text-slate-400">
        <span className="text-amber-400">💡</span>
        <p className="font-medium">
          <strong>안드로이드 스튜디오 적용 팁:</strong> 각 탭 우측 상단의 코드를 복사하여 기재된 경로(<code className="text-amber-400 bg-slate-900 px-1 py-0.5 rounded font-mono border border-slate-800">{activeFile.path}</code>)에 파일을 추가하면 즉시 빌드 가능한 Jetpack Compose 앱이 완성됩니다!
        </p>
      </div>
    </div>
  );
}
