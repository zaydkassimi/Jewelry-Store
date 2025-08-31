// Check if user is logged in
const isAdmin = sessionStorage.getItem('adminLoggedIn') === 'true';
const isDesigner = sessionStorage.getItem('designerLoggedIn') === 'true';
const currentDesigner = isDesigner ? JSON.parse(sessionStorage.getItem('currentDesigner')) : null;

if (!isAdmin && !isDesigner) {
    window.location.href = 'index.html';
}

// Hide certain menu items for designers
if (isDesigner) {
    document.querySelector('[data-page="orders"]').style.display = 'none';
    document.querySelector('[data-page="designers"]').style.display = 'none';
}

let products = [];
let orders = [];

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    // Fetch initial data
    await fetchProducts();
    await fetchOrders();
    
    // Update welcome message based on user type
    const welcomeMessage = document.querySelector('.user-profile span');
    if (welcomeMessage) {
        welcomeMessage.textContent = isDesigner ? `Welcome, ${currentDesigner.name}` : 'Welcome, Admin';
    }
    
    // Load default view (dashboard)
    loadDashboard();
    
    // Setup navigation
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', async (e) => {
            e.preventDefault();
            
            document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
            e.currentTarget.classList.add('active');
            
            const pageTitle = e.currentTarget.querySelector('span').textContent;
            document.querySelector('.content-header h1').textContent = pageTitle;
            
            const page = e.currentTarget.getAttribute('data-page');
            switch(page) {
                case 'dashboard':
                    loadDashboard();
                    break;
                case 'products':
                    // Refresh products before loading
                    await fetchProducts();
                    break;
                case 'orders':
                    await fetchOrders();
                    loadOrders();
                    break;
                case 'designers':
                    loadDesigners();
                    break;
            }
        });
    });

    // Setup logout button
    document.getElementById('logoutBtn').addEventListener('click', () => {
        sessionStorage.removeItem('adminLoggedIn');
        sessionStorage.removeItem('designerLoggedIn');
        sessionStorage.removeItem('currentDesigner');
        window.location.href = 'index.html';
    });
});

// Add Chart.js to the HTML file
document.head.insertAdjacentHTML('beforeend', `
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
`);

// Helper function to generate random data
function generateRandomData() {
    // Random monthly revenue data with an upward trend
    const monthlyRevenue = {
        'Jan': 5000 + Math.floor(Math.random() * 3000),
        'Feb': 6000 + Math.floor(Math.random() * 3000),
        'Mar': 7000 + Math.floor(Math.random() * 4000),
        'Apr': 8000 + Math.floor(Math.random() * 4000),
        'May': 9000 + Math.floor(Math.random() * 5000),
        'Jun': 10000 + Math.floor(Math.random() * 5000),
        'Jul': 12000 + Math.floor(Math.random() * 6000),
        'Aug': 13000 + Math.floor(Math.random() * 6000),
        'Sep': 14000 + Math.floor(Math.random() * 7000),
        'Oct': 15000 + Math.floor(Math.random() * 7000),
        'Nov': 16000 + Math.floor(Math.random() * 8000),
        'Dec': 18000 + Math.floor(Math.random() * 8000)
    };

    // Random category distribution with realistic proportions
    const categoryData = {
        'Rings': Math.floor(Math.random() * 30) + 40, // 40-70 rings
        'Necklaces': Math.floor(Math.random() * 25) + 30, // 30-55 necklaces
        'Earrings': Math.floor(Math.random() * 20) + 25, // 25-45 earrings
        'Bracelets': Math.floor(Math.random() * 15) + 20 // 20-35 bracelets
    };

    // Random price ranges with realistic distribution
    const priceRanges = {
        '$0-$100': Math.floor(Math.random() * 10) + 15,     // 15-25 items
        '$101-$500': Math.floor(Math.random() * 15) + 25,   // 25-40 items
        '$501-$1000': Math.floor(Math.random() * 12) + 20,  // 20-32 items
        '$1001+': Math.floor(Math.random() * 8) + 10        // 10-18 items
    };

    // Random best sellers with realistic sales numbers
    const bestSellers = [
        { 
            title: 'Diamond Engagement Ring',
            soldCount: Math.floor(Math.random() * 30) + 70,  // 70-100 sales
            revenue: Math.floor(Math.random() * 50000) + 100000
        },
        { 
            title: 'Gold Chain Necklace',
            soldCount: Math.floor(Math.random() * 25) + 60,  // 60-85 sales
            revenue: Math.floor(Math.random() * 40000) + 80000
        },
        { 
            title: 'Pearl Drop Earrings',
            soldCount: Math.floor(Math.random() * 20) + 50,  // 50-70 sales
            revenue: Math.floor(Math.random() * 30000) + 60000
        },
        { 
            title: 'Silver Charm Bracelet',
            soldCount: Math.floor(Math.random() * 15) + 40,  // 40-55 sales
            revenue: Math.floor(Math.random() * 20000) + 40000
        },
        { 
            title: 'Sapphire Pendant',
            soldCount: Math.floor(Math.random() * 10) + 30,  // 30-40 sales
            revenue: Math.floor(Math.random() * 15000) + 30000
        }
    ];

    // Calculate totals
    const totalProducts = Object.values(categoryData).reduce((a, b) => a + b, 0);
    const totalOrders = bestSellers.reduce((a, b) => a + b.soldCount, 0);
    const totalRevenue = Object.values(monthlyRevenue).reduce((a, b) => a + b, 0);

    return {
        monthlyRevenue,
        categoryData,
        priceRanges,
        bestSellers,
        totalProducts,
        totalOrders,
        totalRevenue
    };
}

