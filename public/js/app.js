// Simple frontend logic
let products = [];
async function loadProducts(){
  const res = await fetch('/api/products');
  products = await res.json();
  renderProducts();
}
function renderProducts(){
  const el = document.getElementById('products');
  el.innerHTML = '';
  products.forEach(p => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${p.image}" alt="${p.title}" />
      <h3>${p.title}</h3>
      <p>${p.category}</p>
      <div class="price">₹ ${p.price}</div>
      <button data-id="${p.id}" class="view-btn">View</button>
    `;
    el.appendChild(card);
  });
  document.querySelectorAll('.view-btn').forEach(b=>b.addEventListener('click', (e)=> openModal(e.target.dataset.id)));
}

function openModal(id){
  const p = products.find(x=>x.id==id);
  if(!p) return;
  document.getElementById('modal-img').src = p.image;
  document.getElementById('modal-title').innerText = p.title;
  document.getElementById('modal-desc').innerText = p.description;
  document.getElementById('modal-price').innerText = '₹ ' + p.price;
  document.getElementById('add-to-cart').dataset.id = p.id;
  document.getElementById('product-modal').classList.remove('hidden');
}

document.getElementById('close-modal').addEventListener('click', ()=> document.getElementById('product-modal').classList.add('hidden'));
document.getElementById('add-to-cart').addEventListener('click', (e)=>{
  const id = e.target.dataset.id;
  addToCart(Number(id));
  document.getElementById('product-modal').classList.add('hidden');
});

// cart logic using localStorage
function getCart(){ return JSON.parse(localStorage.getItem('cart')||'[]'); }
function saveCart(c){ localStorage.setItem('cart', JSON.stringify(c)); updateCartCount(); }
function addToCart(id){
  const c = getCart();
  const item = c.find(x=>x.id===id);
  if(item) item.qty++;
  else c.push({id, qty:1});
  saveCart(c);
  alert('Added to cart');
}
function updateCartCount(){
  const count = getCart().reduce((s,i)=>s+i.qty,0);
  document.getElementById('cart-count').innerText = count;
}
document.getElementById('btn-cart').addEventListener('click', ()=> openCart());
function openCart(){
  const drawer = document.getElementById('cart-drawer');
  const itemsEl = document.getElementById('cart-items');
  const cart = getCart();
  itemsEl.innerHTML = '';
  if(cart.length===0) itemsEl.innerHTML = '<p>Your cart is empty.</p>';
  else {
    let total = 0;
    cart.forEach(ci=>{
      const p = products.find(x=>x.id===ci.id);
      const div = document.createElement('div');
      div.className = 'cart-item';
      div.innerHTML = `
        <img src="${p.image}" />
        <div>
          <div>${p.title}</div>
          <div>₹ ${p.price} x ${ci.qty}</div>
          <div><button class="inc" data-id="${ci.id}">+</button> <button class="dec" data-id="${ci.id}">-</button></div>
        </div>
      `;
      itemsEl.appendChild(div);
      total += p.price * ci.qty;
    });
    document.getElementById('cart-total').innerText = total.toFixed(2);
    itemsEl.querySelectorAll('.inc').forEach(b=>b.addEventListener('click', e=>{changeQty(Number(e.target.dataset.id),1)}));
    itemsEl.querySelectorAll('.dec').forEach(b=>b.addEventListener('click', e=>{changeQty(Number(e.target.dataset.id),-1)}));
  }
  drawer.classList.remove('hidden');
}
document.getElementById('close-cart').addEventListener('click', ()=> document.getElementById('cart-drawer').classList.add('hidden'));
function changeQty(id, delta){
  const c = getCart();
  const it = c.find(x=>x.id===id);
  if(!it) return;
  it.qty += delta;
  if(it.qty<=0) { const idx = c.findIndex(x=>x.id===id); c.splice(idx,1); }
  saveCart(c); openCart();
}

// checkout
document.getElementById('checkout').addEventListener('click', async ()=>{
  const cart = getCart();
  if(cart.length===0) return alert('Cart empty');
  const name = prompt('Enter your name for the order');
  if(!name) return;
  const order = {customer:name, items: cart, total: cart.reduce((s,i)=> s + (products.find(p=>p.id===i.id).price * i.qty), 0)};
  const res = await fetch('/api/orders', {method:'POST', body: JSON.stringify(order), headers:{'Content-Type':'application/json'}});
  const data = await res.json();
  if(data && data.orderId){ localStorage.removeItem('cart'); updateCartCount(); document.getElementById('cart-drawer').classList.add('hidden'); alert('Order placed! ID: '+data.orderId); }
  else alert('Order failed');
});

// auth modal
let authMode = 'login';
document.getElementById('btn-login').addEventListener('click', ()=>{ document.getElementById('auth-modal').classList.remove('hidden'); });
document.getElementById('close-auth').addEventListener('click', ()=> document.getElementById('auth-modal').classList.add('hidden'));
document.getElementById('switch-auth').addEventListener('click', ()=>{
  authMode = authMode === 'login' ? 'register' : 'login';
  document.getElementById('auth-title').innerText = authMode === 'login' ? 'Login' : 'Register';
  document.getElementById('auth-name').style.display = authMode === 'login' ? 'none' : 'block';
});
document.getElementById('auth-form').addEventListener('submit', async (e)=>{
  e.preventDefault();
  const name = document.getElementById('auth-name').value;
  const email = document.getElementById('auth-email').value;
  const pass = document.getElementById('auth-pass').value;
  const url = authMode === 'login' ? '/api/login' : '/api/register';
  const res = await fetch(url, {method:'POST', body: JSON.stringify(authMode==='login'? {email, password:pass} : {name, email, password:pass}), headers:{'Content-Type':'application/json'}});
  const data = await res.json();
  const msg = document.getElementById('auth-msg');
  if(data.error) msg.innerText = data.error;
  else { msg.innerText = 'Success!'; setTimeout(()=>{ document.getElementById('auth-modal').classList.add('hidden'); },800); }
});

// init
loadProducts();
updateCartCount();