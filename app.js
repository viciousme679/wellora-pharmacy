(() => {
  "use strict";
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const STORAGE = { products:"wellora_products_v1", cart:"wellora_cart_v1", orders:"wellora_orders_v1", prescriptions:"wellora_prescriptions_v1" };
  const starterProducts = [
    {id:"p101",name:"Daily Care Multivitamin",category:"supplement",price:6800,stock:18,restricted:false,description:"A simple everyday wellness supplement.",symbol:"🫙",tone:0,badge:"POPULAR"},
    {id:"p102",name:"Gentle Hydrating Lotion",category:"skin-care",price:4200,stock:24,restricted:false,description:"A lightweight lotion for daily skin care.",symbol:"🧴",tone:1,badge:"DAILY CARE"},
    {id:"p103",name:"Soft Cotton Care Pads",category:"personal-care",price:1800,stock:42,restricted:false,description:"Soft, practical essentials for your routine.",symbol:"☁️",tone:2,badge:"ESSENTIAL"},
    {id:"p104",name:"Baby Gentle Wash",category:"baby-care",price:3500,stock:16,restricted:false,description:"A gentle wash for everyday baby care.",symbol:"🧼",tone:3,badge:"GENTLE"},
    {id:"p105",name:"Nourishing Hair Oil",category:"hair-care",price:2900,stock:21,restricted:false,description:"A nourishing addition to your hair-care routine.",symbol:"🌿",tone:4,badge:"WELLORA PICK"},
    {id:"p106",name:"First Aid Essentials Kit",category:"personal-care",price:5400,stock:12,restricted:false,description:"A compact kit for common first-aid supplies.",symbol:"🩹",tone:5,badge:"PRACTICAL"},
    {id:"p107",name:"Digital Thermometer",category:"medicine",price:3900,stock:15,restricted:false,description:"A digital thermometer for home temperature checks.",symbol:"🌡️",tone:2,badge:"HOME CARE"},
    {id:"p108",name:"Prescription Medicine (Demo)",category:"medicine",price:7500,stock:8,restricted:true,description:"Sample restricted product for testing prescription approval.",symbol:"💊",tone:0,badge:"PRESCRIPTION"},
    {id:"p109",name:"Daily Hand Cleanser",category:"personal-care",price:2200,stock:30,restricted:false,description:"A handy cleanser for your everyday routine.",symbol:"🫧",tone:1,badge:"EVERYDAY"},
    {id:"p110",name:"Skin Comfort Cream",category:"skin-care",price:4600,stock:11,restricted:false,description:"A rich cream for a comfortable skin-care routine.",symbol:"🧴",tone:3,badge:"SKIN CARE"},
    {id:"p111",name:"Baby Care Essentials",category:"baby-care",price:6100,stock:9,restricted:false,description:"A curated set of practical baby-care basics.",symbol:"🧸",tone:4,badge:"BABY CARE"},
    {id:"p112",name:"Omega Wellness Capsules",category:"supplement",price:8200,stock:13,restricted:false,description:"A sample wellness supplement product listing.",symbol:"🌱",tone:5,badge:"WELLNESS"}
  ];
  const read = (key, fallback) => { try { const v=localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; } };
  let products = read(STORAGE.products, starterProducts);
  let cart = read(STORAGE.cart, []);
  let orders = read(STORAGE.orders, []);
  let prescriptions = read(STORAGE.prescriptions, []);
  let activeCategory = "all";
  let toastTimer;

  const money = n => "₦" + Number(n||0).toLocaleString("en-NG");
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const categoryName = c => ({ "personal-care":"Personal care","skin-care":"Skin care","supplement":"Supplements","baby-care":"Baby care","hair-care":"Hair care","medicine":"Medicines" }[c] || c);
  const save = () => { localStorage.setItem(STORAGE.products,JSON.stringify(products));localStorage.setItem(STORAGE.cart,JSON.stringify(cart));localStorage.setItem(STORAGE.orders,JSON.stringify(orders));localStorage.setItem(STORAGE.prescriptions,JSON.stringify(prescriptions)); };
  function toast(msg){const t=$("#toast");t.textContent=msg;t.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove("show"),2700);}
  function openModal(id){closePanels(false);$("#overlay").classList.add("show");const el=$("#"+id);if(el){el.classList.add("open");el.setAttribute("aria-hidden","false");}}
  function closePanels(hideOverlay=true){$$(".modal.open").forEach(m=>{m.classList.remove("open");m.setAttribute("aria-hidden","true")});$("#cartDrawer").classList.remove("open");$("#cartDrawer").setAttribute("aria-hidden","true");if(hideOverlay)$("#overlay").classList.remove("show");}
  function openCart(){closePanels(false);$("#overlay").classList.add("show");$("#cartDrawer").classList.add("open");$("#cartDrawer").setAttribute("aria-hidden","false");renderCart();}
  $("#overlay").addEventListener("click",()=>closePanels());
  $$("[data-close]").forEach(b=>b.addEventListener("click",()=>closePanels()));
  document.addEventListener("keydown",e=>{if(e.key==="Escape")closePanels();if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="k"){e.preventDefault();$("#searchInput").focus();}});
  $("#openCart").addEventListener("click",openCart);
  $("#openAdmin").addEventListener("click",()=>{openModal("adminModal");renderAdmin();});
  $("#openSearch").addEventListener("click",()=>{ $("#searchInput").focus();$("#shop").scrollIntoView({behavior:"smooth"}); });
  $("#mobileMenu").addEventListener("click",()=>$("#mainNav").classList.toggle("open"));
  $$("#mainNav a").forEach(a=>a.addEventListener("click",()=>$("#mainNav").classList.remove("open")));
  $("#year").textContent=new Date().getFullYear();

  function renderProducts(){
    const q=$("#searchInput").value.trim().toLowerCase(), category=$("#categoryFilter").value, sort=$("#sortFilter").value;
    let list=products.filter(p=>(activeCategory==="all"||p.category===activeCategory)&&(category==="all"||p.category===category)&&(`${p.name} ${p.description} ${categoryName(p.category)}`).toLowerCase().includes(q));
    if(sort==="price-low")list.sort((a,b)=>a.price-b.price);if(sort==="price-high")list.sort((a,b)=>b.price-a.price);if(sort==="name")list.sort((a,b)=>a.name.localeCompare(b.name));
    $("#productGrid").innerHTML=list.map(p=>`<article class="product-card"><div class="product-visual tone-${Number(p.tone)||0}"><span class="product-badge">${esc(p.badge||(p.restricted?"PRESCRIPTION":"WELLORA PICK"))}</span><span class="product-symbol">${esc(p.symbol||"✳")}</span></div><div class="product-info"><span class="product-category">${esc(categoryName(p.category))}${p.restricted?' · prescription':''}</span><h3>${esc(p.name)}</h3><p>${esc(p.description)}</p><div class="product-meta"><span class="product-price">${money(p.price)} <small>/ item</small></span><button class="add-button" data-add="${esc(p.id)}" aria-label="Add ${esc(p.name)} to bag" ${p.stock<1?"disabled":""}>+</button></div>${p.stock<1?'<div class="stock-note">Currently out of stock</div>':p.stock<=5?`<div class="stock-note">Only ${p.stock} left</div>`:""}</div></article>`).join("");
    $("#emptyState").classList.toggle("hidden",list.length!==0);$("#productGrid").classList.toggle("hidden",list.length===0);
    $$("[data-add]").forEach(b=>b.addEventListener("click",()=>addToCart(b.dataset.add)));
  }
  $("#searchInput").addEventListener("input",renderProducts);$("#categoryFilter").addEventListener("change",()=>{activeCategory="all";syncPills();renderProducts();});$("#sortFilter").addEventListener("change",renderProducts);
  $$(".category-pill").forEach(b=>b.addEventListener("click",()=>{activeCategory=b.dataset.category;$("#categoryFilter").value="all";syncPills();renderProducts();}));
  function syncPills(){$$(".category-pill").forEach(b=>b.classList.toggle("selected",b.dataset.category===activeCategory));}
  $("#resetFilters").addEventListener("click",()=>{$("#searchInput").value="";$("#categoryFilter").value="all";$("#sortFilter").value="featured";activeCategory="all";syncPills();renderProducts();});

  function addToCart(id){
    const p=products.find(x=>x.id===id);if(!p||p.stock<1)return toast("This product is currently out of stock.");
    if(p.restricted){const existing=prescriptions.find(x=>x.productId===id&&x.status==="Approved");if(!existing){$("#prescriptionForm").reset();$("#prescriptionForm").elements.productId.value=id;openModal("prescriptionModal");return;}}
    const item=cart.find(x=>x.id===id);if(item){if(item.qty>=p.stock)return toast("You have reached the available stock.");item.qty++;}else cart.push({id,qty:1});
    save();updateCartCount();renderCart();toast("Added to your bag.");
  }
  function addApprovedProduct(id){const p=products.find(x=>x.id===id);if(!p)return;const item=cart.find(x=>x.id===id);if(item)item.qty=Math.min(item.qty+1,p.stock);else cart.push({id,qty:1});save();updateCartCount();renderCart();toast("Prescription submitted. Item added for admin review.");}
  function updateCartCount(){const n=cart.reduce((s,x)=>s+x.qty,0);$("#cartCount").textContent=n;$("#drawerCount").textContent=`(${n})`;}
  function cartTotal(){return cart.reduce((s,x)=>{const p=products.find(p=>p.id===x.id);return s+(p?p.price*x.qty:0)},0);}
  function renderCart(){
    cart=cart.filter(x=>products.some(p=>p.id===x.id));save();updateCartCount();
    const items=$("#cartItems");
    if(!cart.length){items.innerHTML='<div class="cart-empty"><span>✳</span><h3>Your bag is taking a breather.</h3><p>Add a few essentials and they will appear here.</p></div>';$("#cartBottom").innerHTML="";return;}
    items.innerHTML=cart.map(x=>{const p=products.find(p=>p.id===x.id);return `<div class="cart-row"><div class="cart-thumb">${esc(p.symbol||"✳")}</div><div><h4>${esc(p.name)}</h4><small>${money(p.price)} each</small><div class="quantity-control"><button data-qty="${p.id}" data-delta="-1" aria-label="Decrease quantity">−</button><span>${x.qty}</span><button data-qty="${p.id}" data-delta="1" aria-label="Increase quantity">+</button></div></div><div><div class="line-price">${money(p.price*x.qty)}</div><button class="remove-item" data-remove="${p.id}" aria-label="Remove item">×</button></div></div>`}).join("");
    $("#cartBottom").innerHTML=`<div class="subtotal-row"><span>Subtotal</span><span>${money(cartTotal())}</span></div><p>Delivery costs, if applicable, are not included. Demo orders do not collect real payment.</p><button class="button primary" id="checkoutBtn">Continue to checkout <span>→</span></button>`;
    $$("[data-qty]",items).forEach(b=>b.addEventListener("click",()=>{const id=b.dataset.qty,item=cart.find(x=>x.id===id),p=products.find(x=>x.id===id);if(!item)return;const n=item.qty+Number(b.dataset.delta);if(n<1)cart=cart.filter(x=>x.id!==id);else if(n<=p.stock)item.qty=n;else toast("Available stock limit reached.");save();renderCart();}));
    $$("[data-remove]",items).forEach(b=>b.addEventListener("click",()=>{cart=cart.filter(x=>x.id!==b.dataset.remove);save();renderCart();}));
    $("#checkoutBtn").addEventListener("click",()=>{if(cart.some(x=>{const p=products.find(p=>p.id===x.id);return p&&p.restricted&&!prescriptions.some(r=>r.productId===p.id&&r.status==="Approved")})){toast("A restricted item needs an approved prescription.");return;}$("#checkoutSummary").innerHTML=`<span>${cart.reduce((s,x)=>s+x.qty,0)} item(s) in your bag</span><strong>${money(cartTotal())}</strong>`;openModal("checkoutModal");});
  }
  $("#prescriptionForm").addEventListener("submit",e=>{
    e.preventDefault();const form=e.currentTarget,file=form.elements.prescriptionFile.files[0],id=form.elements.productId.value;
    if(!file)return;if(file.size>5*1024*1024){toast("File must be 5 MB or smaller.");return;}
    if(!/\.(pdf|jpe?g|png)$/i.test(file.name)){toast("Please choose a PDF, JPG, or PNG file.");return;}
    const reader=new FileReader();reader.onload=()=>{prescriptions.push({id:"rx"+Date.now(),productId:id,fileName:file.name,fileData:reader.result,status:"Pending review",submittedAt:new Date().toISOString()});save();closePanels();toast("Prescription submitted for review. Admin approval is required.");renderAdmin();};reader.readAsDataURL(file);
  });
  $("#checkoutForm").addEventListener("submit",e=>{
    e.preventDefault();if(!cart.length){toast("Your bag is empty.");closePanels();return;}
    const form=e.currentTarget,data=Object.fromEntries(new FormData(form).entries());
    const restricted=cart.some(x=>{const p=products.find(p=>p.id===x.id);return p&&p.restricted&&!prescriptions.some(r=>r.productId===p.id&&r.status==="Approved");});
    if(restricted){toast("A restricted item needs an approved prescription.");return;}
    const lines=cart.map(x=>{const p=products.find(p=>p.id===x.id);return {id:x.id,name:p.name,price:p.price,qty:x.qty,restricted:p.restricted};});
    lines.forEach(x=>{const p=products.find(p=>p.id===x.id);if(p)p.stock=Math.max(0,p.stock-x.qty);});
    const order={id:"WL-"+Date.now().toString().slice(-8),customer:data,items:lines,total:cartTotal(),payment:data.payment,status:"Placed (demo)",createdAt:new Date().toISOString()};
    orders.unshift(order);cart=[];save();form.reset();closePanels();updateCartCount();renderProducts();renderAdmin();toast(`Demo order ${order.id} placed successfully!`);
  });

  $("#addProductBtn").addEventListener("click",()=>{const f=$("#productForm");f.reset();f.elements.id.value="";f.classList.remove("hidden");f.scrollIntoView({behavior:"smooth",block:"nearest"});});
  $("#cancelProduct").addEventListener("click",()=>$("#productForm").classList.add("hidden"));
  $("#productForm").addEventListener("submit",e=>{
    e.preventDefault();const f=e.currentTarget,d=Object.fromEntries(new FormData(f).entries());const p={id:d.id||"p"+Date.now(),name:d.name.trim(),category:d.category,price:Number(d.price),stock:Number(d.stock),restricted:d.restricted==="yes",description:d.description.trim(),symbol:"✳",tone:Math.floor(Math.random()*6),badge:d.restricted==="yes"?"PRESCRIPTION":"NEW"};
    if(d.id){products=products.map(x=>x.id===d.id?p:{...x});}else products.unshift(p);save();f.classList.add("hidden");renderProducts();renderAdmin();toast(d.id?"Product updated.":"Product added to inventory.");
  });
  function renderAdmin(){renderInventory();renderOrders();renderPrescriptions();}
  function renderInventory(){
    $("#inventoryRows").innerHTML=products.map(p=>`<tr><td>${esc(p.name)}</td><td>${esc(categoryName(p.category))}</td><td>${money(p.price)}</td><td>${p.stock}</td><td>${p.restricted?'<span class="status-label pending">Required</span>':'No'}</td><td><button class="table-action" data-edit="${esc(p.id)}">Edit</button><button class="table-action delete" data-delete="${esc(p.id)}">Delete</button></td></tr>`).join("");
    $$("[data-edit]").forEach(b=>b.addEventListener("click",()=>{const p=products.find(x=>x.id===b.dataset.edit),f=$("#productForm");f.reset();Object.entries({id:p.id,name:p.name,category:p.category,price:p.price,stock:p.stock,restricted:p.restricted?"yes":"no",description:p.description}).forEach(([k,v])=>f.elements[k].value=v);f.classList.remove("hidden");f.scrollIntoView({behavior:"smooth",block:"nearest"});}));
    $$("[data-delete]").forEach(b=>b.addEventListener("click",()=>{const p=products.find(x=>x.id===b.dataset.delete);if(!p)return;if(!confirm(`Delete "${p.name}" from inventory?`))return;products=products.filter(x=>x.id!==p.id);cart=cart.filter(x=>x.id!==p.id);save();renderProducts();renderAdmin();renderCart();toast("Product deleted.");}));
  }
  function renderOrders(){
    const el=$("#ordersList");if(!orders.length){el.innerHTML='<div class="cart-empty"><span>↗</span><h3>No orders yet</h3><p>Completed demo checkouts will appear here.</p></div>';return;}
    el.innerHTML=orders.map(o=>`<article class="order-card"><div class="order-card-head"><div><h4>${esc(o.id)} · ${esc(o.customer.name)}</h4><p>${new Date(o.createdAt).toLocaleString()} · ${esc(o.customer.email)}</p></div><span class="status-label ${o.status==="Rejected"?"rejected":o.status==="Accepted"?"":"pending"}">${esc(o.status)}</span></div><p>${o.items.map(i=>`${esc(i.name)} × ${i.qty}`).join(" · ")}</p><p>${esc(o.customer.address)} · ${esc(o.customer.phone)}</p><div class="order-card-head"><p>Payment: ${esc(o.payment==="demo-card"?"Simulated card":"Pay on delivery (demo)")}</p><strong>${money(o.total)}</strong></div><div class="order-actions"><button class="button secondary small-button" data-order-status="${o.id}" data-status="Accepted">Accept</button><button class="button secondary small-button" data-order-status="${o.id}" data-status="Rejected">Reject</button></div></article>`).join("");
    $$("[data-order-status]").forEach(b=>b.addEventListener("click",()=>{const o=orders.find(x=>x.id===b.dataset.orderStatus);if(o){o.status=b.dataset.status;save();renderOrders();toast(`Order ${o.id} marked ${o.status.toLowerCase()}. Demo email notification would be triggered here.`);}}));
  }
  function renderPrescriptions(){
    const el=$("#prescriptionsList");if(!prescriptions.length){el.innerHTML='<div class="cart-empty"><span>♧</span><h3>No prescriptions submitted</h3><p>Prescription uploads will appear here for review.</p></div>';return;}
    el.innerHTML=prescriptions.slice().reverse().map(r=>{const p=products.find(x=>x.id===r.productId);return `<article class="prescription-card"><div class="order-card-head"><div><h4>${esc(p?p.name:"Product removed")}</h4><p>${esc(r.fileName)} · ${new Date(r.submittedAt).toLocaleString()}</p></div><span class="status-label ${r.status==="Pending review"?"pending":r.status==="Rejected"?"rejected":""}">${esc(r.status)}</span></div><div class="order-actions"><button class="button secondary small-button" data-view-rx="${r.id}">View file</button>${r.status==="Pending review"?`<button class="button primary small-button" data-rx-status="${r.id}" data-status="Approved">Approve</button><button class="button secondary small-button" data-rx-status="${r.id}" data-status="Rejected">Reject</button>`:""}</div></article>`;}).join("");
    $$("[data-view-rx]").forEach(b=>b.addEventListener("click",()=>{const r=prescriptions.find(x=>x.id===b.dataset.viewRx);if(r&&r.fileData){const win=window.open();if(win){if(r.fileData.startsWith("data:application/pdf"))win.document.write(`<title>${esc(r.fileName)}</title><iframe style="border:0;width:100%;height:100vh" src="${r.fileData}"></iframe>`);else win.document.write(`<img style="max-width:100%;height:auto" src="${r.fileData}" alt="Prescription upload">`);}else toast("Your browser blocked the file preview.");}}));
    $$("[data-rx-status]").forEach(b=>b.addEventListener("click",()=>{const r=prescriptions.find(x=>x.id===b.dataset.rxStatus);if(!r)return;r.status=b.dataset.status;save();renderPrescriptions();toast(`Prescription ${r.status.toLowerCase()}.`);}));
  }
  $$(".admin-tab").forEach(b=>b.addEventListener("click",()=>{$$(".admin-tab").forEach(x=>x.classList.toggle("active",x===b));["inventory","orders","prescriptions"].forEach(t=>$("#"+t+"Panel").classList.toggle("hidden",t!==b.dataset.tab));}));
  renderProducts();renderCart();renderAdmin();
})();