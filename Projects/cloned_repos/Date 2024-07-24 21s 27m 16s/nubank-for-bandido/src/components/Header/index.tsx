import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import ProfileIcon from '../../assets/images/icons/profile.svg';
import EmailIcon from '../../assets/images/icons/email.svg';
import EyeClosedIcon from '../../assets/images/icons/eye-close.svg';
import QuestionIcon from '../../assets/images/icons/question.svg';

const Header = () => {
  return (
    <View style={styles.headerContainer}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 30,
        }}>
        <View>
          <ProfileIcon />
        </View>
        <View
          style={{
            flexDirection: 'row',
            gap: 22,
          }}>
          <EyeClosedIcon />
          <QuestionIcon />
          <EmailIcon />
        </View>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>Olá, Moov!</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#8A19D6',
    paddingHorizontal: 15,
    paddingVertical: 60,
    maxHeight: 178,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  textContainer: {
    justifyContent: 'flex-end',
    marginBottom: 15,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Roboto',
  },
});

export default Header;
