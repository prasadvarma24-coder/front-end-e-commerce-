
const products = [
  { id: 1, name: "Wireless Headphones", category: "Electronics",
    price: 1499, rating: 4.8, image: "headphones.jpg",
    description: "Comfortable wireless headphones for music and everyday use." },
  { id: 2, name: "Smart Watch", category: "Electronics",
    price: 2499, rating: 4.6, image: "watch.jpg",
    description: "A modern smartwatch for daily activities and notifications." },
  { id: 3, name: "Casual T-Shirt", category: "Fashion",
    price: 599, rating: 4.5, image: "Tshirt.jpg",
    description: "A versatile casual T-shirt for everyday comfort." },
  { id: 4, name: "Sports Shoes", category: "Fashion",
    price: 1999, rating: 4.7, image: "addidas.jpg",
    description: "Lightweight shoes for walking and casual exercise." },
  { id: 5, name: "Sports Shoes", category: "Fashion",
    price: 1999, rating: 4.7, image: "nike.jpg",
    description: "Lightweight shoes for walking and casual exercise." },
  { id: 6, name: "Sunglasses", category: "Accessories",
    price: 799, rating: 4.3, image: "sunglasses.jpg",
    description: "Stylish sunglasses to complete your everyday look." },
  { id: 7, name: "Travel Backpack", category: "Accessories",
    price: 999, rating: 4.6, image: "backpack.jpg",
    description: "A practical backpack for work, school, or travel." },
  { id: 8, name: "Bluetooth Speaker", category: "Electronics",
    price: 1299, rating: 4.4, image: "steinmusic.jpg",
    description: "A compact speaker for listening to music on the go." },
  { id: 9, name: "Classic Watch", category: "Accessories",
    price: 2099, rating: 4.5, image: "Cwatch.jpg",
    description: "A compact speaker for listening to music on the go." },
  { id: 10, name: "Classic Watch", category: "Accessories",
    price: 1599, rating: 4.5, image: "ferarcosn.jpg",
    description: "A classic everyday watch with a simple design." }

  
  
];

let cart = [];
let activeCategory = "All";

const $ = id => document.getElementById(id);
const money = value => "₹" + value.toLocaleString("en-IN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

function renderProducts() {
  const query = $("search").value.trim().toLowerCase();
  const sort = $("sort").value;

  let visible = products.filter(product =>
    product.name.toLowerCase().includes(query) &&
    (activeCategory === "All" ||
      product.category === activeCategory)
  );

  if (sort === "low") visible.sort((a, b) => a.price - b.price);
  if (sort === "high") visible.sort((a, b) => b.price - a.price);
  if (sort === "rating") visible.sort((a, b) => b.rating - a.rating);

  $("result-count").textContent =
    `${visible.length} product${visible.length === 1 ? "" : "s"} found`;

  const container = $("products");

  if (!visible.length) {
    container.innerHTML =
      '<div class="empty-state">No products found. Try another search.</div>';
    return;
  }

  container.innerHTML = visible.map(product => `
    <article class="product-card">
      <div class="product-image"
        role="button" tabindex="0"
        aria-label="View ${product.name}"
        data-detail="${product.id}">
        <img src="${product.image}" alt="${product.name}" loading="lazy">
      </div>
      <div class="product-info">
        <span class="product-category">${product.category}</span>
        <h3>${product.name}</h3>
        <p class="rating">★ ${product.rating} / 5</p>
        <p class="product-price">${money(product.price)}</p>
        <button class="add-button" data-add="${product.id}">
          Add to Cart
        </button>
      </div>
    </article>
  `).join("");
}

function addToCart(id) {
  const item = cart.find(product => product.id === id);

  if (item) {
    item.quantity++;
  } else {
    const product = products.find(product => product.id === id);
    cart.push({ ...product, quantity: 1 });
  }

  renderCart();
}

function changeQuantity(id, amount) {
  const item = cart.find(product => product.id === id);
  if (!item) return;

  item.quantity += amount;
  cart = cart.filter(product => product.quantity > 0);
  renderCart();
}

function removeFromCart(id) {
  cart = cart.filter(product => product.id !== id);
  renderCart();
}

function renderCart() {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity, 0
  );

  // Example delivery rule: free for orders of ₹2,000 or more.
  const delivery = subtotal === 0 || subtotal >= 2000 ? 0 : 99;

  $("cart-count").textContent = count;
  $("subtotal").textContent = money(subtotal);
  $("delivery").textContent = money(delivery);
  $("total").textContent = money(subtotal + delivery);

  $("cart-items").innerHTML = cart.length
    ? cart.map(item => `
      <div class="cart-row">
        <div>
          <strong>${item.name}</strong>
          <div>${money(item.price)} each</div>
        </div>
        <div class="quantity-controls" aria-label="${item.name} quantity">
          <button data-change="${item.id}" data-amount="-1"
            aria-label="Decrease ${item.name} quantity">−</button>
          <span>${item.quantity}</span>
          <button data-change="${item.id}" data-amount="1"
            aria-label="Increase ${item.name} quantity">+</button>
        </div>
        <strong>${money(item.price * item.quantity)}</strong>
        <button class="remove-button" data-remove="${item.id}">
          Remove
        </button>
      </div>
    `).join("")
    : '<div class="empty-state">Your cart is empty. Start shopping!</div>';
}

