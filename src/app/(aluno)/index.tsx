import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialIcons, FontAwesome } from "@expo/vector-icons";
import NavBar from "../../../components/NavBar";
import { supabase } from "../../lib/supabase";
import { router } from "expo-router";

export default function HomeAluno() {
  const [nomeUsuario, setNomeUsuario] = useState("");

  useEffect(() => {
    async function fetchNomeUsuario() {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        console.error("Erro ao buscar usuário", error);
        return;
      }

      const nome = user.user_metadata?.nome || "Aluno";
      setNomeUsuario(nome);
    }

    fetchNomeUsuario();
  }, []);

  return (
    <View style={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.profileIcon}
          onPress={() => router.push("/(aluno)/perfil")}
        >
          <MaterialIcons name="person" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>{nomeUsuario}</Text>
      </View>

      {/* Conteúdo principal */}
      <View style={styles.content}>
        <Text style={styles.welcome}>Bem Vindo!</Text>

        <View style={[styles.card, { backgroundColor: "#FF5E3A" }]}>
          <Text style={styles.cardText}>
            Você não tem nenhuma notificação no momento
          </Text>
        </View>

        <View
          style={[
            styles.card,
            { backgroundColor: "#F9EC00", flexDirection: "row", alignItems: "center" },
          ]}
        >
          <FontAwesome name="bell" size={18} color="#000" style={{ marginRight: 8 }} />
          <Text style={[styles.cardText, { color: "#000" }]}>
            Você possui uma mensalidade em aberto!
          </Text>
        </View>

        <View
          style={[
            styles.card,
            {
              backgroundColor: "#E01818",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            },
          ]}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <FontAwesome name="bus" size={18} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.cardText}>Fique atento ao horário!</Text>
          </View>
          <Text style={styles.cardText}>OK</Text>
        </View>
      </View>

      {/* Área roxa da NavBar */}
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
    backgroundColor: "#5A189A",
    padding: 16,
    paddingTop: 40,
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
  content: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    backgroundColor: "#fff",
    marginBottom: 10,
  },
  welcome: {
    fontSize: 24,
    marginVertical: 20,
    fontWeight: "bold",
  },
  card: {
    width: "100%",
    borderRadius: 20,
    padding: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    elevation: 2,
  },
  cardText: {
    color: "white",
    fontSize: 14,
    flexShrink: 1,
  },
  navBarWrapper: {
    backgroundColor: "#5A189A",
    paddingBottom: 20,
  },
});