async function loadDashboard() {
    // First, make sure Chart.js is loaded
    if (!window.Chart) {
        await new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
            script.onload = resolve;
            document.head.appendChild(script);
        });
    }

    const content = document.getElementById('dashboardContent');
    const data = generateRandomData();

    content.innerHTML = `
        <div class="dashboard-overview">
            <h2 class="mb-4">Dashboard Overview</h2>
            <div class="stats-cards mb-4">
                <div class="stat-card">
                    <h3><i class="fas fa-gem"></i> Total Products</h3>
                    <div class="number">${data.totalProducts}</div>
                </div>
                <div class="stat-card">
                    <h3><i class="fas fa-shopping-cart"></i> Total Orders</h3>
                    <div class="number">${data.totalOrders}</div>
                </div>
                <div class="stat-card">
                    <h3><i class="fas fa-dollar-sign"></i> Total Revenue</h3>
                    <div class="number">$${data.totalRevenue.toLocaleString()}</div>
                </div>
                <div class="stat-card">
                    <h3><i class="fas fa-chart-line"></i> Avg. Order Value</h3>
                    <div class="number">$${(data.totalRevenue / data.totalOrders).toFixed(2)}</div>
                </div>
            </div>

            <div class="row">
                <div class="col-md-8 mb-4">
                    <div class="dashboard-card">
                        <h4 class="card-title">Monthly Revenue</h4>
                        <div class="chart-container" style="position: relative; height: 300px;">
                            <canvas id="revenueChart"></canvas>
                        </div>
                    </div>
                </div>
                <div class="col-md-4 mb-4">
                    <div class="dashboard-card">
                        <h4 class="card-title">Product Categories</h4>
                        <div class="chart-container" style="position: relative; height: 300px;">
                            <canvas id="categoryChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>

            <div class="row">
                <div class="col-md-6 mb-4">
                    <div class="dashboard-card">
                        <h4 class="card-title">Price Distribution</h4>
                        <div class="chart-container" style="position: relative; height: 300px;">
                            <canvas id="priceRangeChart"></canvas>
                        </div>
                    </div>
                </div>
                <div class="col-md-6 mb-4">
                    <div class="dashboard-card">
                        <h4 class="card-title">Top 5 Best Sellers</h4>
                        <div class="chart-container" style="position: relative; height: 300px;">
                            <canvas id="bestSellersChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Add some delay to ensure DOM is ready
    setTimeout(() => {
        // Monthly Revenue Chart
        new Chart(document.getElementById('revenueChart').getContext('2d'), {
            type: 'line',
            data: {
                labels: Object.keys(data.monthlyRevenue),
                datasets: [{
                    label: 'Monthly Revenue',
                    data: Object.values(data.monthlyRevenue),
                    borderColor: '#d4af37',
                    backgroundColor: 'rgba(212, 175, 55, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return '$' + context.raw.toLocaleString();
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: value => '$' + value.toLocaleString()
                        }
                    }
                }
            }
        });

        // Category Distribution Chart
        new Chart(document.getElementById('categoryChart').getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: Object.keys(data.categoryData),
                datasets: [{
                    data: Object.values(data.categoryData),
                    backgroundColor: [
                        '#FFD700',
                        '#C0C0C0',
                        '#E5E4E2',
                        '#B87333'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20
                        }
                    }
                }
            }
        });

        // Price Range Chart
        new Chart(document.getElementById('priceRangeChart').getContext('2d'), {
            type: 'bar',
            data: {
                labels: Object.keys(data.priceRanges),
                datasets: [{
                    label: 'Number of Products',
                    data: Object.values(data.priceRanges),
                    backgroundColor: 'rgba(212, 175, 55, 0.7)',
                    borderColor: '#d4af37',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { stepSize: 5 }
                    }
                }
            }
        });

        // Best Sellers Chart
        new Chart(document.getElementById('bestSellersChart').getContext('2d'), {
            type: 'bar',
            data: {
                labels: data.bestSellers.map(item => item.title),
                datasets: [{
                    axis: 'y',
                    label: 'Units Sold',
                    data: data.bestSellers.map(item => item.soldCount),
                    backgroundColor: 'rgba(212, 175, 55, 0.7)',
                    borderColor: '#d4af37',
                    borderWidth: 1
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: { stepSize: 10 }
                    }
                }
            }
        });
    }, 100);
}

// Helper function to calculate best sellers
function calculateBestSellers(relevantOrders) {
    const productSales = {};
    
    // Count sales for each product
    relevantOrders.forEach(order => {
        order.items.forEach(item => {
            if (!productSales[item.id]) {
                productSales[item.id] = {
                    ...item,
                    soldCount: 0
                };
            }
            productSales[item.id].soldCount++;
        });
    });

    // Convert to array and sort by sold count
    return Object.values(productSales)
        .sort((a, b) => b.soldCount - a.soldCount)
        .slice(0, 5); // Get top 5
}

// Helper function to calculate monthly revenue
function calculateMonthlyRevenue(relevantOrders) {
    const monthlyRevenue = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Initialize all months with zero
    months.forEach(month => {
        monthlyRevenue[month] = 0;
    });

    // Calculate revenue for each month
    relevantOrders.forEach(order => {
        const month = months[new Date(order.date).getMonth()];
        monthlyRevenue[month] += order.total;
    });

    return monthlyRevenue;
}

// Helper function to calculate total revenue
function calculateTotalRevenue(relevantOrders) {
    return relevantOrders.reduce((total, order) => total + order.total, 0).toFixed(2);
}

// Helper function to calculate category distribution
function calculateCategoryDistribution(products) {
    const categories = {
        'Rings': 0,
        'Necklaces': 0,
        'Earrings': 0,
        'Bracelets': 0,
        'Other': 0
    };

    products.forEach(product => {
        const title = product.title.toLowerCase();
        if (title.includes('ring')) categories['Rings']++;
        else if (title.includes('necklace') || title.includes('pendant')) categories['Necklaces']++;
        else if (title.includes('earring')) categories['Earrings']++;
        else if (title.includes('bracelet')) categories['Bracelets']++;
        else categories['Other']++;
    });

    // Remove categories with zero products
    return Object.fromEntries(Object.entries(categories).filter(([_, value]) => value > 0));
}

// Helper function to calculate price ranges
function calculatePriceRanges(products) {
    const ranges = {
        '$0-$100': 0,
        '$101-$500': 0,
        '$501-$1000': 0,
        '$1001+': 0
    };

    products.forEach(product => {
        if (product.price <= 100) ranges['$0-$100']++;
        else if (product.price <= 500) ranges['$101-$500']++;
        else if (product.price <= 1000) ranges['$501-$1000']++;
        else ranges['$1001+']++;
    });

    return ranges;
}

// Add these styles
const dashboardStyles = document.createElement('style');
dashboardStyles.textContent = `
    .dashboard-card {
        background: white;
        border-radius: 16px;
        padding: 1.5rem;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        height: 100%;
    }

    .card-title {
        color: var(--dark);
        font-size: 1.2rem;
        font-weight: 600;
        margin-bottom: 1.5rem;
    }

    .best-sellers-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .best-seller-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 0.5rem;
        border-radius: 8px;
        transition: all 0.3s ease;
    }

    .best-seller-item:hover {
        background: var(--light);
    }

    .best-seller-item .rank {
        font-size: 1.2rem;
        font-weight: 700;
        color: var(--accent);
        width: 32px;
    }

    .best-seller-item .product-info {
        display: flex;
        align-items: center;
        gap: 1rem;
        flex: 1;
    }

    .best-seller-item img {
        width: 48px;
        height: 48px;
        object-fit: cover;
        border-radius: 8px;
    }

    .best-seller-item h6 {
        margin: 0;
        font-size: 0.9rem;
    }

    .best-seller-item p {
        margin: 0;
        font-size: 0.8rem;
        color: var(--gray);
    }

    .table td {
        vertical-align: middle;
    }

    .badge {
        padding: 0.5rem 1rem;
        border-radius: 30px;
    }
