import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import {
  MaterialIcons,
  FontAwesome5,
  Ionicons,
  Entypo,
} from "@expo/vector-icons";
import NavBar from "../../../components/NavBar";
import { router } from "expo-router";
import NotificacaoBell from "../../../components/NotificacaoBell";

export default function CentralAluno() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header com botão de voltar, título centralizado e sininho de notificações */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.push("/inicio")}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerText}>Geral</Text>

        {/* Notificação no canto direito */}
        <View style={styles.notificacaoWrapper}>
          <NotificacaoBell />
          
        </View>
      </View>

      {/* Conteúdo */}
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>O que você deseja fazer?</Text>

        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push("/VerContrato")}
        >
          <View style={styles.cardIcon}>
            <FontAwesome5 name="file-contract" size={20} color="#fff" />
          </View>
          <Text style={styles.cardText}>Ver Contrato</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push("/SolicitarTransporte")}
        >
          <View style={styles.cardIcon}>
            <Ionicons name="bus" size={22} color="#fff" />
          </View>
          <Text style={styles.cardText}>Solicitar Transporte</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push("/(aluno)/RegistrarPagamento")}
        >
          <View style={styles.cardIcon}>
            <MaterialIcons name="attach-money" size={24} color="#fff" />
          </View>
          <Text style={styles.cardText}>Registrar Pagamento</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, styles.lastCard]}
          onPress={() => router.push("/VerPagamentos")}
        >
          <View style={styles.cardIcon}>
            <Entypo name="credit-card" size={22} color="#fff" />
          </View>
          <Text style={styles.cardText}>Histórico de Pagamentos</Text>
        </TouchableOpacity>
      </ScrollView>

      <NavBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F4FF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#5A189A",
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 16,
    position: "relative",
  },
  backButton: {
    position: "absolute",
    left: 16,
    top: 60,
    backgroundColor: "#ffffff33",
    padding: 8,
    borderRadius: 10,
  },
  headerText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  notificacaoWrapper: {
    position: "absolute",
    right: 16,
    top: 60,
  },
  content: {
    paddingTop: 55,
    padding: 24,
    paddingBottom: 80,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4B3B83",
    marginBottom: 24,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#EADCFD",
    borderRadius: 16,
    padding: 20,
    marginBottom: 18,
    flexDirection: "row",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  lastCard: {
    marginBottom: 60,
  },
  cardIcon: {
    backgroundColor: "#9D4EDD",
    borderRadius: 12,
    padding: 10,
    marginRight: 16,
  },
  cardText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4B3B83",
  },
});
