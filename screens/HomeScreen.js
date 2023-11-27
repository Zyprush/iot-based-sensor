import React, { useState, useEffect } from 'react';
import { KeyboardAvoidingView, StyleSheet, Text, TouchableOpacity, View, Dimensions, Button, Modal, TextInput } from 'react-native';
import { auth, database } from '../firebase';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

const currentUser = auth.currentUser;

const fetchDeviceAddress = async () => {
  try {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const userEmail = currentUser.email.replace('.', '_');
      const userAddressRef = database.ref(`users/${userEmail}/address_number`);
      const snapshot = await userAddressRef.once('value');
      const deviceAddress = snapshot.val();

      if (deviceAddress) {
        return deviceAddress;
      } else {
        //console.error('No address number found for the user.');
        return '00000000'; // Return a default value if address not found
      }
    } else {
      //console.error('No user is currently authenticated.');
      return '00000000'; // Return a default value if no user is authenticated
    }
  } catch (error) {
    //console.error('Error fetching device address:', error);
    return '00000000'; // Return a default value in case of an error
  }
};


const Tab = createBottomTabNavigator();

const TemperatureScreen = () => {
  const [temperature, setTemperature] = useState(null);
  const [conditionMessage, setConditionMessage] = useState('Loading...');
  const [dailyAverages, setDailyAverages] = useState([0, 0, 0, 0, 0, 0, 0]); // Initialize daily averages
  const [deviceAddress, setDeviceAddress] = useState('00000000');

  useEffect(() => {
    const fetchDeviceAddressAndUpdateState = async () => {
      const address = await fetchDeviceAddress();
      setDeviceAddress(address);
    };

    fetchDeviceAddressAndUpdateState();
  }, []);

  const data = {
    labels: ['Sun','Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    datasets: [
      {
        data: dailyAverages, // Use daily averages for the line chart data
        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        strokeWidth: 3,
      },
    ],
  };

  const chartConfig = {
    backgroundGradientFrom: 'dodgerblue',
    backgroundGradientTo: 'dodgerblue',
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  };

  useEffect(() => {
    if (deviceAddress !== '00000000') {
      const temperatureRef = database.ref(`/sensorData/temperature-${deviceAddress}/temperature-${deviceAddress}`);
      temperatureRef.on('value', (snapshot) => {
        const temperatureValue = snapshot.val();
        setTemperature(temperatureValue);
  
        // Check temperature conditions based on the current temperature value
        if (temperatureValue !== null) {
          if (temperatureValue >= 30 && temperatureValue <= 32) {
            setConditionMessage('Optimal (Growth)');
          } else if (temperatureValue >= 27 && temperatureValue < 30) {
            setConditionMessage('Acceptable');
          } else if (temperatureValue >= 20 && temperatureValue < 27) {
            setConditionMessage('Suboptimal');
          } else if (temperatureValue < 20) {
            setConditionMessage('Too Cold');
          } else {
            setConditionMessage('Too Hot');
          }
        }
      });
  
      return () => temperatureRef.off('value'); // Cleanup Firebase listener
    } else {
      setTemperature('0');
      setConditionMessage('No Device ID')
    }
  }, [deviceAddress]);

  useEffect(() => {
    if (deviceAddress !== '00000000') {
      const historyRef = database.ref(`/sensorData/temperature-${deviceAddress}s`);
    
      historyRef.on('value', (snapshot) => {
        const data = snapshot.val();
        const dailyTemperatures = {};
    
        // Loop through the data and organize temperatures by day
        for (const key in data) {
          const timestamp = key.split('_')[0]; // Extract the date part
          const utcTimestamp = new Date(timestamp); // Create a Date object using the provided timestamp
          const manilaTimestamp = new Date(utcTimestamp.getTime() + 8 * 60 * 60 * 1000); // Convert UTC time to Manila time (UTC+8)
          
          const date = manilaTimestamp.getDay(); // Get the day of the week in Manila time (0-6)
    
          if (!(date in dailyTemperatures)) {
            dailyTemperatures[date] = [];
          }
    
          dailyTemperatures[date].push(parseFloat(data[key])); // Store temperatures by day
        }
    
        // Calculate daily averages
        const averages = [0, 0, 0, 0, 0, 0, 0];
        for (const day in dailyTemperatures) {
          const temperatures = dailyTemperatures[day];
          if (temperatures.length > 0) {
            const average = temperatures.reduce((acc, val) => acc + val, 0) / temperatures.length;
            averages[day] = average;
          }
        }
    
        setDailyAverages(averages); // Update daily averages state
      });
    
      return () => historyRef.off('value'); // Cleanup Firebase listener for history
    }
  }, [deviceAddress]);
  
  return (
    <View style={styles.container}>
      {/* Top Container */}
      <View style={styles.topContainer}>
        <Ionicons name="md-thermometer" size={100} color="dodgerblue" />
        <View>
          <Text style={styles.textReading}>
            {temperature !== null ? temperature + ' °C' : 'Loading...'}
          </Text>
          <Text style={styles.textCondition}>Condition: {conditionMessage}</Text>
        </View>
      </View>

      {/* Bottom Container */}
      <View style={styles.bottomContainer}>
        {/* for graph */}
        <View style={styles.containerGraph}>
          <View>
            <LineChart
              data={data}
              width={screenWidth}
              height={250}
              chartConfig={chartConfig}
            />
          </View>
        </View>
      </View>
    </View>
  );
};


