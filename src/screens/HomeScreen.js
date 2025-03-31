import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const HomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.iconCircle}>
            <FontAwesome name="truck" size={30} color="#FFF" />
            <Icon name="attach-money" size={30} color="#FFF" style={{ marginLeft: 8 }} />
          </View>
          <Text style={styles.titulo}>QUANTO GANHEI</Text>
          <Text style={styles.subtitulo}>Controle Financeiro para Motoristas</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardText}>Bem-vindo ao Quanto Ganhei</Text>
      </View>

      <View style={styles.menuContainer}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => navigation.navigate('Calendario')}
          activeOpacity={0.7}
        >
          <View style={styles.buttonContent}>
            <Icon name="calendar-today" size={26} color="#1565C0" />
            <Text style={styles.buttonText}>Calendário de Pagamentos</Text>
          </View>
          <Icon name="chevron-right" size={22} color="#1565C0" />
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => navigation.navigate('Combustivel')}
          activeOpacity={0.7}
        >
          <View style={styles.buttonContent}>
            <Icon name="local-gas-station" size={26} color="#1565C0" />
            <Text style={styles.buttonText}>Calculadora de Combustível</Text>
          </View>
          <Icon name="chevron-right" size={22} color="#1565C0" />
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Versão 1.0</Text>
        <Text style={styles.footerText}>Sistema não vinculado aos órgãos oficiais</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E3F2FD',
    paddingTop: 20, // Adicionado espaço extra no topo para empurrar tudo para baixo
  },
  header: {
    backgroundColor: '#1565C0',
    paddingVertical: 40, // Aumentado para descer mais
    paddingHorizontal: 20,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  logoContainer: {
    alignItems: 'center',
  },
  iconCircle: {
    flexDirection: 'row',
    backgroundColor: '#2196F3',
    width: 90, // Aumentado um pouco para melhor proporção
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20, // Aumentado para descer o texto mais
    borderWidth: 3,
    borderColor: '#FFF',
  },
  titulo: {
    fontSize: 26, // Aumentado para mais destaque
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginTop: 15,
    textTransform: 'uppercase',
  },
  subtitulo: {
    fontSize: 15,
    color: '#BBDEFB',
    textAlign: 'center',
    marginTop: 8, // Ajustado para descer um pouco mais
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 18,
    margin: 20,
    marginTop: 40, // Aumentado para descer mais
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  cardText: {
    fontSize: 16,
    color: '#1565C0',
    fontWeight: '600',
  },
  menuContainer: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    marginHorizontal: 20,
    marginTop: 20,
    elevation: 3,
    paddingVertical: 10,
  },
  menuButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: '#1565C0',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 15,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 15,
  },
  footer: {
    marginTop: 40, // Ajustado para descer mais
    padding: 15,
    alignItems: 'center',
  },
  footerText: {
    color: '#757575',
    fontSize: 12,
    textAlign: 'center',
    marginVertical: 2,
  },
});

export default HomeScreen;
