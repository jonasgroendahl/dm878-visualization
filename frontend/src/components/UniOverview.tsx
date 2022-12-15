import { useContext, useEffect, useState } from "react";
import {
  VictoryAxis,
  VictoryBar,
  VictoryChart,
  VictoryLabel,
  VictoryLegend,
  VictoryStack,
} from "victory";
import data from "../../../data/parsed/2022.json";
import styles from "../../styles/UniOverview.module.css";
import { BarChart } from "../BarChart";
import {
  Data,
  DataYear,
  getDataSet,
  stripeUniInfo,
  stripSummerWinterInfo,
} from "../common";
import { OverviewOpenContext } from "./MapView";

interface UniData {
  selectedUniversity: undefined | typeof data[number];
  year: DataYear;
}

export const UniOverview: React.FC<UniData> = ({
  selectedUniversity,
  year,
}) => {
  const { overviewOpen, setOverViewOpen } = useContext(OverviewOpenContext);

  const [selectedDataSet, setSelectedDataSet] = useState<
    undefined | typeof data[number]
  >();
  const [selectedYear, setSelectedYear] = useState<DataYear | undefined>();

  useEffect(() => {
    setSelectedDataSet(selectedUniversity);
    setSelectedYear(year);
  }, [selectedUniversity, year]);

  const mostDifficultMajors = selectedDataSet?.items
    .map((item) => {
      return {
        ratio: item.totalApplicants / item.totalAccepted,
        name: stripeUniInfo(stripSummerWinterInfo(item.educationAndPlace)),
        originalName: item.educationAndPlace,
        accepted: item.totalAccepted,
        applicants: item.totalApplicants,
      };
    })
    .sort((x, y) => y.ratio - x.ratio)
    .slice(0, 5);

  const dataPointsOtherYears: DataYear[] = [
    { y: "2018", data: getDataSet("2018") },
    { y: "2019", data: getDataSet("2019") },
    { y: "2020", data: getDataSet("2020") },
    { y: "2021", data: getDataSet("2021") },
    { y: "2022", data: getDataSet("2022") },
  ]
    .filter((set) => {
      const thisUniversityItems = set.data.find(
        (s) => s.name === selectedUniversity?.name
      );
      if (thisUniversityItems) {
        return true;
      }
      return false;
    })
    .map((d) => d.y as DataYear);

  console.log("most diff", mostDifficultMajors);

  return (
    <>
      {selectedUniversity && overviewOpen ? (
        <div className={styles.overviewBody}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "5px 20px",
              boxSizing: "border-box",
              width: "100%",
            }}
          >
            <h2>{selectedUniversity.name}</h2>
            <div style={{ flexGrow: 1 }} />
            <div>
              <p style={{ textAlign: "center", marginBottom: 5 }}>
                Data also available for following years
              </p>
              <div className="tabs">
                {dataPointsOtherYears.map((d) => (
                  <button
                    className={d === selectedYear ? "selected" : ""}
                    onClick={() => {
                      setSelectedYear(d);
                      setSelectedDataSet(
                        getDataSet(d).find(
                          (set) => set.name === selectedUniversity.name
                        )
                      );
                    }}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <button
              className="close-button"
              onClick={() => setOverViewOpen(false)}
              style={{ paddingLeft: 50 }}
            >
              ✖
            </button>
          </div>
          <div className={styles.uniListView}>
            {selectedDataSet?.items
              .sort((x, y) => Number(y.totalAccepted) - Number(x.totalAccepted))
              .map((item) => {
                return (
                  <div className={styles.uniListItem}>
                    <p className={styles.numOfAccepted}>{item.totalAccepted}</p>
                    <p>{item.educationAndPlace}</p>
                  </div>
                );
              })}
          </div>
          <div>
            <p className="tabs-headline">Most difficult major to get in</p>
            <VictoryChart
              width={1000}
              horizontal
              padding={{
                left: 300,
                top: 20,
                bottom: 30,
                right: 20,
              }}
              domainPadding={20}
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
                />
                <VictoryBar
                  data={mostDifficultMajors?.map((m) => {
                    return {
                      x: m.originalName,
                      y: m.accepted,
                      name: m.name,
                    };
                  })}
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
        </div>
      ) : null}
    </>
  );
};
