import React from 'react';
import { X, HelpCircle, CheckCircle, ShieldAlert, Sparkles } from 'lucide-react';

interface PopupHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PopupHelpModal: React.FC<PopupHelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <HelpCircle className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-white text-base">
              Como liberar o disparo de múltiplos links
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
        <div className="p-6 space-y-4 text-xs text-slate-300 leading-relaxed">
          <div className="p-3 bg-amber-950/30 border border-amber-800/40 rounded-xl flex items-start gap-3 text-amber-200">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-300">
                Por que o navegador abre apenas 1 ou 2 abas?
              </p>
              <p className="mt-1 text-amber-200/90 text-xs leading-relaxed">
                Navegadores modernos (Google Chrome, Microsoft Edge, Mozilla Firefox e Safari) possuem uma proteção nativa contra janelas pop-up invasivas. Para permitir que o LinkLauncher abra dezenas de abas solicitadas por você, basta uma autorização única.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">
              Passo a passo no Google Chrome & Microsoft Edge:
            </h4>

            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg space-y-2">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-400 font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
                  1
                </span>
                <p>
                  Clique no botão <strong>&ldquo;Acionar Todos os Links&rdquo;</strong>.
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-400 font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
                  2
                </span>
                <p>
                  Olhe para o canto superior direito da barra de endereço do seu navegador. Você verá um pequeno ícone com um &ldquo;X&rdquo; vermelho ou aviso de <em>&ldquo;Pop-up bloqueado&rdquo;</em>.
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-400 font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
                  3
                </span>
                <p>
                  Clique no ícone e selecione <strong>&ldquo;Sempre permitir pop-ups e redirecionamentos deste site&rdquo;</strong>, depois clique em Concluído.
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-400 font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
                  4
                </span>
                <p>
                  Pronto! Ao clicar novamente em &ldquo;Acionar Todos&rdquo;, todas as dezenas de links abrirão instantaneamente em abas separadas.
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <p>
                <strong className="text-white">Dica Pro:</strong> Você também pode usar a opção de intervalo no botão de engrenagem (ex: 250ms ou 500ms), que abre os links em sequência suave e reduz a chance de bloqueio.
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors cursor-pointer"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Entendi, obrigado!</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
