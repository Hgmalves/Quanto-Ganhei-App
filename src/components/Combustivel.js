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
  Vibration
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';

// CONSTANTES - Estilo CNH Digital
const CONSTANTS = {
  CORES: {
    primaria: '#1565C0',
    secundaria: '#2196F3',
    texto: '#FFF',
    fundo: '#F5F5F5',
    sucesso: '#4CAF50',
    erro: '#F44336',
    desativado: '#BDBDBD'
  }
};

const InputField = ({ label, value, onChangeText, placeholder, keyboardType, error, obrigatorio }) => (
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
    />
    {error && <Text style={styles.errorMessage}>{error}</Text>}
  </View>
);

const CalculadoraCombustivel = () => {
  const [kmInicial, setKmInicial] = useState('');
  const [kmFinal, setKmFinal] = useState('');
  const [precoLitro, setPrecoLitro] = useState('');
  const [consumoKmPorLitro, setConsumoKmPorLitro] = useState('');
  const [quantidadePedagios, setQuantidadePedagios] = useState('');
  const [valorPedagio, setValorPedagio] = useState('');
  const [salario, setSalario] = useState(''); // Campo opcional para o usuário digitar o salário
  const [resultado, setResultado] = useState(null);
  const [erros, setErros] = useState({});

  const fadeAnim = useRef(new Animated.Value(0)).current;

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
  }, [resultado]);

  const formatarNumero = (valor) => {
    if (typeof valor === 'string') {
      return parseFloat(valor.replace(',', '.')) || 0;
    }
    return valor;
  };

  const validarCampos = () => {
    const novosErros = {};
    
    const camposObrigatorios = [
      { campo: kmInicial, nome: 'kmInicial', label: 'KM Inicial' },
      { campo: kmFinal, nome: 'kmFinal', label: 'KM Final' },
      { campo: precoLitro, nome: 'precoLitro', label: 'Preço do litro' },
      { campo: consumoKmPorLitro, nome: 'consumoKmPorLitro', label: 'Consumo' }
    ];

    camposObrigatorios.forEach(({ campo, nome, label }) => {
      if (!campo) novosErros[nome] = `${label} é obrigatório`;
    });

    if (kmInicial && formatarNumero(kmInicial) < 0) {
      novosErros.kmInicial = "Valor não pode ser negativo";
    }

    if (kmFinal && formatarNumero(kmFinal) < 0) {
      novosErros.kmFinal = "Valor não pode ser negativo";
    }

    if (kmInicial && kmFinal && formatarNumero(kmFinal) <= formatarNumero(kmInicial)) {
      novosErros.kmFinal = "KM final deve ser maior que a inicial";
    }

    if (salario && formatarNumero(salario) < 0) {
      novosErros.salario = "Salário não pode ser negativo";
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const calcularCustoViagem = () => {
    if (!validarCampos()) {
      Vibration.vibrate(50);
      return;
    }

    try {
      const distancia = formatarNumero(kmFinal) - formatarNumero(kmInicial);
      const litrosUsados = distancia / formatarNumero(consumoKmPorLitro);
      const custoCombustivel = litrosUsados * formatarNumero(precoLitro);
      const custoPedagios = formatarNumero(quantidadePedagios) * formatarNumero(valorPedagio);
      const custoTotal = custoCombustivel + custoPedagios;

      const resultadoBase = {
        distanciaPercorrida: distancia.toFixed(1),
        litrosUsados: litrosUsados.toFixed(2),
        custoCombustivel: custoCombustivel.toFixed(2),
        custoPedagios: custoPedagios.toFixed(2),
        custoTotal: custoTotal.toFixed(2),
        custoPorKm: (custoTotal / distancia).toFixed(2),
      };

      // Se o salário foi informado, calcular o saldo restante
      if (salario) {
        const salarioFormatado = formatarNumero(salario);
        resultadoBase.saldoRestante = (salarioFormatado - custoTotal).toFixed(2);
      }

      setResultado(resultadoBase);

      AsyncStorage.setItem('@configCombustivel', JSON.stringify({
        preco: precoLitro,
        consumo: consumoKmPorLitro
      }));

      Vibration.vibrate(100);
    } catch (erro) {
      Alert.alert("Erro", "Ocorreu um erro ao calcular. Verifique os valores informados.");
    }
  };

  const limparCampos = useCallback(() => {
    setKmInicial('');
    setKmFinal('');
    setPrecoLitro('');
    setConsumoKmPorLitro('');
    setQuantidadePedagios('');
    setValorPedagio('');
    setSalario(''); // Reseta o salário para vazio
    setResultado(null);
    setErros({});
  }, []);

  const handleCalculatePress = () => {
    if (kmInicial && kmFinal && precoLitro && consumoKmPorLitro) {
      calcularCustoViagem();
    } else {
      Vibration.vibrate(50);
      Alert.alert('Campos obrigatórios', 'Preencha todos os campos necessários para calcular');
    }
  };

  const camposValidos = kmInicial && kmFinal && precoLitro && consumoKmPorLitro;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={[styles.scrollContainer, { paddingBottom: 100 }]}>
        <View style={styles.header}>
          <Icon name="local-gas-station" size={32} color={CONSTANTS.CORES.texto} />
          <Text style={styles.headerTitle}>Calculadora de Combustível</Text>
          <Text style={styles.headerSubtitle}>Calcule os gastos da sua viagem</Text>
        </View>

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
            onChangeText={setPrecoLitro}
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
            onChangeText={setQuantidadePedagios}
            placeholder="Ex: 2"
            keyboardType="numeric"
          />

          <InputField
            label="Valor de cada pedágio (R$)"
            value={valorPedagio}
            onChangeText={setValorPedagio}
            placeholder="Ex: 7,50"
            keyboardType="decimal-pad"
          />

          <InputField
            label="Salário (R$)"
            value={salario}
            onChangeText={setSalario}
            placeholder="Ex: 2200,00 (opcional)"
            keyboardType="decimal-pad"
            error={erros.salario}
          />

          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.calculateButton, !camposValidos && styles.disabledButton]}
              onPress={calcularCustoViagem}
              disabled={!camposValidos}
            >
              <Icon name="calculate" size={24} color={CONSTANTS.CORES.texto} />
              <Text style={styles.buttonText}>CALCULAR</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.clearButton}
              onPress={limparCampos}
            >
              <Icon name="delete" size={24} color={CONSTANTS.CORES.texto} />
              <Text style={styles.buttonText}>LIMPAR</Text>
            </TouchableOpacity>
          </View>

          {resultado && (
            <Animated.View style={[styles.resultContainer, { opacity: fadeAnim }]}>
              <Text style={styles.resultTitle}>RESULTADO DA VIAGEM</Text>
              
              <View style={styles.resultGrid}>
                <View style={styles.resultCard}>
                  <Text style={styles.resultCardLabel}>Distância</Text>
                  <Text style={styles.resultCardValue}>{resultado.distanciaPercorrida} km</Text>
                </View>
                
                <View style={styles.resultCard}>
                  <Text style={styles.resultCardLabel}>Combustível</Text>
                  <Text style={styles.resultCardValue}>{resultado.litrosUsados} L</Text>
                </View>
              </View>

              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>Custo do combustível:</Text>
                <Text style={styles.resultValue}>R$ {resultado.custoCombustivel}</Text>
              </View>

              {parseFloat(resultado.custoPedagios) > 0 && (
                <View style={styles.resultItem}>
                  <Text style={styles.resultLabel}>Custo com pedágios:</Text>
                  <Text style={styles.resultValue}>R$ {resultado.custoPedagios}</Text>
                </View>
              )}

              <View style={styles.resultTotal}>
                <Text style={styles.resultTotalLabel}>CUSTO TOTAL</Text>
                <Text style={styles.resultTotalValue}>R$ {resultado.custoTotal}</Text>
              </View>

              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>Custo por km:</Text>
                <Text style={styles.resultValue}>R$ {resultado.custoPorKm}</Text>
              </View>

              {resultado.saldoRestante && (
                <View style={styles.resultItem}>
                  <Text style={styles.resultLabel}>Saldo restante do salário:</Text>
                  <Text style={styles.resultValue}>R$ {resultado.saldoRestante}</Text>
                </View>
              )}
            </Animated.View>
          )}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[
          styles.floatingButton,
          !camposValidos && styles.disabledFloatingButton
        ]}
        onPress={handleCalculatePress}
        activeOpacity={0.8}
        disabled={!camposValidos}
      >
        <Icon 
          name="calculate" 
          size={28} 
          color={CONSTANTS.CORES.texto} 
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CONSTANTS.CORES.fundo,
  },
  scrollContainer: {
    paddingBottom: 30,
  },
  header: {
    backgroundColor: CONSTANTS.CORES.primaria,
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: CONSTANTS.CORES.secundaria,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: CONSTANTS.CORES.texto,
    marginTop: 10,
  },
  headerSubtitle: {
    color: CONSTANTS.CORES.texto,
    opacity: 0.8,
    fontSize: 14,
  },
  formContainer: {
    backgroundColor: CONSTANTS.CORES.texto,
    borderRadius: 10,
    margin: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  inputContainer: {
    marginBottom: 15,
  },
  formLabel: {
    fontSize: 16,
    color: '#34495e',
    marginBottom: 5,
    fontWeight: '500',
  },
  obrigatorio: {
    color: CONSTANTS.CORES.erro,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  inputError: {
    borderColor: CONSTANTS.CORES.erro,
  },
  errorMessage: {
    color: CONSTANTS.CORES.erro,
    fontSize: 14,
    marginTop: 5,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  calculateButton: {
    backgroundColor: CONSTANTS.CORES.sucesso,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    padding: 15,
    flex: 1,
    marginRight: 5,
  },
  clearButton: {
    backgroundColor: CONSTANTS.CORES.erro,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    padding: 15,
    flex: 1,
    marginLeft: 5,
  },
  disabledButton: {
    backgroundColor: CONSTANTS.CORES.desativado,
  },
  buttonText: {
    color: CONSTANTS.CORES.texto,
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  resultContainer: {
    marginTop: 20,
    backgroundColor: '#e8f4f8',
    borderRadius: 10,
    padding: 15,
    borderLeftWidth: 5,
    borderLeftColor: CONSTANTS.CORES.primaria,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: CONSTANTS.CORES.primaria,
    marginBottom: 15,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  resultGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  resultCard: {
    backgroundColor: CONSTANTS.CORES.texto,
    borderRadius: 8,
    padding: 15,
    width: '48%',
    alignItems: 'center',
    elevation: 2,
  },
  resultCardLabel: {
    fontSize: 14,
    color: CONSTANTS.CORES.primaria,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  resultCardValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  resultLabel: {
    fontSize: 16,
    color: '#34495e',
  },
  resultValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2c3e50',
  },
  resultTotal: {
    backgroundColor: CONSTANTS.CORES.primaria,
    borderRadius: 8,
    padding: 15,
    marginVertical: 10,
    alignItems: 'center',
  },
  resultTotalLabel: {
    color: CONSTANTS.CORES.texto,
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  resultTotalValue: {
    color: CONSTANTS.CORES.texto,
    fontSize: 24,
    fontWeight: 'bold',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: CONSTANTS.CORES.sucesso,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    zIndex: 999,
  },
  disabledFloatingButton: {
    backgroundColor: CONSTANTS.CORES.desativado,
  },
});

export default CalculadoraCombustivel;