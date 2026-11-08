import React, { useState } from 'react';
import { Plus, Folder } from 'lucide-react';

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  categoryCounts: Record<string, number>;
  totalLinks: number;
  onAddCategory: (newCategory: string) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  categoryCounts,
  totalLinks,
  onAddCategory,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newCatInput, setNewCatInput] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatInput.trim()) return;
    onAddCategory(newCatInput.trim());
    setNewCatInput('');
    setIsAdding(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-800/90 border border-slate-700/80 rounded-xl overflow-x-auto">
      {/* All Links Tab */}
      <button
        type="button"
        onClick={() => onSelectCategory('all')}
        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
          selectedCategory === 'all'
            ? 'bg-indigo-600 text-white shadow-sm'
            : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
        }`}
      >
        <span>Todas</span>
        <span className={`text-[11px] font-mono tabular-nums px-1.5 py-0.2 rounded ${
          selectedCategory === 'all' ? 'bg-indigo-700/80 text-white' : 'bg-slate-900/60 text-slate-400'
        }`}>
          {totalLinks}
        </span>
      </button>

      {/* Individual Categories */}
      {categories.map((cat) => {
        const count = categoryCounts[cat] || 0;
        const isActive = selectedCategory === cat;
        return (
          <button
            key={cat}
            type="button"
            onClick={() => onSelectCategory(cat)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              isActive
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <span>{cat}</span>
            <span className={`text-[11px] font-mono tabular-nums px-1.5 py-0.2 rounded ${
              isActive ? 'bg-indigo-700/80 text-white' : 'bg-slate-900/60 text-slate-400'
            }`}>
              {count}
            </span>
          </button>
        );
      })}

      {/* Add Category Inline */}
      {isAdding ? (
        <form onSubmit={handleCreate} className="flex items-center gap-1 pl-1">
          <input
            type="text"
            value={newCatInput}
            onChange={(e) => setNewCatInput(e.target.value)}
            placeholder="Nova categoria..."
            autoFocus
            className="px-2 py-1 text-xs bg-slate-900 border border-indigo-500 rounded text-white focus:outline-none w-32"
          />
          <button
            type="submit"
            className="px-2 py-1 text-xs font-semibold bg-indigo-600 text-white rounded hover:bg-indigo-500 cursor-pointer"
          >
            OK
          </button>
          <button
            type="button"
            onClick={() => setIsAdding(false)}
            className="px-1.5 py-1 text-xs text-slate-400 hover:text-white cursor-pointer"
          >
            ✕
          </button>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className="px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:text-indigo-300 hover:bg-slate-700/50 rounded-lg transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap"
          title="Criar nova categoria"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Categoria</span>
        </button>
      )}
    </div>
  );
};
