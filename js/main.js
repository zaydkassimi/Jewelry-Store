let cart = [];
let products = [];
let currentSortOrder = 'none';
let isAdminLoggedIn = false;
let isDesignerLoggedIn = false;
let currentDesigner = null;

// Fetch products from API
async function fetchProducts() {
    try {
        // Check localStorage
        const savedProducts = localStorage.getItem('jewelryProducts');
        if (savedProducts) {
            products = JSON.parse(savedProducts);
            displayProducts(products);
            return;
        }

        // Only create default products if it's the first time
        if (!products || products.length === 0) {
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
        displayProducts(products);
    } catch (error) {
        console.error('Error loading products:', error);
        products = [];
        displayProducts(products);
    }
}

function displayProducts(productsToDisplay) {
    const container = document.getElementById('productsContainer');
    if (!container) return;

    let html = '';
    productsToDisplay.forEach(product => {
        html += `
            <div class="col-md-6 col-lg-3 mb-4">
                <div class="product-card">
                    <img src="${product.image}" alt="${product.title}" class="img-fluid">
                    <h5>${product.title}</h5>
                    <p class="price">$${product.price}</p>
                    <p class="description">${product.description}</p>
                    <button class="btn btn-primary" onclick="addToCart(${JSON.stringify(product).replace(/"/g, '&quot;')})">
                        Add to Cart
                    </button>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

function addToCart(product) {
    cart.push(product);
    updateCartCount();
    updateCartDisplay();
}

function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        cartCount.textContent = cart.length;
    }
}

function updateCartDisplay() {
    const cartContent = document.getElementById('cartContent');
    if (!cartContent) return;

    if (cart.length === 0) {
        cartContent.innerHTML = '<p class="text-center">Your cart is empty</p>';
        return;
    }

    let total = 0;
    let cartHTML = '<div class="cart-items">';
    
    cart.forEach((item, index) => {
        total += item.price;
        cartHTML += `
            <div class="cart-item d-flex align-items-center justify-content-between mb-3">
                <img src="${item.image}" alt="${item.title}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">
                <div class="flex-grow-1 mx-3">
                    <h6 class="mb-0">${item.title}</h6>
                    <p class="mb-0">$${item.price}</p>
                </div>
                <button class="btn btn-danger btn-sm" onclick="removeFromCart(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    });

    cartHTML += `
        </div>
        <div class="cart-total mt-3 d-flex justify-content-between border-top pt-3">
            <h5>Total:</h5>
            <h5>$${total}</h5>
        </div>
        <form id="checkoutForm" class="mt-4">
            <h5>Checkout Information</h5>
            <div class="mb-3">
                <input type="text" class="form-control" id="customerName" placeholder="Full Name" required>
            </div>
            <div class="mb-3">
                <input type="email" class="form-control" id="customerEmail" placeholder="Email" required>
            </div>
            <div class="mb-3">
                <textarea class="form-control" id="customerAddress" placeholder="Shipping Address" required></textarea>
            </div>
            <button type="submit" class="btn btn-primary w-100">Place Order</button>
        </form>
    `;

    cartContent.innerHTML = cartHTML;

    // Setup checkout form handler
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const orderData = {
                name: document.getElementById('customerName').value,
                email: document.getElementById('customerEmail').value,
                address: document.getElementById('customerAddress').value
            };
            
            saveOrder(orderData);
            
            const successMessage = document.getElementById('checkoutSuccess');
            if (successMessage) {
                successMessage.classList.remove('d-none');
            }
            
            cartContent.classList.add('d-none');
            
            setTimeout(() => {
                cart = [];
                updateCartCount();
                
                setTimeout(() => {
                    const cartModal = bootstrap.Modal.getInstance(document.getElementById('cartModal'));
                    if (cartModal) {
                        cartModal.hide();
                    }
                    
                    if (successMessage) {
                        successMessage.classList.add('d-none');
                    }
                    cartContent.classList.remove('d-none');
                    checkoutForm.reset();
                }, 1000);
            }, 2000);
        });
    }
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartCount();
    updateCartDisplay();
}

function sortProductsByPrice(order) {
    currentSortOrder = order;
    let sortedProducts = [...products];
    
    sortedProducts.sort((a, b) => {
        if (order === 'high') {
            return b.price - a.price;
        } else if (order === 'low') {
            return a.price - b.price;
        }
        return 0;
    });
    
    displayProducts(sortedProducts);
}

function updateLoginButton() {
    const loginBtn = document.getElementById('loginBtn');
    if (isAdminLoggedIn) {
        loginBtn.innerHTML = '<i class="fas fa-user-check"></i> Admin';
        loginBtn.classList.add('logged-in');
    } else {
        loginBtn.innerHTML = '<i class="fas fa-user"></i> Login';
        loginBtn.classList.remove('logged-in');
    }
}

function handleAdminClick() {
    const existingDropdown = document.querySelector('.admin-dropdown');
    if (existingDropdown) {
        existingDropdown.remove();
    } else {
        const adminDropdown = document.createElement('div');
        adminDropdown.className = 'admin-dropdown';
        adminDropdown.innerHTML = `
            <a href="admin.html"><i class="fas fa-cog"></i> Dashboard</a>
            <a href="#" onclick="logout(); return false;"><i class="fas fa-sign-out-alt"></i> Logout</a>
        `;
        document.querySelector('.nav-buttons').appendChild(adminDropdown);
    }
}

