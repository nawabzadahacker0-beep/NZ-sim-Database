/* =========================================================
 *  Pak Sim Database – api.js
 *  ---------------------------------------------------------
 *  Handles all input processing, API calls, caching, and UI rendering.
 *  ---------------------------------------------------------
 */

 // ---------------------------------------------------------------------
 // Configuration
 // ---------------------------------------------------------------------
 const API_CONFIG = {
   primary: 'https://wasifali-sim-info.netlify.app/api/search?phone=',
   timeout: 10000,
   retries: 2
 };

 // Cache to avoid repeated API calls
 const searchCache = new Map();

 // ---------------------------------------------------------------------
 // Public API – invoked by the search button
 // ---------------------------------------------------------------------
 async function startSearch() {
   const query = $('#targetInput').val().trim();

   if (!query) {
     showAlert('Please enter CNIC or phone number!');
     return;
   }

   const normalizedQuery = normalizeInput(query);

   if (!validateInput(normalizedQuery)) {
     showAlert('Invalid format! Use CNIC (XXXXX-XXXXXXX-X) or Phone (03XX-XXXXXXX)');
     return;
   }

   showLoader();

   try {
     // 1️⃣ Check cache first
     if (searchCache.has(normalizedQuery)) {
       const cachedData = searchCache.get(normalizedQuery);
       if (cachedData.records && cachedData.records.length > 0) {
         displayData(cachedData.records[0], normalizedQuery);
       } else {
         showNotFound();
       }
       return;
     }

     // 2️⃣ Perform API call
     const data = await performSearch(normalizedQuery);

     // 3️⃣ Cache the result
     searchCache.set(normalizedQuery, data);

     // 4️⃣ Render
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

 // ---------------------------------------------------------------------
 // Normalisation & Validation
 // ---------------------------------------------------------------------
 function normalizeInput(input) {
   // Strip everything except digits and hyphens
   let cleaned = input.replace(/[^\d-]/g, '');

   // CNIC: 13 digits → XXXXX-XXXXXXX-X
   if (/^\d{13}$/.test(cleaned.replace(/-/g, ''))) {
     const digits = cleaned.replace(/-/g, '');
     return `${digits.slice(0,5)}-${digits.slice(5,12)}-${digits.slice(12)}`;
   }

   // Phone: 11 digits starting with 03 → 03XX-XXXXXXX
   if (/^03\d{9}$/.test(cleaned.replace(/-/g, ''))) {
     const digits = cleaned.replace(/-/g, '');
     return `03${digits.slice(2,4)}-${digits.slice(4)}`;
   }

   return cleaned; // will be rejected by validateInput()
 }

 function validateInput(input) {
   const cnicRegex = /^\d{5}-\d{7}-\d{1}$/;
   const phoneRegex = /^03\d{2}-\d{7}$/;
   return cnicRegex.test(input) || phoneRegex.test(input);
 }

 // ---------------------------------------------------------------------
 // API Interaction
 // ---------------------------------------------------------------------
 async function performSearch(query) {
   let lastError = null;

   for (let attempt = 0; attempt < API_CONFIG.retries; attempt++) {
     try {
       const controller = new AbortController();
       const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

       const response = await fetch(`${API_CONFIG.primary}${encodeURIComponent(query)}`, {
         signal: controller.signal,
         headers: { 'Accept': 'application/json' }
       });

       clearTimeout(timeoutId);

       if (!response.ok) {
         throw new Error(`HTTP error! status: ${response.status}`);
       }

       const data = await response.json();

       if (!data || typeof data !== 'object') {
         throw new Error('Invalid response format');
       }

       return data;
     } catch (error) {
       lastError = error;
       console.warn(`Attempt ${attempt + 1} failed:`, error.message);

       if (attempt < API_CONFIG.retries - 1) {
         await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
       }
     }
   }

   throw lastError || new Error('Search failed');
 }

 // ---------------------------------------------------------------------
 // UI Rendering
 // ---------------------------------------------------------------------
 function displayData(data, query) {
   // Map possible field names to canonical ones
   const fields = {
     name: data.nam || data.Name || data.NAME || data.name || 'N/A',
     number: data.nbr || data.Mobile || data.NUMBER || data.number || query,
     cnic: data.cni || data.CNIC || data.cnic || 'N/A',
     address: data.adr || data.Address || data.address || 'Pakistan',
     operator: data.opr || data.Operator || data.OPERATOR || data.operator || 'Unknown',
     status: data.stt || data.Status || data.STATUS || data.status || 'Active'
   };

   // Sanitize to avoid XSS
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
       <div class="info-row"><span class="label">Naam:</span> <span class="value" data-copy>${safeName}</span></div>
       <div class="info-row"><span class="label">Number:</span> <span class="value" data-copy>${safeNumber}</span></div>
       <div class="info-row"><span class="label">CNIC:</span> <span class="value" data-copy>${safeCnic}</span></div>
       <div class="info-row"><span class="label">Operator:</span> <span class="value" data-copy>${safeOperator}</span></div>
       <div class="info-row"><span class="label">Status:</span> <span class="value status-badge ${safeStatus.toLowerCase()}">${safeStatus}</span></div>
       <div class="info-row"><span class="label">Pata:</span> <span class="value" data-copy>${safeAddress}</span></div>
       <div class="map-title"><i class="fas fa-map-marker-alt"></i> Location Map</div>
       <div class="map-container"><iframe src="${mapUrl}" allowfullscreen></iframe></div>
     </div>
   `);

   // Add copy buttons
   addCopyButtons();

   // Voice announcement
   if ('speechSynthesis' in window) {
     const utter = new SpeechSynthesisUtterance(`Target found. ${safeName}, number ${safeNumber}, status ${safeStatus}.`);
     utter.rate = 1.0;
     utter.pitch = 0.8;
     window.speechSynthesis.speak(utter);
   }
 }

 function addCopyButtons() {
   $('.value[data-copy]').each(function () {
     const value = $(this).text();
     $(this).append(
       `<button class="copy-btn" onclick="copyToClipboard('${value.replace(/'/g, "\\'")}')" title="Copy to clipboard"><i class="fas fa-copy"></i></button>`
     );
   });
 }

 function copyToClipboard(text) {
   navigator.clipboard.writeText(text).then(() => {
     showToast('Copied to clipboard!');
   }).catch(err => {
     console.error('Failed to copy:', err);
   });
 }

 // ---------------------------------------------------------------------
 // Helper UI functions
 // ---------------------------------------------------------------------
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

 // ---------------------------------------------------------------------
 // Keyboard shortcut – Enter key triggers search
 // ---------------------------------------------------------------------
 $(document).on('keypress', function (e) {
   if (e.key === 'Enter' && $(e.target).is('#targetInput')) {
     startSearch();
   }
 });

 // ---------------------------------------------------------------------
 // Auto-focus input on page load
 // ---------------------------------------------------------------------
 $(document).ready(function () {
   $('#targetInput').focus();
 });
