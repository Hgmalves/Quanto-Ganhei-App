import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
<<<<<<< HEAD
import HomeScreen from './src/screens/Home';
=======
import Icon from 'react-native-vector-icons/MaterialIcons';
import HomeScreen from './src/screens/HomeScreen';
import CalendarioScreen from './src/screens/CalendarioScreen';
import CombustivelScreen from './src/screens/CombustivelScreen';
>>>>>>> 18a3667 (Ajustando códigos estã em passos finais para teste)

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
<<<<<<< HEAD
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Quanto Ganhei App' }} />
=======
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#1565C0',
            borderBottomLeftRadius: 16,
            borderBottomRightRadius: 16,
            height: 80,
            elevation: 3,
          },
          headerTintColor: '#FFF',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 18,
          },
          headerTitleAlign: 'center',
          headerBackTitleVisible: false,
          headerBackImage: () => (
            <Icon name="arrow-back" size={24} color="#FFF" style={{ marginLeft: 15 }} />
          ),
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }} // Oculta cabeçalho na Home
        />
        <Stack.Screen
          name="Calendario"
          component={CalendarioScreen}
          options={{ title: 'CALENDÁRIO' }}
        />
        <Stack.Screen
          name="Combustivel"
          component={CombustivelScreen}
          options={{ title: 'CÁLCULO DE COMBUSTÍVEL' }}
        />
>>>>>>> 18a3667 (Ajustando códigos estã em passos finais para teste)
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;