// Product Data
const products = [
    {
        id: 1,
        name: "Tomatoes",
        price: 5000,
        category: "vegetables",
        image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400",
        unit: "kg",
        inStock: true
    },
    {
        id: 2,
        name: "Sukuma Wiki",
        price: 2000,
        category: "greens",
        image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w-400",
        unit: "bunch",
        inStock: true
    },
    {
        id: 3,
        name: "Onions",
        price: 4000,
        category: "vegetables",
        image: "https://images.unsplash.com/photo-1587049633312-d628ae50a8ae?w=400",
        unit: "kg",
        inStock: true
    },
    {
        id: 4,
        name: "Carrots",
        price: 3000,
        category: "vegetables",
        image: "https://images.unsplash.com/photo-1598170845058-78131a90f4bf?w=400",
        unit: "kg",
        inStock: true
    },
    {
        id: 5,
        name: "Green Pepper",
        price: 6000,
        category: "vegetables",
        image: "https://images.unsplash.com/photo-1568702846916-0d5c4c5c8c0b?w=400",
        unit: "kg",
        inStock: true
    },
    {
        id: 6,
        name: "Matooke",
        price: 8000,
        category: "bananas",
        image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400",
        unit: "bunch",
        inStock: true
    }
];

// Cart Functions
class Cart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('nimiroCart')) || [];
        this.updateCartCount();
    }

    addItem(productId, quantity = 1) {
        const product = products.find(p => p.id === productId);
        const existingItem = this.items.find(item => item.id === productId);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.items.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                unit: product.unit,
                quantity: quantity
            });
        }

        this.saveCart();
        this.updateCartCount();
        this.showNotification(`${product.name} added to cart!`);
    }

    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.saveCart();
        this.updateCartCount();
    }

    updateQuantity(productId, quantity) {
        const item = this.items.find(item => item.id === productId);
        if (item) {
            if (quantity <= 0) {
                this.removeItem(productId);
            } else {
                item.quantity = quantity;
            }
            this.saveCart();
            this.updateCartCount();
        }
    }

    getTotal() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    clearCart() {
        this.items = [];
        this.saveCart();
        this.updateCartCount();
    }

    saveCart() {
        localStorage.setItem('nimiroCart', JSON.stringify(this.items));
    }

    updateCartCount() {
        const count = this.items.reduce((sum, item) => sum + item.quantity, 0);
        const cartElement = document.getElementById('cart-count');
        if (cartElement) {
            cartElement.textContent = count;
        }
    }

    showNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'fixed top-20 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-transform duration-300';
        notification.textContent = message;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Initialize Cart
const cart = new Cart();

// Display Products
function displayProducts(productsToShow, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = productsToShow.map(product => `
        <div class="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div class="relative">
                <img src="${product.image}" alt="${product.name}" class="w-full h-48 object-cover">
                ${!product.inStock ? '<div class="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-sm">Out of Stock</div>' : ''}
            </div>
            <div class="p-4">
                <h4 class="font-bold text-lg text-gray-800">${product.name}</h4>
                <p class="text-green-600 font-bold text-xl my-2">UGX ${product.price.toLocaleString()}/${product.unit}</p>
                <div class="flex justify-between items-center">
                    <div class="flex items-center space-x-2">
                        <button onclick="decreaseQuantity(${product.id})" class="bg-gray-200 w-8 h-8 rounded-full flex items-center justify-center">
                            <i class="fas fa-minus text-sm"></i>
                        </button>
                        <span id="qty-${product.id}" class="font-medium">1</span>
                        <button onclick="increaseQuantity(${product.id})" class="bg-gray-200 w-8 h-8 rounded-full flex items-center justify-center">
                            <i class="fas fa-plus text-sm"></i>
                        </button>
                    </div>
                    <button onclick="addToCart(${product.id})" 
                            class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition ${!product.inStock ? 'opacity-50 cursor-not-allowed' : ''}"
                            ${!product.inStock ? 'disabled' : ''}>
                        <i class="fas fa-cart-plus mr-2"></i>Add
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Product Quantity Functions
function increaseQuantity(productId) {
    const element = document.getElementById(`qty-${productId}`);
    if (element) {
        const current = parseInt(element.textContent);
        element.textContent = current + 1;
    }
}

function decreaseQuantity(productId) {
    const element = document.getElementById(`qty-${productId}`);
    if (element) {
        const current = parseInt(element.textContent);
        if (current > 1) {
            element.textContent = current - 1;
        }
    }
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product.inStock) {
        alert('This product is out of stock');
        return;
    }
    
    const quantityElement = document.getElementById(`qty-${productId}`);
    const quantity = quantityElement ? parseInt(quantityElement.textContent) : 1;
    
    cart.addItem(productId, quantity);
    
    // Reset quantity display
    if (quantityElement) {
        quantityElement.textContent = '1';
    }
}

// Display featured products on home page
if (document.getElementById('featured-products')) {
    displayProducts(products.slice(0, 4), 'featured-products');
}

// For products.html
if (document.getElementById('all-products')) {
    displayProducts(products, 'all-products');
}

// Format currency function
function formatCurrency(amount) {
    return `UGX ${amount.toLocaleString()}`;
}

// Export cart for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { cart, products };
}
// Add this at the top of app.js (after products array declaration)
// Initialize default products in localStorage if not exists
if (!localStorage.getItem('defaultProducts')) {
    localStorage.setItem('defaultProducts', JSON.stringify(products));
}

// Get products from localStorage (combine default and added)
function getAllProducts() {
    const defaultProducts = JSON.parse(localStorage.getItem('defaultProducts')) || [];
    const addedProducts = JSON.parse(localStorage.getItem('nimiroProducts')) || [];
    return [...defaultProducts, ...addedProducts];
}

// Update the displayProducts function in app.js to use getAllProducts():
function displayProducts(productsToShow = getAllProducts(), containerId) {
    // ... rest of the function remains the same
}