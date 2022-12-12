import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import React, { useEffect, useMemo, useState } from "react";
import { BarChart } from "./BarChart";
import {
  DataYear,
  getDataSet,
  SelectableProperty,
  stripSummerWinterInfo,
  View,
} from "./common";

import MapView from "./components/MapView";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_APIKEY;

const PropertyTabs: { label: string; value: SelectableProperty }[] = [
  { label: "Accepted students", value: "totalAccepted" },
  { label: "Total applicants", value: "totalApplicants" },
];

const ViewTabs: { label: string; value: View }[] = [
  { label: "By university", value: "University" },
  { label: "Top 20 majors", value: "Top20Majors" },
];

export const App: React.FC = () => {
  const [year, setYear] = useState<DataYear>("2022");
  const [property, setProperty] = useState<SelectableProperty>("totalAccepted");
  const [view, setView] = useState<View>("Top20Majors");

  const data = useMemo(() => getDataSet(year), [year]);

  const handleSelectYear = (y: DataYear) => {
    setYear(y);
  };

  const mapData = useMemo(() => {
    let mapData: typeof data = data;

    for (const key in mapData) {
      if (mapData.hasOwnProperty(key)) {
        const length = mapData[key].items.length;
        const sum = mapData[key].items.reduce(
          (acc, i) => (acc += i[property] ?? 0),
          0
        );

        mapData[key].location.properties["numOfItems"] = length;
        mapData[key].location.properties["propertySum"] = sum;
      }
    }
    return mapData;
  }, [property, data]);

  const barChartData = useMemo(() => {
    if (view === "University") {
      return data.map((d) => {
        const elems = d.items.reduce((acc, i) => (acc += i[property] ?? 0), 0);
        return {
          value: elems,
          name: d.location.properties.name,
        };
      });
    } else {
      return data
        .map((uni) => uni.items)
        .flat()
        .sort((x, y) => y[property] - x[property])
        .map((item) => ({
          value: item[property],
          name: stripSummerWinterInfo(item.educationAndPlace),
        }))
        .slice(0, 20);
    }
  }, [view, property, data]);

  return (
    <div style={{ display: "flex" }}>
      <div style={{ minWidth: "50vw", borderRight: "solid 1px #eee" }}>
        <MapView data={mapData} year={year} />
      </div>
      <div style={{ padding: 20, flex: 1 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div className="tabs">
            {(["2020", "2021", "2022"] as DataYear[]).map((dataYear) => (
              <button
                className={dataYear === year ? "selected" : undefined}
                onClick={() => handleSelectYear(dataYear)}
              >
                {dataYear}
              </button>
            ))}
          </div>

          <div className="tabs">
            {PropertyTabs.map((prop) => (
              <button
                className={property === prop.value ? "selected" : undefined}
                onClick={() => setProperty(prop.value)}
              >
                {prop.label}
              </button>
            ))}
          </div>
        </div>
        <div style={{ marginTop: 20 }}>
          <div className="tabs">
            {ViewTabs.map((prop) => (
              <button
                className={view === prop.value ? "selected" : undefined}
                onClick={() => setView(prop.value)}
              >
                {prop.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <BarChart height={250} width={500} data={barChartData} />
        </div>
      </div>
    </div>
  );
};
