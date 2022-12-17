import React from "react";
import {
  VictoryChart,
  VictoryAxis,
  VictoryLabel,
  VictoryStack,
  VictoryBar,
  VictoryLegend,
  VictoryTooltip,
  VictoryVoronoiContainer,
} from "victory";
import { Data, stripeUniInfo, stripSummerWinterInfo } from "./common";

interface IMostDifficultProps {
  data?: Data[number];
}

export const MostDifficult: React.FC<IMostDifficultProps> = ({ data }) => {
  if (!data) {
    return null;
  }

  const mostDifficultMajors = data.items
    .map((item) => {
      return {
        ratio: item.firstPrio / item.totalAccepted,
        name: stripeUniInfo(stripSummerWinterInfo(item.educationAndPlace)),
        originalName: item.educationAndPlace,
        accepted: item.totalAccepted,
        applicants: item.totalApplicants,
      };
    })
    .sort((x, y) => y.ratio - x.ratio)
    .slice(0, 5);

  return (
    <div
      style={{
        marginTop: 10,
        marginBottom: 30,
        border: "solid 3px #eee",
        borderRadius: 10,
      }}
    >
      <p className="tabs-headline" style={{ textAlign: "center" }}>
        Top 5 most difficult majors to get into
      </p>
      <VictoryChart
        width={1000}
        horizontal
        padding={{
          left: 300,
          top: 50,
          bottom: 30,
          right: 20,
        }}
        domainPadding={20}
        containerComponent={<VictoryVoronoiContainer />}
      >
        <VictoryAxis
          tickLabelComponent={
            <VictoryLabel
              text={(c) => mostDifficultMajors?.[c.index].name ?? ""}
              style={{
                fontSize: 10,
              }}
            />
          }
        />
        <VictoryAxis dependentAxis />
        <VictoryStack colorScale={["tomato", "orange"]}>
          <VictoryBar
            data={mostDifficultMajors?.map((m) => {
              return {
                x: m.originalName,
                y: m.applicants,
                name: m.name,
              };
            })}
            labelComponent={<VictoryTooltip />}
          />
          <VictoryBar
            data={mostDifficultMajors?.map((m) => {
              return {
                x: m.originalName,
                y: m.accepted,
                name: m.name,
              };
            })}
            labelComponent={<VictoryTooltip />}
          />
        </VictoryStack>
        <VictoryLegend
          data={[
            {
              name: "Applied",
              symbol: {
                fill: "tomato",
              },
            },
            {
              name: "Accepted",
              symbol: {
                fill: "orange",
              },
            },
          ]}
          x={0}
        />
      </VictoryChart>
    </div>
  );
};
