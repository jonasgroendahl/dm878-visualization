import {
  Data,
  stripAllButSeasonInfo,
  stripeUniInfo,
  stripSummerWinterInfo,
} from "../common";

import {
  Slice,
  VictoryAxis,
  VictoryBar,
  VictoryChart,
  VictoryLabel,
  VictoryLegend,
  VictoryPie,
  VictoryStack,
  VictoryTooltip,
  VictoryVoronoiContainer,
} from "victory";

import { useState } from "react";
import styles from "../../styles/SummerWinter.module.css";

interface ISummerWinterProps {
  data?: Data[number];
}

const SummerWinter: React.FC<ISummerWinterProps> = ({ data }) => {
  if (!data) {
    return null;
  }

  const [seasonSelected, setSeasonSelected] = useState<string>("Total");

  const summerStart = data.items.filter(
    (item) =>
      item.educationAndPlace.includes("Summer start") ||
      item.educationAndPlace.includes("sommer")
  );

  const winterStart = data.items.filter(
    (item) =>
      item.educationAndPlace.includes("vinterstart") ||
      item.educationAndPlace.includes("Winter start")
  );

  const totalAcceptedForSeason = (season: string) => {
    if (season === "Summer start") {
      return summerStart.reduce(
        (acc, current) => acc + current.totalAccepted,
        0
      );
    } else if (season === "Winter start") {
      return winterStart.reduce(
        (acc, current) => acc + current.totalAccepted,
        0
      );
    } else
      return data.items.reduce(
        (acc, current) => acc + current.totalAccepted,
        0
      );
  };

  const totalApplicantsForSeason = (season: string) => {
    if (season === "Summer start") {
      return summerStart.reduce(
        (acc, current) => acc + current.totalApplicants,
        0
      );
    } else if (season === "Winter start") {
      return winterStart.reduce(
        (acc, current) => acc + current.totalApplicants,
        0
      );
    } else
      return data.items.reduce(
        (acc, current) => acc + current.totalApplicants,
        0
      );
  };

  const totalProgrammesForSeason = (season: string) => {
    if (season === "Summer start") {
      return summerStart.length;
    } else if (season === "Winter start") {
      return winterStart.length;
    } else return data.items.length;
  };

  return (
    <div className={styles.summerWinterBody}>
      <VictoryPie
        height={300}
        colorScale={["tomato", "orange"]}
        labelComponent={<VictoryLabel style={{ fontSize: "11px" }} />}
        events={[
          {
            target: "data",
            eventHandlers: {
              onMouseDown: (_event, _data) => {
                return [
                  {
                    eventKey: "all", // reset style for all bars, default target goes to data
                    mutation: () => undefined,
                  },
                ];
              },
              onMouseUp: (_event, _data) => {
                return [
                  {
                    // eventKey: 'all', // reset style for all bars, default target goes to data
                    mutation: (props) => {
                      setSeasonSelected(props.datum.label);
                      // set selected bar red - target "data" is default and eventKey is current element
                      if (props.datum.label === seasonSelected) {
                        if (seasonSelected === "Winter start") {
                          setSeasonSelected("Total");
                          return { style: { fill: "orange" } };
                        } else if (seasonSelected === "Summer start") {
                          setSeasonSelected("Total");
                          return { style: { fill: "tomato" } };
                        }
                      } else {
                        return {
                          style: Object.assign({}, props.style, {
                            fill: "red",
                          }),
                        };
                      }
                    },
                  },
                ];
              },
            },
          },
        ]}
        data={[
          { x: 1, y: summerStart.length, label: "Summer start" },
          { x: 2, y: winterStart.length, label: "Winter start" },
        ]}
      />

      <div className={styles.sumWinTable}>
        <h3>{seasonSelected}</h3>
        <span>Total Accepted: {totalAcceptedForSeason(seasonSelected)}</span>
        <span>
          Total Applicants: {totalApplicantsForSeason(seasonSelected)}
        </span>
        <span>
          Number of programms: {totalProgrammesForSeason(seasonSelected)}
        </span>
      </div>
    </div>
  );
};

export default SummerWinter;
