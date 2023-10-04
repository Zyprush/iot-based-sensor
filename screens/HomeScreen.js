import { useNavigation } from '@react-navigation/core';
import React, { useState, useEffect } from 'react';
import { KeyboardAvoidingView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { auth, database } from '../firebase';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

const TemperatureScreen = () => {
  const [temperature, setTemperature] = useState(null);
  const [conditionMessage, setConditionMessage] = useState('Loading...');

  useEffect(() => {
    const temperatureRef = database.ref('/sensorData/temperatureValue');

    temperatureRef.on('value', (snapshot) => {
      const temperatureValue = snapshot.val();
      setTemperature(temperatureValue);

      // Check temperature conditions and set the condition message accordingly
      if (temperatureValue >= 36) {
        setConditionMessage('Fatal (Hot)');
      } else if (temperatureValue <= 10) {
        setConditionMessage('Fatal (Cold)');
      } else if (temperatureValue >= 28 && temperatureValue <= 30) {
        setConditionMessage('Optimal');
      } else if (temperatureValue >= 31 && temperatureValue <= 35) {
        setConditionMessage('Alert');
      } else if (temperatureValue >= 21 && temperatureValue <= 27) {
        setConditionMessage('Normal');
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
        
      </View>
    </View>
  );
};

const PhSensorScreen = () => (
  <View style={styles.container}>
    <View style={styles.topContainer}>
      <Ionicons name="md-water" size={100} color="dodgerblue" />
      <View>
        <Text style={styles.textReading}>7 PH</Text>
        <Text style={styles.textCondition}>Normal</Text>
      </View>
    </View>
    <View style={styles.bottomContainer}>
        {/* for graph */}
    </View>
  </View>
);

const TurbidityScreen = () => (
  <View style={styles.container}>
    <View style={styles.topContainer}>
      <Ionicons name="ios-speedometer" size={100} color="dodgerblue" />
      <View>
        <Text style={styles.textReading}>650</Text>
        <Text style={styles.textCondition}>Cloudy</Text>
      </View>
    </View>
    <View style={styles.bottomContainer}>
        {/* for graph */}
    </View>
  </View>
);

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
  }
});
