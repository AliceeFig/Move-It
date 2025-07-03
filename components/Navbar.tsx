import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Entypo, FontAwesome } from '@expo/vector-icons';
import { Link } from 'expo-router';

export default function NavBar() {
  return (
    <View style={styles.navBar}>
      <Link href="/(aluno)" asChild style={styles.navItem}>
        <TouchableOpacity>
          <Entypo name="home" size={32} color="white" />
        </TouchableOpacity>
      </Link>

      <Link href="/(aluno)/mapa-rota" asChild style={styles.navItem}>
        <TouchableOpacity>
          <FontAwesome name="map-marker" size={32} color="white" />
        </TouchableOpacity>
      </Link>

      <Link href="/(aluno)/geral" asChild style={styles.navItem}>
        <TouchableOpacity>
          <Entypo name="menu" size={32} color="white" />
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  navBar: {
    flexDirection: 'row',
    height: 90,
    alignItems: 'center', // garante centralização vertical dos ícones
    backgroundColor: '#5A189A',
    paddingHorizontal: 12,
    paddingTop: 10, // ⬅️ DIMINUÍDO (antes era 25)
    paddingBottom: 50, // ⬅️ AUMENTADO um pouco para afastar da nav bar do sistema
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  profileImage: {
    width: 35,
    height: 35,
    borderRadius: 50,
    backgroundColor: '#fff',
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  navItem: {
    flexGrow: 1,
    alignItems:'center'
  }
});
