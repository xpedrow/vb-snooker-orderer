# VB Snooker - Sistema de Emissão de Pedidos

Um sistema web moderno, rápido e intuitivo projetado especificamente para a **VB Snooker**. Permite criar pedidos de venda personalizados, gerar orçamentos em PDF com alta fidelidade e gerenciar um histórico local de atendimentos.

![VB Snooker Logo](assets/logo.png)

## 🚀 Funcionalidades Principais

- **Emissão de Pedidos:** Preenchimento rápido de dados do cliente e itens da venda.
- **Cálculo Automático:** Subtotal, descontos e total geral calculados em tempo real.
- **Auto-Formatação Inteligente:** Capitalização automática de nomes e correção gramatical básica em campos de descrição/observações.
- **Exportação para PDF:** Geração de documentos profissionais otimizados para folha A4 única, prontos para envio ao cliente.
- **Modo de Impressão:** Layout de impressão ultra-compacto com rodapé fixo e assinaturas.
- **Histórico de Pedidos:** Salvamento automático de todos os pedidos finalizados no navegador (`LocalStorage`).
- **Backup e Sincronização:** Funções de Exportar e Importar backup em JSON para levar seus dados para outros computadores.

## 🛠️ Tecnologias Utilizadas

- **HTML5 & CSS3:** Estrutura semântica e design personalizado (Vanilla CSS).
- **JavaScript (ES6+):** Lógica de negócios, manipulação de DOM e cálculos.
- **html2pdf.js:** Biblioteca especializada para conversão de HTML para PDF de alta fidelidade.
- **Google Fonts:** Tipografia premium (Inter e DM Sans).

## 📁 Estrutura do Projeto

```text
/
├── assets/             # Imagens e logotipos
├── css/                # Folhas de estilo (style.css)
├── js/                 # Lógica do sistema por módulos
│   ├── main.js         # Inicialização e eventos principais
│   ├── utils.js        # Máscaras e formatação de texto
│   ├── pdf-handler.js  # Lógica de geração de PDF e impressão
│   ├── history-manager.js # Gestão de histórico e LocalStorage
│   └── logo.js         # Ativo de logo em Base64 para PDF
├── index.html          # Ponto de entrada do sistema
└── README.md           # Documentação
```

## 🌐 Deploy no Vercel

O projeto foi organizado para facilitar o deploy contínuo via Vercel.

1. Faça o upload da pasta para o seu repositório no **GitHub**.
2. No painel da **Vercel**, clique em "New Project".
3. Importe o repositório.
4. O Vercel detectará automaticamente o `index.html` e fará o deploy instantaneamente.

## 📄 Licença

Este projeto é de uso exclusivo da **VB Snooker**. Todos os direitos reservados.

---
Desenvolvido com ❤️ para a excelência no atendimento.
