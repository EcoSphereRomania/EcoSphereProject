// Constants and Initial State
const cart = JSON.parse(localStorage.getItem('cart')) || []; // Persistent cart using localStorage
const CART_KEY = 'cart';
const selectors = {
    cartItemCount: document.getElementById('cart-item-count'),
    cartCount: document.getElementById('cart-count'),
    cartTotalPrice: document.getElementById('cart-total-price'),
    cartItemDetails: document.getElementById('cart-item-details'),
    cartPopupItems: document.getElementById('cart-popup-items'),
    cartPopup: document.getElementById('cart-popup'),
    bagButton: document.getElementById('globalnav-menubutton-link-bag'),
    viewCartBtn: document.getElementById('view-cart-btn'),
    clearCartBtn: document.getElementById('clear-cart-btn'),
    paymentDetails: document.getElementById('payment-details'),
    paypalPopup: document.getElementById('paypal-popup'),
    bankPopup: document.getElementById('bank-popup'),
    closeButtons: document.querySelectorAll('.popup-close'),
    paymentRadios: document.querySelectorAll('input[name="payment-method"]'),
    paypalForm: document.querySelector('.paypal-form'),
    submitButton: document.querySelector('.btn'),
    form: document.querySelector('.container'),
    preorderBtn: document.getElementById('preorder-btn') // Selector for preorder button
};

// Utility Functions
const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
};

const saveCart = () => localStorage.setItem(CART_KEY, JSON.stringify(cart));

const closeCartPopup = () => {
    if (!selectors.cartPopup) return;
    selectors.cartPopup.style.opacity = '0';
    setTimeout(() => (selectors.cartPopup.style.display = 'none'), 300);
};

// Update Cart UI
const updateCartUI = () => {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (selectors.cartItemCount) selectors.cartItemCount.textContent = totalItems > 0 ? totalItems : '0';
    if (selectors.cartCount) selectors.cartCount.textContent = totalItems > 0 ? totalItems : '0';
    updateCartTotal();
};

const updateCartTotal = () => {
    const total = cart.reduce((sum, item) => sum + (parseFloat(item.price.replace(' Lei', '') || 0) * item.quantity), 0);
    if (selectors.cartTotalPrice) selectors.cartTotalPrice.textContent = total > 0 ? `${total.toFixed(2)} Lei` : '0 Lei';
};

// Cart Operations
const addToCart = (product) => {
    const existingItem = cart.find(item => item.name === product.name);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    saveCart();
    updateCartUI();
    if (selectors.cartItemDetails) displayCartItems();
    if (selectors.cartPopupItems) displayCartPopupItems();
};

const updateQuantity = (index, delta) => {
    if (index >= 0 && index < cart.length) {
        const item = cart[index];
        item.quantity += delta;
        if (item.quantity <= 0) {
            cart.splice(index, 1);
        }
        saveCart();
        updateCartUI();
        if (selectors.cartItemDetails) displayCartItems();
        if (selectors.cartPopupItems) displayCartPopupItems();
    }
};

const clearCart = () => {
    cart.length = 0;
    saveCart();
    updateCartUI();
    if (selectors.cartItemDetails) displayCartItems();
    if (selectors.cartPopupItems) displayCartPopupItems();
};

// Display Functions
const displayCartItems = () => {
    if (!selectors.cartItemDetails) return;
    selectors.cartItemDetails.innerHTML = '';
    if (cart.length > 0) {
        cart.forEach((item, index) => {
            const div = document.createElement('div');
            div.classList.add('cart-item');
            div.innerHTML = `
                <img src="images/cart_image.png" alt="${item.name}" class="cart-item-img">
                <div class="cart-item-info">
                    <p class="cart-item-name">${item.name}</p>
                    <p class="cart-item-price">${(parseFloat(item.price.replace(' Lei', '')) * item.quantity).toFixed(2)} Lei</p>
                </div>
                <div class="quantity-controls">
                    <button class="quantity-btn decrease" data-index="${index}">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn increase" data-index="${index}">+</button>
                </div>
            `;
            selectors.cartItemDetails.appendChild(div);
        });
        selectors.cartItemDetails.removeEventListener('click', handleQuantityChange);
        selectors.cartItemDetails.addEventListener('click', handleQuantityChange);
    } else {
        selectors.cartItemDetails.innerHTML = '<p class="empty-cart">Coșul este gol.</p>';
    }
};

