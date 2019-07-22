/* global L, data */
const main = async () => {
  const map = L.map("mapdiv", { zoomControl: false });
  const newDelhi = L.latLng([28.613889, 77.208889]);
  const zoomLevel = 8;

  const colors = [
    "#1f77b4",
    "#ff7f0e",
    "#2ca02c",
    "#d62728",
    "#9467bd",
    "#8c564b",
    "#e377c2",
    "#7f7f7f",
    "#bcbd22",
    "#17becf"
  ];

  map.setView(newDelhi, zoomLevel);
  const physicalTileLayer = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}",
    {
      attribution:
        "Tiles &copy; Esri &mdash; Source: US National Park Service",
      maxZoom: 8
    }
  ).addTo(map);

  const politicalTileLayer = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      minZoom: 1,
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }
  );

  const baseLayers = {
    "Esri Physical": physicalTileLayer,
    "OpenStreetMap": politicalTileLayer
  };

  const visualizationLayers = {};

  const placesArray = data.places;
  const { entries } = data.babur;
  const properties = data.babur.entryProperties;

  for (const place of placesArray) {
    place.entries = entries.filter(e => e.place === place.id);
  }

  properties.forEach( (property, i) => {
    const propEntries = entries.filter(e => e.properties[property.name] && e.properties[property.name] !== "");
    const points = [];
    [...new Set(propEntries.map(e => e.place))].forEach( placeId => {
      const dataPlace = data.places.filter(p => p.id === placeId)[0];
      const place = {
        latitude: dataPlace.latitude,
        longitude: dataPlace.longitude,
        name: dataPlace.name,
        attestedNames: [...new Set(propEntries.filter(e => e.place === placeId).map(e => e.attestedName))],
        count: propEntries.filter(e => e.place === placeId).length
      };
      if (place.latitude && place.longitude) {
        points.push(
          L.circleMarker([place.latitude, place.longitude], {
            color: colors[i % 10],
            fillColor: colors[i % 10],
            radius: 3 + Math.sqrt(place.count)
          }).bindPopup(`<h3>${place.name}</h3><p>${place.attestedNames.join(", ")}</p>`)
        );
      }
    });
    const layerName = `${property.owner} - ${property.inputLabel}`;
    visualizationLayers[layerName] = L.layerGroup(points);
  });

  console.log(properties);

  L.control.layers(baseLayers, visualizationLayers).addTo(map);
}

main();