const PhSensorScreen = () => {
  const [ph, setPh] = useState(null);
  const [conditionMessage, setConditionMessage] = useState('Loading...');
  const [dailyAverages, setDailyAverages] = useState([0, 0, 0, 0, 0, 0, 0]); // Initialize daily averages
  const [deviceAddress, setDeviceAddress] = useState('00000000');

  useEffect(() => {
    const fetchDeviceAddressAndUpdateState = async () => {
      const address = await fetchDeviceAddress();
      setDeviceAddress(address);
    };

    fetchDeviceAddressAndUpdateState();
  }, []);

  const data = {
    labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    datasets: [
      {
        data: dailyAverages, // Use daily averages for the line chart data
        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        strokeWidth: 3,
      },
    ],
  };

  const chartConfig = {
    backgroundGradientFrom: 'dodgerblue',
    backgroundGradientTo: 'dodgerblue',
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  };

  useEffect(() => {
    if (deviceAddress !== '00000000') {
      const phRef = database.ref(`/sensorData/pH-${deviceAddress}/pH-${deviceAddress}`);
  
      phRef.on('value', (snapshot) => {
        const phValue = snapshot.val();
        setPh(phValue);
  
        // Check pH conditions based on the current pH value
        if (phValue !== null) {
          if (phValue >= 8 && phValue <= 9) {
            setConditionMessage('Optimal');
          } else if (phValue >= 6 && phValue < 8) {
            setConditionMessage('Acceptable');
          } else if (phValue >= 5 && phValue < 6) {
            setConditionMessage('Caution');
          } else if (phValue >= 4 && phValue < 5) {
            setConditionMessage('Alert');
          } else if (phValue < 4) {
            setConditionMessage('Fatal');
          } else {
            setConditionMessage('Not Suitable');
          }
        }
      });
  
      return () => phRef.off('value'); // Cleanup Firebase listener for real-time pH data
    } else {
      setPh('0');
      setConditionMessage('No device ID.')
    }
  }, [deviceAddress]);

  useEffect(() => {
    if (deviceAddress !== '00000000') {
      const historyRef = database.ref(`/sensorData/pH-${deviceAddress}s`);
  
      historyRef.on('value', (snapshot) => {
        const data = snapshot.val();
        const dailyPhValues = {};
  
        // Loop through the data and organize pH values by day
        for (const key in data) {
          const timestamp = key.split('_')[0]; // Extract the date part
          const utcTimestamp = new Date(timestamp); // Create a Date object using the provided timestamp
          const manilaTimestamp = new Date(utcTimestamp.getTime() + 8 * 60 * 60 * 1000); // Convert UTC time to Manila time (UTC+8)
  
          const day = manilaTimestamp.getDay(); // Get the day of the week in Manila time (0-6)
  
          if (!(day in dailyPhValues)) {
            dailyPhValues[day] = [];
          }
  
          dailyPhValues[day].push(parseFloat(data[key])); // Store pH values by day
        }
  
        // Calculate daily pH averages
        const averages = [0, 0, 0, 0, 0, 0, 0];
        for (const day in dailyPhValues) {
          const phValues = dailyPhValues[day];
          if (phValues.length > 0) {
            const average = phValues.reduce((acc, val) => acc + val, 0) / phValues.length;
            averages[day] = average;
          }
        }
  
        setDailyAverages(averages); // Update daily pH averages state
      });
  
      return () => historyRef.off('value'); // Cleanup Firebase listener for pH history
    }
  }, [deviceAddress]);

  return (
    <View style={styles.container}>
      {/* Top Container */}
      <View style={styles.topContainer}>
        <Ionicons name="md-water" size={100} color="dodgerblue" />
        <View>
          <Text style={styles.textReading}>
            {ph !== null ? ph + ' pH' : 'Loading...'}
          </Text>
          <Text style={styles.textCondition}>Condition: {conditionMessage}</Text>
        </View>
      </View>

      {/* Bottom Container */}
      <View style={styles.bottomContainer}>
        {/* for graph */}
        <View style={styles.containerGraph}>
          <View>
            <LineChart
              data={data}
              width={screenWidth}
              height={250}
              chartConfig={chartConfig}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

const TurbidityScreen = () => {
  const [turbidity, setTurbidity] = useState(null);
  const [conditionMessage, setConditionMessage] = useState('Loading...');
  const [dailyAverages, setDailyAverages] = useState([0, 0, 0, 0, 0, 0, 0]); // Initialize daily averages
  const [deviceAddress, setDeviceAddress] = useState('00000000'); // Initial value

  useEffect(() => {
    const fetchDeviceAddressAndUpdateState = async () => {
      const address = await fetchDeviceAddress();
      setDeviceAddress(address);
    };

    fetchDeviceAddressAndUpdateState();
  }, []);

  const data = {
    labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    datasets: [
      {
        data: dailyAverages, // Use daily averages for the line chart data
        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        strokeWidth: 3,
      },
    ],
  };

  const chartConfig = {
    backgroundGradientFrom: 'dodgerblue',
    backgroundGradientTo: 'dodgerblue',
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  };

  useEffect(() => {
    if (deviceAddress !== '00000000') {
      const turbidityRef = database.ref(`/sensorData/turbidity-${deviceAddress}/turbidity-${deviceAddress}`);
  
      turbidityRef.on('value', (snapshot) => {
        const turbidityValue = snapshot.val();
        setTurbidity(turbidityValue);
  
        // Check turbidity conditions based on the current turbidity value
        if (turbidityValue !== null) {
          if (turbidityValue >= 10 && turbidityValue <= 20) {
            setConditionMessage('Optimal (Growth)');
          } else if (turbidityValue >= 5 && turbidityValue < 10) {
            setConditionMessage('Acceptable');
          } else if (turbidityValue >= 1 && turbidityValue < 5) {
            setConditionMessage('Suboptimal');
          } else if (turbidityValue <= 1) {
            setConditionMessage('Too Clear');
          } else {
            setConditionMessage('Too Cloudy');
          }
        }
      });
  
      return () => turbidityRef.off('value'); // Cleanup Firebase listener for real-time turbidity data
    } else {
      setTurbidity('0');
      setConditionMessage('No device ID.')
    }
  }, [deviceAddress]);

  useEffect(() => {
    if (deviceAddress !== '00000000') {
      const historyRef = database.ref(`/sensorData/turbidity-${deviceAddress}s`);
  
      historyRef.on('value', (snapshot) => {
        const data = snapshot.val();
        const dailyTurbidityValues = {};
  
        // Loop through the data and organize turbidity values by day
        for (const key in data) {
          const timestamp = key.split('_')[0]; // Extract the date part
          const utcTimestamp = new Date(timestamp); // Create a Date object using the provided timestamp
          const manilaTimestamp = new Date(utcTimestamp.getTime() + 8 * 60 * 60 * 1000); // Convert UTC time to Manila time (UTC+8)
  
          const day = manilaTimestamp.getDay(); // Get the day of the week in Manila time (0-6)
  
          if (!(day in dailyTurbidityValues)) {
            dailyTurbidityValues[day] = [];
          }
  
          dailyTurbidityValues[day].push(parseFloat(data[key])); // Store turbidity values by day
        }
  
        // Calculate daily turbidity averages
        const averages = [0, 0, 0, 0, 0, 0, 0];
        for (const day in dailyTurbidityValues) {
          const turbidityValues = dailyTurbidityValues[day];
          if (turbidityValues.length > 0) {
            const average = turbidityValues.reduce((acc, val) => acc + val, 0) / turbidityValues.length;
            averages[day] = average;
          }
        }
  
        setDailyAverages(averages); // Update daily turbidity averages state
      });
  
      return () => historyRef.off('value'); // Cleanup Firebase listener for turbidity history
    }
  }, [deviceAddress]);

  return (
    <View style={styles.container}>
      {/* Top Container */}
      <View style={styles.topContainer}>
        <Ionicons name="md-thermometer" size={100} color="dodgerblue" />
        <View>
          <Text style={styles.textReading}>
            {turbidity !== null ? turbidity + ' °C' : 'Loading...'}
          </Text>
          <Text style={styles.textCondition}>Condition: {conditionMessage}</Text>
        </View>
      </View>

      {/* Bottom Container */}
      <View style={styles.bottomContainer}>
        {/* for graph */}
        <View style={styles.containerGraph}>
          <View>
            <LineChart
              data={data}
              width={screenWidth}
              height={250}
              chartConfig={chartConfig}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

const EditDeviceAddressModal = ({ visible, onClose, onSave, currentAddress  }) => {
  const [address, setAddress] = useState(currentAddress || '');

  const handleSave = () => {
    if (address.length === 8) {
      onSave(address, () => onClose()); // Pass address and close function to onSave
    } else {
      alert('Please enter a valid 8-digit address.');
    }
  };
  
  return (
    <Modal visible={visible} animationType="slide">
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{color: 'dodgerblue', fontSize: 25, marginBottom: 10,fontWeight: 'bold'}}>Enter Device ID:</Text>
        <TextInput
          style={{ borderWidth: 1, borderColor: 'gray', padding: 10, marginTop: 10, width: '80%', fontSize: 20}}
          placeholder="Enter 8-digit address"
          onChangeText={setAddress}
          value={address}
          keyboardType="numeric"
          maxLength={8}
        />
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={onClose}>
          <Text style={styles.buttonText1}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const SettingsScreen = ({ navigation }) => {
  const handleSignOut = () => {
    auth
      .signOut()
      .then(() => {
        navigation.replace('Login');
      })
      .catch((error) => alert(error.message));
  };

  const [modalVisible, setModalVisible] = useState(false);
  const [currentAddress, setCurrentAddress] = useState('');

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const userEmail = currentUser.email.replace('.', '_');
      const userAddressRef = database.ref(`users/${userEmail}/address_number`);

      userAddressRef.once('value', (snapshot) => {
        const addressData = snapshot.val();
        if (addressData) {
          setCurrentAddress(addressData); // Set the current address if it exists
        }
      });
    }
  }, []);

  const handleSaveAddress = (address, closeModal) => {
    const currentUser = auth.currentUser;

    if (currentUser) {
      const userEmail = currentUser.email.replace('.', '_');
      const userAddressRef = database.ref(`users/${userEmail}/address_number`);
      
      const serializedAddress = address.toString();

      userAddressRef.set(serializedAddress)
        .then(() => {
          //console.log('Address saved successfully:', serializedAddress);
          fetchDeviceAddress();
          closeModal(); // Close the modal after successful save
        })
        .catch((error) => {
          //console.error('Error saving address:', error);
        });
    } else {
      //console.error('No user is currently authenticated.');
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      {/*<Text style={styles.profileText}>Email: {auth.currentUser?.email}</Text>*/}
      <View style={styles.topContainer}>
        <Ionicons name="person-circle-outline" size={160} color="dodgerblue" />
      </View>
      <View style={styles.bottomContainer}>

        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.buttonText2}>Edit Device ID</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.profileButton}>
          <Text style={styles.buttonText2}>{auth.currentUser?.email}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleSignOut} style={styles.logoutButton}>
          <Text style={styles.buttonText1}>Logout</Text>
        </TouchableOpacity>

      </View>

      {/* Modal for editing device address */}
      <EditDeviceAddressModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveAddress}
        currentAddress={currentAddress}
      />
      
    </KeyboardAvoidingView>
  );
};

