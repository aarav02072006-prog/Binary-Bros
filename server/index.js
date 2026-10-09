const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database');

const app = express();

app.use(cors());
app.use(express.json());

// Serve static files from the public frontend directory
app.use(express.static(path.join(__dirname, '../public')));

// ==========================================
// 1. PRODUCTS API (Filtering, Sorting, Search)
// ==========================================
app.get('/api/products', (req, res) => {
    let { category, search, sort, minPrice, maxPrice } = req.query;
    let query = `SELECT * FROM products WHERE 1=1`;
    let params = [];

    if (category && category !== 'All') {
        query += ` AND category LIKE ?`;
        params.push(`%${category}%`);
    }

    if (search) {
        query += ` AND (title LIKE ? OR description LIKE ? OR category LIKE ?)`;
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (minPrice) {
        query += ` AND price >= ?`;
        params.push(parseFloat(minPrice));
    }

    if (maxPrice) {
        query += ` AND price <= ?`;
        params.push(parseFloat(maxPrice));
    }

    // Sorting options
    if (sort === 'low-high') {
        query += ` ORDER BY price ASC`;
    } else if (sort === 'high-low') {
        query += ` ORDER BY price DESC`;
    } else {
        query += ` ORDER BY id DESC`; // Default: newest first
    }

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ products: rows });
    });
});

// ==========================================
// 2. FETCH SINGLE PRODUCT BY ID API
// ==========================================
app.get('/api/products/:id', (req, res) => {
    const productId = req.params.id;
    db.get(`SELECT * FROM products WHERE id = ?`, [productId], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Product not found' });
        res.json({ product: row });
    });
});

// ==========================================
// 3. LIVE SEARCH SUGGESTIONS API
// ==========================================
app.get('/api/search/suggestions', (req, res) => {
    const query = req.query.q;
    if (!query || query.trim() === '') {
        return res.json({ suggestions: [] });
    }

    db.all(
        `SELECT DISTINCT title, category FROM products WHERE title LIKE ? OR category LIKE ? LIMIT 6`,
        [`%${query}%`, `%${query}%`],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ suggestions: rows });
        }
    );
});

// ==========================================
// 4. PIN CODE DELIVERABILITY CHECK API
// ==========================================
app.get('/api/check-delivery', (req, res) => {
    const { pincode } = req.query;
    if (!pincode || pincode.length !== 6 || isNaN(pincode)) {
        return res.status(400).json({ error: 'Please enter a valid 6-digit Indian PIN code.' });
    }

    // Realistic delivery estimation logic
    res.json({
        success: true,
        pincode,
        codAvailable: true,
        deliveryDays: Math.floor(Math.random() * 3) + 3, // 3 to 5 days
        freeDelivery: true,
        message: 'Standard delivery available with Cash on Delivery (COD).'
    });
});

// ==========================================
// 5. MOCK CHECKOUT / ORDER PLACEMENT API
// ==========================================
app.post('/api/orders', (req, res) => {
    const { items, shippingAddress, paymentMethod, totalAmount } = req.body;
    
    if (!items || items.length === 0) {
        return res.status(400).json({ error: 'Cart is empty.' });
    }

    const orderId = 'MSH-' + Math.floor(100000 + Math.random() * 900000);
    
    res.json({
        success: true,
        orderId,
        totalAmount,
        paymentMethod: paymentMethod || 'COD',
        message: 'Order placed successfully!',
        estimatedDelivery: '3-5 business days'
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running smoothly on http://localhost:${PORT}`);
});

// Keep process alive check
setInterval(() => {}, 1000);
// ==========================================
// 6. AUTHENTICATION (OTP SEND & VERIFY) APIs
// ==========================================

// In-memory OTP store for testing (use Redis/SQLite in production)
const otpStore = {};

app.post('/api/auth/send-otp', (req, res) => {
    const { phone } = req.body;
    if (!phone || phone.length < 10) {
        return res.status(400).json({ error: 'Please enter a valid 10-digit mobile number.' });
    }

    // Generate a random 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    otpStore[phone] = otp;

    // Log the OTP to your terminal so you can test it easily!
    console.log(`\n========================================`);
    console.log(`[SMS GATEWAY MOCK] OTP for ${phone}: ${otp}`);
    console.log(`========================================\n`);

    res.json({
        success: true,
        message: 'OTP sent successfully to your mobile number.',
        // For local development convenience, we can send debugOtp flag optionally or just check terminal
    });
});

app.post('/api/auth/verify-otp', (req, res) => {
    const { phone, otp, name } = req.body;
    
    if (!phone || !otp) {
        return res.status(400).json({ error: 'Phone number and OTP are required.' });
    }

    if (otpStore[phone] && otpStore[phone] === otp) {
        delete otpStore[phone]; // Clear OTP after successful use
        
        // Return mock user profile session token
        res.json({
            success: true,
            message: 'Login successful!',
            user: {
                phone,
                name: name || 'Valued Customer',
                token: 'msh-auth-token-' + Math.random().toString(36).slice(2)
            }
        });
    } else {
        res.status(400).json({ error: 'Invalid or expired OTP. Please try again.' });
    }
});