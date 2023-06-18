const raster = new ol.layer.Tile({
  source: new ol.source.OSM(),
});

const source = new ol.source.Vector({wrapX: false});

const vector = new ol.layer.Vector({
  source: source,
});

const map = new ol.Map({
  target: 'ifl-map',
  layers: [raster, vector],
  view: new ol.View({
    center: ol.proj.fromLonLat([12.47209, 51.34680]),
    zoom: 15,
  }),
});

const typeSelect = document.getElementById('type');

let draw; // global so we can remove it later

function addInteraction() {
  const value = typeSelect.value;
  if (value !== 'None') {
    draw = new ol.interaction.Draw({
      source: source,
      type: typeSelect.value,
    });
    map.addInteraction(draw);
  }
}

/**
 * Handle change event.
 */
typeSelect.onchange = function () {
  map.removeInteraction(draw);
  addInteraction();
};

document.getElementById('undo').addEventListener('click', function () {
  draw.removeLastPoint();
});

addInteraction();
