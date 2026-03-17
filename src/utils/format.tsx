/**
 * Converte 'R$ 0,00' para número
 * Ou strings com vírgula para número
 */
/**
 * Converte 'R$ 0,00' para número
 * Ou strings com vírgula para número
 */
export function toNumber(val: string | number): number {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  // Converte vírgula para ponto e remove R$ e pontos de milhares
  const cleanStr = val.toString()
    .replace('R$', '')
    .replaceAll('.', '') // Remove separador de milhar brasileiro
    .replace(',', '.')   // Converte decimal brasileiro para ponto
    .trim();
  const n = parseFloat(cleanStr);
  return isNaN(n) ? 0 : n;
}

/**
 * Formata um número como moeda BRL R$ 0,00
 */
export function fmt(n: number): string {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/**
 * Sanitiza texto retirando tags
 */
export function sanitize(text: string): string {
  if (!text) return '';
  return text.replace(/<[^>]*>?/gm, '');
}

/**
 * Title Case para nomes/títulos
 */
export function formatTitle(text: string): string {
  if (!text) return '';
  const val = text.trim();
  const ignore = ['de', 'da', 'do', 'das', 'dos', 'e', 'em', 'com', 'o', 'a'];
  return val.toLowerCase().split(/\s+/).map((word, index) => {
    if (word.length > 0) {
      if (index > 0 && ignore.includes(word)) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    }
    return '';
  }).filter(w => w !== '').join(' ');
}

/**
 * Sentence Case para descrições
 */
export function formatSentence(text: string): string {
  if (!text) return '';
  let val = text.trim();
  val = val.charAt(0).toUpperCase() + val.slice(1);
  val = val.replace(/\s+/g, ' ');
  val = val.replace(/\s+([.,;:!?])/g, '$1');
  const lower = 'a-záàâãéèêíïóôõöúçñ';
  const upper = 'A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ';
  const regexAfter = new RegExp(`([.,;:!?])(?=[${lower}${upper}])`, 'g');
  val = val.replace(regexAfter, '$1 ');
  const regexPost = new RegExp(`([.!?]\\s+)([${lower}])`, 'g');
  val = val.replace(regexPost, (m, p1, p2) => p1 + p2.toUpperCase());
  return val;
}

/**
 * Máscara para CNPJ/CPF básico
 */
export function maskCnpj(v: string): string {
  const digits = v.replace(/\D/g, '');
  if (digits.length <= 11) {
    // CPF ou básico
    return digits.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  } 
  // CNPJ
  const s = digits.slice(0, 14);
  return s.replace(/^(\d{2})(\d)/, '$1.$2').replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d)/, '.$1/$2').replace(/(\d{4})(\d)/, '$1-$2');
}

/**
 * Máscara para Telefone
 */
export function maskPhone(v: string): string {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length > 6) {
    const s = d.length <= 10 ? 6 : 7;
    return `(${d.slice(0, 2)}) ${d.slice(2, s)}-${d.slice(s)}`;
  } else if (d.length > 2) {
    return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  }
  return d;
}

/**
 * Filtra itens vazios para impressão/exportação
 */
export function filterVisibleItems(items: Array<{product: string, unitValue: any}>) {
  return items.filter(item => {
    const isProdEmpty = !item.product.trim();
    const val = toNumber(item.unitValue);
    // Se o produto está vazio e o valor é 0, remove
    return !(isProdEmpty && val === 0);
  });
}
