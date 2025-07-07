import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Image,
} from "react-native";
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { supabase } from "../../lib/supabase";
import NavBar from "../../../components/NavBar";
import { router } from "expo-router";

const { width } = Dimensions.get("window");

export default function HomeAluno() {
  const [nomeUsuario, setNomeUsuario] = useState("Aluno");
  const [fotoPerfil, setFotoPerfil] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState("");
  const [iconeHora, setIconeHora] = useState("sunny-outline");

  useEffect(() => {
    async function fetchUsuario() {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) return;

      const { data, error: userError } = await supabase
        .from("usuarios")
        .select("nome, fotoPerfil")
        .eq("id", user.id)
        .single();

      if (!data || userError) return;

      setNomeUsuario(data.nome || "Aluno");
      setFotoPerfil(data.fotoPerfil || null);
    }

    function gerarMensagem() {
      const hora = new Date().getHours();
      if (hora < 12) {
        setIconeHora("sunny-outline");
        return "Bom dia";
      } else if (hora < 18) {
        setIconeHora("partly-sunny-outline");
        return "Boa tarde";
      } else {
        setIconeHora("moon-outline");
        return "Boa noite";
      }
    }

    fetchUsuario();
    setMensagem(gerarMensagem());
  }, []);

  const primeiraLetra = nomeUsuario.charAt(0).toUpperCase();

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => router.push("../(aluno)/perfil")}>
              <View style={styles.avatar}>
                {fotoPerfil ? (
                  <Image source={{ uri: fotoPerfil }} style={styles.avatarImage} />
                ) : (
                  <Text style={styles.avatarText}>{primeiraLetra}</Text>
                )}
              </View>
            </TouchableOpacity>

            <View style={{ flex: 1, marginLeft: 8 }}>
              <View style={styles.row}>
                <Ionicons name={iconeHora as any} size={20} color="#fff" />
                <Text style={styles.greeting}> {mensagem},</Text>
              </View>
              <Text style={styles.userName}>{nomeUsuario.split(" ")[0]}!</Text>
              <Text style={styles.subtext}>Pronto para mais um dia?</Text>
            </View>

            <TouchableOpacity onPress={() => router.push("../(aluno)/inicio")}>
              <Ionicons name="notifications-outline" size={28} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.cardContainer}>
          <StatusCard icon="calendar-check" label="Vencimento" value="10/07" />
          <StatusCard icon="bus" label="Transporte" value="Ativo" />
        </View>

        <InfoCard
          icon="alert-circle-outline"
          title="Avisos importantes"
          description="Atenção: horários alterados para sexta-feira."
        />

        <View style={styles.tipCard}>
          <Ionicons name="bulb-outline" size={28} color="#5A189A" style={{ marginBottom: 10 }} />
          <Text style={styles.tipText}>
            Verifique sempre seu histórico de pagamentos para garantir seu transporte ativo.
          </Text>
        </View>
      </ScrollView>

      <NavBar />
    </View>
  );
}

function StatusCard({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <View style={styles.statusCard}>
      <FontAwesome5 name={icon} size={24} color="#fff" />
      <Text style={styles.statusLabel}>{label}</Text>
      <Text style={styles.statusValue}>{value}</Text>
    </View>
  );
}

function InfoCard({ icon, title, description }: { icon: any; title: string; description: string }) {
  return (
    <View style={styles.infoCard}>
      <View style={styles.infoIconWrapper}>
        <MaterialCommunityIcons name={icon} size={28} color="#5A189A" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.infoTitle}>{title}</Text>
        <Text style={styles.infoDescription}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F4FF",
  },
  header: {
    backgroundColor: "#7B2CBF",
    paddingTop: 80,
    paddingBottom: 60,
    paddingHorizontal: 24,

    marginBottom: 30,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    backgroundColor: "#E0BBE4",
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    resizeMode: "cover",
  },
  avatarText: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#5A189A",
  },
  greeting: {
    color: "#fff",
    fontSize: 18,
  },
  userName: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "bold",
  },
  subtext: {
    color: "#f3dfff",
    fontSize: 14,
    marginTop: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  cardContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    marginBottom: 25,
  },
  statusCard: {
    backgroundColor: "#9D4EDD",
    borderRadius: 20,
    width: width * 0.42,
    paddingVertical: 20,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#5A189A",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    borderWidth: 3,
    borderColor: "rgba(120, 37, 193, 0.85)",
    shadowRadius: 6,
  },
  statusLabel: {
    color: "#fff",
    fontSize: 14,
    marginTop: 6,
  },
  statusValue: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 4,
  },
  infoCard: {
    backgroundColor: "#F3E8FF",
    borderRadius: 16,
    flexDirection: "row",
    padding: 16,
    marginBottom: 20,
    marginHorizontal: 24,
    alignItems: "center",
    gap: 14,
  },
  infoIconWrapper: {
    backgroundColor: "#E5D4FA",
    padding: 10,
    borderRadius: 12,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#4B3B83",
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: 13,
    color: "#5A189A",
  },
  tipCard: {
    backgroundColor: "#EADCFD",
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 24,
    marginBottom: 40,
    alignItems: "center",
  },
  tipText: {
    fontSize: 16,
    textAlign: "center",
    color: "#4B3B83",
    lineHeight: 22,
  },
});
