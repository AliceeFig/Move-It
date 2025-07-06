import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    FlatList,
    TouchableOpacity,
    Modal,
    Image,
    ActivityIndicator,
    Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { supabase } from "../../lib/supabase";
import NavBar from "../../../components/Navbar";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

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
};

export default function VerPagamentos() {
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
            .order("ano", { ascending: false })
            .order("mes", { ascending: false });

        if (filtroMes) query = query.eq("mes", filtroMes);
        if (filtroAno) query = query.eq("ano", parseInt(filtroAno));

        const { data, error } = await query;

        if (error) {
            Alert.alert("Erro ao buscar histórico de pagamentos", error.message);
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

    const renderItem = ({ item }: { item: Pagamento }) => (
        <View style={styles.cardPagamento}>
            <View>
                <Text style={styles.cardTitulo}>{item.mes} / {item.ano}</Text>
                <Text style={styles.cardValor}>R$ {item.valor.toFixed(2).replace(".", ",")}</Text>
            </View>
            {item.comprovante_url ? (
                <TouchableOpacity
                    style={styles.botaoComprovante}
                    onPress={() => abrirModalComImagem(item.comprovante_url)}
                >
                    <Text style={styles.textoBotao}>Ver comprovante</Text>
                </TouchableOpacity>
            ) : (
                <Text style={styles.semComprovante}>Sem comprovante</Text>
            )}
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.profileIcon}>
                    <MaterialIcons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerText}>Histórico de Pagamentos</Text>
            </View>

            {/* Modal para visualização do comprovante */}
            <Modal
                visible={modalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    onPress={() => setModalVisible(false)}
                    activeOpacity={1}
                >
                    <Image source={{ uri: imagemSelecionada || "" }} style={styles.modalImage} resizeMode="contain" />
                </TouchableOpacity>
            </Modal>

            {/* Conteúdo */}
            <View style={styles.content}>
                <View style={styles.filtrosContainer}>
                    <View style={styles.filtroBox}>
                        <Picker selectedValue={filtroMes} onValueChange={setFiltroMes}>
                            <Picker.Item label="Todos os meses" value="" />
                            {meses.map((m) => <Picker.Item key={m} label={m} value={m} />)}
                        </Picker>
                    </View>
                    <View style={styles.filtroBox}>
                        <Picker selectedValue={filtroAno} onValueChange={setFiltroAno}>
                            <Picker.Item label="Todos os anos" value="" />
                            {anos.map((a) => <Picker.Item key={a} label={String(a)} value={String(a)} />)}
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
                        contentContainerStyle={{ paddingBottom: 30 }}
                    />
                )}
            </View>

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
    filtrosContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 16,
        gap: 10,
    },
    filtroBox: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 10,
        overflow: "hidden",
    },
    cardPagamento: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#f5f5f5",
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    cardTitulo: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
    },
    cardValor: {
        fontSize: 16,
        color: "#5A189A",
        marginTop: 4,
    },
    botaoComprovante: {
        backgroundColor: "#5A189A",
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    textoBotao: {
        color: "#fff",
        fontWeight: "bold",
    },
    semComprovante: {
        color: "#888",
        fontStyle: "italic",
    },
    semPagamentos: {
        textAlign: "center",
        color: "#888",
        fontStyle: "italic",
        marginTop: 40,
    },
    navBarWrapper: {
        backgroundColor: "#5A189A",
        paddingBottom: 20,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.85)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalImage: {
        width: "90%",
        height: "80%",
    },
});
