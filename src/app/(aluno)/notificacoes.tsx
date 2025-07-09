import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../lib/supabase";
import { router } from "expo-router";

function gerarMesAnoLista(inicio: Date, fim: Date) {
    const lista = [];
    let ano = inicio.getFullYear();
    let mes = inicio.getMonth();

    const anoFim = fim.getFullYear();
    const mesFim = fim.getMonth();

    while (ano < anoFim || (ano === anoFim && mes <= mesFim)) {
        lista.push({ mes: mes + 1, ano });
        mes++;
        if (mes > 11) {
            mes = 0;
            ano++;
        }
    }
    return lista;
}

function nomeMesPorNumero(mesNumero: number) {
    const meses = [
        "janeiro", "fevereiro", "março", "abril", "maio", "junho",
        "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
    ];
    return meses[mesNumero - 1];
}

export default function Notificacoes() {
    const [notificacoes, setNotificacoes] = useState<
        { texto: string; mes: string; ano: number }[]
    >([]);

    useEffect(() => {
        async function verificarPendencias() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: contrato, error: contratoError } = await supabase
                .from("contrato")
                .select("inicio")
                .eq("id_aluno", user.id)
                .neq("status", "cancelado")
                .maybeSingle();

            if (contratoError || !contrato || !contrato.inicio) return;

            const dataInicio = new Date(contrato.inicio);
            const dataHoje = new Date();

            const listaMesAno = gerarMesAnoLista(dataInicio, dataHoje);

            const { data: pagamentos, error: pagamentosError } = await supabase
                .from("pagamentos")
                .select("mes, ano, comprovante_url")
                .eq("id_aluno", user.id);

            if (pagamentosError) return;

            const pagamentosMap = new Map<string, boolean>();
            pagamentos?.forEach((p) => {
                const chave = `${p.mes.toLowerCase()}_${p.ano}`;
                pagamentosMap.set(chave, !!p.comprovante_url);
            });

            const novasMensagens: { texto: string; mes: string; ano: number }[] = [];

            listaMesAno.forEach(({ mes, ano }) => {
                const nomeMes = nomeMesPorNumero(mes);
                const chave = `${nomeMes}_${ano}`;
                if (!pagamentosMap.get(chave)) {
                    const nomeMesCapitalizado =
                        nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1);
                    const texto = `Você ainda não enviou o pagamento da parcela de ${nomeMesCapitalizado}/${ano}.`;
                    novasMensagens.push({ texto, mes: nomeMesCapitalizado, ano });
                }
            });

            setNotificacoes(novasMensagens);
        }

        verificarPendencias();
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerText}>Notificações</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {notificacoes.length === 0 ? (
                    <Text style={styles.semAvisos}>Nenhuma notificação no momento.</Text>
                ) : (
                    notificacoes.map(({ texto, mes, ano }, idx) => (
                        <View key={idx} style={styles.card}>
                            <Ionicons name="alert-circle" size={28} color="#9D4EDD" />
                            <Text style={styles.text}>{texto}</Text>

                            <TouchableOpacity
                                style={styles.botaoPagar}
                                onPress={() => router.push(`/RegistrarPagamento?mes=${mes}&ano=${ano}`)}
                            >
                                <Text style={styles.textPagar}>Pagar</Text>
                            </TouchableOpacity>
                        </View>
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F9F4FF" },
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
        flex: 1,
        textAlign: "center",
    },
    content: {
        padding: 24,
        paddingBottom: 120,
    },
    semAvisos: {
        textAlign: "center",
        color: "#999",
        fontStyle: "italic",
        marginTop: 40,
        fontSize: 16,
    },
    card: {
        backgroundColor: "#EADCFD",
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        flexDirection: "row",
        alignItems: "center",
        elevation: 3,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
        gap: 12,
        justifyContent: "space-between",
    },
    text: {
        fontSize: 16,
        color: "#4B3B83",
        flex: 1,
        marginRight: 10,
    },
    botaoPagar: {
        backgroundColor: "#9D4EDD",
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 12,
    },
    textPagar: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 14,
    },
});
