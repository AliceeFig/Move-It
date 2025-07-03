import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface Props {
  tipoSelecionado: 'ativos' | 'solicitacoes';
  onSelecionar: (tipo: 'ativos' | 'solicitacoes') => void;
}

export default function FiltroSelect({ tipoSelecionado, onSelecionar }: Props) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.opcao, tipoSelecionado === 'ativos' && styles.selecionado]}
        onPress={() => onSelecionar('ativos')}
      >
        <Text style={styles.texto}>Contratos Ativos</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.opcao, tipoSelecionado === 'solicitacoes' && styles.selecionado]}
        onPress={() => onSelecionar('solicitacoes')}
      >
        <Text style={styles.texto}>Solicitações</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 9,
    marginBottom: 20,
  },
  opcao: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    alignItems: 'center',
  },
  selecionado: {
    backgroundColor: '#7e22ce',
  },
  texto: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