const HomeScreen = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Temperature') {
            iconName = focused ? 'thermometer' : 'thermometer-outline';
          } else if (route.name === 'PhSensor') {
            iconName = focused ? 'water' : 'water-outline';
          } else if (route.name === 'Turbidity') {
            iconName = focused ? 'ios-speedometer' : 'ios-speedometer-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          // Return the icon component
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Temperature" component={TemperatureScreen} />
      <Tab.Screen name="PhSensor" component={PhSensorScreen} />
      <Tab.Screen name="Turbidity" component={TurbidityScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  button: {
    backgroundColor: '#0782F9',
    width: '60%',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 40,
  },
  buttonText1: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  buttonText2: {
    color: 'dodgerblue',
    fontWeight: '700',
    fontSize: 16,
  },
  profileText: {
    fontSize: 24,
    color: 'dodgerblue',
    marginBottom: 20,
  },
  profileButton: {
    backgroundColor: 'white',
    width: '80%',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  saveButton: {
    marginTop: 50,
    backgroundColor: 'dodgerblue',
    width: '80%',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: 'tomato', 
    width: '80%',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  tabscreen: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: 'dodgerblue',
  },
  textOnTab: {
    color: 'white',
    fontSize: 26,
  },
  topContainer: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  bottomContainer: {
    flex: 2,
    backgroundColor: 'dodgerblue',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textReading: {
    fontSize: 50,
    color: 'dodgerblue',
    fontWeight: "bold",
  },
  textCondition: {
    fontSize: 20,
    fontWeight: '500'
  },
  containerSettings: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
  },
  containerGraph: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'dodgerblue',
    color: 16,
  },
});
