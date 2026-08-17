
const nav = document.querySelector(".nav");
window.addEventListener("scroll", () => {
  if (window.scrollY > 70) {
    nav.style.position = "fixed";
    nav.style.background = "rgba(5,9,15,.9)";
    nav.style.backdropFilter = "blur(14px)";
  } else {
    nav.style.position = "absolute";
    nav.style.background = "linear-gradient(180deg,rgba(2,6,11,.7),transparent)";
    nav.style.backdropFilter = "none";
  }
});


document.addEventListener("DOMContentLoaded", () => {
  const mapEl = document.getElementById("serviceMap");
  const statusEl = document.getElementById("mapStatus");
  if (!mapEl || typeof L === "undefined") {
    if (statusEl) statusEl.textContent = "Interactive map unavailable";
    return;
  }

  const map = L.map("serviceMap", {
    zoomControl: true,
    scrollWheelZoom: true
  }).setView([34.02, -117.25], 8);

  L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap &copy; CARTO'
  }).addTo(map);

  const countyQuery =
    "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/State_County/MapServer/1/query" +
    "?where=" + encodeURIComponent("STATE='06' AND COUNTY IN ('065','071')") +
    "&outFields=NAME,STATE,COUNTY&returnGeometry=true&outSR=4326&f=geojson";

  fetch(countyQuery)
    .then(r => {
      if (!r.ok) throw new Error("County boundary request failed");
      return r.json();
    })
    .then(data => {
      const boundary = L.geoJSON(data, {
        style: {
          color: "#168cff",
          weight: 2.5,
          opacity: .95,
          fillColor: "#168cff",
          fillOpacity: .12
        },
        onEachFeature: (feature, layer) => {
          const name = feature?.properties?.NAME || "Service area";
          layer.bindPopup("<strong>" + name + "</strong><br>CMW Transport Inland Empire service area");
        }
      }).addTo(map);

      if (boundary.getBounds().isValid()) {
        map.fitBounds(boundary.getBounds(), {padding:[22,22]});
      }
      statusEl.textContent = "Service area outlined";
      statusEl.classList.add("ready");
    })
    .catch(() => {
      statusEl.textContent = "Map loaded • boundary unavailable";
      // Still show useful Inland Empire reference points.
    });

  [
    ["Ontario",34.0633,-117.6509],
    ["Rancho Cucamonga",34.1064,-117.5931],
    ["Fontana",34.0922,-117.4350],
    ["San Bernardino",34.1083,-117.2898],
    ["Riverside",33.9806,-117.3755],
    ["Moreno Valley",33.9425,-117.2297]
  ].forEach(([name,lat,lng]) => {
    L.circleMarker([lat,lng], {
      radius:4.5,
      color:"#c8e8ff",
      weight:1.5,
      fillColor:"#168cff",
      fillOpacity:1
    }).addTo(map).bindPopup("<strong>"+name+"</strong>");
  });
});

if (window.matchMedia("(max-width: 920px)").matches) {
  nav.style.position = "fixed";
}
