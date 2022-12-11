import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import React, { useMemo, useState } from "react";
import {
  VictoryAxis,
  VictoryBar,
  VictoryChart,
  VictoryLabel,
  VictoryTheme,
} from "victory";
import { Data, getDataSet, SelectableProperty } from "./common";

import MapView from "./components/MapView";
import { DataYear } from "./types";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_APIKEY;

export const App: React.FC = () => {
  const [year, setYear] = useState<DataYear>("2022");
  const [property, setProperty] = useState<SelectableProperty>("totalAccepted");

  const data = useMemo(() => getDataSet(year), [year]);

  const handleSelectYear = (y: DataYear) => {
    setYear(y);
  };

  return (
    <div style={{ display: "flex" }}>
      <div style={{ width: "60vw", borderRight: "solid 1px #eee" }}>
        <MapView data={data} year={year} />
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
            {["totalAccepted", "totalApplicants"].map((prop) => (
              <button
                className={property === prop ? "selected" : undefined}
                onClick={() =>
                  setProperty(prop as "totalAccepted" | "totalApplicants")
                }
              >
                {prop}
              </button>
            ))}
          </div>
        </div>
        <div>
          <VictoryChart
            theme={VictoryTheme.material}
            domainPadding={{
              y: 200,
            }}
            height={800}
            width={400}
          >
            <VictoryAxis />
            <VictoryAxis dependentAxis />
            <VictoryBar
              width={200}
              horizontal={true}
              data={data.map((d) => {
                const elems = d.items.reduce(
                  (acc, i) => (acc += i[property] ?? 0),
                  0
                );
                return {
                  y: elems,
                  x: d.location.properties.name,
                };
              })}
              style={{
                data: { fill: "#c43a31" },
              }}
            />
          </VictoryChart>
        </div>
      </div>
    </div>
  );
};
