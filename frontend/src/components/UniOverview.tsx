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
import { MostDifficult } from "../MostDifficult";
import { OverviewOpenContext } from "./MapView";
import SummerWinter from "./summerWinter";

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

  const items = selectedDataSet?.items.sort(
    (x, y) => Number(y.totalAccepted) - Number(x.totalAccepted)
  );

  return (
    <>
      {selectedUniversity && overviewOpen ? (
        <div className={styles.overviewBody}>
          <div className={styles.topBar}>
            <button
              className="close-button"
              onClick={() => setOverViewOpen(false)}
              style={{ paddingRight: 20, paddingTop: 5 }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="40"
                height="40"
                fill="currentColor"
                class="bi bi-chevron-left"
                viewBox="0 0 15 15"
              >
                {" "}
                <path
                  fill-rule="evenodd"
                  d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"
                />{" "}
              </svg>
            </button>
            <h1>{selectedUniversity.name}</h1>
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
          </div>
          <div>
            <div className={styles.uniListView}>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Applicants</th>
                    <th>Accepted</th>
                    <th>Prio 1</th>
                    <th>Grade</th>
                    <th>Standby</th>
                    <th>Season</th>
                  </tr>
                </thead>
                <tbody>
                  {items?.map((item) => {
                    return (
                      <tr>
                        <td>
                          {stripeUniInfo(
                            stripSummerWinterInfo(item.educationAndPlace)
                          )}
                        </td>
                        <td>{item.totalApplicants}</td>
                        <td>{item.totalAccepted}</td>
                        <td>{item.firstPrio}</td>
                        <td>{item.grade}</td>
                        <td>{item.standby}</td>
                        <td>
                          {item.educationAndPlace.includes("sommer") ? (
                            <img
                              src="https://cdn-icons-png.flaticon.com/512/169/169367.png"
                              height={30}
                            />
                          ) : null}
                          {item.educationAndPlace.includes("vinter") ? (
                            <img
                              src="https://cdn-icons-png.flaticon.com/512/2077/2077008.png"
                              height={30}
                            />
                          ) : null}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <hr />
            <MostDifficult data={selectedDataSet} />
            <div>
              <SummerWinter data={selectedDataSet} />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};
