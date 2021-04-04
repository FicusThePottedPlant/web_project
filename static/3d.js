let map
let myMap
let panorama
let score = 0
let canMove = true
let coordinates = []
let longitude, latitude
let my
let sv
let x = 3

function modal(text) {
    let m = document.getElementById("alert")
    document.getElementById("alert-content").textContent = text
    m.style.animation = "fade 5s cubic-bezier(0.7, 0, 0.84, 0)"
    m.onanimationend = () => {
        m.style.animation = ""
    }
}

const pano = () => {
    return document.getElementById("pano")
}
const checkCNT = () => {
    return document.getElementById("check-country")
}

function initParams(a, b) {
    latitude = a
    longitude = b
}

function setCorrectLocation() {
    canMove = false
    latitude = panorama.getPosition().lat()
    longitude = panorama.getPosition().lng()
    function degrees_to_radians(degrees)
        {
          var pi = Math.PI;
          return degrees * (pi/180);
        }
    let d = 12742 * Math.asin(Math.sqrt(Math.sin(degrees_to_radians((latitude - coordinates[0]) / 2)) ** 2 + Math.cos(degrees_to_radians(coordinates[0])) * Math.cos(degrees_to_radians(latitude)) * Math.sin(degrees_to_radians((longitude - coordinates[1]) / 2)) ** 2))
    d = Math.round(d)
    let r = (5000 - d * 1.3)
    r = r < 0 ? 0 : Math.round(r)
    score = score+r
    var myPlacemark = new ymaps.Placemark(
            coordinates, {iconContent: "Вы выбрали"},{preset: 'islands#blackStretchyIcon',}
        );
    var myGeoObject = new ymaps.GeoObject({
            geometry: {
            type: "LineString",
            coordinates: [
                 [latitude,longitude],
                coordinates
            ],
        },
            // Описываем свойства геообъекта.
            properties:{
                hintContent: d + ' км',
            balloonContentHeader: d + ' км',
            balloonContentBody: 'Получено ' + r + ' очков',
            }
        }, {
            strokeColor: "#000000",
            strokeWidth: 5,
            strokeStyle: 'shortdash',
            opacity: 0.9,
        });
    myMap.geoObjects.add(myPlacemark);
    myMap.geoObjects.add(myGeoObject);
    myMap.geoObjects.add(new ymaps.Placemark( [latitude,longitude], {iconContent: "Вы здесь"}, {preset: 'islands#blackStretchyIcon'}))
    modal(`Вы ошиблись на ${Math.round(d)} км.\n
     Получено ${r} очков`);
     myGeoObject.balloon.open(myMap.getCenter());
}

function initialize() {
    my = {lat: latitude, lng: longitude}
    sv = new google.maps.StreetViewService()
    panorama = new google.maps.StreetViewPanorama(
        pano()
    )
    map = new google.maps.Map(document.getElementById("mp"), {
        center: my,
        zoom: 16,
        streetViewControl: false,
    })
    sv.getPanorama({
        location: my,
        radius: 100,
        source: google.maps.StreetViewSource.OUTDOOR,
        preference: google.maps.StreetViewPreference.BEST
    }, processSVData)
}

function processSVData(data, status) {
    if (status === "OK") {
        const location = data.location
        new google.maps.Marker({
            position: location.latLng,
            map,
            title: location.description,
        })
        panorama.setPano(location.pano)
        panorama.setOptions({
            streetViewControl: false,
            rotateView: false,
            addressControl: false,
            enableCloseButton: false,
            showRoadLabels: false,
            fullscreenControl: false,
            zoomControl: false,
            motionTrackingControl: false
        })
        panorama.setPov({
            heading: 270,
            pitch: 0,
        })
        panorama.setVisible(true)
    }
    else{
    console.log(x)
        sv.getPanorama({
        location: my,

        radius: 10**x,
        source: google.maps.StreetViewSource.OUTDOOR,
        preference: google.maps.StreetViewPreference.BEST
    }, processSVData)
    x = x+1
    }
}

onload = () => {
    setTimeout(() => {
        let l = pano().children[0].children[0].children[0].children[0]
        let b = pano().children[1]
        b.parentElement.removeChild(b)
        l.style.display = "none"
        pano().style.opacity = 1
        checkCNT().onclick = () => {
            document.querySelector(".navigation").setAttribute("result", "")
            pano().parentElement.setAttribute("unreachable", "")
            setCorrectLocation()
        }
    }, 1000)
}
ymaps.ready(init)

function init() {
    myMap = new ymaps.Map("map", {
        center: [14.3, 90.5],
        zoom: 3,
    }, {
        minZoom:2,
        balloonMaxWidth: 0,
        searchControlProvider: 'yandex#search',
        yandexMapDisablePoiInteractivity: true
    })
    myMap.controls.remove('searchControl')
    myMap.controls.remove('typeSelector')
    myMap.controls.remove('routeButtonControl')
    myMap.controls.remove('fullscreenControl')
    myMap.controls.remove('trafficControl')
    myMap.controls.remove('rulerControl')
    myMap.controls.remove('geolocationControl')
    myMap.controls.remove('zoomControl')
    myMap.controls.remove('routePanelControl')
    myMap.cursors.push('arrow')
    myMap.behaviors.enable('scrollZoom')

    myMap.events.add('click', function (e) {
        if (canMove) {
            let coords = e.get('coords')
            myMap.geoObjects.removeAll()
            let myPlacemark = new ymaps.Placemark(
                coords
            )
            if (checkCNT().hasAttribute("disabled")) {
                checkCNT().removeAttribute("disabled")
            }

            coordinates = coords
            myMap.geoObjects.add(myPlacemark)
        }
    })
}