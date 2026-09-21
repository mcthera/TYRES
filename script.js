// Replace these with your JSONBin details.
const BIN_ID = '6ab178beffd5d16053203f93';
const API_KEY = '$2a$10$naPldLFtbAB1mQmuzuFfHevWBpB22kc8qHLUo1HXwYOJsk3C2ny6.';

const fallbackProducts = [
    {
        id: 'default-1',
        name: "Bridgestone Ecopia",
        size: "Size: 205/60 R16",
        price: "GH₵ 1,450",
        rim: "16",
        width: "205",
        badge: "Best Seller",
        badgeColor: "#FF5722",
        image: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=500&q=80",
        description: "High fuel efficiency & long tread life."
    },
    {
        id: 'default-2',
        name: "Michelin Primacy SUV",
        size: "Size: 225/65 R17",
        price: "GH₵ 2,100",
        rim: "17",
        width: "225",
        badge: "SUV Special",
        badgeColor: "#333333",
        image: "https://images.unsplash.com/photo-1543465077-db45d34b87a5?auto=format&fit=crop&w=500&q=80",
        description: "Superior wet braking and smooth comfort."
    }
];

let products = [];

const ADMIN_PASSWORD = '123';

let uploadedImageUrl = "";
let editingProductId = null;
let isAdminMode = localStorage.getItem('tyre_admin_access') === 'true';

function normalizeProducts(items) {
    return (Array.isArray(items) ? items : []).map((product, index) => ({
        ...product,
        id: product.id || `tyre-${Date.now()}-${index}`
    }));
}

function saveProductsLocally() {
    localStorage.setItem('ghana_tyres', JSON.stringify(products));
}

function hasJsonBinConfig() {
    return BIN_ID !== 'YOUR_JSONBIN_ID_HERE' && API_KEY !== 'YOUR_JSONBIN_MASTER_KEY_HERE';
}

async function syncProductsToCloud() {
    if (!hasJsonBinConfig()) {
        throw new Error('JSONBin details have not been configured.');
    }

    const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'X-Master-Key': API_KEY
        },
        body: JSON.stringify({ tyres: products })
    });

    if (!response.ok) {
        throw new Error(`JSONBin sync failed with status ${response.status}.`);
    }
}

async function saveProducts() {
    saveProductsLocally();
    await syncProductsToCloud();
}

async function fetchProducts() {
    if (!hasJsonBinConfig()) {
        products = normalizeProducts(JSON.parse(localStorage.getItem('ghana_tyres')) || fallbackProducts);
        displayProducts(products);
        return;
    }

    try {
        const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
            headers: {
                'X-Master-Key': API_KEY
            }
        });

        if (!response.ok) {
            throw new Error(`JSONBin load failed with status ${response.status}.`);
        }

        const data = await response.json();
        products = normalizeProducts(data.record?.tyres);
        saveProductsLocally();
        displayProducts(products);
    } catch (error) {
        console.log('Error loading from cloud, using fallback data', error);
        products = normalizeProducts(JSON.parse(localStorage.getItem('ghana_tyres')) || fallbackProducts);
        displayProducts(products);
    }
}

function setFormMode(isEditing) {
    const submitBtn = document.getElementById('submit-product-btn');
    const cancelBtn = document.getElementById('cancel-edit-btn');

    if (!submitBtn || !cancelBtn) return;

    if (isEditing) {
        submitBtn.innerHTML = '<i class="fa-solid fa-pen-to-square"></i> Update Tyre Listing';
        cancelBtn.style.display = 'inline-flex';
    } else {
        submitBtn.innerHTML = '<i class="fa-solid fa-plus"></i> 2. Publish Tyre to Catalog';
        cancelBtn.style.display = 'none';
    }
}

function resetFormState() {
    const form = document.getElementById('add-product-form');
    if (form) form.reset();

    editingProductId = null;
    uploadedImageUrl = "";
    document.getElementById('upload-status').innerText = "Image not uploaded yet";
    setFormMode(false);
}

