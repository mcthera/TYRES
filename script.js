// 1. INVENTORY DATA ARRAY (Easily add images, prices, and specs here!)
const products = [
    {
        name: "Bridgestone Ecopia",
        size: "Size: 205/60 R16",
        price: "GH₵ 1,450",
        rim: "16",
        width: "205",
        badge: "Best Seller",
        badgeColor: "#FF5722", // Orange
        image: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=500&q=80",
        description: "High fuel efficiency & long tread life."
    },
    {
        name: "Michelin Primacy SUV",
        size: "Size: 225/65 R17",
        price: "GH₵ 2,100",
        rim: "17",
        width: "225",
        badge: "SUV Special",
        badgeColor: "#333333", // Dark
        image: "https://images.unsplash.com/photo-1543465077-db45d34b87a5?auto=format&fit=crop&w=500&q=80",
        description: "Superior wet braking and smooth comfort."
    },
    {
        name: "Triangle All-Season",
        size: "Size: 195/65 R15",
        price: "GH₵ 880",
        rim: "15",
        width: "195",
        badge: "Budget Pick",
        badgeColor: "#2e7d32", // Green
        image: "https://images.unsplash.com/photo-1607860108855-64c2079ed3f4?auto=format&fit=crop&w=500&q=80",
        description: "Great grip and heavy load endurance."
    },
    {
        name: "Dunlop Grandtrek",
        size: "Size: 225/55 R18",
        price: "GH₵ 2,400",
        rim: "18",
        width: "225",
        badge: "Heavy Duty",
        badgeColor: "#FF5722",
        image: "https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=500&q=80",
        description: "Built for rugged performance and safety."
    }
];

// 2. RENDER PRODUCTS INTO HTML DYNAMICALLY
function displayProducts(itemsToDisplay) {
    const grid = document.getElementById('products-grid');
    grid.innerHTML = ""; // Clear grid

    if (itemsToDisplay.length === 0) {
        grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #666; padding: 40px;">No exact filter matches found. Contact us on WhatsApp for custom sizes!</p>`;
        return;
    }

    itemsToDisplay.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.setAttribute('data-rim', product.rim);
        card.setAttribute('data-width', product.width);

        card.innerHTML = `
            <span class="badge" style="background: ${product.badgeColor}">${product.badge}</span>
            <img src="${product.image}" alt="${product.name}" class="product-img">
            <div class="product-details">
                <h3>${product.name}</h3>
                <span class="size">${product.size}</span>
                <p style="font-size: 0.8rem; color: #666;">${product.description}</p>
                <div class="price-row">
                    <span class="price">${product.price}</span>
                    <a href="https://wa.me/233240000000?text=I%20want%20to%20order%20${encodeURIComponent(product.name)}%20(${encodeURIComponent(product.size)})%20priced%20at%20${encodeURIComponent(product.price)}" target="_blank" class="order-btn">Order Now</a>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// 3. FILTER FUNCTIONALITY FOR THE SEARCH WIDGET
function filterTyres() {
    const selectedRim = document.getElementById('rim').value;
    const selectedWidth = document.getElementById('width').value;

    const filtered = products.filter(product => {
        let matchesRim = !selectedRim || product.rim === selectedRim;
        let matchesWidth = !selectedWidth || product.width === selectedWidth;
        return matchesRim && matchesWidth;
    });

    displayProducts(filtered);

    // Smooth scroll to catalog results
    document.getElementById('catalog').scrollIntoView({ behavior: 'smooth' });
}

// Load all products automatically when page opens
window.onload = function() {
    displayProducts(products);
};