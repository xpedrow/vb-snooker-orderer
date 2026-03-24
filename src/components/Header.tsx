import React from 'react';

const Header: React.FC = () => {
  return (
    <div className="doc-hdr bg-gradient-to-r from-black via-[#1a1a1a] to-black text-white pt-4 pb-3 px-12 flex justify-between items-center border-b-[2px] border-[#12A15F] relative overflow-hidden flex-shrink-0">
      {/* subtle atmospheric glows overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-30 select-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_58%_120%_at_82%_50%,rgba(0,140,74,0.3)_0%,transparent_62%)]"></div>
      </div>

      <div className="hdr-brand flex items-center gap-5 relative z-10">
        <div className="hdr-logo w-[100px] h-[100px]">
          <img src="/assets/logo.png" alt="VB Snooker Logo" className="w-full h-full object-contain" />
        </div>
        <div>
          <div className="hdr-title font-brand text-[1.85rem] font-bold leading-none tracking-widest uppercase text-white">
            VB <span className="text-[#12A15F]">Snooker</span>
          </div>
          <div className="hdr-sub font-sans text-[0.62rem] font-bold opacity-90 uppercase tracking-[0.22em] mt-2 text-zinc-400">
            Mesa de Bilhar · Pebolim · Tênis de Mesa · Desde 1993
          </div>
        </div>
      </div>

      <div className="hdr-info flex flex-col items-end relative z-10">
        <div className="space-y-1.5 font-sans">
          <div className="flex items-center justify-end gap-2 leading-tight">
            <svg className="w-2.5 h-2.5 stroke-gold fill-none flex-shrink-0" viewBox="0 0 24 24" strokeWidth="3">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.82 19.79 19.79 0 01.07 4.21 2 2 0 012 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
            </svg>
            <span className="text-[0.8rem] font-bold text-white">(15) 99789-6366</span>
          </div>
          <div className="flex items-center justify-end gap-2 leading-tight">
            <svg className="w-2.5 h-2.5 stroke-gold fill-none flex-shrink-0" viewBox="0 0 24 24" strokeWidth="3">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            <span className="text-[0.73rem] font-medium text-zinc-300">contato@vbsnooker.com.br</span>
          </div>
          <div className="inline-flex flex-row items-start gap-1 leading-tight max-w-[192px]">
            <svg className="w-3 h-3 stroke-gold fill-none flex-shrink-0 mt-[2.5px]" viewBox="0 0 24 24" strokeWidth="3">
              <circle cx="12" cy="10" r="3" />
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
            </svg>
            <span className="text-[0.73rem] font-medium text-zinc-300 text-right">R. Cônego André Pieroni, 492 — Sorocaba-SP</span>
          </div>
        </div>
        <div className="mt-3 inline-block">
          <span className="inline-flex items-center bg-[#12A15F1C] border border-[#12A15F40] px-3 py-1 rounded-full text-[0.64rem] text-gold font-mono tracking-wider font-bold">
            CNPJ: 49.545.015/0001-24
          </span>
        </div>
      </div>
    </div>
  );
};

export default Header;
