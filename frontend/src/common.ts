import data2022 from "../../data/parsed/2022.json";
import data2021 from "../../data/parsed/2021.json";
import data2020 from "../../data/parsed/2020.json";
import { DataYear } from "./types";

export type Data = typeof data2022;

export type SelectableProperty = keyof Pick<
  Data[number]["items"][number],
  "totalAccepted" | "totalApplicants"
>;

export const getDataSet = (y: DataYear) => {
  switch (y) {
    case "2022":
      return data2022;
    case "2021":
      return data2021;
    case "2020":
    default:
      return data2020;
  }
};
