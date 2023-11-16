
import React, { useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Animated } from 'react-native';
import palette from '../utils/palette';

const SplashScreen = ({navigation}) => {
  const logoAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(logoAnimation, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      navigation.navigate('TabsNavigator');
    }, 500);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoContainer, { opacity: logoAnimation }]}>
        <Image source={require('../../assets/metronome.png')} style={styles.logo} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 200,
    height: 200,
  },
});

export default SplashScreen;
