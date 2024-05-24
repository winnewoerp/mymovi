let source = {};
let map;
let vector = {};
let singleLayer = {};
let selectedFeature;
let drawingEnabled = true;

let draw, snap, modify;
const selectSingleClick = new ol.interaction.Select({
	style: selectStyle,
	hitTolerance: 5,
	layers: (layer) => {
		return layer.get('page') == getCurrentPagenum();
	},
	condition: (event) => {
		return ol.events.condition.singleClick(event) && drawingEnabled;
	},
});

function addMap(id, centerLon, centerLat, defaultZoom) {
	// initially hide edit button
	let parentNode = document.querySelector('#' + id).parentNode;
	parentNode.querySelector('.edit-button').style.display = 'none';

	if(document.getElementById(id)) {
		const raster = new ol.layer.Tile({
			source: new ol.source.OSM(),
		});

		map = new ol.Map({
			target: id,
			layers: [raster],
			view: new ol.View({
				center: ol.proj.fromLonLat([centerLon, centerLat]),
				zoom: defaultZoom,
			}),
		});
	}

	// Remove last point of LineString or Polygon
	if(document.getElementById('undo-' + id)) {
		document.getElementById('undo-' + id).addEventListener('click', function () {
			draw.removeLastPoint();
		});
	}

	// Save feature properties
	document.getElementById('mymovi-property-description-' + id).onchange = function() {
		let currentFeature;
		if(selectedFeature) {
			currentFeature = selectedFeature;
		}
		else {
			currentFeature = source[getCurrentPagenum()].getFeatures()[source[getCurrentPagenum()].getFeatures().length - 1];
		}
		if(currentFeature)
			currentFeature.setProperties({ 'description': document.getElementById('mymovi-property-description-' + id).value})
	}

	// Handle property input box close
	document.querySelector('#' + id + ' .properties-input .close').onclick = function(elem) {
		document.getElementById(id).classList.remove('select-mode');
		document.getElementById('mymovi-button-select-' + id).classList.remove('select-mode');
		
		removeInteractions();
		elem.preventDefault();
		document.querySelector('#' + id + ' .properties-input').style.display = "none";
		document.querySelector('#' + id + ' .properties-input #mymovi-property-description-' + id).value = '';
		drawingEnabled = true;
		selectSingleClick.getFeatures().clear();
		addDrawingInteractions();
	}

	// Handle property input box delete (TBD: Remove redundancies!)
	document.querySelector('#' + id + ' .properties-input .delete-feature').onclick = function(elem) {
		let layer_id = getCurrentPagenum();

		document.getElementById(id).classList.remove('select-mode');
		document.getElementById('mymovi-button-select-' + id).classList.remove('select-mode');

		removeInteractions();
		elem.preventDefault();
		let currentFeature;
		if(selectedFeature) {
			currentFeature = selectedFeature;
		}
		else {
			currentFeature = source[layer_id].getFeatures()[source[layer_id].getFeatures().length - 1];
		}
		source[layer_id].removeFeature(currentFeature);
		
		if(vector[layer_id].getSource().getFeatures().length == 0) {
			let parentNode = document.getElementById(id).parentNode;
			parentNode.querySelector('.edit-button').style.display = 'none';
		}
		
		document.querySelector('#' + id + ' .properties-input').style.display = "none";
		document.querySelector('#' + id + ' .properties-input #mymovi-property-description-' + id).value = '';
		drawingEnabled = true;
		selectSingleClick.getFeatures().clear();
		addDrawingInteractions();
	}

	// Handle single click select event
	selectSingleClick.on('select', function(evt) {
		if(evt.selected[0]) {
			selectedFeature = evt.selected[0];
			if(selectedFeature.get('description')) document.getElementById('mymovi-property-description-' + id).value = selectedFeature.get('description');
			document.querySelector('#' + id + ' .properties-input').style.display = 'block';
			drawingEnabled = false;
		} else {
			selectedFeature = null;
		}
	});

	document.getElementById('mymovi-button-select-' + id).addEventListener('click', function(evt) {
		document.getElementById(id).classList.add('select-mode');
		document.getElementById('mymovi-button-select-' + id).classList.add('select-mode');

		if(document.getElementById(getCurrentPagenum() + '-geojson')) {
			let geoJsonObject = JSON.parse(document.getElementById(getCurrentPagenum() + '-geojson').value);
			if(geoJsonObject.features.length) {
				removeInteractions();
				map.addInteraction(selectSingleClick);
			}
		}
	});
}

