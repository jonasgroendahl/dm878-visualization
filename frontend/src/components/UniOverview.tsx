import { useContext, useEffect, useState } from "react";
import data from "../../data.json";
import styles from "../../styles/UniOverview.module.css";
import { OverviewOpenContext } from "./MapView";

interface uniData {
  selectedUniversity: undefined | typeof data[0];
}

const UniOverview = ({ selectedUniversity }: uniData) => {
  const { overviewOpen, setOverViewOpen } = useContext(OverviewOpenContext);

  return (
    <>
      {selectedUniversity && overviewOpen ? (
        <div className={styles.overviewBody}>
          <div className={styles.someDiv}>some text</div>
          <div>
            <h2>{selectedUniversity.name}</h2>
            <button onClick={() => setOverViewOpen(!overviewOpen)}>
              Go back
            </button>
          </div>
          <div className={styles.uniListView}>
            {selectedUniversity.items
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
        </div>
      ) : null}
    </>
  );
};

export default UniOverview;
