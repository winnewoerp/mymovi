let map;
let source = {};
let vector = {};
let selectedFeature;
let drawingEnabled = true;
let modifyEnabled = false;

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
		let currentFeature = getCurrentFeature();
		if(currentFeature)
			currentFeature.setProperties({ 'description': document.getElementById('mymovi-property-description-' + id).value})
	}

	// Handle property input box close
	document.querySelector('#' + id + ' .properties-input .close').onclick = function(elem) {
		elem.preventDefault();

		closePropertiesInput(id);
	}

	// Handle property input box delete
	document.querySelector('#' + id + ' .properties-input .delete-feature').onclick = function(elem) {
		elem.preventDefault();

		source[getCurrentPagenum()].removeFeature(getCurrentFeature());

		closePropertiesInput(id);
	}

	// Handle single click select event
	selectSingleClick.on('select', function(evt) {
		if(evt.selected[0]) {
			selectedFeature = evt.selected[0];
			openPropertiesInput(id, selectedFeature.get('description'));
		} else {
			selectedFeature = null;
		}
	});

	document.getElementById('mymovi-button-select-' + id).addEventListener('click', function() {
		if (map.getInteractions().getArray().includes(selectSingleClick)) {
			closePropertiesInput(id);
		} else {
			if (vector[getCurrentPagenum()] && vector[getCurrentPagenum()].getSource().getFeatures().length) {
				removeInteractions();
				map.addInteraction(selectSingleClick);
			}

			document.getElementById(id).classList.add('select-mode');
			updateEditButton(id);
		}
	});

	document.getElementById('mymovi-button-modify-' + id).addEventListener('click', function(e) {
		e.preventDefault();
		modifyEnabled = !modifyEnabled;
		modify.setActive(modifyEnabled);

		if (modifyEnabled)
			e.target.classList.add('select-mode');
		else
			e.target.classList.remove('select-mode');
	});
}

/**
 * Gives the currently edited feature. This is either the selected one or the last one added
 * @param {string} [layer_id=getCurrentPagenum()] the layer id to get the feature from in case none is selected
 * @returns {FeatureLike} The currently edited feature
 */
function getCurrentFeature(layer_id = getCurrentPagenum()) {
	if(selectedFeature) {
		return selectedFeature;
	} else {
		const currentFeatures = source[layer_id].getFeatures();
		return currentFeatures[currentFeatures.length - 1];
	}
}

/**
 * Closes the property input for the specified map
 * @param {string} map_id the id of the map
 */
function closePropertiesInput(map_id) {
	removeInteractions();
	
	document.getElementById(map_id).classList.remove('select-mode');
	updateEditButton(map_id);

	document.querySelector('#' + map_id + ' .properties-input').style.display = "none";
	document.querySelector('#' + map_id + ' .properties-input #mymovi-property-description-' + map_id).value = '';

	selectSingleClick.getFeatures().clear();
	drawingEnabled = true;
	addDrawingInteractions();
}

/**
 * Open the property input for the specified map
 * @param {string} map_id the id of the map
 * @param {string} description_text the description already present for the feature to edit
 */
function openPropertiesInput(map_id, description_text) {
	document.getElementById('mymovi-property-description-' + map_id).value = (description_text ? description_text : "");
	document.querySelector('#' + map_id + ' .properties-input').style.display = 'block';
	drawingEnabled = false;
	removeInteractions();
}

/**
 * Updates the edit button's visibility and style
 * @param {string} map_id the id of the map
 * @param {string} layer_id the id of the layer
 */
function updateEditButton(map_id, layer_id = getCurrentPagenum()) {
	const editButton = document.getElementById('mymovi-button-select-' + map_id);

	editButton.style.display = (vector[layer_id] && vector[layer_id].getSource().getFeatures().length ? 'inline-block' : 'none');

	if (map.getInteractions().getArray().includes(selectSingleClick)) {
		editButton.classList.add('select-mode');
	} else {
		editButton.classList.remove('select-mode');
	}
}

function addLayer(id, vectorColor, single, geometryText) {
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
			'single': single,
		},
	});
	if (geometryText)
		vector[id].set('geometryText', geometryText);

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
		updateEditButton(map_id);
		
		openPropertiesInput(map_id, "");
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

function addDrawingInteractions(layer_id = getCurrentPagenum()) {
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
		});
		modify.setActive(modifyEnabled);
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
	const map_id = map.getTargetElement().id;
	
	document.getElementById('page-' + getCurrentPagenum()).style.display = 'block';

	document.getElementById("geometry-text-field").innerHTML = getCurrentPagenum() in vector ? vector[getCurrentPagenum()].get('geometryText') : geometryText;

	document.getElementById('undo-' + map_id).classList.remove('drawing-active');

	removeInteractions();
	addDrawingInteractions();

	setLayerVisibility(!(getCurrentPagenum() in vector) || vector[getCurrentPagenum()].get('single'));
	updateEditButton(map_id);
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
	return window.location.hash.replace('#page-','') || "1";
}