`;
document.head.appendChild(dashboardStyles);

async function loadProducts() {
    const content = document.getElementById('dashboardContent');
    
    // Filter products for designers
    const displayedProducts = isDesigner 
        ? products.filter(p => p.designerId === currentDesigner.id)
        : products;

    content.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <div class="d-flex gap-3">
                <button class="btn btn-primary" onclick="addNewProduct()">
                    <i class="fas fa-plus"></i> Add New Jewelry
                </button>
            </div>
        </div>
        <div class="row">
            ${displayedProducts.map(product => `
                <div class="col-md-6 col-lg-3 mb-4">
                    <div class="product-card">
                        <img src="${product.image}" 
                             alt="${product.title}" 
                             class="img-fluid mb-3"
                             onerror="this.src='https://via.placeholder.com/300x300?text=Jewelry'">
                        <h5>${product.title}</h5>
                        <p class="price">$${product.price}</p>
                        <p class="description">${product.description}</p>
                        <div class="action-buttons mt-3">
                            <button class="btn btn-info btn-sm" onclick="viewProductDetails(${product.id})">
                                <i class="fas fa-eye"></i> View
                            </button>
                            ${(isAdmin || (isDesigner && product.designerId === currentDesigner.id)) ? `
                                <button class="btn btn-warning btn-sm" onclick="editProduct(${product.id})">
                                    <i class="fas fa-edit"></i> Edit
                                </button>
                                <button class="btn btn-danger btn-sm" onclick="deleteProduct(${product.id})">
                                    <i class="fas fa-trash"></i> Delete
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// Add this CSS to style the product cards
const style = document.createElement('style');
style.textContent = `
    .product-card {
        background: white;
        border-radius: 16px;
        padding: 1.5rem;
        height: 100%;
        transition: all 0.3s ease;
        box-shadow: 0 4px 6px rgba(0,0,0,0.05);
    }

    .product-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 15px rgba(0,0,0,0.1);
    }

    .product-card img {
        width: 100%;
        height: 200px;
        object-fit: cover;
        border-radius: 12px;
    }

    .product-card h5 {
        margin: 1rem 0;
        font-weight: 600;
    }

    .product-card .price {
        color: var(--primary);
        font-size: 1.25rem;
        font-weight: 700;
        margin-bottom: 0.5rem;
    }

    .product-card .description {
        color: var(--gray);
        font-size: 0.9rem;
        margin-bottom: 1rem;
    }

    .product-card .action-buttons {
        display: flex;
        gap: 0.5rem;
    }

    .product-card .btn {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
    }
