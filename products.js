// Extended Product Data
const products = [
    {
        id: 1,
        name: "Tomatoes",
        price: 5000,
        category: "vegetables",
        image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400",
        unit: "kg",
        inStock: true,
        description: "Fresh red tomatoes, perfect for stews and salads"
    },
    {
        id: 2,
        name: "Sukuma Wiki",
        price: 2000,
        category: "greens",
        image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400",
        unit: "bunch",
        inStock: true,
        description: "Fresh kale, rich in vitamins and minerals"
    },
    {
        id: 3,
        name: "Onions",
        price: 4000,
        category: "vegetables",
        image: "https://images.unsplash.com/photo-1587049633312-d628ae50a8ae?w=400",
        unit: "kg",
        inStock: true,
        description: "Local onions, great for cooking"
    },
    {
        id: 4,
        name: "Carrots",
        price: 3000,
        category: "vegetables",
        image: "https://images.unsplash.com/photo-1598170845058-78131a90f4bf?w=400",
        unit: "kg",
        inStock: true,
        description: "Sweet and crunchy carrots"
    },
    {
        id: 5,
        name: "Green Pepper",
        price: 6000,
        category: "vegetables",
        image: "https://images.unsplash.com/photo-1568702846916-0d5c4c5c8c0b?w=400",
        unit: "kg",
        inStock: true,
        description: "Fresh green peppers for cooking"
    },
    {
        id: 6,
        name: "Matooke",
        price: 8000,
        category: "bananas",
        image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400",
        unit: "bunch",
        inStock: true,
        description: "Traditional cooking bananas"
    },
    {
        id: 7,
        name: "Avocado",
        price: 1500,
        category: "fruits",
        image: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400",
        unit: "piece",
        inStock: true,
        description: "Fresh Hass avocados"
    },
    {
        id: 8,
        name: "Cabbage",
        price: 3500,
        category: "vegetables",
        image: "https://images.unsplash.com/photo-1582284546700-f5f6d32a7b37?w=400",
        unit: "head",
        inStock: true,
        description: "Fresh green cabbage"
    },
    {
        id: 9,
        name: "Mint Leaves",
        price: 1000,
        category: "herbs",
        image: "https://images.unsplash.com/photo-1583250160481-79c3b75c06a3?w=400",
        unit: "bunch",
        inStock: true,
        description: "Fresh mint leaves for tea and cooking"
    },
    {
        id: 10,
        name: "Coriander",
        price: 1500,
        category: "herbs",
        image: "https://images.unsplash.com/photo-1596040033221-a988e4a7e6b8?w=400",
        unit: "bunch",
        inStock: true,
        description: "Fresh coriander/dhania"
    },
    {
        id: 11,
        name: "Potatoes",
        price: 3500,
        category: "vegetables",
        image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400",
        unit: "kg",
        inStock: true,
        description: "Irish potatoes, perfect for roasting"
    },
    {
        id: 12,
        name: "Eggplant",
        price: 2500,
        category: "vegetables",
        image: "https://images.unsplash.com/photo-1598974357801-cbca100e5d10?w=400",
        unit: "kg",
        inStock: true,
        description: "Fresh purple eggplants"
    },
    {
        id: 10,
        name: "yellow watermelon",
        price: 1000,
        category: "fruit s",
        image: "https://m.media-amazon.com/images/I/51dzS0eyCIL._AC_US1000_.jpg",
        unit: "bunch",
        inStock: true,
        description: "Fresh watermelon 🍉 nice for juice making "
    },
];

// Get cart from localStorage
let cart = JSON.parse(localStorage.getItem('nimiroCart')) || [];

