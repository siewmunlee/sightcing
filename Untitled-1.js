<!--
var phpcoordinates = "";
var points = [];
var totalDistance = 0;
var DistanceTotaleAfficheKm = 0;
var DistanceTotaleAfficheMetre = 0;
var DistanceTotaleAfficheYard = 0;
var DistanceTotaleAffichemiles = 0;
var distance = 0;
var polyline = "";
var coordinates = [];
//<![CDATA[
function load() {
    var mapTypeIds = [];
    for (var type in google.maps.MapTypeId) {
        mapTypeIds.push(google.maps.MapTypeId[type]);
    }
    mapTypeIds.push("OSM");
    map = new google.maps.Map(
        document.getElementById("map_div"), {
            /*center: new google.maps.LatLng(46.159506, -1.151779),*/
            center: new google.maps.LatLng(50.76689410816143, 0.29010772705078125),
            zoom: 11,
            streetViewControl: false,
            mapTypeId: google.maps.MapTypeId.TERRAIN,
            mapTypeControlOptions: {
                mapTypeIds: mapTypeIds
            }
        });
    map.mapTypes.set("OSM", new google.maps.ImageMapType({
        getTileUrl: function(coord, zoom) {
            return "http://tile.openstreetmap.org/" + zoom + "/" + coord.x + "/" + coord.y + ".png";
        },
        tileSize: new google.maps.Size(256, 256),
        name: "OpenStreetMap",
        maxZoom: 18
    }));
    var polylineEncoder = new PolylineEncoder();
    var erreur = 2;
    var extension = 1;
    if (erreur == 2) {
        downloadUrl("tmp/6706route-5.gpx", function(data) {
            var xml = xmlParse(data);
            points = [];
            distance = 0;
            var markers = new Array();
            var markerslat = new Array();
            var markerslng = new Array();
            var firstPoint = "";
            var track = new Array();

            if (extension == 1) {
                markers = xml.getElementsByTagName("trkpt");
                if (typeof(markers[0]) == "undefined" || markers[0] == null) {
                    markers = xml.getElementsByTagName("rtept");
                    if (typeof(markers[0]) == "undefined" || markers[0] == null) {
                        markers = xml.getElementsByTagName("wpt");
                    }
                }
                firstPoint = new google.maps.LatLng(parseFloat(markers[0].getAttribute("lat")), parseFloat(markers[0].getAttribute("lon")));
            }
            if (extension == 2) {
                track = xml.getElementsByTagName("Track");
                for (var i = 0; i < track.length; i++) {
                    markerslat[i] = track[i].getElementsByTagName("LatitudeDegrees");
                    markerslng[i] = track[i].getElementsByTagName("LongitudeDegrees");
                }
                firstPoint = new google.maps.LatLng(parseFloat(GXml.value(markerslat[0][0])), parseFloat(GXml.value(markerslng[0][0])));
            }
            if (extension == 3) {
                linestring = xml.getElementsByTagName("LineString");
                if (typeof(linestring[0]) != "undefined" || linestring[0] != null) {
                    markers = linestring[0].getElementsByTagName("coordinates");
                    markers = markers[0].childNodes[0].nodeValue;
                    markers = markers.replace('\t', '');
                    markers = markers.split(/ |\r\n|\n|\r/);
                    var y = 0;
                    while (markers[y] == "") {
                        y++;
                    }
                    markerspoint = markers[y].split(",");
                } else {
                    linestring = xml.getElementsByTagName("Track");
                    markers = linestring[0].getElementsByTagName("coord");
                    markerspoint = markers[0].childNodes[0].nodeValue.split(" ");
                    extension = 31;
                }
                longitude = parseFloat(markerspoint[0]);
                latitude = parseFloat(markerspoint[1]);
                if ((typeof latitude === 'number' && latitude <= 90 && latitude >= -90) && (typeof longitude === 'number' && longitude <= 90 && longitude >= -90)) {
                    firstPoint = new google.maps.LatLng(latitude, longitude);
                    points.push(firstPoint);
                    coordinates.push(latitude + "," + longitude);
                }
            }
            distance = 0;
            if (extension == 1) {
                for (var i = 1; i < markers.length; i++) {
                    newPoint = new google.maps.LatLng(parseFloat(markers[i].getAttribute("lat")), parseFloat(markers[i].getAttribute("lon")));
                    points.push(newPoint);
                    coordinates.push(parseFloat(markers[i].getAttribute("lat")) + "," + parseFloat(markers[i].getAttribute("lon")));
                }
            }
            if (extension == 2) {
                for (var i = 0; i < track.length; i++) {
                    for (var j = 0; j < markerslat[i].length; j++) {
                        newPoint = new google.maps.LatLng(parseFloat(GXml.value(markerslat[i][j])), parseFloat(GXml.value(markerslng[i][j])));
                        points.push(newPoint);
                        coordinates.push(parseFloat(GXml.value(markerslat[i][j])) + "," + parseFloat(GXml.value(markerslng[i][j])));
                    }
                }
            }
            if (extension == 3) {
                for (var i = y + 1; i < markers.length; i++) {
                    if (markers[i] != "") {
                        markerspoint = markers[i].split(",");
                        longitude = parseFloat(markerspoint[0]);
                        latitude = parseFloat(markerspoint[1]);
                        if ((typeof latitude === 'number' && latitude <= 90 && latitude >= -90) && (typeof longitude === 'number' && longitude <= 90 && longitude >= -90)) {
                            newPoint = new google.maps.LatLng(latitude, longitude);
                            points.push(newPoint);
                            coordinates.push(latitude + "," + longitude);
                        }
                    }
                }
            }
            if (extension == 31) {
                for (var i = 1; i < markers.length; i++) {
                    if (markers[i] != "") {
                        markerspoint = markers[i].childNodes[0].nodeValue.split(" ");
                        longitude = parseFloat(markerspoint[0]);
                        latitude = parseFloat(markerspoint[1]);
                        if ((typeof latitude === 'number' && latitude <= 90 && latitude >= -90) && (typeof longitude === 'number' && longitude <= 90 && longitude >= -90)) {
                            newPoint = new google.maps.LatLng(latitude, longitude);
                            points.push(newPoint);
                            coordinates.push(latitude + "," + longitude);
                        }
                    }
                }
            }

            if (polyline) {
                polyline.setMap(null);
            }

            polyline = new google.maps.Polyline({
                path: points,
                strokeColor: "#FF0000",
                strokeOpacity: 1.0,
                strokeWeight: 2
            });
            polyline.setMap(map);
            start_marker = new google.maps.Marker({
                icon: "../img/start.png",
                shadow: "",
                shape: "",
                position: points[0],
                map: map
            });
            start_marker.setMap(map);

            end_marker = new google.maps.Marker({
                icon: "../img/end.png",
                shadow: "",
                shape: "",
                position: points[points.length - 1],
                map: map
            });
            end_marker.setMap(map);
            map.setCenter(points[0], 11);
            calculdistance();
        });
    } else {
        /*map.setCenter(new google.maps.LatLng(40.756814951767126, -73.98648262023926), 11);*/
        map.setCenter(new google.maps.LatLng(50.76689410816143, 0.29010772705078125), 11);
    }
}

