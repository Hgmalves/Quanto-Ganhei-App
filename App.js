import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';


// Screens - Importação organizada por ordem alfabética
import CalendarioScreen from './src/screens/CalendarioScreen';
import CombustivelScreen from './src/screens/CombustivelScreen';
import HomeScreen from './src/screens/HomeScreen';

const Stack = createStackNavigator();

// Constantes para estilos reutilizáveis
const HEADER_STYLES = {
  backgroundColor: '#1565C0',
  borderBottomLeftRadius: 16,
  borderBottomRightRadius: 16,
  height: 80,
  elevation: 3,
};

const HEADER_TITLE_STYLES = {
  fontWeight: 'bold',
  fontSize: 18,
};

const BackButton = () => (
  <Icon 
    name="arrow-back" 
    size={24} 
    color="#FFF" 
    style={{ marginLeft: 15 }} 
  />
);

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: HEADER_STYLES,
          headerTintColor: '#FFF',
          headerTitleStyle: HEADER_TITLE_STYLES,
          headerTitleAlign: 'center',
          headerBackTitleVisible: false,
          headerBackImage: BackButton,
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ 
            headerShown: false // Tela inicial sem cabeçalho
          }} 
        />

        <Stack.Screen
          name="Calendario"
          component={CalendarioScreen}
          options={{ 
            title: 'Calendário' // Título mais natural (sem CAPS LOCK)
          }}
        />

        <Stack.Screen
          name="Combustivel"
          component={CombustivelScreen}
          options={{ 
            title: 'Cálculo de Combustível' 
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;