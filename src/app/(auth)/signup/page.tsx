import { useState} from 'react';
import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Pressable, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Button from '../../../../components/Button';
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '../../../lib/supabase'

export default function Signup() {

  const [name, setName] = useState('');
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState('');
  const [tipo, setTipo] = useState('gestor'); // gestor, motorista, aluno
  const [loading, setLoading] = useState(false);

  async function handleSignUp() {
    setLoading(true);

    const {data, error} = await supabase.auth.signUp({
      email: email,
      password: password,
      options: { 
        data: {
        nome: name,
        email: email,
        tipo: tipo
        }
      }
    })

    
    if(error){
      Alert.alert('Error', error.message)
      setLoading(false);
      return;
    }
    
    setLoading(false);
    router.replace('/')
  }

  return (
    <View style={styles.container}>

      <Pressable style= {styles.backButton}
      onPress={() => router.back()} 
      >
        <Ionicons name="arrow-back" size={24} color='#FFF'/>
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
        placeholder="Nome:"
        placeholderTextColor="#000"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="E-mail:"
        placeholderTextColor="#000"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Senha:"
        placeholderTextColor="#000"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Picker
        style={styles.picker}
        selectedValue={tipo}
        onValueChange={(itemValue: string) => setTipo(itemValue)}
        
      >
        <Picker.Item label="Gestor" value="gestor" />
        <Picker.Item label="Motorista" value="motorista" />
        <Picker.Item label="Aluno" value="aluno" />
      </Picker>

      <Button
        onPress={handleSignUp}
        style={styles.button}
        title={loading? 'Carregando...' : 'Cadastrar'}
      />


    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '400',
    marginBottom: 10,
    color: '#000',
  },
  iconContainer: {
    marginBottom: 30,
  },
  icon: {
    width: 150,
    height: 150,
    borderRadius: 75,
    resizeMode: 'cover',
  },
  input: {
    width: '100%',
    height: 45,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 15,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  picker: {
    width: '100%',
    height: 50,
    backgroundColor: '#E0E0E0',
    marginBottom: 15,
  },
  button: {
    width: '80%',
  },
  footerText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#000',
  },
  link: {
    color: '#5A189A',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    backgroundColor: 'rgba(137, 22, 225, 0.55)',
    alignSelf: 'flex-start',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,

  }
});
