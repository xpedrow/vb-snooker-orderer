import React from 'react';
import { formatSentence } from '../utils/format';

interface Props {
  value: string;
  onChange: (val: string) => void;
  isExporting?: boolean;
}

const Observations: React.FC<Props> = ({ value, onChange, isExporting }) => {
  return (
    <div className="section mt-2 flex-shrink-0 flex flex-col">
      <div className="sec-title flex items-center gap-3 mb-2">
        <span className="text-[0.62rem] font-extrabold text-[#3F3F46] uppercase tracking-[0.22em]">Observações Adicionais</span>
        <div className="flex-1 h-[1px] bg-gradient-to-r from-[#008c4a26] to-transparent"></div>
      </div>
      <div 
        contentEditable={!isExporting}
        suppressContentEditableWarning={true}
        className="w-full bg-[#f8f8f8] border border-zinc-100 p-4 rounded-lg text-[0.75rem] text-zinc-700 italic font-medium leading-tight focus:bg-white focus:border-[#12A15F] outline-none transition-all shadow-inner flex-1 whitespace-normal break-words overflow-wrap-anywhere pr-[5px] doc-field"
        style={{ height: 'auto', minHeight: '50px' }}
        onBlur={(e) => onChange(formatSentence(e.currentTarget.innerText))}
        data-placeholder={isExporting ? "" : "Informações sobre prazo, pagamento, montagem ou frete..."}
      >
        {value}
      </div>
      
      <div className="sig-area flex justify-between items-end mt-8 mb-2 px-4 print:mt-6">
        <div className="flex flex-col items-center">
          <div className="w-[200px] border-b-[1.5px] border-black/20 mb-2"></div>
          <span className="text-[0.5rem] uppercase font-black text-zinc-500 tracking-[0.25em]">ASSINATURA DO CLIENTE</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-[180px] border-b-[1.5px] border-[#008c4a] mb-2 opacity-60"></div>
          <span className="text-[0.6rem] uppercase font-bold text-[#008c4a] tracking-[0.2em] font-brand italic">VB Snooker</span>
        </div>
      </div>
    </div>
  );
};

export default Observations;