function logout() {
    isAdminLoggedIn = false;
    sessionStorage.removeItem('adminLoggedIn');
    updateLoginButton();
    const adminDropdown = document.querySelector('.admin-dropdown');
    if (adminDropdown) {
        adminDropdown.remove();
    }
}

// Add this function to save orders to localStorage
function saveOrder(orderData) {
    // Get existing orders or initialize empty array
    const existingOrders = JSON.parse(localStorage.getItem('jewelryOrders') || '[]');
    
    // Create new order object
    const newOrder = {
        id: existingOrders.length + 1,
        customerName: orderData.name,
        email: orderData.email,
        address: orderData.address,
        items: [...cart],
        total: cart.reduce((sum, item) => sum + item.price, 0),
        date: new Date().toISOString(),
        status: 'Completed'
    };
    
    // Add new order to existing orders
    existingOrders.push(newOrder);
    
    // Save back to localStorage
    localStorage.setItem('jewelryOrders', JSON.stringify(existingOrders));
}

// Add this to your existing initialization code
function updateAdminButton() {
    const adminBtn = document.getElementById('adminBtn');
    const adminMenu = document.getElementById('adminMenu');
    
    if (isAdminLoggedIn) {
        adminBtn.innerHTML = `
            <i class="fas fa-user-shield"></i>
            <span>Admin</span>
        `;
        adminMenu.style.display = 'block';
    } else {
        adminBtn.innerHTML = `
            <i class="fas fa-user"></i>
            <span>Login</span>
        `;
        adminMenu.style.display = 'none';
    }
}

// Function to handle admin login
function handleLogin(username, password) {
    // Check for admin login
    if (username === 'admin' && password === 'admin') {
        isAdminLoggedIn = true;
        sessionStorage.setItem('adminLoggedIn', 'true');
        updateAdminButton();
        const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
        if (loginModal) {
            loginModal.hide();
        }
        window.location.href = 'admin.html';
        return;
    }

    // Check for designer login
    const designers = JSON.parse(localStorage.getItem('jewelryDesigners') || '[]');
    const designer = designers.find(d => d.username === username && d.password === password);

    if (designer) {
        isDesignerLoggedIn = true;
        currentDesigner = designer;
        sessionStorage.setItem('designerLoggedIn', 'true');
        sessionStorage.setItem('currentDesigner', JSON.stringify(designer));
        updateAdminButton();
        const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
        if (loginModal) {
            loginModal.hide();
        }
        window.location.href = 'admin.html';
    } else {
        alert('Invalid credentials');
    }
}

// Function to sort products
function sortProducts(order) {
    const sortedProducts = [...products].sort((a, b) => {
        if (order === 'low') {
            return a.price - b.price;
        } else {
            return b.price - a.price;
        }
    });
    displayProducts(sortedProducts);
}

// Function to show designer signup modal
function showDesignerSignup() {
    const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
    loginModal.hide();
    const signupModal = new bootstrap.Modal(document.getElementById('designerSignupModal'));
    signupModal.show();
}

// Function to handle designer signup
function handleDesignerSignup(e) {
    e.preventDefault();
    
    const designer = {
        id: Date.now(),
        name: document.getElementById('designerName').value,
        email: document.getElementById('designerEmail').value,
        username: document.getElementById('designerUsername').value,
        password: document.getElementById('designerPassword').value,
        bio: document.getElementById('designerBio').value
    };

    // Get existing designers or initialize empty array
    const designers = JSON.parse(localStorage.getItem('jewelryDesigners') || '[]');
    
    // Check if username already exists
    if (designers.some(d => d.username === designer.username)) {
        alert('Username already exists. Please choose another one.');
        return;
    }

    // Add new designer
    designers.push(designer);
    localStorage.setItem('jewelryDesigners', JSON.stringify(designers));

    // Hide signup modal
    const signupModal = bootstrap.Modal.getInstance(document.getElementById('designerSignupModal'));
    signupModal.hide();

    alert('Signup successful! You can now login with your credentials.');
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
    
    // Check login status
    isAdminLoggedIn = sessionStorage.getItem('adminLoggedIn') === 'true';
    isDesignerLoggedIn = sessionStorage.getItem('designerLoggedIn') === 'true';
    if (isDesignerLoggedIn) {
        currentDesigner = JSON.parse(sessionStorage.getItem('currentDesigner'));
    }
    updateAdminButton();

    // Setup designer signup form
    const designerSignupForm = document.getElementById('designerSignupForm');
    if (designerSignupForm) {
        designerSignupForm.addEventListener('submit', handleDesignerSignup);
    }

    // Setup login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            handleLogin(username, password);
        });
    }

    // Setup admin button
    const adminBtn = document.getElementById('adminBtn');
    if (adminBtn) {
        adminBtn.addEventListener('click', () => {
            if (!isAdminLoggedIn) {
                const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
                loginModal.show();
            }
        });
    }

    // Setup cart button
    const cartBtn = document.getElementById('cartBtn');
    if (cartBtn) {
        cartBtn.addEventListener('click', () => {
            const cartModal = new bootstrap.Modal(document.getElementById('cartModal'));
            cartModal.show();
        });
    }

    // Setup search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filteredProducts = products.filter(product => 
                product.title.toLowerCase().includes(searchTerm)
            );
            displayProducts(filteredProducts);
        });
    }
}); 