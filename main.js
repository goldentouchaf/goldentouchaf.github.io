// ============================================
// main.js – کدهای کامل گلدن تاچ
// شامل: 3D, سبد خرید, حذف و اضافه, پیام, فرم خریدار, واتساپ خودکار
// ============================================

let cart = [];
let currentProducts = [];
let currentDiscount = 0;
let discountPercent = 0;
let currentShipping = 0;
let selectedProvince = "kabul";

// ========== 1. THREE.JS 3D BACKGROUND ==========
function init3DBackground() {
  import('three').then((THREE) => {
    const container = document.getElementById('canvas-container');
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050505);
    
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 6);
    
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);
    
    const particlesCount = 1500;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount; i++) {
      positions[i*3] = (Math.random() - 0.5) * 20;
      positions[i*3+1] = (Math.random() - 0.5) * 12;
      positions[i*3+2] = (Math.random() - 0.5) * 15 - 5;
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
      color: 0xd4af37,
      size: 0.04,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending
    });
    
    const particles = new THREE.Points(geometry, particleMaterial);
    scene.add(particles);
    
    const ringGeo = new THREE.TorusGeometry(0.8, 0.05, 64, 200);
    const ringMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.9, roughness: 0.2, emissive: 0x442200 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    scene.add(ring);
    
    const ring2 = new THREE.Mesh(ringGeo, ringMat);
    ring2.scale.set(0.6, 0.6, 0.6);
    ring2.position.x = 1.5;
    ring2.position.y = -1;
    scene.add(ring2);
    
    const ambientLight = new THREE.AmbientLight(0x222222);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xd4af37, 1);
    pointLight.position.set(2, 3, 4);
    scene.add(pointLight);
    const backLight = new THREE.PointLight(0xaa7c1f, 0.5);
    backLight.position.set(-2, 1, -3);
    scene.add(backLight);
    
    let time = 0;
    let scrollY = 0;
    
    window.addEventListener('scroll', () => {
      scrollY = window.scrollY / (document.body.scrollHeight - window.innerHeight);
    });
    
    function animate() {
      requestAnimationFrame(animate);
      time += 0.008;
      
      particles.rotation.y = time * 0.1;
      particles.rotation.x = Math.sin(time * 0.2) * 0.1;
      
      ring.rotation.x = time * 0.5;
      ring.rotation.y = time * 0.3;
      ring2.rotation.x = time * 0.7;
      ring2.rotation.z = time * 0.4;
      
      camera.position.z = 6 + scrollY * 2;
      camera.lookAt(0, 0, 0);
      
      renderer.render(scene, camera);
    }
    
    animate();
    
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  });
}

// ========== 2. GSAP SCROLL ANIMATIONS ==========
function initScrollAnimations() {
  gsap.registerPlugin(ScrollTrigger);
  
  gsap.to(".hero h1", {
    opacity: 1,
    y: 0,
    duration: 1.2,
    ease: "power3.out",
    delay: 0.3
  });
  gsap.to(".hero p", {
    opacity: 1,
    y: 0,
    duration: 1,
    ease: "power3.out",
    delay: 0.6
  });
  
  gsap.to(".section-title", {
    opacity: 1,
    y: 0,
    duration: 0.8,
    scrollTrigger: {
      trigger: ".section-title",
      start: "top 80%",
      toggleActions: "play none none reverse"
    }
  });
}

// ========== 3. NOTIFICATION SYSTEM ==========
function showNotification(message, type = "success") {
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <span>${message}</span>
      <button class="notification-close">✕</button>
    </div>
  `;
  document.body.appendChild(notification);
  
  notification.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: ${type === "success" ? "#D4AF37" : type === "error" ? "#ff4444" : "#2196F3"};
    color: ${type === "success" ? "#000" : "#fff"};
    padding: 12px 20px;
    border-radius: 12px;
    z-index: 10000;
    font-size: 0.85rem;
    font-weight: bold;
    box-shadow: 0 5px 20px rgba(0,0,0,0.3);
    animation: slideInRight 0.3s ease;
    min-width: 250px;
    max-width: 350px;
    direction: rtl;
    font-family: 'Vazirmatn', sans-serif;
  `;
  
  const closeBtn = notification.querySelector(".notification-close");
  if (closeBtn) {
    closeBtn.style.cssText = `
      background: none;
      border: none;
      color: inherit;
      cursor: pointer;
      margin-right: 10px;
      font-size: 1rem;
    `;
    closeBtn.addEventListener("click", () => {
      notification.remove();
    });
  }
  
  setTimeout(() => {
    notification.remove();
  }, 4000);
}

