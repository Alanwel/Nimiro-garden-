// Admin Dashboard Functionality
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const loginSection = document.getElementById('login-section');
    const dashboardSection = document.getElementById('dashboard-section');
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const ordersTableBody = document.getElementById('orders-table-body');
    const noOrdersMessage = document.getElementById('no-orders');
    const orderFilter = document.getElementById('order-filter');
    const refreshBtn = document.getElementById('refresh-orders');
    
    // Check if already logged in
    if (localStorage.getItem('nimiroAdminLoggedIn') === 'true') {
        showDashboard();
    }
    
    // Login Function
    loginBtn.addEventListener('click', function() {
        const adminId = document.getElementById('admin-id').value;
        const password = document.getElementById('admin-password').value;
        
        // Default credentials (in production, use proper authentication)
        if (adminId === 'admin' && password === 'nimiro123') {
            localStorage.setItem('nimiroAdminLoggedIn', 'true');
            showDashboard();
        } else {
            alert('Invalid credentials. Use: admin / nimiro123');
        }
    });
    
    // Logout Function
    logoutBtn.addEventListener('click', function() {
        localStorage.removeItem('nimiroAdminLoggedIn');
        showLogin();
    });
    
    // Show Dashboard
    function showDashboard() {
        loginSection.classList.add('hidden');
        dashboardSection.classList.remove('hidden');
        loadDashboardData();
    }
    
    // Show Login
    function showLogin() {
        loginSection.classList.remove('hidden');
        dashboardSection.classList.add('hidden');
    }
    
    // Load Dashboard Data
    function loadDashboardData() {
        const orders = JSON.parse(localStorage.getItem('nimiroOrders')) || [];
        const products = JSON.parse(localStorage.getItem('nimiroProducts')) || [];
        
        updateStats(orders);
        displayOrders(orders);
        displayRecentCustomers(orders);
        
        // Set up event listeners
        if (orderFilter) {
            orderFilter.addEventListener('change', function() {
                displayOrders(orders, this.value);
            });
        }
        
        if (refreshBtn) {
            refreshBtn.addEventListener('click', function() {
                loadDashboardData();
            });
        }
        
        // Quick Actions - NOW FUNCTIONAL
        document.getElementById('add-product-btn').addEventListener('click', function() {
            showAddProductModal();
        });
        
        document.getElementById('view-products-btn').addEventListener('click', function() {
            showManageProductsModal();
        });
        
        document.getElementById('export-orders-btn').addEventListener('click', function() {
            exportOrdersToCSV(orders);
        });
        
        // Load product management if modal is already open (e.g., after adding product)
        if (document.getElementById('manage-products-modal') && 
            !document.getElementById('manage-products-modal').classList.contains('hidden')) {
            displayManageProducts();
        }
    }
    
    // Update Dashboard Stats
    function updateStats(orders) {
        const today = new Date().toISOString().split('T')[0];
        
        const totalOrders = orders.length;
        const pendingOrders = orders.filter(order => order.status === 'pending').length;
        const completedOrders = orders.filter(order => order.status === 'delivered').length;
        
        // Calculate today's revenue
        const todayRevenue = orders
            .filter(order => order.date.split('T')[0] === today && order.status !== 'cancelled')
            .reduce((sum, order) => sum + order.total, 0);
        
        // Update UI
        document.getElementById('total-orders').textContent = totalOrders;
        document.getElementById('pending-orders').textContent = pendingOrders;
        document.getElementById('completed-orders').textContent = completedOrders;
        document.getElementById('revenue-today').textContent = `UGX ${todayRevenue.toLocaleString()}`;
    }
    
    // Display Orders
    function displayOrders(orders, filter = 'all') {
        let filteredOrders = [...orders];
        
        // Apply filter
        if (filter !== 'all') {
            filteredOrders = orders.filter(order => order.status === filter);
        }
        
        // Sort by date (newest first)
        filteredOrders.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Update table
        if (filteredOrders.length === 0) {
            ordersTableBody.innerHTML = '';
            noOrdersMessage.classList.remove('hidden');
            return;
        }
        
        noOrdersMessage.classList.add('hidden');
        
        ordersTableBody.innerHTML = filteredOrders.map(order => `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4">
                    <div class="font-medium text-gray-900">${order.id}</div>
                    <div class="text-sm text-gray-500">${formatDate(order.date)}</div>
                </td>
                <td class="px-6 py-4">
                    <div class="font-medium">${order.customer.name}</div>
                    <div class="text-sm text-gray-500">${order.customer.phone}</div>
                </td>
                <td class="px-6 py-4 font-bold">UGX ${order.total.toLocaleString()}</td>
                <td class="px-6 py-4">
                    <span class="px-2 py-1 text-xs rounded-full ${getStatusClass(order.status)}">
                        ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                </td>
                <td class="px-6 py-4">
                    <div class="flex space-x-2">
                        <button onclick="viewOrderDetails('${order.id}')" 
                                class="text-blue-600 hover:text-blue-800" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button onclick="updateOrderStatus('${order.id}', 'confirmed')" 
                                class="text-green-600 hover:text-green-800" title="Confirm Order">
                            <i class="fas fa-check"></i>
                        </button>
                        <button onclick="updateOrderStatus('${order.id}', 'cancelled')" 
                                class="text-red-600 hover:text-red-800" title="Cancel Order">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }
    
    // Display Recent Customers
    function displayRecentCustomers(orders) {
        const container = document.getElementById('recent-customers');
        if (!container) return;
        
        // Get unique customers (by phone)
        const customers = [];
        const seenPhones = new Set();
        
        orders.forEach(order => {
            if (!seenPhones.has(order.customer.phone)) {
                seenPhones.add(order.customer.phone);
                customers.push({
                    name: order.customer.name,
                    phone: order.customer.phone,
                    orderCount: orders.filter(o => o.customer.phone === order.customer.phone).length,
                    lastOrder: order.date
                });
            }
        });
        
        // Sort by last order date
        customers.sort((a, b) => new Date(b.lastOrder) - new Date(a.lastOrder));
        
        // Display top 5
        container.innerHTML = customers.slice(0, 5).map(customer => `
            <div class="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                <div>
                    <div class="font-medium">${customer.name}</div>
                    <div class="text-sm text-gray-500">${customer.phone}</div>
                </div>
                <div class="text-right">
                    <div class="text-sm font-semibold">${customer.orderCount} orders</div>
                    <div class="text-xs text-gray-500">Last: ${formatDate(customer.lastOrder)}</div>
                </div>
            </div>
        `).join('');
    }
    
    // Format date
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    // Get status CSS class
    function getStatusClass(status) {
        const classes = {
            'pending': 'bg-yellow-100 text-yellow-800',
            'confirmed': 'bg-blue-100 text-blue-800',
            'delivered': 'bg-green-100 text-green-800',
            'cancelled': 'bg-red-100 text-red-800'
        };
        return classes[status] || 'bg-gray-100 text-gray-800';
    }
    
    // Export orders to CSV - NOW FUNCTIONAL
    function exportOrdersToCSV(orders) {
        if (orders.length === 0) {
            alert('No orders to export');
            return;
        }
        
        // Create CSV content
        const headers = ['Order ID', 'Customer Name', 'Phone', 'Email', 'Total', 'Status', 'Date', 'Delivery Area', 'Payment Method'];
        const rows = orders.map(order => [
            order.id,
            order.customer.name,
            order.customer.phone,
            order.customer.email || '',
            order.total,
            order.status,
            formatDate(order.date),
            order.delivery.area,
            order.payment === 'cod' ? 'Cash on Delivery' : 'Mobile Money'
        ]);
        
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');
        
        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `nimiro-orders-${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        alert(`✅ Exported ${orders.length} orders to CSV file`);
    }
    
    // Show Add Product Modal - NEW FUNCTIONALITY
    function showAddProductModal() {
        // Create modal if it doesn't exist
        if (!document.getElementById('add-product-modal')) {
            const modalHTML = `
                <div id="add-product-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div class="bg-white rounded-xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div class="flex justify-between items-center mb-6">
                            <h3 class="text-xl font-bold text-gray-800">Add New Product</h3>
                            <button onclick="closeAddProductModal()" class="text-gray-500 hover:text-gray-700">
                                <i class="fas fa-times text-2xl"></i>
                            </button>
                        </div>
                        
                        <form id="add-product-form">
                            <div class="space-y-4">
                                <div>
                                    <label class="block text-gray-700 mb-2">Product Name *</label>
                                    <input type="text" id="product-name" required
                                           class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500">
                                </div>
                                
                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-gray-700 mb-2">Price (UGX) *</label>
                                        <input type="number" id="product-price" required min="100" step="100"
                                               class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500">
                                    </div>
                                    <div>
                                        <label class="block text-gray-700 mb-2">Category *</label>
                                        <select id="product-category" required
                                                class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500">
                                            <option value="">Select Category</option>
                                            <option value="vegetables">Vegetables</option>
                                            <option value="greens">Greens</option>
                                            <option value="bananas">Bananas</option>
                                            <option value="fruits">Fruits</option>
                                            <option value="herbs">Herbs</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-gray-700 mb-2">Unit *</label>
                                        <select id="product-unit" required
                                                class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500">
                                            <option value="kg">Kilogram (kg)</option>
                                            <option value="bunch">Bunch</option>
                                            <option value="piece">Piece</option>
                                            <option value="head">Head</option>
                                            <option value="bag">Bag</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label class="block text-gray-700 mb-2">Initial Stock</label>
                                        <input type="number" id="product-stock" min="0" value="10"
                                               class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500">
                                    </div>
                                </div>
                                
                                <div>
                                    <label class="block text-gray-700 mb-2">Image URL</label>
                                    <input type="url" id="product-image"
                                           class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                           placeholder="https://example.com/image.jpg">
                                    <p class="text-sm text-gray-500 mt-1">Leave empty for default vegetable image</p>
                                </div>
                                
                                <div>
                                    <label class="block text-gray-700 mb-2">Description</label>
                                    <textarea id="product-description" rows="3"
                                              class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"></textarea>
                                </div>
                            </div>
                            
                            <div class="flex justify-end space-x-3 mt-6">
                                <button type="button" onclick="closeAddProductModal()"
                                        class="px-4 py-2 border rounded-lg hover:bg-gray-50">
                                    Cancel
                                </button>
                                <button type="submit"
                                        class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                                    Add Product
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            
            // Add form submission handler
            document.getElementById('add-product-form').addEventListener('submit', function(e) {
                e.preventDefault();
                addNewProduct();
            });
        }
        
        // Show modal
        document.getElementById('add-product-modal').classList.remove('hidden');
    }
    
    // Add New Product Function - NEW
    function addNewProduct() {
        const products = JSON.parse(localStorage.getItem('nimiroProducts')) || [];
        const defaultProducts = JSON.parse(localStorage.getItem('defaultProducts')) || [];
        
        // Find the next available ID
        const allProducts = [...products, ...defaultProducts];
        const nextId = allProducts.length > 0 ? Math.max(...allProducts.map(p => p.id)) + 1 : 1;
        
        // Get form values
        const newProduct = {
            id: nextId,
            name: document.getElementById('product-name').value,
            price: parseInt(document.getElementById('product-price').value),
            category: document.getElementById('product-category').value,
            unit: document.getElementById('product-unit').value,
            stock: parseInt(document.getElementById('product-stock').value) || 10,
            inStock: true,
            image: document.getElementById('product-image').value || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400',
            description: document.getElementById('product-description').value || `${document.getElementById('product-name').value}, fresh from the farm`
        };
        
        // Add to products array
        products.push(newProduct);
        
        // Save to localStorage
        localStorage.setItem('nimiroProducts', JSON.stringify(products));
        
        // Close modal
        closeAddProductModal();
        
        // Refresh products in manage modal if open
        if (document.getElementById('manage-products-modal') && 
            !document.getElementById('manage-products-modal').classList.contains('hidden')) {
            displayManageProducts();
        }
        
        // Show success message
        alert(`✅ Product "${newProduct.name}" added successfully!`);
        
        // Reset form
        document.getElementById('add-product-form').reset();
    }
    
    // Show Manage Products Modal - NEW FUNCTIONALITY
    function showManageProductsModal() {
        // Create modal if it doesn't exist
        if (!document.getElementById('manage-products-modal')) {
            const modalHTML = `
                <div id="manage-products-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div class="bg-white rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div class="flex justify-between items-center mb-6">
                            <h3 class="text-xl font-bold text-gray-800">Manage Products</h3>
                            <div class="flex space-x-2">
                                <button onclick="refreshProducts()" class="text-gray-500 hover:text-gray-700">
                                    <i class="fas fa-sync-alt"></i>
                                </button>
                                <button onclick="closeManageProductsModal()" class="text-gray-500 hover:text-gray-700">
                                    <i class="fas fa-times text-2xl"></i>
                                </button>
                            </div>
                        </div>
                        
                        <div class="mb-4 flex justify-between items-center">
                            <div>
                                <input type="text" id="product-search" placeholder="Search products..." 
                                       class="border rounded-lg px-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-green-500">
                            </div>
                            <button onclick="showAddProductModal()" 
                                    class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                                <i class="fas fa-plus mr-2"></i>Add New
                            </button>
                        </div>
                        
                        <div class="overflow-x-auto">
                            <table class="w-full">
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="products-table-body" class="divide-y divide-gray-200">
                                    <!-- Products will be loaded here -->
                                </tbody>
                            </table>
                        </div>
                        
                        <div id="no-products-message" class="text-center py-12 hidden">
                            <i class="fas fa-box-open text-4xl text-gray-300 mb-4"></i>
                            <p class="text-gray-500">No products found</p>
                        </div>
                        
                        <div class="mt-6 flex justify-end">
                            <button onclick="closeManageProductsModal()"
                                    class="px-4 py-2 border rounded-lg hover:bg-gray-50">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            
            // Add search functionality
            document.getElementById('product-search').addEventListener('input', function(e) {
                displayManageProducts(e.target.value);
            });
        }
        
        // Show modal and load products
        document.getElementById('manage-products-modal').classList.remove('hidden');
        displayManageProducts();
    }
    
    // Display Manage Products - NEW
    function displayManageProducts(searchTerm = '') {
        const container = document.getElementById('products-table-body');
        const noProductsMsg = document.getElementById('no-products-message');
        
        if (!container) return;
        
        // Get products from both default and added products
        const defaultProducts = JSON.parse(localStorage.getItem('defaultProducts')) || [];
        const addedProducts = JSON.parse(localStorage.getItem('nimiroProducts')) || [];
        const allProducts = [...defaultProducts, ...addedProducts];
        
        // Filter by search term if provided
        let filteredProducts = allProducts;
        if (searchTerm.trim() !== '') {
            const term = searchTerm.toLowerCase();
            filteredProducts = allProducts.filter(product => 
                product.name.toLowerCase().includes(term) ||
                product.category.toLowerCase().includes(term) ||
                product.description.toLowerCase().includes(term)
            );
        }
        
        if (filteredProducts.length === 0) {
            container.innerHTML = '';
            noProductsMsg.classList.remove('hidden');
            return;
        }
        
        noProductsMsg.classList.add('hidden');
        
        container.innerHTML = filteredProducts.map(product => `
            <tr class="hover:bg-gray-50">
                <td class="px-4 py-3">
                    <div class="flex items-center">
                        <img src="${product.image}" alt="${product.name}" class="w-10 h-10 object-cover rounded mr-3">
                        <div>
                            <div class="font-medium">${product.name}</div>
                            <div class="text-sm text-gray-500">${product.unit}</div>
                        </div>
                    </div>
                </td>
                <td class="px-4 py-3">
                    <span class="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                        ${product.category}
                    </span>
                </td>
                <td class="px-4 py-3 font-bold">UGX ${product.price.toLocaleString()}</td>
                <td class="px-4 py-3">
                    <div class="flex items-center">
                        <input type="number" id="stock-${product.id}" value="${product.stock || 0}" min="0"
                               class="w-20 border rounded px-2 py-1 mr-2" onchange="updateStock(${product.id}, this.value)">
                        <span class="text-sm text-gray-500">${product.unit}</span>
                    </div>
                </td>
                <td class="px-4 py-3">
                    <span class="px-2 py-1 text-xs rounded-full ${product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                        ${product.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                </td>
                <td class="px-4 py-3">
                    <div class="flex space-x-2">
                        <button onclick="editProduct(${product.id})" 
                                class="text-blue-600 hover:text-blue-800" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="deleteProduct(${product.id})" 
                                class="text-red-600 hover:text-red-800" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }
});

// Global functions accessible from HTML onclick attributes

function closeAddProductModal() {
    const modal = document.getElementById('add-product-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

function closeManageProductsModal() {
    const modal = document.getElementById('manage-products-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

function refreshProducts() {
    if (typeof displayManageProducts === 'function') {
        displayManageProducts();
    }
}

function updateStock(productId, newStock) {
    const stock = parseInt(newStock);
    if (isNaN(stock) || stock < 0) return;
    
    // Try added products first
    let addedProducts = JSON.parse(localStorage.getItem('nimiroProducts')) || [];
    let productIndex = addedProducts.findIndex(p => p.id === productId);
    
    if (productIndex !== -1) {
        addedProducts[productIndex].stock = stock;
        addedProducts[productIndex].inStock = stock > 0;
        localStorage.setItem('nimiroProducts', JSON.stringify(addedProducts));
    } else {
        // Try default products
        let defaultProducts = JSON.parse(localStorage.getItem('defaultProducts')) || [];
        productIndex = defaultProducts.findIndex(p => p.id === productId);
        
        if (productIndex !== -1) {
            defaultProducts[productIndex].stock = stock;
            defaultProducts[productIndex].inStock = stock > 0;
            localStorage.setItem('defaultProducts', JSON.stringify(defaultProducts));
        }
    }
    
    // Refresh display
    if (typeof displayManageProducts === 'function') {
        displayManageProducts();
    }
}

function editProduct(productId) {
    // Get product data
    let addedProducts = JSON.parse(localStorage.getItem('nimiroProducts')) || [];
    let defaultProducts = JSON.parse(localStorage.getItem('defaultProducts')) || [];
    let allProducts = [...addedProducts, ...defaultProducts];
    let product = allProducts.find(p => p.id === productId);
    
    if (!product) {
        alert('Product not found');
        return;
    }
    
    // Show edit modal
    const editModalHTML = `
        <div id="edit-product-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-xl font-bold text-gray-800">Edit Product</h3>
                    <button onclick="closeEditProductModal()" class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times text-2xl"></i>
                    </button>
                </div>
                
                <form id="edit-product-form">
                    <div class="space-y-4">
                        <div>
                            <label class="block text-gray-700 mb-2">Product Name</label>
                            <input type="text" id="edit-product-name" value="${product.name}" required
                                   class="w-full border border-gray-300 rounded-lg px-4 py-2">
                        </div>
                        
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-gray-700 mb-2">Price (UGX)</label>
                                <input type="number" id="edit-product-price" value="${product.price}" required min="100"
                                       class="w-full border border-gray-300 rounded-lg px-4 py-2">
                            </div>
                            <div>
                                <label class="block text-gray-700 mb-2">Category</label>
                                <select id="edit-product-category" class="w-full border border-gray-300 rounded-lg px-4 py-2">
                                    <option value="vegetables" ${product.category === 'vegetables' ? 'selected' : ''}>Vegetables</option>
                                    <option value="greens" ${product.category === 'greens' ? 'selected' : ''}>Greens</option>
                                    <option value="bananas" ${product.category === 'bananas' ? 'selected' : ''}>Bananas</option>
                                    <option value="fruits" ${product.category === 'fruits' ? 'selected' : ''}>Fruits</option>
                                    <option value="herbs" ${product.category === 'herbs' ? 'selected' : ''}>Herbs</option>
                                    <option value="other" ${product.category === 'other' ? 'selected' : ''}>Other</option>
                                </select>
                            </div>
                        </div>
                        
                        <div>
                            <label class="block text-gray-700 mb-2">Description</label>
                            <textarea id="edit-product-description" rows="3"
                                      class="w-full border border-gray-300 rounded-lg px-4 py-2">${product.description || ''}</textarea>
                        </div>
                    </div>
                    
                    <div class="flex justify-end space-x-3 mt-6">
                        <button type="button" onclick="closeEditProductModal()"
                                class="px-4 py-2 border rounded-lg hover:bg-gray-50">
                            Cancel
                        </button>
                        <button type="submit"
                                class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('edit-product-modal');
    if (existingModal) existingModal.remove();
    
    document.body.insertAdjacentHTML('beforeend', editModalHTML);
    
    // Handle form submission
    document.getElementById('edit-product-form').addEventListener('submit', function(e) {
        e.preventDefault();
        saveProductEdit(productId);
    });
}

function closeEditProductModal() {
    const modal = document.getElementById('edit-product-modal');
    if (modal) modal.remove();
}

function saveProductEdit(productId) {
    const name = document.getElementById('edit-product-name').value;
    const price = parseInt(document.getElementById('edit-product-price').value);
    const category = document.getElementById('edit-product-category').value;
    const description = document.getElementById('edit-product-description').value;
    
    // Update in added products first
    let addedProducts = JSON.parse(localStorage.getItem('nimiroProducts')) || [];
    let productIndex = addedProducts.findIndex(p => p.id === productId);
    
    if (productIndex !== -1) {
        addedProducts[productIndex].name = name;
        addedProducts[productIndex].price = price;
        addedProducts[productIndex].category = category;
        addedProducts[productIndex].description = description;
        localStorage.setItem('nimiroProducts', JSON.stringify(addedProducts));
    } else {
        // Update in default products
        let defaultProducts = JSON.parse(localStorage.getItem('defaultProducts')) || [];
        productIndex = defaultProducts.findIndex(p => p.id === productId);
        
        if (productIndex !== -1) {
            defaultProducts[productIndex].name = name;
            defaultProducts[productIndex].price = price;
            defaultProducts[productIndex].category = category;
            defaultProducts[productIndex].description = description;
            localStorage.setItem('defaultProducts', JSON.stringify(defaultProducts));
        }
    }
    
    // Close modal
    closeEditProductModal();
    
    // Refresh products display
    if (typeof displayManageProducts === 'function') {
        displayManageProducts();
    }
    
    alert('✅ Product updated successfully!');
}

function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
        return;
    }
    
    // Try to remove from added products first
    let addedProducts = JSON.parse(localStorage.getItem('nimiroProducts')) || [];
    const newAddedProducts = addedProducts.filter(p => p.id !== productId);
    
    if (newAddedProducts.length !== addedProducts.length) {
        localStorage.setItem('nimiroProducts', JSON.stringify(newAddedProducts));
    } else {
        // If not in added products, it might be in default products
        // For default products, we just set stock to 0 instead of deleting
        let defaultProducts = JSON.parse(localStorage.getItem('defaultProducts')) || [];
        const productIndex = defaultProducts.findIndex(p => p.id === productId);
        
        if (productIndex !== -1) {
            defaultProducts[productIndex].stock = 0;
            defaultProducts[productIndex].inStock = false;
            localStorage.setItem('defaultProducts', JSON.stringify(defaultProducts));
        }
    }
    
    // Refresh display
    if (typeof displayManageProducts === 'function') {
        displayManageProducts();
    }
    
    alert('Product removed/disabled successfully!');
}

// View order details, update order status functions remain the same as before
function viewOrderDetails(orderId) {
    // ... (same as before)
}

function closeOrderDetails() {
    // ... (same as before)
}

function updateOrderStatus(orderId, newStatus) {
    // ... (same as before)
}