function fillFormWithProduct(product) {
    document.getElementById('new-name').value = product.name || '';
    document.getElementById('new-size').value = product.size || '';
    document.getElementById('new-price').value = product.price || '';
    document.getElementById('new-rim').value = product.rim || '';
    document.getElementById('new-width').value = product.width || '';

    uploadedImageUrl = product.image || '';
    document.getElementById('upload-status').innerText = uploadedImageUrl ? '✓ Existing image loaded for update' : 'Image not uploaded yet';
	
    editingProductId = product.id;
    setFormMode(true);
    document.getElementById('admin-panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// 1. SETUP CLOUDINARY UPLOAD WIDGET
const myWidget = cloudinary.createUploadWidget({
    cloudName: 'qfx75zm9',
    uploadPreset: 'tyre_upload_preset',
}, (error, result) => {
    if (!error && result && result.event === "success") {
        uploadedImageUrl = result.info.secure_url;
        document.getElementById('upload-status').innerText = "✓ Picture Uploaded Successfully!";
    }
});

document.getElementById("upload_widget").addEventListener("click", function(e) {
    e.preventDefault();
    myWidget.open();
}, false);

// 2. RENDER PRODUCTS
function displayProducts(itemsToDisplay) {
    const grid = document.getElementById('products-grid');
    grid.innerHTML = "";

    if (itemsToDisplay.length === 0) {
        grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #666; padding: 40px;">No exact filters match. Check WhatsApp for more stock!</p>`;
        return;
    }

    itemsToDisplay.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.setAttribute('data-rim', product.rim);
        card.setAttribute('data-width', product.width);

        const adminActions = isAdminMode ? `
            <div class="product-actions" style="display:flex; gap:8px; margin-top:12px;">
                <button class="edit-btn" data-id="${product.id}" type="button" style="flex:1; background:#f5f5f5; color:#111; border:none; border-radius:4px; padding:8px 10px; cursor:pointer;">Edit</button>
                <button class="delete-btn" data-id="${product.id}" type="button" style="flex:1; background:#d32f2f; color:#fff; border:none; border-radius:4px; padding:8px 10px; cursor:pointer;">Delete</button>
            </div>
        ` : '';

        card.innerHTML = `
            <span class="badge" style="background: ${product.badgeColor || '#FF5722'}">${product.badge || 'New Stock'}</span>
            <img src="${product.image}" alt="${product.name}" class="product-img">
            <div class="product-details">
                <h3>${product.name}</h3>
                <span class="size">${product.size}</span>
                <p style="font-size: 0.8rem; color: #666;">Authentic imported stock ready for fitting.</p>
                <div class="price-row">
                    <span class="price">${product.price}</span>
                    <a href="https://wa.me/233240000000?text=I%20want%20to%20order%20${encodeURIComponent(product.name)}%20(${encodeURIComponent(product.size)})%20priced%20at%20${encodeURIComponent(product.price)}" target="_blank" class="order-btn">Order Now</a>
                </div>
                ${adminActions}
            </div>
        `;
        grid.appendChild(card);
    });
}

document.getElementById('products-grid').addEventListener('click', function(event) {
    const deleteBtn = event.target.closest('.delete-btn');
    if (deleteBtn) {
        const productId = deleteBtn.dataset.id;
        const productToDelete = products.find(product => product.id === productId);

        if (!productToDelete) return;

        const confirmDelete = confirm(`Delete ${productToDelete.name}?`);
        if (!confirmDelete) return;

        products = products.filter(product => product.id !== productId);
        saveProductsLocally();
        syncProductsToCloud().catch(error => console.error('Could not sync deleted product:', error));
        displayProducts(products);

        if (editingProductId === productId) {
            resetFormState();
        }
        return;
    }

    const editBtn = event.target.closest('.edit-btn');
    if (editBtn) {
        const productId = editBtn.dataset.id;
        const selectedProduct = products.find(product => product.id === productId);
        if (selectedProduct) {
            fillFormWithProduct(selectedProduct);
        }
    }
});

// 3. HANDLE NEW ADMIN SUBMISSION FROM PHONE/LAPTOP
document.getElementById('add-product-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    if (!uploadedImageUrl && !editingProductId) {
        alert("Please upload a picture of the tyre first!");
        return;
    }

    const formData = {
        name: document.getElementById('new-name').value,
        size: document.getElementById('new-size').value,
        price: document.getElementById('new-price').value,
        rim: document.getElementById('new-rim').value,
        width: document.getElementById('new-width').value,
        badge: "Just Arrived",
        badgeColor: "#FF5722",
        image: uploadedImageUrl || (editingProductId ? products.find(p => p.id === editingProductId)?.image : '')
    };

    if (editingProductId) {
        products = products.map(product => {
            if (product.id !== editingProductId) return product;
            return {
                ...product,
                ...formData,
                id: editingProductId
            };
        });

    } else {
        const newProduct = {
            id: `tyre-${Date.now()}`,
            ...formData
        };

        products.unshift(newProduct);
    }

    try {
        await saveProducts();
        displayProducts(products);
        alert(editingProductId ? 'Success! Tyre listing updated globally.' : 'Success! Tyre published globally to all devices.');
        resetFormState();
    } catch (error) {
        displayProducts(products);
        alert('Tyre saved on this device, but cloud sync failed. Check your JSONBin details and connection.');
        console.error('Could not sync product:', error);
    }
});