// اضافه کردن انیمیشن به صفحه
const notifStyle = document.createElement('style');
notifStyle.textContent = `
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;
document.head.appendChild(notifStyle);

// ========== 4. CART FUNCTIONS ==========
function saveCart() {
  localStorage.setItem("goldenTouchCart", JSON.stringify(cart));
  updateCartUI();
}

function loadCart() {
  const saved = localStorage.getItem("goldenTouchCart");
  cart = saved ? JSON.parse(saved) : [];
  updateCartUI();
}

function calculateTotals() {
  let subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  let discountAmount = (subtotal * discountPercent) / 100;
  let total = subtotal - discountAmount + currentShipping;
  return { subtotal, discountAmount, total };
}

function addToCart(product) {
  const existing = cart.find(item => item.id === product.id);
  if (existing) {
    if (existing.quantity < product.stock) {
      existing.quantity += 1;
      saveCart();
      openCartSidebar();
      showNotification(`${product.name} - تعداد: ${existing.quantity} | قیمت: ${(product.price * existing.quantity).toLocaleString()}؋`, "success");
    } else {
      showNotification(`موجودی این محصول ${product.stock} عدد است.`, "error");
    }
  } else {
    cart.push({ 
      id: product.id, 
      name: product.name, 
      price: product.price, 
      thumbnail: product.thumbnail,
      quantity: 1 
    });
    saveCart();
    openCartSidebar();
    showNotification(`${product.name} به سبد خرید اضافه شد. | قیمت: ${product.price.toLocaleString()}؋`, "success");
  }
}

function removeFromCart(productId) {
  const index = cart.findIndex(item => item.id === productId);
  if (index !== -1) {
    const removedItem = cart[index];
    if (cart[index].quantity > 1) {
      cart[index].quantity -= 1;
      saveCart();
      showNotification(`${removedItem.name} - ۱ عدد حذف شد. باقی‌مانده: ${cart[index].quantity} عدد`, "info");
    } else {
      cart.splice(index, 1);
      saveCart();
      showNotification(`${removedItem.name} از سبد خرید حذف شد.`, "info");
    }
  }
}

function changeQuantity(productId, change) {
  const item = cart.find(i => i.id === productId);
  const product = currentProducts.find(p => p.id === productId);
  if (item && product) {
    const newQuantity = item.quantity + change;
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      item.quantity = newQuantity;
      saveCart();
      if (change === 1) {
        showNotification(`${product.name} - تعداد: ${newQuantity} | قیمت: ${(product.price * newQuantity).toLocaleString()}؋`, "success");
      } else {
        showNotification(`${product.name} - تعداد: ${newQuantity} باقی ماند`, "info");
      }
    } else if (newQuantity > product.stock) {
      showNotification(`فقط ${product.stock} عدد از این محصول موجود است.`, "error");
    }
  }
}

// ========== 5. UPDATE CART UI ==========
function updateCartUI() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartCountElem = document.getElementById("cartCount");
  if (cartCountElem) cartCountElem.innerText = totalItems;
  
  const cartContainer = document.getElementById("cartItemsList");
  const customerInfoSection = document.getElementById("customerInfoSection");
  const shippingSection = document.getElementById("shippingSection");
  const discountSection = document.querySelector(".discount-section");
  const shippingCostDiv = document.querySelector(".shipping-cost");
  const discountAmountDiv = document.querySelector(".discount-amount");
  
  if (!cartContainer) return;
  
  if (cart.length === 0) {
    cartContainer.innerHTML = '<p style="text-align:center; margin-top:2rem;">سبد خرید خالی است</p>';
    document.getElementById("cartTotalPrice").innerText = "۰؋";
    document.getElementById("shippingCost").innerText = "۰؋";
    document.getElementById("discountAmount").innerText = "-۰؋";
    document.getElementById("grandTotal").innerText = "۰؋";
    if (shippingSection) shippingSection.style.display = "none";
    if (discountSection) discountSection.style.display = "none";
    if (shippingCostDiv) shippingCostDiv.style.display = "none";
    if (discountAmountDiv) discountAmountDiv.style.display = "none";
    if (customerInfoSection) customerInfoSection.style.display = "none";
    return;
  }
  
  if (shippingSection) shippingSection.style.display = "block";
  if (discountSection) discountSection.style.display = "block";
  if (shippingCostDiv) shippingCostDiv.style.display = "flex";
  if (discountAmountDiv) discountAmountDiv.style.display = "flex";
  if (customerInfoSection) customerInfoSection.style.display = "block";
  
  let html = '';
  cart.forEach(item => {
    const product = currentProducts.find(p => p.id === item.id);
    const stock = product ? product.stock : 0;
    html += `
      <div class="cart-item">
        <img class="cart-item-img" src="${item.thumbnail}" alt="${item.name}">
        <div class="cart-item-details">
          <div class="cart-item-title">${item.name}</div>
          <div class="cart-item-price">${item.price.toLocaleString()}؋</div>
          <div class="cart-item-quantity">
            <button class="quantity-btn" data-id="${item.id}" data-change="-1">-</button>
            <span>${item.quantity}</span>
            <button class="quantity-btn" data-id="${item.id}" data-change="1" ${item.quantity >= stock ? 'disabled' : ''}>+</button>
            <span style="font-size:0.7rem; color:#D4AF37;">موجودی: ${stock}</span>
          </div>
        </div>
        <button class="remove-item" data-id="${item.id}">🗑️</button>
      </div>
    `;
  });
  cartContainer.innerHTML = html;
  
  const { subtotal, discountAmount, total } = calculateTotals();
  
  document.getElementById("cartTotalPrice").innerText = `${subtotal.toLocaleString()}؋`;
  document.getElementById("shippingCost").innerText = `${currentShipping.toLocaleString()}؋`;
  document.getElementById("discountAmount").innerText = `-${discountAmount.toLocaleString()}؋`;
  document.getElementById("grandTotal").innerText = `${total.toLocaleString()}؋`;
  
  document.querySelectorAll(".quantity-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const id = parseInt(btn.dataset.id);
      const change = parseInt(btn.dataset.change);
      changeQuantity(id, change);
    });
  });
  
  document.querySelectorAll(".remove-item").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const id = parseInt(btn.dataset.id);
      removeFromCart(id);
    });
  });
}

// ========== 6. VIDEO CARD CREATOR ==========
function createVideoCard(product) {
  const card = document.createElement("div");
  card.className = "product-card";
  
  const stockText = product.stock > 0 ? `موجودی: ${product.stock} عدد` : "ناموجود";
  const disabled = product.stock === 0 ? 'disabled' : '';
  
  card.innerHTML = `
    <div class="video-container" data-video-state="thumbnail">
      <img class="video-thumbnail" src="${product.thumbnail}" alt="${product.name}">
      <div class="play-button"></div>
      <video class="actual-video" loop muted>
        <source src="${product.video}" type="video/mp4">
      </video>
    </div>
    <div class="product-info">
      <div class="product-title">${product.name}</div>
      <div class="product-description">${product.description || ''}</div>
      <div class="product-stock">${stockText}</div>
      <div class="product-price">${product.price.toLocaleString()}؋</div>
      <button class="add-to-cart" data-id="${product.id}" ${disabled}>${product.stock > 0 ? 'افزودن به سبد' : 'ناموجود'}</button>
    </div>
  `;
  
  const container = card.querySelector('.video-container');
  const thumbnail = card.querySelector('.video-thumbnail');
  const video = card.querySelector('.actual-video');
  const playBtn = card.querySelector('.play-button');
  
  container.addEventListener('click', () => {
    if (video.style.display === 'none' || video.style.display === '') {
      thumbnail.style.display = 'none';
      video.style.display = 'block';
      playBtn.style.opacity = '0';
      video.play();
    } else {
      video.pause();
      video.currentTime = 0;
      video.style.display = 'none';
      thumbnail.style.display = 'block';
      playBtn.style.opacity = '1';
    }
  });
  
  video.addEventListener('ended', () => {
    video.style.display = 'none';
    thumbnail.style.display = 'block';
    playBtn.style.opacity = '1';
  });
  
  return card;
}

// ========== 7. RENDER PRODUCTS ==========
function renderProducts(products) {
  const grid = document.getElementById("productGrid");
  if (!grid) return;
  grid.innerHTML = "";
  
  products.forEach(product => {
    const card = createVideoCard(product);
    grid.appendChild(card);
  });
  
  document.querySelectorAll(".add-to-cart").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = parseInt(btn.dataset.id);
      const product = products.find(p => p.id === id);
      if (product && product.stock > 0) addToCart(product);
    });
  });
  
  gsap.utils.toArray(".product-card").forEach((card, i) => {
    gsap.to(card, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      delay: i * 0.1,
      scrollTrigger: {
        trigger: card,
        start: "top 85%",
        toggleActions: "play none none reverse"
      }
    });
  });
}

// ========== 8. SHIPPING & DISCOUNT ==========
function initShippingAndDiscount() {
  const provinceSelect = document.getElementById("provinceSelect");
  if (provinceSelect) {
    provinceSelect.addEventListener("change", (e) => {
      selectedProvince = e.target.value;
      currentShipping = window.shippingCosts[selectedProvince] || 150;
      document.getElementById("shippingCost").innerText = `${currentShipping.toLocaleString()}؋`;
      updateCartUI();
    });
    currentShipping = window.shippingCosts.kabul || 50;
  }
  
  const applyDiscountBtn = document.getElementById("applyDiscount");
  if (applyDiscountBtn) {
    applyDiscountBtn.addEventListener("click", () => {
      const code = document.getElementById("discountCode").value.trim();
      if (window.validDiscountCodes && window.validDiscountCodes[code]) {
        discountPercent = window.validDiscountCodes[code];
        currentDiscount = discountPercent;
        document.getElementById("discountMessage").innerText = `کد اعمال شد! ${discountPercent}% تخفیف`;
        updateCartUI();
        showNotification(`کد تخفیف ${code} اعمال شد. ${discountPercent}% تخفیف گرفتید`, "success");
      } else {
        document.getElementById("discountMessage").innerText = "کد نامعتبر است";
        showNotification("کد تخفیف نامعتبر است", "error");
      }
    });
  }
}

// ========== 9. SEND WHATSAPP MESSAGE ==========
function sendWhatsAppMessage(customerName, customerLastName, phoneNumber, orderDetails, total, paymentMethodText) {
  let cleanPhone = phoneNumber.replace(/^\+/, '');
  if (!cleanPhone.startsWith('93')) {
    cleanPhone = '93' + cleanPhone;
  }
  
  const message = `🛍 *سفارش شما در گلدن تاچ ثبت شد* 🛍%0A%0A`
    + `👤 نام مشتری: ${customerName} ${customerLastName}%0A`
    + `📞 شماره تماس: ${cleanPhone}%0A`
    + `📦 جزئیات سفارش:%0A${orderDetails}%0A`
    + `💳 روش پرداخت: ${paymentMethodText}%0A`
    + `💰 مبلغ قابل پرداخت: ${total.toLocaleString()}؋%0A%0A`
    + `🙏 *از خرید شما سپاسگزاریم!* 🙏%0A`
    + `✨ سفارش شما به زودی آماده و ارسال خواهد شد.%0A`
    + `📦 هزینه ارسال بر اساس استان محاسبه شده است.%0A%0A`
    + `📞 در صورت نیاز به پشتیبانی با ما تماس بگیرید:%0A`
    + `🔗 golden-touch.af`;
  
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${message}`;
  window.open(whatsappUrl, '_blank');
}