`;
document.head.appendChild(style);

async function loadOrders() {
    const content = document.getElementById('dashboardContent');
    content.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <button class="btn btn-danger" onclick="clearAllOrders()">
                <i class="fas fa-trash"></i> Clear All Orders
            </button>
        </div>
        <div class="table-container">
            <table class="table" id="ordersTable">
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Email</th>
                        <th>Total</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${orders.length === 0 ? `
                        <tr>
                            <td colspan="7" class="text-center">No orders found</td>
                        </tr>
                    ` : orders.map(order => `
                        <tr>
                            <td>#${order.id}</td>
                            <td>${order.customerName}</td>
                            <td>${order.email}</td>
                            <td>$${order.total.toFixed(2)}</td>
                            <td>${new Date(order.date).toLocaleDateString()}</td>
                            <td>
                                <span class="badge bg-success">${order.status}</span>
                            </td>
                            <td>
                                <button class="btn btn-info btn-sm" onclick="viewOrderDetails(${order.id})">
                                    View Details
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;

    // Initialize DataTable for orders
    if (orders.length > 0) {
        $('#ordersTable').DataTable({
            responsive: true,
            pageLength: 10,
            order: [[0, 'desc']]
        });
    }
}

// Fetch functions
async function fetchProducts() {
    const savedProducts = localStorage.getItem('jewelryProducts');
    if (savedProducts) {
        products = JSON.parse(savedProducts);
    } else {
        // Default products if none exist
        products = [
            {
                id: 1,
                title: "Diamond Ring",
                price: 999,
                image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500",
                description: "Beautiful diamond engagement ring"
            },
            {
                id: 2,
                title: "Gold Necklace",
                price: 799,
                image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500",
                description: "18K Gold necklace with pendant"
            },
            {
                id: 3,
                title: "Pearl Earrings",
                price: 299,
                image: "https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?w=500",
                description: "Elegant pearl drop earrings"
            },
            {
                id: 4,
                title: "Silver Bracelet",
                price: 199,
                image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500",
                description: "Sterling silver charm bracelet"
            },
            {
                id: 5,
                title: "Sapphire Ring",
                price: 899,
                image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500",
                description: "Blue sapphire with diamond accents"
            },
            {
                id: 6,
                title: "Ruby Pendant",
                price: 599,
                image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500",
                description: "Ruby pendant with gold chain"
            }
        ];
        localStorage.setItem('jewelryProducts', JSON.stringify(products));
    }
    // After fetching products, load them into the table
    loadProducts();
}

