// ===== Configuration =====
const WHATSAPP_NUMBER = "6289687042904"; // WhatsApp number without + or spaces
const PRODUCTS_JSON_PATH = "assets/data/products.json";

// ===== State Management =====
let products = [];
let cart = [];
let currentFilter = "all";

// ===== Initialize App =====
document.addEventListener("DOMContentLoaded", () => {
  loadProducts();
  loadCart();
  initializeEventListeners();
  initializeLocationPicker();
  updateCartUI();
});

// ===== Load Products from JSON =====
async function loadProducts() {
  try {
    const response = await fetch(PRODUCTS_JSON_PATH);
    products = await response.json();
    renderProducts();
  } catch (error) {
    console.error("Error loading products:", error);
    document.getElementById("productsGrid").innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                <p style="color: #ef4444; font-size: 1.2rem;">Gagal memuat produk. Silakan refresh halaman.</p>
            </div>
        `;
  }
}

// ===== Render Products =====
function renderProducts() {
  const grid = document.getElementById("productsGrid");
  const filteredProducts =
    currentFilter === "all"
      ? products
      : products.filter((p) => p.category === currentFilter);

  if (filteredProducts.length === 0) {
    grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                <p style="color: #6b7280; font-size: 1.2rem;">Tidak ada produk dalam kategori ini.</p>
            </div>
        `;
    return;
  }

  grid.innerHTML = filteredProducts
    .map(
      (product) => `
        <div class="product-card" data-category="${product.category}">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}">
                <span class="product-badge">${product.size}</span>
            </div>
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-notes">
                    ${product.notes
                      .map((note) => `<span class="note-tag">${note}</span>`)
                      .join("")}
                </div>
                <div class="product-footer">
                    <div class="product-price">${formatPrice(
                      product.price
                    )}</div>
                    <button class="add-to-cart" onclick="addToCart(${
                      product.id
                    })">
                        <i class="fas fa-cart-plus"></i> Tambah
                    </button>
                </div>
            </div>
        </div>
    `
    )
    .join("");
}

// ===== Filter Products =====
function filterProducts(category) {
  currentFilter = category;
  renderProducts();

  // Update active filter button
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.classList.remove("active");
    if (btn.dataset.category === category) {
      btn.classList.add("active");
    }
  });
}

// ===== Shopping Cart Functions =====
function addToCart(productId) {
  const product = products.find((p) => p.id === productId);
  if (!product) return;

  const existingItem = cart.find((item) => item.id === productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
    });
  }

  saveCart();
  updateCartUI();
  showNotification("Produk ditambahkan ke keranjang!");
}

function removeFromCart(productId) {
  cart = cart.filter((item) => item.id !== productId);
  saveCart();
  updateCartUI();
}

function updateQuantity(productId, change) {
  const item = cart.find((item) => item.id === productId);
  if (!item) return;

  item.quantity += change;

  if (item.quantity <= 0) {
    removeFromCart(productId);
  } else {
    saveCart();
    updateCartUI();
  }
}

function saveCart() {
  localStorage.setItem("lendomCart", JSON.stringify(cart));
}

function loadCart() {
  const savedCart = localStorage.getItem("lendomCart");
  if (savedCart) {
    cart = JSON.parse(savedCart);
  }
}

function updateCartUI() {
  const cartCount = document.getElementById("cartCount");
  const cartItems = document.getElementById("cartItems");
  const totalPrice = document.getElementById("totalPrice");

  // Update cart count
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = totalItems;

  // Update cart items
  if (cart.length === 0) {
    cartItems.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <p>Keranjang belanja Anda kosong</p>
            </div>
        `;
    totalPrice.textContent = "Rp 0";
    return;
  }

  cartItems.innerHTML = cart
    .map(
      (item) => `
        <div class="cart-item">
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">${formatPrice(item.price)}</div>
                <div class="cart-item-controls">
                    <button class="qty-btn" onclick="updateQuantity(${
                      item.id
                    }, -1)">
                        <i class="fas fa-minus"></i>
                    </button>
                    <span class="cart-item-qty">${item.quantity}</span>
                    <button class="qty-btn" onclick="updateQuantity(${
                      item.id
                    }, 1)">
                        <i class="fas fa-plus"></i>
                    </button>
                    <button class="remove-item" onclick="removeFromCart(${
                      item.id
                    })">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `
    )
    .join("");

  // Update total price
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  totalPrice.textContent = formatPrice(total);
}

// ===== Location Picker Functions =====
let map = null;
let marker = null;
let selectedLocation = { lat: null, lng: null };

