import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Button from "../../components/Button";
import { Link } from "expo-router";
import { supabase } from "../lib/supabase";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [saveCredentials, setSaveCredentials] = useState(false);

  useEffect(() => {
    async function loadCredentials() {
      try {
        const savedEmail = await AsyncStorage.getItem("@moveit_email");
        const savedPassword = await AsyncStorage.getItem("@moveit_password");
        if (savedEmail && savedPassword) {
          setEmail(savedEmail);
          setPassword(savedPassword);
          setSaveCredentials(true);
        }
      } catch (e) {
        console.log("Erro ao carregar credenciais:", e);
      }
    }
    loadCredentials();
  }, []);

  async function handleSignIn() {
    if (loading) return;  // <-- bloqueia múltiplos cliques

    if (!email || !password) {
      Alert.alert("Erro", "Por favor, preencha email e senha.");
      return;
    }

    setLoading(true);

    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      Alert.alert("Erro", error?.message || "Falha na autenticação");
      return;
    }

    if (saveCredentials) {
      await AsyncStorage.setItem("@moveit_email", email);
      await AsyncStorage.setItem("@moveit_password", password);
    } else {
      await AsyncStorage.removeItem("@moveit_email");
      await AsyncStorage.removeItem("@moveit_password");
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
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <Text style={styles.title}>Move It</Text>

      <View style={styles.iconContainer}>
        <Image
          source={require("../../assets/images/logo.png")}
          style={styles.icon}
        />
      </View>

      <TextInput
        style={styles.input}
        placeholder="E-mail"
        placeholderTextColor="#666"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        value={email}
        onChangeText={setEmail}
      />

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.inputPassword}
          placeholder="Senha"
          placeholderTextColor="#666"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Ionicons
            name={showPassword ? "eye-off" : "eye"}
            size={24}
            color="#5A189A"
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.checkboxContainer}
        onPress={() => setSaveCredentials(!saveCredentials)}
        activeOpacity={0.7}
      >
        <View style={[styles.checkbox, saveCredentials && styles.checkboxChecked]}>
          {saveCredentials && (
            <Ionicons name="checkmark" size={18} color="#fff" />
          )}
        </View>
        <Text style={styles.checkboxLabel}>Salvar senha</Text>
      </TouchableOpacity>

      <Button
        title={loading ? "Carregando..." : "Entrar"}
        onPress={handleSignIn}
        style={styles.button}
      />


      <Link href="/(auth)/signup/page" style={styles.footerText}>
        <Text>
          Não possui uma conta?
          <Text style={styles.link}> Cadastre-se.</Text>
        </Text>
      </Link>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F4FF",
    paddingHorizontal: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 36,
    fontWeight: "700",
    marginBottom: 20,
    color: "#5A189A",
  },
  iconContainer: {
    marginBottom: 40,
    shadowColor: "#5A189A",
    shadowOpacity: 0.5,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 10,
    borderRadius: 75,
  },
  icon: {
    width: 150,
    height: 150,
    borderRadius: 75,
    resizeMode: "cover",
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 15,
    paddingHorizontal: 15,
    fontSize: 16,
    color: "#333",
    shadowColor: "#5A189A",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 15,
    paddingHorizontal: 15,
    height: 50,
    width: "100%",
    justifyContent: "space-between",
    shadowColor: "#5A189A",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  inputPassword: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
    alignSelf: "flex-start",
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: "#5A189A",
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  checkboxChecked: {
    backgroundColor: "#5A189A",
  },
  checkboxLabel: {
    color: "#5A189A",
    fontSize: 16,
    fontWeight: "600",
  },
  button: {
    width: "80%",
    borderRadius: 12,
  },
  footerText: {
    textAlign: "center",
    fontSize: 14,
    color: "#444",
    marginTop: 20,
  },
  link: {
    color: "#5A189A",
    fontWeight: "700",
  },
});
