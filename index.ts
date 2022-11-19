import * as csv from "@fast-csv/parse";
import path from "path";
import fs from "fs";
import { GeocodeSearch } from "./types";
import dotenv from "dotenv";

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

type LatLng = { lat: number; lng: number };

type UniversityWithInfo = { name: string; items: SignUpInfo[] };

const parseCsv = (): Promise<{
  raw: SignUpInfo[];
  map: UniversityWithInfo[];
}> => {
  const data: SignUpInfo[] = [];

  const universityMap: UniversityWithInfo[] = [];

  return new Promise((resolve) => {
    csv
      .parseFile(path.join(__dirname, "./hovedtal-2022.csv"), {
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

        data.push(row);
        universityMap[universityMap.length - 1].items.push(row);
      })
      .on("end", () =>
        resolve({
          raw: data,
          map: universityMap,
        })
      );
  });
};

const getCoordinates = async (keyword: string): Promise<undefined | LatLng> => {
  const place = encodeURIComponent(keyword);

  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${place}&key=${process.env.GOOGLE_API_KEY}`
  );

  const data: GeocodeSearch = await response.json();

  console.log("firstResult", data);

  const firstResult = data.results[0];

  if (!firstResult) {
    return;
  }

  return {
    lat: firstResult.geometry.location.lat,
    lng: firstResult.geometry.location.lng,
  };
};

const main = async () => {
  const allData = await parseCsv();
  console.log(allData.raw.length);
  console.log(allData.map);

  const allCoords: LatLng[] = [];

  for (const entry of allData.map) {
    const coords = await getCoordinates(entry.name);

    allCoords.push(coords ?? { lat: 0, lng: 0 });

    console.log("coords for ", entry.name, "is ", coords);
  }

  const dataWithCoords: (UniversityWithInfo & { location: LatLng })[] =
    allData.map.map((uni, i) => ({
      ...uni,
      location: allCoords[i],
    }));

  const filePath = path.join(__dirname, "frontend", "data.json");
  //const filePath = path.join(__dirname, "test.json"); //
  const uniFilePath = path.join(__dirname, "uni.json");

  fs.writeFileSync(filePath, JSON.stringify(dataWithCoords, null, 2));
  fs.writeFileSync(
    uniFilePath,
    JSON.stringify(
      dataWithCoords.map((d) => d.name),
      null,
      2
    )
  );
};

main();
