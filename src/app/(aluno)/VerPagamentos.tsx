import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { supabase } from "../../lib/supabase";
import NavBar from "../../../components/NavBar";
import { MaterialIcons, Feather, AntDesign } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Modal from "react-native-modal";
import ImageViewer from "react-native-image-zoom-viewer";
import NotificacaoBell from "../../../components/NotificacaoBell";

const meses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];
const anoAtual = new Date().getFullYear();
const anos = Array.from({ length: 8 }, (_, i) => anoAtual - 1 + i);

type Pagamento = {
    id: string;
    mes: string;
    ano: number;
    valor: number;
    comprovante_url: string | null;
    data_pagamento: string;
};

export default function Pagamentos() {
    const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
    const [loading, setLoading] = useState(true);
    const [filtroMes, setFiltroMes] = useState("");
    const [filtroAno, setFiltroAno] = useState("");
    const [modalVisible, setModalVisible] = useState(false);
    const [imagemSelecionada, setImagemSelecionada] = useState<string | null>(null);
    const router = useRouter();

    async function fetchPagamentos() {
        setLoading(true);
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            Alert.alert("Erro", "Usuário não autenticado.");
            setLoading(false);
            return;
        }

        let query = supabase.from("pagamentos")
            .select("*")
            .eq("id_aluno", user.id)
            .order("data_pagamento", { ascending: false });

        if (filtroMes) query = query.eq("mes", filtroMes);
        if (filtroAno) query = query.eq("ano", parseInt(filtroAno));

        const { data, error } = await query;
        if (error) {
            Alert.alert("Erro ao buscar pagamentos", error.message);
            setLoading(false);
            return;
        }

        setPagamentos(data || []);
        setLoading(false);
    }

    useEffect(() => {
        fetchPagamentos();
    }, [filtroMes, filtroAno]);

    const abrirModalComImagem = (url: string) => {
        setImagemSelecionada(url);
        setModalVisible(true);
    };

    const handleDeletePagamento = async (id: string) => {
        const { error } = await supabase
            .from("pagamentos")
            .delete()
            .eq("id", id);

        if (error) {
            Alert.alert("Erro", "Não foi possível apagar o pagamento.");
        } else {
            fetchPagamentos();
        }
    };

    const confirmarExclusao = (item: Pagamento) => {
        Alert.alert(
            "Excluir pagamento",
            "Tem certeza que deseja apagar esse pagamento permanentemente?",
            [
                { text: "Cancelar", style: "cancel" },
                { text: "Apagar", style: "destructive", onPress: () => handleDeletePagamento(item.id) },
            ]
        );
    };

    const renderItem = ({ item }: { item: Pagamento }) => {
        const dataPagamentoFormatada = new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        }).format(new Date(item.data_pagamento));

        return (
            <View style={styles.cardPagamento}>
                <View style={{ flex: 1 }}>
                    <Text style={{ marginBottom: 6, color: '#555', fontSize: 13 }}>
                        Enviado em {dataPagamentoFormatada}
                    </Text>
                    <Text style={styles.cardTitulo}>{item.mes} / {item.ano}</Text>
                    <Text style={styles.cardValor}>R$ {item.valor.toFixed(2).replace(".", ",")}</Text>
                    {item.comprovante_url && (
                        <TouchableOpacity onPress={() => abrirModalComImagem(item.comprovante_url)}>
                            <Text style={styles.textoBotao}>Ver comprovante</Text>
                        </TouchableOpacity>
                    )}
                </View>
                <TouchableOpacity onPress={() => confirmarExclusao(item)} style={styles.trashButton}>
                    <Feather name="trash-2" size={22} color="#4B3B83" />
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <MaterialIcons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>

                <Text style={styles.headerText}>Pagamentos</Text>

                <View style={styles.notificacaoContainer}>
                    <NotificacaoBell />
                </View>
            </View>

            <Modal
                isVisible={modalVisible}
                onBackdropPress={() => setModalVisible(false)}
                style={{ margin: 0, backgroundColor: "black" }}
            >
                {imagemSelecionada && (
                    <>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setModalVisible(false)}
                        >
                            <AntDesign name="close" size={28} color="#fff" />
                        </TouchableOpacity>

                        <ImageViewer
                            imageUrls={[{ url: imagemSelecionada }]}
                            enableSwipeDown={true}
                            onSwipeDown={() => setModalVisible(false)}
                            renderIndicator={() => null}
                        />
                    </>
                )}
            </Modal>

            <View style={styles.content}>
                <View style={styles.filtrosContainer}>
                    <View style={styles.filtroBox}>
                        <Picker
                            selectedValue={filtroMes}
                            onValueChange={setFiltroMes}
                            style={styles.pickerFiltro}
                            dropdownIconColor="#4B3B83"
                        >
                            <Picker.Item label="Mês" value="" />
                            {meses.map((m) => (
                                <Picker.Item key={m} label={m} value={m} />
                            ))}
                        </Picker>
                    </View>
                    <View style={styles.filtroBox}>
                        <Picker
                            selectedValue={filtroAno}
                            onValueChange={setFiltroAno}
                            style={styles.pickerFiltro}
                            dropdownIconColor="#4B3B83"
                        >
                            <Picker.Item label="Ano" value="" />
                            {anos.map((a) => (
                                <Picker.Item key={a} label={String(a)} value={String(a)} />
                            ))}
                        </Picker>
                    </View>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color="#5A189A" />
                ) : pagamentos.length === 0 ? (
                    <Text style={styles.semPagamentos}>Nenhum pagamento registrado ainda.</Text>
                ) : (
                    <FlatList
                        data={pagamentos}
                        keyExtractor={(item) => item.id}
                        renderItem={renderItem}
                        contentContainerStyle={{ paddingBottom: 120, paddingTop: 10 }}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    />
                )}
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
        color: "white",
        fontSize: 20,
        fontWeight: "bold",
    },
    content: {
        flex: 1,
        backgroundColor: "#fff",
        paddingHorizontal: 25,
        paddingTop: 20,
    },
    filtrosContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 10,
        marginBottom: 20,
    },
    filtroBox: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#cfcfcf",
        borderRadius: 12,
        backgroundColor: "#fafafa",
        overflow: "hidden",
    },
    pickerFiltro: {
        color: "#4B3B83",
    },
    cardPagamento: {
        backgroundColor: "#fefefe",
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        elevation: 3,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    trashButton: {
        padding: 8,
        marginLeft: 10,
    },
    cardTitulo: {
        fontSize: 17,
        fontWeight: "700",
        color: "#4B3B83",
    },
    cardValor: {
        fontSize: 16,
        color: "#5A189A",
        marginTop: 6,
        fontWeight: "600",
    },
    textoBotao: {
        color: "#9D4EDD",
        fontWeight: "bold",
        fontSize: 14,
        marginTop: 6,
    },
    semPagamentos: {
        textAlign: "center",
        color: "#888",
        fontStyle: "italic",
        marginTop: 40,
        fontSize: 16,
    },
    closeButton: {
        position: "absolute",
        top: 30,
        right: 30,
        zIndex: 10,
        backgroundColor: "#00000088",
        borderRadius: 20,
        padding: 6,
    },
    navBarWrapper: {
        backgroundColor: "#5A189A",
        paddingBottom: 50,
    },
});
