import React from 'react';
import { OrderItem } from '../types/order';
import { fmt, toNumber, formatTitle, formatSentence } from '../utils/format';
import { Trash2, Plus } from 'lucide-react';

interface Props {
  items: OrderItem[];
  onUpdate: (id: string, field: keyof OrderItem, value: any) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
}

const OrderTable: React.FC<Props> = ({ items, onUpdate, onAdd, onRemove }) => {
  const isCompressed = items.length > 5;
  const isUltraCompressed = items.length > 10;

  const rowPadding = isUltraCompressed ? 'p-[2px_5px]' : isCompressed ? 'p-[4px_5px]' : 'p-[6px_5px]';
  const fontSize = isUltraCompressed ? 'text-[0.75rem]' : isCompressed ? 'text-[0.8rem]' : 'text-[0.85rem]';

  return (
    <div className="section">
      <div className={`sec-title flex items-center gap-3 ${isCompressed ? 'mb-2' : 'mb-4'}`}>
        <span className="text-[0.62rem] font-extrabold text-[#3F3F46] uppercase tracking-[0.22em]">Itens do Pedido</span>
        <div className="flex-1 h-[1px] bg-gradient-to-r from-[#008c4a26] to-transparent"></div>
      </div>
      
      <div className="overflow-hidden">
        <table className="w-full text-left border-collapse font-sans table-fixed">
          <thead>
            <tr className="bg-[#0A0A0A] text-[0.59rem] text-[#12A15F] uppercase tracking-[0.22em] font-bold">
              <th className="p-[8px_13px] w-[35px]">#</th>
              <th className="p-[8px_13px] w-[25%]">Produto</th>
              <th className="p-[8px_13px]">Descrição / Especificação</th>
              <th className="p-[8px_13px] text-right w-[110px]">Valor Unit.</th>
              <th className="p-[8px_13px] text-center w-[55px]">Qtd.</th>
              <th className="p-[8px_13px] text-right w-[125px]">Total</th>
              <th className="p-[8px_13px] w-[40px] hide-print"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item.id} className="ot-row group transition-colors border-b border-[#e0dbd0] odd:bg-white even:bg-[#F4F4F5] hover:bg-[#eeeae0]">
                <td className={`${rowPadding} vertical-middle`}>
                  <div className={`${isCompressed ? 'w-[18px] h-[18px]' : 'w-[22px] h-[22px]'} rounded-full bg-[#0A0A0A] text-[#12A15F] font-mono ${isCompressed ? 'text-[0.55rem]' : 'text-[0.62rem]'} flex items-center justify-center m-auto`}>
                    {index + 1}
                  </div>
                </td>
                <td className={`${rowPadding} vertical-middle`}>
                  <input 
                    className={`w-full bg-transparent p-1 ${fontSize} font-medium text-black outline-none focus:bg-white focus:border-b focus:border-[#12A15F] transition-all`}
                    type="text"
                    value={item.product}
                    onChange={(e) => onUpdate(item.id, 'product', e.target.value)}
                    onBlur={(e) => onUpdate(item.id, 'product', formatTitle(e.target.value))}
                    placeholder="Nome do produto"
                  />
                </td>
                <td className={`${rowPadding} vertical-middle`}>
                  <input 
                    className={`w-full bg-transparent p-1 ${fontSize} text-[#3F3F46] outline-none focus:bg-white focus:border-b focus:border-[#12A15F] transition-all`}
                    type="text"
                    value={item.description}
                    onChange={(e) => onUpdate(item.id, 'description', e.target.value)}
                    onBlur={(e) => onUpdate(item.id, 'description', formatSentence(e.target.value))}
                    placeholder="Detalhes técnicos..."
                  />
                </td>
                <td className={`${rowPadding} vertical-middle`}>
                  <input 
                    className={`w-full bg-transparent p-1 ${fontSize} text-right font-mono text-black outline-none focus:bg-white focus:border-b focus:border-[#12A15F] transition-all`}
                    type="text"
                    value={item.unitValue}
                    onChange={(e) => onUpdate(item.id, 'unitValue', e.target.value)}
                    placeholder="0,00"
                  />
                </td>
                <td className={`${rowPadding} vertical-middle`}>
                  <input 
                    className={`w-full bg-transparent p-1 ${fontSize} text-center font-mono text-black outline-none focus:bg-white focus:border-b focus:border-[#12A15F] transition-all`}
                    type="text"
                    value={item.quantity}
                    onChange={(e) => onUpdate(item.id, 'quantity', e.target.value)}
                    placeholder="1"
                  />
                </td>
                <td className={`${rowPadding} vertical-middle ${fontSize} text-right font-mono font-bold text-[#0E844E]`}>
                  {fmt(toNumber(item.unitValue) * toNumber(item.quantity))}
                </td>
                <td className={`${rowPadding} vertical-middle hide-print`}>
                  <button 
                    onClick={() => onRemove(item.id)}
                    className={`${isCompressed ? 'w-[22px] h-[22px]' : 'w-[26px] h-[26px]'} rounded-full border border-red-200 text-red-600 flex items-center justify-center hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all`}
                  >
                    <Trash2 size={isCompressed ? 11 : 13} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button 
        onClick={onAdd}
        className="mt-6 flex items-center gap-3 text-[0.7rem] font-black text-[#12A15F] uppercase tracking-widest hover:text-gold-hi transition-colors hide-print group"
      >
        <div className="w-8 h-8 border-2 border-[#12A15F40] text-[#12A15F] flex items-center justify-center rounded-full group-hover:border-[#12A15F] transition-all">
          <Plus size={18} strokeWidth={3} />
        </div>
        Adicionar item ao pedido
      </button>
    </div>
  );
};

export default OrderTable;