//]]>

function calculdistance() {
    totalDistance = 0;
    var i = 0;
    if (points.length > 1) {
        totalDistance = google.maps.geometry.spherical.computeLength(points);
    }
    DistanceTotaleAfficheMetre = Math.round(totalDistance * 10) / 10;
    DistanceTotaleAfficheKm = Math.round((totalDistance / 1000) * 100) / 100;
    DistanceTotaleAfficheYard = Math.round((totalDistance * 1.094) * 10) / 10;
    DistanceTotaleAffichemiles = Math.round((totalDistance * 0.000621371192237) * 100) / 100;
    var AfficheDistanceTotaleMetre = document.getElementById("AfficheDistanceTotaleMetre");
    AfficheDistanceTotaleMetre.innerHTML = DistanceTotaleAfficheMetre;
    var AfficheDistanceTotaleKm = document.getElementById("AfficheDistanceTotaleKm");
    AfficheDistanceTotaleKm.innerHTML = DistanceTotaleAfficheKm;
    var AfficheDistanceTotalemiles = document.getElementById("AfficheDistanceTotalemiles");
    AfficheDistanceTotalemiles.innerHTML = DistanceTotaleAffichemiles;
    var AfficheDistanceTotaleYard = document.getElementById("AfficheDistanceTotaleYard");
    AfficheDistanceTotaleYard.innerHTML = DistanceTotaleAfficheYard;
}

function verifgpx() {
    if (coordinates.length < 2) {
        /*alert('Import GPX ot TCX file and click on \"Submit!\"');*/
        $.alert({
            useBootstrap: false,
            type: 'red',
            typeAnimated: true,
            closeIcon: true,
            title: 'Oops',
            content: 'Please import GPX,TCX or KML file first!',
        });
        return false;
    } else {
        exportgpx();
        afficherformgpx();
        return true;
    }
}

function exportgpx() {
    phpcoordinates = coordinates.join(";");
}

function afficherformgpx() {
    var formulairegpx = '<input type="hidden" id="tab_coordinatesgpx" name="tab_coordinatesgpx" value="' + phpcoordinates + '" />';
    var formgpx = document.getElementById("formgpx");
    formgpx.innerHTML = formulairegpx;
}

function affichersave() {
    var formulairesave = '<input type="hidden" id="tab_coordinatessave" name="tab_coordinatessave" value="' + phpcoordinates + '" /><input type="hidden" id="tab_distancesave" name="tab_distancesave" value="' + DistanceTotaleAffichemiles + '" />';
    var formsave = document.getElementById("formsave");
    formsave.innerHTML = formulairesave;
}

function save() {
    if (coordinates.length < 2) {
        /*alert('Import GPX ot TCX file and click on \"Submit!\"');*/
        $.alert({
            useBootstrap: false,
            type: 'red',
            typeAnimated: true,
            closeIcon: true,
            title: 'Oops',
            content: 'Please import GPX,TCX or KML file first!',
        })…