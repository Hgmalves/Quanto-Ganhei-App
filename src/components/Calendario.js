import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Animated } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Para ícones

// Configuração do idioma para português
LocaleConfig.locales['pt'] = {
  monthNames: [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ],
  monthNamesShort: [
    'Jan.', 'Fev.', 'Mar.', 'Abr.', 'Mai.', 'Jun.',
    'Jul.', 'Ago.', 'Set.', 'Out.', 'Nov.', 'Dez.'
  ],
  dayNames: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
  dayNamesShort: ['Dom.', 'Seg.', 'Ter.', 'Qua.', 'Qui.', 'Sex.', 'Sáb.'],
  today: 'Hoje'
};
LocaleConfig.defaultLocale = 'pt';

const Calendario = () => {
  // Estado para armazenar os dias marcados
  const [datasMarcadas, setDatasMarcadas] = useState({});
  // Estado para armazenar o salário total
  const [salarioTotal, setSalarioTotal] = useState(0);
  // Estado para controlar a visibilidade do modal de explicação
  const [modalVisivel, setModalVisivel] = useState(true);
  // Animação para o ícone de ajuda
  const animacao = useState(new Animated.Value(0))[0];

  // Função para animar o ícone de ajuda (memoizada com useCallback)
  const iniciarAnimacao = useCallback(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animacao, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(animacao, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [animacao]);

  // Inicia a animação quando o componente é montado
  useEffect(() => {
    iniciarAnimacao();
  }, [iniciarAnimacao]);

  // Função para lidar com o clique em um dia
  const aoPressionarDia = (dia) => {
    const novasDatasMarcadas = { ...datasMarcadas };
    const corAnterior = novasDatasMarcadas[dia.dateString]?.selectedColor;
    const novaCor = corAnterior === 'green' ? 'red' : 'green';
    const valor = novaCor === 'green' ? 220 : -220;

    // Atualiza o estado dos dias marcados
    novasDatasMarcadas[dia.dateString] = { selected: true, selectedColor: novaCor };

    // Atualiza o salário total
    setDatasMarcadas(novasDatasMarcadas);
    setSalarioTotal((prev) => prev + valor);
  };

  // Função para marcar todos os dias como verde
  const marcarTodosVerde = () => {
    const todasDatas = {};
    let total = 0;
    const diasNoMes = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();

    for (let i = 1; i <= diasNoMes; i++) {
      const data = new Date(new Date().getFullYear(), new Date().getMonth(), i)
        .toISOString()
        .split('T')[0];
      todasDatas[data] = { selected: true, selectedColor: 'green' };
      total += 220;
    }

    setDatasMarcadas(todasDatas);
    setSalarioTotal(total);
  };

  // Função para marcar todos os dias como vermelho
  const marcarTodosVermelho = () => {
    const todasDatas = {};
    const diasNoMes = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();

    for (let i = 1; i <= diasNoMes; i++) {
      const data = new Date(new Date().getFullYear(), new Date().getMonth(), i)
        .toISOString()
        .split('T')[0];
      todasDatas[data] = { selected: true, selectedColor: 'red' };
    }

    setDatasMarcadas(todasDatas);
    setSalarioTotal(0);
  };

  // Função para limpar todas as marcações
  const limparMarcacoes = () => {
    setDatasMarcadas({});
    setSalarioTotal(0);
  };

  return (
    <View style={styles.container}>
      {/* Modal de Explicação */}
      <Modal
        visible={modalVisivel}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisivel(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitulo}>Como Usar o Calendário de Pagamentos</Text>
            <Text style={styles.modalTexto}>
              - Toque em um dia para marcá-lo como <Text style={{ color: '#4CAF50' }}>verde</Text> (trabalhado) ou <Text style={{ color: '#F44336' }}>vermelho</Text> (não trabalhado).
              {'\n'}- Cada dia <Text style={{ color: '#4CAF50' }}>verde</Text> adiciona R$ 220 ao seu salário.
              {'\n'}- Use os botões abaixo para marcar todos os dias de uma vez ou limpar as marcações.
            </Text>
            <TouchableOpacity style={styles.modalBotao} onPress={() => setModalVisivel(false)}>
              <Text style={styles.modalBotaoTexto}>Entendi!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Título */}
      <Text style={styles.titulo}>Controle de Pagamentos</Text>

      {/* Legenda das cores */}
      <View style={styles.legenda}>
        <View style={styles.legendaItem}>
          <View style={[styles.corLegenda, { backgroundColor: '#4CAF50' }]} />
          <Text style={styles.textoLegenda}>Dia trabalhado (R$ 220)</Text>
        </View>
        <View style={styles.legendaItem}>
          <View style={[styles.corLegenda, { backgroundColor: '#F44336' }]} />
          <Text style={styles.textoLegenda}>Dia não trabalhado (R$ 0)</Text>
        </View>
      </View>

      {/* Botões de ação */}
      <View style={styles.botoesContainer}>
        <TouchableOpacity style={[styles.botao, styles.botaoVerde]} onPress={marcarTodosVerde}>
          <Icon name="check-circle" size={20} color="#FFF" />
          <Text style={styles.textoBotao}>Marcar Todos como Verde</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.botao, styles.botaoVermelho]} onPress={marcarTodosVermelho}>
          <Icon name="cancel" size={20} color="#FFF" />
          <Text style={styles.textoBotao}>Marcar Todos como Vermelho</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.botao, styles.botaoLimpar]} onPress={limparMarcacoes}>
          <Icon name="delete" size={20} color="#FFF" />
          <Text style={styles.textoBotao}>Limpar Marcações</Text>
        </TouchableOpacity>
      </View>

      {/* Calendário */}
      <View style={styles.calendarioContainer}>
        <Calendar
          onDayPress={aoPressionarDia}
          markedDates={datasMarcadas}
          theme={{
            calendarBackground: '#FFFFFF',
            selectedDayBackgroundColor: '#4CAF50',
            selectedDayTextColor: '#FFFFFF',
            todayTextColor: '#4CAF50',
            arrowColor: '#4CAF50',
            monthTextColor: '#4CAF50',
            textMonthFontWeight: 'bold',
            textDayFontSize: 16,
          }}
        />
      </View>

      {/* Salário total */}
      <View style={styles.salarioContainer}>
        <Text style={styles.textoSalario}>Salário Total: R$ {salarioTotal.toFixed(2)}</Text>
      </View>

      {/* Animação de Ajuda */}
      <Animated.View
        style={[
          styles.animacaoContainer,
          {
            transform: [
              {
                translateY: animacao.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 10],
                }),
              },
            ],
          },
        ]}
      >
        <Icon name="help" size={30} color="#4CAF50" />
      </Animated.View>
    </View>
  );
};

// Estilos do componente
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F5F5F5',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 10,
  },
  modalTexto: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
  },
  modalBotao: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  modalBotaoTexto: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: 20,
  },
  legenda: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  legendaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  corLegenda: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  textoLegenda: {
    fontSize: 14,
    color: '#333',
  },
  botoesContainer: {
    marginBottom: 20,
  },
  botao: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  botaoVerde: {
    backgroundColor: '#4CAF50',
  },
  botaoVermelho: {
    backgroundColor: '#F44336',
  },
  botaoLimpar: {
    backgroundColor: '#607D8B',
  },
  textoBotao: {
    color: '#FFF',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  calendarioContainer: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  salarioContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  textoSalario: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
  },
  animacaoContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
});

export default Calendario;