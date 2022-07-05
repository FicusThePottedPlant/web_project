let map
let myMap
let panorama
let scores = 0
let canMove = true // can move marker on 2d map
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

// pretty alert
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

// function for mobile adaptation
function showNavigation() {
    // open mini-map
    if (innerWidth <= 880) {
        document.getElementById("show-navigation").style.display = "none"
        document.querySelector(".navigation").style.display = "block"
    }
}

function toggleCloseNavigationButton() {
    // show button to close
    if (innerWidth <= 880) {
        let btn = document.querySelector(".navigation .close")

        if (btn.style.display !== "none") {
            btn.style.display = "none"
        } else {
            btn.style.display = "flex"
        }
    }
}

function closeNavigation() {
    // close minimap
    if (innerWidth <= 880) {
        document.getElementById("show-navigation").style.display = "flex"
        document.querySelector(".navigation").style.display = "none"
    }
}

function handleEvents() {
    setTimeout(() => {
        // delete compass and other elements from panorama
let b = pano().children[document.getElementById("pano").children.length - 1]
let w = Array.from(pano().querySelectorAll(".gm-style"))
console.log(w)
let q = w[w.length-1].children[1].children[0]
q.children[q.childElementCount - 2].children[0].style.display = "none"
b.style.display = "none"
        pano().style.height = "110vh"
        pano().style.opacity = 1
        nextGame().onclick = () => {
            // set new level
            myMap.setZoom(coeff == 1000.3 ? 10 : 3)
            ++game
            document.getElementById("game").innerHTML = (game + 1) + '/3'
            // and change behaviour of button next-game
            if (game === 2) {
                nextGame().children[0].textContent = "Закончить игру"
            }
            if (game === 3) {
                // sending post request to server to add scores in db
                let xhr = new XMLHttpRequest()
                xhr.open('POST', '/add_result/' + scores)
                xhr.send()
                document.location = "/"

            }
            x = 3
            document.querySelector(".navigation").removeAttribute("result")
            myMap.geoObjects.removeAll()
            canMove = true
            setPanorama()
            toggleCloseNavigationButton()
            closeNavigation()
            checkCNT().setAttribute("disabled", "")
            pano().parentElement.removeAttribute("unreachable")
        }
        checkCNT().onclick = () => {
            // handle click on 'Ответить'
            if (!checkCNT().hasAttribute("disabled")) {
                document.querySelector(".navigation").setAttribute("result", "")
                pano().parentElement.setAttribute("unreachable", "")
                setCorrectLocation()
            }
        }
    }, 1000)
}

// handling from html jinja2 attributes
function initParams(a, scores_c) {
    games = a
    coeff = scores_c
}

function setCorrectLocation() {
    canMove = false
    // get lat and lng of panorama position
    let latitude = panorama.getPosition().lat()
    let longitude = panorama.getPosition().lng()

    const degrees_to_radians = (degrees) => {
        return degrees * (Math.PI / 180);
    }
    // calculate distance between 2 points
    let d = 12742 * Math.asin(Math.sqrt(Math.sin(degrees_to_radians((latitude - coordinates[0]) / 2)) ** 2 + Math.cos(degrees_to_radians(coordinates[0])) * Math.cos(degrees_to_radians(latitude)) * Math.sin(degrees_to_radians((longitude - coordinates[1]) / 2)) ** 2))
    d = Math.round(d)
    let r = (5000 - d * coeff) // calculate scores
    r = r < 0 ? 0 : Math.round(r)
    // show pretty alert
    modal(`Вы ошиблись на ${Math.round(d)} км.<br>Получено ${r} очков`)
    toggleCloseNavigationButton()
    scores = scores + r
    document.getElementById("scores").innerHTML = scores
    // set placemark on location which you choose
    let myPlacemark = new ymaps.Placemark(
        coordinates, {
            iconContent: "Вы выбрали"
        }, {
            preset: 'islands#blackStretchyIcon',
        }
    );
    // draw a line which connects placemarks
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
    // show where the right position was
    myMap.geoObjects.add(new ymaps.Placemark([latitude, longitude], {
        iconContent: "Вы здесь"
    }, {
        preset: 'islands#blackStretchyIcon'
    }))

}

function setPanorama() {
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
    // recursively search for panorama using google function
    sv.getPanorama({
        location: my,
        radius: 100,
        source: google.maps.StreetViewSource.OUTDOOR,
        preference: google.maps.StreetViewPreference.BEST
    }, processSVData)
    handleEvents()
}

// getting a panorama
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
            MotionTrackingControlOptions: 'LEFT_BOTTOM',
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


ymaps.ready(init) // initialize map of js yandex map API

function init() {
    myMap = new ymaps.Map("map", {
        center: coeff == 1000.3 ? [games[0][0], games[0][1]] : [14.3, 90.5],
        zoom: coeff == 1000.3 ? 10 : 3,
    }, {
        minZoom: 2,
        searchControlProvider: 'yandex#search',
        // yandexMapDisablePoiInteractivity: true
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

    // handling click on map to set a marker
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