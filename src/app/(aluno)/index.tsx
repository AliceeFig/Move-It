import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function HomeAluno() {
  return (
    <View style={styles.container}>
      <Text>Bem-vindo, Aluno!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
