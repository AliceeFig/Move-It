import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    Alert,
    StatusBar,
    Dimensions,
    Modal,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { v4 as uuidv4 } from "uuid";
import "react-native-get-random-values";
import { supabase } from "../../lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { decode } from "base64-arraybuffer";
import NotificacaoBell from "../../../components/NotificacaoBell";

const screenWidth = Dimensions.get("window").width;

export default function PerfilAluno() {
    const [userData, setUserData] = useState<any>(null);
    const [image, setImage] = useState<string | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [imageModalVisible, setImageModalVisible] = useState(false);

    useEffect(() => {
        async function loadUser() {
            const {
                data: { user },
                error: userError,
            } = await supabase.auth.getUser();

            if (!user || userError) {
                Alert.alert("Erro", "Não foi possível carregar o usuário.");
                return;
            }

            const { data, error } = await supabase
                .from("usuarios")
                .select("*")
                .eq("id", user.id)
                .single();

            if (!data || error) {
                Alert.alert("Erro", "Não foi possível buscar os dados do usuário.");
                return;
            }

            setUserData(data);
            setImage(data.fotoPerfil || null);
        }

        loadUser();
    }, []);

    async function pickImage() {
        setModalVisible(false);

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 1,
            base64: true,
            allowsEditing: true,
        });

        if (!result.canceled && result.assets.length > 0) {
            const asset = result.assets[0];
            const uri = asset.uri;

            const {
                data: { user },
                error: userError,
            } = await supabase.auth.getUser();

            if (!user || userError) {
                Alert.alert("Erro", "Usuário não autenticado.");
                return;
            }

            try {
                const ext = uri.split(".").pop() || "jpg";
                const fileName = `${user.id}/${uuidv4()}.${ext}`;

                const { error: uploadError } = await supabase.storage
                    .from("fotos-perfil")
                    .upload(fileName, decode(asset.base64), {
                        contentType: "image/png",
                        upsert: true,
                    });

                if (uploadError) {
                    Alert.alert("Erro no upload", uploadError.message);
                    return;
                }

                const { data: urlData } = supabase.storage
                    .from("fotos-perfil")
                    .getPublicUrl(fileName);

                const fotoUrl = urlData.publicUrl;

                const { error: dbError } = await supabase
                    .from("usuarios")
                    .update({ fotoPerfil: fotoUrl })
                    .eq("id", user.id);

                if (dbError) {
                    Alert.alert("Erro ao salvar no banco", dbError.message);
                    return;
                }

                setImage(fotoUrl);
                Alert.alert("Sucesso", "Foto de perfil atualizada!");
            } catch (e: any) {
                console.log("Erro ao salvar imagem:", e);
                Alert.alert("Erro inesperado", e.message || "Erro ao salvar imagem.");
            }
        }
    }

    function viewImage() {
        setModalVisible(false);
        setImageModalVisible(true);
    }

    async function changePassword() {
        const email = userData?.email;
        if (!email) return;
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) Alert.alert("Erro", "Não foi possível enviar o link.");
        else Alert.alert("Verifique seu e-mail", "Um link de redefinição foi enviado.");
    }

    async function logout() {
        const { error } = await supabase.auth.signOut();
        if (error) {
            Alert.alert("Erro ao sair", error.message);
        } else {
            router.replace("/");
        }
    }

    if (!userData) return null;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#5A189A" />

            <View style={styles.topBackground}>
                <View style={styles.headerRow}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={26} color="#fff" />
                    </TouchableOpacity>
                    <View style={styles.titleWrapper}>
                        <Text style={styles.pageTitle}>Perfil</Text>
                    </View>
                    <NotificacaoBell />
                </View>
            </View>

            <View style={styles.avatarContainer}>
                <View style={styles.avatarShadow}>
                    <Image
                        source={image ? { uri: image } : require("../../../assets/images/logo.png")}
                        style={styles.avatar}
                    />
                    <TouchableOpacity
                        style={styles.editIcon}
                        onPress={() => setModalVisible(true)}
                    >
                        <Ionicons name="create-outline" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>

            <Modal transparent visible={modalVisible} animationType="fade" onRequestClose={() => setModalVisible(false)}>
                <TouchableOpacity style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
                    <View style={styles.modalBox}>
                        <TouchableOpacity onPress={viewImage} style={styles.modalOption}>
                            <Text style={styles.modalText}>Visualizar foto</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={pickImage} style={styles.modalOption}>
                            <Text style={styles.modalText}>Alterar foto</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

            <Modal visible={imageModalVisible} transparent animationType="fade" onRequestClose={() => setImageModalVisible(false)}>
                <View style={styles.imageModalOverlay}>
                    <TouchableOpacity onPress={() => setImageModalVisible(false)} style={styles.closeButton}>
                        <Ionicons name="close" size={30} color="#fff" />
                    </TouchableOpacity>
                    <Image source={{ uri: image || "" }} style={styles.fullImage} resizeMode="contain" />
                </View>
            </Modal>


            <View style={styles.content}>
                <View style={styles.infoBox}>
                    <Ionicons name="person" size={20} color="#5A189A" />
                    <Text style={styles.infoText}>Nome: {userData.nome}</Text>
                </View>

                <View style={styles.infoBox}>
                    <Ionicons name="mail" size={20} color="#5A189A" />
                    <Text style={styles.infoText}>Email: {userData.email}</Text>
                </View>

                <View style={styles.infoBox}>
                    <Ionicons name="person-circle" size={20} color="#5A189A" />
                    <Text style={styles.infoText}>Tipo: {userData.tipo}</Text>
                </View>

                <View style={styles.infoBox}>
                    <Ionicons name="calendar" size={20} color="#5A189A" />
                    <Text style={styles.infoText}>
                        Criado em: {new Date(userData.created_at).toLocaleDateString("pt-BR")}
                    </Text>
                </View>
                <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
                    <Text style={styles.logoutText}>Sair da conta</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F9F4FF" },
    topBackground: {
        height: 230,
        width: "100%",
        paddingTop: 50,
        paddingHorizontal: 20,
        backgroundColor: "#5A189A",
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    backButton: {
        backgroundColor: "#ffffff33",
        padding: 6,
        borderRadius: 10,
    },
    titleWrapper: {
        flex: 1,
        alignItems: "center",
        marginRight: 36,
    },
    pageTitle: {
        fontSize: 22,
        color: "#fff",
        fontWeight: "700",
    },
    avatarContainer: {
        alignItems: "center",
        marginTop: -60,
        marginBottom: 20,
    },
    avatarShadow: {
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 10,
        elevation: 6,
        borderRadius: 75,
    },
    avatar: {
        width: 140,
        height: 140,
        borderRadius: 70,
        borderWidth: 3,
        borderColor: "#fff",
    },
    editIcon: {
        position: "absolute",
        bottom: 6,
        right: 6,
        backgroundColor: "#9D4EDD",
        padding: 6,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: "#fff",
        elevation: 4,
    },
    content: {
        paddingHorizontal: 24,
        paddingTop: 10,
    },
    infoBox: {
        backgroundColor: "#EADCFD",
        borderRadius: 16,
        paddingVertical: 14,
        paddingHorizontal: 16,
        marginBottom: 16,
        flexDirection: "row",
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
        elevation: 4,
    },
    infoText: {
        marginLeft: 12,
        fontSize: 16,
        color: "#5A189A",
        fontWeight: "600",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "#00000055",
        justifyContent: "center",
        alignItems: "center",
    },
    modalBox: {
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 16,
        width: 260,
    },
    modalOption: {
        paddingVertical: 12,
    },
    modalText: {
        fontSize: 16,
        color: "#5A189A",
        textAlign: "center",
        fontWeight: "600",
    },
    imageModalOverlay: {
        flex: 1,
        backgroundColor: "#000",
        justifyContent: "center",
        alignItems: "center",
    },
    closeArea: {
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
    },
    fullImage: {
        width: "90%",
        height: "80%",
    },
    logoutBtn: {
        backgroundColor: "#9D4EDD",
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 10,
    },
    logoutText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    closeButton: {
        position: "absolute",
        top: 40,
        right: 20,
        zIndex: 10,
        backgroundColor: "#00000088",
        padding: 8,
        borderRadius: 30,
    },

});
