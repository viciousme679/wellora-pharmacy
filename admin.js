(() => {
  'use strict';
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const KEYS = { products: 'wellora_products_v1', cart: 'wellora_cart_v1', orders: 'wellora_orders_v1', prescriptions: 'wellora_prescriptions_v1' };
  const starterProducts = [
    {id:'p101',name:'Daily Care Multivitamin',category:'supplement',price:6800,stock:18,restricted:false,description:'A simple everyday wellness supplement.',symbol:'🫙',tone:0,badge:'POPULAR'},
    {id:'p102',name:'Gentle Hydrating Lotion',category:'skin-care',price:4200,stock:24,restricted:false,description:'A lightweight lotion for daily skin care.',symbol:'🧴',tone:1,badge:'DAILY CARE'},
    {id:'p103',name:'Soft Cotton Care Pads',category:'personal-care',price:1800,stock:42,restricted:false,description:'Soft, practical essentials for your routine.',symbol:'☁️',tone:2,badge:'ESSENTIAL'},
    {id:'p104',name:'Baby Gentle Wash',category:'baby-care',price:3500,stock:16,restricted:false,description:'A gentle wash for everyday baby care.',symbol:'🧼',tone:3,badge:'GENTLE'},
    {id:'p105',name:'Nourishing Hair Oil',category:'hair-care',price:2900,stock:21,restricted:false,description:'A nourishing addition to your hair-care routine.',symbol:'🌿',tone:4,badge:'WELLORA PICK'},
    {id:'p106',name:'First Aid Essentials Kit',category:'personal-care',price:5400,stock:12,restricted:false,description:'A compact kit for common first-aid supplies.',symbol:'🩹',tone:5,badge:'PRACTICAL'},
    {id:'p107',name:'Digital Thermometer',category:'medicine',price:3900,stock:15,restricted:false,description:'A digital thermometer for home temperature checks.',symbol:'🌡️',tone:2,badge:'HOME CARE'},
    {id:'p108',name:'Prescription Medicine (Demo)',category:'medicine',price:7500,stock:8,restricted:true,description:'Sample restricted product for testing prescription approval.',symbol:'💊',tone:0,badge:'PRESCRIPTION'},
    {id:'p109',name:'Daily Hand Cleanser',category:'personal-care',price:2200,stock:30,restricted:false,description:'A handy cleanser for your everyday routine.',symbol:'🫧',tone:1,badge:'EVERYDAY'},
    {id:'p110',name:'Skin Comfort Cream',category:'skin-care',price:4600,stock:11,restricted:false,description:'A rich cream for a comfortable skin-care routine.',symbol:'🧴',tone:3,badge:'SKIN CARE'},
    {id:'p111',name:'Baby Care Essentials',category:'baby-care',price:6100,stock:9,restricted:false,description:'A curated set of practical baby-care basics.',symbol:'🧸',tone:4,badge:'BABY CARE'},
    {id:'p112',name:'Omega Wellness Capsules',category:'supplement',price:8200,stock:13,restricted:false,description:'A sample wellness supplement product listing.',symbol:'🌱',tone:5,badge:'WELLNESS'}
  ];
  const read = (key, fallback) => { try { const raw = localStorage.getItem(key); return raw === null ? fallback : JSON.parse(raw); } catch { return fallback; } };
  const write = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch (err) { toast('Could not save. Browser storage may be full or disabled.'); return false; } };
  let products = read(KEYS.products, null);
  if (!Array.isArray(products)) { products = structuredCloneSafe(starterProducts); write(KEYS.products, products); }
  let orders = read(KEYS.orders, []); if (!Array.isArray(orders)) orders = [];
  let prescriptions = read(KEYS.prescriptions, []); if (!Array.isArray(prescriptions)) prescriptions = [];
  let toastTimer;
  const money = n => '₦' + Number(n || 0).toLocaleString('en-NG');
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const cat = c => ({'personal-care':'Personal care','skin-care':'Skin care',supplement:'Supplements','baby-care':'Baby care','hair-care':'Hair care',medicine:'Medicines'}[c] || c || 'Uncategorised');
  const fmtDate = d => { const date = new Date(d); return Number.isNaN(date.getTime()) ? 'Date unavailable' : date.toLocaleString(undefined,{dateStyle:'medium',timeStyle:'short'}); };
  function structuredCloneSafe(v) { return JSON.parse(JSON.stringify(v)); }
  function toast(message) { const el = $('#adminToast'); if (!el) return; el.textContent = message; el.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 2800); }
  function persist() { const ok = write(KEYS.products, products) && write(KEYS.orders, orders) && write(KEYS.prescriptions, prescriptions); if (!ok) toast('Some changes may not have been saved.'); }
  function setTab(name) {
    $$('.side-tab').forEach(b => { const active = b.dataset.tab === name; b.classList.toggle('active', active); b.setAttribute('aria-current', active ? 'page' : 'false'); });
    ['inventory','orders','prescriptions'].forEach(k => $('#' + k + 'Section').classList.toggle('hidden', k !== name));
  }
  $$('.side-tab').forEach(b => b.addEventListener('click', () => setTab(b.dataset.tab)));
  function renderStats() {
    $('#statProducts').textContent = products.length;
    $('#statOrders').textContent = orders.length;
    $('#statRx').textContent = prescriptions.filter(r => r.status === 'Pending review').length;
    $('#statLowStock').textContent = products.filter(p => Number(p.stock) <= 5).length;
    $('#orderStatNote').textContent = `${orders.filter(o => o.status === 'Placed (demo)').length} awaiting action`;
    $('#inventoryBadge').textContent = products.length;
    $('#ordersBadge').textContent = orders.filter(o => o.status === 'Placed (demo)').length;
    $('#rxBadge').textContent = prescriptions.filter(r => r.status === 'Pending review').length;
  }
  function renderInventory() {
    const query = $('#inventorySearch').value.trim().toLowerCase();
    const category = $('#inventoryCategory').value;
    const stock = $('#stockFilter').value;
    const list = products.filter(p => {
      const text = `${p.name || ''} ${p.description || ''} ${cat(p.category)}`.toLowerCase();
      const stockOk = stock === 'all' || (stock === 'low' && Number(p.stock) > 0 && Number(p.stock) <= 5) || (stock === 'out' && Number(p.stock) <= 0);
      return (category === 'all' || p.category === category) && text.includes(query) && stockOk;
    });
    $('#inventoryRows').innerHTML = list.map(p => {
      const stockNum = Number(p.stock || 0);
      const stockClass = stockNum <= 0 ? 'out' : stockNum <= 5 ? 'low' : '';
      return `<tr><td><div class="product-cell"><span class="product-emoji">${esc(p.symbol || '✳')}</span><div class="product-title">${esc(p.name)}<span class="product-sub">${esc(p.description || '')}</span></div></div></td><td>${esc(cat(p.category))}</td><td>${money(p.price)}</td><td><span class="stock-pill ${stockClass}">${stockNum <= 0 ? 'Out of stock' : stockNum <= 5 ? `${stockNum} · Low` : stockNum}</span></td><td>${p.restricted ? '<span class="status-label pending">Required</span>' : 'Not required'}</td><td><button class="table-action" data-edit="${esc(p.id)}">Edit</button><button class="table-action delete" data-delete="${esc(p.id)}">Delete</button></td></tr>`;
    }).join('');
    $('#inventoryEmpty').classList.toggle('hidden', list.length > 0);
    $('#inventoryCount').textContent = `Showing ${list.length} of ${products.length} product${products.length === 1 ? '' : 's'}`;
    $$('[data-edit]').forEach(b => b.addEventListener('click', () => { const p = products.find(x => String(x.id) === b.dataset.edit); if (p) openProduct(p); }));
    $$('[data-delete]').forEach(b => b.addEventListener('click', () => deleteProduct(b.dataset.delete)));
  }
  function openProduct(product = null) {
    const form = $('#productForm'); form.reset(); form.elements.id.value = product?.id || '';
    if (product) Object.entries({name:product.name,category:product.category,price:product.price,stock:product.stock,restricted:product.restricted?'yes':'no',description:product.description}).forEach(([k,v]) => { form.elements[k].value = v ?? ''; });
    $('#productModalTitle').textContent = product ? 'Edit product' : 'Add product';
    $('#saveProductBtn').textContent = product ? 'Save changes' : 'Save product'; $('#formError').classList.add('hidden');
    $('#adminOverlay').classList.add('show'); $('#productModal').classList.add('open'); $('#productModal').setAttribute('aria-hidden','false');
    setTimeout(() => form.elements.name.focus(), 80);
  }
  function closeProduct() { $('#adminOverlay').classList.remove('show'); $('#productModal').classList.remove('open'); $('#productModal').setAttribute('aria-hidden','true'); }
  $('#addProductBtn').addEventListener('click', () => openProduct());
  $('#closeProductModal').addEventListener('click', closeProduct); $('#cancelProduct').addEventListener('click', closeProduct); $('#adminOverlay').addEventListener('click', closeProduct);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && $('#productModal').classList.contains('open')) closeProduct(); if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setTab('inventory'); $('#inventorySearch').focus(); } });
  $('#productForm').addEventListener('submit', e => {
    e.preventDefault(); const form = e.currentTarget; const data = Object.fromEntries(new FormData(form).entries());
    const name = String(data.name || '').trim(), description = String(data.description || '').trim(), price = Number(data.price), stock = Number(data.stock);
    if (!name || !description || !Number.isFinite(price) || price < 0 || !Number.isInteger(stock) || stock < 0) { $('#formError').textContent = 'Enter a name, description, valid non-negative price and whole-number stock quantity.'; $('#formError').classList.remove('hidden'); return; }
    const old = products.find(p => String(p.id) === String(data.id));
    const product = { id: old ? old.id : 'p' + Date.now(), name, category:data.category, price, stock, restricted:data.restricted === 'yes', description, symbol:old?.symbol || '✳', tone:old?.tone ?? 0, badge:data.restricted === 'yes' ? 'PRESCRIPTION' : (old?.badge || 'NEW') };
    products = old ? products.map(p => String(p.id) === String(old.id) ? product : p) : [product, ...products];
    persist(); closeProduct(); renderAll(); toast(old ? 'Product updated successfully.' : 'Product added to inventory.');
  });
  function deleteProduct(id) {
    const product = products.find(p => String(p.id) === String(id)); if (!product) return;
    if (!confirm(`Delete “${product.name}” from the catalogue? This cannot be undone.`)) return;
    products = products.filter(p => String(p.id) !== String(id));
    const cart = read(KEYS.cart, []); if (Array.isArray(cart)) write(KEYS.cart, cart.filter(item => String(item.id) !== String(id)));
    persist(); renderAll(); toast('Product deleted.');
  }
  $('#inventorySearch').addEventListener('input', renderInventory); $('#inventoryCategory').addEventListener('change', renderInventory); $('#stockFilter').addEventListener('change', renderInventory);
  $('#clearInventoryFilters').addEventListener('click', () => { $('#inventorySearch').value=''; $('#inventoryCategory').value='all'; $('#stockFilter').value='all'; renderInventory(); });
  $('#resetProductsBtn').addEventListener('click', () => { if (!confirm('Replace the current catalogue with the original demo products? Orders and prescriptions will not be deleted.')) return; products = structuredCloneSafe(starterProducts); persist(); renderAll(); toast('Demo catalogue restored.'); });
  function csvDownload(filename, rows) {
    const csv = rows.map(row => row.map(value => `"${String(value ?? '').replace(/"/g,'""')}"`).join(',')).join('\r\n');
    const blob = new Blob(['\ufeff' + csv], {type:'text/csv;charset=utf-8;'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url); toast('CSV export downloaded.');
  }
  $('#exportProductsBtn').addEventListener('click', () => csvDownload('wellora-products.csv', [['ID','Name','Category','Price (NGN)','Stock','Prescription required','Description'], ...products.map(p => [p.id,p.name,cat(p.category),p.price,p.stock,p.restricted?'Yes':'No',p.description])]));
  $('#exportOrdersBtn').addEventListener('click', () => csvDownload('wellora-orders.csv', [['Order ID','Customer','Email','Phone','Address','Items','Total','Payment','Status','Created'], ...orders.map(o => [o.id,o.customer?.name,o.customer?.email,o.customer?.phone,o.customer?.address,(o.items||[]).map(i => `${i.name} x${i.qty}`).join('; '),o.total,o.payment,o.status,o.createdAt])]));
  function renderOrders() {
    const status = $('#orderFilter').value; const list = orders.filter(o => status === 'all' || o.status === status).slice().reverse();
    $('#ordersCount').textContent = `${list.length} order${list.length === 1 ? '' : 's'}`;
    $('#ordersList').innerHTML = list.length ? list.map(o => {
      const customer = o.customer || {}; const items = Array.isArray(o.items) ? o.items : [];
      const statusClass = o.status === 'Rejected' ? 'rejected' : o.status === 'Accepted' ? '' : 'pending';
      return `<article class="record-card"><div class="record-top"><div><h3>${esc(o.id || 'Order')} · ${esc(customer.name || 'Customer')}</h3><p class="record-meta">${esc(fmtDate(o.createdAt))} · ${esc(customer.email || 'No email provided')}</p></div><span class="status-label ${statusClass}">${esc(o.status || 'Placed (demo)')}</span></div><p class="record-items">${items.length ? items.map(i => `${esc(i.name || 'Item')} × ${Number(i.qty || 1)}`).join(' · ') : 'No item details saved.'}</p><p class="record-detail">${esc(customer.address || 'No address provided')} · ${esc(customer.phone || 'No phone provided')}</p><div class="record-bottom"><span class="record-meta">Payment: ${esc(o.payment === 'demo-card' ? 'Simulated card' : 'Pay on delivery (demo)')}</span><strong class="record-total">${money(o.total)}</strong></div><div class="record-actions">${o.status !== 'Accepted' ? `<button class="btn btn-success" data-order="${esc(o.id)}" data-status="Accepted">✓ Accept order</button>` : ''}${o.status !== 'Rejected' ? `<button class="btn btn-danger" data-order="${esc(o.id)}" data-status="Rejected">✕ Reject order</button>` : ''}</div></article>`;
    }).join('') : '<div class="empty-state"><span>↗</span><h3>No orders to show</h3><p>Orders created through the storefront on this browser will appear here.</p></div>';
    $$('[data-order]').forEach(b => b.addEventListener('click', () => { const order = orders.find(o => String(o.id) === b.dataset.order); if (!order) return; const next = b.dataset.status; if (!confirm(`${next} this order?`)) return; order.status = next; persist(); renderAll(); toast(`Order marked ${next.toLowerCase()}. This is a demo; no email was sent.`); }));
  }
  $('#orderFilter').addEventListener('change', renderOrders);
  function renderPrescriptions() {
    const status = $('#rxFilter').value; const list = prescriptions.filter(r => status === 'all' || r.status === status).slice().reverse();
    $('#rxCount').textContent = `${list.length} request${list.length === 1 ? '' : 's'}`;
    $('#prescriptionsList').innerHTML = list.length ? list.map(r => {
      const product = products.find(p => String(p.id) === String(r.productId)); const statusClass = r.status === 'Pending review' ? 'pending' : r.status === 'Rejected' ? 'rejected' : '';
      return `<article class="record-card"><div class="record-top"><div><h3>${esc(product?.name || 'Product removed')}</h3><p class="record-meta">${esc(r.fileName || 'Uploaded file')} · ${esc(fmtDate(r.submittedAt))}</p><p class="record-detail">Request ID: ${esc(r.id || '—')}</p></div><span class="status-label ${statusClass}">${esc(r.status || 'Pending review')}</span></div><div class="record-actions"><button class="btn btn-light" data-view-rx="${esc(r.id)}">View uploaded file</button>${r.status === 'Pending review' ? `<button class="btn btn-success" data-rx="${esc(r.id)}" data-status="Approved">✓ Approve</button><button class="btn btn-danger" data-rx="${esc(r.id)}" data-status="Rejected">✕ Reject</button>` : ''}</div></article>`;
    }).join('') : '<div class="empty-state"><span>♧</span><h3>No prescription requests</h3><p>Requests submitted through the storefront on this browser will appear here.</p></div>';
    $$('[data-view-rx]').forEach(b => b.addEventListener('click', () => viewPrescription(b.dataset.viewRx)));
    $$('[data-rx]').forEach(b => b.addEventListener('click', () => { const request = prescriptions.find(r => String(r.id) === b.dataset.rx); if (!request) return; if (b.dataset.status === 'Approved' && !confirm('Approve this prescription request? Only approve after an appropriate qualified review.')) return; if (b.dataset.status === 'Rejected' && !confirm('Reject this prescription request?')) return; request.status = b.dataset.status; persist(); renderAll(); toast(`Request marked ${request.status.toLowerCase()}. Demo status only.`); }));
  }
  function viewPrescription(id) {
    const request = prescriptions.find(r => String(r.id) === String(id)); if (!request) return toast('Prescription request not found.');
    if (!request.fileData) return toast('No preview data is available for this upload.');
    const win = window.open('', '_blank'); if (!win) return toast('Your browser blocked the preview window. Allow pop-ups and try again.');
    const safeName = esc(request.fileName || 'Uploaded prescription');
    if (String(request.fileData).startsWith('data:application/pdf')) { win.document.write(`<!doctype html><title>${safeName}</title><iframe title="${safeName}" src="${request.fileData}" style="border:0;width:100%;height:100vh"></iframe>`); }
    else if (String(request.fileData).startsWith('data:image/')) { win.document.write(`<!doctype html><title>${safeName}</title><body style="margin:0;display:grid;place-items:center;background:#182b22"><img alt="${safeName}" src="${request.fileData}" style="max-width:100%;max-height:100vh;object-fit:contain"></body>`); }
    else { win.close(); toast('This file type cannot be previewed in the browser.'); }
  }
  $('#rxFilter').addEventListener('change', renderPrescriptions);
  function renderAll() { renderStats(); renderInventory(); renderOrders(); renderPrescriptions(); }
  $('#refreshBtn').addEventListener('click', () => { products = read(KEYS.products, products); orders = read(KEYS.orders, []); prescriptions = read(KEYS.prescriptions, []); renderAll(); toast('Dashboard refreshed from browser storage.'); });
  // Keep this page in sync when the storefront is open in another tab of the same browser.
  window.addEventListener('storage', event => { if (Object.values(KEYS).includes(event.key)) { products = read(KEYS.products, products); orders = read(KEYS.orders, []); prescriptions = read(KEYS.prescriptions, []); renderAll(); } });
  $('#todayDate').textContent = new Date().toLocaleDateString(undefined,{weekday:'short',year:'numeric',month:'short',day:'numeric'});
  renderAll();
})();
