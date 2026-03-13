/* ── STATE ── */
var rowCount = 0;

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', () => {
  const today = new Date();
  const oDateInput = document.getElementById('oDate');
  const footDateEl = document.getElementById('footDate');
  const oNumEl = document.getElementById('oNum');

  if (oDateInput) {
    const d = new Date();
    oDateInput.value = d.toLocaleDateString('pt-BR');
    oDateInput.addEventListener('input', function(e) {
      let v = this.value.replace(/\D/g, '').slice(0, 8);
      if (v.length > 4) {
        v = `${v.slice(0,2)}/${v.slice(2,4)}/${v.slice(4)}`;
      } else if (v.length > 2) {
        v = `${v.slice(0,2)}/${v.slice(2)}`;
      }
      this.value = v;
    });
  }

  if (footDateEl) {
    footDateEl.textContent = today.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    });
  }
  if (oNumEl) {
    oNumEl.textContent = '— Nº ' + getNextOrderNumber();
  }

  // Setup button listeners
  setupButtonListeners();
  
  // Initialize masks (from utils.js)
  initMasks();

  // Initial rows
  addRow(); addRow(); addRow();
});

function setupButtonListeners() {
  const clearBtn = document.getElementById('clearBtn');
  const printBtn = document.getElementById('printBtn');
  const pdfBtn = document.getElementById('pdfBtn');
  const addBtn = document.getElementById('addBtn');
  const discIn = document.getElementById('discIn');

  if (clearBtn) clearBtn.addEventListener('click', clearForm);
  if (printBtn) printBtn.addEventListener('click', () => {
    saveToHistory();
    doPrint();
  });
  if (pdfBtn) pdfBtn.addEventListener('click', () => {
    saveToHistory();
    doPDF();
  });
  if (addBtn) addBtn.addEventListener('click', addRow);
  
  const historyBtn = document.getElementById('historyBtn');
  if (historyBtn) historyBtn.addEventListener('click', () => toggleHistoryModal(true));
  
  if (discIn) {
    discIn.addEventListener('input', (e) => {
      applyMask('number', e);
      recalc();
    });
  }

  // Auto-resize para Observações Gerais
  const obsIn = document.getElementById('obs');
  if (obsIn) {
    obsIn.addEventListener('input', function() {
      this.style.height = 'auto';
      this.style.height = (this.scrollHeight) + 'px';
    });
  }
}

/* ── ROWS ── */
function addRow() {
  const n = ++rowCount;
  const tbody = document.getElementById('rows');
  if (!tbody) return;

  const tr = document.createElement('tr');
  tr.id = 'row' + n;
  tr.dataset.n = n;
  tr.innerHTML = `
    <td><div class="rn">${n}</div></td>
    <td><input class="ti" type="text" placeholder="Ex: Mesa de Bilhar 2.20m"></td>
    <td><textarea class="ti row-desc" rows="1" placeholder="Ex: Pano verde, madeira maciça"></textarea></td>
    <td><input class="ti mn" id="u${n}" type="text" placeholder="0,00"></td>
    <td><input class="ti mnc" id="q${n}" type="text" placeholder="1" value="1"></td>
    <td class="r tc" id="t${n}">R$ 0,00</td>
    <td class="hide-print">
      <button class="brm" id="rm${n}" title="Remover item">
        <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </td>`;
  
  tbody.appendChild(tr);

  // Aplica segurança e máscaras em todos os novos inputs da linha
  secureNewInputs(tr);

  // Adiciona ouvintes específicos para cálculos
  const uIn = document.getElementById(`u${n}`);
  const qIn = document.getElementById(`q${n}`);
  const rmBtn = document.getElementById(`rm${n}`);

  if (uIn) uIn.addEventListener('input', () => calcRow(n));
  if (qIn) qIn.addEventListener('input', () => calcRow(n));
  if (rmBtn) rmBtn.addEventListener('click', () => rmRow(n));

  // Auto-resize para a descrição
  const descIn = tr.querySelector('.row-desc');
  if (descIn) {
    descIn.addEventListener('input', function() {
      this.style.height = 'auto';
      this.style.height = (this.scrollHeight) + 'px';
    });
  }
}

function rmRow(n) {
  const el = document.getElementById('row' + n);
  if (el) { 
    el.remove(); 
    recalc(); 
    renum(); 
  }
}

function renum() {
  document.querySelectorAll('#rows .rn').forEach((el, i) => el.textContent = i + 1);
}

/* ── CALC ── */
function calcRow(n) {
  const uVal = document.getElementById('u' + n)?.value || '0';
  const qVal = document.getElementById('q' + n)?.value || '0';
  const u = parseFloat(uVal) || 0;
  const q = parseFloat(qVal) || 0;
  const cell = document.getElementById('t' + n);
  if (cell) cell.textContent = fmt(u * q);
  recalc();
}

function recalc() {
  let s = 0;
  document.querySelectorAll('#rows tr').forEach(tr => {
    const n = tr.dataset.n; if (!n) return;
    const uVal = document.getElementById('u' + n)?.value || '0';
    const qVal = document.getElementById('q' + n)?.value || '0';
    const u = parseFloat(uVal) || 0;
    const q = parseFloat(qVal) || 0;
    const t = u * q;
    const cell = document.getElementById('t' + n);
    if (cell) cell.textContent = fmt(t);
    s += t;
  });
  
  const discIn = document.getElementById('discIn');
  const subEl = document.getElementById('sub');
  const grandEl = document.getElementById('grand');
  const discPrintEl = document.getElementById('discPrint');

  const d = parseFloat(discIn?.value) || 0;
  if (subEl) subEl.textContent = fmt(s);
  if (grandEl) grandEl.textContent = fmt(Math.max(0, s - d));
  if (discPrintEl) discPrintEl.textContent = fmt(d);
}

/**
 * Incrementa e salva o próximo número de pedido.
 */
function incrementOrder() {
  const oNumEl = document.getElementById('oNum');
  if (oNumEl) {
    saveOrderState(oNumEl.textContent);
    oNumEl.textContent = '— Nº ' + getNextOrderNumber();
  }
}

/* ── CLEAR ── */
function clearForm() {
  if (!confirm('Limpar todos os dados do pedido?')) return;
  
  ['cName','cDoc','cPhone','cEmail','cRua','cBairro','cCidade','obs'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });

  const discIn = document.getElementById('discIn');
  const rowsTbody = document.getElementById('rows');
  const oDateInput = document.getElementById('oDate');

  if (discIn) discIn.value = '0';
  if (rowsTbody) rowsTbody.innerHTML = '';
  
  rowCount = 0;
  addRow(); addRow(); addRow();
  recalc();

  if (oDateInput) oDateInput.value = new Date().toLocaleDateString('pt-BR');
  incrementOrder();
}
