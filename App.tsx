import MapboxGL, { OnPressEvent } from "@rnmapbox/maps";
import { Feature, Point } from "geojson";
import React, { useRef } from "react";
import { StyleProp, StyleSheet, View } from "react-native";

const accessToken =
  ""; // YOUR ACCESS TOKEN HERE
MapboxGL.setAccessToken(accessToken);

const layerStyles: StyleProp<any> = {
  singlePoint: {
    circleColor: "green",
    circleOpacity: 0.84,
    circleStrokeWidth: 2,
    circleStrokeColor: "white",
    circleRadius: 5,
    circlePitchAlignment: "map",
  },

  clusteredPoints: {
    circlePitchAlignment: "map",

    circleColor: [
      "step",
      ["get", "point_count"],
      "#51bbd6",
      100,
      "#f1f075",
      750,
      "#f28cb1",
    ],

    circleRadius: ["step", ["get", "point_count"], 20, 100, 30, 750, 40],

    circleOpacity: 0.84,
    circleStrokeWidth: 2,
    circleStrokeColor: "white",
  },

  clusterCount: {
    textField: [
      "format",
      ["concat", ["get", "point_count"], "\n"],
      {},
      [
        "concat",
        ">1: ",
        [
          "+",
          ["get", "mag2"],
          ["get", "mag3"],
          ["get", "mag4"],
          ["get", "mag5"],
        ],
      ],
      { "font-scale": 0.8 },
    ],
    textSize: 12,
    textPitchAlignment: "map",
  },
};

export default function App() {
  const sourceRef = useRef<MapboxGL.ShapeSource>(null);
  const mapRef = useRef<MapboxGL.MapView>(null);
  const cameraRef = useRef<MapboxGL.Camera>(null);

  const onPress = async (event: OnPressEvent) => {
    const [cluster] = event.features as Feature<Point>[];
    if (cluster.properties?.cluster === true && sourceRef.current) {
      const expansionZoom = await sourceRef.current.getClusterExpansionZoom(
        cluster
      );

      const centerCoordinate = cluster.geometry.coordinates;
      const zoomLevel = expansionZoom * 1.15;
      cameraRef.current?.setCamera({
        centerCoordinate,
        zoomLevel,
        animationMode: "easeTo",
        animationDuration: 1500
      });
    }
  };

  return (
    <View style={styles.container}>
      <MapboxGL.MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        styleURL={MapboxGL.StyleURL.Dark}
        scaleBarEnabled={false}
        pitchEnabled={false}
      >
        <MapboxGL.Camera
          ref={cameraRef}
          centerCoordinate={[0, 0]}
          zoomLevel={0}
        />

        <MapboxGL.ShapeSource
          ref={sourceRef}
          id="earthquakes"
          onPress={onPress}
          cluster
          clusterRadius={50}
          clusterMaxZoom={14}
          url="https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
        >
          <MapboxGL.SymbolLayer
            id="pointCount"
            style={layerStyles.clusterCount}
          />

          <MapboxGL.CircleLayer
            id="clusteredPoints"
            belowLayerID="pointCount"
            filter={["has", "point_count"]}
            style={layerStyles.clusteredPoints}
          />

          <MapboxGL.CircleLayer
            id="singlePoint"
            filter={["!", ["has", "point_count"]]}
            style={layerStyles.singlePoint}
          />
        </MapboxGL.ShapeSource>
      </MapboxGL.MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
