import mapboxgl, { Map } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { createContext, useEffect, useRef, useState } from "react";
import styles from "../../styles/MapView.module.css";
import { Data, DataYear } from "../common";
import { UniOverview } from "./UniOverview";

interface IOverviewContext {
  overviewOpen: boolean;
  setOverViewOpen(overviewOpen: boolean): void;
}

export const OverviewOpenContext = createContext<IOverviewContext>({
  overviewOpen: false,
  setOverViewOpen: () => {},
});

const MapView: React.FC<{ year: DataYear; data: Data }> = ({ year, data }) => {
  const map = useRef<Map | null>(null);
  const mapContainer = useRef<any>(null);

  const [lng, setLng] = useState(9.536354);
  const [lat, setLat] = useState(55.711311);
  const [zoom, setZoom] = useState(8);

  const [selectedUniversity, setSelectedUniversity] = useState<
    undefined | Data
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
      pitchWithRotate: false,
    });

    bubbleMap.on("load", () => {
      const geojson = {
        type: "FeatureCollection",
        features: data.map((item) => item.location),
      };

      bubbleMap.addSource("universities", {
        type: "geojson",
        //@ts-expect-error fix later
        data: geojson,
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

  useEffect(() => {
    addBubbles();
  }, [year]);

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
