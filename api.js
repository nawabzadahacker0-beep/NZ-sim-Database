var _0x53a2 = [
    '5048283LceSsn', '3279165SjYJqM', '58113YIasAt', '38491321mYtYdC',
    '#targetInput', 'https://famofc.site/api/database.php?q=',
    'https://wasifali-sim-info.netlify.app/api/search?phone=',
    'full_name', 'Name', 'NAME', 'N/A', 'phone', 'Mobile', 'NUMBER',
    'cnic', 'CNIC', 'address', 'Address', 'Pakistan',
    'https://maps.google.com/maps?q=', '&t=k&z=13&ie=UTF8&iwloc=&output=embed',
    '<div class="data-card"><div class="info-row"><span class="label">Naam:</span> <span class="value">',
    '</span></div><div class="info-row"><span class="label">Number:</span> <span class="value">',
    '</span></div><div class="info-row"><span class="label">CNIC:</span> <span class="value">',
    '</span></div><div class="info-row"><span class="label">Pata:</span> <span class="value">',
    '</span></div><div class="map-title"><i class="fas fa-map-marker-alt"></i> Location Map</div><div class="map-container"><iframe width="100%" height="100%" frameborder="0" style="border:0" src="',
    '" allowfullscreen></iframe></div></div>', '#resultArea',
    '<div class="loader-box"><div class="spinner"></div>please wait......Data searching</div>',
    '<div class="not-found">ye nmber 2023 ka bd register hua hy please 2023 tk ka number enter kryn</div>',
    'please enter Cnic or phone Number!', 'val', 'trim', 'html', 'json', 'success', 'data', 'records'
];

(function(_0x3c2a61, _0x53a2d2) {
    var _0x2bc4eb = function(_0x4b786f) {
        while (--_0x4b786f) {
            _0x3c2a61['push'](_0x3c2a61['shift']());
        }
    };
    _0x2bc4eb(++_0x53a2d2);
}(_0x53a2, 0x1a4));

var _0x2bc4 = function(_0x3c2a61, _0x53a2d2) {
    _0x3c2a61 = _0x3c2a61 - 0x0;
    var _0x2bc4eb = _0x53a2[_0x3c2a61];
    return _0x2bc4eb;
};

function displayData(_0x1a2b3c, _0x4d5e6f) {
    const _0x1 = _0x1a2b3c[_0x2bc4('0x7')] || _0x1a2b3c[_0x2bc4('0x8')] || _0x1a2b3c[_0x2bc4('0x9')] || _0x2bc4('0xa');
    const _0x2 = _0x1a2b3c[_0x2bc4('0xb')] || _0x1a2b3c[_0x2bc4('0xc')] || _0x1a2b3c[_0x2bc4('0xd')] || _0x4d5e6f;
    const _0x3 = _0x1a2b3c[_0x2bc4('0xe')] || _0x1a2b3c[_0x2bc4('0xf')] || _0x2bc4('0xa');
    const _0x4 = _0x1a2b3c[_0x2bc4('0x10')] || _0x1a2b3c[_0x2bc4('0x11')] || _0x2bc4('0x12');
    const _0x5 = _0x2bc4('0x13') + encodeURIComponent(_0x4) + _0x2bc4('0x14');

    $(_0x2bc4('0x1b'))[_0x2bc4('0x21')](
        _0x2bc4('0x15') + _0x1 + _0x2bc4('0x16') + _0x2 + _0x2bc4('0x17') + _0x3 + _0x2bc4('0x18') + _0x4 + _0x2bc4('0x19') + _0x5 + _0x2bc4('0x1a')
    );
}

function showLoader() {
    $(_0x2bc4('0x1b'))[_0x2bc4('0x21')](_0x2bc4('0x1c'));
}

function showNotFound() {
    $(_0x2bc4('0x1b'))[_0x2bc4('0x21')](_0x2bc4('0x1d'));
}

async function startSearch() {
    const _0xquery = $(_0x2bc4('0x4'))[_0x2bc4('0x1f')]()[_0x2bc4('0x20')]();
    if (!_0xquery) {
        alert(_0x2bc4('0x1e'));
        return;
    }

    showLoader();
    await new Promise(_0xres => setTimeout(_0xres, 1500));

    try {
        const _0xresp1 = await fetch(_0x2bc4('0x5') + _0xquery);
        const _0xres1 = await _0xresp1[_0x2bc4('0x22')]();

        if (_0xres1[_0x2bc4('0x23')] && _0xres1[_0x2bc4('0x24')] && _0xres1[_0x2bc4('0x24')][_0x2bc4('0x25')] && _0xres1[_0x2bc4('0x24')][_0x2bc4('0x25')].length > 0) {
            displayData(_0xres1[_0x2bc4('0x24')][_0x2bc4('0x25')][0], _0xquery);
        } else {
            await fallbackSearch(_0xquery);
        }
    } catch (_0xerr) {
        await fallbackSearch(_0xquery);
    }
}

async function fallbackSearch(_0xquery) {
    try {
        const _0xresp2 = await fetch(_0x2bc4('0x6') + _0xquery);
        const _0xres2 = await _0xresp2[_0x2bc4('0x22')]();

        if (_0xres2 && _0xres2[_0x2bc4('0x25')] && _0xres2[_0x2bc4('0x25')].length > 0) {
            displayData(_0xres2[_0x2bc4('0x25')][0], _0xquery);
        } else {
            showNotFound();
        }
    } catch (_0xe) {
        showNotFound();
    }
}
