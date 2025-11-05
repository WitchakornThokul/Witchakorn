import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { styles } from '../styles/HomeScreen.styles';

const HomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Image 
        source={require('../../assets/cow-icon.jpg')}
        style={styles.logo}
        resizeMode="cover"
      />
      <Text style={styles.appName}>Smart cow tracker</Text>
      <TouchableOpacity 
        style={[styles.button, { marginBottom: 12 }]}
        onPress={() => navigation.navigate('FarmOverview')}
      >
        <Text style={styles.buttonText}>ดูภาพรวมฟาร์มทั้งหมด</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={styles.buttonText}>เข้าสู่ระบบ</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.button}
        onPress={() => navigation.navigate('Registration')}
      >
        <Text style={styles.buttonText}>สมัครสมาชิก (เจ้าของฟาร์ม)</Text>
      </TouchableOpacity>
    </View>
  );
};

export default HomeScreen;
