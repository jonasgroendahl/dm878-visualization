import mapboxgl, { Map } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import React, { useEffect, useRef, useState } from "react";
import data from "../data.json";
import MapView from "./components/MapView";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_APIKEY;

export const App: React.FC = () => {
  return (
    <div>
      <MapView />
    </div>
  );
};
