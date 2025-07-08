import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    SafeAreaView,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
    TextInput,
    Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../lib/supabase";
import NavBar from "../../../components/NavBar";
import { router } from "expo-router";
import NotificacaoBell from "../../../components/NotificacaoBell";

export default function SolicitarTransporte() {
    const [empresas, setEmpresas] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [filteredEmpresas, setFilteredEmpresas] = useState<any[]>([]);
    const [solicitacoes, setSolicitacoes] = useState<string[]>([]);
    const [userId, setUserId] = useState<string>("");
    const [contratoAtivo, setContratoAtivo] = useState<any | null>(null);

    async function carregarDados() {
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (!user || userError) {
            Alert.alert("Erro", "Você precisa estar autenticado.");
            return;
        }

        setUserId(user.id);

        const { data: empresasData, error: empresasError } = await supabase
            .from("empresa")
            .select("id, nome");

        if (empresasError) {
            Alert.alert("Erro", "Erro ao carregar empresas");
            return;
        }

        setEmpresas(empresasData ?? []);
        setFilteredEmpresas(empresasData ?? []);

        const { data: solicitacoesData } = await supabase
            .from("solicitacoes_contrato")
            .select("id_empresa")
            .eq("id_aluno", user.id);

        setSolicitacoes(solicitacoesData?.map((s) => s.id_empresa) ?? []);

        const { data: contratoData } = await supabase
            .from("contrato")
            .select("id, status, id_empresa, empresa:empresa(nome)")
            .eq("id_aluno", user.id)
            .neq("status", "cancelado")
            .limit(1)
            .single();

        setContratoAtivo(contratoData ?? null);
    }

    async function solicitarContrato(id_empresa: string) {
        if (solicitacoes.includes(id_empresa)) {
            Alert.alert("Atenção", "Você já fez solicitação para esta empresa.");
            return;
        }

        if (contratoAtivo) {
            Alert.alert(
                "Transporte ativo",
                "Você já possui um transporte ativo e não pode solicitar outro."
            );
            return;
        }

        setLoading(true);

        const { error } = await supabase.from("solicitacoes_contrato").insert({
            id_aluno: userId,
            id_empresa,
            status: "Solicitado",
        });

        if (error) {
            Alert.alert("Erro ao enviar solicitação.");
        } else {
            Alert.alert("Sucesso", "Solicitação enviada com sucesso!");
            setSolicitacoes((old) => [...old, id_empresa]);
        }

        setLoading(false);
    }

    async function cancelarSolicitacao(id_empresa: string) {
        setLoading(true);

        const { error } = await supabase
            .from("solicitacoes_contrato")
            .delete()
            .match({ id_aluno: userId, id_empresa });

        if (error) {
            Alert.alert("Erro ao cancelar solicitação.");
        } else {
            Alert.alert("Solicitação cancelada com sucesso.");
            setSolicitacoes((prev) => prev.filter((id) => id !== id_empresa));
        }

        setLoading(false);
    }

    function filtrarEmpresas(text: string) {
        setSearch(text);
        if (!text) {
            setFilteredEmpresas(empresas);
            return;
        }

        const filtered = empresas.filter((empresa) =>
            empresa.nome.toLowerCase().includes(text.toLowerCase())
        );
        setFilteredEmpresas(filtered);
    }

    useEffect(() => {
        carregarDados();
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>Solicitar Transporte</Text>

                <View style={styles.notificacaoContainer}>
                    <NotificacaoBell />
                </View>
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
            >
                <Text style={styles.infoText}>
                    Você faz sua solicitação aqui para a empresa que deseja contratar o transporte.
                </Text>

                <Text style={styles.contratoTitle}>Contrato ativo</Text>
                {contratoAtivo && (
                    <View style={styles.ativoContainer}>
                        <Ionicons name="checkmark-circle" size={24} color="#2e7d32" />
                        <Text style={styles.ativoText}>
                            Você já utiliza o transporte da empresa {contratoAtivo.empresa?.nome}.
                        </Text>
                    </View>
                )}

                <View style={styles.searchWrapper}>
                    <Ionicons name="search" size={20} color="#9D4EDD" style={styles.searchIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Pesquisar empresa..."
                        value={search}
                        onChangeText={filtrarEmpresas}
                        placeholderTextColor="#BBA9DD"
                    />
                </View>

                {loading && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#9D4EDD" />
                        <Text style={styles.loadingText}>Solicitação em processamento...</Text>
                    </View>
                )}

                {!loading && filteredEmpresas.length === 0 && (
                    <Text style={styles.noResults}>Nenhuma empresa encontrada.</Text>
                )}

                {!loading &&
                    filteredEmpresas.map((empresa) => {
                        const jaSolicitado = solicitacoes.includes(empresa.id);
                        return (
                            <View key={empresa.id} style={styles.cardWrapper}>
                                <TouchableOpacity
                                    style={[styles.card, jaSolicitado && styles.cardSolicitado]}
                                    onPress={() => !jaSolicitado && solicitarContrato(empresa.id)}
                                    disabled={loading || contratoAtivo !== null}
                                >
                                    <View style={styles.cardIcon} />
                                    <Text
                                        style={[
                                            styles.cardText,
                                            jaSolicitado && styles.textRoxoSolicitado,
                                        ]}
                                    >
                                        {empresa.nome} {jaSolicitado ? "(Solicitado)" : ""}
                                    </Text>
                                </TouchableOpacity>

                                {jaSolicitado && (
                                    <TouchableOpacity
                                        style={styles.cancelButton}
                                        onPress={() =>
                                            Alert.alert(
                                                "Cancelar solicitação?",
                                                `Tem certeza que deseja cancelar a solicitação para ${empresa.nome}?`,
                                                [
                                                    { text: "Não", style: "cancel" },
                                                    {
                                                        text: "Sim",
                                                        onPress: () => cancelarSolicitacao(empresa.id),
                                                    },
                                                ]
                                            )
                                        }
                                    >
                                        <Text style={styles.cancelButtonText}>Cancelar solicitação</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        );
                    })}
            </ScrollView>

            <NavBar />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F9F4FF" },
    header: {
        backgroundColor: "#5A189A",
        paddingTop: 60,
        paddingBottom: 30,
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
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
    notificacaoContainer: {
        position: "absolute",
        right: 16,
        top: 60,
    },
    headerTitle: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "bold",
        flex: 1,
        textAlign: "center",
    },
    content: {
        padding: 24,
        paddingBottom: 100,
    },
    infoText: {
        fontSize: 16,
        color: "#4B3B83",
        marginBottom: 16,
        textAlign: "center",
    },
    contratoTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#5A189A",
        marginBottom: 8,
    },
    ativoContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#dcedc8",
        padding: 12,
        borderRadius: 12,
        marginBottom: 20,
    },
    ativoText: {
        marginLeft: 8,
        color: "#2e7d32",
        fontWeight: "600",
        fontSize: 16,
    },
    searchWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#EEE0FF",
        borderRadius: 12,
        marginBottom: 20,
        paddingHorizontal: 14,
    },
    searchIcon: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 16,
        color: "#5A189A",
    },
    cardWrapper: {
        marginBottom: 20,
    },
    card: {
        backgroundColor: "#9D4EDD",
        borderRadius: 16,
        padding: 20,
        flexDirection: "row",
        alignItems: "center",
        elevation: 2,
    },
    cardSolicitado: {
        backgroundColor: "#EADCFD",
    },
    cardIcon: {
        backgroundColor: "#fff",
        width: 24,
        height: 24,
        borderRadius: 12,
        marginRight: 16,
    },
    cardText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#fff",
    },
    textRoxoSolicitado: {
        color: "#5A189A",
    },
    loadingContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
    },
    loadingText: {
        marginLeft: 10,
        fontSize: 16,
        color: "#9D4EDD",
    },
    noResults: {
        textAlign: "center",
        color: "#888",
        fontSize: 16,
    },
    cancelButton: {
        marginTop: 6,
        alignSelf: "flex-start",
        backgroundColor: "#fff",
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    cancelButtonText: {
        color: "#9D4EDD",
        fontWeight: "bold",
    },
});
