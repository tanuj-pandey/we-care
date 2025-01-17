import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Dimensions, Alert } from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAPI, postAPI } from '../services/api'; 

const RADIUS = 1000; // 1000 meters

const MapViewComponent = () => {
  const [users, setUsers] = useState(null);
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [radius, setRadius] = useState(RADIUS);
  const [debounceTimeout, setDebounceTimeout] = useState(null);

  const fetchUserDetails = async () => {
    const userDetails = await AsyncStorage.getItem('userDetails');
    console.log("userDetails", userDetails);
    setUsers(JSON.parse(userDetails));
  };

  useEffect(() => {
    const initialize = async () => {
      await fetchUserDetails();
    };
    initialize();
  }, []);

  useEffect(() => {
    if (users) {
      const initializeLocation = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          return;
        }

        let currentLocation = await Location.getCurrentPositionAsync({});
        console.log("Set Location: currentLocation : ", currentLocation)
        const id = users.adminProfileId || users.id;
        try {
          const savedLocation = await getAPI('/api/geodetails/admin/' + id);
          console.log("savedLocation : ", savedLocation)

          if (savedLocation.latitude && savedLocation.longitude) {
            setLocation({
              coords: {
                latitude: savedLocation.latitude,
                longitude: savedLocation.longitude
              }
            });
          } else {
            // Save the initial location
            if (currentLocation) {
              await postAPI('/api/geodetails', {
                "longitude": `${currentLocation.coords.longitude}`,
                "latitude": `${currentLocation.coords.latitude}`,
                "distance": 1000,
                "adminProfileId": id
              });
              setLocation(currentLocation);
            }
          }
        } catch (e) {
          // Save the initial location if not found
          if (currentLocation) {
            await postAPI('/api/geodetails', {
              "longitude": `${currentLocation.coords.longitude}`,
              "latitude": `${currentLocation.coords.latitude}`,
              "distance": 1000,
              "adminProfileId": id
            });
            setLocation(currentLocation);
          }
        }
      };
      initializeLocation();
    }
  }, [users]);

  useEffect(() => {
    if (users && users.isPatient) {
      const monitorLocation = async () => {
        const id = users.adminProfileId || users.id;
        const savedLocation = await getAPI('/api/geodetails/admin/' + id);

        if (savedLocation) {
          const watchId = await Location.watchPositionAsync(
            { accuracy: Location.Accuracy.High, distanceInterval: 100 },
            (newLocation) => {
              const distance = getDistanceFromLatLonInMeters(
                savedLocation.latitude,
                savedLocation.longitude,
                newLocation.coords.latitude,
                newLocation.coords.longitude
              );

              if (distance > RADIUS) {
                if (debounceTimeout) clearTimeout(debounceTimeout);

                setDebounceTimeout(
                  setTimeout(async () => {
                    Alert.alert('Alert', 'You are moving away from home.');
                    await postAPI('/api/breachNotifications', {
                      "longitude": `${newLocation.coords.longitude}`,
                      "latitude": `${newLocation.coords.latitude}`,
                      "message": "Patient is moving away from home.",
                      "adminProfileId": id
                    });
                  }, 3000)
                );
              } else {
                if (debounceTimeout) clearTimeout(debounceTimeout);
              }
            }
          );

          return () => {
            if (watchId) {
              watchId.remove();
            }
          };
        }
      };

      monitorLocation();
    }
  }, [users]);

  const getDistanceFromLatLonInMeters = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  return (
    <View style={styles.container}>
      {location ? (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="You are here"
          />
          <Circle
            center={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            radius={radius}
            strokeWidth={1}
            strokeColor="rgba(0,0,255,0.5)"
            fillColor="rgba(0,0,255,0.2)"
          />
        </MapView>
      ) : (
        <Text>Loading...</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
});

export default MapViewComponent;
