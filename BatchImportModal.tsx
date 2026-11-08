import React, { useState } from 'react';
import { X, UploadCloud, Layers } from 'lucide-react';
import { LinkItem } from '../types.ts';
import { normalizeUrl, extractDomain } from '../utils/urlHelper.ts';

interface BatchImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (newLinks: Omit<LinkItem, 'id' | 'createdAt' | 'openCount'>[]) => void;
  categories: string[];
}

export const BatchImportModal: React.FC<BatchImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
  categories,
}) => {
  const [text, setText] = useState('');
  const [targetCategory, setTargetCategory] = useState('Geral');
  const [enableAll, setEnableAll] = useState(true);

  if (!isOpen) return null;

  // Parse lines to preview items
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const parsedItems = lines
    .map((line) => {
      // Look for URL pattern inside the line
      const urlMatch = line.match(/(https?:\/\/[^\s]+|[a-zA-Z0-9-]+\.[a-zA-Z]{2,}[^\s]*)/i);
      if (!urlMatch) return null;

      const matchedUrl = urlMatch[0];
      const normalized = normalizeUrl(matchedUrl);
      const domain = extractDomain(normalized);

      // Remaining text can be title
      const rawTitle = line.replace(matchedUrl, '').replace(/[-–—:|]/g, '').trim();
      const title = rawTitle.length > 0 ? rawTitle : domain.charAt(0).toUpperCase() + domain.slice(1);

      return {
        title,
        url: normalized,
        category: targetCategory,
        enabled: enableAll,
        description: 'Importado em lote',
      };
    })
    .filter(Boolean) as Omit<LinkItem, 'id' | 'createdAt' | 'openCount'>[];

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedItems.length === 0) return;
    onImport(parsedItems);
    setText('');
    onClose();
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
              <UploadCloud className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-white text-base">
              Importação Rápida em Lote
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

        {/* Content */}
        <form onSubmit={handleImportSubmit} className="p-6 space-y-4">
          <p className="text-xs text-slate-300 leading-relaxed">
            Cole uma lista de links (um por linha). Podem ser links simples ou no formato &ldquo;Nome - https://site.com&rdquo;.
          </p>

          <div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={6}
              placeholder={`https://github.com\nhttps://google.com\nNotícias Tech - https://news.ycombinator.com\nhttps://pt.wikipedia.org`}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span>Atribuir à Categoria</span>
              </label>
              <select
                value={targetCategory}
                onChange={(e) => setTargetCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center pt-6">
              <input
                id="enable-all-imported"
                type="checkbox"
                checked={enableAll}
                onChange={(e) => setEnableAll(e.target.checked)}
                className="w-4 h-4 rounded border-slate-600 text-indigo-600 bg-slate-950 focus:ring-indigo-500 cursor-pointer"
              />
              <label htmlFor="enable-all-imported" className="ml-2 text-xs text-slate-300 cursor-pointer select-none">
                Marcar todos como prontos para disparo
              </label>
            </div>
          </div>

          {/* Preview summary */}
          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg flex items-center justify-between text-xs text-slate-300">
            <span>Links válidos identificados:</span>
            <span className="font-mono font-bold text-indigo-400 tabular-nums">
              {parsedItems.length} links
            </span>
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={parsedItems.length === 0}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors shadow-md shadow-indigo-900/30 cursor-pointer"
            >
              Importar {parsedItems.length > 0 ? `(${parsedItems.length})` : ''}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
