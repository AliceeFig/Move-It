import React, { useEffect, useRef, useState } from "react";
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
import { Ionicons } from "@expo/vector-icons";
import NavBar from "../../../components/NavBar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import NotificacaoBell from "../../../components/NotificacaoBell";
import { supabase } from "../../lib/supabase"; // ajuste conforme seu projeto

export default function MapaRota() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [showRoute, setShowRoute] = useState(false);
  const [isCardExpanded, setIsCardExpanded] = useState(true);
  const [paradaAtiva, setParadaAtiva] = useState(true);
  const [pontos, setPontos] = useState<
    { id: number; nome: string; latitude: number; longitude: number }[]
  >([]);
  const [loadingPontos, setLoadingPontos] = useState(true);

  // Ponto inicial do usuário pelo contrato (para referência)
  const [pontoInicialUsuario, setPontoInicialUsuario] = useState<{
    id: number;
    nome: string;
    latitude: number;
    longitude: number;
  } | null>(null);

  // Ponto mais próximo calculado em runtime (com base na localização atual)
  const [pontoMaisProximo, setPontoMaisProximo] = useState<{
    id: number;
    nome: string;
    latitude: number;
    longitude: number;
  } | null>(null);

  const mapRef = useRef<MapView>(null);
  const insets = useSafeAreaInsets();

  // ID da rota fixa
  const idRota = 1;

  // Coordenadas fixas do ponto final, conforme informado
  const destinoFixo = {
    latitude: -16.228924213015134,
    longitude: -40.74328593972636,
  };

  useEffect(() => {
    (async () => {
      console.time("RequestLocationPermission");
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permissão negada", "Habilite a localização para usar o mapa");
        console.timeEnd("RequestLocationPermission");
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
      console.timeEnd("RequestLocationPermission");
    })();
  }, []);

  // Buscar pontos da rota
  async function buscarPontosDaRota() {
    console.time("buscarPontosDaRota");
    setLoadingPontos(true);
    try {
      let { data, error } = await supabase
        .from("rota_pontos")
        .select(`
          ordem,
          pontos_parada (
            id,
            nome,
            latitude,
            longitude
          )
        `)
        .eq("id_rota", idRota)
        .order("ordem", { ascending: true });

      if (error) {
        console.error("Erro ao buscar pontos da rota:", error);
        Alert.alert("Erro", "Não foi possível carregar os pontos da rota.");
        return;
      }

      if (data) {
        const pontosOrdenados = data.map((item: any) => ({
          id: item.pontos_parada.id,
          nome: item.pontos_parada.nome,
          latitude: item.pontos_parada.latitude,
          longitude: item.pontos_parada.longitude,
        }));
        setPontos(pontosOrdenados);
      }
    } finally {
      setLoadingPontos(false);
      console.timeEnd("buscarPontosDaRota");
    }
  }

  // Buscar ponto inicial real do usuário logado (contrato.id_ponto_inicial)
  async function buscarPontoInicialUsuario() {
    console.time("buscarPontoInicialUsuario");
    try {
      const getUserResult = await supabase.auth.getUser();
      const user = getUserResult.data.user;
      if (!user) return;

      let { data: contratos, error: errContrato } = await supabase
        .from("contrato")
        .select("id_ponto_inicial")
        .eq("id_aluno", user.id)
        .limit(1)
        .single();

      if (errContrato || !contratos) {
        console.error("Erro ao buscar contrato do usuário:", errContrato);
        return;
      }

      const pontoId = contratos.id_ponto_inicial;
      if (!pontoId) return;

      let { data: pontoData, error: errPonto } = await supabase
        .from("pontos_parada")
        .select("id, nome, latitude, longitude")
        .eq("id", pontoId)
        .limit(1)
        .single();

      if (errPonto || !pontoData) {
        console.error("Erro ao buscar ponto inicial do usuário:", errPonto);
        return;
      }

      setPontoInicialUsuario({
        id: pontoData.id,
        nome: pontoData.nome,
        latitude: pontoData.latitude,
        longitude: pontoData.longitude,
      });
    } catch (error) {
      console.error("Erro ao buscar ponto inicial do usuário:", error);
    }
    console.timeEnd("buscarPontoInicialUsuario");
  }

  // Calcula o ponto mais próximo do usuário com base na localização atual e lista de pontos
  function calcularPontoMaisProximo() {
    if (!location || pontos.length === 0) {
      setPontoMaisProximo(null);
      return;
    }
    let minDist = Infinity;
    let pontoProximo = null;

    for (const ponto of pontos) {
      const dist = getDistance(
        location.coords.latitude,
        location.coords.longitude,
        ponto.latitude,
        ponto.longitude
      );
      if (dist < minDist) {
        minDist = dist;
        pontoProximo = ponto;
      }
    }
    setPontoMaisProximo(pontoProximo);
  }

  // Função para calcular distância aproximada em metros entre duas coordenadas (Haversine)
  function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const R = 6371e3; // metros
    const φ1 = toRad(lat1);
    const φ2 = toRad(lat2);
    const Δφ = toRad(lat2 - lat1);
    const Δλ = toRad(lon2 - lon1);

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const d = R * c;
    return d;
  }

  // Buscar dados ao montar o componente
  useEffect(() => {
    buscarPontosDaRota();
    buscarPontoInicialUsuario();
  }, []);

  // Recalcular ponto mais próximo sempre que a localização ou os pontos mudarem
  useEffect(() => {
    calcularPontoMaisProximo();
  }, [location, pontos]);

  // Função que vai centralizar o mapa na parada inicial real do usuário ou na localização atual, alternando
  const irParaParadaInicialUsuario = () => {
    if (!mapRef.current) return;

    if (paradaAtiva) {
      // Centraliza na parada inicial do contrato
      if (pontoInicialUsuario) {
        mapRef.current.animateToRegion(
          {
            latitude: pontoInicialUsuario.latitude,
            longitude: pontoInicialUsuario.longitude,
            latitudeDelta: 0.0015,
            longitudeDelta: 0.0015,
          },
          1000
        );
      } else {
        Alert.alert("Ponto inicial não encontrado para seu usuário.");
      }
    } else {
      // Centraliza na localização atual do usuário
      if (location) {
        mapRef.current.animateToRegion(
          {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.015,
            longitudeDelta: 0.015,
          },
          1000
        );
      }
    }
    setParadaAtiva(!paradaAtiva);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (router.canGoBack()) router.back();
            else router.replace("/inicio");
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Mapa de Transporte</Text>
        <View style={{ width: 44 }} />
        <NotificacaoBell />
      </View>

      {!location ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5A189A" />
          <Text style={{ color: "#5A189A", marginTop: 10 }}>Carregando mapa...</Text>
        </View>
      ) : (
        <MapView
          ref={mapRef}
          style={styles.map}
          region={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          showsUserLocation
          showsMyLocationButton
        >
          {/* Marcadores dos pontos da rota */}
          {!loadingPontos &&
            pontos.map((ponto) => (
              <Marker
                key={`ponto-${ponto.id}`}
                coordinate={{ latitude: ponto.latitude, longitude: ponto.longitude }}
                title={ponto.nome}
                pinColor="purple"
              />
            ))}

          {/* Marcador do ponto inicial do usuário (contrato) */}
          {pontoInicialUsuario && (
            <Marker
              coordinate={{
                latitude: pontoInicialUsuario.latitude,
                longitude: pontoInicialUsuario.longitude,
              }}
              title={`Sua parada inicial: ${pontoInicialUsuario.nome}`}
              pinColor="blue"
            />
          )}

          {/* Marcador do ponto mais próximo calculado */}
          {pontoMaisProximo && (
            <Marker
              coordinate={{
                latitude: pontoMaisProximo.latitude,
                longitude: pontoMaisProximo.longitude,
              }}
              title={`Parada mais próxima: ${pontoMaisProximo.nome}`}
              pinColor="green"
            />
          )}

          {/* Marcador do ponto final fixo */}
          <Marker coordinate={destinoFixo} title="Destino Final" pinColor="red" />

          {/* Linha da rota */}
          {showRoute && !loadingPontos && (
            <Polyline
              coordinates={pontos.map((p) => ({
                latitude: p.latitude,
                longitude: p.longitude,
              }))}
              strokeWidth={5}
              strokeColor="#7B2CBF"
            />
          )}
        </MapView>
      )}

      {location && (
        <>
          {isCardExpanded ? (
            <View style={[styles.infoCardExpanded, { bottom: insets.bottom + 100 }]}>
              <TouchableOpacity
                style={styles.toggleButton}
                onPress={() => setIsCardExpanded(false)}
              >
                <Ionicons name="chevron-down" size={20} color="#5A189A" />
              </TouchableOpacity>

              <View style={styles.textWrapper}>
                <Text style={styles.cardTitle}>Ponto mais próximo</Text>
                <Text style={styles.cardAddress}>
                  {pontoMaisProximo
                    ? pontoMaisProximo.nome
                    : pontoInicialUsuario
                    ? pontoInicialUsuario.nome
                    : pontos.length > 0
                    ? pontos[0].nome
                    : "Sem pontos"}
                </Text>
              </View>

              <View style={styles.buttonsRow}>
                <TouchableOpacity
                  style={styles.routeButton}
                  activeOpacity={0.8}
                  onPress={() => setShowRoute(!showRoute)}
                >
                  <Text style={styles.routeButtonText}>
                    {showRoute ? "Ocultar rota" : "Ver rota"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.routeButton, { marginLeft: 8 }]}
                  activeOpacity={0.8}
                  onPress={irParaParadaInicialUsuario}
                >
                  <Text style={styles.routeButtonText}>
                    {paradaAtiva ? "Minha parada" : "Paradas"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.infoCardMinimized, { bottom: insets.bottom + 120 }]}
              onPress={() => setIsCardExpanded(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="map-outline" size={28} color="#fff" />
            </TouchableOpacity>
          )}
        </>
      )}

      <NavBar />
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
  infoCardExpanded: {
    position: "absolute",
    left: 20,
    right: 20,
    backgroundColor: "rgba(255, 255, 255, 0.68)",
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  infoCardMinimized: {
    position: "absolute",
    right: 20,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(122, 44, 191, 0.69)",
    justifyContent: "center",
    alignItems: "center",
  },
  toggleButton: {
    alignSelf: "flex-end",
    padding: 4,
  },
  textWrapper: { marginBottom: 10 },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4B3B83",
  },
  cardAddress: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#5A189A",
  },
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    gap: 10,
  },
  routeButton: {
    flex: 1,
    backgroundColor: "#7B2CBF",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 25,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  routeButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});
