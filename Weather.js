import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, Alert, FlatList,Modal, TouchableOpacity ,ImageBackground} from 'react-native';
import * as Location from 'expo-location';
import axios from 'axios';

const Weather = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDayInfo, setSelectedDayInfo] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    const apiKey = '93af05ffe0a5b6f4f1e89d1738872e75';

    const requestLocationPermission = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status === 'granted') {
          getLocation();
        } else {
          Alert.alert(
            'Location Access Required',
            'Please grant location access to use this feature.',
            [{ text: 'OK', onPress: () => setIsLoading(false) }]
          );
        }
      } catch (error) {
        console.error('Error requesting location permission:', error.message);
        setIsLoading(false);
      }
    };

    const getLocation = async () => {
      try {
        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;

        // Fetch current weather data using latitude and longitude
        const currentWeatherResponse = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}`
        );

        setWeatherData(currentWeatherResponse.data);

        // Fetch 5-day forecast using latitude and longitude
        const forecastResponse = await axios.get(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}`
        );

        // Extract only the data for the next 5 days
        const nextDaysForecast = forecastResponse.data.list.slice(1, 6);

        console.log('Next 5 days forecast:', nextDaysForecast);
        setForecastData(nextDaysForecast);
        setIsLoading(false);
        // Image.getSize(require('./assets/hand.jpg'), (width, height) => {
        //   console.log('Image Dimensions:', width, height);
        // });
      } catch (error) {
        console.error('Error getting location or weather data:', error);
        setIsLoading(false);
      }
    };

    requestLocationPermission();
  }, []);
  console.log(weatherData);



  const renderForecastItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleDayPress(item)}>
      <View style={styles.forecastItem}>
        <Text style={styles.forecastDate}>{item.dt_txt}</Text>
        <Text style={styles.forecastTemp}>{Math.round(item.main.temp)-273}°C</Text>
      </View>
    </TouchableOpacity>
  );

  const handleDayPress = (dayInfo) => {
    const { visibility, wind, main ,weather} = dayInfo;
    console.log(dayInfo)
  // Now you can access specific properties
    const visibilityValue = visibility;
    const windSpeed = wind.speed;
    const humidity = main.humidity;
    const day=weather[0].description;
    setSelectedDayInfo({ visibility: visibilityValue, wind: windSpeed, humidity,dayVal:day});
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };

  console.log(selectedDayInfo)
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Image source={require('./assets/CLOUD.png')} style={styles.logo} />
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!weatherData || forecastData.length === 0) {
    return <Text>Loading failed</Text>;
  }
  // const weatherCondition = selectedDayInfo.weather[0].main;
  // const weatherDescription = selectedDayInfo.weather[0].description;

// console.log(weatherCondition);
// console.log(weatherDescription);
if (selectedDayInfo) {
  if (selectedDayInfo.dayVal === 'Rain') {
    comment = "It will be rainy";
  } else if (selectedDayInfo.dayVal === 'clear sky') {
    comment = "It will be sunny.";
  } else if (selectedDayInfo.dayVal === 'Mist') {
    comment = "It will be hazy or misty humid conditions";
  } else {
    comment = "It will be hazy or misty humid conditions";
  }
}

  return (
    <ImageBackground
    source={require('./assets/hand.jpg')} // replace with the actual path to your image
    style={styles.backgroundImage}
  >
    <View style={styles.container}>
      <View style={styles.weatherContainer}>
      <Image source={require('./assets/CLOUD.png')} style={styles.logo} />
        <Text style={styles.city}>{weatherData.name}</Text>
        <Text style={styles.temperature}>{Math.round(weatherData.main.temp)-273}°C</Text>
        <Text style={styles.description}>max: {Math.round(weatherData.main.temp_max)-273}°C</Text>
        <Text style={styles.description}>min: {Math.round(weatherData.main.temp_min)-273}°C</Text>
      </View>

      <View style={styles.forecastContainer}>
        <FlatList
          data={forecastData}
          keyExtractor={(item) => item.dt.toString()}
          renderItem={renderForecastItem}
          showsVerticalScrollIndicator={false}
        />
      </View>
      {selectedDayInfo &&(<Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={closeModal}
      >
         <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>{comment}</Text>
          <Text style={styles.modalText}>Visibility: {selectedDayInfo.visibility}</Text>
          <Text style={styles.modalText}>WindSpeed: {selectedDayInfo.wind}</Text>
          <Text style={styles.modalText}>Humidity: {selectedDayInfo.humidity}</Text>
          <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View> 
      </Modal>
      )}
    </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  city: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  temperature: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 18,
  },
  forecastContainer: {
    flex: 1,
    margin: 20,
    padding: 20,
    backgroundColor: '#f8f9fa', // Bootstrap background color
    borderRadius: 8,
  },
  forecastTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
  },
  // forecastItem: {
  //   flexDirection: 'row',
  //   justifyContent: 'space-between',
  //   alignItems: 'center',
  //   paddingVertical: 10,
  //   borderBottomWidth: 1,
  //   borderBottomColor: '#dee2e6', // Bootstrap border color
  // },
  forecastItem: {
    margin: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white', // Darker background color
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalText: {
    fontSize: 18,
    marginBottom: 10,
  },
  closeButton: {
    backgroundColor: '#007bff', // Bootstrap primary color
    padding: 10,
    borderRadius: 8,
    marginTop: 20,
  },
  closeButtonText: {
    color: '#fff', // White text color
    fontSize: 16,
    fontWeight: 'bold',
  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover', // or 'stretch' or 'contain'
    justifyContent: 'center',
  },
  text: {
    color: 'white',
    fontSize: 20,
  },
});

export default Weather;