const displayCartPopupItems = () => {
    if (!selectors.cartPopupItems) return;
    selectors.cartPopupItems.innerHTML = '';
    if (cart.length > 0) {
        cart.forEach((item, index) => {
            const div = document.createElement('div');
            div.classList.add('cart-popup-item');
            div.innerHTML = `
                <img src="images/cart_image.png" alt="${item.name}" class="cart-item-img">
                <div class="cart-popup-item-details">
                    <p class="item-name">${item.name}</p>
                    <p class="item-type">EcoSphere Product</p>
                </div>
                <span class="price">${(parseFloat(item.price.replace(' Lei', '')) * item.quantity).toFixed(2)} Lei</span>
                <div class="quantity-controls">
                    <button class="quantity-btn decrease" data-index="${index}">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn increase" data-index="${index}">+</button>
                </div>
            `;
            selectors.cartPopupItems.appendChild(div);
        });
        selectors.cartPopupItems.removeEventListener('click', handleQuantityChange);
        selectors.cartPopupItems.addEventListener('click', handleQuantityChange);
    } else {
        selectors.cartPopupItems.innerHTML = '<p class="empty-cart">Coșul este gol.</p>';
    }
};

// Handle quantity button clicks
const handleQuantityChange = (e) => {
    if (e.target.classList.contains('quantity-btn')) {
        const index = parseInt(e.target.dataset.index);
        const action = e.target.classList.contains('increase') ? 1 : -1;
        updateQuantity(index, action);
    }
};

// Event Listeners
const toggleCartPopup = () => {
    if (!selectors.cartPopup) return;
    selectors.cartPopup.style.display = selectors.cartPopup.style.display === 'flex' ? 'none' : 'flex';
    if (selectors.cartPopup.style.display === 'flex') {
        selectors.cartPopup.style.opacity = '0';
        requestAnimationFrame(() => {
            selectors.cartPopup.style.transition = 'opacity 0.3s ease';
            selectors.cartPopup.style.opacity = '1';
        });
    } else {
        selectors.cartPopup.style.opacity = '0';
    }
    displayCartPopupItems();
};

if (selectors.bagButton) {
    selectors.bagButton.addEventListener('click', (e) => {
        e.preventDefault();
        toggleCartPopup();
    });
}

if (selectors.viewCartBtn) {
    selectors.viewCartBtn.addEventListener('click', () => {
        // Optional: Uncomment if you want an alert before closing
        // alert('Vizualizare coș simulată! Poți redirecționa către o pagină de coș.');
        closeCartPopup();
    });
}

if (selectors.clearCartBtn) {
    selectors.clearCartBtn.addEventListener('click', () => {
        clearCart();
        closeCartPopup();
    });
}

const cartPopupCloseButton = document.querySelector('#cart-popup .popup-close');
if (cartPopupCloseButton) {
    cartPopupCloseButton.addEventListener('click', () => {
        closeCartPopup();
    });
}

if (selectors.closeButtons) {
    selectors.closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Handle other popups (PayPal, Bank) without affecting cart popup
            if (selectors.paypalPopup) selectors.paypalPopup.style.display = 'none';
            if (selectors.bankPopup) selectors.bankPopup.style.display = 'none';
            if (document.querySelector('input[name="payment-method"][value="card"]')) {
                document.querySelector('input[name="payment-method"][value="card"]').checked = true;
            }
            if (selectors.paymentDetails) selectors.paymentDetails.classList.add('active');
        });
    });
}

if (selectors.paymentRadios) {
    selectors.paymentRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            if (selectors.paymentDetails) selectors.paymentDetails.classList.remove('active');
            if (selectors.paypalPopup) selectors.paypalPopup.style.display = 'none';
            if (selectors.bankPopup) selectors.bankPopup.style.display = 'none';
            if (radio.value === 'card' && selectors.paymentDetails) {
                selectors.paymentDetails.classList.add('active');
            } else if (radio.value === 'paypal' && selectors.paypalPopup) {
                selectors.paypalPopup.style.display = 'flex';
            } else if (radio.value === 'bank' && selectors.bankPopup) {
                selectors.bankPopup.style.display = 'flex';
            }
        });
    });
}

if (selectors.paypalForm) {
    selectors.paypalForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('paypal-email')?.value;
        const password = document.getElementById('paypal-password')?.value;
        if (email && password) {
            alert('Conectare simulată la PayPal. Plata va fi procesată.');
            selectors.paypalPopup.style.opacity = '0';
            setTimeout(() => (selectors.paypalPopup.style.display = 'none'), 300);
        } else {
            alert('Vă rugăm să completați toate câmpurile.');
        }
    });
}

// Preorder Button Event Listener (Silent Redirect)
if (selectors.preorderBtn) {
    selectors.preorderBtn.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent default link behavior
        const product = {
            name: 'Eco Sphere Sera Interioara',
            price: '749.00 Lei'
        };
        addToCart(product); // Silently add to cart
        window.location.href = 'payment.html'; // Immediate redirect
    });
}

// Real-time Input Validation
if (document.getElementById('card-number')) {
    document.getElementById('card-number').addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 16) value = value.slice(0, 16);
        value = value.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
        e.target.value = value;
        validateInput(e.target, /^\d{4}\s\d{4}\s\d{4}\s\d{4}$/, 'card-number-error', 'Introdu un număr de card valid (16 cifre).');
    });
}

