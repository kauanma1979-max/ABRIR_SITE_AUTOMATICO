import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  Grid,
  List,
  Filter,
  CheckSquare,
  Square,
  Trash2,
  Power,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Plus,
  BookmarkCheck,
  Zap,
} from 'lucide-react';
import { LinkItem, LaunchMode } from './types.ts';
import {
  loadLinksFromStorage,
  saveLinksToStorage,
  loadCategoriesFromStorage,
  saveCategoriesToStorage,
  INITIAL_LINKS,
  DEFAULT_CATEGORIES,
} from './utils/storage.ts';
import { LaunchController, normalizeUrl } from './utils/urlHelper.ts';
import { Navbar } from './components/Navbar.tsx';
import { LaunchBanner } from './components/LaunchBanner.tsx';
import { CategoryFilter } from './components/CategoryFilter.tsx';
import { LinkCard } from './components/LinkCard.tsx';
import { LinkRow } from './components/LinkRow.tsx';
import { AddEditModal } from './components/AddEditModal.tsx';
import { BatchImportModal } from './components/BatchImportModal.tsx';
import { ExportImportModal } from './components/ExportImportModal.tsx';
import { DeleteConfirmModal } from './components/DeleteConfirmModal.tsx';
import { PopupHelpModal } from './components/PopupHelpModal.tsx';

