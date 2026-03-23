import React, { useState, useRef, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { OrderState, OrderItem, ClientData } from './types/order';
import { toNumber, filterVisibleItems, fmt, sanitize } from './utils/format';
import Header from './components/Header';
import ClientInfo from './components/ClientInfo';
import OrderTable from './components/OrderTable';
import Totals from './components/Totals';
import Observations from './components/Observations';
import HistoryModal from './components/HistoryModal';
import { Printer, RotateCcw, History as HistoryIcon, Download, FileDown } from 'lucide-react';

const HISTORY_KEY = 'vbs_orders_history';

const INITIAL_STATE: OrderState = {
  orderNumber: '0001',
  orderDate: new Date().toLocaleDateString('pt-BR'),
  client: { name: '', doc: '', phone: '', email: '', cep: '', rua: '', complemento: '', bairro: '', cidade: '' },
  items: [{ id: '1', n: 1, product: '', description: '', unitValue: '', quantity: '1', total: 0 }],
  discount: '0',
  observations: '',
  paymentMethod: ''
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
  const [isExporting, setIsExporting] = useState(false);
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

  // Dynamic Scaling Logic removed as per instruction for fixed A4 dimensions

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    onBeforeGetContent: async () => {
      // 1. Enter Clean State
      setIsExporting(true);

      // 2. Proactive Sanitization
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
        setIsExporting(false);
        alert('Adicione ao menos um produto válido.');
        throw new Error('Cancel print');
      }

      // Wait for React to render without placeholders
      await new Promise(resolve => setTimeout(resolve, 150));
    },
    onAfterPrint: () => {
      // 3. Restore UI and Log results
      setIsExporting(false);
      saveToHistory();
      incrementOrder();
    },
    documentTitle: `VB_Snooker_Pedido_${state.orderNumber}`,
  });

  const handleSavePDF = async () => {
    if (!componentRef.current) return;
    
    setIsExporting(true);
    
    // Proactive Sanitization
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
      observations: sanitize(prev.observations),
      paymentMethod: sanitize(prev.paymentMethod || '')
    }));

    const filtered = filterVisibleItems(state.items);
    if (filtered.length === 0) {
      setIsExporting(false);
      alert('Adicione ao menos um produto válido.');
      return;
    }

    // Wait for React to render without placeholders
    await new Promise(resolve => setTimeout(resolve, 150));

    try {
      const element = componentRef.current;
      
      // Force element to 800px to prevent horizontal squashing/stretching
      const originalStyle = element.getAttribute('style') || '';
      element.classList.add('export-mode');
      element.setAttribute('style', `${originalStyle} width: 800px !important; max-width: 800px !important; min-width: 800px !important;`);
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 800
      });
      
      element.classList.remove('export-mode');
      element.setAttribute('style', originalStyle);
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfPageHeight = pdf.internal.pageSize.getHeight();
      
      let finalWidth = pdfWidth;
      let finalHeight = (canvas.height * pdfWidth) / canvas.width;
      
      // FORCE TO SINGLE PAGE: If image is taller than A4, scale it down to fit perfectly
      if (finalHeight > pdfPageHeight) {
        const ratio = pdfPageHeight / finalHeight;
        finalWidth *= ratio;
        finalHeight = pdfPageHeight;
      }
      
      const xOffset = (pdfWidth - finalWidth) / 2;
      
      pdf.addImage(imgData, 'PNG', xOffset, 0, finalWidth, finalHeight);
      pdf.save(`VB_Snooker_Pedido_${state.orderNumber}.pdf`);
      
      saveToHistory();
      incrementOrder();
    } catch (error) {
      console.error("Failed to generate PDF", error);
      alert("Erro ao salvar o PDF.");
    } finally {
      setIsExporting(false);
    }
  };

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
            <span className="text-white font-brand font-bold text-lg leading-none tracking-widest antialiased">VB <span className="text-gold">SNOOKER</span></span>
            <span className="text-zinc-500 text-[0.6rem] uppercase tracking-[0.2em] antialiased">Order System v2.0</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3 w-full sm:w-auto">
          <button onClick={clearAll} className="flex items-center gap-2 px-3 py-2 text-zinc-400 hover:text-white transition-colors text-[0.65rem] font-bold uppercase tracking-widest">
            <RotateCcw size={14} /> <span className="hidden xs:inline">Limpar</span>
          </button>
          <button onClick={() => setIsHistoryOpen(true)} className="flex items-center gap-2 px-3 py-2 border border-zinc-700 rounded-md text-zinc-300 hover:bg-zinc-800 transition-all text-[0.65rem] font-bold uppercase tracking-widest">
            <HistoryIcon size={14} /> <span className="hidden xs:inline">Histórico</span>
          </button>
          <div className="flex items-center gap-2">
            <button onClick={() => handlePrint()} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#008c4a] to-[#004d29] text-white rounded-md hover:shadow-[0_0_15px_rgba(0,140,74,0.4)] transition-all text-[0.65rem] font-bold uppercase tracking-widest shadow-lg">
              <Printer size={14} /> <span>Imprimir</span>
            </button>
            <button onClick={() => handleSavePDF()} className="flex items-center gap-2 px-4 py-2 bg-zinc-800 border border-zinc-700 text-white rounded-md hover:bg-zinc-700 transition-all text-[0.65rem] font-bold uppercase tracking-widest shadow-lg group">
              <FileDown size={14} className="text-gold group-hover:scale-110 transition-transform" />
              <span>Salvar PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* DOCUMENT AREA - Stabilized with fixed height and scroll */}
      <div className="relative flex-1 flex flex-col items-center overflow-y-auto h-[85vh] py-8 print:h-auto print:overflow-visible print:py-0">
        <div
          ref={componentRef}
          id="section-to-print"
          className="document-page"
        >
          <div className="flex flex-col flex-1 w-full min-w-full">
            <Header />

            {/* TITLE BAND - EXACT BRAND GREEN */}
            <div className="doc-band bg-[#009353] py-2 px-12 flex justify-between items-center text-white relative z-10 w-full flex-shrink-0">
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

            <div className={`print-content-area flex flex-col flex-1 py-2 px-12 bg-white print:px-[10mm] print:pt-2 print:pb-[30mm] ${state.items.length > 8 ? 'gap-0' : 'gap-2'}`}>
              <div className="flex-shrink-0">
                <ClientInfo data={state.client} onChange={handleClientChange} isExporting={isExporting} />
              </div>

              <div className="flex-grow flex flex-col min-h-0">
                <OrderTable
                  items={state.items}
                  onUpdate={handleItemUpdate}
                  onAdd={addItem}
                  onRemove={removeItem}
                  isExporting={isExporting}
                />
              </div>

              {/* DYNAMIC FOOTER GROUP (COLLISION PREVENTION) */}
              <div className="flex flex-col flex-shrink-0 gap-0.5 border-t border-zinc-100 mt-8 pt-4 print:pt-1 print:gap-0">
                <Totals
                  subtotal={subtotal}
                  discount={state.discount}
                  onDiscountChange={(val) => setState(prev => ({ ...prev, discount: val }))}
                  isCompressed={state.items.length > 8}
                  isExporting={isExporting}
                />
                <Observations
                  value={state.observations}
                  paymentMethod={state.paymentMethod}
                  onChange={(val) => setState(prev => ({ ...prev, observations: val }))}
                  onPaymentChange={(val) => setState(prev => ({ ...prev, paymentMethod: val }))}
                  isExporting={isExporting}
                />
              </div>

              {/* SIGNATURE AREA - MATHEMATICALLY ALIGNED BASELINES */}
              <div className={`sig-area flex justify-between items-start px-12 w-full flex-shrink-0 ${state.items.length > 8 ? 'mt-4' : 'mt-12'}`}>
                <div className="flex flex-col items-center">
                  <div className="w-[180px] border-b border-zinc-300 mb-2"></div>
                  <div className="h-6 flex items-center justify-center">
                    <span className="text-[0.55rem] uppercase font-bold text-zinc-500 tracking-[0.2em] antialiased">Assinatura do Cliente</span>
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-[180px] border-b border-[#009353]/30 mb-2"></div>
                  <div className="h-8 flex items-center justify-center">
                    <span className="font-serif font-bold text-[#009353] text-[1.1rem] italic tracking-[0.05em] leading-none antialiased">VB Snooker</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FOOTER - ALIGNED AT BOTTOM OF PAGE */}
          <div className="doc-footer mt-auto relative h-[80px] px-12 border-t border-zinc-100 bg-[#F4F4F5] flex justify-between items-center text-[0.65rem] text-[#004a27] font-bold uppercase tracking-wider print:bg-transparent print:border-t print:border-zinc-200 print:px-[10mm] print:pb-[12mm] flex-shrink-0">
            <div className="flex-1 flex flex-col justify-center gap-0.5 h-full">
              <span className="font-bold leading-tight">VB Snooker Comércio de Materiais Esportivos LTDA</span>
              <span className="opacity-70 text-[0.55rem] text-zinc-800 leading-tight">Sorocaba-SP · Brasileira · Desde 1993</span>
            </div>
            <div className="flex-1 flex justify-center items-center h-full">
              <span className="font-brand font-bold text-gold text-[1.25rem] opacity-60 tracking-widest italic leading-none">VB Snooker</span>
            </div>
            <div className="flex-1 flex justify-end items-center h-full">
              <span className="font-mono text-xs text-zinc-700 font-bold leading-none">{new Date().getFullYear()}</span>
            </div>
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
