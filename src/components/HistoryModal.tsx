import React, { useState, useEffect } from 'react';
import { X, Trash2, Download, Upload } from 'lucide-react';
import { OrderState } from '../types/order';
import { fmt } from '../utils/format';

interface HistoryItem extends OrderState {
  timestamp: number;
  total: number;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (order: OrderState) => void;
}

const HISTORY_KEY = 'vbs_orders_history';

const HistoryModal: React.FC<Props> = ({ isOpen, onClose, onSelect }) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem(HISTORY_KEY);
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    }
  }, [isOpen]);

  const handleDelete = (timestamp: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Excluir este pedido do histórico?')) return;
    const newHistory = history.filter(h => h.timestamp !== timestamp);
    setHistory(newHistory);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
  };

  const handleExport = () => {
    const data = JSON.stringify(history, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VBS_Backup_Pedidos_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (!Array.isArray(imported)) throw new Error('Formato inválido');
        
        const combined = [...imported, ...history];
        const unique = Array.from(new Map(combined.map(item => [item.timestamp, item])).values());
        unique.sort((a, b) => b.timestamp - a.timestamp);
        
        setHistory(unique.slice(0, 100));
        localStorage.setItem(HISTORY_KEY, JSON.stringify(unique.slice(0, 100)));
        alert('Histórico importado com sucesso!');
      } catch (err) {
        alert('Erro ao importar backup.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-coal w-full max-w-2xl rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
          <div>
            <h2 className="text-white font-bold text-xl tracking-tight">Histórico de Pedidos</h2>
            <p className="text-zinc-500 text-xs uppercase tracking-widest mt-1">Últimos 100 registros</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {history.length === 0 ? (
            <div className="py-20 text-center text-zinc-600 italic">Nenhum pedido salvo ainda.</div>
          ) : (
            history.map((order) => (
              <div 
                key={order.timestamp}
                onClick={() => onSelect(order)}
                className="group p-4 bg-zinc-900/40 border border-zinc-800/60 rounded-xl hover:border-gold/40 hover:bg-zinc-800/40 transition-all cursor-pointer flex justify-between items-center"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <span className="text-gold font-mono font-bold text-sm">#{order.orderNumber}</span>
                    <span className="text-zinc-500 text-[0.7rem]">{order.orderDate}</span>
                  </div>
                  <span className="text-zinc-200 font-medium text-sm">{order.client.name || 'Cliente sem nome'}</span>
                  <span className="text-zinc-500 text-[0.65rem] truncate max-w-[300px]">
                    {order.items.map(i => i.product).filter(Boolean).join(', ') || 'Nenhum item'}
                  </span>
                </div>
                <div className="flex items-center gap-6">
                  <span className="text-white font-mono font-bold">{fmt(order.total)}</span>
                  <button 
                    onClick={(e) => handleDelete(order.timestamp, e)}
                    className="p-2 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 bg-zinc-900/80 border-t border-zinc-800 flex justify-between items-center">
          <div className="flex gap-2">
            <label className="flex items-center gap-2 px-4 py-2 bg-zinc-800 text-zinc-300 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-zinc-700 transition-all cursor-pointer">
              <Upload size={14} /> Importar
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>
            <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-zinc-800 text-zinc-300 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-zinc-700 transition-all">
              <Download size={14} /> Exportar
            </button>
          </div>
          <span className="text-zinc-500 text-[0.6rem] uppercase tracking-widest">{history.length} Pedidos</span>
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;
