import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { styles } from '../styles/EditProfileScreen.styles';
import { useUser } from '../contexts/UserContext';
import { doc, updateDoc } from 'firebase/firestore';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { auth, db } from '../config/firebase';
import CryptoJS from 'crypto-js';

const ChangePasswordScreen = ({ navigation }) => {
  const { user, setUser } = useUser();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.currentPassword.trim()) {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกรหัสผ่านปัจจุบัน');
      return false;
    }

    if (!formData.newPassword.trim()) {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกรหัสผ่านใหม่');
      return false;
    }

    if (formData.newPassword.length < 6) {
      Alert.alert('ข้อผิดพลาด', 'รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร');
      return false;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      Alert.alert('ข้อผิดพลาด', 'รหัสผ่านใหม่และการยืนยันไม่ตรงกัน');
      return false;
    }

    return true;
  };

  const handleChangePassword = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        Alert.alert('ข้อผิดพลาด', 'ไม่พบข้อมูลผู้ใช้');
        return;
      }

      // ตรวจสอบรหัสผ่านปัจจุบัน
      const credential = EmailAuthProvider.credential(currentUser.email, formData.currentPassword);
      await reauthenticateWithCredential(currentUser, credential);
      
      console.log('✅ ยืนยันตัวตนสำเร็จ');

      // เปลี่ยนรหัสผ่านใน Firebase Auth
      await updatePassword(currentUser, formData.newPassword);
      console.log('✅ เปลี่ยนรหัสผ่านใน Firebase Auth สำเร็จ');

      // อัพเดท hashed password ใน Firestore
      const newHashedPassword = CryptoJS.SHA256(formData.newPassword).toString();
      const userRef = doc(db, 'users', currentUser.email);
      await updateDoc(userRef, {
        hashedPassword: newHashedPassword,
        updatedAt: new Date().toISOString()
      });

      console.log('✅ อัพเดท hashed password ใน Firestore สำเร็จ');

      // อัพเดทข้อมูลใน UserContext
      setUser(prevUser => ({
        ...prevUser,
        hashedPassword: newHashedPassword,
        updatedAt: new Date().toISOString()
      }));

      Alert.alert(
        'สำเร็จ!',
        'เปลี่ยนรหัสผ่านสำเร็จแล้ว',
        [
          { 
            text: 'ตกลง', 
            onPress: () => {
              // รีเซ็ตฟอร์ม
              setFormData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
              });
              navigation.goBack();
            }
          }
        ]
      );

    } catch (error) {
      console.error('❌ ข้อผิดพลาดในการเปลี่ยนรหัสผ่าน:', error);
      
      let errorMessage = 'ไม่สามารถเปลี่ยนรหัสผ่านได้';
      if (error.code === 'auth/wrong-password') {
        errorMessage = 'รหัสผ่านปัจจุบันไม่ถูกต้อง';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'รหัสผ่านใหม่ไม่ปลอดภัยเพียงพอ';
      } else if (error.code === 'auth/requires-recent-login') {
        errorMessage = 'กรุณาเข้าสู่ระบบใหม่แล้วลองอีกครั้ง';
      }
      
      Alert.alert('ข้อผิดพลาด', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.appTitle}>เปลี่ยนรหัสผ่าน</Text>
          <Text style={styles.profileHint}>กรอกข้อมูลเพื่อเปลี่ยนรหัสผ่าน</Text>
        </View>

        {/* ฟอร์มเปลี่ยนรหัสผ่าน */}
        <View style={styles.profileCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>ข้อมูลรหัสผ่าน</Text>
          </View>

          {/* รหัสผ่านปัจจุบัน */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>รหัสผ่านปัจจุบัน *</Text>
            <TextInput
              style={styles.input}
              value={formData.currentPassword}
              onChangeText={(value) => handleInputChange('currentPassword', value)}
              placeholder="กรอกรหัสผ่านปัจจุบัน"
              placeholderTextColor="#999"
              editable={!loading}
            />
          </View>

          {/* รหัสผ่านใหม่ */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>รหัสผ่านใหม่ *</Text>
            <TextInput
              style={styles.input}
              value={formData.newPassword}
              onChangeText={(value) => handleInputChange('newPassword', value)}
              placeholder="กรอกรหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร)"
              placeholderTextColor="#999"
              editable={!loading}
            />
          </View>

          {/* ยืนยันรหัสผ่านใหม่ */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>ยืนยันรหัสผ่านใหม่ *</Text>
            <TextInput
              style={styles.input}
              value={formData.confirmPassword}
              onChangeText={(value) => handleInputChange('confirmPassword', value)}
              placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
              placeholderTextColor="#999"
              editable={!loading}
            />
          </View>

          {/* ข้อมูลความปลอดภัย */}
          <View style={styles.inputGroup}>
            <Text style={styles.hintText}>
              รหัสผ่านจะถูกเข้ารหัสและเก็บไว้ใน Firebase อย่างปลอดภัย
            </Text>
            <Text style={styles.hintText}>
              การเปลี่ยนรหัสผ่านจะมีผลทันที
            </Text>
          </View>
        </View>

        {/* ปุ่มดำเนินการ */}
        <TouchableOpacity 
          style={[styles.resetButton, { backgroundColor: '#4CAF50' }]}
          onPress={handleChangePassword}
          disabled={loading}
        >
          <Text style={styles.resetButtonText}>
            {loading ? 'กำลังเปลี่ยนรหัสผ่าน...' : 'เปลี่ยนรหัสผ่าน'}
          </Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Loading Overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>กำลังเปลี่ยนรหัสผ่าน...</Text>
        </View>
      )}
    </View>
  );
};

export default ChangePasswordScreen;
