import React from 'react';
import { fmt, toNumber } from '../utils/format';

interface Props {
  subtotal: number;
  discount: string | number;
  onDiscountChange: (val: string) => void;
  isCompressed?: boolean;
  isExporting?: boolean;
}

const Totals: React.FC<Props> = ({ subtotal, discount, onDiscountChange, isCompressed, isExporting }) => {
  const dVal = toNumber(discount);
  const grandTotal = Math.max(0, subtotal - dVal);

  return (
    <div className={`flex justify-end mr-4 flex-shrink-0 ${isCompressed ? 'mt-0' : 'mt-4'}`}>
      <div className={`w-[300px] ${isCompressed ? 'space-y-1' : 'space-y-1.5'}`}>
        <div className="flex justify-between items-center px-4">
          <span className="text-[0.62rem] uppercase font-bold text-[#3F3F46] tracking-[0.22em]">Subtotal</span>
          <span className={`${isCompressed ? 'text-[0.8rem]' : 'text-[0.9rem]'} font-mono font-bold text-black tracking-tighter`}>{fmt(subtotal)}</span>
        </div>

        <div className="flex justify-between items-center px-4">
          <span className="text-[0.62rem] uppercase font-bold text-[#3F3F46] tracking-[0.22em]">Desconto</span>
          <div className="flex items-center gap-1">
            <span className={`text-[0.75rem] font-mono font-bold text-zinc-400 ${isExporting ? 'hidden' : 'hide-print'}`}>R$</span>
            {isExporting ? null : (
              <input
                className={`w-20 bg-transparent border-b border-zinc-200 px-1 text-right font-mono ${isCompressed ? 'text-[0.8rem]' : 'text-[0.95rem]'} font-bold outline-none focus:border-[#12A15F] hide-print`}
                type="text"
                value={discount}
                onChange={(e) => onDiscountChange(e.target.value)}
                placeholder="0,00"
              />
            )}
            <span className={`${isExporting ? 'inline' : 'hidden print:inline'} font-mono ${isCompressed ? 'text-[0.8rem]' : 'text-[0.95rem]'} font-bold`}>{fmt(dVal)}</span>
          </div>
        </div>

        <div className={`bg-black rounded-lg shadow-xl relative overflow-hidden group transition-all duration-300 ${isCompressed ? 'p-[10px_20px] scale-[0.85] origin-right' : 'p-[16px_20px]'}`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#00ff88]/5 blur-[60px] pointer-events-none group-hover:bg-[#00ff88]/10 transition-all"></div>

          <div className="flex justify-between items-center relative z-10">
            <div className="flex flex-col">
              <span className="text-[0.62rem] uppercase font-black text-[#00ff88] tracking-[0.3em] opacity-80">Total Geral</span>
              <span className="text-[0.55rem] text-zinc-500 uppercase font-bold tracking-widest mt-0.5">Valor Líquido</span>
            </div>
            <span className={`${isCompressed ? 'text-[1.3rem]' : 'text-[1.5rem]'} font-mono font-black text-[#00ff88] tracking-[-0.05em] leading-none`}>
              {fmt(grandTotal)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Totals;
