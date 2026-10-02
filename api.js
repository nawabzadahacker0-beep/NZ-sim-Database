var _0x53a2 = [
    '#targetInput',
    'val',
    'trim',
    'please enter Cnic or phone Number!',
    '#resultArea',
    'html',
    '<div class="loader-box"><div class="spinner"></div>please wait......Data searching</div>',
    'https:///?search=',
    'json',
    'ok',
    'data',
    'records',
    'https:/?search=',
    '<div class="not-found">ye nmber 2023 ka bd register hua hy please 2023 tk ka number enter kryn</div>',
    'nam',
    'Name',
    'NAME',
    'N/A',
    'nbr',
    'Mobile',
    'NUMBER',
    'cni',
    'CNIC',
    'adr',
    'Address',
    'Pakistan',
    'https://maps.google.com/maps?q=',
    '&t=k&z=13&ie=UTF8&iwloc=&output=embed',
    '<div class="data-card"><div class="info-row"><span class="label">Naam:</span> <span class="value">',
    '</span></div><div class="info-row"><span class="label">Number:</span> <span class="value">',
    '</span></div><div class="info-row"><span class="label">CNIC:</span> <span class="value">',
    '</span></div><div class="info-row"><span class="label">Pata:</span> <span class="value">',
    '</span></div><div class="map-title"><i class="fas fa-map-marker-alt"></i> Location Map</div><div class="map-container"><iframe width="100%" height="100%" frameborder="0" style="border:0" src="',
    '" allowfullscreen></iframe></div></div>'
];

function _0x2bc4(_0x3c2a61) {
    return _0x53a2[_0x3c2a61];
}

function displayData(_0x1a2b3c, _0x4d5e6f) {
    const _0x1 = _0x1a2b3c[_0x2bc4(14)] || _0x1a2b3c[_0x2bc4(15)] || _0x1a2b3c[_0x2bc4(16)] || _0x2bc4(17);
    const _0x2 = _0x1a2b3c[_0x2bc4(18)] || _0x1a2b3c[_0x2bc4(19)] || _0x1a2b3c[_0x2bc4(20)] || _0x4d5e6f;
    const _0x3 = _0x1a2b3c[_0x2bc4(21)] || _0x1a2b3c[_0x2bc4(22)] || _0x2bc4(17);
    const _0x4 = _0x1a2b3c[_0x2bc4(23)] || _0x1a2b3c[_0x2bc4(24)] || _0x2bc4(25);
    const _0x5 = _0x2bc4(26) + encodeURIComponent(_0x4) + _0x2bc4(27);

    $(_0x2bc4(4))[_0x2bc4(5)](
        _0x2bc4(28) + _0x1 + _0x2bc4(29) + _0x2 + _0x2bc4(30) + _0x3 + _0x2bc4(31) + _0x4 + _0x2bc4(32) + _0x5 + _0x2bc4(33)
    );
    if ('speechSynthesis' in window) {
        let utterance = new SpeechSynthesisUtterance("Target found successfully in database.");
        utterance.rate = 1.0;
        utterance.pitch = 0.8; 
        window.speechSynthesis.speak(utterance);
    }
}

function showLoader() {
    $(_0x2bc4(4))[_0x2bc4(5)](_0x2bc4(6));
}

function showNotFound() {
    $(_0x2bc4(4))[_0x2bc4(5)](_0x2bc4(13));
}

async function startSearch() {
    const _0xquery = $(_0x2bc4(0))[_0x2bc4(1)]()[_0x2bc4(2)]();
    if (!_0xquery) {
        alert(_0x2bc4(3));
        return;
    }

    showLoader();

    try {
        const _0xresp1 = await fetch(_0x2bc4(7) + encodeURIComponent(_0xquery));
        const _0xres1 = await _0xresp1[_0x2bc4(8)]();

        if (_0xres1 && _0xres1[_0x2bc4(10)] && Array.isArray(_0xres1[_0x2bc4(10)]) && _0xres1[_0x2bc4(10)].length > 0) {
            displayData(_0xres1[_0x2bc4(10)][0], _0xquery);
        } else {
            await fallbackSearch(_0xquery);
        }
    } catch (_0xerr) {
        await fallbackSearch(_0xquery);
    }
}

async function fallbackSearch(_0xquery) {
    try {
        const _0xresp2 = await fetch(_0x2bc4(12) + encodeURIComponent(_0xquery));
        const _0xres2 = await _0xresp2[_0x2bc4(8)]();

        let found = false;
        if (_0xres2 && _0xres2[_0x2bc4(10)] && Array.isArray(_0xres2[_0x2bc4(10)]) && _0xres2[_0x2bc4(10)].length > 0) {
            displayData(_0xres2[_0x2bc4(10)][0], _0xquery);
            found = true;
        }

        if (!found) {
            showNotFound();
        }
    } catch (_0xe) {
        showNotFound();
    }
}
