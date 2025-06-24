import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import NavBar from '../../../components/Navbar';
import Button from '../../../components/Button';
import { router } from 'expo-router';

export default function GestorHome() {
  return (
    <View style={styles.container}>
      <NavBar title="Nome" />

      <View style={styles.content}>
        <Text style={styles.welcome}>Bem Vindo!</Text>
        <Text style={styles.subtitle}>O que gostaria de fazer?</Text>

        <View style={styles.buttonGroup}>
          <Button title="Gerenciar alunos" onPress={() => router.push('//gerenciar-alunos')} />
          <Button title="Gerenciar linhas" onPress={() => router.push('//gerenciar-linhas')} />
          <Button title="Pagamentos" onPress={() => router.push('//pagamentos')} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 30,
  },
  welcome: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 40,
  },
  buttonGroup: {
    gap: 20,
    width: '100%',
  },
});
