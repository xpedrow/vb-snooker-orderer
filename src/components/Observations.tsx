import React from 'react';
import { formatSentence } from '../utils/format';

interface Props {
  value: string;
  paymentMethod: string;
  onChange: (val: string) => void;
  onPaymentChange: (val: string) => void;
  isExporting?: boolean;
}

const Observations: React.FC<Props> = ({ value, paymentMethod, onChange, onPaymentChange, isExporting }) => {
  return (
    <div className="section mt-2 flex flex-col">
      <div className="sec-title flex items-center gap-3 mb-2">
        <span className="text-[0.62rem] font-extrabold text-[#3F3F46] uppercase tracking-[0.22em]">Observações Adicionais</span>
        <div className="flex-1 h-[1px] bg-gradient-to-r from-[#008c4a26] to-transparent"></div>
      </div>
      <div 
        contentEditable={!isExporting}
        suppressContentEditableWarning={true}
        className="w-full bg-[#f8f8f8] border border-zinc-100 p-4 rounded-lg text-[0.75rem] text-zinc-700 italic font-medium leading-tight focus:bg-white focus:border-[#12A15F] outline-none transition-all shadow-inner flex-1 whitespace-normal break-words overflow-wrap-anywhere pr-[5px] doc-field"
        style={{ height: 'auto', minHeight: '180px' }}
        onBlur={(e) => onChange(formatSentence(e.currentTarget.innerText))}
        data-placeholder={isExporting ? "" : "Informações sobre prazo, montagem ou frete..."}
      >
        {value}
      </div>

      <div className={`mt-4 ${!paymentMethod?.trim() ? 'print:hidden' : ''} ${isExporting && !paymentMethod?.trim() ? 'hidden' : 'block'}`}>
        <label className="text-[0.62rem] font-extrabold text-[#3F3F46] uppercase tracking-[0.22em] mb-1.5 block">DADOS DE PAGAMENTO</label>
        {isExporting ? (
          <div className="w-full bg-transparent py-1 text-[0.85rem] text-black font-medium block break-words min-h-[1.5rem]">{paymentMethod}</div>
        ) : (
          <textarea 
            className="w-full bg-transparent border-b border-[#008c4a26] py-1 text-[0.85rem] text-black font-medium outline-none focus:border-[#12A15F] transition-all cursor-pointer block resize-none overflow-hidden min-h-[1.5rem]"
            rows={1}
            value={paymentMethod || ''}
            onChange={(e) => onPaymentChange(e.target.value)}
            onBlur={(e) => onPaymentChange(formatSentence(e.target.value))}
            onInput={(e: any) => {
              e.target.style.height = 'auto';
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
            placeholder="Ex: 50% de entrada + 3x no cartão"
          />
        )}
      </div>
    </div>
  );
};

export default Observations;
