import mapboxgl, { Map } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { createContext, useEffect, useRef, useState } from "react";
import data from "../../../data/parsed/2022.json";
import styles from "../../styles/MapView.module.css";
import { UniOverview } from "./UniOverview";

interface IOverviewContext {
  overviewOpen: boolean;
  setOverViewOpen(overviewOpen: boolean): void;
}

export const OverviewOpenContext = createContext<IOverviewContext>({
  overviewOpen: false,
  setOverViewOpen: () => {},
});

const MapView = () => {
  const map = useRef<Map | null>(null);
  const mapContainer = useRef<any>(null);

  const [lng, setLng] = useState(9.536354);
  const [lat, setLat] = useState(55.711311);
  const [zoom, setZoom] = useState(8);

  const [selectedUniversity, setSelectedUniversity] = useState<
    undefined | typeof data[0]
  >(undefined);

  const [overviewOpen, setOverViewOpen] = useState<boolean>(false);
  const toggleOverviewOpen = () => {
    setOverViewOpen(!overviewOpen);
  };

  const addBubbles = () => {
    const bubbleMap = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/jonasgroendahl/clao6i2iz000f14p4ahoupklj",
      center: [lng, lat],
      zoom: zoom,
    });

    bubbleMap.on("load", () => {
      bubbleMap.addSource("universities", {
        type: "geojson",
        data: "./geodata.geojson",
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      });

      bubbleMap.addLayer({
        id: "clusters",
        type: "circle",
        source: "universities",
        filter: ["has", "point_count"],
        paint: {
          // Use step expressions (https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
          // with three steps to implement three types of circles:
          //   * Blue, 20px circles when point count is less than 100
          //   * Yellow, 30px circles when point count is between 100 and 750
          //   * Pink, 40px circles when point count is greater than or equal to 750
          "circle-color": [
            "step",
            ["get", "point_count"],
            "#51bbd6",
            3,
            "#f1f075",
            6,
            "#f28cb1",
          ],
          "circle-radius": [
            "step",
            ["get", "point_count"],
            20,
            100,
            30,
            750,
            140,
          ],
        },
      });

      bubbleMap.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "universities",
        filter: ["has", "point_count"],
        layout: {
          "text-field": ["get", "point_count_abbreviated"],
          "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
          "text-size": 12,
        },
      });

      bubbleMap.addLayer({
        id: "unclustered-point",
        type: "circle",
        source: "universities",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": "#11b4da",
          "circle-radius": 12,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#fff",
        },
      });
    });
  };

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
          .setLngLat([
            university.location.geometry.coordinates[1],
            university.location.geometry.coordinates[0],
          ])
          .setPopup(popup);

        marker.getElement().addEventListener("click", () => {
          console.log("selected", university);
          setSelectedUniversity(university);
          setOverViewOpen(true);
        });

        marker.addTo(map.current);
      }
    }
  };

  useEffect(() => {
    addBubbles();
  }, []);

  // useEffect(() => {
  //   if (map.current || !mapContainer.current) {
  //     return; // initialize map only once
  //   }
  //   map.current = new mapboxgl.Map({
  //     container: mapContainer.current,
  //     style: "mapbox://styles/jonasgroendahl/clao6i2iz000f14p4ahoupklj",
  //     center: [lng, lat],
  //     zoom: zoom,
  //   });

  //   addMarkers();

  //   map.current.on("load", addMarkers);
  // }, [map]);

  return (
    <div>
      <OverviewOpenContext.Provider
        value={{
          overviewOpen,
          setOverViewOpen,
        }}
      >
        <UniOverview selectedUniversity={selectedUniversity} />
      </OverviewOpenContext.Provider>
      <div className={styles.mapBody} ref={mapContainer} />
    </div>
  );
};

export default MapView;
