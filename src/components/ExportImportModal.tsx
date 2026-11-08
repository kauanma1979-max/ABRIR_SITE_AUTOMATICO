import React, { useState } from 'react';
import { X, Download, Upload, Copy, Check, FileJson } from 'lucide-react';
import { LinkItem } from '../types.ts';

interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  links: LinkItem[];
  categories: string[];
  onImportFullData: (links: LinkItem[], categories: string[]) => void;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({
  isOpen,
  onClose,
  links,
  categories,
  onImportFullData,
}) => {
  const [jsonText, setJsonText] = useState('');
  const [copied, setCopied] = useState(false);
  const [importStatus, setImportStatus] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const exportPayload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    categories,
    links,
  };

  const exportJsonString = JSON.stringify(exportPayload, null, 2);

  const handleDownloadFile = () => {
    const blob = new Blob([exportJsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `linklauncher-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyClipboard = () => {
    navigator.clipboard.writeText(exportJsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRestoreJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      let importedLinks: LinkItem[] = [];
      let importedCategories: string[] = categories;

      if (Array.isArray(parsed)) {
        importedLinks = parsed;
      } else if (parsed && Array.isArray(parsed.links)) {
        importedLinks = parsed.links;
        if (Array.isArray(parsed.categories)) {
          importedCategories = Array.from(new Set([...categories, ...parsed.categories]));
        }
      } else {
        throw new Error('Formato JSON não reconhecido.');
      }

      if (importedLinks.length === 0) {
        throw new Error('Nenhum link encontrado no JSON.');
      }

      onImportFullData(importedLinks, importedCategories);
      setImportStatus({ success: true, message: `${importedLinks.length} links restaurados com sucesso!` });
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setImportStatus({ success: false, message: err.message || 'JSON inválido.' });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setJsonText(content);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
              <FileJson className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-white text-base">
              Backup, Exportação e Restauração
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Export Box */}
          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Download className="w-4 h-4 text-indigo-400" />
              <span>Exportar seus links ({links.length})</span>
            </h4>
            <p className="text-xs text-slate-400">
              Faça o download do seu arquivo de backup para salvar todos os seus links e categorias com segurança.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleDownloadFile}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Baixar Arquivo JSON</span>
              </button>
              <button
                type="button"
                onClick={handleCopyClipboard}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado!' : 'Copiar JSON'}</span>
              </button>
            </div>
          </div>

          {/* Import Box */}
          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Upload className="w-4 h-4 text-indigo-400" />
              <span>Restaurar / Importar Backup JSON</span>
            </h4>
            <p className="text-xs text-slate-400">
              Carregue um arquivo JSON ou cole o conteúdo do seu backup abaixo para restaurar seus links.
            </p>

            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5" />
                <span>Escolher Arquivo .json</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              rows={4}
              placeholder="Cole aqui o conteúdo JSON de backup..."
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-slate-300 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
            />

            {importStatus && (
              <div
                className={`p-2.5 rounded-lg text-xs ${
                  importStatus.success
                    ? 'bg-emerald-950/50 border border-emerald-800/60 text-emerald-300'
                    : 'bg-rose-950/50 border border-rose-800/60 text-rose-300'
                }`}
              >
                {importStatus.message}
              </div>
            )}

            <button
              type="button"
              onClick={handleRestoreJson}
              disabled={!jsonText.trim()}
              className="w-full flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Restaurar Links Agora</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
