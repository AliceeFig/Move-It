import React, { useState, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    ActivityIndicator,
    Alert,
    TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import NavBar from "../../../components/NavBar";
import { supabase } from "../../lib/supabase";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import NotificacaoBell from "../../../components/NotificacaoBell";
import { Picker } from "@react-native-picker/picker";

type ContratoExtendido = {
    id: string;
    valor: number;
    status: string;
    inicio: string;
    termino: string;
    turno: string;
    id_aluno: string;
    id_empresa: string;
    empresa?: { nome: string };
    ponto_inicial?: { nome: string };
};

export default function VerContrato() {
    const [contrato, setContrato] = useState<ContratoExtendido | null>(null);
    const [loading, setLoading] = useState(true);
    const [pontos, setPontos] = useState<{ id: number; nome: string }[]>([]);
    const [pontoSelecionado, setPontoSelecionado] = useState<number | null>(null);
    const [modoEdicaoPonto, setModoEdicaoPonto] = useState(false);

    const fetchContrato = useCallback(async () => {
        setLoading(true);
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) {
            Alert.alert("Erro", "Usuário não autenticado.");
            setLoading(false);
            return;
        }

        const { data, error: contratoError } = await supabase
            .from("contrato")
            .select(`*, empresa (nome), ponto_inicial: id_ponto_inicial (nome)`)
            .eq("id_aluno", user.id)
            .limit(1)
            .single();

        if (contratoError || !data) {
            setContrato(null);
            setLoading(false);
            return;
        }

        setContrato(data);

        const { data: pontosData, error: pontosError } = await supabase
            .from("pontos_parada")
            .select("id, nome");

        if (!pontosError && pontosData) {
            setPontos(pontosData);
        }

        setLoading(false);
    }, []);

    async function atualizarPontoInicial() {
        if (!contrato || pontoSelecionado === null) return;

        const { error } = await supabase
            .from("contrato")
            .update({ id_ponto_inicial: pontoSelecionado })
            .eq("id", contrato.id);

        if (error) {
            Alert.alert("Erro", "Não foi possível atualizar o ponto.");
        } else {
            Alert.alert("Sucesso", "Ponto atualizado!");
            setModoEdicaoPonto(false);
            fetchContrato();
        }
    }

    function confirmarAtualizacaoPonto() {
        if (pontoSelecionado === null) return;
        Alert.alert(
            "Confirmar alteração",
            "Deseja realmente alterar o ponto inicial?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Confirmar",
                    style: "default",
                    onPress: atualizarPontoInicial,
                },
            ]
        );
    }

    function cancelarEdicao() {
        setModoEdicaoPonto(false);
        setPontoSelecionado(null);
    }

    useFocusEffect(
        useCallback(() => {
            fetchContrato();
        }, [fetchContrato])
    );

    const formatarData = (dataStr: string) => {
        const data = new Date(dataStr);
        return `${data.getDate().toString().padStart(2, '0')}/${(data.getMonth() + 1)
            .toString().padStart(2, '0')}/${data.getFullYear()}`;
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#5A189A" />
            </SafeAreaView>
        );
    }

    if (!contrato) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerText}>Contrato</Text>
                    <View style={styles.notificacaoContainer}><NotificacaoBell /></View>
                </View>

                <View style={styles.avisoContainer}>
                    <Text style={styles.avisoText}>Você não possui um contrato ativo.</Text>
                    <TouchableOpacity
                        style={styles.avisoButton}
                        onPress={() => router.push("/SolicitarTransporte")}
                    >
                        <Text style={styles.avisoButtonText}>Solicitar Transporte</Text>
                    </TouchableOpacity>
                </View>

                <NavBar />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerText}>Contrato</Text>
                <View style={styles.notificacaoContainer}><NotificacaoBell /></View>
            </View>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.title}>Informações do Contrato</Text>

                <View style={styles.infoBoxDecorated}>
                    <Text style={styles.label}>Status</Text>
                    <Text style={styles.value}>{contrato.status}</Text>

                    <Text style={styles.label}>Valor</Text>
                    <Text style={styles.value}>R$ {contrato.valor.toFixed(2).replace(".", ",")}</Text>

                    <Text style={styles.label}>Turno</Text>
                    <Text style={styles.value}>{contrato.turno}</Text>

                    <Text style={styles.label}>Ponto Inicial Atual</Text>
                    <View style={styles.pontoRow}>
                        <Text style={styles.value}>{contrato.ponto_inicial?.nome || "Não encontrado"}</Text>
                        <TouchableOpacity
                            onPress={() => setModoEdicaoPonto(!modoEdicaoPonto)}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            style={styles.iconePencilTouch}
                        >
                            <Ionicons name="pencil" size={24} color="#9D4EDD" />
                        </TouchableOpacity>
                    </View>

                    {modoEdicaoPonto && (
                        <>
                            <Text style={styles.label}>Escolher novo ponto</Text>
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={pontoSelecionado}
                                    onValueChange={(itemValue) => setPontoSelecionado(itemValue)}
                                    style={styles.picker}
                                    dropdownIconColor="#4B3B83"
                                >
                                    <Picker.Item label="Selecione um ponto..." value={null} />
                                    {pontos.map((ponto) => (
                                        <Picker.Item key={ponto.id} label={ponto.nome} value={ponto.id} />
                                    ))}
                                </Picker>
                            </View>

                            <View style={styles.botoesContainer}>
                                <TouchableOpacity
                                    style={[styles.botaoSalvar, { marginRight: 12 }]}
                                    onPress={confirmarAtualizacaoPonto}
                                    disabled={pontoSelecionado === null}
                                >
                                    <Text style={styles.botaoSalvarTexto}>Salvar</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.botaoCancelar}
                                    onPress={cancelarEdicao}
                                >
                                    <Text style={styles.botaoCancelarTexto}>Cancelar</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}

                    <Text style={styles.label}>Empresa</Text>
                    <Text style={styles.value}>{contrato.empresa?.nome || "Não encontrado"}</Text>

                    <Text style={styles.label}>Início</Text>
                    <Text style={styles.value}>{formatarData(contrato.inicio)}</Text>

                    <Text style={styles.label}>Término</Text>
                    <Text style={styles.value}>{formatarData(contrato.termino)}</Text>
                </View>

                <View style={{ height: 100 }} />
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
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
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
    notificacaoContainer: {
        position: "absolute",
        right: 16,
        top: 60,
    },
    headerText: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "center",
    },
    content: {
        paddingTop: 20,
        padding: 24,
        paddingBottom: 140,
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#4B3B83",
        marginBottom: 24,
        textAlign: "center",
    },
    infoBoxDecorated: {
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 24,
        borderWidth: 2,
        borderColor: "#D5B3F4",
        shadowColor: "#9D4EDD",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 5,
    },
    label: {
        fontSize: 13,
        color: "#888",
        marginTop: 16,
    },
    value: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#4B3B83",
        marginTop: 4,
    },
    pontoRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 4,
    },
    iconePencilTouch: {
        padding: 6,
        borderRadius: 6,
    },
    pickerContainer: {
        marginTop: 8,
        backgroundColor: "#F9F4FF",
        borderWidth: 1.5,
        borderColor: "#D5B3F4",
        borderRadius: 12,
        overflow: "hidden",
    },
    picker: {
        height: 50,
        color: "#4B3B83",
    },
    botoesContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 12,
    },
    botaoSalvar: {
        backgroundColor: "#9D4EDD",
        paddingVertical: 10,
        paddingHorizontal: 28,
        borderRadius: 20,
        alignItems: "center",
        flex: 1,
    },
    botaoSalvarTexto: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "600",
    },
    botaoCancelar: {
        backgroundColor: "#EADCFD",
        paddingVertical: 10,
        paddingHorizontal: 28,
        borderRadius: 20,
        alignItems: "center",
        flex: 1,
    },
    botaoCancelarTexto: {
        color: "#4B3B83",
        fontSize: 15,
        fontWeight: "600",
    },
    avisoContainer: {
        marginTop: 100,
        marginHorizontal: 20,
        backgroundColor: "#f4eafd",
        borderWidth: 2,
        borderColor: "#9D4EDD",
        padding: 20,
        borderRadius: 15,
        alignItems: "center",
        justifyContent: "center",
    },
    avisoText: {
        color: "#9D4EDD",
        fontSize: 16,
        marginBottom: 20,
        textAlign: "center",
    },
    avisoButton: {
        backgroundColor: "#9D4EDD",
        paddingVertical: 12,
        paddingHorizontal: 28,
        borderRadius: 25,
        elevation: 3,
    },
    avisoButtonText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 16,
    },
});
