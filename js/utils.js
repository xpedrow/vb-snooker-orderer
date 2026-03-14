/**
 * Formata um número como moeda BRL (R$ 0,00)
 * @param {number} n - O valor a ser formatado
 * @returns {string} - String formatada
 */
function fmt(n) {
  return 'R$ ' + n.toFixed(2)
    .replace('.', ',')
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Segurança: Limpeza de strings para evitar tags HTML
 * @param {string} text - O texto a ser limpo
 * @returns {string} - Texto limpo de tags
 */
function sanitize(text) {
  if (!text) return '';
  // Remove tags HTML mas preserva o conteúdo e espaços
  return text.replace(/<[^>]*>?/gm, '');
}

/**
 * Auto-formatação de texto: Title Case ou Correção Estrutural
 * @param {string} text - O texto original
 * @param {string} mode - 'title' para nomes/títulos, 'sentence' para descrições
 */
function formatText(text, mode) {
  if (!text || typeof text !== 'string') return text;
  let val = text.trim();
  if (!val) return '';

  if (mode === 'title') {
    // Ex: "pedro villas boas" -> "Pedro Villas Boas"
    const ignore = ['de', 'da', 'do', 'das', 'dos', 'e', 'em', 'com', 'o', 'a'];
    return val.toLowerCase().split(/\s+/).map((word, index) => {
      if (word.length > 0) {
        if (index > 0 && ignore.includes(word)) return word;
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
      return '';
    }).filter(w => w !== '').join(' ');
  }

  if (mode === 'sentence') {
    // Correção estrutural (Pontuação e Gramática básica)
    // 1. Primeira letra maiúscula
    val = val.charAt(0).toUpperCase() + val.slice(1);
    
    // 2. Remove espaços duplos e excessivos
    val = val.replace(/\s+/g, ' ');
    
    // 3. Corrige espaços ANTES de pontuação: "casa ." -> "casa."
    val = val.replace(/\s+([.,;:!?])/g, '$1');
    
    // 4. Garante espaço DEPOIS de pontuação: "casa.azul" -> "casa. azul"
    const lower = 'a-záàâãéèêíïóôõöúçñ';
    const upper = 'A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ';
    const regexAfter = new RegExp(`([.,;:!?])(?=[${lower}${upper}])`, 'g');
    val = val.replace(regexAfter, '$1 ');
    
    // 5. Maiúscula após pontuação final (. ! ?)
    const regexPost = new RegExp(`([.!?]\\s+)([${lower}])`, 'g');
    val = val.replace(regexPost, (m, p1, p2) => p1 + p2.toUpperCase());

    return val;
  }

  return val;
}

/**
 * Aplica máscaras dinâmicas baseadas no tipo
 * @param {string} type - O tipo de máscara (cnpj, number, etc)
 * @param {Event} e - O evento de input
 */
function applyMask(type, e) {
  let v = e.target.value;
  
  if (type === 'cnpj') {
    v = v.replace(/\D/g, '');
    if (v.length <= 11) {
      v = v.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    } else {
      v = v.slice(0, 14);
      v = v.replace(/^(\d{2})(\d)/, '$1.$2').replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d)/, '.$1/$2').replace(/(\d{4})(\d)/, '$1-$2');
    }
  } else if (type === 'number') {
    v = v.replace(/\D/g, '');
  }
  
  if (e.target.value !== v) {
    e.target.value = v;
  }
}

/**
 * Inicializa as máscaras e trancas de segurança para TODOS os inputs
 */
function initMasks() {
  const allInputs = document.querySelectorAll('input, textarea');

  allInputs.forEach(el => {
    el.addEventListener('input', function(e) {
      // 1. Bloqueio imediato de tags em campos de texto
      if (this.type === 'text' || this.type === 'email' || this.tagName === 'TEXTAREA') {
        // Ignora sanitização temporária se for um campo que aceita texto livre
        // A sanitização real ocorre no Blur ou antes de salvar/exportar
        const isFreeText = this.id === 'cName' || this.classList.contains('row-desc') || this.id === 'obs' || this.id === 'cRua' || this.id === 'cBairro' || this.id === 'cCidade';
        
        if (!isFreeText) {
          const cleaned = sanitize(this.value);
          if (this.value !== cleaned) {
            const start = this.selectionStart;
            this.value = cleaned;
            this.setSelectionRange(start, start);
          }
        }
      }

      // 2. Máscaras específicas
      if (this.id === 'cDoc') applyMask('cnpj', e);
      if (this.id === 'cPhone') {
        let v = this.value.replace(/\D/g, '').slice(0, 11);
        if (v.length > 6) {
          const s = v.length <= 10 ? 6 : 7;
          v = `(${v.slice(0,2)}) ${v.slice(2,s)}-${v.slice(s)}`;
        } else if (v.length > 2) {
          v = `(${v.slice(0,2)}) ${v.slice(2)}`;
        }
        if (this.value !== v) {
          this.value = v;
        }
      }
      if (this.classList.contains('disc-input') || this.classList.contains('mn') || this.classList.contains('mnc')) {
        applyMask('number', e);
      }
    });

    // 3. Auto-Formatação Profissional ao sair do campo (Blur)
    el.addEventListener('blur', function() {
      if (this.type === 'text' || this.tagName === 'TEXTAREA') {
        const id = this.id;
        const isDesc = this.classList.contains('row-desc') || id === 'obs';
        
        if (isDesc) {
          this.value = formatText(this.value, 'sentence');
        } else {
          // Campos curtos/nomes/endereços recebem Title Case
          this.value = formatText(this.value, 'title');
        }
      }
    });
  });
}

/**
 * Gerencia o número sequencial do pedido usando LocalStorage
 * @returns {string} - Número do pedido formatado (ex: 0001)
 */
function getNextOrderNumber() {
  let lastNum = localStorage.getItem('vbs_last_order_num');
  if (!lastNum) {
    lastNum = 0;
  }
  const nextNum = parseInt(lastNum) + 1;
  return String(nextNum).padStart(4, '0');
}

/**
 * Salva o número do pedido atual como o último utilizado
 * @param {string} numStr - O número do pedido atual
 */
function saveOrderState(numStr) {
  const num = parseInt(numStr.replace(/\D/g, ''));
  localStorage.setItem('vbs_last_order_num', num);
}

/**
 * Função utilitária para aplicar segurança em novos inputs criados dinamicamente
 */
function secureNewInputs(container) {
  const inputs = container.querySelectorAll('input, textarea');
  inputs.forEach(input => {
    input.addEventListener('input', function(e) {
      if (this.type === 'text' || this.tagName === 'TEXTAREA') {
        const isFreeText = this.classList.contains('row-desc') || this.classList.contains('ti');
        if (!isFreeText) {
          const cleaned = sanitize(this.value);
          if (this.value !== cleaned) {
            const start = this.selectionStart;
            this.value = cleaned;
            this.setSelectionRange(start, start);
          }
        }
      }
      if (this.classList.contains('mn') || this.classList.contains('mnc')) {
        applyMask('number', e);
      }
    });

    // Auto-Formatação ao sair
    input.addEventListener('blur', function() {
      if (this.type === 'text' || this.tagName === 'TEXTAREA') {
        const isDesc = this.classList.contains('row-desc');
        this.value = formatText(this.value, isDesc ? 'sentence' : 'title');
      }
    });
  });
}
