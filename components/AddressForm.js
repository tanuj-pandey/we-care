// AddressForm.js
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TextInput, View, Button, Alert } from 'react-native';
import { putAPI } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';


const AddressForm = () => {
  const [users, setUsers] = useState(null);
  const [address, setAddress] = useState('');
  const [radius, setRadius] = useState('');

  const fetchUserDetails = async () => {
    const userDetails = await AsyncStorage.getItem('userDetails');
    console.log("userDetails", userDetails);
    setUsers(JSON.parse(userDetails));
  };

  useEffect(() => {
    const initialize = async () => {
        setAddress('GW7F+7P2, Cybercity, Magarpatta, Hadapsar, Pune, Maharashtra 411028');
        setRadius('1000');
        await fetchUserDetails();
    };
    initialize();
  }, []);

  const handleSubmit = async () => {
    if (!address || !radius) {
      Alert.alert('Please fill in both fields.');
      return;
    }

    const data = {
      address,
      radius: parseInt(radius, 10),
    };

    if(address != 'GW7F+7P2, Cybercity, Magarpatta, Hadapsar, Pune, Maharashtra 411028') {
        Alert.alert('Alert', `Patient is moving away from home`);
    }

    try {
      const id = users.adminProfileId || users.id; 
      const response = await putAPI('/api/breachNotifications', {
        "longitude": "18.521441",
        "latitude": "73.937576",
        "adminProfileId": id,
        "message": "Patient is away from home."
      });
    } catch (error) {
      Alert.alert('Error', `Something went wrong: ${error.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Address:</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter address"
        value={address}
        onChangeText={setAddress}
      />

      <Text style={styles.label}>Radius (meters):</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter radius"
        value={radius}
        onChangeText={setRadius}
        keyboardType="numeric"
      />

      <Button title="Save" onPress={handleSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'top',
    padding: 16,
  },
  label: {
    fontSize: 18,
    marginBottom: 8,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 16,
    padding: 8,
    borderRadius: 4,
  },
});

export default AddressForm;
