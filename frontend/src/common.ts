import data2022 from "../../data/parsed/2022.json";
import data2021 from "../../data/parsed/2021.json";
import data2020 from "../../data/parsed/2020.json";

export type DataYear = "2020" | "2021" | "2022" | "2019" | "2018";

export type Data = typeof data2022;

export type SelectableProperty = keyof Pick<
  Data[number]["items"][number],
  "totalAccepted" | "totalApplicants"
>;

export type View = "University" | "Top20Majors" | "Overall" | "Least20";

export type TopNavView = "ByYear" | "Historic";

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

export const stripSummerWinterInfo = (label: string) => {
  const partOfStringNeedsRemoval = label.indexOf("Studiestart");
  const partOfStringNeedsRemoval2 = label.indexOf("Study start");

  if (partOfStringNeedsRemoval) {
    return label.slice(0, partOfStringNeedsRemoval - 2);
  }
  if (partOfStringNeedsRemoval2) {
    return label.slice(0, partOfStringNeedsRemoval2 - 2);
  }
  return label;
};

export const stripeUniInfo = (label: string) => {
  const profBach = label.indexOf("Professionsbachelor");
  const comma = label.indexOf(",");

  console.log(label, profBach);

  if (profBach !== -1) {
    return label.slice(profBach + 20);
  } else if (comma !== -1) {
    return label.slice(0, comma);
  }

  return label;
};
