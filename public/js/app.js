document.addEventListener("DOMContentLoaded", () => {
    // Mock Product Data to load catalog dynamically
    const mockProducts = [
        { id: 1, title: "Kanjivaram Art Silk Zari Woven Saree", price: 349, mrp: 1199, rating: 4.3, image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400" },
        { id: 2, title: "Pure Breathable Cotton Straight Kurta", price: 289, mrp: 899, rating: 4.1, image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400" },
        { id: 3, title: "BassPro Wireless Stereo Neckband (30H)", price: 499, mrp: 1999, rating: 4.5, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400" },
        { id: 4, title: "Glance Pure Cotton Double Bedsheet", price: 429, mrp: 1499, rating: 4.2, image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400" }
    ];

    const productGrid = document.getElementById("productGrid");
    
    // Render Products on Homepage
    if (productGrid) {
        productGrid.innerHTML = mockProducts.map(product => `
            <div class="product-card" onclick="window.location.href='product.html?id=${product.id}'">
                <img src="${product.image}" alt="${product.title}" class="product-thumb">
                <p class="product-title">${product.title}</p>
                <div class="price-tag">₹${product.price} <span style="font-size:11px; color:gray; text-decoration:line-through;">₹${product.mrp}</span></div>
                <span style="font-size:11px; background:#e8f5e9; color:#2e7d32; padding:2px 4px; border-radius:2px;">Free Delivery</span>
            </div>
        `).join('');
    }

    // Cart Actions & Checkout Simulation
    const checkoutBtn = document.getElementById("checkoutBtn");
    if (checkoutBtn) {
        checkoutBtn.addEventListener("click", () => {
            alert("🔒 Concurrency Lock Verified! Order placed successfully via Bharat Secure Gateway.");
            window.location.href = "index.html";
        });
    }

    // Dynamic Countdown Timer for Flash Sale Simulation
    let timeLeft = 172; // seconds
    const timerElement = document.getElementById("countdownTimer") || document.getElementById("cartTimer");
    
    if (timerElement) {
        setInterval(() => {
            if (timeLeft > 0) {
                timeLeft--;
                let mins = Math.floor(timeLeft / 60);
                let secs = timeLeft % 60;
                timerElement.innerText = `0${mins}:${secs < 10 ? '0' : ''}${secs} Left`;
            } else {
                timerElement.innerText = "EXPIRED (Lock Released)";
            }
        }, 1000);
    }
});