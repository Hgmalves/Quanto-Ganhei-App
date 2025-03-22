import React from 'react';
import { StyleSheet, View } from 'react-native';
import { MapView } from 'expo-maps';

const Mapa = () => {
  return (
    <View style={styles.container}>
      <MapView
        style={styles.mapa}
        initialRegion={{
          latitude: -23.5505, // Latitude de São Paulo
          longitude: -46.6333, // Longitude de São Paulo
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        <MapView.Marker
          coordinate={{ latitude: -23.5505, longitude: -46.6333 }}
          title="Localização Exemplo"
          description="Este é um marcador de exemplo"
        />
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapa: {
    flex: 1,
  },
});

export default Mapa;