function initializeLocationPicker() {
    const openMapBtn = document.getElementById('openMapBtn');
    const closeMapModal = document.getElementById('closeMapModal');
    const mapModalOverlay = document.getElementById('mapModalOverlay');
    const useCurrentLocation = document.getElementById('useCurrentLocation');
    const confirmLocation = document.getElementById('confirmLocation');
    
    if (openMapBtn) {
        openMapBtn.addEventListener('click', openMapModal);
    }
    
    if (closeMapModal) {
        closeMapModal.addEventListener('click', closeMapModal_);
    }
    
    if (mapModalOverlay) {
        mapModalOverlay.addEventListener('click', closeMapModal_);
    }
    
    if (useCurrentLocation) {
        useCurrentLocation.addEventListener('click', getCurrentLocation);
    }
    
    if (confirmLocation) {
        confirmLocation.addEventListener('click', confirmSelectedLocation);
    }
}

function openMapModal() {
    const mapModal = document.getElementById('mapModal');
    mapModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Initialize map if not already initialized
    if (!map) {
        setTimeout(() => {
            initializeMap();
        }, 100);
    }
}

function closeMapModal_() {
    const mapModal = document.getElementById('mapModal');
    mapModal.classList.remove('active');
    document.body.style.overflow = '';
}

function initializeMap() {
    // Default center (Indonesia)
    const defaultLat = -6.2088;
    const defaultLng = 106.8456;
    
    // Initialize Leaflet map
    map = L.map('leafletMap').setView([defaultLat, defaultLng], 13);
    
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);
    
    // Add click event to map
    map.on('click', function(e) {
        setMapLocation(e.latlng.lat, e.latlng.lng);
    });
}

function setMapLocation(lat, lng) {
    selectedLocation.lat = lat;
    selectedLocation.lng = lng;
    
    // Remove existing marker if any
    if (marker) {
        map.removeLayer(marker);
    }
    
    // Add new marker
    marker = L.marker([lat, lng], {
        draggable: true
    }).addTo(map);
    
    // Update marker position on drag
    marker.on('dragend', function(e) {
        const position = e.target.getLatLng();
        setMapLocation(position.lat, position.lng);
    });
    
    // Update coordinates display
    const coordinatesText = document.getElementById('coordinatesText');
    const mapCoordinates = document.getElementById('mapCoordinates');
    coordinatesText.textContent = `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`;
    mapCoordinates.style.display = 'flex';
    
    // Enable confirm button
    document.getElementById('confirmLocation').disabled = false;
}

function getCurrentLocation() {
    const btn = document.getElementById('useCurrentLocation');
    
    if (!navigator.geolocation) {
        showNotification('Geolocation tidak didukung oleh browser Anda', 'error');
        return;
    }
    
    // Update button state
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengambil lokasi...';
    btn.disabled = true;
    
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            
            // Center map on user location
            map.setView([lat, lng], 15);
            
            // Set marker at user location
            setMapLocation(lat, lng);
            
            // Reset button
            btn.innerHTML = originalHTML;
            btn.disabled = false;
            
            showNotification('Lokasi Anda berhasil ditemukan!', 'success');
        },
        (error) => {
            let errorMessage = 'Gagal mengambil lokasi';
            
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage = 'Izin lokasi ditolak. Mohon aktifkan izin lokasi di browser Anda.';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage = 'Informasi lokasi tidak tersedia';
                    break;
                case error.TIMEOUT:
                    errorMessage = 'Waktu permintaan lokasi habis';
                    break;
            }
            
            showNotification(errorMessage, 'error');
            
            // Reset button
            btn.innerHTML = originalHTML;
            btn.disabled = false;
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
}

function confirmSelectedLocation() {
    if (!selectedLocation.lat || !selectedLocation.lng) {
        showNotification('Mohon pilih lokasi terlebih dahulu', 'error');
        return;
    }
    
    // Store in hidden inputs
    document.getElementById('customerLatitude').value = selectedLocation.lat;
    document.getElementById('customerLongitude').value = selectedLocation.lng;
    
    // Show success message
    const locationInfo = document.getElementById('locationInfo');
    const locationText = document.getElementById('locationText');
    locationText.textContent = `Lokasi dipilih: ${selectedLocation.lat.toFixed(6)}, ${selectedLocation.lng.toFixed(6)}`;
    locationInfo.style.display = 'flex';
    
    // Close modal
    closeMapModal_();
    
    showNotification('Lokasi berhasil dipilih!', 'success');
}