export default function App() {
  // State
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'categories'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Launch state
  const [launchMode, setLaunchMode] = useState<LaunchMode>('safe_500');
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchProgress, setLaunchProgress] = useState({ current: 0, total: 0 });
  const [hasBlockedPopups, setHasBlockedPopups] = useState(false);
  const launchControllerRef = useRef<LaunchController | null>(null);

  // Modals state
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LinkItem | null>(null);
  const [isBatchImportOpen, setIsBatchImportOpen] = useState(false);
  const [isExportImportOpen, setIsExportImportOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    targetItem?: LinkItem | null;
    isBatch?: boolean;
  }>({ isOpen: false, targetItem: null, isBatch: false });

  // Toast notification & Undo stack
  const [toast, setToast] = useState<{
    id: number;
    message: string;
    undoAction?: () => void;
  } | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const loadedLinks = loadLinksFromStorage();
    const loadedCategories = loadCategoriesFromStorage();
    setLinks(loadedLinks);
    setCategories(loadedCategories);
  }, []);

  // Save links to localStorage whenever they change
  const updateLinks = (newLinks: LinkItem[]) => {
    setLinks(newLinks);
    saveLinksToStorage(newLinks);
  };

  const updateCategories = (newCategories: string[]) => {
    setCategories(newCategories);
    saveCategoriesToStorage(newCategories);
  };

  const showToast = (message: string, undoAction?: () => void) => {
    const toastId = Date.now();
    setToast({ id: toastId, message, undoAction });
    setTimeout(() => {
      setToast((prev) => (prev?.id === toastId ? null : prev));
    }, 4500);
  };

  // Add or update link
  const handleSaveLink = (data: Partial<LinkItem> & { id?: string }) => {
    if (data.id) {
      // Edit existing
      const updated = links.map((item) =>
        item.id === data.id
          ? {
              ...item,
              title: data.title || item.title,
              url: data.url || item.url,
              category: data.category || item.category,
              description: data.description ?? item.description,
              enabled: data.enabled !== undefined ? data.enabled : item.enabled,
            }
          : item
      );
      updateLinks(updated);
      showToast('Link atualizado com sucesso!');
    } else {
      // Add new
      const newItem: LinkItem = {
        id: `link-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: data.title || 'Sem título',
        url: data.url || '',
        category: data.category || 'Geral',
        description: data.description || '',
        enabled: data.enabled !== undefined ? data.enabled : true,
        createdAt: Date.now(),
        openCount: 0,
      };
      updateLinks([newItem, ...links]);

      // If new category, register it
      if (data.category && !categories.includes(data.category)) {
        updateCategories([...categories, data.category]);
      }

      showToast('Novo link cadastrado!');
    }
  };

  // Batch import links
  const handleBatchImport = (newItems: Omit<LinkItem, 'id' | 'createdAt' | 'openCount'>[]) => {
    const timestamp = Date.now();
    const fullItems: LinkItem[] = newItems.map((item, idx) => ({
      ...item,
      id: `link-${timestamp}-${idx}`,
      createdAt: timestamp,
      openCount: 0,
    }));

    const combined = [...fullItems, ...links];
    updateLinks(combined);

    // Auto-register any new categories
    const allImportedCats = Array.from(new Set(newItems.map((i) => i.category)));
    const updatedCats = Array.from(new Set([...categories, ...allImportedCats]));
    updateCategories(updatedCats);

    showToast(`${fullItems.length} links importados com sucesso!`);
  };

  // Delete single link with undo
  const handleDeleteLink = (target: LinkItem) => {
    const previousLinks = [...links];
    const updated = links.filter((item) => item.id !== target.id);
    updateLinks(updated);

    // Clean from selected
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(target.id);
      return next;
    });

    showToast(`"${target.title}" foi excluído`, () => {
      updateLinks(previousLinks);
      showToast('Link restaurado!');
    });
  };

  // Batch delete with undo
  const handleBatchDelete = () => {
    const previousLinks = [...links];
    const updated = links.filter((item) => !selectedIds.has(item.id));
    const deletedCount = selectedIds.size;
    updateLinks(updated);
    setSelectedIds(new Set());

    showToast(`${deletedCount} links excluídos`, () => {
      updateLinks(previousLinks);
      showToast('Links restaurados!');
    });
  };

  // Toggle selection
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Toggle enable/disable
  const handleToggleEnabled = (id: string) => {
    const updated = links.map((item) =>
      item.id === id ? { ...item, enabled: !item.enabled } : item
    );
    updateLinks(updated);
  };

  // Record opened count
  const handleLinkOpened = (id: string) => {
    setLinks((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              openCount: (item.openCount || 0) + 1,
              lastOpenedAt: Date.now(),
            }
          : item
      )
    );
  };

  // Single link open
  const handleOpenSingle = (link: LinkItem) => {
    window.open(normalizeUrl(link.url), '_blank', 'noopener,noreferrer');
    handleLinkOpened(link.id);
  };

  // Launch controller logic
  const getDelayMs = (mode: LaunchMode): number => {
    switch (mode) {
      case 'immediate':
        return 0;
      case 'safe_250':
        return 250;
      case 'safe_500':
        return 500;
      case 'safe_1000':
        return 1000;
      default:
        return 500;
    }
  };

  const triggerLaunch = async (targets: LinkItem[]) => {
    if (targets.length === 0) return;

    if (launchControllerRef.current) {
      launchControllerRef.current.cancel();
    }

    const controller = new LaunchController();
    launchControllerRef.current = controller;

    setIsLaunching(true);
    setLaunchProgress({ current: 0, total: targets.length });

    const delayMs = getDelayMs(launchMode);

    const { opened, blocked } = await controller.launch({
      urls: targets.map((t) => ({ id: t.id, url: t.url, title: t.title })),
      delayMs,
      onProgress: (current, total) => {
        setLaunchProgress({ current, total });
      },
      onLinkOpened: (id) => {
        handleLinkOpened(id);
      },
    });

    setIsLaunching(false);

    if (blocked > 0) {
      setHasBlockedPopups(true);
      showToast(`${opened} abertos. ${blocked} bloqueados pelo navegador.`);
    } else {
      showToast(`${opened} links abertos com sucesso!`);
    }

    // Save stats to storage after launch
    setLinks((current) => {
      saveLinksToStorage(current);
      return current;
    });
  };

  // Launch triggers
  const handleLaunchAll = () => {
    const activeLinks = links.filter((l) => l.enabled);
    triggerLaunch(activeLinks);
  };

  const handleLaunchSelected = () => {
    const selected = links.filter((l) => selectedIds.has(l.id));
    triggerLaunch(selected);
  };

  const handleLaunchCategory = () => {
    const categoryLinks = links.filter(
      (l) => l.enabled && l.category === selectedCategory
    );
    triggerLaunch(categoryLinks);
  };

  const handleCancelLaunch = () => {
    if (launchControllerRef.current) {
      launchControllerRef.current.cancel();
    }
    setIsLaunching(false);
    showToast('Disparo interrompido.');
  };

  // Filter & Search computation
  const filteredLinks = useMemo(() => {
    return links.filter((item) => {
      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }

      // Tab filter
      if (activeTab === 'active' && !item.enabled) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchTitle = item.title.toLowerCase().includes(query);
        const matchUrl = item.url.toLowerCase().includes(query);
        const matchCategory = item.category.toLowerCase().includes(query);
        const matchDesc = item.description?.toLowerCase().includes(query);
        return matchTitle || matchUrl || matchCategory || matchDesc;
      }

      return true;
    });
  }, [links, selectedCategory, activeTab, searchQuery]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const link of links) {
      counts[link.category] = (counts[link.category] || 0) + 1;
    }
    return counts;
  }, [links]);

  // Enabled / Ready count for banner
  const readyToLaunchCount = useMemo(() => {
    return links.filter((l) => l.enabled).length;
  }, [links]);

  const categoryActiveCount = useMemo(() => {
    if (selectedCategory === 'all') return readyToLaunchCount;
    return links.filter((l) => l.enabled && l.category === selectedCategory).length;
  }, [links, selectedCategory, readyToLaunchCount]);

  // Selection actions
  const handleSelectAllFiltered = () => {
    const allFilteredIds = filteredLinks.map((l) => l.id);
    setSelectedIds(new Set(allFilteredIds));
  };

  const handleDeselectAll = () => {
    setSelectedIds(new Set());
  };

  const handleBatchEnable = (enabledStatus: boolean) => {
    const updated = links.map((l) =>
      selectedIds.has(l.id) ? { ...l, enabled: enabledStatus } : l
    );
    updateLinks(updated);
    showToast(`${selectedIds.size} links ${enabledStatus ? 'ativados' : 'desativados'}.`);
  };

  const handleCopyAllUrls = () => {
    const urlsToCopy = links.filter((l) => l.enabled).map((l) => normalizeUrl(l.url)).join('\n');
    navigator.clipboard.writeText(urlsToCopy);
    showToast(`${readyToLaunchCount} URLs copiadas para a área de transferência!`);
  };

  const handleRestoreInitialPresets = () => {
    updateLinks(INITIAL_LINKS);
    updateCategories(DEFAULT_CATEGORIES);
    setSelectedIds(new Set());
    showToast('Links padrão restaurados com sucesso!');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Top Bar Navigation (Strict 3-zone contract) */}
      <Navbar
        onOpenNewModal={() => {
          setEditingItem(null);
          setIsAddEditOpen(true);
        }}
        onOpenBatchImport={() => setIsBatchImportOpen(true)}
        onOpenExportImport={() => setIsExportImportOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        totalLinks={links.length}
        activeLinksCount={readyToLaunchCount}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Central Launch Controller (Main Highlight for "acionar todos eles de uma vez") */}
        <LaunchBanner
          totalToLaunch={readyToLaunchCount}
          selectedCount={selectedIds.size}
          currentCategory={selectedCategory}
          categoryCount={categoryActiveCount}
          launchMode={launchMode}
          setLaunchMode={setLaunchMode}
          onLaunchAll={handleLaunchAll}
          onLaunchSelected={handleLaunchSelected}
          onLaunchCategory={handleLaunchCategory}
          onCancelLaunch={handleCancelLaunch}
          isLaunching={isLaunching}
          launchProgress={launchProgress}
          hasBlockedPopups={hasBlockedPopups}
          onOpenHelp={() => setIsHelpOpen(true)}
          onCopyAllUrls={handleCopyAllUrls}
        />

        {/* Filter and Control Bar */}
        <div className="space-y-4 mb-6">
          {/* Categories Segmented Bar */}
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            categoryCounts={categoryCounts}
            totalLinks={links.length}
            onAddCategory={(newCat) => {
              if (!categories.includes(newCat)) {
                updateCategories([...categories, newCat]);
                setSelectedCategory(newCat);
                showToast(`Categoria "${newCat}" criada!`);
              }
            }}
          />

          {/* Search, View Modes & Batch Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por título, site ou anotação..."
                className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-800/80 border border-slate-700/80 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Quick Actions & View Switcher */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Select All / Deselect All */}
              {filteredLinks.length > 0 && (
                <button
                  type="button"
                  onClick={
                    selectedIds.size === filteredLinks.length && filteredLinks.length > 0
                      ? handleDeselectAll
                      : handleSelectAllFiltered
                  }
                  className="px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700/80 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {selectedIds.size === filteredLinks.length && filteredLinks.length > 0 ? (
                    <>
                      <CheckSquare className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Desmarcar todos</span>
                    </>
                  ) : (
                    <>
                      <Square className="w-3.5 h-3.5" />
                      <span>Selecionar visíveis ({filteredLinks.length})</span>
                    </>
                  )}
                </button>
              )}

              {/* View Switcher */}
              <div className="flex items-center p-0.5 bg-slate-800 border border-slate-700 rounded-lg">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded text-xs transition-colors cursor-pointer ${
                    viewMode === 'grid' ? 'bg-slate-700 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Visualização em Grade"
                >
                  <Grid className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded text-xs transition-colors cursor-pointer ${
                    viewMode === 'table' ? 'bg-slate-700 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Visualização em Tabela Compacta"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Batch Floating / Action Bar when items selected */}
          {selectedIds.size > 0 && (
            <div className="p-3 bg-indigo-950/40 border border-indigo-800/70 rounded-xl flex flex-wrap items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-2 text-xs font-medium text-indigo-200">
                <BookmarkCheck className="w-4 h-4 text-indigo-400" />
                <span>
                  <strong>{selectedIds.size}</strong> {selectedIds.size === 1 ? 'link selecionado' : 'links selecionados'}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleLaunchSelected}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Acionar Selecionados</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleBatchEnable(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors cursor-pointer"
                >
                  <Power className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Ativar</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleBatchEnable(false)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors cursor-pointer"
                >
                  <Power className="w-3.5 h-3.5 text-slate-400" />
                  <span>Desativar</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDeleteModalState({ isOpen: true, targetItem: null, isBatch: true });
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-300 hover:text-white bg-rose-950/40 hover:bg-rose-900/60 rounded-lg border border-rose-800/60 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Excluir Selecionados</span>
                </button>

                <button
                  type="button"
                  onClick={handleDeselectAll}
                  className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Links Display (Grid or Table) */}
        {filteredLinks.length === 0 ? (
          /* Empty State */
          <div className="py-16 px-4 text-center border border-dashed border-slate-700/80 rounded-2xl bg-slate-800/30">
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400 mb-3">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">
              {searchQuery
                ? 'Nenhum link encontrado para esta busca'
                : selectedCategory !== 'all'
                ? `Nenhum link na categoria "${selectedCategory}"`
                : 'Nenhum link cadastrado ainda'}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6">
              {searchQuery
                ? 'Tente buscar por outro termo ou limpe a barra de pesquisa.'
                : 'Cadastre seus links favoritos de trabalho, estudo e rotina para acioná-los em massa com facilidade.'}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setEditingItem(null);
                  setIsAddEditOpen(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Cadastrar Primeiro Link</span>
              </button>
              {links.length === 0 && (
                <button
                  type="button"
                  onClick={handleRestoreInitialPresets}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Carregar Exemplos Prontos</span>
                </button>
              )}
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLinks.map((link) => (
              <LinkCard
                key={link.id}
                link={link}
                isSelected={selectedIds.has(link.id)}
                onToggleSelect={handleToggleSelect}
                onToggleEnabled={handleToggleEnabled}
                onOpenSingle={handleOpenSingle}
                onEdit={(item) => {
                  setEditingItem(item);
                  setIsAddEditOpen(true);
                }}
                onDelete={(item) => {
                  setDeleteModalState({ isOpen: true, targetItem: item, isBatch: false });
                }}
              />
            ))}
          </div>
        ) : (
          /* High-Density Table View */
          <div className="overflow-x-auto border border-slate-700/80 rounded-xl bg-slate-800/40">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/80 text-slate-400 font-semibold border-b border-slate-700/80">
                <tr>
                  <th className="px-4 py-3 w-8">
                    <span className="sr-only">Seleção</span>
                  </th>
                  <th className="px-4 py-3">Link & Domínio</th>
                  <th className="px-4 py-3">Categoria</th>
                  <th className="px-4 py-3 text-right">Aberturas</th>
                  <th className="px-4 py-3 text-center">Ativo</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredLinks.map((link) => (
                  <LinkRow
                    key={link.id}
                    link={link}
                    isSelected={selectedIds.has(link.id)}
                    onToggleSelect={handleToggleSelect}
                    onToggleEnabled={handleToggleEnabled}
                    onOpenSingle={handleOpenSingle}
                    onEdit={(item) => {
                      setEditingItem(item);
                      setIsAddEditOpen(true);
                    }}
                    onDelete={(item) => {
                      setDeleteModalState({ isOpen: true, targetItem: item, isBatch: false });
                    }}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer info: Claim-to-proof and quick restore */}
        <div className="mt-12 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span>LinkLauncher Pro</span>
            <span aria-hidden="true">·</span>
            <span>Armazenamento local e seguro no seu navegador</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleRestoreInitialPresets}
              className="text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer"
            >
              Restaurar links sugeridos
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => setIsHelpOpen(true)}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Ajuda com pop-ups
            </button>
          </div>
        </div>
      </main>

      {/* Toast Notification with Undo */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-xl shadow-2xl animate-in slide-in-from-bottom-2 text-xs">
          <span>{toast.message}</span>
          {toast.undoAction && (
            <button
              type="button"
              onClick={() => {
                toast.undoAction?.();
                setToast(null);
              }}
              className="px-2.5 py-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 bg-indigo-950/60 rounded border border-indigo-800/60 transition-colors cursor-pointer"
            >
              Desfazer
            </button>
          )}
        </div>
      )}

      {/* Modals */}
      <AddEditModal
        isOpen={isAddEditOpen}
        onClose={() => {
          setIsAddEditOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSaveLink}
        editItem={editingItem}
        categories={categories}
      />

      <BatchImportModal
        isOpen={isBatchImportOpen}
        onClose={() => setIsBatchImportOpen(false)}
        onImport={handleBatchImport}
        categories={categories}
      />

      <ExportImportModal
        isOpen={isExportImportOpen}
        onClose={() => setIsExportImportOpen(false)}
        links={links}
        categories={categories}
        onImportFullData={(importedLinks, importedCats) => {
          updateLinks(importedLinks);
          updateCategories(importedCats);
          setSelectedIds(new Set());
          showToast(`${importedLinks.length} links restaurados com sucesso!`);
        }}
      />

      <DeleteConfirmModal
        isOpen={deleteModalState.isOpen}
        onClose={() => setDeleteModalState({ isOpen: false, targetItem: null, isBatch: false })}
        onConfirm={() => {
          if (deleteModalState.isBatch) {
            handleBatchDelete();
          } else if (deleteModalState.targetItem) {
            handleDeleteLink(deleteModalState.targetItem);
          }
        }}
        targetItem={deleteModalState.targetItem}
        count={deleteModalState.isBatch ? selectedIds.size : 1}
      />

      <PopupHelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
}
