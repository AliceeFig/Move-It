import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Image,
  Alert,
  BackHandler,
} from "react-native";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { supabase } from "../../lib/supabase";
import NavBar from "../../../components/NavBar";
import { router, useFocusEffect } from "expo-router";
import NotificacaoBell from "../../../components/NotificacaoBell";

const { width } = Dimensions.get("window");

const meses = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export default function HomeAluno() {
  const [nomeUsuario, setNomeUsuario] = useState("Aluno");
  const [fotoPerfil, setFotoPerfil] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState("");
  const [iconeHora, setIconeHora] = useState("sunny-outline");

  const [loadingPagamento, setLoadingPagamento] = useState(true);
  const [pagamentoPago, setPagamentoPago] = useState<boolean | null>(null);

  const [statusContrato, setStatusContrato] = useState<string | null>(null);
  const [loadingContrato, setLoadingContrato] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        BackHandler.exitApp()
        return true
      };
      BackHandler.addEventListener('hardwareBackPress', onBackPress);
    }, [])
  );

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

      await verificarPagamentoMesAtual(user.id);
      await verificarStatusContrato(user.id);
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

    async function verificarPagamentoMesAtual(userId: string) {
      setLoadingPagamento(true);
      const hoje = new Date();
      const mesAtualNome = meses[hoje.getMonth()];
      const anoAtual = hoje.getFullYear();

      const { data, error } = await supabase
        .from("pagamentos")
        .select("*")
        .eq("id_aluno", userId)
        .eq("mes", mesAtualNome)
        .eq("ano", anoAtual)
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") {
        console.log("Erro ao buscar pagamento:", error.message);
        setPagamentoPago(false);
      } else {
        setPagamentoPago(data?.comprovante_url ? true : false);
      }
      setLoadingPagamento(false);
    }

    async function verificarStatusContrato(userId: string) {
      setLoadingContrato(true);

      const { data, error } = await supabase
        .from("contrato")
        .select("status")
        .eq("id_aluno", userId)
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") {
        console.log("Erro ao buscar contrato:", error.message);
        setStatusContrato("Sem contrato");
      } else if (!data) {
        setStatusContrato("Sem contrato");
      } else {
        const statusBanco = data.status?.toLowerCase() || "";

        if (statusBanco === "ativo") {
          setStatusContrato("Ativo");
        } else if (statusBanco === "solicitado") {
          setStatusContrato("Solicitado");
        } else {
          setStatusContrato("Sem contrato");
        }
      }

      setLoadingContrato(false);
    }

    fetchUsuario();
    setMensagem(gerarMensagem());
  }, []);

  const primeiraLetra = nomeUsuario.charAt(0).toUpperCase();

  function onPressVencimento() {
    if (pagamentoPago) {
      router.push("/(aluno)/VerPagamentos");
    } else {
      router.push("/(aluno)/RegistrarPagamento");
    }
  }

  function onPressTransporte() {
    if (loadingContrato) return;

    if (statusContrato === "Ativo") {
      router.push("/(aluno)/VerContrato");
    } else if (statusContrato === "Solicitado") {
      Alert.alert("Solicitação enviada", "Sua solicitação foi enviada. Agora é preciso aguardar a empresa analisar seu pedido.");
    } else {
      router.push("/(aluno)/SolicitarTransporte");
    }
  }

  function onPressBotaoGeral() {
    router.push("/(aluno)/geral");
  }

  const hoje = new Date();
  const mesAtualNome = meses[hoje.getMonth()];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => router.push("/(aluno)/perfil")}>
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
            <NotificacaoBell />
          </View>
        </View>

        <View style={styles.cardContainer}>
          <TouchableOpacity onPress={onPressVencimento} activeOpacity={0.7}>
            <StatusCard
              icon="calendar-check"
              label={
                loadingPagamento
                  ? "Carregando..."
                  : statusContrato === "Sem contrato"
                    ? "Indisponível"
                    : pagamentoPago
                      ? "Parcela enviada"
                      : "Parcela aberta"
              }
              value={
                loadingPagamento
                  ? ""
                  : statusContrato === "Sem contrato"
                    ? ""
                    : mesAtualNome
              }
              isPago={statusContrato !== "Sem contrato" && pagamentoPago === true}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={onPressTransporte} activeOpacity={0.7}>
            <StatusCard
              icon="bus"
              label="Transporte"
              value={loadingContrato ? "Carregando..." : statusContrato || "Sem contrato"}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.botaoGeral}
          activeOpacity={0.8}
          onPress={onPressBotaoGeral}
        >
          <Ionicons name="grid-outline" size={24} color="#fff" style={{ marginRight: 10 }} />
          <Text style={styles.botaoGeralTexto}>mais opções</Text>
        </TouchableOpacity>

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

function StatusCard({ icon, label, value, isPago = false }: { icon: any; label: string; value: string; isPago?: boolean }) {
  return (
    <View style={[styles.statusCard, isPago && styles.statusCardPago]}>
      <FontAwesome5 name={icon} size={24} color="#fff" />
      <Text style={styles.statusLabel}>{label}</Text>
      <Text style={styles.statusValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9F4FF" },
  header: {
    backgroundColor: "#5A189A",
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
  greeting: { color: "#fff", fontSize: 18 },
  userName: { color: "#fff", fontSize: 26, fontWeight: "bold" },
  subtext: { color: "#f3dfff", fontSize: 14, marginTop: 4 },
  row: { flexDirection: "row", alignItems: "center" },
  content: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
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
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  statusCardPago: {
    backgroundColor: "#5A189A",
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
    textAlign: "center",
  },
  botaoGeral: {
    backgroundColor: "#9D4EDD",
    marginHorizontal: 24,
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  botaoGeralTexto: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
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
