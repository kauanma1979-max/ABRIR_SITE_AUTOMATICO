import React, { useState } from 'react';
import { ExternalLink, Copy, Check, AlertTriangle, HelpCircle, StopCircle, Sliders } from 'lucide-react';
import { LaunchMode } from '../types.ts';

interface LaunchBannerProps {
  totalToLaunch: number;
  selectedCount: number;
  currentCategory: string;
  categoryCount: number;
  launchMode: LaunchMode;
  setLaunchMode: (mode: LaunchMode) => void;
  onLaunchAll: () => void;
  onLaunchSelected: () => void;
  onLaunchCategory: () => void;
  onCancelLaunch: () => void;
  isLaunching: boolean;
  launchProgress: { current: number; total: number };
  hasBlockedPopups: boolean;
  onOpenHelp: () => void;
  onCopyAllUrls: () => void;
}

export const LaunchBanner: React.FC<LaunchBannerProps> = ({
  totalToLaunch,
  selectedCount,
  currentCategory,
  categoryCount,
  launchMode,
  setLaunchMode,
  onLaunchAll,
  onLaunchSelected,
  onLaunchCategory,
  onCancelLaunch,
  isLaunching,
  launchProgress,
  hasBlockedPopups,
  onOpenHelp,
  onCopyAllUrls,
}) => {
  const [copied, setCopied] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const handleCopy = () => {
    onCopyAllUrls();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const modeLabels: Record<LaunchMode, string> = {
    immediate: 'Instantâneo (0ms)',
    safe_250: 'Rápido (250ms)',
    safe_500: 'Seguro (500ms - Recomendado)',
    safe_1000: 'Estável (1.000ms)',
  };

  return (
    <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-5 mb-8 shadow-lg shadow-black/20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left Information */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight">
              Central de Disparo de Links
            </h2>
            <span className="text-xs font-mono text-indigo-400 bg-indigo-950/60 border border-indigo-800/50 px-2 py-0.5 rounded">
              {totalToLaunch} prontos
            </span>
          </div>
          <p className="text-sm text-slate-300">
            Abra dezenas de páginas simultaneamente com um único clique ou use intervalos para contornar bloqueadores.
          </p>
        </div>

        {/* Right Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Settings Toggle */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 bg-slate-700/70 hover:bg-slate-700 hover:text-white rounded-lg transition-colors border border-slate-600/60 cursor-pointer"
              title="Configurações de velocidade de abertura"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Intervalo: {launchMode === 'safe_500' ? '500ms' : launchMode === 'safe_250' ? '250ms' : launchMode === 'safe_1000' ? '1s' : '0ms'}</span>
            </button>

            {showSettings && (
              <div className="absolute right-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-20 p-2 text-xs">
                <p className="text-slate-400 font-medium px-2 py-1 mb-1 border-b border-slate-700">
                  Velocidade entre abas:
                </p>
                {(['immediate', 'safe_250', 'safe_500', 'safe_1000'] as LaunchMode[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => {
                      setLaunchMode(mode);
                      setShowSettings(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded transition-colors flex items-center justify-between cursor-pointer ${
                      launchMode === mode
                        ? 'bg-indigo-600/30 text-indigo-300 font-semibold'
                        : 'text-slate-300 hover:bg-slate-700/60'
                    }`}
                  >
                    <span>{modeLabels[mode]}</span>
                    {launchMode === mode && <span className="text-indigo-400">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Copy URLs Button */}
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 bg-slate-700/70 hover:bg-slate-700 hover:text-white rounded-lg transition-colors border border-slate-600/60 cursor-pointer"
            title="Copiar todas as URLs ativas para a área de transferência"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copiados!' : 'Copiar URLs'}</span>
          </button>

          {/* Launch Buttons */}
          {isLaunching ? (
            <button
              type="button"
              onClick={onCancelLaunch}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors shadow-md shadow-rose-950/40 cursor-pointer animate-pulse"
            >
              <StopCircle className="w-4 h-4" />
              <span>Interromper Disparo</span>
            </button>
          ) : selectedCount > 0 ? (
            <button
              type="button"
              onClick={onLaunchSelected}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-lg transition-all shadow-md shadow-indigo-950/50 cursor-pointer hover:scale-[1.02]"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Acionar Selecionados ({selectedCount})</span>
            </button>
          ) : currentCategory !== 'all' ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onLaunchCategory}
                disabled={categoryCount === 0}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all shadow-md shadow-indigo-950/50 cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Abrir Categoria ({categoryCount})</span>
              </button>
              <button
                type="button"
                onClick={onLaunchAll}
                disabled={totalToLaunch === 0}
                className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-700/80 hover:bg-slate-700 rounded-lg transition-colors border border-slate-600 cursor-pointer"
                title="Abrir todos os links cadastrados de todas as categorias"
              >
                <span>Abrir Todos ({totalToLaunch})</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onLaunchAll}
              disabled={totalToLaunch === 0}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all shadow-lg shadow-indigo-950/60 cursor-pointer hover:scale-[1.02]"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Acionar Todos os Links ({totalToLaunch})</span>
            </button>
          )}
        </div>
      </div>

      {/* Launching Progress Status */}
      {isLaunching && (
        <div className="mt-4 pt-4 border-t border-slate-700/80">
          <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5 font-mono">
            <span>Abrindo link {launchProgress.current} de {launchProgress.total}...</span>
            <span>{Math.round((launchProgress.current / launchProgress.total) * 100)}%</span>
          </div>
          <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 transition-all duration-300 ease-out"
              style={{ width: `${(launchProgress.current / launchProgress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Blocked Popups Alert */}
      {hasBlockedPopups && (
        <div className="mt-4 p-3 bg-amber-950/40 border border-amber-700/60 rounded-lg flex items-start justify-between gap-3 text-xs text-amber-200">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-300">
                O navegador pode ter bloqueado algumas abas simultâneas!
              </p>
              <p className="text-amber-200/90 mt-0.5">
                Por padrão de segurança, navegadores como Chrome e Firefox bloqueiam pop-ups em massa.
                Basta clicar no ícone de pop-up bloqueado na barra de endereços e marcar <strong>&ldquo;Sempre permitir&rdquo;</strong>.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenHelp}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-amber-800/60 hover:bg-amber-700/70 text-amber-100 rounded border border-amber-600/50 whitespace-nowrap cursor-pointer transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Como desbloquear</span>
          </button>
        </div>
      )}
    </div>
  );
};
