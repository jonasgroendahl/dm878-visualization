import * as csv from "@fast-csv/parse";
import path from "path";
import fs from "fs";
import { GeocodeSearch } from "./types";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

type SignUpInfo = {
  id: string;
  sectionId: string;
  educationAndPlace: string;
  totalAccepted: string;
  standby: string;
  totalApplicants: string;
  firstPrio: string;
  grade: string;
};

type FormattedSignUpInfo = {
  id: string;
  sectionId: string;
  educationAndPlace: string;
  totalAccepted: number;
  standby: number;
  totalApplicants: number;
  firstPrio: number;
  grade: number;
};

type GeoJsonPoint = {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties: {
    name: string;
  };
};

type UniversityWithInfo = { name: string; items: FormattedSignUpInfo[] };

type UnivervisityWithInfoAndCoords = UniversityWithInfo & {
  location: GeoJsonPoint;
};

const removeDot = (amountString: string) => amountString.replace(/\./g, "");

const formatRow = (row: SignUpInfo): FormattedSignUpInfo => {
  const formattedRow: FormattedSignUpInfo = {
    ...row,
    totalAccepted: Number(removeDot(row.totalAccepted)),
    standby: Number(removeDot(row.standby)),
    totalApplicants: Number(removeDot(row.totalApplicants)),
    firstPrio: Number(row.firstPrio),
    grade: Number(row.grade.replace(/,/g, ".")),
  };

  if (!formattedRow.totalAccepted || isNaN(formattedRow.totalAccepted)) {
    formattedRow.totalAccepted = 0;
  }
  if (!formattedRow.standby || isNaN(formattedRow.standby)) {
    formattedRow.standby = 0;
  }
  if (!formattedRow.firstPrio || isNaN(formattedRow.firstPrio)) {
    formattedRow.firstPrio = 0;
  }
  if (!formattedRow.grade || isNaN(formattedRow.grade)) {
    formattedRow.grade = 0;
  }
  if (!formattedRow.totalApplicants || isNaN(formattedRow.totalApplicants)) {
    formattedRow.totalApplicants = 0;
  }

  return formattedRow;
};

const parseCsv = (
  csvFileName: string
): Promise<{
  raw: FormattedSignUpInfo[];
  map: UniversityWithInfo[];
}> => {
  const data: FormattedSignUpInfo[] = [];

  const universityMap: UniversityWithInfo[] = [];

  return new Promise((resolve) => {
    csv
      .parseFile(path.join(__dirname, "data", "csv", csvFileName), {
        headers: [
          "id",
          "sectionId",
          "educationAndPlace",
          "totalAccepted",
          "standby",
          "totalApplicants",
          "firstPrio",
          "grade",
        ],

        delimiter: ";",
        // ignoreEmpty: true,
        trim: true,
        strictColumnHandling: true,
        discardUnmappedColumns: true,
        skipLines: 2,
      })
      .on("data", (row: SignUpInfo) => {
        // at the end of each university data, there will be aggregated number row, ignore this
        if (
          row.educationAndPlace.endsWith("i alt") ||
          row.educationAndPlace === "I alt"
        ) {
          return;
        }

        // if no section id, we know it's a blank row with the university name, add it to the map and add the following rows to it
        if (!row.sectionId) {
          universityMap.push({
            items: [],
            name: row.educationAndPlace,
          });
          return;
        }

        const formattedRow = formatRow(row);

        data.push(formattedRow);
        universityMap[universityMap.length - 1].items.push(formattedRow);
      })
      .on("end", () =>
        resolve({
          raw: data,
          map: universityMap,
        })
      );
  });
};

const getCoordinates = async (
  keyword: string
): Promise<undefined | GeoJsonPoint> => {
  const place = encodeURIComponent(keyword);

  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${place}&key=${process.env.GOOGLE_API_KEY}`
  );

  const data = (await response.json()) as GeocodeSearch;

  const firstResult = data.results[0];

  if (!firstResult) {
    return;
  }

  return {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [
        firstResult.geometry.location.lng,
        firstResult.geometry.location.lat,
      ],
    },
    properties: {
      name: keyword,
    },
  };
};

const getDataWithCoordinates = async (dataPoints: {
  raw: FormattedSignUpInfo[];
  map: UniversityWithInfo[];
}): Promise<UnivervisityWithInfoAndCoords[]> => {
  const allCoords: GeoJsonPoint[] = [];

  for (const entry of dataPoints.map) {
    const coords = await getCoordinates(entry.name);

    allCoords.push(
      coords ?? {
        geometry: {
          coordinates: [0, 0],
          type: "Point",
        },
        properties: {
          name: entry.name,
        },
        type: "Feature",
      }
    );

    console.log("coords for ", entry.name, "is ", coords);
  }

  const dataWithCoords: UnivervisityWithInfoAndCoords[] = dataPoints.map.map(
    (uni, i) => ({
      ...uni,
      location: allCoords[i],
    })
  );

  return dataWithCoords;
};

const saveData = (
  data: UnivervisityWithInfoAndCoords[],
  fileName: string,
  uniListFilePath: string
) => {
  const filePath = path.join(__dirname, "data", "parsed", fileName);
  const uniPath = path.join(__dirname, "data", "uni", uniListFilePath);

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

  fs.writeFileSync(
    uniPath,
    JSON.stringify(
      data.map((d) => d.name),
      null,
      2
    )
  );
};

const main = async () => {
  const allData2020 = await parseCsv("hovedtal-2020.csv");
  const allData2021 = await parseCsv("hovedtal-2021.csv");
  const allData2022 = await parseCsv("hovedtal-2022.csv");

  const data2020withCoords = await getDataWithCoordinates(allData2020);
  const data2021withCoords = await getDataWithCoordinates(allData2021);
  const data2022withCoords = await getDataWithCoordinates(allData2022);

  saveData(data2020withCoords, "2020.json", "2020-uni.json");
  saveData(data2021withCoords, "2021.json", "2021-uni.json");
  saveData(data2022withCoords, "2022.json", "2022-uni.json");
};

main();
