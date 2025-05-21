import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
  Animated,
  Vibration,
  Modal,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';

const CONSTANTS = {
  CORES: {
    primaria: '#1565C0',
    secundaria: '#2196F3',
    texto: '#FFF',
    fundo: '#F5F5F5',
    sucesso: '#4CAF50',
    erro: '#F44336',
    desativado: '#BDBDBD',
    destaque: '#FFC107',
  },
};

const { width } = Dimensions.get('window');

// Componente InputField completo
const InputField = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  error,
  obrigatorio,
  onSubmitEditing,
}) => (
  <View style={styles.inputContainer}>
    <Text style={styles.formLabel}>
      {label} {obrigatorio && <Text style={styles.obrigatorio}>*</Text>}
    </Text>
    <TextInput
      style={[styles.input, error && styles.inputError]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      keyboardType={keyboardType || 'default'}
      placeholderTextColor="#999"
      onSubmitEditing={onSubmitEditing}
      returnKeyType="done"
      blurOnSubmit={true}
    />
    {error && <Text style={styles.errorMessage}>{error}</Text>}
  </View>
);

// Componente principal
const CalculadoraCombustivel = () => {
  // Estados
  const [kmInicial, setKmInicial] = useState('');
  const [kmFinal, setKmFinal] = useState('');
  const [precoLitro, setPrecoLitro] = useState('');
  const [consumoKmPorLitro, setConsumoKmPorLitro] = useState('');
  const [quantidadePedagios, setQuantidadePedagios] = useState('');
  const [valorPedagio, setValorPedagio] = useState('');
  const [salario, setSalario] = useState('');
  const [resultado, setResultado] = useState(null);
  const [erros, setErros] = useState({});
  const [modalVisible, setModalVisible] = useState(false);

  // Animação
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Efeitos
  useEffect(() => {
    const carregarPreferencias = async () => {
      try {
        const dados = await AsyncStorage.getItem('@configCombustivel');
        if (dados) {
          const { preco, consumo } = JSON.parse(dados);
          setPrecoLitro(preco || '');
          setConsumoKmPorLitro(consumo || '');
        }
      } catch (e) {
        console.error('Erro ao carregar preferências:', e);
      }
    };
    carregarPreferencias();
  }, []);

  useEffect(() => {
    if (resultado) {
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }
  }, [resultado, fadeAnim]);

  // Funções auxiliares
  const formatarNumero = (valor) => {
    if (typeof valor === 'string') {
      return parseFloat(valor.replace(',', '.')) || 0;
    }
    return valor;
  };

  const formatarMoeda = (valor) => {
    let cleaned = valor.replace(/[^0-9,]/g, '');
    const parts = cleaned.split(',');
    if (parts.length > 1) {
      cleaned = parts[0] + ',' + parts.slice(1).join('');
    }
    return cleaned;
  };

  const formatarInteiro = (valor) => valor.replace(/[^0-9]/g, '');

  // Validação
  const validarCampos = () => {
    const novosErros = {};

    // Validação de campos obrigatórios
    const camposObrigatorios = [
      { campo: kmInicial, nome: 'kmInicial', label: 'KM Inicial' },
      { campo: kmFinal, nome: 'kmFinal', label: 'KM Final' },
      { campo: precoLitro, nome: 'precoLitro', label: 'Preço do litro' },
      { campo: consumoKmPorLitro, nome: 'consumoKmPorLitro', label: 'Consumo' },
    ];

    camposObrigatorios.forEach(({ campo, nome, label }) => {
      if (!campo) novosErros[nome] = `${label} é obrigatório`;
    });

    // Validações numéricas
    const validacoesNumericas = [
      { campo: kmInicial, nome: 'kmInicial', min: 0 },
      { campo: kmFinal, nome: 'kmFinal', min: formatarNumero(kmInicial) + 0.1 },
      { campo: precoLitro, nome: 'precoLitro', min: 0.1 },
      { campo: consumoKmPorLitro, nome: 'consumoKmPorLitro', min: 1 },
      { campo: salario, nome: 'salario', min: 0 },
      { campo: quantidadePedagios, nome: 'quantidadePedagios', min: 0 },
      { campo: valorPedagio, nome: 'valorPedagio', min: 0 },
    ];

    validacoesNumericas.forEach(({ campo, nome, min }) => {
      const valor = formatarNumero(campo);
      if (campo && valor < min) {
        novosErros[nome] =
          min === 0 ? 'Valor não pode ser negativo' : `Valor mínimo: ${min}`;
      }
    });

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  // Cálculo principal
  const calcularCustoViagem = () => {
    if (!validarCampos()) {
      Vibration.vibrate(50);
      return;
    }
    Keyboard.dismiss();

    try {
      const distancia = formatarNumero(kmFinal) - formatarNumero(kmInicial);
      const litrosUsados = distancia / formatarNumero(consumoKmPorLitro);
      const custoCombustivel = litrosUsados * formatarNumero(precoLitro);
      const custoPedagios =
        formatarNumero(quantidadePedagios) * formatarNumero(valorPedagio);
      const custoTotal = custoCombustivel + custoPedagios;

      const resultadoBase = {
        distanciaPercorrida: distancia.toFixed(1),
        litrosUsados: litrosUsados.toFixed(2),
        custoCombustivel: custoCombustivel.toFixed(2),
        custoPedagios: custoPedagios.toFixed(2),
        custoTotal: custoTotal.toFixed(2),
        custoPorKm:
          distancia > 0 ? (custoTotal / distancia).toFixed(2) : '0.00',
      };

      if (salario) {
        const salarioFormatado = formatarNumero(salario);
        resultadoBase.saldoRestante = (salarioFormatado - custoTotal).toFixed(
          2
        );
      }

      setResultado(resultadoBase);
      AsyncStorage.setItem(
        '@configCombustivel',
        JSON.stringify({
          preco: precoLitro,
          consumo: consumoKmPorLitro,
        })
      );
      Vibration.vibrate(100);
    } catch (erro) {
      Alert.alert('Erro', 'Verifique os valores informados');
    }
  };

  // Limpar campos
  const limparCampos = useCallback(() => {
    setKmInicial('');
    setKmFinal('');
    setPrecoLitro('');
    setConsumoKmPorLitro('');
    setQuantidadePedagios('');
    setValorPedagio('');
    setSalario('');
    setResultado(null);
    setErros({});
  }, []);

  // Renderização
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}>
      <View style={styles.container}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Icon
              name="local-gas-station"
              size={32}
              color={CONSTANTS.CORES.texto}
            />
            <Text style={styles.headerTitle}>Calculadora de Combustível</Text>
            <Text style={styles.headerSubtitle}>
              Calcule os gastos da sua viagem
            </Text>

            <TouchableOpacity
              style={styles.helpButton}
              onPress={() => setModalVisible(true)}>
              <Icon
                name="help-outline"
                size={24}
                color={CONSTANTS.CORES.texto}
              />
            </TouchableOpacity>
          </View>

          {/* Formulário */}
          <View style={styles.formContainer}>
            <InputField
              label="KM Inicial"
              value={kmInicial}
              onChangeText={setKmInicial}
              placeholder="Ex: 1000"
              keyboardType="numeric"
              error={erros.kmInicial}
              obrigatorio
            />

            <InputField
              label="KM Final"
              value={kmFinal}
              onChangeText={setKmFinal}
              placeholder="Ex: 1200"
              keyboardType="numeric"
              error={erros.kmFinal}
              obrigatorio
            />

            <InputField
              label="Preço do litro (R$)"
              value={precoLitro}
              onChangeText={(t) => setPrecoLitro(formatarMoeda(t))}
              placeholder="Ex: 5,89"
              keyboardType="decimal-pad"
              error={erros.precoLitro}
              obrigatorio
            />

            <InputField
              label="Consumo (km/l)"
              value={consumoKmPorLitro}
              onChangeText={setConsumoKmPorLitro}
              placeholder="Ex: 12"
              keyboardType="decimal-pad"
              error={erros.consumoKmPorLitro}
              obrigatorio
            />

            <InputField
              label="Quantidade de pedágios"
              value={quantidadePedagios}
              onChangeText={(t) => setQuantidadePedagios(formatarInteiro(t))}
              placeholder="Ex: 2"
              keyboardType="numeric"
              error={erros.quantidadePedagios}
            />

            <InputField
              label="Valor de cada pedágio (R$)"
              value={valorPedagio}
              onChangeText={(t) => setValorPedagio(formatarMoeda(t))}
              placeholder="Ex: 7,50"
              keyboardType="decimal-pad"
              error={erros.valorPedagio}
            />

            <InputField
              label="Salário (R$)"
              value={salario}
              onChangeText={(t) => setSalario(formatarMoeda(t))}
              placeholder="Ex: 2200,00 (opcional)"
              keyboardType="decimal-pad"
              error={erros.salario}
              onSubmitEditing={Keyboard.dismiss}
            />

            {/* Botões */}
            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={[styles.button, styles.calculateButton]}
                onPress={calcularCustoViagem}>
                <Icon name="calculate" size={24} color="#FFF" />
                <Text style={styles.buttonText}>Calcular</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.clearButton]}
                onPress={limparCampos}>
                <Icon name="delete" size={24} color="#FFF" />
                <Text style={styles.buttonText}>Limpar</Text>
              </TouchableOpacity>
            </View>

            {/* Resultados */}
            {resultado && (
              <Animated.View
                style={[styles.resultContainer, { opacity: fadeAnim }]}>
                <Text style={styles.resultTitle}>Detalhes da Viagem</Text>

                <View style={styles.resultGrid}>
                  <View style={styles.resultCard}>
                    <Text style={styles.resultCardLabel}>Distância</Text>
                    <Text style={styles.resultCardValue}>
                      {resultado.distanciaPercorrida} km
                    </Text>
                  </View>

                  <View style={styles.resultCard}>
                    <Text style={styles.resultCardLabel}>Combustível</Text>
                    <Text style={styles.resultCardValue}>
                      {resultado.litrosUsados} L
                    </Text>
                  </View>
                </View>

                <View style={styles.resultItem}>
                  <Text style={styles.resultLabel}>Custo Combustível:</Text>
                  <Text style={styles.resultValue}>
                    R$ {resultado.custoCombustivel}
                  </Text>
                </View>

                {resultado.custoPedagios > 0 && (
                  <View style={styles.resultItem}>
                    <Text style={styles.resultLabel}>Custo Pedágios:</Text>
                    <Text style={styles.resultValue}>
                      R$ {resultado.custoPedagios}
                    </Text>
                  </View>
                )}

                <View style={styles.resultTotal}>
                  <Text style={styles.resultTotalLabel}>CUSTO TOTAL</Text>
                  <Text style={styles.resultTotalValue}>
                    R$ {resultado.custoTotal}
                  </Text>
                </View>

                <View style={styles.resultItem}>
                  <Text style={styles.resultLabel}>Custo por km:</Text>
                  <Text style={styles.resultValue}>
                    R$ {resultado.custoPorKm}
                  </Text>
                </View>

                {resultado.saldoRestante && (
                  <View style={styles.resultItem}>
                    <Text style={styles.resultLabel}>Saldo Restante:</Text>
                    <Text style={styles.resultValue}>
                      R$ {resultado.saldoRestante}
                    </Text>
                  </View>
                )}
              </Animated.View>
            )}
          </View>
        </ScrollView>

        {/* Botão Flutuante */}
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={calcularCustoViagem}>
          <Icon name="calculate" size={28} color="#FFF" />
        </TouchableOpacity>

        {/* Modal de Ajuda */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Icon name="help" size={28} color="#FFC107" />
                <Text style={styles.modalTitle}>Como Usar</Text>
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setModalVisible(false)}>
                  <Icon name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalContent}>
                <View style={styles.instructionItem}>
                  <Icon name="edit" size={20} color="#2196F3" />
                  <View style={styles.instructionText}>
                    <Text style={styles.instructionTitle}>
                      Passo 1: Dados Básicos
                    </Text>
                    <Text style={styles.instructionDescription}>
                      Preencha a quilometragem inicial e final do seu veículo, o
                      preço atual do combustível e o consumo médio (km/litro).
                    </Text>
                  </View>
                </View>

                <View style={styles.instructionItem}>
                  <Icon name="attach-money" size={20} color="#4CAF50" />
                  <View style={styles.instructionText}>
                    <Text style={styles.instructionTitle}>
                      Passo 2: Custos Adicionais
                    </Text>
                    <Text style={styles.instructionDescription}>
                      Adicione informações sobre pedágios (quantidade e valor)
                      caso tenha custos extras na viagem.
                    </Text>
                  </View>
                </View>

                <View style={styles.instructionItem}>
                  <Icon name="account-balance" size={20} color="#9C27B0" />
                  <View style={styles.instructionText}>
                    <Text style={styles.instructionTitle}>
                      Passo 3: Salário (Opcional)
                    </Text>
                    <Text style={styles.instructionDescription}>
                      Caso deseje calcular o impacto da viagem no seu orçamento,
                      informe seu salário mensal.
                    </Text>
                  </View>
                </View>

                <View style={styles.tipBox}>
                  <Icon name="lightbulb-outline" size={24} color="#FFC107" />
                  <Text style={styles.tipText}>
                    Dica: Atualize regularmente os preços do combustível e
                    verifique o consumo real do seu veículo para cálculos mais
                    precisos.
                  </Text>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </KeyboardAvoidingView>
  );
};

