import React, {useEffect, useRef, useState} from 'react';
import {View, StyleSheet} from 'react-native';
import {Text} from 'react-native-svg';
import {Camera, useCameraDevice} from 'react-native-vision-camera';
import storage from '@react-native-firebase/storage';

const CameraScreen = () => {
  const cameraRef = useRef<Camera>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const device = useCameraDevice('front');

  useEffect(() => {
    const requestPermission = async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === 'granted');
    };

    requestPermission();
  }, []);

  useEffect(() => {
    const takePhoto = async () => {
      if (cameraRef.current && hasPermission && cameraReady) {
        try {
          const photo = await cameraRef.current.takePhoto();
          console.log('Photo taken:', photo);

          const uploadPhoto = async () => {
            try {
              const reference = storage().ref(`photos/${Date.now()}.jpg`);
              await reference.putFile(photo.path);
              const url = await reference.getDownloadURL();
              console.log('Photo uploaded to Firebase Storage:', url);
            } catch (error) {
              console.error('Error uploading photo:', error);
            }
          };

          await uploadPhoto();
        } catch (error) {
          console.error('Error taking photo:', error);
        }
      }
    };

    if (hasPermission && device) {
      takePhoto();
    }
  }, [hasPermission, device, cameraReady]);

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <Text>No access to camera</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {device && (
        <Camera
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={true}
          photo={true}
          onInitialized={() => setCameraReady(true)} // Atualize o estado quando a câmera estiver pronta
          onError={error => console.error('Camera error:', error)} // Lide com erros da câmera
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default CameraScreen;
