// Lead Finder — finds businesses with contact info but no website.
// Live data: Nominatim (geocoding) + Overpass API (OpenStreetMap business listings).

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
];

const NOMINATIM = 'https://nominatim.openstreetmap.org/search';

// Each category maps to one or more Overpass tag selectors.
const CATEGORIES = {
  all: {
    label: 'All business types',
    selectors: [
      '["shop"]',
      '["craft"]',
      '["office"]',
      '["healthcare"]',
      '["amenity"~"restaurant|cafe|fast_food|bar|pub|ice_cream|dentist|doctors|clinic|pharmacy|veterinary|car_wash|car_rental|driving_school|childcare|kindergarten|bank|fuel"]',
      '["leisure"~"fitness_centre|sports_centre|dance"]',
      '["tourism"~"hotel|guest_house|motel|bed_and_breakfast"]',
    ],
  },
  food: {
    label: 'Restaurants & food',
    selectors: [
      '["amenity"~"restaurant|cafe|fast_food|bar|pub|ice_cream"]',
      '["shop"~"bakery|butcher|deli|confectionery|coffee|greengrocer|convenience"]',
    ],
  },
  beauty: {
    label: 'Beauty & wellness',
    selectors: [
      '["shop"~"hairdresser|beauty|massage|tattoo|cosmetics"]',
      '["leisure"="spa"]',
    ],
  },
  trades: {
    label: 'Trades & contractors',
    selectors: ['["craft"]'],
  },
  auto: {
    label: 'Auto services',
    selectors: [
      '["shop"~"car_repair|car|car_parts|tyres|motorcycle"]',
      '["amenity"~"car_wash|fuel"]',
    ],
  },
  health: {
    label: 'Health & medical',
    selectors: [
      '["amenity"~"dentist|doctors|clinic|pharmacy|veterinary"]',
      '["healthcare"]',
    ],
  },
  professional: {
    label: 'Professional services',
    selectors: ['["office"]'],
  },
  retail: {
    label: 'Retail shops',
    selectors: ['["shop"]'],
  },
  fitness: {
    label: 'Fitness & sports',
    selectors: [
      '["leisure"~"fitness_centre|sports_centre|dance"]',
      '["shop"="sports"]',
    ],
  },
  pets: {
    label: 'Pet services',
    selectors: [
      '["shop"~"pet|pet_grooming"]',
      '["amenity"="veterinary"]',
    ],
  },
  lodging: {
    label: 'Hotels & lodging',
    selectors: ['["tourism"~"hotel|guest_house|motel|bed_and_breakfast"]'],
  },
};

const WEBSITE_ABSENT = '[!"website"][!"contact:website"][!"url"]';
const CONTACT_TAGS = ['"phone"', '"contact:phone"', '"email"', '"contact:email"'];

const $ = (id) => document.getElementById(id);
let currentLeads = [];
let currentPlace = '';

function init() {
  const catSelect = $('category');
  for (const [key, cat] of Object.entries(CATEGORIES)) {
    const opt = document.createElement('option');
    opt.value = key;
    opt.textContent = cat.label;
    catSelect.appendChild(opt);
  }
  $('search-form').addEventListener('submit', onSearch);
  $('export-btn').addEventListener('click', exportCsv);
}

function setStatus(msg, isError = false) {
  const el = $('status');
  el.textContent = msg;
  el.classList.toggle('error', isError);
}

async function onSearch(e) {
  e.preventDefault();
  const btn = $('search-btn');
  btn.disabled = true;
  btn.textContent = 'Searching…';
  $('results-section').classList.add('hidden');
  try {
    setStatus('Looking up location…');
    const place = await geocode($('location').value.trim());
    currentPlace = place.display_name;

    setStatus(`Pulling live business data near ${shortPlace(place.display_name)}…`);
    const elements = await queryOverpass(
      CATEGORIES[$('category').value],
      Number($('radius').value),
      place.lat,
      place.lon
    );

    const leads = buildLeads(elements, $('contact-mode').value);
    currentLeads = leads;
    render(leads);
    setStatus(leads.length
      ? `Done — ${leads.length} business${leads.length === 1 ? '' : 'es'} with no website near ${shortPlace(place.display_name)}.`
      : 'Done — no matching businesses found. Try widening the radius or changing filters.');
  } catch (err) {
    setStatus(err.message || 'Something went wrong. Please try again.', true);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Find Leads';
  }
}

async function geocode(query) {
  const url = `${NOMINATIM}?format=json&limit=1&q=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error('Location lookup failed — please try again in a moment.');
  const data = await res.json();
  if (!data.length) throw new Error(`Couldn't find "${query}". Try "City, State" or a zip code.`);
  return data[0];
}

function buildQuery(category, radius, lat, lon) {
  const lines = [];
  for (const sel of category.selectors) {
    for (const contact of CONTACT_TAGS) {
      lines.push(`  nwr${sel}${WEBSITE_ABSENT}[${contact}](around:${radius},${lat},${lon});`);
    }
  }
  return `[out:json][timeout:90];\n(\n${lines.join('\n')}\n);\nout center 600;`;
}