// ===== WhatsApp Checkout =====
function checkout() {
    if (cart.length === 0) {
        showNotification('Keranjang belanja Anda kosong!', 'error');
        return;
    }
    
    // Get customer information
    const customerName = document.getElementById('customerName').value.trim();
    const customerAddress = document.getElementById('customerAddress').value.trim();
    const customerPhone = document.getElementById('customerPhone').value.trim();
    const customerLat = document.getElementById('customerLatitude').value;
    const customerLng = document.getElementById('customerLongitude').value;
    
    // Validate inputs
    if (!customerName) {
        showNotification('Mohon masukkan nama lengkap Anda', 'error');
        document.getElementById('customerName').focus();
        return;
    }
    
    if (!customerAddress) {
        showNotification('Mohon masukkan alamat pengiriman', 'error');
        document.getElementById('customerAddress').focus();
        return;
    }
    
    if (!customerPhone) {
        showNotification('Mohon masukkan nomor telepon', 'error');
        document.getElementById('customerPhone').focus();
        return;
    }
    
    // Build WhatsApp message
    let message = '*PESANAN LENDOM PARFUM*\\n\\n';
    
    message += '*Informasi Pelanggan:*\\n';
    message += `Nama: ${customerName}\\n`;
    message += `No. Telepon: ${customerPhone}\\n`;
    message += `Alamat: ${customerAddress}\\n`;
    
    // Add location if available
    if (customerLat && customerLng) {
        message += `Lokasi: https://maps.google.com/?q=${customerLat},${customerLng}\\n`;
    }
    
    message += '\\n*Detail Pesanan:*\\n';
    
    cart.forEach((item, index) => {
        message += `${index + 1}. ${item.name}\\n`;
        message += `   Jumlah: ${item.quantity}\\n`;
        message += `   Harga: ${formatPrice(item.price)}\\n`;
        message += `   Subtotal: ${formatPrice(item.price * item.quantity)}\\n\\n`;
    });
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    message += `*Total: ${formatPrice(total)}*\\n\\n`;
    message += 'Mohon konfirmasi pesanan ini. Terima kasih!';
    
    // Encode message for URL
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
    
    // Open WhatsApp
    window.open(whatsappUrl, '_blank');
    
    // Clear form after successful checkout
    document.getElementById('customerName').value = '';
    document.getElementById('customerAddress').value = '';
    document.getElementById('customerPhone').value = '';
    document.getElementById('customerLatitude').value = '';
    document.getElementById('customerLongitude').value = '';
    document.getElementById('locationInfo').style.display = 'none';
    
    // Reset selected location
    selectedLocation = { lat: null, lng: null };
    if (marker && map) {
        map.removeLayer(marker);
        marker = null;
    }
    document.getElementById('mapCoordinates').style.display = 'none';
    document.getElementById('confirmLocation').disabled = true;
    
    showNotification('Pesanan dikirim ke WhatsApp!', 'success');
    
    // Optional: Clear cart after checkout
    // cart = [];
    // saveCart();
    // updateCartUI();
    // closeCart();
}

// ===== Cart Modal Functions =====
function openCart() {
  document.getElementById("cartModal").classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeCart() {
  document.getElementById("cartModal").classList.remove("active");
  document.body.style.overflow = "";
}

// ===== Event Listeners =====
function initializeEventListeners() {
  // Cart modal
  document.getElementById("cartBtn").addEventListener("click", openCart);
  document.getElementById("closeCart").addEventListener("click", closeCart);
  document.getElementById("cartOverlay").addEventListener("click", closeCart);

  // Checkout button
  document.getElementById("checkoutBtn").addEventListener("click", checkout);

  // Filter buttons
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      filterProducts(btn.dataset.category);
    });
  });

  // Smooth scroll for navigation
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = link.getAttribute("href");
      const targetSection = document.querySelector(targetId);

      if (targetSection) {
        const navHeight = document.querySelector(".navbar").offsetHeight;
        const targetPosition = targetSection.offsetTop - navHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        });

        // Update active link
        document
          .querySelectorAll(".nav-link")
          .forEach((l) => l.classList.remove("active"));
        link.classList.add("active");
      }
    });
  });

  // Update active nav link on scroll
  window.addEventListener("scroll", () => {
    const sections = document.querySelectorAll("section[id]");
    const navHeight = document.querySelector(".navbar").offsetHeight;

    sections.forEach((section) => {
      const sectionTop = section.offsetTop - navHeight - 100;
      const sectionBottom = sectionTop + section.offsetHeight;
      const scrollPosition = window.scrollY;

      if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
        const currentId = section.getAttribute("id");
        document.querySelectorAll(".nav-link").forEach((link) => {
          link.classList.remove("active");
          if (link.getAttribute("href") === `#${currentId}`) {
            link.classList.add("active");
          }
        });
      }
    });
  });
}

// ===== Utility Functions =====
function formatPrice(price) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
}

function showNotification(message, type = "success") {
  // Create notification element
  const notification = document.createElement("div");
  notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === "success" ? "#10b981" : "#ef4444"};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        z-index: 9999;
        animation: slideInRight 0.3s ease;
        font-weight: 600;
    `;
  notification.textContent = message;

  // Add animation
  const style = document.createElement("style");
  style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
  document.head.appendChild(style);

  document.body.appendChild(notification);

  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = "slideInRight 0.3s ease reverse";
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

// ===== Make functions globally available =====
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
window.checkout = checkout;
