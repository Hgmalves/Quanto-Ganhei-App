import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

const Combustivel = () => {
  const [litros, setLitros] = useState('');
  const [precoPorLitro, setPrecoPorLitro] = useState('');
  const [custoTotal, setCustoTotal] = useState(0);

  // Função para calcular o custo total
  const calcularCusto = () => {
    const custo = parseFloat(litros) * parseFloat(precoPorLitro);
    setCustoTotal(custo);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Litros de combustível"
        keyboardType="numeric"
        value={litros}
        onChangeText={setLitros}
      />
      <TextInput
        style={styles.input}
        placeholder="Preço por litro"
        keyboardType="numeric"
        value={precoPorLitro}
        onChangeText={setPrecoPorLitro}
      />
      <Button title="Calcular Custo" onPress={calcularCusto} />
      <Text style={styles.textoCusto}>Custo Total: R$ {custoTotal.toFixed(2)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  textoCusto: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default Combustivel;