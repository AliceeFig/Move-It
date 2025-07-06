import React from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { Entypo, FontAwesome } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function NavBar() {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();

  // Verifica se a rota atual começa com o path fornecido
  const isActive = (path: string) => pathname == path;

  const getIconColor = (path: string) =>
    isActive(path) ? "#ffffff" : "rgba(249, 244, 255, 0.6)";

  return (
    <View style={{ position: "absolute", bottom: 0, width: "100%" }}>
      <View style={[styles.container, { paddingBottom: insets.bottom }]}>
        {/* Meia-lua atrás do botão flutuante */}
        <View style={styles.halfMoonInset} />
        {/* Barra com os ícones laterais */}
        <View style={styles.navBar}>
          <TouchableOpacity
            style={styles.navItem}
            activeOpacity={0.7}
            onPress={() => router.replace("../(aluno)/inicio")}
          >
            <Entypo name="home" size={30} color={getIconColor("/inicio")} />
            <Text style={[styles.navLabel, { color: getIconColor("/inicio") }]}>
              Início
            </Text>
          </TouchableOpacity>
          <View style={styles.spacer} />
          <TouchableOpacity
            style={styles.navItem}
            activeOpacity={0.7}
            onPress={() => router.replace("../(aluno)/geral")}
          >
            <Entypo name="menu" size={30} color={getIconColor("/geral")} />
            <Text style={[styles.navLabel, { color: getIconColor("/geral") }]}>
              Geral
            </Text>
          </TouchableOpacity>
        </View>
        {/* Botão flutuante (mapa) com rótulo */}
        <View style={styles.fabWrapper}>
          <TouchableOpacity
            style={styles.fabButton}
            activeOpacity={0.8}
            onPress={() => router.replace("../(aluno)/mapa-rota")}
          >
            <FontAwesome
              name="map-marker"
              size={28}
              color={getIconColor("/mapa-rota")}
            />
          </TouchableOpacity>
          <Text
            style={[
              styles.fabLabel,
              {
                color: getIconColor("/mapa-rota") || "rgba(249, 244, 255, 0.6)",
              },
            ]}
          >
            Mapa
          </Text>
        </View>
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
    backgroundColor: "rgba(123, 44, 191, 0.85)",
    alignItems: "center",
    justifyContent: "center",
  },
  fabLabel: {
    marginTop: 16,
    fontSize: 12,
    color: "rgba(249, 244, 255, 0.6)",
  },
});