async function queryOverpass(category, radius, lat, lon) {
  const query = buildQuery(category, radius, lat, lon);
  let lastErr;
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        body: 'data=' + encodeURIComponent(query),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      if (!res.ok) throw new Error(`Overpass returned ${res.status}`);
      const data = await res.json();
      return data.elements || [];
    } catch (err) {
      lastErr = err;
    }
  }
  throw new Error(`Couldn't reach the live data servers (${lastErr?.message}). They rate-limit heavy use — wait a minute and retry.`);
}

function pick(tags, ...keys) {
  for (const k of keys) if (tags[k]) return tags[k];
  return '';
}

function categoryLabel(tags) {
  const raw = pick(tags, 'craft', 'shop', 'amenity', 'healthcare', 'office', 'leisure', 'tourism', 'cuisine');
  return raw ? raw.replace(/_/g, ' ').replace(/;.*/, '') : 'business';
}

function buildAddress(tags) {
  const street = [tags['addr:housenumber'], tags['addr:street']].filter(Boolean).join(' ');
  return [street, tags['addr:city'], tags['addr:state'], tags['addr:postcode']]
    .filter(Boolean).join(', ');
}

function buildLeads(elements, contactMode) {
  const seen = new Set();
  const leads = [];
  for (const el of elements) {
    const tags = el.tags || {};
    const name = tags.name || tags.brand;
    if (!name) continue;

    const phone = pick(tags, 'phone', 'contact:phone', 'contact:mobile');
    const email = pick(tags, 'email', 'contact:email');
    if (contactMode === 'phone' && !phone) continue;
    if (contactMode === 'email' && !email) continue;
    if (contactMode === 'both' && !(phone && email)) continue;
    if (!phone && !email) continue;

    // Same business can appear as both a node and a building outline.
    const dupKey = `${name.toLowerCase()}|${phone || email}`;
    if (seen.has(dupKey)) continue;
    seen.add(dupKey);

    const social = pick(tags, 'contact:facebook', 'facebook', 'contact:instagram', 'instagram');
    const lat = el.lat ?? el.center?.lat;
    const lon = el.lon ?? el.center?.lon;
    leads.push({
      name,
      category: categoryLabel(tags),
      phone,
      email,
      address: buildAddress(tags),
      social,
      osmUrl: `https://www.openstreetmap.org/${el.type}/${el.id}`,
      mapUrl: lat != null ? `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=18/${lat}/${lon}` : '',
      verifyUrl: `https://www.google.com/search?q=${encodeURIComponent(`"${name}" ${buildAddress(tags) || shortPlace(currentPlace)}`)}`,
    });
  }
  // Best leads first: phone + email, then phone, then email.
  leads.sort((a, b) => score(b) - score(a) || a.name.localeCompare(b.name));
  return leads;
}

const score = (l) => (l.phone ? 2 : 0) + (l.email ? 1 : 0);

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

function shortPlace(displayName) {
  return displayName.split(',').slice(0, 2).join(',').trim();
}

function socialUrl(social) {
  if (/^https?:\/\//.test(social)) return social;
  return `https://www.facebook.com/${social}`;
}

function render(leads) {
  $('stat-total').textContent = leads.length;
  $('stat-phone').textContent = leads.filter((l) => l.phone).length;
  $('stat-email').textContent = leads.filter((l) => l.email).length;
  $('stat-both').textContent = leads.filter((l) => l.phone && l.email).length;

  const body = $('results-body');
  body.innerHTML = leads.map((l) => `
    <tr>
      <td class="biz-name">${esc(l.name)}${l.phone && l.email ? ' <span class="badge badge-hot">hot</span>' : ''}</td>
      <td>${esc(l.category)}</td>
      <td>${l.phone ? `<a href="tel:${esc(l.phone)}">${esc(l.phone)}</a>` : '<span class="muted">—</span>'}</td>
      <td>${l.email ? `<a href="mailto:${esc(l.email)}">${esc(l.email)}</a>` : '<span class="muted">—</span>'}</td>
      <td>${l.address ? esc(l.address) : '<span class="muted">—</span>'}</td>
      <td>${l.social
        ? `<a class="badge badge-social" href="${esc(socialUrl(l.social))}" target="_blank" rel="noopener">social only</a>`
        : '<span class="badge badge-none">no web presence</span>'}</td>
      <td class="links-cell">
        ${l.mapUrl ? `<a href="${esc(l.mapUrl)}" target="_blank" rel="noopener">Map</a>` : ''}
        <a href="${esc(l.verifyUrl)}" target="_blank" rel="noopener">Verify</a>
        <a href="${esc(l.osmUrl)}" target="_blank" rel="noopener">Source</a>
      </td>
    </tr>`).join('');

  $('empty-msg').classList.toggle('hidden', leads.length > 0);
  $('results-section').classList.remove('hidden');
}

function exportCsv() {
  const header = ['Business', 'Field', 'Phone', 'Email', 'Address', 'Online presence', 'Map', 'Source'];
  const rows = currentLeads.map((l) => [
    l.name, l.category, l.phone, l.email, l.address,
    l.social ? 'social media only' : 'none found',
    l.mapUrl, l.osmUrl,
  ]);
  const csv = [header, ...rows]
    .map((row) => row.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\r\n');
  // BOM so Excel opens it as UTF-8.
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `leads-no-website-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

if (typeof document !== 'undefined') init();
