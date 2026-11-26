// Configuration
const API_CONFIG = {
  primary: 'https://wasifali-sim-info.netlify.app/api/search?phone=',
  timeout: 10000,
  retries: 2
};

// Cache to avoid repeated API calls
const searchCache = new Map();

async function startSearch() {
  const query = $('#targetInput').val().trim();
  
  if (!query) {
    showAlert('Please enter CNIC or phone number!');
    return;
  }
  
  const normalizedQuery = normalizeInput(query);
  
  if (!validateInput(normalizedQuery)) {
    showAlert('Invalid format! Use CNIC (37405-1234567-8) or Phone (03##-#######)');
    return;
  }
  
  showLoader();
  
  try {
    // Check cache first
    if (searchCache.has(normalizedQuery)) {
      const cachedData = searchCache.get(normalizedQuery);
      if (cachedData.records && cachedData.records.length > 0) {
        displayData(cachedData.records[0], normalizedQuery);
      } else {
        showNotFound();
      }
      return;
    }
    
    const data = await performSearch(normalizedQuery);
    
    // Cache the result
    searchCache.set(normalizedQuery, data);
    
    if (data.records && data.records.length > 0) {
      displayData(data.records[0], normalizedQuery);
    } else {
      showNotFound();
    }
  } catch (error) {
    console.error('Search error:', error);
    showError(error.message);
  }
}

function normalizeInput(input) {
  // Remove all non-numeric characters except hyphens
  let normalized = input.replace(/[^\d-]/g, '');
  
  // Normalize CNIC: ensure format is XXXXX-XXXXXXX-X
  if (normalized.length === 13 || (normalized.length === 14 && normalized.includes('-'))) {
    const digits = normalized.replace(/-/g, '');
    if (digits.length === 13) {
      return `${digits.slice(0,5)}-${digits.slice(5,12)}-${digits.slice(12)}`;
    }
  }
  
  // Normalize Phone: ensure format is 03XX-XXXXXXX
  if (/^03\d{9}$/.test(normalized.replace(/-/g, ''))) {
    const digits = normalized.replace(/-/g, '');
    return `03${digits.slice(2,4)}-${digits.slice(4)}`;
  }
  
  return normalized;
}

function validateInput(input) {
  const cnicRegex = /^\d{5}-\d{7}-\d{1}$/;
  const phoneRegex = /^03\d{2}-\d{7}$/;
  return cnicRegex.test(input) || phoneRegex.test(input);
}

async function performSearch(query) {
  let lastError = null;
  
  for (let attempt = 0; attempt < API_CONFIG.retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);
      
      const response = await fetch(`${API_CONFIG.primary}${encodeURIComponent(query)}`, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Validate response structure
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response format');
      }
      
      return data;
    } catch (error) {
      lastError = error;
      console.warn(`Attempt ${attempt + 1} failed:`, error.message);
      
      if (attempt < API_CONFIG.retries - 1) {
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }
  
  throw lastError || new Error('Search failed');
}

