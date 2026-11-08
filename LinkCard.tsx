import React, { useState } from 'react';
import { ExternalLink, Edit2, Trash2, Globe, Copy, Check } from 'lucide-react';
import { LinkItem } from '../types.ts';
import { getFaviconUrl, extractDomain, normalizeUrl } from '../utils/urlHelper.ts';

interface LinkCardProps {
  link: LinkItem;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onToggleEnabled: (id: string) => void;
  onOpenSingle: (link: LinkItem) => void;
  onEdit: (link: LinkItem) => void;
  onDelete: (link: LinkItem) => void;
}

export const LinkCard: React.FC<LinkCardProps> = ({
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

  const formattedDate = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(link.createdAt));

  return (
    <div
      className={`group relative rounded-xl border p-4 transition-all duration-200 bg-slate-800/70 hover:bg-slate-800/90 ${
        isSelected
          ? 'border-indigo-500/80 shadow-md shadow-indigo-950/30 ring-1 ring-indigo-500/50'
          : 'border-slate-700/70 hover:border-slate-600'
      } ${!link.enabled ? 'opacity-65' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Checkbox and Favicon */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(link.id)}
            aria-label={`Selecionar ${link.title}`}
            className="w-4 h-4 rounded border-slate-600 text-indigo-600 bg-slate-900 focus:ring-indigo-500 focus:ring-offset-slate-900 cursor-pointer"
          />

          <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-700/80 flex items-center justify-center overflow-hidden shrink-0">
            {!faviconError && favicon ? (
              <img
                src={favicon}
                alt=""
                referrerPolicy="no-referrer"
                onError={() => setFaviconError(true)}
                className="w-5 h-5 object-contain"
              />
            ) : (
              <Globe className="w-4 h-4 text-slate-400" />
            )}
          </div>
        </div>

        {/* Enabled Status Toggle */}
        <div className="flex items-center gap-2">
          <label className="inline-flex items-center cursor-pointer" title={link.enabled ? 'Ativo no disparo em massa' : 'Desativado do disparo em massa'}>
            <input
              type="checkbox"
              checked={link.enabled}
              onChange={() => onToggleEnabled(link.id)}
              className="sr-only peer"
            />
            <div className="w-8 h-4 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-indigo-600 relative"></div>
          </label>
        </div>
      </div>

      {/* Main Content */}
      <div className="mt-3">
        <h3 className="font-semibold text-white text-base truncate group-hover:text-indigo-300 transition-colors">
          {link.title}
        </h3>

        <a
          href={normalizeUrl(link.url)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-slate-400 hover:text-indigo-400 truncate block mt-0.5 font-mono"
          title={link.url}
        >
          {link.url}
        </a>

        {link.description && (
          <p className="text-xs text-slate-400 line-clamp-2 mt-2 leading-relaxed">
            {link.description}
          </p>
        )}

        {/* Metadata: Unboxed Text with Typographic Separator (Zero-Pill Compliance) */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-3 pt-3 border-t border-slate-700/50">
          <span className="font-medium text-slate-300">{link.category || 'Geral'}</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>{domain}</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span className="font-mono tabular-nums">{link.openCount} {link.openCount === 1 ? 'abertura' : 'aberturas'}</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span className="text-slate-500">{formattedDate}</span>
        </div>
      </div>

      {/* Action Buttons Toolbar */}
      <div className="mt-3.5 pt-3 border-t border-slate-700/60 flex items-center justify-between gap-1">
        <button
          type="button"
          onClick={() => onOpenSingle(link)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600/90 hover:bg-indigo-600 rounded-md transition-colors cursor-pointer"
          title="Abrir este link individualmente"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Abrir</span>
        </button>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleCopy}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/70 rounded-md transition-colors cursor-pointer"
            title="Copiar link"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={() => onEdit(link)}
            className="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-slate-700/70 rounded-md transition-colors cursor-pointer"
            title="Editar link"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => onDelete(link)}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-md transition-colors cursor-pointer"
            title="Deletar link"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
