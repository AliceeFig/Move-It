import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Pressable,
  Alert,
} from "react-native";
import Button from "../../components/Button";
import { Link } from "expo-router";
import { useState } from "react";
import { supabase } from "../lib/supabase";
import { router } from "expo-router";

export default function Login() {
  const [email, setEmail] = useState("gestor@teste.com");
  const [password, setPassword] = useState("123gestor");
  const [loading, setLoading] = useState(false);

  async function handleSignIn() {
    setLoading(true);

    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      Alert.alert("Erro", error?.message || "Falha na autenticação");
      setLoading(false);
      return;
    }
    const tipo_usuario = authData.user.user_metadata.tipo;

    if (tipo_usuario === "aluno") {
      router.replace("/(aluno)/inicio");
    } else if (tipo_usuario === "motorista") {
      router.replace("/(motorista)");
    } else if (tipo_usuario === "gestor") {
      router.replace("/(gestor)");
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Move It</Text>

      <View style={styles.iconContainer}>
        <Image
          source={require("../../assets/images/logo.png")}
          style={styles.icon}
        />
      </View>

      <TextInput
        style={styles.input}
        placeholder="E-mail:"
        placeholderTextColor="#000"
        keyboardType="email-address"
        autoCapitalize="none"
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Senha:"
        placeholderTextColor="#000"
        secureTextEntry
        onChangeText={setPassword}
      />

      <Button
        title={loading ? "Carregando..." : "Entrar"}
        onPress={handleSignIn}
        style={styles.button}
      />

      <Link href="/(auth)/signup/page" style={styles.footerText}>
        <Text>
          Não possui uma conta?
          <Text style={styles.link}>Cadastre-se.</Text>
        </Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "400",
    marginBottom: 10,
    color: "#000",
  },
  iconContainer: {
    marginBottom: 30,
  },
  icon: {
    width: 150,
    height: 150,
    borderRadius: 75,
    resizeMode: "cover",
  },
  input: {
    width: "100%",
    height: 45,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    marginBottom: 15,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  button: {
    width: "80%",
  },
  footerText: {
    textAlign: "center",
    fontSize: 14,
    color: "#000",
  },
  link: {
    color: "#5A189A",
  },
});
