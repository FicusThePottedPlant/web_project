ymaps.ready(init);
var myMap;

function init() {
    myMap = new ymaps.Map("map", {
        center: [57.5262, 38.3061],
        zoom: 13
    }, {
        balloonMaxWidth: 200,
        searchControlProvider: 'yandex#search',
        suppressMapOpenBlock: true
    });
    myMap.controls.remove('searchControl');
    myMap.controls.remove('typeSelector');
    myMap.controls.remove('routeButtonControl');
    myMap.controls.remove('fullscreenControl');
    myMap.controls.remove('trafficControl');
    myMap.controls.remove('rulerControl');
    myMap.controls.remove('geolocationControl');
    myMap.controls.remove('zoomControl');
    myMap.controls.remove('routePanelControl');
    myMap.cursors.push('arrow');
    myMap.behaviors.enable('scrollZoom');
    // Обработка события, возникающего при щелчке
    // левой кнопкой мыши в любой точке карты.
    // При возникновении такого события откроем балун.
    myMap.events.add('click', function (e) {
        var coords = e.get('coords');
        myMap.geoObjects.removeAll();
        var myPlacemark = new ymaps.Placemark(
            coords
        );
        myMap.geoObjects.add(myPlacemark);
    });
}