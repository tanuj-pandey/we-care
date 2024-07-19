import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, TextInput, ScrollView } from 'react-native';
import { Camera } from 'expo-camera';
import * as FaceDetector from 'expo-face-detector';

const FaceDetection = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [faces, setFaces] = useState([]);
  const [faceTags, setFaceTags] = useState({});

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleFacesDetected = ({ faces }) => {
    setFaces(faces);
  };

  const handleTagChange = (faceId, field, value) => {
    setFaceTags(prevState => ({
      ...prevState,
      [faceId]: {
        ...prevState[faceId],
        [field]: value
      }
    }));
  };

  const sendFaceDataToAPI = async () => {
    const faceData = faces.map(face => ({
      bounds: face.bounds,
      name: faceTags[face.faceID]?.name || '',
      relationship: faceTags[face.faceID]?.relationship || '',
    }));

    try {
      const response = await fetch('https://your-api-endpoint.com/faces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ faces: faceData }),
      });
      const result = await response.json();
      console.log('API response:', result);
    } catch (error) {
      console.error('Error sending face data to API:', error);
    }
  };

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <Camera
        style={styles.camera}
        type={Camera.Constants.Type.front}
        onFacesDetected={handleFacesDetected}
        faceDetectorSettings={{
          mode: FaceDetector.Constants.Mode.fast,
          detectLandmarks: FaceDetector.Constants.Landmarks.all,
          runClassifications: FaceDetector.Constants.Classifications.all,
        }}
      />
      <ScrollView style={styles.taggingContainer}>
        {faces.map((face, index) => (
          <View key={face.faceID} style={styles.faceBox}>
            <Text>Face {index + 1}</Text>
            <Text>Bounds: {JSON.stringify(face.bounds)}</Text>
            <TextInput
              style={styles.input}
              placeholder="Name"
              value={faceTags[face.faceID]?.name || ''}
              onChangeText={(text) => handleTagChange(face.faceID, 'name', text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Relationship"
              value={faceTags[face.faceID]?.relationship || ''}
              onChangeText={(text) => handleTagChange(face.faceID, 'relationship', text)}
            />
          </View>
        ))}
        <Button title="Send Data" onPress={sendFaceDataToAPI} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  camera: {
    flex: 1,
  },
  taggingContainer: {
    flex: 1,
    padding: 10,
  },
  faceBox: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 5,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 10,
    padding: 5,
  },
});

export default FaceDetection;
