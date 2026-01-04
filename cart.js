// Get cart from localStorage or initialize
const cart = JSON.parse(localStorage.getItem('nimiroCart')) || [];

// Display cart items
function displayCartItems() {
  const cartContainer = document.getElementById('cart-items');
  const emptyCartMsg = document.getElementById('empty-cart-message');
  const checkoutBtn = document.getElementById('checkout-btn');
  
  if (cart.length === 0) {
    if (emptyCartMsg) emptyCartMsg.style.display = 'block';
    if (checkoutBtn) {
      checkoutBtn.disabled = true;
      checkoutBtn.href = '#';
    }
    updateCartSummary();
    return;
  }
  
  if (emptyCartMsg) emptyCartMsg.style.display = 'none';
  if (checkoutBtn) {
    checkoutBtn.disabled = false;
    checkoutBtn.href = 'checkout.html';
  }
  
  cartContainer.innerHTML = cart.map(item => `
        <div class="bg-white rounded-xl shadow-sm p-4 flex items-center">
            <img src="${item.image}" alt="${item.name}" class="w-20 h-20 object-cover rounded-lg">
            <div class="ml-4 flex-1">
                <h4 class="font-bold text-gray-800">${item.name}</h4>
                <p class="text-green-600 font-bold">UGX ${item.price.toLocaleString()}/${item.unit}</p>
                <div class="flex items-center justify-between mt-2">
                    <div class="flex items-center space-x-3">
                        <button onclick="updateQuantity(${item.id}, ${item.quantity - 1})" 
                                class="bg-gray-200 w-8 h-8 rounded-full flex items-center justify-center">
                            <i class="fas fa-minus text-sm"></i>
                        </button>
                        <span class="font-bold text-lg">${item.quantity}</span>
                        <button onclick="updateQuantity(${item.id}, ${item.quantity + 1})" 
                                class="bg-gray-200 w-8 h-8 rounded-full flex items-center justify-center">
                            <i class="fas fa-plus text-sm"></i>
                        </button>
                        <span class="text-gray-500 ml-2">${item.unit}</span>
                    </div>
                    <div class="text-right">
                        <p class="font-bold text-lg">UGX ${(item.price * item.quantity).toLocaleString()}</p>
                        <button onclick="removeItem(${item.id})" 
                                class="text-red-500 hover:text-red-700 text-sm mt-1">
                            <i class="fas fa-trash mr-1"></i>Remove
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
  
  updateCartSummary();
}

// Update quantity
function updateQuantity(productId, newQuantity) {
  const itemIndex = cart.findIndex(item => item.id === productId);
  
  if (itemIndex !== -1) {
    if (newQuantity <= 0) {
      cart.splice(itemIndex, 1);
    } else {
      cart[itemIndex].quantity = newQuantity;
    }
    
    localStorage.setItem('nimiroCart', JSON.stringify(cart));
    displayCartItems();
    updateCartCount();
  }
}

// Remove item
function removeItem(productId) {
  const itemIndex = cart.findIndex(item => item.id === productId);
  
  if (itemIndex !== -1) {
    cart.splice(itemIndex, 1);
    localStorage.setItem('nimiroCart', JSON.stringify(cart));
    displayCartItems();
    updateCartCount();
  }
}

// Update cart summary
function updateCartSummary() {
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = 3000;
  const total = subtotal + deliveryFee;
  
  const subtotalElement = document.getElementById('cart-subtotal');
  const totalElement = document.getElementById('cart-total');
  
  if (subtotalElement) {
    subtotalElement.textContent = `UGX ${subtotal.toLocaleString()}`;
  }
  
  if (totalElement) {
    totalElement.textContent = `UGX ${total.toLocaleString()}`;
  }
}

// Update cart count in header
function updateCartCount() {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartElement = document.getElementById('cart-count');
  if (cartElement) {
    cartElement.textContent = count;
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  displayCartItems();
  updateCartCount();
});