async function fetchOrders() {
    const savedOrders = localStorage.getItem('jewelryOrders');
    orders = savedOrders ? JSON.parse(savedOrders) : [];
}

function logout() {
    sessionStorage.removeItem('adminLoggedIn');
    window.location.href = 'index.html';
}

// Add jewelry image options
const jewelryImageOptions = {
    'ring': [
        'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500',
        'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=500',
        'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500'
    ],
    'necklace': [
        'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500',
        'https://images.unsplash.com/photo-1601821765780-754fa98637c1?w=500',
        'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500'
    ],
    'earrings': [
        'https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?w=500',
        'https://images.unsplash.com/photo-1635767798638-3665960e9533?w=500',
        'https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?w=500'
    ],
    'bracelet': [
        'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500',
        'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=500',
        'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500'
    ]
};

// Function to get random image for jewelry type
function getRandomJewelryImage(type) {
    const images = jewelryImageOptions[type] || jewelryImageOptions['ring'];
    return images[Math.floor(Math.random() * images.length)];
}

// Add New Product Function
function addNewProduct() {
    const modal = `
        <div class="modal fade" id="addProductModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Add New Jewelry</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="addProductForm">
                            <div class="mb-3">
                                <label class="form-label">Jewelry Name</label>
                                <input type="text" class="form-control" id="productTitle" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Price ($)</label>
                                <input type="number" class="form-control" id="productPrice" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Description</label>
                                <textarea class="form-control" id="productDescription" rows="3" required></textarea>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Image</label>
                                <div class="d-flex gap-3 mb-2">
                                    <select class="form-select" id="jewelryType">
                                        <option value="">Custom URL</option>
                                        <option value="ring">Generate Ring Image</option>
                                        <option value="necklace">Generate Necklace Image</option>
                                        <option value="earrings">Generate Earrings Image</option>
                                        <option value="bracelet">Generate Bracelet Image</option>
                                    </select>
                                    <button type="button" class="btn btn-secondary" onclick="generateImage()">
                                        Generate
                                    </button>
                                </div>
                                <input type="text" class="form-control" id="productImage" placeholder="Image URL" required>
                                <div id="imagePreview" class="mt-2 text-center" style="display: none;">
                                    <img src="" alt="Preview" style="max-width: 200px; border-radius: 8px;">
                                </div>
                            </div>
                            <button type="submit" class="btn btn-primary w-100">Add Jewelry</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modal);
    const productModal = new bootstrap.Modal(document.getElementById('addProductModal'));
    productModal.show();

    // Setup image preview
    const productImage = document.getElementById('productImage');
    const imagePreview = document.getElementById('imagePreview');
    const previewImg = imagePreview.querySelector('img');

    productImage.addEventListener('input', () => {
        if (productImage.value) {
            previewImg.src = productImage.value;
            imagePreview.style.display = 'block';
            previewImg.onerror = () => {
                imagePreview.style.display = 'none';
            };
        } else {
            imagePreview.style.display = 'none';
        }
    });

    document.getElementById('addProductForm').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const newProduct = {
            id: products.length + 1,
            title: document.getElementById('productTitle').value,
            price: parseFloat(document.getElementById('productPrice').value),
            description: document.getElementById('productDescription').value,
            image: document.getElementById('productImage').value,
            designerId: isDesigner ? currentDesigner.id : null,
            designerName: isDesigner ? currentDesigner.name : null
        };

        products.push(newProduct);
        localStorage.setItem('jewelryProducts', JSON.stringify(products));
        
        productModal.hide();
        document.getElementById('addProductModal').remove();
        loadProducts();
    });
}

// Function to generate random jewelry image
function generateImage() {
    const jewelryType = document.getElementById('jewelryType').value;
    if (!jewelryType) return;

    const randomImage = getRandomJewelryImage(jewelryType);
    const productImage = document.getElementById('productImage');
    const imagePreview = document.getElementById('imagePreview');
    const previewImg = imagePreview.querySelector('img');

    productImage.value = randomImage;
    previewImg.src = randomImage;
    imagePreview.style.display = 'block';
}

// View Product Details Function
function viewProductDetails(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    const modal = `
        <div class="modal fade" id="viewProductModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Product Details</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="text-center mb-3">
                            <img src="${product.image}" 
                                 alt="${product.title}"
                                 style="max-width: 200px; border-radius: 8px;"
                                 onerror="this.src='https://via.placeholder.com/200x200?text=Jewelry'">
                        </div>
                        <h4>${product.title}</h4>
                        <p class="text-primary fw-bold">$${product.price}</p>
                        <p>${product.description || 'No description available.'}</p>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-primary" onclick="exportToPDF(${product.id})">
                            <i class="fas fa-file-pdf"></i> Export PDF
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modal);
    const viewModal = new bootstrap.Modal(document.getElementById('viewProductModal'));
    viewModal.show();
}

