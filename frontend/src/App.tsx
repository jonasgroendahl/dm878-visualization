import React, { useEffect, useRef, useState } from "react";
import mapboxgl, { Map } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import data from "../data.json";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_APIKEY;

export const App: React.FC = () => {
  const map = useRef<Map | null>(null);
  const mapContainer = useRef<any>(null);

  const [lng, setLng] = useState(9.536354);
  const [lat, setLat] = useState(55.711311);
  const [zoom, setZoom] = useState(8);

  const [selectedUniversity, setSelectedUniversity] = useState<
    undefined | typeof data[0]
  >(undefined);

  useEffect(() => {
    if (map.current || !mapContainer.current) {
      return; // initialize map only once
    }
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/jonasgroendahl/clao6i2iz000f14p4ahoupklj",
      center: [lng, lat],
      zoom: zoom,
    });

    const addMarkers = () => {
      if (!map.current) {
        return;
      }

      for (const university of data) {
        if (university.location) {
          // Create a default Popup and add it to the map.
          const popup = new mapboxgl.Popup()
            .setText(university.name)
            .addTo(map.current);

          // Create a default Marker and add it to the map.
          const marker = new mapboxgl.Marker()
            .setLngLat([university.location.lng, university.location.lat])
            .setPopup(popup);

          marker.getElement().addEventListener("click", () => {
            console.log("selected", university);
            setSelectedUniversity(university);
          });

          marker.addTo(map.current);
        }
      }
    };

    map.current.on("load", addMarkers);
  }, [map]);

  return (
    <div>
      {selectedUniversity ? (
        <div
          style={{
            zIndex: 101,
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            position: "absolute",
            backgroundColor: "white",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          <div>
            <h2>{selectedUniversity.name}</h2>
            <button onClick={() => setSelectedUniversity(undefined)}>
              Go back
            </button>
          </div>
          <div
            style={{
              overflow: "auto",
            }}
          >
            {selectedUniversity.items
              .sort((x, y) => Number(y.totalAccepted) - Number(x.totalAccepted))
              .map((item) => {
                return (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <p style={{ fontSize: 40, marginRight: 15 }}>
                      {item.totalAccepted}
                    </p>
                    <p>{item.educationAndPlace}</p>
                  </div>
                );
              })}
          </div>
        </div>
      ) : null}
      <div
        style={{
          height: 1000,
        }}
        ref={mapContainer}
      />
    </div>
  );
};
