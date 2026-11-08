import React, { useState } from 'react';
import { ExternalLink, Edit2, Trash2, Globe, Copy, Check } from 'lucide-react';
import { LinkItem } from '../types.ts';
import { getFaviconUrl, extractDomain, normalizeUrl } from '../utils/urlHelper.ts';

interface LinkRowProps {
  link: LinkItem;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onToggleEnabled: (id: string) => void;
  onOpenSingle: (link: LinkItem) => void;
  onEdit: (link: LinkItem) => void;
  onDelete: (link: LinkItem) => void;
}

export const LinkRow: React.FC<LinkRowProps> = ({
  link,
  isSelected,
  onToggleSelect,
  onToggleEnabled,
  onOpenSingle,
  onEdit,
  onDelete,
}) => {
  const [faviconError, setFaviconError] = useState(false);
  const [copied, setCopied] = useState(false);

  const favicon = getFaviconUrl(link.url);
  const domain = extractDomain(link.url);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(normalizeUrl(link.url));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <tr
      className={`border-b border-slate-700/60 transition-colors ${
        isSelected ? 'bg-indigo-950/20' : 'hover:bg-slate-800/50'
      } ${!link.enabled ? 'opacity-60' : ''}`}
    >
      <td className="px-4 py-3 whitespace-nowrap w-8">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(link.id)}
          aria-label={`Selecionar ${link.title}`}
          className="w-4 h-4 rounded border-slate-600 text-indigo-600 bg-slate-900 focus:ring-indigo-500 cursor-pointer"
        />
      </td>

      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded bg-slate-900 border border-slate-700/80 flex items-center justify-center shrink-0 overflow-hidden">
            {!faviconError && favicon ? (
              <img
                src={favicon}
                alt=""
                referrerPolicy="no-referrer"
                onError={() => setFaviconError(true)}
                className="w-4 h-4 object-contain"
              />
            ) : (
              <Globe className="w-3.5 h-3.5 text-slate-400" />
            )}
          </div>
          <div className="min-w-0">
            <span className="font-semibold text-sm text-white block truncate">
              {link.title}
            </span>
            <span className="text-xs text-slate-400 block truncate font-mono">
              {domain}
            </span>
          </div>
        </div>
      </td>

      <td className="px-4 py-3 text-xs text-slate-300 font-medium whitespace-nowrap">
        {link.category || 'Geral'}
      </td>

      <td className="px-4 py-3 text-xs text-slate-400 font-mono tabular-nums whitespace-nowrap text-right">
        {link.openCount} {link.openCount === 1 ? 'vez' : 'vezes'}
      </td>

      <td className="px-4 py-3 whitespace-nowrap text-center">
        <label className="inline-flex items-center cursor-pointer" title={link.enabled ? 'Ativo no disparo' : 'Desativado'}>
          <input
            type="checkbox"
            checked={link.enabled}
            onChange={() => onToggleEnabled(link.id)}
            className="sr-only peer"
          />
          <div className="w-7 h-4 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-indigo-600 relative"></div>
        </label>
      </td>

      <td className="px-4 py-3 text-right whitespace-nowrap">
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => onOpenSingle(link)}
            className="p-1.5 text-indigo-400 hover:text-white hover:bg-indigo-600 rounded-md transition-colors cursor-pointer"
            title="Abrir este link"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-md transition-colors cursor-pointer"
            title="Copiar link"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            type="button"
            onClick={() => onEdit(link)}
            className="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-slate-700 rounded-md transition-colors cursor-pointer"
            title="Editar"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(link)}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-md transition-colors cursor-pointer"
            title="Deletar"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
};