function displayData(data, query) {
  // Handle different possible field names from API
  const fields = {
    name: data.nam || data.Name || data.NAME || data.name || 'N/A',
    number: data.nbr || data.Mobile || data.NUMBER || data.number || query,
    cnic: data.cni || data.CNIC || data.cnic || 'N/A',
    address: data.adr || data.Address || data.address || 'Pakistan',
    operator: data.opr || data.Operator || data.OPERATOR || data.operator || 'Unknown',
    status: data.stt || data.Status || data.STATUS || data.status || 'Active'
  };
  
  // Sanitize input to prevent XSS
  const safeName = sanitizeInput(fields.name);
  const safeNumber = sanitizeInput(fields.number);
  const safeCnic = sanitizeInput(fields.cnic);
  const safeAddress = sanitizeInput(fields.address);
  const safeOperator = sanitizeInput(fields.operator);
  const safeStatus = sanitizeInput(fields.status);
  
  const mapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(safeAddress)}&t=k&z=13&ie=UTF8&iwloc=&output=embed`;
  
  $('#resultArea').html(`
    <div class="data-card">
      <div class="result-header">
        <h3>Search Result</h3>
        <span class="query-badge">Query: ${safeNumber}</span>
      </div>
      <div class="info-row"><span class="label">Naam:</span> <span class="value">${safeName}</span></div>
      <div class="info-row"><span class="label">Number:</span> <span class="value">${safeNumber}</span></div>
      <div class="info-row"><span class="label">CNIC:</span> <span class="value">${safeCnic}</span></div>
      <div class="info-row"><span class="label">Operator:</span> <span class="value">${safeOperator}</span></div>
      <div class="info-row"><span class="label">Status:</span> <span class="value status-badge ${safeStatus.toLowerCase()}">${safeStatus}</span></div>
      <div class="info-row"><span class="label">Pata:</span> <span class="value">${safeAddress}</span></div>
      <div class="map-title"><i class="fas fa-map-marker-alt"></i> Location Map</div>
      <div class="map-container"><iframe width="100%" height="100%" frameborder="0" style="border:0" src="${mapUrl}" allowfullscreen></iframe></div>
    </div>
  `);
  
  // Add copy to clipboard buttons
  addCopyButtons();
  
  // Voice announcement
  if ('speechSynthesis' in window) {
    let utterance = new SpeechSynthesisUtterance(`Target found. ${safeName}, number ${safeNumber}, status ${safeStatus}.`);
    utterance.rate = 1.0;
    utterance.pitch = 0.8;
    window.speechSynthesis.speak(utterance);
  }
}

function addCopyButtons() {
  // Add copy functionality to key fields
  $('.value[data-copy]').each(function() {
    const value = $(this).text();
    $(this).append(`<button class="copy-btn" onclick="copyToClipboard('${value.replace(/'/g, "\\'")}')" title="Copy to clipboard"><i class="fas fa-copy"></i></button>`);
  });
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    // Visual feedback
    showToast('Copied to clipboard!');
  }).catch(err => {
    console.error('Failed to copy:', err);
  });
}

function showLoader() {
  $('#resultArea').html(`
    <div class="loader-box">
      <div class="spinner"></div>
      <div class="loader-text">Searching...</div>
      <div class="loader-subtext">Please wait, retrieving data</div>
    </div>
  `);
}

function showNotFound() {
  $('#resultArea').html(`
    <div class="not-found">
      <i class="fas fa-exclamation-circle"></i>
      <h4>Record Not Found</h4>
      <p>Ye number database mein nahi mila. Please verify the number or try a different format.</p>
      <small>Note: Database contains records up to 2023. Ensure you're using a valid Pakistani mobile number (03XX-XXXXXXX) or CNIC (XXXXX-XXXXXXX-X).</small>
    </div>
  `);
}

function showError(message) {
  $('#resultArea').html(`
    <div class="error-box">
      <i class="fas fa-exclamation-triangle"></i>
      <h4>Search Failed</h4>
      <p>${sanitizeInput(message)}</p>
      <small>Please try again or check your internet connection.</small>
    </div>
  `);
}

function showAlert(message) {
  alert(message);
}

function showToast(message) {
  const $toast = $(`<div class="toast">${message}</div>`);
  $('body').append($toast);
  
  setTimeout(() => {
    $toast.addClass('show');
    setTimeout(() => {
      $toast.removeClass('show');
      setTimeout(() => $toast.remove(), 300);
    }, 2000);
  }, 100);
}

function sanitizeInput(input) {
  if (!input) return '';
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Keyboard shortcuts
$(document).on('keypress', function(e) {
  if (e.key === 'Enter' && $(e.target).is('#targetInput')) {
    startSearch();
  }
});

// Auto-focus input on page load
$(document).ready(function() {
  $('#targetInput').focus();
});
