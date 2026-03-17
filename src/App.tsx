import React, { useState, useRef, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import { OrderState, OrderItem, ClientData } from './types/order';
import { toNumber, filterVisibleItems, fmt, sanitize } from './utils/format';
import Header from './components/Header';
import ClientInfo from './components/ClientInfo';
import OrderTable from './components/OrderTable';
import Totals from './components/Totals';
import Observations from './components/Observations';
import HistoryModal from './components/HistoryModal';
import { Printer, RotateCcw, History as HistoryIcon } from 'lucide-react';

const HISTORY_KEY = 'vbs_orders_history';

const INITIAL_STATE: OrderState = {
  orderNumber: '0001',
  orderDate: new Date().toLocaleDateString('pt-BR'),
  client: { name: '', doc: '', phone: '', email: '', rua: '', bairro: '', cidade: '' },
  items: [{ id: '1', n: 1, product: '', description: '', unitValue: '', quantity: '1', total: 0 }],
  discount: '0',
  observations: ''
};

const App: React.FC = () => {
  const [state, setState] = useState<OrderState>(() => {
    const saved = localStorage.getItem('vbs_last_order');
    if (saved) return JSON.parse(saved);
    
    const lastNum = localStorage.getItem('vbs_last_order_num') || '0';
    const nextNum = (parseInt(lastNum) + 1).toString().padStart(4, '0');
    return { ...INITIAL_STATE, orderNumber: nextNum };
  });

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const componentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('vbs_last_order', JSON.stringify(state));
  }, [state]);

  const handleClientChange = (field: keyof ClientData, value: string) => {
    setState(prev => ({ ...prev, client: { ...prev.client, [field]: value } }));
  };

  const handleItemUpdate = (id: string, field: keyof OrderItem, value: any) => {
    setState(prev => ({
      ...prev,
      items: prev.items.map(item => item.id === id ? { ...item, [field]: value } : item)
    }));
  };

  const addItem = () => {
    setState(prev => ({
      ...prev,
      items: [...prev.items, {
        id: Math.random().toString(36).substr(2, 9),
        n: prev.items.length + 1,
        product: '',
        description: '',
        unitValue: '',
        quantity: '1',
        total: 0
      }]
    }));
  };

  const removeItem = (id: string) => {
    if (state.items.length <= 1) return;
    setState(prev => ({ ...prev, items: prev.items.filter(item => item.id !== id) }));
  };

  const clearAll = () => {
    if (confirm('Tem certeza que deseja limpar todo o pedido?')) {
      const lastNum = localStorage.getItem('vbs_last_order_num') || '0';
      const nextNum = (parseInt(lastNum) + 1).toString().padStart(4, '0');
      setState({ ...INITIAL_STATE, orderNumber: nextNum });
    }
  };

  const subtotal = state.items.reduce((acc, item) => acc + (toNumber(item.unitValue) * toNumber(item.quantity)), 0);
  const totalGeral = Math.max(0, subtotal - toNumber(state.discount));

  const saveToHistory = () => {
    const hasClient = state.client.name.trim().length > 0;
    const hasItems = state.items.some(i => i.product.trim().length > 0);

    if (!hasClient || !hasItems) return;

    const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    const newEntry = {
      ...state,
      timestamp: Date.now(),
      total: totalGeral
    };

    // Update if same order number exists, or prepend
    const existingIdx = history.findIndex((h: any) => h.orderNumber === state.orderNumber);
    if (existingIdx >= 0) {
      history[existingIdx] = newEntry;
    } else {
      history.unshift(newEntry);
    }

    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 100)));
  };

  const incrementOrder = () => {
    const currentNum = parseInt(state.orderNumber);
    localStorage.setItem('vbs_last_order_num', currentNum.toString());
    const nextNum = (currentNum + 1).toString().padStart(4, '0');
    setState(prev => ({ ...prev, orderNumber: nextNum }));
  };

  // Dynamic Scaling Logic for edge cases
  const [scale, setScale] = useState(1);
  
  useEffect(() => {
    if (componentRef.current && (state.items.length > 15 || state.observations.length > 200)) {
      const height = componentRef.current.scrollHeight;
      const a4Height = 1122; // ~297mm at 96dpi
      if (height > a4Height) {
        const newScale = Math.max(0.85, a4Height / height);
        setScale(newScale);
      } else {
        setScale(1);
      }
    } else {
      setScale(1);
    }
  }, [state.items.length, state.observations]);

  // Lógica de Impressão
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    onBeforeGetContent: async () => {
      // Sanitização Profissional Proativa antes da captura
      setState(prev => ({
        ...prev,
        client: Object.fromEntries(
          Object.entries(prev.client).map(([k, v]) => [k, sanitize(v)])
        ) as unknown as ClientData,
        items: prev.items.map(item => ({
          ...item,
          product: sanitize(item.product),
          description: sanitize(item.description)
        })),
        observations: sanitize(prev.observations)
      }));

      const filtered = filterVisibleItems(state.items);
      if (filtered.length === 0) {
        alert('Adicione ao menos um produto válido.');
        throw new Error('Cancel print');
      }
    },
    onAfterPrint: () => {
      saveToHistory();
      incrementOrder();
    },
    documentTitle: `VB_Snooker_Pedido_${state.orderNumber}`,
  });

  const handleHistorySelect = (order: OrderState) => {
    setState(order);
    setIsHistoryOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col pb-20">
      {/* TOOLBAR */}
      <div className="sticky top-0 z-50 bg-coal/80 backdrop-blur-md border-b border-zinc-800 px-6 py-3 flex justify-between items-center shadow-xl print:hidden">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10">
            <img src="/assets/logo.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col">
            <span className="text-white font-brand font-bold text-lg leading-none tracking-widest">VB <span className="text-gold">SNOOKER</span></span>
            <span className="text-zinc-500 text-[0.6rem] uppercase tracking-[0.2em]">Order System v2.0</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={clearAll} className="flex items-center gap-2 px-4 py-2 text-zinc-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">
            <RotateCcw size={14} /> Limpar
          </button>
          <button onClick={() => setIsHistoryOpen(true)} className="flex items-center gap-2 px-4 py-2 border border-zinc-700 rounded-md text-zinc-300 hover:bg-zinc-800 transition-all text-xs font-bold uppercase tracking-widest">
            <HistoryIcon size={14} /> Histórico
          </button>
          <button onClick={() => handlePrint()} className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-gold to-green-2 text-white rounded-md hover:shadow-[0_0_20px_rgba(18,161,95,0.4)] transition-all text-xs font-bold uppercase tracking-widest">
            <Printer size={14} /> Imprimir / PDF
          </button>
        </div>
      </div>

      {/* DOCUMENT AREA */}
      <div className="relative flex-1 flex flex-col items-center">
        <div
          ref={componentRef}
          id="section-to-print"
          style={{ transform: scale !== 1 ? `scale(${scale})` : undefined, transformOrigin: 'top center' }}
          className="document-page relative flex flex-col justify-between print:bg-white min-h-[297mm] h-auto overflow-hidden"
        >
          <div className="flex flex-col flex-1">
            {/* ACCENT BAR */}
            <div className="absolute left-0 top-0 bottom-0 w-[6px] bg-gradient-to-b from-[#12A15F] via-[#008c4a] to-[#12A15F] z-20 pointer-events-none"></div>

            <Header />

            {/* TITLE BAND - EXACT BRAND GREEN */}
            <div className="doc-band bg-[#008c4a] p-[12px_44px_12px_48px] flex justify-between items-center text-white relative z-10 w-full flex-shrink-0">
              <div className="flex items-baseline gap-3">
                <span className="font-serif font-black text-base uppercase tracking-[0.12em]">Pedido de Venda</span>
                <span className="font-mono text-[0.72rem] text-[#A7F3D0] tracking-widest">Nº {state.orderNumber}</span>
              </div>
              <div className="flex items-center gap-4">
                <label className="text-[1rem] uppercase font-extrabold tracking-[0.2em]">Data:</label>
                <input
                  className="bg-transparent border-b border-[#008c4a26] text-white font-mono text-[1.05rem] font-bold outline-none w-28 focus:border-white/40 transition-all cursor-pointer"
                  type="text"
                  value={state.orderDate}
                  onChange={(e) => setState(prev => ({ ...prev, orderDate: e.target.value }))}
                />
              </div>
            </div>

            <div className={`flex flex-col flex-1 p-[10px_44px_20px_48px] bg-white print:p-0 ${state.items.length > 5 ? 'gap-2' : 'gap-4'}`}>
              <div className="flex-shrink-0">
                <ClientInfo data={state.client} onChange={handleClientChange} />
              </div>
              
              <div className="flex-grow min-h-0">
                <OrderTable
                  items={state.items}
                  onUpdate={handleItemUpdate}
                  onAdd={addItem}
                  onRemove={removeItem}
                />
              </div>

              {/* DYNAMIC FOOTER GROUP (COLLISION PREVENTION) */}
              <div className="mt-auto flex flex-col flex-shrink gap-[4px] border-t border-zinc-100 pt-4 print:pt-2">
                <Totals
                  subtotal={subtotal}
                  discount={state.discount}
                  onDiscountChange={(val) => setState(prev => ({ ...prev, discount: val }))}
                  isCompressed={state.items.length > 5}
                />
                <Observations
                  value={state.observations}
                  onChange={(val) => setState(prev => ({ ...prev, observations: val }))}
                />
              </div>
            </div>
          </div>

          {/* FOOTER - ALIGNED AT BOTTOM */}
          <div className="mt-auto relative py-6 px-[48px] border-t border-zinc-100 bg-[#F4F4F5] flex justify-between items-center text-[0.65rem] text-[#004a27] font-bold uppercase tracking-wider print:bg-transparent print:border-t print:border-zinc-200 print:px-[10mm] print:pb-8 flex-shrink-0">
            <div className="flex flex-col gap-1">
              <span>VB Snooker Comércio de Materiais Esportivos LTDA</span>
              <span className="opacity-70 text-[0.55rem] text-zinc-800">Sorocaba-SP · Brasileira · Desde 1993</span>
            </div>
            <span className="font-brand font-bold text-gold text-lg opacity-50 tracking-widest italic">VB Snooker</span>
            <span className="font-mono text-xs text-zinc-700 font-bold">{new Date().getFullYear()}</span>
          </div>
        </div>
      </div>

      <HistoryModal 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)} 
        onSelect={handleHistorySelect}
      />
    </div>
  );
};

export default App;
