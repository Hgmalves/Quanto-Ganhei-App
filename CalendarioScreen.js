import React from 'react';
import { View, StyleSheet } from 'react-native';
import Calendario from '../components/Calendario';

const CalendarioScreen = () => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Calendario />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E3F2FD',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
});

export default CalendarioScreen;
