import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Dimensions, ActivityIndicator, Alert } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { MaterialIcons } from "@expo/vector-icons";
import NavBar from "../../../components/NavBar";

export default function MapaRota() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setErrorMsg("Permissão de localização negada");
        Alert.alert("Permissão negada", "Habilite a localização para usar o mapa");
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
    })();
  }, []);

  if (!location) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5A189A" />
        <Text style={{ color: "#5A189A", marginTop: 10 }}>Carregando mapa...</Text>
      </View>
    );
  }

  const userCoords = {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
  };

  const destino = {
    latitude: userCoords.latitude + 0.005,
    longitude: userCoords.longitude + 0.005,
  };

  return (
    <View style={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <View style={styles.profileIcon}>
          <MaterialIcons name="person" size={24} color="#5A189A" />
        </View>
        <Text style={styles.headerText}>Mapa Rota</Text>
      </View>

      {/* Mapa */}
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: userCoords.latitude,
          longitude: userCoords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        <Marker coordinate={userCoords} title="Você está aqui" pinColor="blue" />
        <Marker coordinate={destino} title="Destino" pinColor="red" />
      </MapView>

      {/* NavBar */}
      <View style={styles.navBarWrapper}>
        <NavBar />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#5A189A",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 40,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: "#5A189A",
  },
  profileIcon: {
    backgroundColor: "#F9EC00",
    borderRadius: 20,
    padding: 8,
    marginRight: 12,
  },
  headerText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height - 200,
  },
  navBarWrapper: {
    backgroundColor: '#5A189A',
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});
