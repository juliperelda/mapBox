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
                if (geoJSON !== '') {

                    var random = 0;
                    for (let i = 0; i < geoJSON.length; i++) {
                        //const zone = dataGeoJSON[i];
                        var item = 0;
                        for (let j = 0; j < geoJSON[i].length; j++) {
                            random = random + 1;
                            item = j + random; 
                            
                            const lote = geoJSON[i][j];
                            map.addSource(`lote-${item}`, {
                                type: 'geojson',
                                data: {
                                    "type": "FeatureCollection",
                                    "features": [
                                        {
                                            "type": "Feature",
                                            "properties": {},
                                            "geometry": {
                                                "coordinates": [lote],
                                                "type": "Polygon"
                                            }
                                        }
                                    ]
                                }
                            });

                            map.addLayer({
                                id: `lote-layer-${item}`,
                                type: 'line',
                                source: `lote-${item}`,
                                paint: {
                                    'line-color': 'rgba(255,212,2,1)',
                                    'line-opacity': 0.8
                                }
                            });

                            map.addLayer({
                                id: `lote-fill-${item}`,
                                type: "fill",
                                source: `lote-${item}`,
                                paint: {
                                  "fill-color": 'rgba(255,212,2,0.6)',
                                },
                              });
                        }
                        // random = 0
                    }

                }
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

    function infoGeoJSON(idCliente) {
        const data = new FormData();
        data.append("idC", idCliente);
        //fetch(`${URL}/com_traerCosechas.php`, {
        fetch(`${URL}info_geojson.php`, {
            method: "POST",
            body: data,
        }).then(function (response) {
            response.text().then((resp) => {
                const data = resp;
                const objetoData = JSON.parse(data);
                // const objetoData = JSON.parse(data.replace('2049',''));
                console.log('objetoData: ', objetoData);
                //setDataGeoJSON(objetoData[0].lot_geojson);
                setDataGeoJSON(objetoData);
                // desarmarGeoJSON();
            });
        });
    }

    var result = [];
    function desarmarGeoJSON() {
        var lengthDG = dataGeoJSON.length;
        var coordLotes = [];
        console.log(lengthDG);
        for (let i = 0; i < lengthDG; i++) {
            const element = dataGeoJSON[i].lot_geojson;
            const parsedData = JSON.parse(element);
            for (let i = 0; i < parsedData.length; i++) {
                const pair = parsedData[i];
                const lon = parseFloat(pair[0]);
                const lat = parseFloat(pair[1]);
                coordLotes.push([lon, lat]);
                console.log('coordLotes: ', coordLotes);
            }
            result.push([coordLotes]);
            coordLotes = [];
            console.log("lotes: ", result);
        }
        setGeoJSON(result);
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

    return (
        <>
            <div ref={(el) => (mapContainer.current = el)} style={styles} />
        </>
    );
};

export default Mapa;