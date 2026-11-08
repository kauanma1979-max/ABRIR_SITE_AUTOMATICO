import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { LinkItem } from '../types.ts';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  targetItem?: LinkItem | null;
  count?: number;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  targetItem,
  count = 1,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-950/60 border border-rose-800/60 flex items-center justify-center text-rose-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {targetItem ? 'Excluir Link' : `Excluir ${count} Links Selecionados`}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Esta ação removerá o link da sua lista.
              </p>
            </div>
          </div>

          <div className="mt-4 p-3 bg-slate-950/60 border border-slate-800 rounded-lg text-xs text-slate-300">
            {targetItem ? (
              <div>
                <p className="font-semibold text-white truncate">{targetItem.title}</p>
                <p className="text-slate-400 truncate font-mono text-[11px] mt-0.5">{targetItem.url}</p>
              </div>
            ) : (
              <p>
                Você tem certeza que deseja deletar permanentemente os <strong>{count}</strong> links selecionados?
              </p>
            )}
          </div>

          <div className="mt-6 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors shadow-md shadow-rose-900/40 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Sim, Excluir</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
