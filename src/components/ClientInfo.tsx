import React from 'react';
import { ClientData } from '../types/order';
import { maskCnpj, maskPhone, maskCep, formatTitle } from '../utils/format';

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
        <div className={`col-span-12 sm:col-span-8 ${!data.name.trim() ? (isExporting ? 'hidden' : 'print:hidden') : ''}`}>
          <label className={labelStyle}>Nome / Razão Social</label>
          {isExporting ? (
            <div className={`${inputStyle} block min-h-[1.5rem] break-words`}>{data.name}</div>
          ) : (
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
              placeholder="Ex: João Silva ou Empresa LTDA"
            />
          )}
        </div>
        <div className={`col-span-12 sm:col-span-4 ${!data.doc.trim() ? (isExporting ? 'hidden' : 'print:hidden') : ''}`}>
          <label className={labelStyle}>CPF / CNPJ</label>
          {isExporting ? (
            <div className={`${inputStyle} block min-h-[1.5rem]`}>{data.doc}</div>
          ) : (
            <input 
              className={inputStyle}
              type="text"
              value={data.doc}
              onChange={(e) => onChange('doc', maskCnpj(e.target.value))}
              placeholder="000.000.000-00"
            />
          )}
        </div>

        <div className={`col-span-12 sm:col-span-6 ${!data.phone.trim() ? (isExporting ? 'hidden' : 'print:hidden') : ''}`}>
          <label className={labelStyle}>Telefone / WhatsApp</label>
          {isExporting ? (
            <div className={`${inputStyle} block min-h-[1.5rem]`}>{data.phone}</div>
          ) : (
            <input 
              className={inputStyle}
              type="text"
              value={data.phone}
              onChange={(e) => onChange('phone', maskPhone(e.target.value))}
              placeholder="(00) 00000-0000"
            />
          )}
        </div>
        <div className={`col-span-12 sm:col-span-6 ${!data.email.trim() ? (isExporting ? 'hidden' : 'print:hidden') : ''}`}>
          <label className={labelStyle}>E-mail</label>
          {isExporting ? (
            <div className={`${inputStyle} block min-h-[1.5rem]`}>{data.email}</div>
          ) : (
            <input 
              className={inputStyle}
              type="email"
              value={data.email}
              onChange={(e) => onChange('email', e.target.value.toLowerCase().trim())}
              placeholder="cliente@email.com"
            />
          )}
        </div>

        {/* Endereço - Linha 1: CEP, Rua, Complemento */}
        <div className={`col-span-12 sm:col-span-3 ${!data.cep?.trim() ? (isExporting ? 'hidden' : 'print:hidden') : ''}`}>
          <label className={labelStyle}>CEP</label>
          {isExporting ? (
            <div className={`${inputStyle} block min-h-[1.5rem]`}>{data.cep}</div>
          ) : (
            <input 
              className={inputStyle}
              type="text"
              value={data.cep || ''}
              onChange={(e) => onChange('cep', maskCep(e.target.value))}
              placeholder="00000-000"
            />
          )}
        </div>
        <div className={`col-span-12 sm:col-span-6 ${!data.rua.trim() ? (isExporting ? 'hidden' : 'print:hidden') : ''}`}>
          <label className={labelStyle}>Rua / Nº</label>
          {isExporting ? (
            <div className={`${inputStyle} block min-h-[1.5rem] break-words w-full`}>{data.rua}</div>
          ) : (
            <textarea 
              className={`${inputStyle} block resize-none overflow-hidden min-h-[1.5rem]`}
              rows={1}
              value={data.rua}
              onChange={(e) => onChange('rua', e.target.value)}
              onBlur={(e) => onChange('rua', formatTitle(e.target.value))}
              onInput={(e: any) => {
                e.target.style.height = 'auto';
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              placeholder="Ex: R. Cônego André Pieroni, 492"
            />
          )}
        </div>
        <div className={`col-span-12 sm:col-span-3 ${!data.complemento?.trim() ? (isExporting ? 'hidden' : 'print:hidden') : ''}`}>
          <label className={labelStyle}>Complemento</label>
          {isExporting ? (
            <div className={`${inputStyle} block min-h-[1.5rem] break-words w-full`}>{data.complemento}</div>
          ) : (
            <textarea 
              className={`${inputStyle} block resize-none overflow-hidden min-h-[1.5rem]`}
              rows={1}
              value={data.complemento || ''}
              onChange={(e) => onChange('complemento', e.target.value)}
              onBlur={(e) => onChange('complemento', formatTitle(e.target.value))}
              onInput={(e: any) => {
                e.target.style.height = 'auto';
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              placeholder="Ex: Sala 2"
            />
          )}
        </div>
        
        {/* Endereço - Linha 2: Bairro, Cidade */}
        <div className={`col-span-12 sm:col-span-6 ${!data.bairro.trim() ? (isExporting ? 'hidden' : 'print:hidden') : ''}`}>
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
        <div className={`col-span-12 sm:col-span-6 ${!data.cidade.trim() ? (isExporting ? 'hidden' : 'print:hidden') : ''}`}>
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
      <div className="h-[1px] bg-gradient-to-r from-transparent via-[#12A15F33] to-transparent my-4 opacity-60"></div>
    </div>
  );
};

export default ClientInfo;
