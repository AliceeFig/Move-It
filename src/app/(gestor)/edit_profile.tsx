import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { supabase } from '../../lib/supabase';
import Button from '../../../components/Button';
import { useRouter } from 'expo-router';

export default function GestorProfile() {
  const [nome, setNome] = useState('');
  const [responsavel, setResponsavel] = useState('');
  const [email, setEmail] = useState('');
  const [cnpj, setCnpj] = useState('');

  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data, error } = await supabase
          .from('empresa')
          .select('nome, responsavel, email, cpf_cnpj')
          .eq('id', user.id)
          .single();

        if (data) {
          setNome(data.nome || '');
          setResponsavel(data.responsavel || '');
          setEmail(data.email || '');
          setCnpj(data.cpf_cnpj || '');
        } else {
          console.error('Erro ao buscar dados da empresa:', error?.message);
        }
      }
    }

    fetchData();
  }, []);

  async function salvarEdicao() {
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { error } = await supabase
        .from('empresa')
        .update({
          nome: nome,
          responsavel: responsavel,
          email,
          cpf_cnpj: cnpj,
        })
        .eq('id', user.id);

      if (error) {
        Alert.alert('Erro', 'Não foi possível atualizar os dados.');
        console.log(error);
      } else {
        Alert.alert('Sucesso', 'Informações atualizadas com sucesso.');
      }
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        <Image
          source={require('../../../assets/images/userm.png')}
          style={styles.avatar}
        />
      </View>

          <TextInput
            style={styles.input}
            value={nome}
            onChangeText={setNome}
            placeholder="Nome da Empresa"
          />
          <TextInput
            style={styles.input}
            value={responsavel}
            onChangeText={setResponsavel}
            placeholder="Responsável"
          />
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={email}
            placeholder="Email"
            keyboardType="email-address"
            editable={false}
/>
          <TextInput
            style={styles.input}
            value={cnpj}
            onChangeText={setCnpj}
            placeholder="CPF ou CNPJ"
          />

          <Button title="Salvar" onPress={salvarEdicao} style={styles.button} />
          <Button title="Cancelar" onPress={() => router.push('../profile')} style={styles.button} />
        
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    alignItems: 'center',
    paddingTop: 20,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  infoBox: {
    backgroundColor: '#D9C7F3',
    padding: 12,
    borderRadius: 8,
    width: '100%',
    marginBottom: 10,
  },
  label: {
    fontWeight: 'bold',
    color: '#333',
  },
  value: {
    fontSize: 16,
    color: '#333',
  },
  input: {
    backgroundColor: '#EEE',
    borderRadius: 8,
    padding: 10,
    width: '100%',
    marginBottom: 10,
    fontSize: 16,
  },
  button: {
    marginTop: 10,
    width: '60%',
  },
  disabledInput: {
  backgroundColor: '#ccc',
  color: '#666',
},
});