document.getElementById('cancel-edit-btn').addEventListener('click', function() {
    resetFormState();
});

// 4. FILTER FUNCTIONALITY
function filterTyres() {
    const selectedRim = document.getElementById('rim').value;
    const selectedWidth = document.getElementById('width').value;

    const filtered = products.filter(product => {
        let matchesRim = !selectedRim || product.rim === selectedRim;
        let matchesWidth = !selectedWidth || product.width === selectedWidth;
        return matchesRim && matchesWidth;
    });

    displayProducts(filtered);
    document.getElementById('catalog').scrollIntoView({ behavior: 'smooth' });
}

function setAdminAccess(authorized) {
    isAdminMode = authorized;
    localStorage.setItem('tyre_admin_access', String(authorized));

    const adminPanel = document.getElementById('admin-panel');
    const adminModal = document.getElementById('admin-login-modal');

    if (adminPanel) {
        adminPanel.classList.toggle('hidden', !authorized);
        adminPanel.classList.toggle('visible', authorized);
    }

    if (adminModal) {
        adminModal.classList.toggle('hidden', authorized);
        adminModal.classList.toggle('visible', !authorized);
    }

    displayProducts(products);

    if (authorized && adminPanel) {
        adminPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navbarMenu = document.getElementById('navbar-menu');
    const adminPanel = document.getElementById('admin-panel');
    const adminLink = document.getElementById('admin-nav-link');
    const adminModal = document.getElementById('admin-login-modal');
    const loginForm = document.getElementById('admin-login-form');
    const loginMessage = document.getElementById('admin-login-message');
    const logoutBtn = document.getElementById('admin-logout-btn');

    function closeMobileMenu() {
        if (!menuToggle || !navbarMenu) return;

        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.setAttribute('aria-label', 'Open navigation menu');
        menuToggle.classList.remove('is-open');
        navbarMenu.classList.remove('is-open');
    }

    if (menuToggle && navbarMenu) {
        menuToggle.addEventListener('click', function() {
            const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
            const icon = menuToggle.querySelector('i');

            menuToggle.setAttribute('aria-expanded', String(!isOpen));
            menuToggle.setAttribute('aria-label', isOpen ? 'Open navigation menu' : 'Close navigation menu');
            menuToggle.classList.toggle('is-open', !isOpen);
            navbarMenu.classList.toggle('is-open', !isOpen);

            if (icon) {
                icon.className = isOpen ? 'fa-solid fa-bars' : 'fa-solid fa-xmark';
            }
        });

        navbarMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', closeMobileMenu);
        });
    }

    if (isAdminMode) {
        setAdminAccess(true);
    } else if (adminPanel) {
        adminPanel.classList.add('hidden');
        adminPanel.classList.remove('visible');
    }

    if (adminLink) {
        adminLink.addEventListener('click', function(event) {
            event.preventDefault();

            if (isAdminMode) {
                setAdminAccess(true);
                return;
            }

            if (adminModal) {
                adminModal.classList.remove('hidden');
                adminModal.classList.add('visible');
            }
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const password = document.getElementById('admin-password-input').value;

            if (password === ADMIN_PASSWORD) {
                if (loginMessage) loginMessage.textContent = '';
                setAdminAccess(true);
                loginForm.reset();
                if (adminModal) {
                    adminModal.classList.add('hidden');
                    adminModal.classList.remove('visible');
                }
                if (adminPanel) {
                    adminPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            } else {
                if (loginMessage) loginMessage.textContent = 'Incorrect password. Please try again.';
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            setAdminAccess(false);
            if (adminModal) {
                adminModal.classList.remove('hidden');
                adminModal.classList.add('visible');
            }
        });
    }
});

window.onload = function() {
    fetchProducts();
    setFormMode(false);
};