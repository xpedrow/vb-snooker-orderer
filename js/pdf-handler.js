/**
 * Gerenciamento de Impressão e PDF — Versão Limpa e Refatorada
 */

function enterMode() {
  document.body.classList.add('printing');
  const discWrap = document.querySelector('.disc-wrap');
  if (discWrap) discWrap.style.display = 'none';

  const dp = document.getElementById('discPrint');
  if (dp) dp.style.display = 'inline';

  // Sanitização de segurança antes de imprimir/exportar
  const textInputs = document.querySelectorAll('input[type="text"], textarea');
  textInputs.forEach(input => {
    input.value = sanitize(input.value);
  });

  // Troca o logo para Base64 para garantir que apareça na impressão e PDF
  const logoImg = document.querySelector('.hdr-logo img');
  if (logoImg && typeof LOGO_BASE64 !== 'undefined') {
    logoImg.src = LOGO_BASE64;
  }
}

function exitMode() {
  document.body.classList.remove('printing');
  const discWrap = document.querySelector('.disc-wrap');
  if (discWrap) discWrap.style.display = '';

  const dp = document.getElementById('discPrint');
  if (dp) dp.style.display = 'none';
}

function doPrint() {
  enterMode();
  setTimeout(() => {
    window.print();
    incrementOrder();
    setTimeout(exitMode, 1000);
  }, 100);
}

/**
 * Gera o PDF com máximo de fidelidade
 */
async function doPDF() {
  if (typeof html2pdf === 'undefined') {
    alert('Erro: Biblioteca de PDF não carregada.');
    doPrint();
    return;
  }

  // 1. Preparação
  enterMode();
  const el = document.getElementById('document');

  // 2. Técnica de Conversão Estática de Alta Fidelidade
  const inputsToConvert = el.querySelectorAll('input:not([type="checkbox"]), textarea');
  const conversionMap = [];

  inputsToConvert.forEach(input => {
    const parent = input.parentNode;
    const isTextarea = input.tagName === 'TEXTAREA';
    const computed = window.getComputedStyle(input);

    // Cria um elemento estático que o PDF entende perfeitamente
    const staticEl = document.createElement('div');
    staticEl.textContent = input.value || ''; // Garante que placeholders não sejam impressos

    // COPIA ESTILOS EXATOS (Resolve texto menor e garante fonte idêntica)
    const stylesToCopy = [
      'font-family', 'font-size', 'font-weight', 'line-height', 'color',
      'letter-spacing', 'text-transform', 'text-align'
    ];
    stylesToCopy.forEach(prop => staticEl.style[prop] = computed[prop]);

    // Ajustes de layout para 100% de ocupação sem vácuo (Resolve espaço em branco no topo)
    staticEl.style.display = 'block';
    staticEl.style.width = '100%';
    staticEl.style.whiteSpace = 'pre-wrap';
    staticEl.style.wordBreak = 'break-all'; // Crucial para não cortar palavras longas
    staticEl.style.padding = '0';           // Herdado da TD
    staticEl.style.margin = '0';
    staticEl.style.minHeight = isTextarea ? '20px' : 'auto';

    conversionMap.push({ input, staticEl, parent });

    // Troca o input pelo texto estático
    parent.insertBefore(staticEl, input);
    input.style.display = 'none';
  });

  const cNameInput = document.getElementById('cName');
  const oNumEl = document.getElementById('oNum');
  const logoImg = el.querySelector('.hdr-logo img');
  const bodyEl = el.querySelector('.doc-body');
  const headerEl = el.querySelector('.doc-hdr');
  const bandEl = document.querySelector('.doc-band');

  // Nome do arquivo (usando o valor já capturado ou o placeholder)
  const rawName = (cNameInput?.value || 'pedido').trim().split(' ')[0];
  const safeName = rawName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/gi, '_');
  const orderNum = oNumEl?.textContent.replace(/[^0-9]/g, '') || '0000';
  const fileName = `VBSnooker_Pedido_${orderNum}_${safeName}.pdf`;

  // 3. Backup e Travas de Estilos (Modo de Captura)
  const originalStyles = {
    width: el.style.width,
    height: el.style.height,
    minHeight: el.style.minHeight,
    boxShadow: el.style.boxShadow,
    borderRadius: el.style.borderRadius,
    overflow: el.style.overflow,
    bodyPadding: bodyEl.style.padding,
    headerPadding: headerEl.style.padding,
    bandPadding: bandEl ? bandEl.style.padding : ''
  };

  el.style.width = '794px';
  el.style.height = 'auto'; // Altura livre para captura total
  el.style.minHeight = '1122px';
  el.style.borderRadius = '0';
  el.style.boxShadow = 'none';
  el.style.overflow = 'visible';

  // 4. Compactação Agressiva para Página Única
  const docHeight = el.scrollHeight;
  if (docHeight > 1080) {
    bodyEl.style.padding = '8px 44px 8px 48px';
    headerEl.style.padding = '10px 44px 8px 48px';
    if (bandEl) bandEl.style.padding = '4px 44px 4px 48px';
    el.querySelectorAll('.sec').forEach(s => s.style.marginBottom = '6px');
    el.querySelector('.cg').style.marginBottom = '15px';
  }

  // Remove botões de interface ANTES de gerar o PDF
  const uiElements = el.querySelectorAll('.btn-add, .brm, .hide-print');
  uiElements.forEach(u => u.style.display = 'none');

  // Logo Base64
  if (logoImg && typeof LOGO_BASE64 !== 'undefined') {
    logoImg.src = LOGO_BASE64;
  }

  // 6. Opções da biblioteca
  const opt = {
    margin: 0,
    filename: fileName,
    image: { type: 'jpeg', quality: 1.0 },
    html2canvas: {
      scale: 3,
      useCORS: true,
      allowTaint: true,
      letterRendering: true,
      backgroundColor: '#ffffff',
      logging: false,
      scrollX: 0,
      scrollY: 0
    },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  try {
    // Scroll para o topo para garantir que o html2canvas capture a área correta
    window.scrollTo(0, 0);

    // Pequeno delay para renderização dos estilos
    await new Promise(r => setTimeout(r, 300));

    await html2pdf().set(opt).from(el).save();

    incrementOrder(); // Se chegou aqui, salvou com sucesso
  } catch (err) {
    console.error('PDF Generation Error:', err);
    alert('Erro ao gerar PDF. Tentando modo de impressão alternativo.');
    doPrint();
  } finally {
    // 5. Restauração Total (Retorna textareas e inputs ao estado original)
    conversionMap.forEach(({ input, staticEl }) => {
      staticEl.remove();
      input.style.display = '';
    });

    Object.assign(el.style, {
      width: originalStyles.width,
      height: originalStyles.height,
      minHeight: originalStyles.minHeight,
      boxShadow: originalStyles.boxShadow,
      borderRadius: originalStyles.borderRadius,
      overflow: originalStyles.overflow
    });
    bodyEl.style.padding = originalStyles.bodyPadding;
    headerEl.style.padding = originalStyles.headerPadding;
    if (bandEl) bandEl.style.padding = originalStyles.bandPadding;

    exitMode();
  }
}
