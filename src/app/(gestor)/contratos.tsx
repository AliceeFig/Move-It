import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useState } from 'react';
import Button from '../../../components/Button';
import FiltroInput from '../../../components/FiltroInput';
import FiltroSelect from '@/components/FiltroSelect';
import { router } from 'expo-router';

const contratos = [
  { nome: 'Alice Figueira', turno: 'Noturno' },
  { nome: 'Hêmilly Pereira', turno: 'Diurno' },
  { nome: 'Daniel Feitosa', turno: 'Diurno' },
  { nome: 'Weder Santos', turno: 'Noturno' },
];

export default function Contratos() {
  const [tipoFiltro, setTipoFiltro] = useState<'ativos' | 'solicitacoes'>('ativos');
  const [busca, setBusca] = useState('');

  return (
    <View style={styles.container}>
      <View style={styles.botaoWrapper}>
        <Button
          title="Gerar contrato"
          style={styles.botaoGerar}
          onPress={() => router.push('../gerar_contrato')}
        />
      </View>

      <FiltroSelect tipoSelecionado={tipoFiltro} onSelecionar={setTipoFiltro} />
      <FiltroInput
        placeholder="Buscar por nome"
        value={busca}
        onChangeText={setBusca}
        onPress={() => {}}
      />

      <FlatList
        contentContainerStyle={styles.lista}
        data={contratos.filter(c => c.nome.toLowerCase().includes(busca.toLowerCase()))}
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
