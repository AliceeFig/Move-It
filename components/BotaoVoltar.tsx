import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function BotaoVoltar() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => router.back()} style={styles.button}>
                <Ionicons name="arrow-back" size={24} color="white" />
                <Text style={styles.text}>Voltar</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingTop: 50,
        paddingHorizontal: 20,
        paddingBottom: 10,
        backgroundColor: "#6c40b5", // roxo principal do app
    },
    button: {
        flexDirection: "row",
        alignItems: "center",
    },
    text: {
        color: "white",
        fontSize: 16,
        marginLeft: 8,
    },
});
