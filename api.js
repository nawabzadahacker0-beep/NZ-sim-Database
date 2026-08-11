// Result display
function displayData(data, query) {
    const name = data.full_name || data.Name || data.NAME || 'N/A';
    const phone = data.phone || data.Mobile || data.NUMBER || query;
    const cnic = data.cnic || data.CNIC || 'N/A';
    const address = data.address || data.Address || 'Pakistan';

    const mapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(address)}&t=k&z=13&ie=UTF8&iwloc=&output=embed`;

    $('#resultArea').html(`
        <div class="data-card">
            <div class="info-row"><span class="label">Naam:</span> <span class="value">${name}</span></div>
            <div class="info-row"><span class="label">Number:</span> <span class="value">${phone}</span></div>
            <div class="info-row"><span class="label">CNIC:</span> <span class="value">${cnic}</span></div>
            <div class="info-row"><span class="label">Pata:</span> <span class="value">${address}</span></div>
            <div class="map-title"><i class="fas fa-map-marker-alt"></i> Location Map</div>
            <div class="map-container">
                <iframe width="100%" height="100%" frameborder="0" style="border:0" src="${mapUrl}" allowfullscreen></iframe>
            </div>
        </div>
    `);
}

// Loading box
function showLoader() {
    $('#resultArea').html(`
        <div class="loader-box">
            <div class="spinner"></div>
            Search ho raha hai... Barah-e-karam intazar karein
        </div>
    `);
}

// Not found message
function showNotFound() {
    $('#resultArea').html('<div class="not-found">Data nahi mila! Dobara try karein</div>');
}

// Main search function
async function startSearch() {
    const query = $('#targetInput').val().trim();
    if (!query) {
        alert('Pehle number ya CNIC likhein!');
        return;
    }

    showLoader();
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
        const resp1 = await fetch(`https://famofc.site/api/database.php?q=${query}`);
        const res1 = await resp1.json();

        if (res1.success && res1.data && res1.data.records && res1.data.records.length > 0) {
            displayData(res1.data.records[0], query);
        } else {
            await fallbackSearch(query);
        }
    } catch (error) {
        await fallbackSearch(query);
    }
}

// Fallback API
async function fallbackSearch(query) {
    try {
        const resp2 = await fetch(`https://wasifali-sim-info.netlify.app/api/search?phone=${query}`);
        const res2 = await resp2.json();

        if (res2 && res2.records && res2.records.length > 0) {
            displayData(res2.records[0], query);
        } else {
            showNotFound();
        }
    } catch (e) {
        showNotFound();
    }
}