function addLayer(id, vectorColor) {
	let map_id = map.getTargetElement().id;

	let featuresContent = null;
	if(document.getElementById(id + '-geojson').value) {
		featuresContent = (new ol.format.GeoJSON()).readFeatures(document.getElementById(id + '-geojson').value, { featureProjection: 'EPSG:3857' });
	}

	source[id] = new ol.source.Vector({
		wrapX: false,
		features: featuresContent,
	});

	vector[id] = new ol.layer.Vector({
		source: source[id],
		style: {
			'fill-color': vectorColor,
			'stroke-color': vectorColor,
			'stroke-width': 2,
			'circle-radius': 7,
			'circle-fill-color': vectorColor,
		},
		properties: {
			'page': id,
		},
	});

	map.addLayer(vector[id]);

	// change interactions when new tool selected
	if (document.getElementById('select-geometry-type-' + id)) {
		document.getElementById('select-geometry-type-' + id).onchange = function () {
			removeInteractions();
			addDrawingInteractions();
		};
	}
      
	// Open feature properties box
	source[id].on('addfeature', function() {
		// show modify button
		let parentNode = map.getTargetElement().parentNode;
		parentNode.querySelector('.edit-button').style.display = 'inline-block';
		
		removeInteractions();
		drawingEnabled = false;
		document.querySelector('#' + map_id + ' .properties-input').style.display = 'block';
	});

	// Write geodata of drawn features to GeoJSON
	source[id].on('change', function() {
		let geom = [];
		source[id].forEachFeature( function(feature) {
			let newFeature = new ol.Feature(feature.getGeometry().clone().transform('EPSG:3857', 'EPSG:4326'));
			newFeature.setProperties({'description': feature.get('description')});
			geom.push(newFeature);
		});
		let writer = new ol.format.GeoJSON();
		let geoJsonStr = writer.writeFeatures(geom);
		document.getElementById(id + '-geojson').value = geoJsonStr;
	});
}

function addDrawingInteractions() {
	let layer_id = getCurrentPagenum();

	if(drawingEnabled && document.getElementById('select-geometry-type-' + layer_id)) {
		let map_id = map.getTargetElement().id;

		draw = new ol.interaction.Draw({
			source: source[layer_id],
			type: document.getElementById('select-geometry-type-' + layer_id).value,
		});
		map.addInteraction(draw);
		if(document.getElementById('undo-' + map_id)) {
			draw.on('drawstart', function() {
				document.getElementById('undo-' + map_id).classList.add('drawing-active');
			});
			draw.on('drawend', function() {
				document.getElementById('undo-' + map_id).classList.remove('drawing-active');
			});
		}
		
		snap = new ol.interaction.Snap({
			source: source[layer_id],
		});
		map.addInteraction(snap);
		modify = new ol.interaction.Modify({
			source: source[layer_id],
			condition: (event) => {
				let originalEvent = event.originalEvent;

				return originalEvent.isPrimary && ((originalEvent.buttons & 2) == 2 || originalEvent.pointerType == 'touch');
			}
		});
		map.addInteraction(modify);
		selectedFeature = null;
	}
}

function removeInteractions() {
	map.removeInteraction(draw);
	map.removeInteraction(snap);
	map.removeInteraction(modify);
	map.removeInteraction(selectSingleClick);
}

function selectStyle() {
	let fill = new ol.style.Fill({
		color: '#000099',
	});

	let stroke = new ol.style.Stroke({
		color: '#000099',
		width: 3
	});

	let styles = [
		new ol.style.Style({
			image: new ol.style.Circle({
				fill: fill,
				stroke: stroke,
				radius: 7
			}),
			fill: fill,
			stroke: stroke
		})
	];
	return styles;
}

window.addEventListener("load", () => {
	/**
	 * MyMoVi form
	 */
	if(document.querySelector('.mymovi-form')) {
		document.querySelectorAll('.mymovi-form-page .mymovi-button:not(.deactivated)').forEach((item) => {
			item.onclick = (event) => {
				event.preventDefault();
				window.scrollTo(0, 0);
				window.location.hash = document.querySelector('.mymovi-form-page.' + event.target.getAttribute('data-showpage')).getAttribute('id');
			}
		});

		hideAllPages();
		showCurrentPage();
	}

	window.onhashchange = function(e) {
		hideAllPages();
		showCurrentPage();
	}
	
	/*let countPages = 1;
	document.querySelectorAll('.mymovi-form-page').forEach((item) => {
		item.setAttribute('id','page' + countPages);
		countPages++;
	});*/
	
	// Prevent form submit on enter
	// @Source: https://stackoverflow.com/a/587575 (2023-07-24)
	document.querySelector('.mymovi-form').onkeypress = function(e) {
		e = e || event;
		var txtArea = /textarea/i.test((e.target || e.srcElement).tagName);
		return txtArea || (e.keyCode || e.which || e.charCode || 0) !== 13;
	}
});

function showCurrentPage() {
	let currentPage = 'page-1';
	if(document.getElementById(window.location.hash.replace('#',''))) {
		currentPage = window.location.hash.replace('#','');
	}
	
	document.getElementById(currentPage).style.display = 'block';

	removeInteractions();
	addDrawingInteractions();

	setLayerVisibility(singleLayer[getCurrentPagenum()]);
}

function hideAllPages() {
	document.querySelectorAll('.mymovi-form-page').forEach((item) => {
		item.style.display = "none";
	});
}

/**
 * Sets all layers visibilities to not the specified bool. If true, sets the visibility of the layer of the current page to true
 * @param {bool} single specifies whether only one or all layers will be shown
 */
function setLayerVisibility(single) {
	for (let layer in vector) {
		vector[layer].setVisible(!single || layer == getCurrentPagenum());
	}
}

function getCurrentPagenum() {
	return window.location.hash.replace('#page-','');
}
