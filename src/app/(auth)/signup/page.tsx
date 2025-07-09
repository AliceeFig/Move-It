import { useState } from 'react';
import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Pressable,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Button from '../../../../components/Button';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../../lib/supabase';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tipo, setTipo] = useState('gestor');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSignUp() {
    if (loading) return;

    if (!name || !email || !password) {
      Alert.alert('Atenção', 'Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          nome: name,
          email: email,
          tipo: tipo,
        },
      },
    });

    setLoading(false);

    if (error) {
      Alert.alert('Erro', error.message);
      return;
    }

    Alert.alert('Sucesso', 'Cadastro realizado com sucesso!');
    router.replace('/');
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </Pressable>

      <Text style={styles.title}>Move It</Text>

      <View style={styles.iconContainer}>
        <Image
          source={require('../../../../assets/images/logo.png')}
          style={styles.icon}
        />
      </View>

      <TextInput
        style={styles.input}
        placeholder="Nome"
        placeholderTextColor="#666"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
      />

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
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Ionicons
            name={showPassword ? 'eye-off' : 'eye'}
            size={24}
            color="#5A189A"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.pickerWrapper}>
        <Picker
          style={styles.picker}
          selectedValue={tipo}
          onValueChange={(itemValue) => setTipo(itemValue)}
          dropdownIconColor="#5A189A"
        >
          <Picker.Item label="Gestor" value="gestor" />
          <Picker.Item label="Motorista" value="motorista" />
          <Picker.Item label="Aluno" value="aluno" />
        </Picker>
      </View>

      <Button
        onPress={handleSignUp}
        style={styles.button}
        title={loading ? 'Carregando...' : 'Cadastrar'}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F4FF',
    paddingHorizontal: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    backgroundColor: 'rgba(93, 25, 129, 0.7)',
    padding: 10,
    borderRadius: 12,
    zIndex: 10,
    shadowColor: '#5A189A',
    shadowOpacity: 0.5,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 25,
    color: '#5A189A',
  },
  iconContainer: {
    marginBottom: 40,
    shadowColor: '#5A189A',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 12,
    borderRadius: 75,
  },
  icon: {
    width: 150,
    height: 150,
    borderRadius: 75,
    resizeMode: 'cover',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: 18,
    paddingHorizontal: 18,
    fontSize: 16,
    color: '#333',
    shadowColor: '#5A189A',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 7,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: 18,
    paddingHorizontal: 18,
    height: 50,
    width: '100%',
    justifyContent: 'space-between',
    shadowColor: '#5A189A',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 7,
  },
  inputPassword: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  pickerWrapper: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: 30,
    shadowColor: '#5A189A',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 7,
  },
  picker: {
    width: '100%',
    height: 50,
    color: '#5A189A',
  },
  button: {
    width: '80%',
    borderRadius: 14,
  },
});
