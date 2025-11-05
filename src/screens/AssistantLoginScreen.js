import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { styles } from '../styles/LoginScreen.styles';
import { useUser } from '../contexts/UserContext';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { error as logError } from '../utils/logger';
import CryptoJS from 'crypto-js';

const AssistantLoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser } = useUser();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกอีเมลและรหัสผ่าน');
      return;
    }

    setLoading(true);
    try {
      console.log('🔑 กำลังเข้าสู่ระบบสำหรับผู้ช่วย:', email);
      
      // ตรวจสอบจาก collection 'assistants' ก่อน
      const assistantRef = doc(db, 'assistants', email);
      const assistantSnap = await getDoc(assistantRef);
      
      if (!assistantSnap.exists()) {
        Alert.alert(
          'ไม่พบบัญชีผู้ช่วย',
          'ไม่พบบัญชีผู้ช่วยที่มีอีเมลนี้ กรุณาติดต่อเจ้าของฟาร์มเพื่อเพิ่มบัญชีผู้ช่วย'
        );
        setLoading(false);
        return;
      }

      const assistantData = assistantSnap.data();
      
      // ตรวจสอบสถานะการใช้งาน
      if (!assistantData.isActive) {
        Alert.alert('บัญชีถูกปิดใช้งาน', 'บัญชีผู้ช่วยนี้ถูกปิดใช้งาน กรุณาติดต่อเจ้าของฟาร์ม');
        setLoading(false);
        return;
      }

      // ตรวจสอบรหัสผ่าน
      const hashedPassword = CryptoJS.SHA256(password).toString();
      if (assistantData.hashedPassword !== hashedPassword) {
        Alert.alert('เข้าสู่ระบบไม่สำเร็จ', 'รหัสผ่านไม่ถูกต้อง');
        setLoading(false);
        return;
      }

      // เข้าสู่ระบบด้วย Firebase Auth
      await signInWithEmailAndPassword(auth, email, password);
      
      console.log('✅ เข้าสู่ระบบผู้ช่วยสำเร็จ');
      
      // บันทึกข้อมูลผู้ใช้ใน Context
      setUser({
        uid: assistantData.uid,
        email: assistantData.email,
        displayName: assistantData.name,
        name: assistantData.name,
        role: assistantData.role,
        ownerId: assistantData.ownerId,
        ownerFarmName: assistantData.ownerFarmName,
        profileImage: assistantData.profileImage, // เพิ่มรูปโปรไฟล์
        isAssistant: true // ระบุว่าเป็นผู้ช่วย
      });
      
      Alert.alert(
        'เข้าสู่ระบบสำเร็จ!',
        `ยินดีต้อนรับ ${assistantData.name}\nผู้ช่วยฟาร์ม: ${assistantData.ownerFarmName}`,
        [{ text: 'ตกลง', onPress: () => navigation.replace('Main') }]
      );
      
    } catch (error) {
      logError('❌ เข้าสู่ระบบผู้ช่วยไม่สำเร็จ:', error);
      
      let errorMessage = error.message;
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'ไม่พบบัญชีผู้ใช้นี้';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'รหัสผ่านไม่ถูกต้อง';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'รูปแบบอีเมลไม่ถูกต้อง';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'พยายามเข้าสู่ระบบหลายครั้งเกินไป กรุณารอสักครู่';
      }
      
      Alert.alert('เข้าสู่ระบบไม่สำเร็จ', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ผู้ช่วยฟาร์ม - เข้าสู่ระบบ</Text>
      <Text style={styles.subtitle}>สำหรับผู้ช่วยที่ได้รับการแต่งตั้งจากเจ้าของฟาร์ม</Text>
      
      <TextInput
        placeholder="อีเมล"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
      />
      <TextInput
        placeholder="รหัสผ่าน"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />
      
      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={handleLogin} 
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
        </Text>
      </TouchableOpacity>
      
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text style={styles.loadingText}>กำลังตรวจสอบข้อมูลผู้ช่วย...</Text>
        </View>
      )}
      
      <TouchableOpacity 
        onPress={() => navigation.navigate('Login')}
        style={styles.linkButton}
      >
        <Text style={styles.linkText}>เจ้าของฟาร์ม? เข้าสู่ระบบที่นี่</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AssistantLoginScreen;
