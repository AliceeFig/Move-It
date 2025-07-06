import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import NavBar from "../../../components/Navbar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

export default function MapaRota() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [showRoute, setShowRoute] = useState(false);
  const insets = useSafeAreaInsets();

  const pontos = [
    { latitude: -16.172573080284458, longitude: -40.69195368803942 },
    { latitude: -16.178703385990282, longitude: -40.69510173092929 },
    { latitude: -16.175709106624883, longitude: -40.69370360579556 },
    { latitude: -16.17546553101689, longitude: -40.69462175976522 },
    { latitude: -16.17617130804986, longitude: -40.69600936856917 },
    { latitude: -16.177299208199663, longitude: -40.69819564812395 },
    { latitude: -16.180368499697867, longitude: -40.69576630394435 },
    { latitude: -16.18308480651907, longitude: -40.6949756174368 },
    { latitude: -16.184997586897833, longitude: -40.69729963973211 },
    { latitude: -16.18997220068449, longitude: -40.69614273092904 },
  ];

  const destino = { latitude: -16.228924213015134, longitude: -40.74328593972636 };

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permissão negada", "Habilite a localização para usar o mapa");
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
    })();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Mapa de Embarque</Text>
        <View style={{ width: 44 }} />
      </View>

      {!location ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5A189A" />
          <Text style={{ color: "#5A189A", marginTop: 10 }}>Carregando mapa...</Text>
        </View>
      ) : (
        <MapView
          style={styles.map}
          region={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          }}
          showsUserLocation
          showsMyLocationButton
        >
          {pontos.map((ponto, index) => (
            <Marker
              key={`ponto-${index}`}
              coordinate={ponto}
              title={`Parada ${index + 1}`}
              pinColor="purple"
            />
          ))}

          <Marker coordinate={destino} title="Instituto Federal IFNMG" pinColor="red" />

          {showRoute && (
            <Polyline
              coordinates={[...pontos, destino]}
              strokeWidth={5}
              strokeColor="#7B2CBF"
            />
          )}
        </MapView>
      )}

      {location && (
        <View style={[styles.infoCard, { bottom: insets.bottom + 100 }]}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="bus" size={22} color="#5A189A" />
          </View>
          <View style={styles.textWrapper}>
            <Text style={styles.cardTitle}>Ponto mais próximo</Text>
            <Text style={styles.cardAddress}>Parada 1</Text>
          </View>

          <TouchableOpacity
            style={styles.routeButton}
            activeOpacity={0.8}
            onPress={() => setShowRoute(!showRoute)}
          >
            <Text style={styles.routeButtonText}>{showRoute ? "Ocultar rota" : "Ver rota"}</Text>
            <Ionicons
              name={showRoute ? "close" : "arrow-forward"}
              size={18}
              color="#fff"
              style={{ marginLeft: 6 }}
            />
          </TouchableOpacity>
        </View>
      )}

      <NavBar extraBottomPadding={10} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    backgroundColor: "#5A189A",
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    backgroundColor: "#ffffff33",
    padding: 6,
    borderRadius: 10,
  },
  headerText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
  },
  map: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  infoCard: {
    position: "absolute",
    left: 20,
    right: 20,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#5A189A",
    shadowOpacity: 0.22,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 10,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E0D7FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    shadowColor: "#7B2CBF",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 6,
  },
  textWrapper: { flex: 1 },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4B2995",
    marginBottom: 0,
  },
  cardAddress: {
    fontSize: 13,
    color: "#6E4AA7",
  },
  routeButton: {
    backgroundColor: "#7B2CBF",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#3A0CA3",
    shadowOpacity: 0.55,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 9,
    elevation: 8,
  },
  routeButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
});
