// script.js - Shopping Cart Simulation (ES6+)

const products = [
  { id: 'p1', name: 'کرتی زنانه', price: 2500, image: 'https://i.pinimg.com/736x/42/15/a1/4215a1617aeb13810d9f718c574d6abd.jpg' },
  { id: 'p2', name: 'پیراهن کتان', price: 1200, image: 'https://i.pinimg.com/1200x/9f/14/cc/9f14ccf653217510238ed7af0027fba6.jpg' },
  { id: 'p3', name: 'بوت اسپورت', price: 3400, image: 'https://i.pinimg.com/1200x/59/68/fd/5968fd7f08bce23e124a222bf922f606.jpg' },
  { id: 'p4', name: 'کیف دستی', price: 1800, image: 'https://i.pinimg.com/1200x/75/b0/49/75b049d4fa1478153d21d7b0ce1ac916.jpg' },
  { id: 'p5', name: 'عینک آفتابی', price: 800, image: 'https://i.pinimg.com/1200x/d3/36/e8/d336e8b01c8ba25fc076d7a476b58290.jpg' }
];

// DOM refs
const productsListEl = document.getElementById('productsList');
const cartItemsEl = document.getElementById('cartItems');
const cartTotalEl = document.getElementById('cartTotal');
const clearCartBtn = document.getElementById('clearCartBtn');
const searchInput = document.getElementById('searchInput');
const toast = document.getElementById('toast');

let cart = [];

// LocalStorage helpers
const STORAGE_KEY = 'shopping_cart_v1';
const saveCart = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
const loadCart = () => {
  const raw = localStorage.getItem(STORAGE_KEY);
  cart = raw ? JSON.parse(raw) : [];
};

// Utility: show short toast
const showToast = (text, timeout = 1600) => {
  toast.textContent = text;
  toast.style.display = 'block';
  setTimeout(() => toast.style.opacity = '1', 10);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.style.display = 'none', 300);
  }, timeout);
};

// Render products (filterable)
const renderProducts = (filter = '') => {
  const filtered = products.filter(p => p.name.includes(filter) || p.name.toLowerCase().includes(filter.toLowerCase()));
  productsListEl.innerHTML = filtered.map(p => `
    <div class="product-card" data-id="${p.id}">
      <img src="${p.image}" alt="${p.name}" loading="lazy"/>
      <div class="name">${p.name}</div>
      <div class="price">${p.price} افغانی</div>
      <button class="btn add-btn" data-id="${p.id}">افزودن به سبد</button>
    </div>
  `).join('') || '<p>محصولی یافت نشد.</p>';
};

// Add item to cart (increase quantity if exists)
const addToCart = (productId) => {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  const existing = cart.find(item => item.id === productId);
  if (existing) existing.qty += 1;
  else cart.push({ id: product.id, name: product.name, price: product.price, qty: 1 });

  saveCart();
  renderCart();
  showToast(`${product.name} به سبد اضافه شد ✅`);
};

// Remove item entirely
const removeFromCart = (productId) => {
  cart = cart.filter(i => i.id !== productId);
  saveCart();
  renderCart();
};

// Change quantity (delta can be negative)
const changeQty = (productId, delta) => {
  const item = cart.find(i => i.id === productId);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) removeFromCart(productId);
  else {
    saveCart();
    renderCart();
  }
};

// Calculate total using reduce
const calculateTotal = () => cart.reduce((sum, item) => sum + item.price * item.qty, 0);

// Render cart
const renderCart = () => {
  if (!cart.length) {
    cartItemsEl.innerHTML = '<p>سبد خرید خالی است.</p>';
    cartTotalEl.textContent = '0';
    return;
  }

  cartItemsEl.innerHTML = cart.map(item => `
    <div class="cart-item" data-id="${item.id}">
      <div class="meta">
        <div class="name">${item.name}</div>
        <div class="price">${item.price} افغانی × ${item.qty} = <strong>${item.price * item.qty} افغانی</strong></div>
      </div>
      <div style="display:flex;gap:8px;align-items:center">
        <div class="qty-controls">
          <button class="btn small ghost dec" data-id="${item.id}">−</button>
          <div style="min-width:26px;text-align:center">${item.qty}</div>
          <button class="btn small" data-id="${item.id}">+</button>
        </div>
        <button class="btn small danger remove" title="حذف" data-id="${item.id}">×</button>
      </div>
    </div>
  `).join('');

  cartTotalEl.textContent = calculateTotal();
};

// Event delegation for product add buttons
productsListEl.addEventListener('click', e => {
  const target = e.target;
  if (target.matches('.add-btn')) {
    const id = target.dataset.id;
    addToCart(id);
  }
});

// Cart item buttons (increase/decrease/remove)
cartItemsEl.addEventListener('click', e => {
  const target = e.target;
  const id = target.dataset.id;
  if (!id) return;

  if (target.matches('.remove')) {
    removeFromCart(id);
  } else if (target.matches('.dec')) {
    changeQty(id, -1);
  } else if (target.matches('.btn') && target.textContent.trim() === '+') {
    changeQty(id, +1);
  }
});

// Clear cart
clearCartBtn.addEventListener('click', () => {
  if (!cart.length) return;
  if (!confirm('آیا واقعاً می‌خواهید سبد را پاک کنید؟')) return;
  cart = [];
  saveCart();
  renderCart();
  showToast('سبد پاک شد');
});

// Search
searchInput.addEventListener('input', e => {
  const q = e.target.value.trim();
  renderProducts(q);
});

// Keyboard: pressing Enter in search will focus first add button (nice UX)
searchInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    const first = document.querySelector('.add-btn');
    if (first) first.focus();
  }
});

// Initialization
const init = () => {
  loadCart();
  renderProducts();
  renderCart();
};

init();