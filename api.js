const API_URL = 'https://junaidv3.freepage.cc/view.php?site=2k25data&q=';

async function startSearch() {
  const query = $('#targetInput').val().trim();
  
  if (!query) {
    alert('Please enter CNIC or phone number!');
    return;
  }
  
  if (!validateInput(query)) {
    alert('Invalid format! Use CNIC (37405-1234567-8) or Phone (03##-#######)');
    return;
  }
  
  showLoader();
  
  try {
    const response = await fetch(`${API_URL}${encodeURIComponent(query)}`);
    
    if (!response.ok) {
      throw new Error('API response not ok');
    }
    
    const data = await response.json();
    
    if (data.records && data.records.length > 0) {
      displayData(data.records[0], query);
    } else {
      showNotFound();
    }
  } catch (error) {
    console.error('Error:', error);
    await fallbackSearch(query);
  }
}

function validateInput(input) {
  const cnicRegex = /^\d{5}-\d{7}-\d{1}$/;
  const phoneRegex = /^03\d{2}-\d{7}$/;
  return cnicRegex.test(input) || phoneRegex.test(input);
}

function displayData(data, query) {
  const name = data.nam || data.Name || data.NAME || 'N/A';
  const number = data.nbr || data.Mobile || data.NUMBER || query;
  const cnic = data.cni || data.CNIC || 'N/A';
  const address = data.adr || data.Address || 'Pakistan';
  
  const mapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(address)}&t=k&z=13&ie=UTF8&iwloc=&output=embed`;
  
  $('#resultArea').html(`
    <div class="data-card">
      <div class="info-row"><span class="label">Naam:</span> <span class="value">${name}</span></div>
      <div class="info-row"><span class="label">Number:</span> <span class="value">${number}</span></div>
      <div class="info-row"><span class="label">CNIC:</span> <span class="value">${cnic}</span></div>
      <div class="info-row"><span class="label">Pata:</span> <span class="value">${address}</span></div>
      <div class="map-title"><i class="fas fa-map-marker-alt"></i> Location Map</div>
      <div class="map-container"><iframe width="100%" height="100%" frameborder="0" style="border:0" src="${mapUrl}" allowfullscreen></iframe></div>
    </div>
  `);
  
  if ('speechSynthesis' in window) {
    let utterance = new SpeechSynthesisUtterance("Target found successfully in database.");
    utterance.rate = 1.0;
    utterance.pitch = 0.8;
    window.speechSynthesis.speak(utterance);
  }
}

function showLoader() {
  $('#resultArea').html('<div class="loader-box"><div class="spinner"></div>please wait......Data searching</div>');
}

function showNotFound() {
  $('#resultArea').html('<div class="not-found">ye nmber 2023 ka bd register hua hy please 2023 tk ka number enter kryn</div>');
}

async function fallbackSearch(query) {
  try {
    const response = await fetch(`${API_URL}${encodeURIComponent(query)}`);
    const data = await response.json();
    
    if (data.records && data.records.length > 0) {
      displayData(data.records[0], query);
    } else {
      showNotFound();
    }
  } catch (error) {
    showNotFound();
  }
}
