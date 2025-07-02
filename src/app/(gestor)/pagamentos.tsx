import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';

export default function Pagamentos() {
  const [filtro, setFiltro] = useState('');
  const [busca, setBusca] = useState('');

  const pagamentos = [
    { nome: 'Alice Figueira', mes: 'Março - 2024' },
    { nome: 'Hêmilly Pereira', mes: 'Março - 2024' },
    { nome: 'Daniel Feitosa', mes: 'Março - 2024' },
    { nome: 'Weder Santos', mes: 'Março - 2024' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <TextInput
          placeholder="Selecione"
          style={styles.input}
          value={filtro}
          onChangeText={setFiltro}
        />
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Filtrar</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.row}>
        <TextInput
          placeholder="Buscar"
          style={styles.input}
          value={busca}
          onChangeText={setBusca}
        />
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Buscar</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={pagamentos.filter(p => p.nome.toLowerCase().includes(busca.toLowerCase()))}
        keyExtractor={(item) => item.nome}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <View style={styles.avatar} />
            <View>
              <Text style={styles.itemName}>{item.nome}</Text>
              <Text style={styles.itemDate}>{item.mes}</Text>
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
  row: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 8,
    height: 40,
  },
  button: {
    backgroundColor: '#6B21A8',
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderRadius: 6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6B21A8',
  },
  itemName: {
    fontWeight: 'bold',
    color: '#000',
  },
  itemDate: {
    color: '#666',
  },
});
