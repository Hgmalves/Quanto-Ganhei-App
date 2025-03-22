import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Calendario from '../components/Calendario';
import Combustivel from '../components/Combustivel';


const HomeScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>Calendário de Pagamentos</Text>
      <Calendario />
      <Text style={styles.titulo}>Cálculo de Combustível</Text>
      <Combustivel />

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  titulo: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
});

export default HomeScreen;