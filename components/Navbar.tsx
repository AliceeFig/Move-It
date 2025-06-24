import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

interface NavBarProps {
  title: string;
}

export default function NavBar({ title }: NavBarProps) {
  return (
    <View style={styles.navBar}>
      <View style={styles.profileContainer}>
        <Image
          source={require('../assets/images/userm.png')}
          style={styles.profileImage}
        />
        <Text style={styles.title}>{title}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navBar: {
    backgroundColor: '#FF6B00',
    height: 80,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingTop: 30,
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
});