if (document.getElementById('expiry-date')) {
    document.getElementById('expiry-date').addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 4) value = value.slice(0, 4);
        if (value.length >= 2) value = value.slice(0, 2) + '/' + value.slice(2);
        e.target.value = value;
        validateInput(e.target, /^[0-1][0-9]\/[0-9]{2}$/, 'expiry-date-error', 'Introdu o dată validă (MM/AA).');
    });
}

if (document.getElementById('cvc')) {
    document.getElementById('cvc').addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 3) value = value.slice(0, 3);
        e.target.value = value;
        validateInput(e.target, /^\d{3}$/, 'cvc-error', 'Introdu un CVC valid (3 cifre).');
    });
}

if (document.getElementById('card-name')) {
    document.getElementById('card-name').addEventListener('input', (e) => {
        let value = e.target.value;
        if (/\d/.test(value)) {
            document.getElementById('card-name-error').style.display = 'block';
            e.target.classList.add('invalid');
        } else {
            document.getElementById('card-name-error').style.display = 'none';
            e.target.classList.remove('invalid');
            value = value.replace(/[^A-Za-z\s]/g, '');
            if (value.length > 50) value = value.slice(0, 50);
            e.target.value = value;
        }
    });
}

// Form Validation and Submission
const validateInput = (input, regex, errorId, errorMessage) => {
    const errorElement = document.getElementById(errorId);
    if (regex.test(input.value)) {
        errorElement.style.display = 'none';
        input.classList.remove('invalid');
    } else {
        errorElement.style.display = 'block';
        input.classList.add('invalid');
    }
};

const validateForm = () => {
    const fields = [
        { id: 'delivery-city', error: 'delivery-city-error', check: v => v !== '' },
        { id: 'delivery-name', error: 'delivery-name-error', check: v => v.length >= 2 },
        { id: 'delivery-phone', error: 'delivery-phone-error', check: v => /^\d{10}$/.test(v.replace(/\D/g, '')) },
        { id: 'delivery-address', error: 'delivery-address-error', check: v => v.length >= 5 },
        { id: 'buyer-name', error: 'buyer-name-error', check: v => v.length >= 2 },
        { id: 'buyer-email', error: 'buyer-email-error', check: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) },
        { id: 'buyer-phone', error: 'buyer-phone-error', check: v => /^\d{10}$/.test(v.replace(/\D/g, '')) },
        { id: 'buyer-city', error: 'buyer-city-error', check: v => v.length >= 2 },
        { id: 'buyer-address', error: 'buyer-address-error', check: v => v.length >= 5 },
        { id: 'buyer-country', error: 'buyer-country-error', check: v => v.length >= 2 },
        { id: 'card-number', error: 'card-number-error', check: v => /^\d{4}\s\d{4}\s\d{4}\s\d{4}$/.test(v.trim()) },
        { id: 'expiry-date', error: 'expiry-date-error', check: v => /^[0-1][0-9]\/[0-9]{2}$/.test(v) },
        { id: 'cvc', error: 'cvc-error', check: v => /^\d{3}$/.test(v) },
        { id: 'card-name', error: 'card-name-error', check: v => v.length >= 2 && /^[A-Za-z\s]+$/.test(v) }
    ];

    let isValid = true;
    fields.forEach(field => {
        const input = document.getElementById(field.id);
        if (!input) return;
        const value = input.value.trim();
        const errorElement = document.getElementById(field.error);
        if (!field.check(value)) {
            errorElement.style.display = 'block';
            if (field.id === 'card-name') input.classList.add('invalid');
            isValid = false;
        } else {
            errorElement.style.display = 'none';
            if (field.id === 'card-name') input.classList.remove('invalid');
        }
    });

    return isValid;
};

if (selectors.form) {
    selectors.form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (validateForm()) {
            selectors.submitButton.classList.add('loading');
            selectors.submitButton.disabled = true;

            setTimeout(() => {
                selectors.submitButton.classList.remove('loading');
                selectors.submitButton.disabled = false;
                alert('Plata a fost procesată cu succes! Veți primi o confirmare pe email.');
                clearCart();
                selectors.form.reset();
                if (selectors.paymentDetails) selectors.paymentDetails.classList.remove('active');
                if (selectors.paypalPopup) selectors.paypalPopup.style.display = 'none';
                if (selectors.bankPopup) selectors.bankPopup.style.display = 'none';
                if (document.querySelector('input[name="payment-method"][value="card"]')) {
                    document.querySelector('input[name="payment-method"][value="card"]').checked = true;
                }
                if (selectors.paymentDetails) selectors.paymentDetails.classList.add('active');
            }, 2000);
        }
    });
}

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    updateCartUI();
    if (selectors.cartItemDetails) displayCartItems();
});