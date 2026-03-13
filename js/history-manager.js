/**
 * Gerenciador de Histórico de Pedidos
 * Salva e recupera pedidos do LocalStorage
 */

const HISTORY_KEY = 'vbs_orders_history';

/**
 * Captura todos os dados do formulário atual e retorna um objeto de pedido
 */
function captureCurrentOrder() {
  const oNumEl = document.getElementById('oNum');
  const oDateIn = document.getElementById('oDate');
  
  const order = {
    id: oNumEl ? oNumEl.textContent.replace(/\D/g, '') : Date.now().toString(),
    timestamp: Date.now(),
    date: oDateIn ? oDateIn.value : new Date().toLocaleDateString('pt-BR'),
    customer: {
      name: document.getElementById('cName')?.value || '',
      doc: document.getElementById('cDoc')?.value || '',
      phone: document.getElementById('cPhone')?.value || '',
      email: document.getElementById('cEmail')?.value || '',
      rua: document.getElementById('cRua')?.value || '',
      bairro: document.getElementById('cBairro')?.value || '',
      cidade: document.getElementById('cCidade')?.value || ''
    },
    items: [],
    discount: parseFloat(document.getElementById('discIn')?.value) || 0,
    subtotal: parseFloat(document.getElementById('sub')?.textContent.replace(/[^\d,]/g, '').replace(',', '.')) || 0,
    total: parseFloat(document.getElementById('grand')?.textContent.replace(/[^\d,]/g, '').replace(',', '.')) || 0,
    obs: document.getElementById('obs')?.value || ''
  };

  document.querySelectorAll('#rows tr').forEach(tr => {
    const n = tr.dataset.n;
    if (!n) return;
    
    order.items.push({
      title: tr.querySelector('.ti[type="text"]')?.value || '',
      desc: tr.querySelector('.row-desc')?.value || '',
      price: parseFloat(document.getElementById('u' + n)?.value) || 0,
      qty: parseFloat(document.getElementById('q' + n)?.value) || 0,
      total: parseFloat(document.getElementById('t' + n)?.textContent.replace(/[^\d,]/g, '').replace(',', '.')) || 0
    });
  });

  return order;
}

/**
 * Salva o pedido atual no histórico
 */
function saveToHistory() {
  const order = captureCurrentOrder();
  
  // Validação Estrita: Só salva se tiver Nome do Cliente 
  // E pelo menos 1 item com descrição preenchida
  const hasClient = order.customer.name.trim().length > 0;
  const hasValidItem = order.items.some(item => item.title.trim().length > 0);

  if (!hasClient || !hasValidItem) {
    console.log('Pedido ignorado pelo histórico: Informações insuficientes.');
    return;
  }

  let history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  
  // Verifica se já existe um pedido com esse ID para atualizar ou adicionar
  const existingIdx = history.findIndex(h => h.id === order.id);
  
  if (existingIdx >= 0) {
    history[existingIdx] = order;
  } else {
    history.unshift(order); // Adiciona no início
  }

  // Limita o histórico aos últimos 100 pedidos
  if (history.length > 100) history = history.slice(0, 100);

  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  console.log('Pedido salvo no histórico:', order.id);
}

/**
 * Carrega um pedido do histórico para o formulário
 */
