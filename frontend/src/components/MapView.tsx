import mapboxgl, { Map } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { createContext, useEffect, useRef, useState } from "react";
import styles from "../../styles/MapView.module.css";
import { Data, DataYear } from "../common";
import { UniOverview } from "./UniOverview";
import React from "react";

interface IOverviewContext {
  overviewOpen: boolean;
  setOverViewOpen(overviewOpen: boolean): void;
}

// https://www.youtube.com/watch?v=VZHueWiL4QI

export const OverviewOpenContext = createContext<IOverviewContext>({
  overviewOpen: false,
  setOverViewOpen: () => {},
});

const MapView: React.FC<{ year: DataYear; data: Data }> = React.memo(
  ({ year, data }) => {
    const map = useRef<Map | null>(null);
    const mapContainer = useRef<any>(null);

    const [lng, setLng] = useState(10.55559);
    const [lat, setLat] = useState(56.114816);
    const [zoom, setZoom] = useState(6.5);
    const [mapData, setMapData] = useState<typeof data>([]);

    const [selectedUniversity, setSelectedUniversity] = useState<
      undefined | Data
    >(undefined);

    const [overviewOpen, setOverViewOpen] = useState<boolean>(false);

    const getUniversityFromLocation = (name: string) => {
      return data.find((obj) => obj.name === name);
    };

    const createBubbleMap = () => {
      const map = new mapboxgl.Map({
        container: mapContainer.current,
        projection: {
          name: "naturalEarth",
        },
        style: "mapbox://styles/jonasgroendahl/clboqzajm000314mj9trnovor", // "mapbox://styles/jonasgroendahl/clboqa959000515lq0um6z7e8",
        center: [lng, lat],
        zoom: zoom,
        pitchWithRotate: false,
      });

      map.setMaxBounds(map.getBounds());

      map.on("style.load", () => {
        map.setFog({
          color: "rgb(186, 210, 235)", // Lower atmosphere
          "high-color": "rgb(36, 92, 223)", // Upper atmosphere
          "horizon-blend": 0.02, // Atmosphere thickness (default 0.2 at low zooms)
          "space-color": "rgb(11, 11, 25)", // Background color
          "star-intensity": 0.6, // Background star brightness (default 0.35 at low zoooms )
        });
      });

      map.on("load", () => {
        const geojson = {
          type: "FeatureCollection",
          features: mapData.map((item) => item.location),
        };

        map.addSource("universities", {
          type: "geojson",
          //@ts-expect-error fix later
          data: geojson,
          cluster: true,
          clusterMaxZoom: 14,
          clusterRadius: 50,
        });

        map.addLayer({
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

        map.addLayer({
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

        map.addLayer({
          id: "unclustered-point",
          type: "circle",
          source: "universities",
          filter: ["!", ["has", "point_count"]],
          paint: {
            "circle-color": [
              "step",
              ["get", "propertySum"],
              "#6efa96",
              500,
              "#c9d03b",
              1500,
              "#ff9932",
              4000,
              "#ff794d",
              7000,
              "#ff5a6d",
              10000,
              "#ff4491",
              20000,
              "#f64051",
            ],
            "circle-radius": [
              "step",
              ["get", "propertySum"],
              10,
              500,
              15,
              1500,
              20,
              4000,
              25,
            ],
            "circle-stroke-width": 2,
            "circle-stroke-color": "#AAF5AB",
          },
        });

        map.on("click", (e) => {
          const features = map.queryRenderedFeatures(e.point, {
            layers: ["clusters"],
          });
          if (features[0]) {
            const clusterId = features[0].properties?.cluster_id;
            const source: mapboxgl.GeoJSONSource = map.getSource(
              "universities"
            ) as mapboxgl.GeoJSONSource;

            source.getClusterExpansionZoom(clusterId, (err: any, zoom: any) => {
              if (err) return;

              map.easeTo({
                center: features[0].geometry.coordinates, // Typescript complaining here, but it runs fine
                zoom: zoom,
              });
            });
          }
        });

        map.on("click", "unclustered-point", (e) => {
          const features = map.queryRenderedFeatures(e.point, {
            layers: ["unclustered-point"],
          });

          if (features[0]) {
            setOverViewOpen(true);
            setSelectedUniversity(
              getUniversityFromLocation(features[0].properties?.name)
            );
          }
        });

        map.on("mouseenter", "unclustered-point", () => {
          map.getCanvas().style.cursor = "pointer";
        });

        // Change it back to a pointer when it leaves.
        map.on("mouseleave", "unclustered-point", () => {
          map.getCanvas().style.cursor = "";
        });

        map.on("mouseenter", "clusters", () => {
          map.getCanvas().style.cursor = "pointer";
        });

        // Change it back to a pointer when it leaves.
        map.on("mouseleave", "clusters", () => {
          map.getCanvas().style.cursor = "";
        });
      });
    };

    useEffect(() => {
      setMapData(data);
      createBubbleMap();
    });

    return (
      <div>
        <div id="state-legend" className={styles.legend}>
          <h4>Amounts</h4>
          <div>
            <span style={{ backgroundColor: "#6efa96" }}></span>0 - 500
          </div>
          <div>
            <span style={{ backgroundColor: "#c9d03b" }}></span>1500
          </div>
          <div>
            <span style={{ backgroundColor: "#ff9932" }}></span>4000
          </div>
          <div>
            <span style={{ backgroundColor: "#ff794d" }}></span>4000
          </div>
          <div>
            <span style={{ backgroundColor: "#ff5a6d" }}></span>7500
          </div>
          <div>
            <span style={{ backgroundColor: "#ff4491" }}></span>10 000
          </div>
          <div>
            <span style={{ backgroundColor: "#f64051" }}></span>20 000
          </div>
        </div>
        {overviewOpen ? (
          <OverviewOpenContext.Provider
            value={{
              overviewOpen,
              setOverViewOpen,
            }}
          >
            <UniOverview selectedUniversity={selectedUniversity} />
          </OverviewOpenContext.Provider>
        ) : null}
        <div className={styles.mapBody} ref={mapContainer} />
      </div>
    );
  }
);

export default MapView;
