import React, { useEffect, useState } from "react";
import { TouchableOpacity, StyleSheet, View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { supabase } from "../src/lib/supabase";

type Props = {
    cor?: string;
    tamanho?: number;
};

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
        "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
    ];
    return meses[mesNumero - 1];
}

export default function NotificacaoBell({ cor = "#fff", tamanho = 28 }: Props) {
    const [notificacoesNaoLidas, setNotificacoesNaoLidas] = useState(0);

    useEffect(() => {
        async function verificarPendenciasPagamento() {
            const {
                data: { user },
            } = await supabase.auth.getUser();

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
            pagamentos?.forEach(p => {
                const chave = `${p.mes.toLowerCase()}_${p.ano}`;
                pagamentosMap.set(chave, !!p.comprovante_url);
            });

            let pendentes = 0;
            listaMesAno.forEach(({ mes, ano }) => {
                const nomeMes = nomeMesPorNumero(mes);
                const chave = `${nomeMes}_${ano}`;
                if (!pagamentosMap.get(chave)) {
                    pendentes++;
                }
            });

            setNotificacoesNaoLidas(pendentes);
        }

        verificarPendenciasPagamento();
    }, []);

    return (
        <TouchableOpacity onPress={() => router.push("/(aluno)/notificacoes")}>
            <View>
                <Ionicons name="notifications-outline" size={tamanho} color={cor} />
                {notificacoesNaoLidas > 0 && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{notificacoesNaoLidas}</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    badge: {
        position: "absolute",
        right: -4,
        top: -4,
        backgroundColor: "#ff5252",
        borderRadius: 10,
        paddingHorizontal: 5,
        paddingVertical: 1,
        minWidth: 18,
        alignItems: "center",
        justifyContent: "center",
    },
    badgeText: {
        color: "#fff",
        fontSize: 11,
        fontWeight: "bold",
        textAlign: "center",
    },
});
