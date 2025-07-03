import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    Alert,
    StatusBar,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../../lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function PerfilAluno() {
    const [userData, setUserData] = useState<any>(null);
    const [image, setImage] = useState<string | null>(null);

    useEffect(() => {
        async function loadUser() {
            const {
                data: { user },
                error,
            } = await supabase.auth.getUser();
            if (error || !user) {
                Alert.alert("Erro", "Não foi possível carregar os dados do usuário.");
                return;
            }

            setUserData(user);
            setImage(user.user_metadata?.fotoPerfil || null);
        }

        loadUser();
    }, []);

    async function pickImage() {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 1,
            allowsEditing: true,
        });

        if (!result.canceled && result.assets.length > 0) {
            const uri = result.assets[0].uri;
            setImage(uri);

            const { error } = await supabase.auth.updateUser({
                data: { ...userData.user_metadata, fotoPerfil: uri },
            });

            if (error) {
                Alert.alert("Erro", "Não foi possível atualizar a foto de perfil.");
            } else {
                Alert.alert("Sucesso", "Foto de perfil atualizada!");
            }
        }
    }

    if (!userData) return null;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {/* Cabeçalho com botão voltar e título */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={28} color="#5A189A" />
                </TouchableOpacity>
                <Text style={styles.title}>Perfil</Text>
            </View>

            {/* Foto perfil e alterar */}
            <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
                <Image
                    source={image ? { uri: image } : require("../../../assets/images/logo.png")}
                    style={styles.profileImage}
                />
                <Text style={styles.alterar}>Alterar foto</Text>
            </TouchableOpacity>

            {/* Dados do usuário */}
            <View style={styles.infoBox}>
                <Ionicons name="person" size={22} color="#5A189A" />
                <Text style={styles.infoText}>Nome: {userData.user_metadata?.nome}</Text>
            </View>

            <View style={styles.infoBox}>
                <Ionicons name="mail" size={22} color="#5A189A" />
                <Text style={styles.infoText}>Email: {userData.email}</Text>
            </View>

            <View style={styles.infoBox}>
                <Ionicons name="person-circle" size={22} color="#5A189A" />
                <Text style={styles.infoText}>Tipo: {userData.user_metadata?.tipo}</Text>
            </View>

            <View style={styles.infoBox}>
                <Ionicons name="calendar" size={22} color="#5A189A" />
                <Text style={styles.infoText}>
                    Criado em: {new Date(userData.created_at).toLocaleDateString("pt-BR")}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 80,
        paddingHorizontal: 24,
        backgroundColor: "#fff",
        alignItems: "center",
    },
    header: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 30,
    },
    backButton: {
        padding: 6,
        borderRadius: 12,
        backgroundColor: "#E9E7F9",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
        elevation: 4,
    },
    title: {
        flex: 1,
        textAlign: "center",
        fontSize: 22,
        fontWeight: "700",
        color: "#5A189A",
        marginRight: 40, // para compensar o botão voltar e centralizar o título
    },
    imagePicker: {
        alignItems: "center",
        marginBottom: 32,
    },
    profileImage: {
        width: 130,
        height: 130,
        borderRadius: 65,
        marginBottom: 10,
        borderWidth: 2,
        borderColor: "#5A189A",
    },
    alterar: {
        color: "#5A189A",
        fontWeight: "700",
        fontSize: 16,
    },
    infoBox: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        backgroundColor: "#F3F2FF",
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 14,
        marginBottom: 14,
        shadowColor: "#5A189A",
        shadowOpacity: 0.15,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 10,
        elevation: 6,
    },
    infoText: {
        marginLeft: 14,
        fontSize: 17,
        color: "#3A0CA3",
        fontWeight: "600",
    },
});
