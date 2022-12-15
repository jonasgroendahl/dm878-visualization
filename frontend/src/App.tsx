import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import React, { useMemo, useState } from "react";
import { VictoryChart, VictoryLine, VictoryTheme } from "victory";
import { BarChart } from "./BarChart";
import {
  DataYear,
  getDataSet,
  SelectableProperty,
  stripSummerWinterInfo,
  TopNavView,
  View,
} from "./common";
import { HistoricView } from "./components/HistoricView";

import MapView from "./components/MapView";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_APIKEY;

const PropertyTabs: { label: string; value: SelectableProperty }[] = [
  { label: "Accepted students", value: "totalAccepted" },
  { label: "Total applicants", value: "totalApplicants" },
];

const ViewTabs: { label: string; value: View }[] = [
  { label: "By university", value: "University" },
  { label: "Top 20 majors", value: "Top20Majors" },
  { label: "20 Least popular", value: "Least20" },
];

const TopNavViews: { label: string; value: TopNavView }[] = [
  { label: "By year", value: "ByYear" },
  { label: "Historical", value: "Historic" },
];

export const App: React.FC = () => {
  const [year, setYear] = useState<DataYear>("2022");
  const [property, setProperty] = useState<SelectableProperty>("totalAccepted");
  const [view, setView] = useState<View>("University");
  const [topNavView, setTopNavView] = useState<TopNavView>("ByYear");
  const [pagination, setPagination] = useState(0);

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
        .sort((x, y) =>
          view === "Least20"
            ? x[property] - y[property]
            : y[property] - x[property]
        )
        .map((item) => ({
          value: item[property],
          name: stripSummerWinterInfo(item.educationAndPlace),
        }))
        .slice(0, 20);
    }
  }, [view, property, data, pagination]);

  const allViewTabs: typeof ViewTabs = useMemo(() => {
    if (topNavView === "Historic") {
      setView("Overall");
      return [
        {
          label: "Overall",
          value: "Overall",
        },
      ];
    }

    setView("University");
    return ViewTabs;
  }, [topNavView]);

  return (
    <div style={{ display: "flex" }}>
      <div style={{ minWidth: "50vw", borderRight: "solid 1px #eee" }}>
        <MapView data={mapData} year={year} />
      </div>
      <div style={{ flex: 1 }}>
        <div className="tabs top">
          {TopNavViews.map((view) => (
            <button
              className={view.value === topNavView ? "selected" : undefined}
              onClick={() => setTopNavView(view.value)}
            >
              {view.label}
            </button>
          ))}
        </div>
        <div style={{ padding: 20 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <div>
              <p className="tabs-headline">Metric:</p>
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
            <div>
              <div>
                <p className="tabs-headline">View:</p>
                <div className="tabs">
                  {allViewTabs.map((prop) => (
                    <button
                      key={prop.label}
                      className={view === prop.value ? "selected" : undefined}
                      onClick={() => setView(prop.value)}
                    >
                      {prop.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        {topNavView === "ByYear" ? (
          <div style={{ paddingLeft: 20, paddingRight: 20 }}>
            <p className="tabs-headline">Year:</p>
            <div className="tabs year">
              {(["2018", "2019", "2020", "2021", "2022"] as DataYear[]).map(
                (dataYear) => (
                  <button
                    className={dataYear === year ? "selected" : undefined}
                    onClick={() => handleSelectYear(dataYear)}
                  >
                    {dataYear}
                  </button>
                )
              )}
            </div>
            <BarChart height={250} width={700} data={barChartData} />
          </div>
        ) : (
          <HistoricView view={view} property={property} />
        )}
      </div>
    </div>
  );
};
