const fetch = require("node-fetch");


const photonEndpoint = "https://photon.komoot.io/api/";

const nominatimSearch = 'https://nominatim.openstreetmap.org/search';


async function photonAutocomplete(q, limit = 5) {

    if(!q){
        return [];
    }

    const url = `${photonEndpoint}?q=${encodeURIComponent(q)}&limit=${limit}`;

    try {
        const res = await fetch(url, {headers: {'User-Agent': 'RideSharingApp/1.0'}});

        if(!res.ok) throw new Error('Failed to fetch from Photon API');

        const json =  await res.json();

        return (json.features || []).map(f => ({
            display_name:
                f.properties.name ||
                f.properties.street ||
                f.properties.city ||
                f.properties.label ||
                "unknown place",
            lat: f.geometry.coordinates[1],
            lon: f.geometry.coordinates[0],
            type: f.properties && f.properties.osm_value || f.properties.type || 'place',
            source: 'photon'
    }));   
        
    } catch (err) {
        console.error('Error in photonAutocomplete:', err);
        return [];
    }
}


async function nominatimAutocomplete(q, limit = 5) {

    if(!q){
        return [];
    }

    const url = `${nominatimSearch}?q=${encodeURIComponent(q)}&format=json&addressdetails=1&limit=${limit}`;

    try {
        const res = await fetch(url, {headers: {'User-Agent': 'RideSharingApp/1.0'}});

        if(!res.ok) throw new Error('Failed to fetch from Nominatim API');

        const json =  await res.json();

        return (json || []).map(p => ({
            display_name: p.display_name,
            lat: p.lat,
            lon: p.lon,
            type: p.type || 'place',
            source: 'nominatim'
            }));
    } catch (err) {
        console.error('Error in nominatimAutocomplete:', err);
        return [];
    }
}


function mockPlaces(q, limit = 5) {
  if (!q) return [];
  const samples = [
    { display_name: 'University Campus, College Road', lat: 23.777176, lon: 90.399452, type: 'university' },
    { display_name: 'Main Library', lat: 23.780, lon: 90.400, type: 'library' },
    { display_name: 'Student Center', lat: 23.779, lon: 90.401, type: 'building' },
    { display_name: 'City Central Park', lat: 23.781, lon: 90.402, type: 'park' },
    { display_name: 'Central Bus Station', lat: 23.776, lon: 90.398, type: 'station' }
  ];
  const ql = q.toLowerCase();
  return samples.filter(s => s.display_name.toLowerCase().includes(ql)).slice(0, limit).map(s => ({ ...s, source: 'mock' }));
}


async function autocomplete(q, limit = 5) {
  // 1) try Photon
  const p = await photonAutocomplete(q, limit);
  if (p && p.length) return p;
  // 2) fallback to Nominatim
  const n = await nominatimAutocomplete(q, limit);
  if (n && n.length) return n;
  // 3) local mock
  return mockPlaces(q, limit);
}

module.exports = { autocomplete };