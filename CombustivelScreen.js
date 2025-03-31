import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Combustivel from '../components/Combustivel';

const CombustivelScreen = () => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Combustivel />
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
    paddingTop: 24,
  },
});

export default CombustivelScreen;