// Display all products
function displayProducts(filteredProducts = products) {
    const container = document.querySelector('.grid.grid-cols-1');
    const noProductsMsg = document.getElementById('no-products');
    
    if (!container) return;
    
    if (filteredProducts.length === 0) {
        container.innerHTML = '';
        if (noProductsMsg) noProductsMsg.classList.remove('hidden');
        return;
    }
    
    if (noProductsMsg) noProductsMsg.classList.add('hidden');
    
    container.innerHTML = filteredProducts.map(product => `
        <div class="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div class="relative">
                <img src="${product.image}" alt="${product.name}" class="w-full h-48 object-cover">
                ${!product.inStock ? 
                    '<div class="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-sm">Out of Stock</div>' : 
                    '<div class="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-sm">In Stock</div>'
                }
            </div>
            <div class="p-4">
                <div class="flex justify-between items-start mb-2">
                    <h4 class="font-bold text-lg text-gray-800">${product.name}</h4>
                    <span class="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded">${product.category}</span>
                </div>
                <p class="text-gray-600 text-sm mb-3">${product.description}</p>
                <p class="text-green-600 font-bold text-xl mb-4">UGX ${product.price.toLocaleString()}/${product.unit}</p>
                <div class="flex justify-between items-center">
                    <div class="flex items-center space-x-2">
                        <button onclick="decreaseQuantity(${product.id})" 
                                class="bg-gray-200 w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-300">
                            <i class="fas fa-minus text-sm"></i>
                        </button>
                        <span id="qty-${product.id}" class="font-medium text-lg w-8 text-center">1</span>
                        <button onclick="increaseQuantity(${product.id})" 
                                class="bg-gray-200 w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-300">
                            <i class="fas fa-plus text-sm"></i>
                        </button>
                    </div>
                    <button onclick="addToCart(${product.id})" 
                            class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center ${!product.inStock ? 'opacity-50 cursor-not-allowed' : ''}"
                            ${!product.inStock ? 'disabled' : ''}>
                        <i class="fas fa-cart-plus mr-2"></i>Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Quantity functions
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

// Add to cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product.inStock) {
        showNotification(`${product.name} is out of stock`, 'error');
        return;
    }
    
    const quantityElement = document.getElementById(`qty-${productId}`);
    const quantity = quantityElement ? parseInt(quantityElement.textContent) : 1;
    
    // Check if item already in cart
    const existingItemIndex = cart.findIndex(item => item.id === productId);
    
    if (existingItemIndex !== -1) {
        cart[existingItemIndex].quantity += quantity;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            unit: product.unit,
            quantity: quantity
        });
    }
    
    localStorage.setItem('nimiroCart', JSON.stringify(cart));
    updateCartCount();
    showNotification(`${quantity} ${product.unit} of ${product.name} added to cart!`, 'success');
    
    // Reset quantity display
    if (quantityElement) {
        quantityElement.textContent = '1';
    }
}

// Add bundle to cart
function addBundleToCart(bundleId) {
    const bundles = {
        1: [
            { id: 1, quantity: 1 }, // Tomatoes
            { id: 3, quantity: 1 }, // Onions
            { id: 2, quantity: 2 }, // Sukuma Wiki
            { id: 5, quantity: 1 }  // Green Pepper
        ],
        2: [
            { id: 4, quantity: 1 }, // Carrots
            { id: 9, quantity: 1 }, // Mint
            { id: 12, quantity: 1 }, // Ginger (not in products, using eggplant as placeholder)
            { id: 7, quantity: 4 }  // Avocados (as lemons placeholder)
        ]
    };
    
    const bundle = bundles[bundleId];
    let addedItems = [];
    
    bundle.forEach(item => {
        const product = products.find(p => p.id === item.id);
        if (product && product.inStock) {
            // Add to cart
            const existingItemIndex = cart.findIndex(cartItem => cartItem.id === item.id);
            
            if (existingItemIndex !== -1) {
                cart[existingItemIndex].quantity += item.quantity;
            } else {
                cart.push({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.image,
                    unit: product.unit,
                    quantity: item.quantity
                });
            }
            addedItems.push(`${item.quantity}${product.unit} ${product.name}`);
        }
    });
    
    localStorage.setItem('nimiroCart', JSON.stringify(cart));
    updateCartCount();
    
    if (addedItems.length > 0) {
        showNotification(`Bundle added to cart! Includes: ${addedItems.join(', ')}`, 'success');
    } else {
        showNotification('Some items in the bundle are out of stock', 'warning');
    }
}

// Filter products by category
function filterProductsByCategory(category) {
    if (category === 'all') {
        displayProducts(products);
    } else {
        const filtered = products.filter(product => product.category === category);
        displayProducts(filtered);
    }
}

// Sort products
function sortProducts(sortBy) {
    let sortedProducts = [...products];
    
    switch (sortBy) {
        case 'price-low':
            sortedProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            sortedProducts.sort((a, b) => b.price - a.price);
            break;
        case 'name':
            sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;
        default:
            break;
    }
    
    displayProducts(sortedProducts);
}

// Show notification
function showNotification(message, type = 'success') {
    const colors = {
        success: 'bg-green-600',
        error: 'bg-red-600',
        warning: 'bg-yellow-500'
    };
    
    const notification = document.createElement('div');
    notification.className = `fixed top-20 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-transform duration-300`;
    notification.textContent = message;
    notification.style.animation = 'slideIn 0.3s ease-out';
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Update cart count
function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartElement = document.getElementById('cart-count');
    if (cartElement) {
        cartElement.textContent = count;
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    displayProducts();
    updateCartCount();
    
    // Category filter event
    const categoryFilter = document.getElementById('category-filter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', (e) => {
            filterProductsByCategory(e.target.value);
        });
    }
    
    // Sort options event
    const sortOptions = document.getElementById('sort-options');
    if (sortOptions) {
        sortOptions.addEventListener('change', (e) => {
            sortProducts(e.target.value);
        });
    }
});
