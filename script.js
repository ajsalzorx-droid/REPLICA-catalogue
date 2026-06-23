const WHATSAPP_NUMBER = "971528338455";

const categoryData = window.CATALOGUE_CATEGORIES || [];
const categories = categoryData.map((category) => category.name);

// Loaded from products-data.js, generated from CATEGORY_INDEX.csv.
const products = window.CATALOGUE_PRODUCTS || [];

let activeCategory = "All";
let activeSearch = "";
let visibleLimit = 0;

const categoryGrid = document.querySelector("#categoryGrid");
const filterRow = document.querySelector("#filterRow");
const productGrid = document.querySelector("#productGrid");
const emptyState = document.querySelector("#emptyState");
const loadMoreButton = document.querySelector("#loadMoreButton");
const productSearch = document.querySelector("#productSearch");
const modal = document.querySelector("#productModal");
const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");

function whatsappUrl(productName) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`I am interested in ${productName}`)}`;
}

function productArtwork(product) {
  return `
    <div class="product-image">
      <img src="${product.image}" alt="${product.name}" loading="lazy" decoding="async" width="640" height="500" />
    </div>
  `;
}

function initialProductLimit() {
  if (window.matchMedia("(min-width: 1120px)").matches) return 36;
  if (window.matchMedia("(min-width: 760px)").matches) return 24;
  return 12;
}

function resetProductLimit() {
  visibleLimit = initialProductLimit();
}

function renderCategories() {
  categoryGrid.innerHTML = categoryData
    .map(
      (category) => `
        <button class="category-card" type="button" data-category="${category.name}">
          <span>
            <strong>${category.name}</strong>
            <small>${category.count} items</small>
          </span>
          <span class="category-icon">${category.name.charAt(0)}</span>
        </button>
      `
    )
    .join("");
}

function renderFilters() {
  const filters = ["All", ...categories];
  filterRow.innerHTML = filters
    .map(
      (category) => `
        <button class="filter-button ${category === activeCategory ? "is-active" : ""}" type="button" data-category="${category}">
          ${category}
        </button>
      `
    )
    .join("");
}

function filteredProducts() {
  return products.filter((product) => {
    const matchesCategory = activeCategory === "All" || product.category === activeCategory;
    const query = activeSearch.trim().toLowerCase();
    const matchesSearch =
      !query ||
      product.name.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query);

    return matchesCategory && matchesSearch;
  });
}

function renderProducts() {
  const visibleProducts = filteredProducts();
  const renderedProducts = visibleProducts.slice(0, visibleLimit);
  productGrid.innerHTML = renderedProducts
    .map(
      (product) => `
        <article class="product-card" data-product-id="${product.id}">
          ${productArtwork(product)}
          <div class="product-body">
            <div class="product-top">
              <div>
                <p class="product-category">${product.category}</p>
                <h3>${product.name}</h3>
              </div>
            </div>
            <p>${product.description}</p>
            <div class="product-actions">
              <button class="button button-outline" type="button" data-view-product="${product.id}">Details</button>
              <a class="button button-primary" href="${whatsappUrl(product.name)}" target="_blank" rel="noreferrer">
                Enquire
              </a>
            </div>
          </div>
        </article>
      `
    )
    .join("");
  emptyState.hidden = visibleProducts.length > 0;
  loadMoreButton.hidden = visibleProducts.length <= visibleLimit;
  loadMoreButton.textContent = `Load more (${visibleProducts.length - renderedProducts.length} remaining)`;
}

function setCategory(category) {
  activeCategory = category;
  resetProductLimit();
  renderFilters();
  renderProducts();
  document.querySelector("#catalogue").scrollIntoView({ behavior: "smooth" });
}

function openModal(productId) {
  const product = products.find((item) => item.id === Number(productId));
  if (!product) return;

  document.querySelector("#modalImage").innerHTML = productArtwork(product);
  document.querySelector("#modalCategory").textContent = product.category;
  document.querySelector("#modalTitle").textContent = product.name;
  document.querySelector("#modalDescription").textContent = product.description;
  document.querySelector("#modalWhatsapp").href = whatsappUrl(product.name);

  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-lock");
}

function closeModal() {
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-lock");
}

function hydrateWhatsappLinks() {
  document.querySelectorAll("[data-whatsapp]").forEach((link) => {
    link.href = whatsappUrl(link.dataset.whatsapp);
    link.target = "_blank";
    link.rel = "noreferrer";
  });
}

document.addEventListener("click", (event) => {
  const categoryButton = event.target.closest("[data-category]");
  const viewButton = event.target.closest("[data-view-product]");
  const closeButton = event.target.closest("[data-close-modal]");
  const whatsappLink = event.target.closest("[data-whatsapp]");

  if (categoryButton) {
    setCategory(categoryButton.dataset.category);
  }

  if (viewButton) {
    openModal(viewButton.dataset.viewProduct);
  }

  if (closeButton) {
    closeModal();
  }

  if (whatsappLink) {
    whatsappLink.href = whatsappUrl(whatsappLink.dataset.whatsapp);
    whatsappLink.target = "_blank";
    whatsappLink.rel = "noreferrer";
  }
});

productSearch.addEventListener("input", (event) => {
  activeSearch = event.target.value;
  resetProductLimit();
  renderProducts();
});

menuToggle.addEventListener("click", () => {
  const isOpen = siteNav.classList.toggle("is-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  document.body.classList.toggle("menu-lock", isOpen);
});

siteNav.addEventListener("click", () => {
  siteNav.classList.remove("is-open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open menu");
  document.body.classList.remove("menu-lock");
});

loadMoreButton.addEventListener("click", () => {
  visibleLimit += initialProductLimit();
  renderProducts();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeModal();
  }
});

document.querySelector(".enquiry-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const message = formData.get("message") || "General catalogue enquiry";
  window.open(whatsappUrl(message), "_blank", "noreferrer");
});

renderCategories();
renderFilters();
resetProductLimit();
renderProducts();
hydrateWhatsappLinks();