// Edit Product Function
function editProduct(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    const modal = `
        <div class="modal fade" id="editProductModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Edit Product</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="editProductForm">
                            <div class="mb-3">
                                <label class="form-label">Jewelry Name</label>
                                <input type="text" class="form-control" id="editTitle" value="${product.title}" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Price ($)</label>
                                <input type="number" class="form-control" id="editPrice" value="${product.price}" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Description</label>
                                <textarea class="form-control" id="editDescription" rows="3" required>${product.description || ''}</textarea>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Image URL</label>
                                <input type="text" class="form-control" id="editImage" value="${product.image}" required>
                            </div>
                            <button type="submit" class="btn btn-primary w-100">Save Changes</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modal);
    const editModal = new bootstrap.Modal(document.getElementById('editProductModal'));
    editModal.show();

    document.getElementById('editProductForm').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const updatedProduct = {
            ...product,
            title: document.getElementById('editTitle').value,
            price: parseFloat(document.getElementById('editPrice').value),
            description: document.getElementById('editDescription').value,
            image: document.getElementById('editImage').value
        };

        // Update product in array
        const index = products.findIndex(p => p.id === id);
        products[index] = updatedProduct;
        
        // Save to localStorage
        localStorage.setItem('jewelryProducts', JSON.stringify(products));
        
        // Hide modal
        editModal.hide();
        
        // Remove modal from DOM
        document.getElementById('editProductModal').remove();
        
        // Reload products table
        loadProducts();
    });
}

// Delete Product Function
function deleteProduct(id) {
    if (confirm('Are you sure you want to delete this product?')) {
        products = products.filter(p => p.id !== id);
        localStorage.setItem('jewelryProducts', JSON.stringify(products));
        loadProducts();
    }
}

// Export to CSV Function
function exportToCSV() {
    const items = products.map(product => ({
        Title: product.title,
        Price: product.price,
        Description: product.description || ''
    }));
    
    const csvContent = "data:text/csv;charset=utf-8," 
        + Object.keys(items[0]).join(",") + "\n"
        + items.map(item => 
            Object.values(item).map(value => 
                typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
            ).join(",")
        ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "jewelry_products.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Export to PDF Function
function exportToPDF(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('Product Details', 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Title: ${product.title}`, 20, 40);
    doc.text(`Price: $${product.price}`, 20, 50);
    
    if (product.description) {
        doc.text('Description:', 20, 60);
        const splitDescription = doc.splitTextToSize(product.description, 170);
        doc.text(splitDescription, 20, 70);
    }
    
    doc.save(`jewelry_product_${id}.pdf`);
}