// Estilos completos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContainer: {
    paddingBottom: 100,
  },
  header: {
    backgroundColor: '#1565C0',
    padding: 20,
    alignItems: 'center',
    elevation: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 10,
  },
  headerSubtitle: {
    color: '#FFF',
    opacity: 0.9,
    fontSize: 14,
  },
  helpButton: {
    position: 'absolute',
    right: 15,
    top: 15,
  },
  formContainer: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    margin: 15,
    padding: 20,
    elevation: 3,
  },
  inputContainer: {
    marginBottom: 15,
  },
  formLabel: {
    fontSize: 16,
    color: '#455A64',
    marginBottom: 5,
    fontWeight: '500',
  },
  obrigatorio: {
    color: '#F44336',
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#CED4DA',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#2D3436',
  },
  inputError: {
    borderColor: '#F44336',
  },
  errorMessage: {
    color: '#F44336',
    fontSize: 14,
    marginTop: 5,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 10,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    padding: 15,
  },
  calculateButton: {
    backgroundColor: '#4CAF50',
  },
  clearButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  resultContainer: {
    marginTop: 20,
    backgroundColor: '#E3F2FD',
    borderRadius: 10,
    padding: 15,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1565C0',
    textAlign: 'center',
    marginBottom: 15,
  },
  resultGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  resultCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    elevation: 2,
  },
  resultCardLabel: {
    color: '#607D8B',
    fontSize: 14,
    fontWeight: '500',
  },
  resultCardValue: {
    color: '#37474F',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 5,
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ECEFF1',
  },
  resultLabel: {
    color: '#546E7A',
    fontSize: 16,
  },
  resultValue: {
    color: '#37474F',
    fontSize: 16,
    fontWeight: '500',
  },
  resultTotal: {
    backgroundColor: '#1565C0',
    borderRadius: 8,
    padding: 15,
    marginVertical: 15,
  },
  resultTotalLabel: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  resultTotalValue: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 5,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#4CAF50',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  modalTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalContent: {
    padding: 20,
  },
  instructionItem: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 20,
  },
  instructionText: {
    flex: 1,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  instructionDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  tipBox: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#FFF8E1',
    borderRadius: 8,
    padding: 15,
    marginTop: 15,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default CalculadoraCombustivel;
