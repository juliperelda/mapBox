/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import * as MapboxDraw from "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw";
import * as turf from "@turf/turf";

const styles = {
  width: "100%",
  height: "100%",
  position: "absolute",
};

const Mapa = () => {
  const MAPBOX_TOKEN =
    "pk.eyJ1IjoiZ29uemFsb2I5OCIsImEiOiJjazZtM2V2eHowbHJ2M2xwdTRjMXBncDJjIn0.C0dqUfziJu3E1o8lFxmfqQ";
  const [map, setMap] = useState(null);
  const mapContainer = useRef(null);

  useEffect(() => {
    mapboxgl.accessToken = MAPBOX_TOKEN;

    const initializeMap = ({ setMap, mapContainer }) => {
      const map = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/satellite-streets-v11",
        center: [-64.9672817, -34.9964963],
        zoom: 4,
      });

      map.on("load", () => {
        setMap(map);
        map.resize();
        //* instancia herramientas
        const draw = new MapboxDraw({
          displayControlsDefault: false,
          controls: {
            polygon: true,
            point: true,
            trash: true,
          },
        });
        map.addControl(draw);
      });

      //* centrado de viewport con turf
      const geojsonBounds = turf.bbox({
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: {},
            geometry: {
              type: "Point",
              coordinates: [-64.9672817, -34.9964963],
            },
          },
          {
            type: "Feature",
            properties: {},
            geometry: {
              type: "Point",
              coordinates: [-64.9672817, -50.9964963],
            },
          },
        ],
      });
      map.fitBounds(geojsonBounds, { padding: 10, zoom: 6 });

      //* geometria dibujada
      map.on("draw.create", (e) => {
        console.log(e.features[0].geometry.coordinates[0]);
        const coordinates = e.features[0].geometry.coordinates[0];
        const formattedCoordinates = JSON.stringify(coordinates, (key, value) => {
          if (typeof value === "number") {
            return value.toFixed(6);
          }
          return value;
        }).replace(/"/g, '');
        console.log(formattedCoordinates);
      });

      map.on("dragend", (e) => {
        console.log(e);
      });
    };

    if (!map) initializeMap({ setMap, mapContainer });
  });

  return (
    <>
      <div ref={(el) => (mapContainer.current = el)} style={styles} />
    </>
  );
};

export default Mapa;
