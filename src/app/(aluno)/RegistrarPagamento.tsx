import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    TextInput,
    ScrollView,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { supabase } from "../../lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";

export default function RegistrarPagamento() {
    const [mes, setMes] = useState("");
    const [ano, setAno] = useState("");
    const [valorFormatado, setValorFormatado] = useState("");
    const [comprovante, setComprovante] = useState<any>(null);

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
        if (!comprovante || !mes || !ano || !valorFormatado) {
            Alert.alert("Erro", "Preencha todos os campos e selecione o comprovante.");
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

        try {
            const base64 = await FileSystem.readAsStringAsync(comprovante.uri, {
                encoding: FileSystem.EncodingType.Base64,
            });

            const fileExt = comprovante.name.split(".").pop();
            const fileName = `${user.id}_${Date.now()}.${fileExt}`;
            const filePath = `pagamentos/${fileName}`;
            const mimeType = comprovante.mimeType || "application/octet-stream";

            const base64WithPrefix = `data:${mimeType};base64,${base64}`;

            const { error: uploadError } = await supabase.storage
                .from("comprovantes")
                .upload(filePath, base64WithPrefix, {
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
                .getPublicUrl(filePath);

            const urlComprovante = publicUrlData.publicUrl;

            const { error: insertError } = await supabase.from("Pagamentos").insert({
                mes,
                ano: parseInt(ano),
                valor: valorNumerico,
                id_aluno: user.id,
                comprovante_url: urlComprovante,
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
            Alert.alert("Erro inesperado", e.message || "Tente novamente.");
        }
    };

    const pickDocument = async () => {
        const result = await DocumentPicker.getDocumentAsync({ type: "*/*" });
        if (!result.canceled && result.assets.length > 0) {
            setComprovante(result.assets[0]);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Registrar Pagamento</Text>

            <Text style={styles.label}>Mês</Text>
            <View style={styles.pickerBox}>
                <Picker selectedValue={mes} onValueChange={(itemValue) => setMes(itemValue)}>
                    <Picker.Item label="Selecione o mês" value="" />
                    {meses.map((m) => (
                        <Picker.Item key={m} label={m} value={m} />
                    ))}
                </Picker>
            </View>

            <Text style={styles.label}>Ano</Text>
            <View style={styles.pickerBox}>
                <Picker selectedValue={ano} onValueChange={(itemValue) => setAno(itemValue)}>
                    <Picker.Item label="Selecione o ano" value="" />
                    {anos.map((a) => (
                        <Picker.Item key={a} label={String(a)} value={String(a)} />
                    ))}
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
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        paddingTop: 50,
        backgroundColor: "#fff",
        flexGrow: 1,
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 30,
        color: "#5A189A",
        textAlign: "center",
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
    },
    pickerBox: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 10,
        marginBottom: 15,
        overflow: "hidden",
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
});
