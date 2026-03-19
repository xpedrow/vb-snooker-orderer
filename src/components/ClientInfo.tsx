import React from 'react';
import { ClientData } from '../types/order';
import { maskCnpj, maskPhone, formatTitle } from '../utils/format';

interface Props {
  data: ClientData;
  onChange: (field: keyof ClientData, value: string) => void;
  isExporting?: boolean;
}

const ClientInfo: React.FC<Props> = ({ data, onChange, isExporting }) => {
  const labelStyle = "text-[0.62rem] font-extrabold text-[#3F3F46] uppercase tracking-[0.22em] mb-1.5 block";
  const inputStyle = "w-full bg-transparent border-b border-[#008c4a26] py-1 text-[0.85rem] text-black font-medium outline-none focus:border-[#12A15F] transition-all cursor-pointer";

  return (
    <div className="section mt-2 mb-4">
      <div className="sec-title flex items-center gap-3 mb-5">
        <span className="text-[0.62rem] font-extrabold text-[#3F3F46] uppercase tracking-[0.22em]">Dados do Cliente</span>
        <div className="flex-1 h-[1px] bg-gradient-to-r from-[#008c4a26] to-transparent"></div>
      </div>

      <div className="grid grid-cols-12 gap-x-8 gap-y-5">
        <div className={`col-span-12 sm:col-span-8 ${!data.name.trim() ? 'print:hidden' : ''}`}>
          <label className={labelStyle}>Nome / Razão Social</label>
          <textarea 
            className={`${inputStyle} block resize-none overflow-hidden min-h-[1.5rem]`}
            rows={1}
            value={data.name}
            onChange={(e) => onChange('name', e.target.value)}
            onBlur={(e) => onChange('name', formatTitle(e.target.value))}
            onInput={(e: any) => {
              e.target.style.height = 'auto';
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
            placeholder={isExporting ? "" : "Ex: João Silva ou Empresa LTDA"}
          />
        </div>
        <div className={`col-span-12 sm:col-span-4 ${!data.doc.trim() ? 'print:hidden' : ''}`}>
          <label className={labelStyle}>CPF / CNPJ</label>
          <input 
            className={inputStyle}
            type="text"
            value={data.doc}
            onChange={(e) => onChange('doc', maskCnpj(e.target.value))}
            placeholder={isExporting ? "" : "000.000.000-00"}
          />
        </div>

        <div className={`col-span-12 sm:col-span-6 ${!data.phone.trim() ? 'print:hidden' : ''}`}>
          <label className={labelStyle}>Telefone / WhatsApp</label>
          <input 
            className={inputStyle}
            type="text"
            value={data.phone}
            onChange={(e) => onChange('phone', maskPhone(e.target.value))}
            placeholder={isExporting ? "" : "(00) 00000-0000"}
          />
        </div>
        <div className={`col-span-12 sm:col-span-6 ${!data.email.trim() ? 'print:hidden' : ''}`}>
          <label className={labelStyle}>E-mail</label>
          <input 
            className={inputStyle}
            type="email"
            value={data.email}
            onChange={(e) => onChange('email', e.target.value.toLowerCase().trim())}
            placeholder={isExporting ? "" : "cliente@email.com"}
          />
        </div>

        <div className="col-span-12 flex flex-col sm:flex-row justify-between items-start gap-8 pt-2 pb-1">
          {/* Rua */}
          <div className={`flex-[3] min-w-0 ${!data.rua.trim() ? 'print:hidden' : ''}`}>
            <label className={labelStyle}>Rua / Nº</label>
            <textarea 
              className="w-full bg-transparent py-1 border-b border-[#008c4a26] text-[0.85rem] text-black font-medium outline-none block resize-none overflow-hidden min-h-[1.5rem]"
              rows={1}
              value={data.rua}
              onChange={(e) => onChange('rua', e.target.value)}
              onBlur={(e) => onChange('rua', formatTitle(e.target.value))}
              onInput={(e: any) => {
                e.target.style.height = 'auto';
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              placeholder={isExporting ? "" : "Ex: R. Cônego André Pieroni, 492"}
            />
          </div>
          {/* Bairro */}
          <div className={`flex-[2] min-w-0 ${!data.bairro.trim() ? 'print:hidden' : ''}`}>
            <label className="text-[0.59rem] text-zinc-500 font-bold uppercase tracking-wider block mb-1.5">Bairro</label>
            <span 
              contentEditable={!isExporting}
              suppressContentEditableWarning={true}
            className="w-full block bg-transparent py-1 border-b border-[#008c4a26] text-[0.9rem] font-medium text-black outline-none !h-auto min-h-[1.5rem] !whitespace-normal break-words doc-field"
              onBlur={(e) => onChange('bairro', formatTitle(e.currentTarget.innerText))}
              data-placeholder="Ex: Jd. Guadalajara"
            >
              {data.bairro}
            </span>
          </div>
          {/* Cidade */}
          <div className={`flex-[2] min-w-[150px] ${!data.cidade.trim() ? 'print:hidden' : ''}`}>
            <label className="text-[0.59rem] text-zinc-500 font-bold uppercase tracking-wider block mb-1.5">Cidade / UF</label>
            <span 
              contentEditable={!isExporting}
              suppressContentEditableWarning={true}
              className="w-full block bg-transparent py-1 border-b border-[#008c4a26] text-[0.9rem] font-medium text-black outline-none !h-auto min-h-[1.5rem] !whitespace-normal break-words text-left doc-field"
              onBlur={(e) => onChange('cidade', formatTitle(e.currentTarget.innerText))}
              data-placeholder="Ex: Sorocaba - SP"
            >
              {data.cidade}
            </span>
          </div>
        </div>
      </div>
      <div className="h-[1px] bg-gradient-to-r from-transparent via-[#12A15F33] to-transparent my-4 opacity-60"></div>
    </div>
  );
};

export default ClientInfo;
