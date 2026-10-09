document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
    setupSearch();
    setupCategoryFilters();
});

let allProducts = [];

async function fetchProducts(category = 'All') {
    try {
        const url = category === 'All' ? '/api/products' : `/api/products?category=${encodeURIComponent(category)}`;
        const response = await fetch(url);
        const data = await response.json();
        
        allProducts = data.products || [];
        renderProducts(allProducts);
    } catch (error) {
        console.error('Error fetching products:', error);
        const container = document.getElementById('productGrid');
        if (container) {
            container.innerHTML = '<p style="color: red; text-align: center; grid-column: 1/-1;">Failed to load products from server.</p>';
        }
    }
}

function renderProducts(products) {
    const container = document.getElementById('productGrid');
    if (!container) return;

    if (!products || products.length === 0) {
        container.innerHTML = '<p style="text-align: center; grid-column: 1/-1; padding: 40px; color: #666;">No products found in this category.</p>';
        return;
    }

    container.innerHTML = products.map(product => `
        <div class="product-card" onclick="viewProduct(${product.id})">
            <div>
                <img src="${product.image}" alt="${product.title}" class="product-thumb" onerror="this.src='https://images.unsplash.com/photo-1523275335684-37898b6baf30'" />
                <h4 class="product-title">${product.title}</h4>
            </div>
            <div>
                <div class="price-tag">₹${product.price}</div>
                <div class="product-category">${product.category}</div>
                <button onclick="event.stopPropagation(); addToCart(${product.id})" class="add-to-cart-btn">Add to Cart</button>
            </div>
        </div>
    `).join('');
}

function setupCategoryFilters() {
    const subNavLinks = document.querySelectorAll('.sub-nav a');
    if (!subNavLinks.length) return;

    subNavLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Highlight active category
            subNavLinks.forEach(l => l.classList.remove('active-category'));
            link.classList.add('active-category');

            const categoryName = link.textContent.trim();
            fetchProducts(categoryName);
        });
    });
}

function viewProduct(productId) {
    window.location.href = `product.html?id=${productId}`;
}

function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');

    if (!searchInput || !searchBtn) return;

    const performSearch = () => {
        const query = searchInput.value.toLowerCase().trim();
        const filtered = allProducts.filter(p => 
            p.title.toLowerCase().includes(query) || 
            (p.category && p.category.toLowerCase().includes(query))
        );
        renderProducts(filtered);
    };

    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') performSearch();
    });
}

function addToCart(productId) {
    alert(`Product ID ${productId} added to your cart!`);
}
async function addToCart(productId) {
    try {
        const response = await fetch(`/api/products/${productId}`);
        const data = await response.json();
        
        if (response.ok && data.product) {
            let cart = JSON.parse(localStorage.getItem('meesho_cart')) || [];
            const existing = cart.find(item => item.id === productId);
            
            if (existing) {
                existing.quantity = (existing.quantity || 1) + 1;
            } else {
                cart.push({ ...data.product, quantity: 1 });
            }
            
            localStorage.setItem('meesho_cart', JSON.stringify(cart));
            alert('Product added to cart successfully!');
        }
    } catch (err) {
        console.error('Error adding to cart:', err);
    }
}
// Add this helper function anywhere in public/js/app.js
function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `✓ ${message}`;
    
    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Update your addToCart function to use showToast:
async function addToCart(productId) {
    try {
        const response = await fetch(`/api/products/${productId}`);
        const data = await response.json();
        
        if (response.ok && data.product) {
            let cart = JSON.parse(localStorage.getItem('meesho_cart')) || [];
            const existing = cart.find(item => item.id === productId);
            
            if (existing) {
                existing.quantity = (existing.quantity || 1) + 1;
            } else {
                cart.push({ ...data.product, quantity: 1 });
            }
            
            localStorage.setItem('meesho_cart', JSON.stringify(cart));
            showToast('Item successfully added to your cart!');
        }
    } catch (err) {
        console.error('Error adding to cart:', err);
        showToast('Failed to add item to cart.', 'error');
    }
}
// Function to update the cart badge count across pages
function updateCartBadge() {
    const cart = JSON.parse(localStorage.getItem('meesho_cart')) || [];
    const totalCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    
    // Find all badge elements (in case multiple pages share the header)
    const badges = document.querySelectorAll('#cartBadge');
    
    badges.forEach(badge => {
        if (totalCount > 0) {
            badge.textContent = totalCount;
            badge.style.display = 'inline-block';
        } else {
            badge.style.display = 'none';
        }
    });
}

// Call updateCartBadge automatically when the DOM loads
document.addEventListener('DOMContentLoaded', () => {
    updateCartBadge();
    // ... your existing code ...
});
localStorage.setItem('meesho_cart', JSON.stringify(cart));
updateCartBadge(); // Refresh the icon count instantly!
showToast('Item successfully added to your cart!');