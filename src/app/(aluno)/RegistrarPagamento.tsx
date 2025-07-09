import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";

import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    TextInput,
    ScrollView,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import * as FileSystem from "expo-file-system";
import { supabase } from "../../lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useRouter, useLocalSearchParams } from "expo-router"; // <-- aqui
import NavBar from "../../../components/NavBar";
import NotificacaoBell from "../../../components/NotificacaoBell";

import {
    DocumentPickerAsset,
    getDocumentAsync,
} from "expo-document-picker";
import { decode } from "base64-arraybuffer";

export default function RegistrarPagamento() {
    const router = useRouter();
    const params = useLocalSearchParams(); // <-- useLocalSearchParams

    const meses = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
    const anoAtual = new Date().getFullYear();
    const anos = Array.from({ length: 8 }, (_, i) => anoAtual - 1 + i);

    const [mes, setMes] = useState("");
    const [ano, setAno] = useState("");
    const [valorFormatado, setValorFormatado] = useState("");
    const [comprovante, setComprovante] = useState<DocumentPickerAsset | null>(null);
    const [temContratoAtivo, setTemContratoAtivo] = useState<boolean | null>(null);

    useEffect(() => {
        // Preenche mês e ano via params da URL, se existirem
        if (params.mes) setMes(String(params.mes));
        if (params.ano) setAno(String(params.ano));
    }, [params.mes, params.ano]);

    useEffect(() => {
        async function checarContrato() {
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError || !user) {
                Alert.alert("Erro", "Usuário não autenticado.");
                setTemContratoAtivo(false);
                return;
            }

            const { data: contratoData } = await supabase
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

    function formatarMoeda(valor: string) {
        const apenasNumeros = valor.replace(/\D/g, "");
        const numero = (parseInt(apenasNumeros || "0", 10) / 100).toFixed(2);
        return "R$ " + numero.replace(".", ",");
    }

    const handleValorChange = (text: string) => {
        setValorFormatado(formatarMoeda(text));
    };

    const pickDocument = async () => {
        const result = await getDocumentAsync({
            type: "*/*",
            multiple: false,
            copyToCacheDirectory: true,
        });
        if (!result.canceled && result.assets.length > 0) {
            setComprovante(result.assets[0]);
        }
    };

    const handleUpload = async () => {
        if (!mes || !ano || !valorFormatado) {
            Alert.alert("Erro", "Preencha todos os campos.");
            return;
        }

        if (!temContratoAtivo) {
            Alert.alert("Sem contrato ativo", "Você precisa ter um contrato ativo para registrar pagamento.");
            return;
        }

        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            Alert.alert("Erro", "Usuário não autenticado.");
            return;
        }

        const valorNumerico = parseFloat(valorFormatado.replace(/[R$\s.]/g, "").replace(",", "."));
        let comprovanteUrl: string | null = null;

        try {
            if (comprovante) {
                const fileExt = comprovante.name.split(".").pop();
                const fileName = `${user.id}/${uuidv4()}.${fileExt}`;
                const mimeType = comprovante.mimeType || "application/octet-stream";

                const fileBuffer = await FileSystem.readAsStringAsync(comprovante.uri, {
                    encoding: FileSystem.EncodingType.Base64,
                });

                const { error: uploadError } = await supabase.storage
                    .from("comprovantes")
                    .upload(fileName, decode(fileBuffer), {
                        contentType: mimeType,
                        upsert: false,
                    });

                if (uploadError) {
                    Alert.alert("Erro no upload", uploadError.message);
                    return;
                }

                const { data: publicUrlData } = supabase.storage
                    .from("comprovantes")
                    .getPublicUrl(fileName);

                comprovanteUrl = publicUrlData.publicUrl;
            }

            const { error: insertError } = await supabase
                .from("pagamentos")
                .insert({
                    mes,
                    ano: parseInt(ano),
                    valor: valorNumerico,
                    id_aluno: user.id,
                    comprovante_url: comprovanteUrl,
                });

            if (insertError) {
                Alert.alert("Erro ao registrar pagamento", insertError.message);
                return;
            }

            Alert.alert("Sucesso", "Pagamento registrado com sucesso!");
            setMes("");
            setAno("");
            setValorFormatado("");
            setComprovante(null);
        } catch (e: any) {
            console.log("Erro:", e);
            Alert.alert("Erro inesperado", e.message || "Tente novamente.");
        }
    };

    const renderHeader = (
        <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Registrar Pagamento</Text>
            <View style={styles.notificacaoContainer}>
                <NotificacaoBell />
            </View>
        </View>
    );

    if (temContratoAtivo === null) {
        return (
            <SafeAreaView style={styles.container}>
                {renderHeader}
                <View style={[styles.whiteWrapper, { justifyContent: "center", flex: 1 }]}>
                    <Text style={{ textAlign: "center", color: "#5A189A", fontSize: 16 }}>
                        Carregando...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!temContratoAtivo) {
        return (
            <SafeAreaView style={styles.container}>
                {renderHeader}
                <View style={styles.whiteWrapper}>
                    <View style={styles.avisoContainer}>
                        <Text style={styles.avisoText}>
                            Você precisa ter um <Text style={{ fontWeight: "bold" }}>contrato ativo</Text> para registrar pagamentos.
                        </Text>
                        <TouchableOpacity
                            style={styles.avisoButton}
                            onPress={() => router.push("/SolicitarTransporte")}
                        >
                            <Text style={styles.avisoButtonText}>Solicitar Transporte</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.navBarWrapper}>
                    <NavBar />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            
            {renderHeader}
            
            <View style={styles.whiteWrapper}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                    style={{ flex: 1 }}
                    
                >
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        <Text style={styles.infoText}>
                            Preencha todos os campos e anexe um arquivo para enviar o comprovante de pagamento via PIX ou outro método.
                        </Text>

                        <View style={styles.row}>
                            <View style={styles.column}>
                                <Text style={styles.label}>Mês</Text>
                                <View style={styles.pickerBoxSmall}>
                                    <Picker
                                        selectedValue={mes}
                                        onValueChange={(v) => setMes(v)}
                                        dropdownIconColor="#5A189A"
                                        style={styles.picker}
                                    >
                                        <Picker.Item label="Selecione" value="" />
                                        {meses.map((m) => (
                                            <Picker.Item key={m} label={m} value={m} />
                                        ))}
                                    </Picker>
                                </View>
                            </View>

                            <View style={styles.column}>
                                <Text style={styles.label}>Ano</Text>
                                <View style={styles.pickerBoxSmall}>
                                    <Picker
                                        selectedValue={ano}
                                        onValueChange={(v) => setAno(v)}
                                        dropdownIconColor="#5A189A"
                                        style={styles.picker}
                                    >
                                        <Picker.Item label="Selecione" value="" />
                                        {anos.map((a) => (
                                            <Picker.Item key={a} label={String(a)} value={String(a)} />
                                        ))}
                                    </Picker>
                                </View>
                            </View>
                        </View>

                        <Text style={styles.label}>Valor</Text>
                        <TextInput
                            placeholder="R$ 0,00"
                            keyboardType="numeric"
                            style={styles.input}
                            value={valorFormatado}
                            onChangeText={handleValorChange}
                            maxLength={15}
                        />

                        <TouchableOpacity style={styles.uploadButton} onPress={pickDocument}>
                            <Ionicons name="attach" size={20} color="#fff" />
                            <Text style={styles.uploadText}>
                                {comprovante ? comprovante.name : "Selecionar comprovante"}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.sendButton} onPress={handleUpload}>
                            <Text style={styles.sendText}>Registrar Pagamento</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </KeyboardAvoidingView>
            </View>
            <View style={styles.navBarWrapper}>
                <NavBar />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#5A189A" },
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
    headerTitle: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "bold",
        flex: 1,
        textAlign: "center",
    },
    notificacaoContainer: {
        position: "absolute",
        right: 16,
        top: 60,
    },
    whiteWrapper: {
        flex: 1,
        backgroundColor: "#fff",
        paddingHorizontal: 25,
    },
    scrollContent: {
        paddingBottom: 140,
        paddingTop: 20,
    },
    infoText: {
        fontSize: 14,
        color: "#555",
        marginBottom: 10,
        fontStyle: "italic",
        textAlign: "center",
        lineHeight: 20,
        paddingTop: 26,
    },
    label: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 8,
        color: "#4B3B83",
    },
    input: {
        borderWidth: 1,
        borderColor: "#cfcfcf",
        padding: 14,
        borderRadius: 12,
        marginBottom: 20,
        backgroundColor: "#fafafa",
        fontSize: 16,
        color: "#5A189A",
    },
    pickerBoxSmall: {
        borderWidth: 1,
        borderColor: "#cfcfcf",
        borderRadius: 12,
        marginBottom: 20,
        overflow: "hidden",
        backgroundColor: "#fafafa",
    },
    picker: {
        color: "#5A189A",
    },
    uploadButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#9D4EDD",
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 15,
        marginTop: 10,
    },
    uploadText: {
        color: "#fff",
        marginLeft: 12,
        fontWeight: "700",
        fontSize: 16,
    },
    sendButton: {
        backgroundColor: "#9D4EDD",
        paddingVertical: 18,
        borderRadius: 16,
        marginTop: 30,
        alignItems: "center",
    },
    sendText: {
        color: "#fff",
        fontWeight: "800",
        fontSize: 18,
        letterSpacing: 0.8,
    },
    navBarWrapper: {
        backgroundColor: "#5A189A",
        paddingBottom: 20,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 10,
        paddingTop: 14,
    },
    column: {
        flex: 1,
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
    },
    avisoButtonText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 16,
    },
});
