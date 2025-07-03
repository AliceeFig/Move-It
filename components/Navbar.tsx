import React from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { useEffect, useState } from 'react';
import { supabase } from '../src/lib/supabase';

type NavBarProps = {
  title: string;
  showHome?: boolean;
  onProfilePress?: () => void;
};

  const [nome, setNome] = useState('');

  useEffect(() => {
    async function fetchNome() {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;

      if (!user) return;

      const nomeMeta = user.user_metadata?.nome;
      if (nomeMeta) {
        setNome(nomeMeta);
      }
    }

    fetchNome();
  }, []);


export default function NavBar({ title, onProfilePress }: NavBarProps) {
  return (
    <View style={styles.navBar}>
      <View style={styles.profileContainer}>
        <Pressable onPress={onProfilePress}>
          <Image
            source={require('../assets/images/userm.png')}
            style={styles.profileImage}
          />
        </Pressable>
        <Text style={styles.title}>{title}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navBar: {
    backgroundColor: '#9D4EDD',
    height: 120,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  profileImage: {
    width: 55,
    height: 55,
    borderRadius: 50,
    backgroundColor: '#fff',
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
