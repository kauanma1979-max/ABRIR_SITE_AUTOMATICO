import React, { useState, useEffect } from 'react';
import { X, Globe, Tag, AlignLeft, CheckCircle2 } from 'lucide-react';
import { LinkItem } from '../types.ts';
import { normalizeUrl, extractDomain } from '../utils/urlHelper.ts';

interface AddEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Partial<LinkItem> & { id?: string }) => void;
  editItem?: LinkItem | null;
  categories: string[];
}

export const AddEditModal: React.FC<AddEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editItem,
  categories,
}) => {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('Geral');
  const [customCategory, setCustomCategory] = useState('');
  const [description, setDescription] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editItem) {
      setTitle(editItem.title);
      setUrl(editItem.url);
      setCategory(editItem.category || 'Geral');
      setDescription(editItem.description || '');
      setEnabled(editItem.enabled);
      setCustomCategory('');
    } else {
      setTitle('');
      setUrl('');
      setCategory('Geral');
      setDescription('');
      setEnabled(true);
      setCustomCategory('');
    }
    setError('');
  }, [editItem, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('Por favor, informe a URL do link.');
      return;
    }

    const finalUrl = normalizeUrl(url);
    const finalTitle = title.trim() || extractDomain(finalUrl) || 'Novo Link';
    const finalCategory = customCategory.trim() || category || 'Geral';

    onSave({
      ...(editItem ? { id: editItem.id } : {}),
      title: finalTitle,
      url: finalUrl,
      category: finalCategory,
      description: description.trim(),
      enabled,
    });

    onClose();
  };

  const handleUrlBlur = () => {
    if (url.trim() && !title.trim()) {
      const domain = extractDomain(url);
      if (domain) {
        setTitle(domain.charAt(0).toUpperCase() + domain.slice(1));
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-white text-base">
              {editItem ? 'Editar Link' : 'Cadastrar Novo Link'}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-lg text-rose-300 text-xs">
              {error}
            </div>
          )}

          {/* URL Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              URL / Endereço Web <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onBlur={handleUrlBlur}
                placeholder="ex: https://github.com ou google.com"
                autoFocus
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono"
              />
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Não se preocupe se esquecer o &ldquo;https://&rdquo;, adicionamos automaticamente.
            </span>
          </div>

          {/* Title Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Título / Nome do Link
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ex: Meu Dashboard, Repositório GitHub"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Category Dropdown & Custom */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-indigo-400" />
                <span>Categoria</span>
              </label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  if (e.target.value !== '__custom__') {
                    setCustomCategory('');
                  }
                }}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
                <option value="__custom__">+ Nova categoria personalizada</option>
              </select>
            </div>

            {category === '__custom__' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Nome da Nova Categoria
                </label>
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="Nome da categoria..."
                  className="w-full px-3 py-2 bg-slate-950 border border-indigo-500 rounded-lg text-sm text-white focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <AlignLeft className="w-3.5 h-3.5 text-indigo-400" />
              <span>Descrição / Observação (Opcional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Para que serve este link ou instruções de uso..."
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Enabled Checkbox */}
          <div className="pt-2 flex items-center gap-3">
            <input
              id="enabled-checkbox"
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="w-4 h-4 rounded border-slate-600 text-indigo-600 bg-slate-950 focus:ring-indigo-500 cursor-pointer"
            />
            <label htmlFor="enabled-checkbox" className="text-xs text-slate-300 cursor-pointer select-none">
              Incluir este link no botão de <strong>disparo em massa</strong> (&ldquo;Acionar Todos&rdquo;)
            </label>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-lg transition-colors shadow-md shadow-indigo-900/30 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{editItem ? 'Salvar Alterações' : 'Cadastrar Link'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
