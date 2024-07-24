import React, {useEffect} from 'react';
import {View, ActivityIndicator} from 'react-native';
import Sound from 'react-native-sound';
import CameraScreen from '../../components/CameraScreen';

Sound.setCategory('Playback');

const App = () => {
  useEffect(() => {
    const sound = new Sound(
      'tiraqueeuvoucagar.mp3',
      Sound.MAIN_BUNDLE,
      error => {
        if (error) {
          console.log('Failed to load the sound', error);
          return;
        }
        sound.setVolume(1.0);
        sound.play(success => {
          if (success) {
            console.log('Successfully finished playing');
          } else {
            console.log('Playback failed due to audio decoding errors');
          }
        });
      },
    );

    return () => {
      sound.release();
    };
  }, []);

  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <ActivityIndicator size="large" color="#8A19D6" />
      <CameraScreen />
    </View>
  );
};

export default App;
