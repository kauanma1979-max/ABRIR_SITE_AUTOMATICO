import React from 'react';
import { Plus } from 'lucide-react';

interface NavbarProps {
  onOpenNewModal: () => void;
  onOpenBatchImport: () => void;
  onOpenExportImport: () => void;
  onOpenHelp: () => void;
  activeTab: 'all' | 'active' | 'categories';
  setActiveTab: (tab: 'all' | 'active' | 'categories') => void;
  totalLinks: number;
  activeLinksCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenNewModal,
  onOpenBatchImport,
  onOpenExportImport,
  onOpenHelp,
  activeTab,
  setActiveTab,
  totalLinks,
  activeLinksCount,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-900/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand title, one line */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center shadow-inner text-white font-bold text-lg">
            ⚡
          </div>
          <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap">
            LinkLauncher
          </span>
        </div>

        {/* Zone 2: Concise single-line navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`transition-colors whitespace-nowrap py-1 cursor-pointer ${
              activeTab === 'all'
                ? 'text-white border-b-2 border-indigo-500 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Todos os Links ({totalLinks})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('active')}
            className={`transition-colors whitespace-nowrap py-1 cursor-pointer ${
              activeTab === 'active'
                ? 'text-white border-b-2 border-indigo-500 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Prontos para Disparo ({activeLinksCount})
          </button>

          <button
            type="button"
            onClick={onOpenBatchImport}
            className="text-slate-400 hover:text-white transition-colors whitespace-nowrap py-1 cursor-pointer"
          >
            Importar em Lote
          </button>

          <button
            type="button"
            onClick={onOpenExportImport}
            className="text-slate-400 hover:text-white transition-colors whitespace-nowrap py-1 cursor-pointer"
          >
            Backup & Exportar
          </button>

          <button
            type="button"
            onClick={onOpenHelp}
            className="text-slate-400 hover:text-white transition-colors whitespace-nowrap py-1 cursor-pointer"
          >
            Dicas de Pop-up
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenNewModal}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 active:bg-indigo-700 transition-colors whitespace-nowrap shadow-sm shadow-indigo-900/30 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Cadastrar Link
          </button>
        </div>
      </div>
    </header>
  );
};
