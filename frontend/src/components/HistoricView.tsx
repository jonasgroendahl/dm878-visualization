import React, { useEffect, useMemo, useRef } from "react";
import { VictoryChart, VictoryTheme, VictoryLine } from "victory";
import { getDataSet, SelectableProperty, View } from "../common";
import * as d3 from "d3";

interface IHistoricViewProps {
  view: View;
  property: SelectableProperty;
}

export const HistoricView: React.FC<IHistoricViewProps> = ({
  property,
  view,
}) => {
  const sets = [
    { year: "2018", data: getDataSet("2018") },
    { year: "2019", data: getDataSet("2019") },
    { year: "2020", data: getDataSet("2020") },
    { year: "2021", data: getDataSet("2021") },
    { year: "2022", data: getDataSet("2022") },
  ];

  const dataPoints = sets.reduce((a: { x: string; y: number }[], c) => {
    const total = c.data.reduce(
      (ax, cy) => (ax += cy.items.reduce((a, b) => (a += b[property]), 0)),
      0
    );

    a.push({
      x: c.year,
      y: total,
    });
    return a;
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <VictoryChart
        domainPadding={20}
        width={700}
        theme={VictoryTheme.material}
      >
        <VictoryLine
          style={{
            data: { stroke: "#c43a31" },
            parent: { border: "1px solid #ccc" },
          }}
          data={dataPoints}
          labels={({ datum }) => datum.label}
        />
      </VictoryChart>
    </div>
  );
};
