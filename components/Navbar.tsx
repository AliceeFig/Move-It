import React, { useEffect, useState } from "react";
import { View, StyleSheet, TouchableOpacity, Text, Alert } from "react-native";
import { Entypo, FontAwesome } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { supabase } from '../src/lib/supabase'; // ajuste conforme sua estrutura

type NavBarProps = {
  hideMapButton?: boolean;
};

export default function NavBar({ hideMapButton = false }: NavBarProps) {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();

  const [temContratoAtivo, setTemContratoAtivo] = useState<boolean | null>(null);

  useEffect(() => {
    async function checarContrato() {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        setTemContratoAtivo(false);
        return;
      }

      const { data: contratoData, error: contratoError } = await supabase
        .from("contrato")
        .select("id")
        .eq("id_aluno", user.id)
        .neq("status", "cancelado")
        .limit(1)
        .single();

      setTemContratoAtivo(!!contratoData);
    }

    checarContrato();
  }, []);

  const isActive = (path: string) => pathname.includes(path);
  const getIconColor = (path: string) =>
    isActive(path) ? "#ffffff" : "rgba(249, 244, 255, 0.6)";

  const isOnMapPage = pathname.includes("/mapa-rota");

  // Função para tentar navegar para o mapa
  const handleMapaPress = () => {
    if (temContratoAtivo === null) {
      Alert.alert("Aguarde", "Verificando seu contrato, tente novamente em alguns segundos.");
      return;
    }
    if (!temContratoAtivo) {
      Alert.alert(
        "Sem contrato ativo",
        "Você precisa ter um contrato ativo para acessar o mapa. Faça uma solicitação."
      );
      return;
    }
    router.replace("/(aluno)/mapa-rota");
  };

  return (
    <View style={{ position: "absolute", bottom: 0, width: "100%" }}>
      <View style={[styles.container, { paddingBottom: insets.bottom }]}>
        {!hideMapButton && !isOnMapPage && <View style={styles.halfMoonInset} />}

        <View style={styles.navBar}>
          <TouchableOpacity
            style={styles.navItem}
            activeOpacity={0.7}
            onPress={() => router.replace("/(aluno)/inicio")}
          >
            <Entypo name="home" size={30} color={getIconColor("/inicio")} />
            <Text style={[styles.navLabel, { color: getIconColor("/inicio") }]}>
              Início
            </Text>
          </TouchableOpacity>

          {isOnMapPage ? (
            <TouchableOpacity
              style={styles.navItem}
              activeOpacity={0.7}
              onPress={() => router.replace("/(aluno)/mapa-rota")}
            >
              <FontAwesome
                name="map-marker"
                size={28}
                color={getIconColor("/mapa-rota")}
              />
              <Text style={[styles.navLabel, { color: getIconColor("/mapa-rota") }]}>
                Mapa
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.spacer} />
          )}

          <TouchableOpacity
            style={styles.navItem}
            activeOpacity={0.7}
            onPress={() => router.replace("/(aluno)/geral")}
          >
            <Entypo name="menu" size={30} color={getIconColor("/geral")} />
            <Text style={[styles.navLabel, { color: getIconColor("/geral") }]}>
              Geral
            </Text>
          </TouchableOpacity>
        </View>

        {!hideMapButton && !isOnMapPage && (
          <View style={styles.fabWrapper}>
            <TouchableOpacity
              style={styles.fabButton}
              activeOpacity={0.8}
              onPress={handleMapaPress} // usa a função que verifica contrato
            >
              <FontAwesome
                name="map-marker"
                size={28}
                color={getIconColor("/mapa-rota")}
              />
            </TouchableOpacity>
            <Text style={[styles.fabLabel, { color: getIconColor("/mapa-rota") }]}>
              Mapa
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    backgroundColor: "#5A189A",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
    width: "100%",
  },
  navBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 40,
    paddingTop: 12,
    paddingBottom: 11,
    overflow: "hidden",
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 6,
  },
  navLabel: {
    fontSize: 12,
    marginTop: 4,
    color: "rgba(249, 244, 255, 0.6)",
  },
  spacer: {
    width: 120,
  },
  halfMoonInset: {
    position: "absolute",
    top: 0,
    alignSelf: "center",
    width: 85,
    height: 45,
    backgroundColor: "#F9F4FF",
    borderBottomLeftRadius: 42,
    borderBottomRightRadius: 42,
    zIndex: 5,
  },
  fabWrapper: {
    position: "absolute",
    top: -35,
    alignSelf: "center",
    zIndex: 10,
    alignItems: "center",
  },
  fabButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#9D4EDD",
    alignItems: "center",
    justifyContent: "center",
  },
  fabLabel: {
    marginTop: 16,
    fontSize: 12,
    color: "rgba(249, 244, 255, 0.6)",
  },
});