// View Order Details Function
function viewOrderDetails(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const modal = `
        <div class="modal fade" id="orderDetailsModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Order #${order.id} Details</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="customer-info mb-4">
                            <h6>Customer Information</h6>
                            <p><strong>Name:</strong> ${order.customerName}</p>
                            <p><strong>Email:</strong> ${order.email}</p>
                            <p><strong>Address:</strong> ${order.address}</p>
                        </div>
                        <div class="order-items">
                            <h6>Order Items</h6>
                            ${order.items.map(item => `
                                <div class="order-item d-flex align-items-center gap-3 mb-2">
                                    <img src="${item.image}" 
                                         alt="${item.title}"
                                         style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;">
                                    <div>
                                        <p class="mb-0">${item.title}</p>
                                        <p class="mb-0 text-primary">$${item.price}</p>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        <div class="order-total mt-3">
                            <h5>Total: $${order.total.toFixed(2)}</h5>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modal);
    const detailsModal = new bootstrap.Modal(document.getElementById('orderDetailsModal'));
    detailsModal.show();
}

// Clear All Orders Function
function clearAllOrders() {
    if (confirm('Are you sure you want to clear all orders? This action cannot be undone.')) {
        orders = [];
        localStorage.removeItem('jewelryOrders');
        loadOrders();
    }
}

