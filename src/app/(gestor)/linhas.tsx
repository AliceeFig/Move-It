import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useState } from 'react';
import Button from '../../../components/Button';
import FiltroInput from '../../../components/FiltroInput';
import { router } from 'expo-router';

const linhas = [
  { nome: 'Coletivos - Linha 1', turno: 'Noturno' },
  { nome: 'Fábio Porto Transporte - Linha 2', turno: 'Diurno' },
  { nome: 'Fábio Porto - Linha 3', turno: 'Diurno' },
];

export default function Linhas() {
  const [busca, setBusca] = useState('');

  return (
    <View style={styles.container}>
      <View style={styles.botaoWrapper}>
        <Button
          title="Cadastrar Linha"
          style={styles.botaoGerar}
          onPress={() => router.push('../gerar_contrato')}
        />
      </View>

      <FiltroInput
        placeholder="Buscar por nome"
        value={busca}
        onChangeText={setBusca}
        onPress={() => {}}
      />

      <FlatList
        contentContainerStyle={styles.lista}
        data={linhas.filter(c => c.nome.toLowerCase().includes(busca.toLowerCase()))}
        keyExtractor={(item) => item.nome}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <View style={styles.avatar} />
            <View>
              <Text style={styles.nome}>{item.nome}</Text>
              <Text style={styles.turno}>{item.turno}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  botaoWrapper: {
    alignItems: 'center',
    marginBottom: 24,
  },
  botaoGerar: {
    width: '80%',
  },
  lista: {
    paddingTop: 15,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 19,
    borderWidth: 1,
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderColor: '#5A189A'
  },
  avatar: {
    backgroundColor: '#7e22ce',
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  nome: {
    fontWeight: 'bold',
    color: '#000',
  },
  turno: {
    color: '#6b7280',
  },
});
