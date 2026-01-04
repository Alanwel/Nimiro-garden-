// Checkout functionality
document.addEventListener('DOMContentLoaded', function() {
  // Get cart from localStorage
  const cart = JSON.parse(localStorage.getItem('nimiroCart')) || [];
  const orderItemsContainer = document.getElementById('order-items');
  const placeOrderBtn = document.getElementById('place-order-btn');
  
  // If cart is empty, redirect to products page
  if (cart.length === 0) {
    window.location.href = 'products.html';
    return;
  }
  
  // Display order items
  function displayOrderItems() {
    if (cart.length === 0) {
      orderItemsContainer.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-shopping-cart text-4xl mb-4"></i>
                    <p>Your cart is empty</p>
                </div>
            `;
      return;
    }
    
    orderItemsContainer.innerHTML = cart.map(item => `
            <div class="flex items-center justify-between py-3 border-b">
                <div class="flex items-center">
                    <img src="${item.image}" alt="${item.name}" class="w-12 h-12 object-cover rounded">
                    <div class="ml-3">
                        <div class="font-medium">${item.name}</div>
                        <div class="text-sm text-gray-500">${item.quantity} ${item.unit}</div>
                    </div>
                </div>
                <div class="font-semibold">UGX ${(item.price * item.quantity).toLocaleString()}</div>
            </div>
        `).join('');
    
    updateOrderSummary();
  }
  
  // Update order summary
  function updateOrderSummary() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Calculate delivery fee based on area
    const areaSelect = document.getElementById('delivery-area');
    let deliveryFee = 3000; // default
    
    if (areaSelect && areaSelect.value) {
      const areaFees = {
        'kampala-central': 3000,
        'kololo': 3500,
        'nakawa': 3000,
        'makindye': 3500,
        'kawempe': 4000,
        'rubaga': 4000
      };
      deliveryFee = areaFees[areaSelect.value] || 3000;
    }
    
    const total = subtotal + deliveryFee;
    
    document.getElementById('order-subtotal').textContent = `UGX ${subtotal.toLocaleString()}`;
    document.getElementById('order-delivery').textContent = `UGX ${deliveryFee.toLocaleString()}`;
    document.getElementById('order-total').textContent = `UGX ${total.toLocaleString()}`;
    
    // Update delivery fee when area changes
    if (areaSelect) {
      areaSelect.addEventListener('change', updateOrderSummary);
    }
  }
  
  // Payment method toggle
  const paymentMethods = document.querySelectorAll('input[name="payment-method"]');
  const mobileMoneyDetails = document.getElementById('mobile-money-details');
  
  paymentMethods.forEach(method => {
    method.addEventListener('change', function() {
      if (this.value === 'mobile-money') {
        mobileMoneyDetails.classList.remove('hidden');
      } else {
        mobileMoneyDetails.classList.add('hidden');
      }
    });
  });
  
  // Generate order ID
  function generateOrderId() {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `NIM-${timestamp}${random}`;
  }
  
  // Place order
  placeOrderBtn.addEventListener('click', function() {
    // Validate form
    const form = document.getElementById('checkout-form');
    if (!form.checkValidity()) {
      alert('Please fill in all required fields');
      return;
    }
    
    const deliveryArea = document.getElementById('delivery-area').value;
    const deliveryAddress = document.getElementById('delivery-address').value;
    
    if (!deliveryArea || !deliveryAddress.trim()) {
      alert('Please provide delivery area and address');
      return;
    }
    
    // Collect order data
    const orderData = {
      id: generateOrderId(),
      customer: {
        name: document.getElementById('customer-name').value,
        phone: document.getElementById('customer-phone').value,
        email: document.getElementById('customer-email').value || ''
      },
      delivery: {
        area: deliveryArea,
        address: deliveryAddress,
        date: document.getElementById('delivery-date').value,
        instructions: document.getElementById('special-instructions').value || ''
      },
      payment: document.querySelector('input[name="payment-method"]:checked').value,
      items: [...cart],
      subtotal: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      deliveryFee: parseInt(document.getElementById('order-delivery').textContent.replace(/[^\d]/g, '')),
      total: parseInt(document.getElementById('order-total').textContent.replace(/[^\d]/g, '')),
      status: 'pending',
      date: new Date().toISOString()
    };
    
    // Save order to database (localStorage for now)
    saveOrder(orderData);
    
    // Clear cart
    localStorage.removeItem('nimiroCart');
    
    // Show success modal
    document.getElementById('order-id').textContent = orderData.id;
    document.getElementById('success-modal').classList.remove('hidden');
    
    // Update cart count
    updateCartCount();
  });
  
  // Save order to database
  function saveOrder(order) {
    // Get existing orders
    const orders = JSON.parse(localStorage.getItem('nimiroOrders')) || [];
    
    // Add new order
    orders.push(order);
    
    // Save back to localStorage
    localStorage.setItem('nimiroOrders', JSON.stringify(orders));
    
    // Log to console (in real app, send to server)
    console.log('Order saved:', order);
    
    // In production: Send to backend API
    // fetch('/api/orders', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(order)
    // });
  }
  
  // Update cart count in header
  function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartElement = document.getElementById('cart-count');
    if (cartElement) {
      cartElement.textContent = count;
    }
  }
  
  // Initialize
  displayOrderItems();
  updateCartCount();
});