// Add loadDesigners function
async function loadDesigners() {
    const designers = JSON.parse(localStorage.getItem('jewelryDesigners') || '[]');
    const content = document.getElementById('dashboardContent');
    
    content.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h4>Registered Designers</h4>
        </div>
        <div class="table-container">
            <div class="table-responsive">
                <table class="table table-hover" id="designersTable">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Username</th>
                            <th>Products</th>
                            <th>Bio</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${designers.length === 0 ? `
                            <tr>
                                <td colspan="6" class="text-center">No designers registered yet</td>
                            </tr>
                        ` : designers.map(designer => {
                            const designerProducts = products.filter(p => p.designerId === designer.id);
                            return `
                                <tr>
                                    <td>
                                        <div class="d-flex align-items-center">
                                            <div class="designer-icon">
                                                <i class="fas fa-user-circle"></i>
                                            </div>
                                            <div class="ms-2">
                                                <div class="fw-bold">${designer.name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>${designer.email}</td>
                                    <td>${designer.username}</td>
                                    <td>
                                        <span class="badge bg-info">
                                            ${designerProducts.length} products
                                        </span>
                                    </td>
                                    <td>
                                        <span class="text-truncate d-inline-block" style="max-width: 150px;" title="${designer.bio}">
                                            ${designer.bio}
                                        </span>
                                    </td>
                                    <td>
                                        <div class="action-buttons">
                                            <button class="btn-view" onclick="viewDesignerDetails(${designer.id})">
                                                <i class="fas fa-eye"></i>
                                            </button>
                                            <button class="btn-delete" onclick="deleteDesigner(${designer.id})">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;

    // Destroy existing DataTable if it exists
    if ($.fn.DataTable.isDataTable('#designersTable')) {
        $('#designersTable').DataTable().destroy();
    }

    // Initialize DataTable
    $('#designersTable').DataTable({
        responsive: true,
        pageLength: 10,
        order: [[0, 'asc']],
        dom: '<"top"f>rt<"bottom"lip><"clear">',
        language: {
            search: "_INPUT_",
            searchPlaceholder: "Search designers..."
        }
    });
}

// Add viewDesignerDetails function
function viewDesignerDetails(id) {
    const designer = JSON.parse(localStorage.getItem('jewelryDesigners') || '[]').find(d => d.id === id);
    if (!designer) return;

    const designerProducts = products.filter(p => p.designerId === designer.id);
    
    const modal = `
        <div class="modal fade" id="viewDesignerModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Designer Details</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="designer-profile mb-4">
                            <div class="text-center mb-3">
                                <div class="designer-avatar">
                                    <i class="fas fa-user-circle fa-4x"></i>
                                </div>
                                <h4 class="mt-2">${designer.name}</h4>
                                <p class="text-muted">${designer.email}</p>
                            </div>
                            <div class="designer-info">
                                <h6>Bio</h6>
                                <p>${designer.bio}</p>
                            </div>
                        </div>
                        <div class="designer-products">
                            <h6>Products (${designerProducts.length})</h6>
                            <div class="row g-3">
                                ${designerProducts.map(product => `
                                    <div class="col-md-4">
                                        <div class="product-card p-2">
                                            <img src="${product.image}" 
                                                 alt="${product.title}"
                                                 class="img-fluid rounded mb-2"
                                                 onerror="this.src='https://via.placeholder.com/150x150?text=Jewelry'">
                                            <h6 class="mb-1">${product.title}</h6>
                                            <p class="text-primary mb-0">$${product.price}</p>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modal);
    const viewModal = new bootstrap.Modal(document.getElementById('viewDesignerModal'));
    viewModal.show();

    // Remove modal from DOM when hidden
    const modalElement = document.getElementById('viewDesignerModal');
    modalElement.addEventListener('hidden.bs.modal', () => {
        modalElement.remove();
    });
}

// Update deleteDesigner function
function deleteDesigner(id) {
    if (confirm('Are you sure you want to delete this designer? All their products will also be deleted.')) {
        // Remove designer
        let designers = JSON.parse(localStorage.getItem('jewelryDesigners') || '[]');
        designers = designers.filter(d => d.id !== id);
        localStorage.setItem('jewelryDesigners', JSON.stringify(designers));

        // Remove designer's products
        products = products.filter(p => p.designerId !== id);
        localStorage.setItem('jewelryProducts', JSON.stringify(products));

        loadDesigners();
    }
} 