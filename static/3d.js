      let map;
      let panorama;

      function initialize() {
        const berkeley = { lat: {{lat}}, lng:{{lng}} };
        const sv = new google.maps.StreetViewService();
        panorama = new google.maps.StreetViewPanorama(
          document.getElementById("pano")
        );
        // Set up the map.
        map = new google.maps.Map(document.getElementById("map"), {
          center: berkeley,
          zoom: 16,
          streetViewControl: false,

        });
        // Set the initial Street View camera to the center of the map
        sv.getPanorama({ location: berkeley, radius: 5000000000000, source: 'outdoor',preference: google.maps.StreetViewPreference.NEAREST,
        addressControl:false, enableCloseButton:false,showRoadLabels:false,fullscreenControl:false,
        }, processSVData);
      }

      function processSVData(data, status) {
        if (status === "OK") {
          const location = data.location;
          const marker = new google.maps.Marker({
            position: location.latLng,
            map,
            title: location.description,
          });
          panorama.setPano(location.pano);
          panorama.setPov({
            heading: 270,
            pitch: 0,
          });
          panorama.setVisible(true);
          };
        }


