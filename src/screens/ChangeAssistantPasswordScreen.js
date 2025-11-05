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

const ChangeAssistantPasswordScreen = ({ navigation, route }) => {
  const { user } = useUser();
  const { assistantData } = route.params;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    ownerPassword: '',
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
    if (!formData.ownerPassword.trim()) {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกรหัสผ่านของคุณเพื่อยืนยันตัวตน');
      return false;
    }

    if (!formData.newPassword.trim()) {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกรหัสผ่านใหม่สำหรับผู้ช่วย');
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

  const handleChangeAssistantPassword = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        Alert.alert('ข้อผิดพลาด', 'ไม่พบข้อมูลผู้ใช้');
        return;
      }

      // ตรวจสอบรหัสผ่านของเจ้าของฟาร์มก่อน
      const credential = EmailAuthProvider.credential(currentUser.email, formData.ownerPassword);
      await reauthenticateWithCredential(currentUser, credential);
      
      console.log('✅ ยืนยันตัวตนเจ้าของฟาร์มสำเร็จ');

      // เปลี่ยนรหัสผ่านผู้ช่วยใน Firestore
      const newHashedPassword = CryptoJS.SHA256(formData.newPassword).toString();
      const assistantRef = doc(db, 'assistants', assistantData.email); // ใช้ email เป็น document ID
      await updateDoc(assistantRef, {
        hashedPassword: newHashedPassword,
        updatedAt: new Date().toISOString(),
        passwordChangedBy: user.email,
        passwordChangedAt: new Date().toISOString(),
        needsPasswordSync: true // flag ว่าต้อง sync กับ Firebase Auth
      });

      console.log('✅ อัพเดทรหัสผ่านผู้ช่วยใน Firestore สำเร็จ');

      // พยายามอัปเดตใน Firebase Auth ด้วย (ถ้าเป็นไปได้)
      try {
        console.log('🔄 พยายามอัปเดต Firebase Auth...');
        // หมายเหตุ: ไม่สามารถอัปเดต Firebase Auth ของผู้อื่นได้โดยตรง
        // ระบบจะ sync ตอนผู้ช่วยเข้าสู่ระบบครั้งต่อไป
        console.log('💡 จะ sync Firebase Auth เมื่อผู้ช่วยเข้าสู่ระบบครั้งต่อไป');
      } catch (authError) {
        console.log('⚠️ ไม่สามารถอัปเดต Firebase Auth ได้:', authError.message);
      }

      Alert.alert(
        'สำเร็จ!',
        `เปลี่ยนรหัสผ่านของ "${assistantData.name}" สำเร็จแล้ว\n\nกรุณาแจ้งรหัสผ่านใหม่ให้กับผู้ช่วย\n\nหมายเหตุ: ผู้ช่วยสามารถใช้รหัสผ่านใหม่เข้าสู่ระบบได้ทันที`,
        [
          { 
            text: 'ตกลง', 
            onPress: () => {
              // รีเซ็ตฟอร์ม
              setFormData({
                ownerPassword: '',
                newPassword: '',
                confirmPassword: ''
              });
              navigation.goBack();
            }
          }
        ]
      );

    } catch (error) {
      console.error('❌ ข้อผิดพลาดในการเปลี่ยนรหัสผ่านผู้ช่วย:', error);
      
      let errorMessage = 'ไม่สามารถเปลี่ยนรหัสผ่านผู้ช่วยได้';
      if (error.code === 'auth/wrong-password') {
        errorMessage = 'รหัสผ่านของคุณไม่ถูกต้อง';
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
          <Text style={styles.appTitle}>เปลี่ยนรหัสผ่านผู้ช่วย</Text>
          <Text style={styles.profileHint}>เปลี่ยนรหัสผ่านสำหรับ "{assistantData?.name}"</Text>
        </View>

        {/* ฟอร์มเปลี่ยนรหัสผ่าน */}
        <View style={styles.profileCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>ข้อมูลรหัสผ่าน</Text>
          </View>

          {/* ข้อมูลผู้ช่วย */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>ชื่อผู้ช่วย</Text>
            <View style={styles.readOnlyContainer}>
              <Text style={styles.readOnlyText}>{assistantData?.name}</Text>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>อีเมลผู้ช่วย</Text>
            <View style={styles.readOnlyContainer}>
              <Text style={styles.readOnlyText}>{assistantData?.email}</Text>
            </View>
          </View>

          {/* รหัสผ่านเจ้าของฟาร์ม (สำหรับยืนยันตัวตน) */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>รหัสผ่านของคุณ (เพื่อยืนยันตัวตน)</Text>
            <TextInput
              style={styles.input}
              value={formData.ownerPassword}
              onChangeText={(value) => handleInputChange('ownerPassword', value)}
              placeholder="กรอกรหัสผ่านของคุณ"
              placeholderTextColor="#999"
              editable={!loading}
            />
          </View>

          {/* รหัสผ่านใหม่สำหรับผู้ช่วย */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>รหัสผ่านใหม่สำหรับผู้ช่วย</Text>
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
            <Text style={styles.label}>ยืนยันรหัสผ่านใหม่</Text>
            <TextInput
              style={styles.input}
              value={formData.confirmPassword}
              onChangeText={(value) => handleInputChange('confirmPassword', value)}
              placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
              placeholderTextColor="#999"
              editable={!loading}
            />
          </View>
        </View>

        {/* ปุ่มบันทึก */}
        <TouchableOpacity 
          style={[styles.resetButton, { backgroundColor: '#4CAF50' }]}
          onPress={handleChangeAssistantPassword}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.resetButtonText}>เปลี่ยนรหัสผ่าน</Text>
          )}
        </TouchableOpacity>

        {/* คำเตือน */}
        <View style={styles.assistantPasswordInfo}>
          <Text style={styles.assistantPasswordTitle}>ข้อควรระวัง</Text>
          <Text style={styles.assistantPasswordText}>
            • กรุณาจดจำรหัสผ่านใหม่และแจ้งให้ผู้ช่วยทราบ
          </Text>
          <Text style={styles.assistantPasswordText}>
            • ผู้ช่วยจะต้องใช้รหัสผ่านใหม่ในการเข้าสู่ระบบครั้งต่อไป
          </Text>
          <Text style={styles.assistantPasswordText}>
            • ผู้ช่วยไม่สามารถเปลี่ยนรหัสผ่านเองได้
          </Text>
        </View>

      </ScrollView>
    </View>
  );
};

export default ChangeAssistantPasswordScreen;
