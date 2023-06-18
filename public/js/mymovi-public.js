const raster = new ol.layer.Tile({
  source: new ol.source.OSM(),
});

const source = new ol.source.Vector({wrapX: false});

const vector = new ol.layer.Vector({
  source: source,
  style: {
    'fill-color': 'rgba(230, 19, 126, .2)',
    'stroke-color': 'rgb(230, 19, 126)',
    'stroke-width': 2,
    'circle-radius': 7,
    'circle-fill-color': 'rgba(230, 19, 126, .8)',
  },
});

// Limit multi-world panning to one world east and west of the real world.
// Geometry coordinates have to be within that range.
/* TBD! Solve later
const extent = ol.Object.get('EPSG:3857').getExtent().slice();
extent[0] += extent[0];
extent[2] += extent[2];
*/

const map = new ol.Map({
  target: 'ifl-map',
  layers: [raster, vector],
  view: new ol.View({
    center: ol.proj.fromLonLat([12.47209, 51.34680]),
    zoom: 15,
	// TBD! extent
  }),
});

const modify = new ol.interaction.Modify({source: source});
map.addInteraction(modify);

let draw, snap; // global so we can remove them later

const typeSelect = document.getElementById('select-geometry-type');

function addInteractions() {
  draw = new ol.interaction.Draw({
    source: source,
    type: typeSelect.value,
  });
  map.addInteraction(draw);
  snap = new ol.interaction.Snap({
	  source: source,
  });
  map.addInteraction(snap);
}

/**
 * Handle change event.
 */
typeSelect.onchange = function () {
  map.removeInteraction(draw);
  map.removeInteraction(snap);
  addInteractions();
};

addInteractions();

document.getElementById('undo').addEventListener('click', function () {
  draw.removeLastPoint();
});

let points = [],
    url_osrm_nearest = '//router.project-osrm.org/nearest/v1/driving/',
    url_osrm_route = '//router.project-osrm.org/route/v1/driving/',
    routeStyle = {
      route: new ol.style.Style({
        stroke: new ol.style.Stroke({
          width: 6, color: [102, 102, 102, .7]
        })
      }),
    };

map.on('click', function(evt){
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
    source.addFeature(feature);
  },
  to4326: function(coord) {
    return ol.proj.transform([
      parseFloat(coord[0]), parseFloat(coord[1])
    ], 'EPSG:3857', 'EPSG:4326');
  }
};
