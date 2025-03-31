import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  Modal,
  Alert,
  StatusBar
} from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard'; // Ajustado para usar expo-clipboard

// CONSTANTES - Estilo CNH Digital
const ANO_ATUAL = 2025;
const CONSTANTS = {
  VALOR_DIA_TRABALHADO: 220,
  CORES: {
    primaria: '#1565C0',
    secundaria: '#2196F3',
    texto: '#FFF',
    fundo: '#F5F5F5',
    feriado: '#FF9800',
    desativado: '#BDBDBD',
    verde: '#4CAF50',
    vermelho: '#F44336'
  },
  FERIADOS: {
    '2025-01-01': 'Confraternização Universal',
    '2025-04-21': 'Tiradentes',
    '2025-05-01': 'Dia do Trabalho',
    '2025-09-07': 'Independência do Brasil',
    '2025-10-12': 'Nossa Senhora Aparecida',
    '2025-11-02': 'Finados',
    '2025-11-15': 'Proclamação da República',
    '2025-12-25': 'Natal',
    '2025-03-04': 'Carnaval',
    '2025-04-18': 'Sexta-Feira Santa',
    '2025-04-20': 'Páscoa',
    '2025-06-19': 'Corpus Christi'
  }
};

LocaleConfig.locales['pt'] = {
  monthNames: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
  monthNamesShort: ['Jan.', 'Fev.', 'Mar.', 'Abr.', 'Mai.', 'Jun.', 'Jul.', 'Ago.', 'Set.', 'Out.', 'Nov.', 'Dez.'],
  dayNames: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
  dayNamesShort: ['Dom.', 'Seg.', 'Ter.', 'Qua.', 'Qui.', 'Sex.', 'Sáb.'],
  today: 'Hoje'
};
LocaleConfig.defaultLocale = 'pt';

