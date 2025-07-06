// app/(aluno)/solicitar-transporte.tsx
import React from "react";
import { View, Text, TextInput, StyleSheet, SafeAreaView, FlatList, TouchableOpacity } from "react-native";
import NavBar from "../../../components/Navbar";
import { MaterialIcons } from "@expo/vector-icons";

const motoristas = [
    { id: "1", nome: "Val Transporte" },
    { id: "2", nome: "Fábio Porto" },
    { id: "3", nome: "Tio Tom" },
];

export default function SolicitarTransporte() {
    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.profileIcon}>
                    <MaterialIcons name="person" size={24} color="white" />
                </View>
                <Text style={styles.headerText}>Home</Text>
            </View>

            {/* Conteúdo */}
            <View style={styles.content}>
                <View style={styles.searchContainer}>
                    <TextInput placeholder="Buscar" style={styles.input} />
                    <TouchableOpacity style={styles.searchButton}>
                        <Text style={{ color: "#fff" }}>Buscar</Text>
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={motoristas}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.motoristaCard}>
                            <View style={styles.circleIcon} />
                            <Text style={styles.motoristaNome}>{item.nome}</Text>
                        </View>
                    )}
                />
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
    content: {
        flex: 1,
        backgroundColor: "#fff",
        padding: 20,
    },
    searchContainer: {
        flexDirection: "row",
        marginBottom: 20,
    },
    input: {
        flex: 1,
        backgroundColor: "#eee",
        borderRadius: 8,
        paddingHorizontal: 12,
        marginRight: 8,
    },
    searchButton: {
        backgroundColor: "#5A189A",
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    motoristaCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#eee",
        padding: 16,
        borderRadius: 12,
        marginBottom: 10,
    },
    circleIcon: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: "#5A189A",
        marginRight: 12,
    },
    motoristaNome: {
        fontSize: 16,
    },
    navBarWrapper: {
        backgroundColor: "#5A189A",
        paddingBottom: 20,
    },
});
