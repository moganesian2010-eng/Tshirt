const sizes = ['S', 'M', 'L', 'XL'];
const price = 3600;
const maxQuantity = 99;
const storageKey = 'mezamer.cart.v1';
const number = new Intl.NumberFormat('ru-RU');
const rubles = (amount) => `${number.format(amount)} ₽`;

const productPage = document.getElementById('product-page');
const cartPage = document.getElementById('cart-page');
const productForm = document.getElementById('product-form');
const cartLink = document.getElementById('cart-link');
const headerCount = document.getElementById('header-count');
const cartTitle = document.getElementById('cart-title');
const cartCount = document.getElementById('cart-count');
const cartItems = document.getElementById('cart-items');
const cartLayout = document.getElementById('cart-layout');
const emptyCart = document.getElementById('empty-cart');
const subtotalLabel = document.getElementById('subtotal-label');
const subtotal = document.getElementById('subtotal');
const total = document.getElementById('total');
const cartStatus = document.getElementById('cart-status');
const checkoutForm = document.getElementById('checkout-form');
const checkoutStatus = document.getElementById('checkout-status');

function loadCart() {
  const entries = new Map();
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    for (const size of sizes) {
      const quantity = saved?.[size];
      if (Number.isInteger(quantity) && quantity >= 1 && quantity <= maxQuantity) {
        entries.set(size, quantity);
      }
    }
  } catch {
    // The shop still works in memory when storage is unavailable.
  }
  return entries;
}

let cart = loadCart();

function saveCart() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(Object.fromEntries(cart)));
  } catch {
    // Keep the current cart in memory.
  }
}

function itemMarkup(size, quantity) {
  return `
    <li class="cart-item" data-size="${size}">
      <img class="item-photo" src="./assets/horny-alternative.png" width="524" height="476" alt="">
      <div class="item-details">
        <p class="eyebrow">Футболка</p>
        <h2>horny alternative</h2>
        <p class="item-size">Размер ${size}</p>
      </div>
      <button class="icon-button remove" type="button" data-action="remove" aria-label="Удалить размер ${size}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m5 5 14 14M19 5 5 19"/></svg>
      </button>
      <div class="quantity" role="group" aria-label="Количество для размера ${size}">
        <button class="icon-button" type="button" data-action="minus" aria-label="Уменьшить количество размера ${size}" ${quantity === 1 ? 'disabled' : ''}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M4 12h16"/></svg>
        </button>
        <span>${quantity}</span>
        <button class="icon-button" type="button" data-action="plus" aria-label="Увеличить количество размера ${size}" ${quantity === maxQuantity ? 'disabled' : ''}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M4 12h16M12 4v16"/></svg>
        </button>
      </div>
      <p class="item-price">${rubles(quantity * price)}</p>
    </li>`;
}

function itemCount() {
  return [...cart.values()].reduce((sum, quantity) => sum + quantity, 0);
}

function renderCart() {
  const count = itemCount();
  headerCount.textContent = count;
  cartCount.textContent = count;
  cartLink.setAttribute('aria-label', `Корзина, товаров: ${count}`);
  emptyCart.hidden = count > 0;
  cartLayout.hidden = count === 0;
  cartItems.innerHTML = [...cart].map(([size, quantity]) => itemMarkup(size, quantity)).join('');
  subtotalLabel.textContent = `Товары, ${count} шт.`;
  subtotal.textContent = rubles(count * price);
  total.textContent = subtotal.textContent;
  checkoutStatus.hidden = true;
}

function showPage(focusTitle = false) {
  const showingCart = location.hash === '#cart';
  productPage.hidden = showingCart;
  cartPage.hidden = !showingCart;
  document.title = showingCart ? 'Корзина — mezamer' : 'horny alternative — mezamer';
  if (focusTitle) {
    const heading = showingCart ? cartTitle : document.getElementById('product-title');
    heading.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }
}

productForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const size = new FormData(productForm).get('size');
  if (!sizes.includes(size)) return;
  const quantity = cart.get(size) ?? 0;
  cart.set(size, Math.min(quantity + 1, maxQuantity));
  saveCart();
  renderCart();
  location.hash = 'cart';
});

cartItems.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button || button.disabled) return;

  const { size } = button.closest('.cart-item').dataset;
  const { action } = button.dataset;
  if (action === 'remove') {
    cart.delete(size);
  } else {
    cart.set(size, cart.get(size) + (action === 'plus' ? 1 : -1));
  }

  saveCart();
  renderCart();
  cartStatus.textContent = `Товаров в корзине: ${itemCount()}. Итого ${total.textContent}.`;

  if (action === 'remove') {
    const next = cartItems.querySelector('.remove') ?? emptyCart.querySelector('a');
    next.focus();
  } else {
    const item = cartItems.querySelector(`[data-size="${size}"]`);
    const next = item.querySelector(`[data-action="${action}"]:enabled`) ?? item.querySelector('.quantity button:enabled');
    next.focus({ preventScroll: true });
  }
});

checkoutForm.addEventListener('input', () => {
  checkoutStatus.hidden = true;
});

checkoutForm.addEventListener('submit', (event) => {
  event.preventDefault();
  checkoutStatus.textContent = `Данные проверены. Сумма заказа — ${total.textContent}.`;
  checkoutStatus.hidden = false;
});

window.addEventListener('hashchange', () => showPage(true));
window.addEventListener('storage', (event) => {
  if (event.key === storageKey || event.key === null) {
    cart = loadCart();
    renderCart();
  }
});

renderCart();
showPage();