const CalendarioPagamentos = ({ navigation }) => {
  const [state, setState] = useState({
    datasMarcadas: {},
    salarioTotal: 0,
    modalVisivel: false,
    modalAjudaVisivel: false,
    anoDispositivoInvalido: false
  });

  const hoje = new Date();
  const mesAtual = hoje.getMonth();
  const diasNoMesAtual = new Date(ANO_ATUAL, mesAtual + 1, 0).getDate();

  useEffect(() => {
    const anoDispositivo = new Date().getFullYear();
    if (anoDispositivo !== ANO_ATUAL) {
      setState(prev => ({ ...prev, anoDispositivoInvalido: true }));
      Alert.alert(
        'Atenção',
        `Este calendário está configurado para ${ANO_ATUAL}. Para funcionar corretamente, ajuste o ano do seu dispositivo para ${ANO_ATUAL}.`,
        [{ text: 'OK' }]
      );
    }
  }, []);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const [dados, salario] = await Promise.all([
          AsyncStorage.getItem('@datasMarcadas'),
          AsyncStorage.getItem('@salarioTotal')
        ]);
        
        if (dados || salario) {
          setState(prev => ({
            ...prev,
            datasMarcadas: dados ? JSON.parse(dados) : {},
            salarioTotal: salario ? parseFloat(salario) : 0
          }));
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        Alert.alert('Erro', 'Ocorreu um erro ao carregar seus dados salvos.');
      }
    };
    
    carregarDados();
  }, []);

  const toggleDia = useCallback((dateString) => {
    if (state.anoDispositivoInvalido) {
      Alert.alert('Ajuste necessário', `Altere o ano do dispositivo para ${ANO_ATUAL} para usar o calendário.`);
      return;
    }

    setState(prev => {
      const current = prev.datasMarcadas[dateString];
      const isFeriado = CONSTANTS.FERIADOS[dateString];
      
      const newColor = current?.selectedColor === CONSTANTS.CORES.verde 
        ? CONSTANTS.CORES.vermelho 
        : CONSTANTS.CORES.verde;

      const valor = newColor === CONSTANTS.CORES.vermelho 
        ? -CONSTANTS.VALOR_DIA_TRABALHADO 
        : CONSTANTS.VALOR_DIA_TRABALHADO;

      const newDatasMarcadas = {
        ...prev.datasMarcadas,
        [dateString]: {
          selected: true,
          selectedColor: newColor,
          ...(isFeriado && { 
            dotColor: CONSTANTS.CORES.texto,
            customStyles: {
              container: {
                backgroundColor: newColor === CONSTANTS.CORES.verde 
                  ? CONSTANTS.CORES.feriado 
                  : newColor,
                borderRadius: 16,
              },
              text: {
                color: CONSTANTS.CORES.texto,
                fontWeight: 'bold'
              }
            }
          })
        }
      };

      try {
        AsyncStorage.multiSet([
          ['@datasMarcadas', JSON.stringify(newDatasMarcadas)],
          ['@salarioTotal', (prev.salarioTotal + valor).toString()]
        ]);
      } catch (error) {
        console.error('Erro ao salvar dados:', error);
      }

      return {
        ...prev,
        datasMarcadas: newDatasMarcadas,
        salarioTotal: prev.salarioTotal + valor
      };
    });
  }, [state.anoDispositivoInvalido]);

  const marcarTodos = useCallback((cor) => {
    if (state.anoDispositivoInvalido) {
      Alert.alert('Ajuste necessário', `Altere o ano do dispositivo para ${ANO_ATUAL} para usar esta função.`);
      return;
    }

    const datas = {};
    let total = cor === CONSTANTS.CORES.verde ? 0 : 0;

    for (let i = 1; i <= diasNoMesAtual; i++) {
      const date = new Date(ANO_ATUAL, mesAtual, i);
      const dateString = date.toISOString().split('T')[0];
      const isFeriado = CONSTANTS.FERIADOS[dateString];
      
      datas[dateString] = {
        selected: true,
        selectedColor: cor,
        ...(isFeriado && { 
          dotColor: CONSTANTS.CORES.texto,
          customStyles: {
            container: {
              backgroundColor: cor === CONSTANTS.CORES.verde 
                ? CONSTANTS.CORES.feriado 
                : cor,
              borderRadius: 16,
            },
            text: {
              color: CONSTANTS.CORES.texto,
              fontWeight: 'bold'
            }
          }
        })
      };
      
      if (cor === CONSTANTS.CORES.verde) {
        total += CONSTANTS.VALOR_DIA_TRABALHADO;
      }
    }

    try {
      AsyncStorage.multiSet([
        ['@datasMarcadas', JSON.stringify(datas)],
        ['@salarioTotal', total.toString()]
      ]);
    } catch (error) {
      console.error('Erro ao salvar marcações:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao salvar suas marcações.');
    }

    setState(prev => ({
      ...prev,
      datasMarcadas: datas,
      salarioTotal: cor === CONSTANTS.CORES.verde ? total : 0
    }));
  }, [diasNoMesAtual, mesAtual, state.anoDispositivoInvalido]);

  const limparMarcacoes = useCallback(() => {
    if (state.anoDispositivoInvalido) {
      Alert.alert('Ajuste necessário', `Altere o ano do dispositivo para ${ANO_ATUAL} para usar esta função.`);
      return;
    }

    Alert.alert(
      'Confirmação',
      'Tem certeza que deseja limpar todas as marcações?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpar',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove(['@datasMarcadas', '@salarioTotal']);
              setState(prev => ({
                ...prev,
                datasMarcadas: {},
                salarioTotal: 0
              }));
            } catch (error) {
              console.error('Erro ao limpar marcações:', error);
              Alert.alert('Erro', 'Ocorreu um erro ao limpar suas marcações.');
            }
          }
        }
      ]
    );
  }, [state.anoDispositivoInvalido]);

  const marcacoesCalendario = useMemo(() => {
    const marcacoes = { ...state.datasMarcadas };
    
    Object.keys(CONSTANTS.FERIADOS).forEach(data => {
      if (!marcacoes[data]) {
        marcacoes[data] = {
          selected: false,
          marked: true,
          dotColor: CONSTANTS.CORES.feriado,
          customStyles: {
            text: {
              color: CONSTANTS.CORES.feriado,
              fontWeight: 'bold'
            }
          }
        };
      }
    });
    
    return marcacoes;
  }, [state.datasMarcadas]);

  const copiarSalario = async () => {
    try {
      await Clipboard.setStringAsync(`R$ ${state.salarioTotal.toFixed(2)}`);
      Alert.alert('Copiado!', 'Valor do salário copiado para a área de transferência.');
    } catch (error) {
      console.error('Erro ao copiar para a área de transferência:', error);
      Alert.alert('Erro', 'Não foi possível copiar o valor.');
    }
  };

  const BotaoCNH = ({ icon, label, onPress, danger }) => (
    <TouchableOpacity 
      style={[styles.botaoCNH, danger && { borderColor: CONSTANTS.CORES.vermelho }]}
      onPress={onPress}
    >
      <View style={styles.botaoContent}>
        <Icon 
          name={icon} 
          size={20} 
          color={danger ? CONSTANTS.CORES.vermelho : CONSTANTS.CORES.primaria} 
        />
        <Text style={[styles.botaoTexto, danger && { color: CONSTANTS.CORES.vermelho }]}>
          {label}
        </Text>
      </View>
      <Icon 
        name="chevron-right" 
        size={20} 
        color={danger ? CONSTANTS.CORES.vermelho : CONSTANTS.CORES.primaria} 
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={CONSTANTS.CORES.texto} />
      
      <View style={styles.header}>
        <Icon name="calendar-today" size={32} color={CONSTANTS.CORES.primaria} />
        <Text style={styles.titulo}>Calendário de Pagamentos</Text>
        <Text style={styles.subtitulo}>Ano {ANO_ATUAL}</Text>
        <TouchableOpacity 
          style={styles.ajudaButton}
          onPress={() => setState(prev => ({ ...prev, modalAjudaVisivel: true }))}
        >
          <Icon name="help" size={24} color={CONSTANTS.CORES.primaria} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.resumoContainer}>
          <Text style={styles.resumoTitulo}>Salário Total</Text>
          <View style={styles.salarioRow}>
            <Text style={styles.salarioTotal}>R$ {state.salarioTotal.toFixed(2)}</Text>
            <TouchableOpacity onPress={copiarSalario}>
              <Icon name="content-copy" size={20} color={CONSTANTS.CORES.primaria} />
            </TouchableOpacity>
          </View>
          <Text style={styles.resumoLegenda}>
            {Object.values(state.datasMarcadas).filter(d => d.selectedColor === CONSTANTS.CORES.verde).length} dias trabalhados
          </Text>
        </View>

        <View style={styles.acoesContainer}>
          <TouchableOpacity 
            style={styles.acaoRapida}
            onPress={() => marcarTodos(CONSTANTS.CORES.verde)}
          >
            <Icon name="check-circle" size={24} color={CONSTANTS.CORES.verde} />
            <Text style={styles.acaoTexto}>Marcar Todos</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.acaoRapida}
            onPress={() => marcarTodos(CONSTANTS.CORES.vermelho)}
          >
            <Icon name="cancel" size={24} color={CONSTANTS.CORES.vermelho} />
            <Text style={styles.acaoTexto}>Desmarcar Todos</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.acaoRapida}
            onPress={limparMarcacoes}
          >
            <Icon name="delete" size={24} color={CONSTANTS.CORES.desativado} />
            <Text style={styles.acaoTexto}>Limpar Tudo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.calendarioContainer}>
          <Calendar
            current={`${ANO_ATUAL}-${String(mesAtual + 1).padStart(2, '0')}-01`}
            minDate={`${ANO_ATUAL}-01-01`}
            maxDate={`${ANO_ATUAL}-12-31`}
            onDayPress={({ dateString }) => toggleDia(dateString)}
            markedDates={marcacoesCalendario}
            theme={{
              calendarBackground: CONSTANTS.CORES.texto,
              selectedDayBackgroundColor: CONSTANTS.CORES.verde,
              selectedDayTextColor: CONSTANTS.CORES.texto,
              todayTextColor: CONSTANTS.CORES.primaria,
              arrowColor: CONSTANTS.CORES.primaria,
              monthTextColor: CONSTANTS.CORES.primaria,
              textMonthFontWeight: 'bold',
              textDayFontSize: 16,
              textSectionTitleColor: CONSTANTS.CORES.primaria,
              dayTextColor: '#333',
              textDisabledColor: CONSTANTS.CORES.desativado,
              'stylesheet.calendar.header': {
                week: {
                  marginTop: 5,
                  flexDirection: 'row',
                  justifyContent: 'space-between'
                }
              }
            }}
            markingType="custom"
          />
        </View>

        <View style={styles.legendaContainer}>
          <View style={styles.legendaItem}>
            <View style={[styles.legendaCor, { backgroundColor: CONSTANTS.CORES.verde }]} />
            <Text style={styles.legendaTexto}>Dia Trabalhado</Text>
          </View>
          <View style={styles.legendaItem}>
            <View style={[styles.legendaCor, { backgroundColor: CONSTANTS.CORES.vermelho }]} />
            <Text style={styles.legendaTexto}>Dia Não Trabalhado</Text>
          </View>
          <View style={styles.legendaItem}>
            <View style={[styles.legendaCor, { backgroundColor: CONSTANTS.CORES.feriado }]} />
            <Text style={styles.legendaTexto}>Feriado</Text>
          </View>
        </View>

    

        <BotaoCNH
          icon="event"
          label="Ver Feriados Nacionais"
          onPress={() => setState(prev => ({ ...prev, modalVisivel: true }))}
        />

        <Modal
          visible={state.modalVisivel}
          transparent
          animationType="slide"
          onRequestClose={() => setState(prev => ({ ...prev, modalVisivel: false }))}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitulo}>Feriados Nacionais {ANO_ATUAL}</Text>
              <ScrollView style={styles.modalScroll}>
                {Object.entries(CONSTANTS.FERIADOS)
                  .sort((a, b) => new Date(a[0]) - new Date(b[0]))
                  .map(([data, nome]) => (
                    <View key={data} style={styles.feriadoItem}>
                      <Text style={styles.feriadoData}>
                        {data.split('-').reverse().join('/')}
                      </Text>
                      <Text style={styles.feriadoNome}>{nome}</Text>
                    </View>
                  ))}
              </ScrollView>
              <TouchableOpacity
                style={styles.modalBotao}
                onPress={() => setState(prev => ({ ...prev, modalVisivel: false }))}
              >
                <Text style={styles.modalBotaoTexto}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal
          visible={state.modalAjudaVisivel}
          transparent
          animationType="slide"
          onRequestClose={() => setState(prev => ({ ...prev, modalAjudaVisivel: false }))}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitulo}>Como Usar o Calendário</Text>
              <ScrollView style={styles.modalScroll}>
                <View style={styles.instrucaoItem}>
                  <Icon name="touch-app" size={24} color={CONSTANTS.CORES.primaria} />
                  <Text style={styles.instrucaoTexto}>
                    <Text style={{fontWeight: 'bold'}}>Marcar dia:</Text> Toque em um dia para marcar como trabalhado (verde) ou não trabalhado (vermelho).
                  </Text>
                </View>
                
                <View style={styles.instrucaoItem}>
                  <Icon name="attach-money" size={24} color={CONSTANTS.CORES.primaria} />
                  <Text style={styles.instrucaoTexto}>
                    <Text style={{fontWeight: 'bold'}}>Salário:</Text> Cada dia marcado como trabalhado adiciona R$ {CONSTANTS.VALOR_DIA_TRABALHADO.toFixed(2)} ao salário total.
                  </Text>
                </View>
                
                <View style={styles.instrucaoItem}>
                  <Icon name="check-circle" size={24} color={CONSTANTS.CORES.verde} />
                  <Text style={styles.instrucaoTexto}>
                    <Text style={{fontWeight: 'bold'}}>Marcar Todos:</Text> Marca todos os dias do mês atual como trabalhados.
                  </Text>
                </View>
                
                <View style={styles.instrucaoItem}>
                  <Icon name="cancel" size={24} color={CONSTANTS.CORES.vermelho} />
                  <Text style={styles.instrucaoTexto}>
                    <Text style={{fontWeight: 'bold'}}>Desmarcar Todos:</Text> Marca todos os dias do mês atual como não trabalhados.
                  </Text>
                </View>
                
                <View style={styles.instrucaoItem}>
                  <Icon name="delete" size={24} color={CONSTANTS.CORES.desativado} />
                  <Text style={styles.instrucaoTexto}>
                    <Text style={{fontWeight: 'bold'}}>Limpar Tudo:</Text> Remove todas as marcações do calendário.
                  </Text>
                </View>
                
                <View style={styles.instrucaoItem}>
                  <Icon name="event" size={24} color={CONSTANTS.CORES.feriado} />
                  <Text style={styles.instrucaoTexto}>
                    <Text style={{fontWeight: 'bold'}}>Feriados:</Text> Dias em laranja são feriados nacionais. Toque em "Ver Feriados Nacionais" para ver a lista completa.
                  </Text>
                </View>
                
                <View style={styles.instrucaoItem}>
                  <Icon name="directions-car" size={24} color={CONSTANTS.CORES.primaria} />
                  <Text style={styles.instrucaoTexto}>
                    <Text style={{fontWeight: 'bold'}}>Calculadora de Viagem:</Text> Use seu salário calculado para avaliar custos de viagem.
                  </Text>
                </View>
                
                <View style={styles.instrucaoItem}>
                  <Icon name="save" size={24} color={CONSTANTS.CORES.primaria} />
                  <Text style={styles.instrucaoTexto}>
                    <Text style={{fontWeight: 'bold'}}>Salvamento automático:</Text> Todas as marcações são salvas automaticamente no seu dispositivo.
                  </Text>
                </View>
              </ScrollView>
              <TouchableOpacity
                style={styles.modalBotao}
                onPress={() => setState(prev => ({ ...prev, modalAjudaVisivel: false }))}
              >
                <Text style={styles.modalBotaoTexto}>Entendi</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CONSTANTS.CORES.fundo,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: CONSTANTS.CORES.texto,
    borderBottomWidth: 1,
    borderBottomColor: CONSTANTS.CORES.desativado,
    elevation: 2,
    position: 'relative',
  },
  ajudaButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    padding: 8,
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: CONSTANTS.CORES.primaria,
    marginTop: 10,
  },
  subtitulo: {
    color: CONSTANTS.CORES.desativado,
    fontSize: 14,
  },
  resumoContainer: {
    backgroundColor: CONSTANTS.CORES.texto,
    margin: 15,
    borderRadius: 10,
    padding: 20,
    elevation: 3,
    alignItems: 'center',
  },
  salarioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  resumoTitulo: {
    color: CONSTANTS.CORES.primaria,
    fontSize: 16,
    fontWeight: 'bold',
  },
  salarioTotal: {
    fontSize: 32,
    fontWeight: 'bold',
    color: CONSTANTS.CORES.primaria,
    marginRight: 10,
  },
  resumoLegenda: {
    color: CONSTANTS.CORES.desativado,
    fontSize: 14,
  },
  acoesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 15,
    marginBottom: 15,
  },
  acaoRapida: {
    alignItems: 'center',
    padding: 10,
  },
  acaoTexto: {
    marginTop: 5,
    fontSize: 12,
    color: '#333',
  },
  calendarioContainer: {
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 3,
  },
  legendaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    backgroundColor: CONSTANTS.CORES.texto,
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 8,
    elevation: 2,
  },
  legendaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendaCor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 5,
  },
  legendaTexto: {
    fontSize: 12,
    color: '#333',
  },
  botaoCNH: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: CONSTANTS.CORES.desativado,
  },
  botaoContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  botaoTexto: {
    color: CONSTANTS.CORES.primaria,
    marginLeft: 10,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: CONSTANTS.CORES.texto,
    width: '90%',
    maxHeight: '80%',
    borderRadius: 10,
    overflow: 'hidden',
  },
  modalTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: CONSTANTS.CORES.primaria,
    padding: 20,
    textAlign: 'center',
    backgroundColor: 'rgba(21, 101, 192, 0.1)',
  },
  modalScroll: {
    maxHeight: 300,
    paddingHorizontal: 20,
  },
  feriadoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: CONSTANTS.CORES.fundo,
  },
  feriadoData: {
    fontWeight: 'bold',
    color: CONSTANTS.CORES.primaria,
  },
  feriadoNome: {
    color: '#333',
    flexShrink: 1,
    textAlign: 'right',
  },
  instrucaoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: CONSTANTS.CORES.fundo,
  },
  instrucaoTexto: {
    flex: 1,
    marginLeft: 10,
    color: '#333',
    lineHeight: 20,
  },
  modalBotao: {
    backgroundColor: CONSTANTS.CORES.primaria,
    padding: 15,
    alignItems: 'center',
  },
  modalBotaoTexto: {
    color: CONSTANTS.CORES.texto,
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default CalendarioPagamentos;