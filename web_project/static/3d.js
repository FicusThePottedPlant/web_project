let map
let myMap
let panorama
let scores = 0
let canMove = true
let coordinates, games
let my
let sv
let x = 3
let game = 0

function pano() {
    return document.getElementById("pano")
}

let checkCNT = () => {
    return document.getElementById("check-country")
}

let nextGame = () => {
    return document.getElementById("next-game")
}

function modal(text) {
    let m = document.getElementById("alert")
    document.getElementById("alert-content").innerHTML = text
    m.style.animation = "fade 5s cubic-bezier(0.7, 0, 0.84, 0)"
    m.onanimationend = () => {
        setTimeout(() => {
            m.style.animation = ""
        }, 10)
    }
}
function removeWatermarks() {
    setTimeout(() => {
        let l = pano().children[document.getElementById("pano").children.length - 2].children[0].children[0].children[0]
        let b = pano().children[document.getElementById("pano").children.length - 1]
        document.querySelector("#pano > div.gm-style > div:nth-child(11) > div.gmnoprint.gm-bundled-control.gm-bundled-control-on-bottom > div:nth-child(2) > div").style.display = "none"
        l.style.display = "none"
        b.style.display = "none"
        pano().style.opacity = 1
        checkCNT().onclick = () => {
            document.querySelector(".navigation").setAttribute("result", "")
            pano().parentElement.setAttribute("unreachable", "")
            setCorrectLocation()
        }
        nextGame().onclick = () => {
            myMap.setZoom(3)
                ++game
            if (game === 2) {

                nextGame().children[0].textContent = "Закончить игру"
            }
            if (game === 3) {
                let xhr = new XMLHttpRequest()
                xhr.open('POST', '/add_result/' + scores)
                xhr.send()
                document.location = "/"

            }
            x = 3
            document.querySelector(".navigation").removeAttribute("result")
            myMap.geoObjects.removeAll()
            canMove = true
            initialize()
            checkCNT().setAttribute("disabled", "")
            pano().parentElement.removeAttribute("unreachable")
        }
    }, 1000)
}


function initParams(a) {
    games = a
}

function setCorrectLocation() {
    canMove = false
    let latitude = panorama.getPosition().lat()
    let longitude = panorama.getPosition().lng()

    const degrees_to_radians = (degrees) => {
        return degrees * (Math.PI / 180);
    }

    let d = 12742 * Math.asin(Math.sqrt(Math.sin(degrees_to_radians((latitude - coordinates[0]) / 2)) ** 2 + Math.cos(degrees_to_radians(coordinates[0])) * Math.cos(degrees_to_radians(latitude)) * Math.sin(degrees_to_radians((longitude - coordinates[1]) / 2)) ** 2))
    d = Math.round(d)
    let r = (5000 - d * 1.3)
    r = r < 0 ? 0 : Math.round(r)
    modal(`Вы ошиблись на ${Math.round(d)} км.<br>Получено ${r} очков`)
    scores = scores + r
    let myPlacemark = new ymaps.Placemark(
        coordinates, {
            iconContent: "Вы выбрали"
        }, {
            preset: 'islands#blackStretchyIcon',
        }
    );
    let myGeoObject = new ymaps.GeoObject({
        geometry: {
            type: "LineString",
            coordinates: [
                [latitude, longitude],
                coordinates
            ],
        },
        properties: {
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
    myMap.geoObjects.add(new ymaps.Placemark([latitude, longitude], {
        iconContent: "Вы здесь"
    }, {
        preset: 'islands#blackStretchyIcon'
    }))

}

function initialize() {
    my = {
        lat: games[game][0],
        lng: games[game][1]
    }
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
    removeWatermarks()
}

function processSVData(data, status) {
    if (status === "OK") {
        const location = data.location
        panorama.setPano(location.pano)
        panorama.setOptions({
            streetViewControl: false,
            rotateView: false,
            addressControl: false,
            enableCloseButton: false,
            showRoadLabels: false,
            fullscreenControl: false,
            zoomControl: false,
            controlPosition: 'BOTTOM_LEFT'
        })
        panorama.setPov({
            heading: 270,
            pitch: 0,
        })
        panorama.setVisible(true)
    } else {
        sv.getPanorama({
                location: my,
                radius: 10 ** x,
                source: google.maps.StreetViewSource.OUTDOOR,
                preference: google.maps.StreetViewPreference.BEST
            }, processSVData)
            ++x
    }
}

ymaps.ready(init)

function init() {
    myMap = new ymaps.Map("map", {
        center: [14.3, 90.5],
        zoom: 3,
    }, {
        minZoom: 2,
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

    myMap.events.add('click', function(e) {
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