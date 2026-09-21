function filterTyres() {
    const selectedRim = document.getElementById('rim').value;
    const selectedWidth = document.getElementById('width').value;
    const cards = document.querySelectorAll('.product-card');

    let matchCount = 0;

    cards.forEach(card => {
        const cardRim = card.getAttribute('data-rim');
        const cardWidth = card.getAttribute('data-width');

        let matchesRim = !selectedRim || cardRim === selectedRim;
        let matchesWidth = !selectedWidth || cardWidth === selectedWidth;

        if (matchesRim && matchesWidth) {
            card.style.display = "block";
            matchCount++;
        } else {
            card.style.display = "none";
        }
    });

    // Scroll down smoothly to catalog to show results
    document.getElementById('catalog').scrollIntoView({ behavior: 'smooth' });
    
    if (matchCount === 0) {
        alert("No exact filter match found in the quick view, but contact us on WhatsApp—we stock all sizes in our physical warehouse!");
    }
}