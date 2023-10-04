import React, { useState, useEffect } from 'react';
import { KeyboardAvoidingView, StyleSheet, Text, TouchableOpacity, View, Dimensions } from 'react-native';
import { auth, database } from '../firebase';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

const Tab = createBottomTabNavigator();

const TemperatureScreen = () => {
  const [temperature, setTemperature] = useState(null);
  const [conditionMessage, setConditionMessage] = useState('Loading...');

  const data = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: [29.63, 30, 60, 20, 30, 30, 20],
        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        strokeWidth: 3,
      },
    ],
  };

  const chartConfig = {
    backgroundGradientFrom: 'dodgerblue',
    backgroundGradientTo: 'dodgerblue',
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`
  };

  useEffect(() => {
    const temperatureRef = database.ref('/sensorData/temperatureValue');
    const temperaturesRef = database.ref('/sensorData/temperatureValues');

    temperatureRef.on('value', (snapshot) => {
      const temperatureValue = snapshot.val();
      setTemperature(temperatureValue);

      // Check temperature conditions and set the condition message accordingly
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

    });

    // Clean up the Firebase listener when the component unmounts
    return () => temperatureRef.off('value');
  }, []);

  return (
    <View style={styles.container}>
      {/* Top Container */}
      <View style={styles.topContainer}>
        <Ionicons name="md-thermometer" size={100} color="dodgerblue" />
        <View>
          <Text  style={styles.textReading}>
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
  const [ph, setph] = useState(null);
  const [conditionMessage, setConditionMessage] = useState('Loading...');

  const data = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: [2, 7, 9, 7, 3, 5, 2],
        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        strokeWidth: 3,
      },
    ],
  };

  const chartConfig = {
    backgroundGradientFrom: 'dodgerblue',
    backgroundGradientTo: 'dodgerblue',
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`
  };

  useEffect(() => {
    const phRef = database.ref('/sensorData/phValue');

    phRef.on('value', (snapshot) => {
      const phValue = snapshot.val();
      setph(phValue);

      // Check pH conditions and set the condition message accordingly
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
    });

    // Clean up the Firebase listener when the component unmounts
    return () => phRef.off('value');
  }, []);
  
  return (

  <View style={styles.container}>
    <View style={styles.topContainer}>
        <Ionicons name="md-water" size={100} color="dodgerblue" />
        <View>
          <Text  style={styles.textReading}>
          {ph !== null ? ph + ' pH' : 'Loading...'}
          </Text> 
          <Text style={styles.textCondition}>Condition: {conditionMessage}</Text>
        </View>
    </View>
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
  const [turbidity, setturbidity] = useState(null);
  const [conditionMessage, setConditionMessage] = useState('Loading...');

  const data = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: [20, 10, 5, 40, 30, 5, 20],
        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        strokeWidth: 3,
      },
    ],
  };

  const chartConfig = {
    backgroundGradientFrom: 'dodgerblue',
    backgroundGradientTo: 'dodgerblue',
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`
  };

  useEffect(() => {
    const turbidityRef = database.ref('/sensorData/turbidityValue');

    turbidityRef.on('value', (snapshot) => {
      const turbidityValue = snapshot.val();
      setturbidity(turbidityValue);

      // Check turbidity conditions and set the condition message accordingly
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

    });

    // Clean up the Firebase listener when the component unmounts
    return () => turbidityRef.off('value');
  }, []);
  
  return (

  <View style={styles.container}>
    <View style={styles.topContainer}>
        <Ionicons name="md-thermometer" size={100} color="dodgerblue" />
        <View>
          <Text  style={styles.textReading}>
          {turbidity !== null ? turbidity + ' °C' : 'Loading...'}
          </Text> 
          <Text style={styles.textCondition}>Condition: {conditionMessage}</Text>
        </View>
    </View>
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

const SettingsScreen = ({ navigation }) => {
  const handleSignOut = () => {
    auth
      .signOut()
      .then(() => {
        navigation.replace('Login');
      })
      .catch((error) => alert(error.message));
  };

  return (
    <KeyboardAvoidingView style={styles.containerSettings} behavior="padding">
      {/*<Text style={styles.profileText}>Email: {auth.currentUser?.email}</Text>*/}
      <TouchableOpacity style={styles.profileButton}>
        <Text style={styles.buttonText}>Edit Profile</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.profileButton}>
        <Text style={styles.buttonText}>Settings</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleSignOut} style={styles.logoutButton}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
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
  buttonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  profileText: {
    fontSize: 24,
    color: 'dodgerblue',
    marginBottom: 20,
  },
  profileButton: {
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