// ========== 10. PAYMENT METHODS TOGGLE ==========
function initPaymentMethodsToggle() {
  const radioButtons = document.querySelectorAll('input[name="paymentMethod"]');
  const bankInfo = document.getElementById("bankInfo");
  const piInfo = document.getElementById("piInfo");
  
  if (radioButtons.length) {
    radioButtons.forEach(radio => {
      radio.addEventListener("change", () => {
        if (bankInfo) bankInfo.style.display = "none";
        if (piInfo) piInfo.style.display = "none";
        
        if (radio.value === "online_bank") {
          if (bankInfo) bankInfo.style.display = "block";
        } else if (radio.value === "online_pi") {
          if (piInfo) piInfo.style.display = "block";
        }
      });
    });
  }
  
  if (window.bankAccount && window.bankAccount.cardImage) {
    const cardImg = document.getElementById("bankCardImage");
    if (cardImg) cardImg.src = window.bankAccount.cardImage;
  }
  
  if (window.piWallet && window.piWallet.address) {
    const qrImg = document.getElementById("piQrCode");
    if (qrImg) {
      qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(window.piWallet.address)}`;
    }
  }
}

// ========== 11. FINALIZE ORDER ==========
function initPayment() {
  const finalizeBtn = document.getElementById("finalizeOrderBtn");
  if (!finalizeBtn) return;
  
  finalizeBtn.addEventListener("click", () => {
    if (cart.length === 0) {
      showNotification("سبد خرید خالی است", "error");
      return;
    }
    
    const customerName = document.getElementById("customerName")?.value.trim();
    const customerLastName = document.getElementById("customerLastName")?.value.trim();
    const customerWhatsapp = document.getElementById("customerWhatsapp")?.value.trim();
    
    if (!customerName || !customerLastName || !customerWhatsapp) {
      showNotification("لطفاً نام، تخلص و شماره واتساپ خود را وارد کنید", "error");
      return;
    }
    
    if (!customerWhatsapp.match(/^93\d{9}$/)) {
      showNotification("شماره واتساپ باید با 93 شروع شود و 11 رقم باشد (مثال: 93712345678)", "error");
      return;
    }
    
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    const { subtotal, discountAmount, total } = calculateTotals();
    
    let orderDetails = ``;
    cart.forEach(item => {
      orderDetails += `▫️ ${item.name}: ${item.quantity} عدد × ${item.price.toLocaleString()}؋ = ${(item.price * item.quantity).toLocaleString()}؋%0A`;
    });
    orderDetails += `%0A🚚 هزینه ارسال: ${currentShipping.toLocaleString()}؋`;
    if (discountAmount > 0) {
      orderDetails += `%0A🎁 تخفیف: -${discountAmount.toLocaleString()}؋`;
    }
    
    let paymentMethodText = "";
    if (paymentMethod === "online_bank") {
      paymentMethodText = "آنلاین (انتقال به عزیزی بانک)";
    } else if (paymentMethod === "online_pi") {
      paymentMethodText = "آنلاین (کیف پول Pi Network)";
    } else {
      paymentMethodText = "حضوری (درب منزل)";
    }
    
    sendWhatsAppMessage(customerName, customerLastName, customerWhatsapp, orderDetails, total, paymentMethodText);
    
    showNotification(`✅ سفارش شما ثبت شد! یک پیام تأیید به واتساپ شما ارسال شد.`, "success");
    
    cart = [];
    saveCart();
    closeCartSidebar();
    
    document.getElementById("customerName").value = "";
    document.getElementById("customerLastName").value = "";
    document.getElementById("customerWhatsapp").value = "";
    document.getElementById("discountCode").value = "";
    discountPercent = 0;
    document.getElementById("discountMessage").innerText = "";
  });
}

// ========== 12. CART SIDEBAR CONTROLS ==========
function initCartSidebar() {
  const overlay = document.getElementById("cartOverlay");
  const sidebar = document.getElementById("cartSidebar");
  const openCartBtn = document.getElementById("cartIcon");
  const closeCartBtn = document.getElementById("closeCart");
  
  window.openCartSidebar = function() {
    if (overlay && sidebar) {
      overlay.classList.add("open");
      sidebar.classList.add("open");
    }
  };
  
  window.closeCartSidebar = function() {
    if (overlay && sidebar) {
      overlay.classList.remove("open");
      sidebar.classList.remove("open");
    }
  };
  
  if (openCartBtn) openCartBtn.addEventListener("click", openCartSidebar);
  if (closeCartBtn) closeCartBtn.addEventListener("click", closeCartSidebar);
  if (overlay) overlay.addEventListener("click", closeCartSidebar);
}

// ========== 13. COPY TEXT FUNCTION ==========
window.copyText = function(text) {
  navigator.clipboard.writeText(text);
  showNotification("کپی شد: " + text, "success");
};

// ========== 14. WHATSAPP NUMBER ==========
function initWhatsApp() {
  const whatsappLink = document.getElementById("whatsappFloat");
  const whatsappNumberElem = document.getElementById("whatsappNumber");
  if (whatsappLink && window.whatsappNumber) {
    whatsappLink.href = `https://wa.me/${window.whatsappNumber.replace(/[^0-9]/g, '')}`;
  }
  if (whatsappNumberElem && window.whatsappNumber) {
    whatsappNumberElem.innerText = window.whatsappNumber;
  }
}

// ========== 15. MAIN INITIALIZATION ==========
function initWebsite(productsData) {
  currentProducts = productsData;
  
  init3DBackground();
  initScrollAnimations();
  renderProducts(productsData);
  initCartSidebar();
  initShippingAndDiscount();
  initPaymentMethodsToggle();
  initPayment();
  initWhatsApp();
  loadCart();
}

window.initWebsite = initWebsite;