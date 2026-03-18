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
    <div className="section mb-6">
      <div className="sec-title flex items-center gap-3 mb-5">
        <span className="text-[0.62rem] font-extrabold text-[#3F3F46] uppercase tracking-[0.22em]">Dados do Cliente</span>
        <div className="flex-1 h-[1px] bg-gradient-to-r from-[#008c4a26] to-transparent"></div>
      </div>

      <div className="grid grid-cols-12 gap-x-8 gap-y-5">
        <div className={`col-span-12 sm:col-span-8 ${!data.name.trim() ? 'print:hidden' : ''}`}>
          <label className={labelStyle}>Nome / Razão Social</label>
          <input 
            className={inputStyle}
            type="text"
            value={data.name}
            onChange={(e) => onChange('name', e.target.value)}
            onBlur={(e) => onChange('name', formatTitle(e.target.value))}
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

        <div className={`col-span-12 sm:col-span-5 ${!data.rua.trim() ? 'print:hidden' : ''}`}>
          <label className={labelStyle}>Rua / Nº</label>
          <input 
            className={inputStyle}
            type="text"
            value={data.rua}
            onChange={(e) => onChange('rua', e.target.value)}
            onBlur={(e) => onChange('rua', formatTitle(e.target.value))}
            placeholder={isExporting ? "" : "Ex: R. Cônego André Pieroni, 492"}
          />
        </div>
        <div className={`col-span-2 flex flex-col gap-1.5 ${!data.bairro.trim() ? 'print:hidden' : ''}`}>
          <label className="text-[0.59rem] text-zinc-500 font-bold uppercase tracking-wider">Bairro</label>
          <input 
            className="w-full bg-transparent border-b-[1.5px] border-zinc-200 py-1.5 text-[0.9rem] font-medium text-black transition-colors focus:border-[#12A15F] outline-none placeholder:italic placeholder:text-[#A1A1AA] placeholder:font-normal placeholder:text-[0.83rem]"
            type="text" 
            value={data.bairro}
            onChange={(e) => onChange('bairro', e.target.value)}
            onBlur={(e) => onChange('bairro', formatTitle(e.target.value))}
            placeholder={isExporting ? "" : "Ex: Jd. Guadalajara"}
          />
        </div>
        <div className={`col-span-2 flex flex-col gap-1.5 ${!data.cidade.trim() ? 'print:hidden' : ''}`}>
          <label className="text-[0.59rem] text-zinc-500 font-bold uppercase tracking-wider">Cidade / UF</label>
          <input 
            className="w-full bg-transparent border-b-[1.5px] border-zinc-200 py-1.5 text-[0.9rem] font-medium text-black transition-colors focus:border-[#12A15F] outline-none placeholder:italic placeholder:text-[#A1A1AA] placeholder:font-normal placeholder:text-[0.83rem]"
            type="text" 
            value={data.cidade}
            onChange={(e) => onChange('cidade', e.target.value)}
            onBlur={(e) => onChange('cidade', formatTitle(e.target.value))}
            placeholder={isExporting ? "" : "Ex: Sorocaba - SP"}
          />
        </div>
      </div>
      <div className="h-[1px] bg-gradient-to-r from-transparent via-[#12A15F33] to-transparent my-4 opacity-60"></div>
    </div>
  );
};

export default ClientInfo;
