// Database simulation for Nimiro Garden
class Database {
  constructor() {
    this.products = this.loadProducts();
    this.orders = this.loadOrders();
  }
  
  loadProducts() {
    const defaultProducts = [
      {
        id: 1,
        name: "Tomatoes",
        price: 5000,
        category: "vegetables",
        image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400",
        unit: "kg",
        inStock: true,
        stock: 50
      },
      // ... (same as products.js but with stock field)
    ];
    
    const saved = localStorage.getItem('nimiroProducts');
    return saved ? JSON.parse(saved) : defaultProducts;
  }
  
  loadOrders() {
    const saved = localStorage.getItem('nimiroOrders');
    return saved ? JSON.parse(saved) : [];
  }
  
  saveProducts() {
    localStorage.setItem('nimiroProducts', JSON.stringify(this.products));
  }
  
  saveOrders() {
    localStorage.setItem('nimiroOrders', JSON.stringify(this.orders));
  }
  
  // Product methods
  getProduct(id) {
    return this.products.find(p => p.id === id);
  }
  
  updateStock(productId, quantity) {
    const product = this.getProduct(productId);
    if (product) {
      product.stock -= quantity;
      if (product.stock < 0) product.stock = 0;
      product.inStock = product.stock > 0;
      this.saveProducts();
    }
  }
  
  // Order methods
  createOrder(orderData) {
    const order = {
      ...orderData,
      id: this.generateOrderId(),
      status: 'pending',
      date: new Date().toISOString()
    };
    
    this.orders.push(order);
    this.saveOrders();
    
    // Update stock
    order.items.forEach(item => {
      this.updateStock(item.id, item.quantity);
    });
    
    return order;
  }
  
  generateOrderId() {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `NIM-${timestamp}${random}`;
  }
  
  getOrders(filter = 'all') {
    if (filter === 'all') return this.orders;
    return this.orders.filter(order => order.status === filter);
  }
  
  updateOrderStatus(orderId, status) {
    const order = this.orders.find(o => o.id === orderId);
    if (order) {
      order.status = status;
      this.saveOrders();
      return true;
    }
    return false;
  }
}

// Export for use in other files
const db = new Database();

// If using ES6 modules:
// export { db };
// For now, make it globally available
window.db = db;