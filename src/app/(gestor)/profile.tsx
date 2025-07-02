import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { supabase } from '../../lib/supabase';
import Navbar from '../../../components/Navbar';
import Button from '../../../components/Button';
import { useRouter } from 'expo-router';

export default function GestorProfile() {
  const [empresa, setEmpresa] = useState('');
  const [responsavel, setResponsavel] = useState('');
  const [email, setEmail] = useState('');
  const [cnpj, setCnpj] = useState('');

  const router = useRouter();

  useEffect(() => {
  async function fetchData() {
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData?.user) {
      console.error('Erro ao obter usuário:', userError?.message);
      return;
    }

    const user = userData.user;

    const { data, error } = await supabase
      .from('empresa')
      .select('nome, responsavel, email, cpf_cnpj')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Erro ao buscar dados da empresa:', error.message);
      return;
    }

    if (data) {
      setEmpresa(data.nome || '');
      setResponsavel(data.responsavel || '');
      setEmail(data.email || '');
      setCnpj(data.cpf_cnpj || '');
    }
  }

  fetchData();
}, []);


  return (
    <View style={styles.container}>

      <View style={styles.avatarContainer}>
        <Image
          source={require('../../../assets/images/userm.png')}
          style={styles.avatar}
        />
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.label}>Empresa</Text>
        <Text style={styles.value}>{empresa}</Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.label}>Responsável</Text>
        <Text style={styles.value}>{responsavel}</Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{email}</Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.label}>Cpf/ cnpj</Text>
        <Text style={styles.value}>{cnpj}</Text>
      </View>

      <Button title="Editar" onPress={() => { /* navegação futura */ }} style={styles.button} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  avatarContainer: {
    marginTop: 24,
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
    marginBottom: 15,
    borderColor: '#333'
  },
  label: {
    fontWeight: 'bold',
    color: '#333',
  },
  value: {
    fontSize: 19,
    color: '#333',
  },
  button: {
    marginTop: 20,
    width: 150,
    alignSelf: 'center',
  },
});
