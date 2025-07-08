import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useFocusEffect } from '@react-navigation/native';
import { BackHandler } from 'react-native';


export default function HomeMotorista() {
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        BackHandler.exitApp()
        return true
      };
      BackHandler.addEventListener('hardwareBackPress', onBackPress);
    }, [])
  );
  
  return (
    <View style={styles.container}>
      <Text>Bem-vindo, Motorista!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

