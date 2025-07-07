import React from "react";
import { View, Text, StyleSheet, SafeAreaView, Image, ScrollView } from "react-native";
import NavBar from "../../../components/NavBar";
import { MaterialIcons } from "@expo/vector-icons";

export default function VerContrato() {
    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.profileIcon}>
                    <MaterialIcons name="person" size={24} color="white" />
                </View>
                <Text style={styles.headerText}>Home</Text>
            </View>

            {/* Conteúdo com scroll */}
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Image
                    source={{ uri: 'https://cdn-icons-png.flaticon.com/512/847/847969.png' }}
                    style={styles.avatar}
                />
                <View style={styles.infoBox}><Text style={styles.label}>Nome</Text><Text>Alice Figueira de Sousa</Text></View>
                <View style={styles.infoBox}><Text style={styles.label}>Valor</Text><Text>R$ 160,00</Text></View>
                <View style={styles.infoBox}><Text style={styles.label}>Ponto Embarque</Text><Text>Hiperfarol Supermercados</Text></View>
                <View style={styles.infoBox}><Text style={styles.label}>Turno</Text><Text>Noturno</Text></View>
                <View style={styles.infoBox}><Text style={styles.label}>Status</Text><Text>Ativo</Text></View>
                <View style={styles.infoBox}><Text style={styles.label}>Início</Text><Text>Abril - 2024</Text></View>
                <View style={styles.infoBox}><Text style={styles.label}>Término</Text><Text>Dezembro - 2026</Text></View>
            </ScrollView>

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
        padding: 16,
        paddingTop: 40,
        backgroundColor: "#5A189A",
    },
    profileIcon: {
        backgroundColor: "#F9EC00",
        borderRadius: 20,
        padding: 8,
        marginRight: 12,
    },
    headerText: {
        color: "white",
        fontSize: 18,
        fontWeight: "bold",
    },
    scrollContent: {
        backgroundColor: "#fff",
        padding: 20,
        alignItems: "center",
        paddingBottom: 100, // espaço para não cortar atrás da NavBar
    },
    avatar: {
        width: 80,
        height: 80,
        marginBottom: 20,
    },
    infoBox: {
        backgroundColor: "#dcd6f7",
        width: "100%",
        padding: 12,
        marginBottom: 10,
        borderRadius: 12,
    },
    label: {
        fontWeight: "bold",
        marginBottom: 4,
    },
    navBarWrapper: {
        backgroundColor: "#5A189A",
        paddingBottom: 20,
    },
});
