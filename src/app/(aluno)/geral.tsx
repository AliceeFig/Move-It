import React from "react";
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import NavBar from "../../../components/NavBar";
import { useRouter } from "expo-router";

export default function Geral() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <View style={styles.profileIcon}>
          <MaterialIcons name="person" size={24} color="white" />
        </View>
        <Text style={styles.headerText}>Nome</Text>
      </View>

      {/* Conteúdo principal */}
      <View style={styles.content}>
        <Text style={styles.title}>O que gostaria de fazer?</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("../VerContrato")}
        >
          <Text style={styles.buttonText}>Contrato</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("../SolicitarTransporte")}
        >
          <Text style={styles.buttonText}>Solicitar contrato</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("../(aluno)/RegistrarPagamento")}
        >
          <Text style={styles.buttonText}>Registrar pagamento</Text>
        </TouchableOpacity>


        <TouchableOpacity
          style={[styles.button, styles.bigButton]}
          onPress={() => router.push("../VerPagamentos")} // ou o caminho que escolher
        >
          <Text style={styles.buttonText}>Ver histórico de pagamentos</Text>
        </TouchableOpacity>

      </View>

      {/* Barra de navegação */}
        <NavBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#5A189A" },
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
  headerText: { color: "white", fontSize: 18, fontWeight: "bold" },
  content: {
    flex: 1,
    padding: 24,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  title: { fontSize: 20, fontWeight: "bold", color: "#5A189A", marginBottom: 20 },
  button: {
    backgroundColor: "#5A189A",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginBottom: 12,
    width: "80%",
    alignItems: "center",
  },
  bigButton: {
    paddingVertical: 16,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

});
