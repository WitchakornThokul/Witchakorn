import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { styles } from '../styles/RegistrationScreen.styles';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { useUser } from '../contexts/UserContext';

const RegistrationScreen = ({ navigation }) => {
  const { setUser } = useUser();
  
  // States สำหรับ form ข้อมูลส่วนตัว
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [farmName, setFarmName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  /**
   * ฟังก์ชันจัดการการสมัครสมาชิก
   * ตรวจสอบข้อมูล สร้างบัญชี และบันทึกข้อมูลลง Firestore
   */
  const handleRegister = async () => {
    console.log('กดปุ่มสมัครสมาชิก - บันทึกข้อมูลลง Firebase');
    
    // ตรวจสอบข้อมูล
    if (!name || !surname || !farmName || !email || !password || !confirmPassword) {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('ข้อผิดพลาด', 'รหัสผ่านไม่ตรงกัน');
      return;
    }

    if (password.length < 6) {
      Alert.alert('ข้อผิดพลาด', 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      return;
    }

    setLoading(true);
    try {
      console.log('🔥 เริ่มสมัครสมาชิก Firebase:', email);
      
      // สร้างบัญชีผู้ใช้
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log('✅ สร้างบัญชี Firebase สำเร็จ:', user.uid);
      
      // บันทึกข้อมูลผู้ใช้ใน Firestore (ใช้ email เป็น document ID)
      const userData = {
        uid: user.uid,
        name: name.trim(),
        surname: surname.trim(),
        fullName: `${name.trim()} ${surname.trim()}`,
        farmName: farmName.trim(),
        email: email,
        role: 'เจ้าของฟาร์ม',
        profileImage: '', // รูปโปรไฟล์เริ่มต้นเป็นว่าง
        phone: '', // เบอร์โทรเริ่มต้นเป็นว่าง
        address: '', // ที่อยู่เริ่มต้นเป็นว่าง
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await setDoc(doc(db, 'users', email), userData);
      console.log('✅ บันทึกข้อมูลผู้ใช้ใน Firestore สำเร็จ (Document ID: ' + email + ')');
      
      // บันทึกข้อมูลผู้ใช้ใน UserContext
      setUser({
        uid: user.uid,
        email: user.email,
        displayName: userData.fullName,
        name: userData.name,
        surname: userData.surname,
        farmName: userData.farmName,
        role: userData.role,
        profileImage: userData.profileImage,
        phone: userData.phone,
        address: userData.address
      });
      
      Alert.alert(
        'สมัครสมาชิกสำเร็จ!', 
        'ยินดีต้อนรับเข้าสู่ระบบ Smart Cow Tracker\nเริ่มต้นการจัดการฟาร์มของคุณได้เลย', 
        [{ text: 'ตกลง', onPress: () => navigation.navigate('Main') }]
      );
      
      // ล้างฟอร์ม
      setName('');
      setSurname('');
      setFarmName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      
    } catch (error) {
      console.error('❌ ข้อผิดพลาดในการสมัครสมาชิก:', error);
      
      // แปลง error message ให้เข้าใจง่าย
      let errorMessage = error.message;
      if (error.code === 'auth/configuration-not-found') {
        errorMessage = 'เกิดข้อผิดพลาดในการตั้งค่าระบบ กรุณาติดต่อผู้ดูแลระบบ';
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'อีเมลนี้ถูกใช้งานแล้ว กรุณาใช้อีเมลอื่น';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'รหัสผ่านไม่ปลอดภัย กรุณาใช้รหัสผ่านที่แข็งแกร่งกว่านี้';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'รูปแบบอีเมลไม่ถูกต้อง';
      }
      
      Alert.alert('สมัครสมาชิกไม่สำเร็จ', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>สมัครสมาชิก</Text>
      
      <TextInput
        placeholder="ชื่อ"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      
      <TextInput
        placeholder="นามสกุล"
        value={surname}
        onChangeText={setSurname}
        style={styles.input}
      />
      
      <TextInput
        placeholder="ชื่อฟาร์ม"
        value={farmName}
        onChangeText={setFarmName}
        style={styles.input}
      />
      
      <TextInput
        placeholder="อีเมล"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
      />
      
      <TextInput
        placeholder="รหัสผ่าน (อย่างน้อย 6 ตัวอักษร)"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />
      
      <TextInput
        placeholder="ยืนยันรหัสผ่าน"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        style={styles.input}
      />
      
      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={handleRegister} 
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'กำลังสร้างบัญชี...' : 'สมัครสมาชิก'}
        </Text>
      </TouchableOpacity>
      
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text style={styles.loadingText}>กำลังสร้างบัญชีผู้ใช้...</Text>
        </View>
      )}
      
      <TouchableOpacity 
        onPress={() => navigation.navigate('Login')}
        style={styles.linkButton}
      >
        <Text style={styles.linkText}>มีบัญชีแล้ว? เข้าสู่ระบบ</Text>
      </TouchableOpacity>
    </View>
  );
};

export default RegistrationScreen;