function loadOrderFromHistory(orderId) {
  const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  const order = history.find(h => h.id === orderId);
  
  if (!order) return;

  // 1. Dados básicos
  const oNumEl = document.getElementById('oNum');
  const oDateIn = document.getElementById('oDate');
  if (oNumEl) oNumEl.textContent = '— Nº ' + order.id;
  if (oDateIn) oDateIn.value = order.date;

  // 2. Cliente
  if (document.getElementById('cName')) document.getElementById('cName').value = order.customer.name;
  if (document.getElementById('cDoc')) document.getElementById('cDoc').value = order.customer.doc;
  if (document.getElementById('cPhone')) document.getElementById('cPhone').value = order.customer.phone;
  if (document.getElementById('cEmail')) document.getElementById('cEmail').value = order.customer.email;
  if (document.getElementById('cRua')) document.getElementById('cRua').value = order.customer.rua;
  if (document.getElementById('cBairro')) document.getElementById('cBairro').value = order.customer.bairro;
  if (document.getElementById('cCidade')) document.getElementById('cCidade').value = order.customer.cidade;

  // 3. Itens
  const tbody = document.getElementById('rows');
  if (tbody) tbody.innerHTML = '';
  
  // Reset rowCount para recomeçar do 0
  // window.rowCount está no main.js
  rowCount = 0; 

  order.items.forEach(item => {
    addRow(); // Chama a função global do main.js
    const n = rowCount;
    
    const row = document.getElementById('row' + n);
    if (row) {
      row.querySelector('.ti[type="text"]').value = item.title;
      row.querySelector('.row-desc').value = item.desc;
      document.getElementById('u' + n).value = item.price;
      document.getElementById('q' + n).value = item.qty;
      
      // Gatilha o auto-resize das textareas de descrição
      const descArea = row.querySelector('.row-desc');
      descArea.dispatchEvent(new Event('input'));
    }
  });

  // 4. Outros
  if (document.getElementById('discIn')) document.getElementById('discIn').value = order.discount;
  if (document.getElementById('obs')) {
    const obsEl = document.getElementById('obs');
    obsEl.value = order.obs;
    obsEl.dispatchEvent(new Event('input')); // Auto-resize
  }

  recalc(); // Recalcula tudo
  toggleHistoryModal(false);
}

/**
 * Exporta todo o histórico como um arquivo JSON baixável
 */
function exportHistory() {
  const history = localStorage.getItem(HISTORY_KEY) || '[]';
  const blob = new Blob([history], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  const date = new Date().toISOString().split('T')[0];
  a.href = url;
  a.download = `VBS_Backup_Pedidos_${date}.json`;
  a.click();
  
  URL.revokeObjectURL(url);
}

/**
 * Importa o histórico de um arquivo JSON
 */
function importHistory(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const importedData = JSON.parse(e.target.result);
      
      if (!Array.isArray(importedData)) {
        throw new Error('Formato inválido.');
      }

      const existingHistory = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
      
      // Mesclagem inteligente: remove duplicatas por ID
      const combined = [...importedData, ...existingHistory];
      const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
      
      // Ordena por data (mais novos primeiro)
      unique.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

      localStorage.setItem(HISTORY_KEY, JSON.stringify(unique.slice(0, 100)));
      alert('Histórico importado com sucesso!');
      renderHistoryList();
    } catch (err) {
      console.error('Erro na importação:', err);
      alert('Erro: O arquivo selecionado não é um backup de pedidos válido.');
    }
  };
  reader.readAsText(file);
  
  // Reseta o input para permitir importar o mesmo arquivo de novo se necessário
  event.target.value = '';
}

/**
 * Deleta um pedido do histórico
 */
function deleteFromHistory(orderId) {
  if (!confirm('Deseja excluir este pedido permanentemente?')) return;
  
  let history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  history = history.filter(h => h.id !== orderId);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  
  renderHistoryList();
}

/**
 * Renderiza a lista de pedidos no modal
 */
function renderHistoryList() {
  const listEl = document.getElementById('historyList');
  if (!listEl) return;

  const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');

  if (history.length === 0) {
    listEl.innerHTML = '<div class="hist-empty">Nenhum pedido salvo ainda.</div>';
    return;
  }

  listEl.innerHTML = history.map(order => `
    <div class="hist-item">
      <div class="hist-main" onclick="loadOrderFromHistory('${order.id}')">
        <div class="hist-info">
          <span class="hist-id">#${order.id}</span>
          <span class="hist-date">${order.date}</span>
        </div>
        <div class="hist-client">${order.customer.name || 'Cliente sem nome'}</div>
        <div class="hist-total">R$ ${order.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
      </div>
      <button class="hist-del" onclick="deleteFromHistory('${order.id}')" title="Excluir">
        <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path></svg>
      </button>
    </div>
  `).join('');
}

/**
 * Abre ou fecha o modal de histórico
 */
function toggleHistoryModal(show) {
  const modal = document.getElementById('historyModal');
  if (!modal) return;
  
  if (show) {
    renderHistoryList();
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  } else {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}
