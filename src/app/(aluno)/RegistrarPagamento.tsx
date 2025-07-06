import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";

import React, { useState } from "react";
import {
    View, Text, StyleSheet, TouchableOpacity, Alert,
    TextInput, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform
} from "react-native";
import * as FileSystem from "expo-file-system";
import { supabase } from "../../lib/supabase";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import NavBar from "../../../components/Navbar";
import { DocumentPickerAsset,getDocumentAsync } from "expo-document-picker";
import { decode } from "base64-arraybuffer";

export default function RegistrarPagamento() {
    const [mes, setMes] = useState("");
    const [ano, setAno] = useState("");
    const [valorFormatado, setValorFormatado] = useState("");
    const [comprovante, setComprovante] = useState<DocumentPickerAsset>(null);
    const router = useRouter();

    const meses = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
    ];
    const anoAtual = new Date().getFullYear();
    const anos = Array.from({ length: 8 }, (_, i) => anoAtual - 1 + i);

    function formatarMoeda(valor: string) {
        const apenasNumeros = valor.replace(/\D/g, "");
        const numero = (parseInt(apenasNumeros || "0", 10) / 100).toFixed(2);
        return "R$ " + numero.replace(".", ",");
    }

    const handleValorChange = (text: string) => {
        setValorFormatado(formatarMoeda(text));
    };

    const handleUpload = async () => {
        if (!mes || !ano || !valorFormatado) {
            Alert.alert("Erro", "Preencha todos os campos.");
            return;
        }

        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            Alert.alert("Erro", "Usuário não autenticado.");
            return;
        }

        const valorNumerico = parseFloat(
            valorFormatado.replace(/[R$\s.]/g, "").replace(",", ".")
        );

        let comprovanteUrl: string | null = null;

        try {
            if (comprovante) {
                const fileExt = comprovante.name.split('.').pop();
                const fileName = `${user.id}/${uuidv4()}.${fileExt}`;
                const fileUri = comprovante.uri;
                const mimeType = comprovante.mimeType || "application/octet-stream";

                const fileBuffer = await FileSystem.readAsStringAsync(fileUri, {
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

                const { data: publicUrlData } = supabase
                    .storage
                    .from("comprovantes")
                    .getPublicUrl(fileName);

                comprovanteUrl = publicUrlData.publicUrl;
            }

            const { error: insertError } = await supabase.from("pagamentos").insert({
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
            setMes(""); setAno(""); setValorFormatado(""); setComprovante(null);
        } catch (e: any) {
            console.log("Erro:", e);
            Alert.alert("Erro inesperado", e.message || "Tente novamente.");
        }
    };

    const pickDocument = async () => {
        const result = await getDocumentAsync({ type: "*/*", multiple: false, copyToCacheDirectory: true });
        if (!result.canceled && result.assets.length > 0) {
            setComprovante(result.assets[0]);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.profileIcon}>
                    <MaterialIcons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerText}>Registrar Pagamento</Text>
            </View>

            {/* Conteúdo principal */}
            <KeyboardAvoidingView
                style={styles.content}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
                    <Text style={styles.label}>Mês</Text>
                    <View style={styles.pickerBox}>
                        <Picker selectedValue={mes} onValueChange={(v) => setMes(v)}>
                            <Picker.Item label="Selecione o mês" value="" />
                            {meses.map((m) => <Picker.Item key={m} label={m} value={m} />)}
                        </Picker>
                    </View>

                    <Text style={styles.label}>Ano</Text>
                    <View style={styles.pickerBox}>
                        <Picker selectedValue={ano} onValueChange={(v) => setAno(v)}>
                            <Picker.Item label="Selecione o ano" value="" />
                            {anos.map((a) => <Picker.Item key={a} label={String(a)} value={String(a)} />)}
                        </Picker>
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

            {/* NavBar */}
            <View style={styles.navBarWrapper}>
                <NavBar />
            </View>
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
        backgroundColor: "#5A189A",
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
        backgroundColor: "#fff",
        padding: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: "600",
        marginTop: 10,
        color: "#333",
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        padding: 10,
        borderRadius: 10,
        marginBottom: 15,
        backgroundColor: "#fff",
    },
    pickerBox: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 10,
        marginBottom: 15,
        overflow: "hidden",
        backgroundColor: "#fff",
    },
    uploadButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#5A189A",
        padding: 12,
        borderRadius: 10,
        marginTop: 10,
    },
    uploadText: {
        color: "#fff",
        marginLeft: 8,
        fontWeight: "600",
    },
    sendButton: {
        backgroundColor: "#3A0CA3",
        padding: 15,
        borderRadius: 12,
        marginTop: 30,
        alignItems: "center",
    },
    sendText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 16,
    },
    navBarWrapper: {
        backgroundColor: "#5A189A",
        paddingBottom: 20,
    },
});