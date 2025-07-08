import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Navbar from '../../../components/Navbar1';
import Button from '../../../components/Button';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useFocusEffect } from '@react-navigation/native';
import { BackHandler } from 'react-native';

export default function HomeGestor() {

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        BackHandler.exitApp()
        return true
      }; 
      BackHandler.addEventListener('hardwareBackPress', onBackPress);
    }, [])
  );

  useEffect(() => {
    async function fetchUsuario() {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;

      console.log('USER:', user?.id); // Verifique se esse ID aparece no console
      if (!user) return;

      const { data, error } = await supabase
        .from('empresa')
        .select('*')
        .eq('id', user.id)
        .maybeSingle(); // usa maybeSingle para evitar quebra se não encontrar

      if (error) {
        console.error('Erro na consulta:', error.message);
        return;
      }

      console.log('DADOS USUÁRIO:', data); // veja se vem algo

      if (data) {
        setNome(data.nome || '');
        setEmail(data.email || '');
      }
    }

    fetchUsuario();
  }, []);


  return (
    <View style={styles.container}>
      <Navbar title={nome}
        onProfilePress={() => router.push('/profile')}
      />

      <View style={styles.content}>
        <Text style={styles.welcome}>Bem-vindo!</Text>
        <Text style={styles.prompt}>O que gostaria de fazer?</Text>

        <View style={styles.buttonsContainer}>
          <Button title="Gerenciar contratos" onPress={() => router.push('../contratos')} />
          <Button title="Gerenciar linhas" onPress={() => router.push('../linhas')} />
          <Button title="Pagamentos" onPress={() => router.push('../pagamentos')} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  profileBox: {
    backgroundColor: '#E0E0E0',
    margin: 16,
    padding: 16,
    borderRadius: 10,
  },
  profileText: {
    fontSize: 16,
    color: '#333',
  },
  content: {
    alignItems: 'center',
    paddingTop: 20,
  },
  welcome: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  prompt: {
    fontSize: 16,
    marginBottom: 30,
  },
  buttonsContainer: {
    gap: 20,
    width: '80%',
  },
});
