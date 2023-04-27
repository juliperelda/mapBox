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

    const URL = process.env.REACT_APP_URL;

    const [geoJSON, setGeoJSON] = useState([]);
    const [dataGeoJSON, setDataGeoJSON] = useState([]);

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
                // });


                //!
                map.addSource('markers', {
                    type: 'geojson',
                    data: {
                        "type": "FeatureCollection",
                        "features": [
                            {
                                "type": "Feature",
                                "properties": {},
                                "geometry": {
                                    "coordinates": [geoJSON],
                                    "type": "Polygon"
                                }
                            }
                        ]
                    }
                });

                map.addLayer({
                    id: 'markerss',
                    type: 'line',
                    source: 'markers',
                    paint: {
                        // 'circle-radius': 6,
                        'line-color': '#B42222',
                        'line-opacity': 0.8
                    }
                });
            });
            //!


            //* centrado de viewport con turf
            const geojsonBounds = turf.bbox({
                type: "FeatureCollection",
                features: [
                    {
                        type: "Feature",
                        properties: {},
                        geometry: {
                            type: "Point",
                            coordinates: [-63.11548948287964, -37.75500450168077],
                        },
                    },
                    {
                        type: "Feature",
                        properties: {},
                        geometry: {
                            type: "Point",
                            coordinates: [-63.11548948287964, -37.75500450168077],
                        },
                    },
                ],
            });
            map.fitBounds(geojsonBounds, { padding: 10, zoom: 6 });

            //* geometria dibujada
            map.on("draw.create", (e) => {
                // console.log('hola: ', e);
                console.log(e.features[0].geometry.coordinates[0]);
                const coordinates = e.features[0].geometry.coordinates[0];
                const formattedCoordinates = JSON.stringify(coordinates, (key, value) => {
                    if (typeof value === "number") {
                        return value.toFixed(6);
                    }
                    return value;
                }).replace(/"/g, '');
                console.log('CoordenadaFOrm: ', formattedCoordinates);
            });

            map.on("dragend", (e) => {
                console.log('chau: ', e);
            });
        };

        if (!map) initializeMap({ setMap, mapContainer });
    });



    // const idC = localStorage.getItem("cliente");
    //const idC = 2049;
    //const [idCliente, setIdCliente]=useState('2049');

    // const [geoJSON, setGeoJSON] = useState([]);

    function infoGeoJSON(idCliente) {
        const data = new FormData();
        data.append("idC", idCliente);
        //fetch(`${URL}/com_traerCosechas.php`, {
        fetch(`${URL}info_geojson.php`, {
            method: "POST",
            body: data,
        }).then(function (response) {
            response.text().then((resp) => {
                try {
                    const data = resp;
                    const objetoData = JSON.parse(data);
                    // const objetoData = JSON.parse(data.replace('2049',''));
                    console.log('objetoData: ', objetoData);
                    setDataGeoJSON(objetoData[0].lot_geojson);
                    desarmarGeoJSON();
                } catch (e) {
                    console.error('Error parsing JSON: ', e);
                }
            });
        });
    }


    function desarmarGeoJSON() {
        const parsedData = JSON.parse(dataGeoJSON);
        const result = [];
        for (let i = 0; i < parsedData.length; i++) {
          const pair = parsedData[i];
          const lon = parseFloat(pair[0]);
          const lat = parseFloat(pair[1]);
          result.push([lon, lat]);
        }
        setGeoJSON(result);
        console.log('GeoJSON: ', geoJSON);
    }
      

    useEffect(() => {
        if (dataGeoJSON.length > 0) {
          desarmarGeoJSON();
        }
      }, [dataGeoJSON]);
      


    useEffect(() => {

        infoGeoJSON(2049);

    }, []);

    console.log('geoJSON: ', geoJSON)


    //   //* geometria dibujada
    //   map.on("draw.create", (e) => {
    //     console.log(e.features[0].geometry.coordinates[0]);
    //     const coordinates = e.features[0].geometry.coordinates[0];
    //     const formattedCoordinates = JSON.stringify(coordinates, (key, value) => {
    //       if (typeof value === "number") {
    //         return value.toFixed(6);
    //       }
    //       return value;
    //     }).replace(/"/g, '');
    //     console.log(formattedCoordinates);
    //   });


    return (
        <>
            <div ref={(el) => (mapContainer.current = el)} style={styles} />
        </>
    );
};

export default Mapa;