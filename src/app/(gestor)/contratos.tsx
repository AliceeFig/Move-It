import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import Button from '../../../components/Button';
import FiltroInput from '../../../components/FiltroInput';
import FiltroSelect from '../../../components/FiltroSelect';
import { router } from 'expo-router';
import { supabase } from '../../../src/lib/supabase';

interface ItemContrato {
  id: string;
  turno: string;
  aluno: {
    nome: string;
  };
}

interface ItemSolicitacao {
  id: string;
  turno: string;
  nome_aluno: string;
}

export default function Contratos() {
  const [tipoFiltro, setTipoFiltro] = useState<'ativos' | 'solicitacoes'>('ativos');
  const [busca, setBusca] = useState('');
  const [dados, setDados] = useState<(ItemContrato | ItemSolicitacao)[]>([]);
  const [carregando, setCarregando] = useState(false);

  async function carregarDados() {
    setCarregando(true);

    if (tipoFiltro === 'ativos') {
      const { data, error } = await supabase
        .from('contratos')
        .select('id, turno, aluno (nome)');

      if (error) {
        console.error('Erro ao buscar contratos:', error.message);
        setDados([]);
      } else {
        setDados(data as unknown as ItemContrato[]);
      }
    } else {
      const { data, error } = await supabase
        .from('solicitacoes_contrato')
        .select('id, nome_aluno');

      if (error) {
        console.error('Erro ao buscar solicitações:', error.message);
        setDados([]);
      } else {
        setDados(data as ItemSolicitacao[]);
      }
    }

    setCarregando(false);
  }

  useEffect(() => {
    carregarDados();
  }, [tipoFiltro]);

  const dadosFiltrados = dados.filter((c) => {
    const nome =
      tipoFiltro === 'ativos'
        ? (c as ItemContrato).aluno?.nome
        : (c as ItemSolicitacao).nome_aluno;
    return nome?.toLowerCase().includes(busca.toLowerCase());
  });

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

      {carregando ? (
        <ActivityIndicator size="large" color="#7e22ce" />
      ) : (
        <FlatList
          contentContainerStyle={styles.lista}
          data={dadosFiltrados}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const nome =
              tipoFiltro === 'ativos'
                ? (item as ItemContrato).aluno?.nome
                : (item as ItemSolicitacao).nome_aluno;

            return (
              <View style={styles.itemContainer}>
                <View style={styles.avatar} />
                <View>
                  <Text style={styles.nome}>{nome}</Text>
                  <Text style={styles.turno}>{item.turno}</Text>
                </View>
              </View>
            );
          }}
        />
      )}
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
