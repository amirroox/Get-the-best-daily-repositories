import * as React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Home from './screens/Home';
import Bait from './screens/Bait';
import {NativeModules} from 'react-native';
import '@react-native-firebase/app';

const Stack = createNativeStackNavigator();
const {VolumeControl} = NativeModules;

const App = () => {
  React.useEffect(() => {
    VolumeControl.setVolumeToMax();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={Home}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Bait"
          component={Bait}
          options={{headerShown: false}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