function showProductDetails(id) {
  const product = products.find(item => item.id === id);
  if (!product) return;

  $("product-detail").innerHTML = `
    <img class="detail-image" src="${product.image}" alt="${product.name}">
    <p class="product-category">${product.category}</p>
    <h2>${product.name}</h2>
    <p class="rating">★ ${product.rating} / 5</p>
    <p>${product.description}</p>
    <p class="product-price">${money(product.price)}</p>
    <button class="primary-button" id="detail-add">Add to Cart</button>
  `;

  $("product-dialog").showModal();
  $("detail-add").addEventListener("click", () => {
    addToCart(id);
    $("product-dialog").close();
  });
}

// Event delegation handles product and cart buttons.
$("products").addEventListener("click", event => {
  const addButton = event.target.closest("[data-add]");
  const detail = event.target.closest("[data-detail]");

  if (addButton) addToCart(Number(addButton.dataset.add));
  if (detail) showProductDetails(Number(detail.dataset.detail));
});

$("products").addEventListener("keydown", event => {
  if (
    (event.key === "Enter" || event.key === " ") &&
    event.target.matches("[data-detail]")
  ) {
    event.preventDefault();
    showProductDetails(Number(event.target.dataset.detail));
  }
});

$("cart-items").addEventListener("click", event => {
  const change = event.target.closest("[data-change]");
  const remove = event.target.closest("[data-remove]");

  if (change) {
    changeQuantity(
      Number(change.dataset.change),
      Number(change.dataset.amount)
    );
  }

  if (remove) removeFromCart(Number(remove.dataset.remove));
});

$("search").addEventListener("input", renderProducts);
$("sort").addEventListener("change", renderProducts);

$("search-form").addEventListener("submit", event => {
  event.preventDefault();
  renderProducts();
});

document.querySelector(".categories").addEventListener("click", event => {
  const button = event.target.closest("[data-category]");
  if (!button) return;

  activeCategory = button.dataset.category;

  document.querySelectorAll(".category").forEach(item => {
    item.classList.toggle("active", item === button);
  });

  renderProducts();
});

$("cart-toggle").addEventListener("click", () => {
  $("cart").scrollIntoView({ behavior: "smooth" });
});

$("close-dialog").addEventListener("click", () => {
  $("product-dialog").close();
});

$("product-dialog").addEventListener("click", event => {
  if (event.target === $("product-dialog")) {
    $("product-dialog").close();
  }
});

$("checkout").addEventListener("click", () => {
  $("checkout-message").textContent = cart.length
    ? "Demo only: connect a backend and payment provider to place an order."
    : "Your cart is empty. Add a product first.";
});

renderProducts();
renderCart();