let source = {};
let map = {}
let vector = {}
let selectedFeature;
let currentInteractions;

function addMap(id, draw = false, centerLon, centerLat, defaultZoom, vectorColor) {
  
  // initially hide edit button
  let parentNode = document.querySelector('#' + id).parentNode;
  parentNode.querySelector('.edit-button').style.display = 'none';
  
  if(document.getElementById(id)) {
    const raster = new ol.layer.Tile({
      source: new ol.source.OSM(),
    });
    
 
	let featuresContent = null;
	if(document.getElementById(id + '-geojson').value) {
		featuresContent = (new ol.format.GeoJSON()).readFeatures(document.getElementById(id + '-geojson').value, { featureProjection: 'EPSG:3857' });
	}
	
    source[id] = new ol.source.Vector({
	  wrapX: false,
	  features: featuresContent
	});
	  
	/*if(document.getElementById(id + '-geojson').value) {
	  format = new ol.format.GeoJSON();
	  source[id].addFeatures(format.readFeatures(document.getElementById(id + '-geojson').value), {featureProjection: 'EPSG:3857'});
	}*/
	  
    vector[id] = new ol.layer.Vector({
      source: source[id],
      style: {
        'fill-color': vectorColor,
        'stroke-color': vectorColor,
        'stroke-width': 2,
        'circle-radius': 7,
        'circle-fill-color': vectorColor,
      },
    });

    // Limit multi-world panning to one world east and west of the real world.
    // Geometry coordinates have to be within that range.
    /* TBD! Solve later
    const extent = ol.Object.get('EPSG:3857').getExtent().slice();
    extent[0] += extent[0];
    extent[2] += extent[2];
    */
    
    // TBD: dynamic coordinate and zoom settings
    // static values: Arzberg!!
    map[id] = new ol.Map({
      target: id,
      layers: [raster, vector[id]],
      view: new ol.View({
        center: ol.proj.fromLonLat([centerLon, centerLat]),
        zoom: defaultZoom,
      // TBD! extent
      }),
    });
    
    if(document.getElementById(id + '-geojson').value) {
      format = new ol.format.GeoJSON();
      source[id].addFeatures(format.readFeatures(document.getElementById(id + '-geojson').value));
    }
    
    drawingEnabled = true;

    if(draw) {
      let draw, snap, modify; // global so we can remove them later

      const typeSelect = document.getElementById('select-geometry-type-' + id);

      function addDrawingInteractions() {
        if(drawingEnabled) {
          draw = new ol.interaction.Draw({
            source: source[id],
            type: typeSelect.value,
          });
          map[id].addInteraction(draw);
          if(document.getElementById('undo-' + id)) {
		        draw.on('drawstart', function() {
              document.getElementById('undo-' + id).classList.add('drawing-active');
            });
            draw.on('drawend', function() {
              document.getElementById('undo-' + id).classList.remove('drawing-active');
            });
          }
          
          snap = new ol.interaction.Snap({
            source: source[id],
          });
          map[id].addInteraction(snap);
          modify = new ol.interaction.Modify({
            source: source[id],
          });
          map[id].addInteraction(modify);
          selectedFeature = null;
        }
      }
      
      function removeInteractions() {
        map[id].removeInteraction(draw);
        map[id].removeInteraction(snap);
        map[id].removeInteraction(modify);
        map[id].removeInteraction(selectSingleClick);
      }

      // change interactions when new tool selected
      typeSelect.onchange = function () {
        removeInteractions();
        addDrawingInteractions();
      };
      
      addDrawingInteractions();
      
      // Remove last point of LineString or Polygon
      if(document.getElementById('undo-' + id)) {
        document.getElementById('undo-' + id).addEventListener('click', function () {
          draw.removeLastPoint();
        });
      }
      
      // Write geodata of current feature to GeoJSON
      source[id].on('addfeature', function() {
        
        // show modify button
        let parentNode = document.querySelector('#' + id).parentNode;
        parentNode.querySelector('.edit-button').style.display = 'inline-block';
        
        removeInteractions();
        drawingEnabled = false;
        document.querySelector('#' + id + ' .properties-input').style.display = 'block';
        addDrawingInteractions();
      });
      
      document.getElementById('mymovi-property-description-' + id).onchange = function() {
        let currentFeature;
        if(selectedFeature) {
          currentFeature = selectedFeature;
        }
        else {
          currentFeature = source[id].getFeatures()[source[id].getFeatures().length - 1];
        }
        if(currentFeature) currentFeature.setProperties({ 'description': document.getElementById('mymovi-property-description-' + id).value})
      }
      
      // Handle property input box close
      document.querySelector('#' + id + ' .properties-input .close').onclick = function(elem){
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
      document.querySelector('#' + id + ' .properties-input .delete-feature').onclick = function(elem){
        document.getElementById(id).classList.remove('select-mode');
		    document.getElementById('mymovi-button-select-' + id).classList.remove('select-mode');
        
        removeInteractions();
        elem.preventDefault();
        let currentFeature;
        if(selectedFeature) {
          currentFeature = selectedFeature;
        }
        else {
          currentFeature = source[id].getFeatures()[source[id].getFeatures().length - 1];
        }
        source[id].removeFeature(currentFeature);
        
        if(vector[id].getSource().getFeatures().length == 0) {
          let parentNode = document.querySelector('#' + id).parentNode;
          parentNode.querySelector('.edit-button').style.display = 'none';
        }
        
        document.querySelector('#' + id + ' .properties-input').style.display = "none";
        document.querySelector('#' + id + ' .properties-input #mymovi-property-description-' + id).value = '';
        drawingEnabled = true;
        selectSingleClick.getFeatures().clear();
        addDrawingInteractions();
      }
      
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
      
      // Style for feature selection
      let selectStyle = function (feature) {
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
      
      // Define single click interaction
      const selectSingleClick = new ol.interaction.Select({
        style: selectStyle,
      });
      
      // Handle single click select event
      selectSingleClick.on('select', function(evt){
        if(evt.selected[0]) {
          selectedFeature = evt.selected[0];
          if(selectedFeature.get('description')) document.getElementById('mymovi-property-description-' + id).value = selectedFeature.get('description');
          document.querySelector('#' + id + ' .properties-input').style.display = 'block';
        } else {
          selectedFeature = null;
        }
      })
      
      const selectElement = document.getElementById('mymovi-button-select-' + id);
      
      selectElement.onclick = changeInteraction;
      
      function changeInteraction() {
		document.getElementById(id).classList.add('select-mode');
		document.getElementById('mymovi-button-select-' + id).classList.add('select-mode');
		  
        if(document.getElementById(id + '-geojson')) {
          let geoJsonObject = JSON.parse(document.getElementById(id + '-geojson').value);
          if(geoJsonObject.features.length) {
            removeInteractions();
            map[id].addInteraction(selectSingleClick);
          }
        }
      }

      /*let points = [],
          url_osrm_nearest = '//router.project-osrm.org/nearest/v1/driving/',
          url_osrm_route = '//router.project-osrm.org/route/v1/driving/',
          routeStyle = {
            route: new ol.style.Style({
              stroke: new ol.style.Stroke({
                width: 6, color: [102, 102, 102, .7]
              })
            }),
          };

      map[id].on('click', function(evt){
        if(typeSelect.value == 'Point') {
          utils.getNearest(evt.coordinate).then(function(coord_street){
          let last_point = points[points.length - 1];
          let points_length = points.push(coord_street);

            if(last_point) {
              //get the route
              let point1 = last_point.join();
              let point2 = coord_street.join();

              fetch(url_osrm_route + point1 + ';' + point2).then(function(r) { 
                console.log(r);
                return r.json();
              }).then(function(json) {
                if(json.code !== 'Ok') {
                return;
                }
                //points.length = 0;
                utils.createRoute(json.routes[0].geometry);

                fullLength += json.routes[0].distance;

                if(fullLength > 100) document.getElementById('street-distance').innerHTML = Math.round((fullLength / 1000) * 100) / 100 + ' ' + 'km';
                else document.getElementById('street-distance').innerHTML = Math.round(fullLength * 100) / 100 + ' ' + 'm';
              });
            }
          });
        }
      });

      let fullLength = 0;

      let utils = {
        getNearest: function(coord){
          var coord4326 = utils.to4326(coord);    
          return new Promise(function(resolve, reject) {
            //make sure the coord is on street
            fetch(url_osrm_nearest + coord4326.join()).then(function(response) { 
              // Convert to JSON
              return response.json();
            }).then(function(json) {
              if (json.code === 'Ok') resolve(json.waypoints[0].location);
              else reject();
            });
          });
        },
        createFeature: function(coord) {
          var feature = new ol.Feature({
            type: 'place',
            geometry: new ol.geom.Point(ol.proj.fromLonLat(coord))
          });
          vectorSource.addFeature(feature);
        },
        createRoute: function(polyline) {
          // route is ol.geom.LineString
          var route = new ol.format.Polyline({
            factor: 1e5
          }).readGeometry(polyline, {
            dataProjection: 'EPSG:4326',
            featureProjection: 'EPSG:3857'
          });
          var feature = new ol.Feature({
            type: 'route',
            geometry: route
          });
          feature.setStyle(routeStyle.route);
          source[id].addFeature(feature);
        },
        to4326: function(coord) {
          return ol.proj.transform([
            parseFloat(coord[0]), parseFloat(coord[1])
          ], 'EPSG:3857', 'EPSG:4326');
        }
      };*/
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  /**
   * MyMoVi form
   */
  if(document.querySelector('.mymovi-form')) {
    document.querySelectorAll('.mymovi-form-page').forEach((item) => {item.style.display = 'none'});
    document.querySelectorAll('.mymovi-form-page .mymovi-button:not(.deactivated)').forEach((item) => {
      item.onclick = (event) => {
        event.preventDefault();
        window.scrollTo(0, 0);
        event.target.closest('.mymovi-form-page').style.display = "none";
        document.querySelector('.mymovi-form-page.' + event.target.getAttribute('data-showpage')).style.display = 'block';
        window.location.hash = document.querySelector('.mymovi-form-page.' + event.target.getAttribute('data-showpage')).getAttribute('id');
      }
    });
    
    // Set current form page
    let currentPage = 'page-1';
    if(document.getElementById(window.location.hash.replace('#',''))) {
      currentPage = window.location.hash.replace('#','');
    }
    
    document.getElementById(currentPage).style.display = 'block';
  }
  
  // TODO: remove redundancy related to previous part 
  window.onhashchange = function(e) {
    let currentPage = 'page-1';
    document.querySelectorAll('.mymovi-form-page').forEach((item) => {
      item.style.display = "none";
    });
    if(document.getElementById(window.location.hash.replace('#',''))) {
      currentPage = window.location.hash.replace('#','');
    }
    
    document.getElementById(currentPage).style.display = 'block';
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


