import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { styles } from '../styles/AddAssistantScreen.styles';
import { useUser } from '../contexts/UserContext';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth, db } from '../config/firebase';
import CryptoJS from 'crypto-js';

const AddAssistantScreen = ({ navigation, route }) => {
  const { user } = useUser();
  const { editMode = false, assistantData = null } = route.params || {};
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: editMode ? assistantData?.name || '' : '',
    email: editMode ? assistantData?.email || '' : '',
    password: '', // Password สำหรับสร้างบัญชีใหม่หรือเปลี่ยนรหัสผ่าน
    confirmPassword: ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกชื่อ-นามสกุล');
      return false;
    }

    if (!formData.email.trim()) {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกอีเมล');
      return false;
    }

    // ตรวจสอบรูปแบบอีเมล
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('ข้อผิดพลาด', 'รูปแบบอีเมลไม่ถูกต้อง');
      return false;
    }

    // สำหรับโหมดเพิ่มใหม่ หรือเปลี่ยนรหัสผ่าน
    if (!editMode || formData.password) {
      if (!formData.password) {
        Alert.alert('ข้อผิดพลาด', 'กรุณากรอกรหัสผ่าน');
        return false;
      }

      if (formData.password.length < 6) {
        Alert.alert('ข้อผิดพลาด', 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
        return false;
      }

      if (formData.password !== formData.confirmPassword) {
        Alert.alert('ข้อผิดพลาด', 'รหัสผ่านไม่ตรงกัน');
        return false;
      }
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    if (!user?.email) {
      Alert.alert('ข้อผิดพลาด', 'ไม่พบข้อมูลผู้ใช้');
      return;
    }

    setLoading(true);
    try {
      if (editMode) {
        // แก้ไขข้อมูลผู้ช่วย
        console.log('กำลังแก้ไขข้อมูลผู้ช่วย...');
        
        const updateData = {
          name: formData.name.trim(),
          updatedAt: new Date().toISOString(),
          updatedBy: user.email
        };

        // ถ้ามีการเปลี่ยนรหัสผ่าน
        if (formData.password) {
          const hashedPassword = CryptoJS.SHA256(formData.password).toString();
          updateData.hashedPassword = hashedPassword;
          updateData.passwordUpdatedAt = new Date().toISOString();
          updateData.passwordUpdatedBy = user.email;
          
          // อัพเดทรหัสผ่านใน Firebase Auth ด้วย (ถ้าต้องการ)
          console.log('อัพเดทรหัสผ่านสำหรับผู้ช่วย');
        }

        // ใช้ assistantData.email แทน assistantData.id เพราะ email เป็น document ID
        await updateDoc(doc(db, 'assistants', assistantData.email), updateData);
        
        Alert.alert(
          'สำเร็จ!',
          `แก้ไขข้อมูลผู้ช่วย "${formData.name}" เรียบร้อยแล้ว${formData.password ? '\n\nรหัสผ่านได้ถูกอัพเดทแล้ว' : ''}`,
          [{ text: 'ตกลง', onPress: () => navigation.goBack() }]
        );

      } else {
        // เพิ่มผู้ช่วยใหม่
        console.log('👥 กำลังเพิ่มผู้ช่วยใหม่...');
        
        // สร้างบัญชี Firebase Authentication สำหรับผู้ช่วย
        const userCredential = await createUserWithEmailAndPassword(
          auth, 
          formData.email.trim(), 
          formData.password
        );
        
        console.log('สร้างบัญชี Firebase Auth สำเร็จ:', userCredential.user.uid);

        // Hash รหัสผ่านก่อนบันทึก
        const hashedPassword = CryptoJS.SHA256(formData.password).toString();
        
        // บันทึกข้อมูลผู้ช่วยใน collection 'assistants'
        const assistantData = {
          uid: userCredential.user.uid,
          name: formData.name.trim(),
          email: formData.email.trim(),
          hashedPassword: hashedPassword,
          role: 'ผู้ช่วยฟาร์ม',
          ownerId: user.email, // เจ้าของฟาร์มที่สร้างผู้ช่วยคนนี้
          ownerFarmName: user.farmName || 'ฟาร์ม',
          profileImage: null, // เริ่มต้นด้วยรูปเปล่า ผู้ช่วยสามารถเพิ่มรูปภายหลังได้
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isActive: true
        };

        // ใช้ email เป็น document ID
        await setDoc(doc(db, 'assistants', formData.email.trim()), assistantData);
        
        console.log('บันทึกข้อมูลผู้ช่วยสำเร็จ');
        
        Alert.alert(
          'สำเร็จ!',
          `เพิ่มผู้ช่วย "${formData.name && formData.name.trim() ? formData.name.trim() : ''}" เรียบร้อยแล้ว\nผู้ช่วยสามารถเข้าสู่ระบบด้วยอีเมลและรหัสผ่านที่กำหนดได้`,
          [{ text: 'ตกลง', onPress: () => navigation.goBack() }]
        );
      }

    } catch (error) {
      console.error('ข้อผิดพลาดในการบันทึกข้อมูลผู้ช่วย:', error);
      
      let errorMessage = 'ไม่สามารถบันทึกข้อมูลได้';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'อีเมลนี้ถูกใช้งานแล้ว กรุณาใช้อีเมลอื่น';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'รหัสผ่านไม่ปลอดภัย กรุณาใช้รหัสผ่านที่แข็งแกร่งกว่านี้';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'รูปแบบอีเมลไม่ถูกต้อง';
      }
      
      Alert.alert('ข้อผิดพลาด', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'ยืนยันการยกเลิก',
      'ต้องการยกเลิกการดำเนินการหรือไม่? ข้อมูลที่กรอกจะหายไป',
      [
        { text: 'ดำเนินการต่อ', style: 'cancel' },
        { text: 'ยกเลิก', onPress: () => navigation.goBack() }
      ]
    );
  };

  const handleSendPasswordResetEmail = async () => {
    if (!assistantData?.email) {
      Alert.alert('ข้อผิดพลาด', 'ไม่พบอีเมลของผู้ช่วย');
      return;
    }

    Alert.alert(
      'ส่งลิงก์รีเซ็ทรหัสผ่าน',
      `ส่งลิงก์รีเซ็ทรหัสผ่านไปยังอีเมล ${assistantData.email} หรือไม่?\n\n"${assistantData.name && assistantData.name.trim() ? assistantData.name.trim() : ''}" จะได้รับอีเมลและสามารถรีเซ็ทรหัสผ่านเองได้`,
      [
        { text: 'ยกเลิก', style: 'cancel' },
        {
          text: 'ส่งลิงก์',
          onPress: async () => {
            try {
              setLoading(true);
              
              await sendPasswordResetEmail(auth, assistantData.email);
              
              console.log('ส่งลิงก์รีเซ็ทรหัสผ่านสำเร็จ:', assistantData.email);
              
              Alert.alert(
                'ส่งลิงก์สำเร็จ!',
                `ลิงก์รีเซ็ทรหัสผ่านถูกส่งไปยัง ${assistantData.email} เรียบร้อยแล้ว\n\nกรุณาแจ้งให้ "${assistantData.name && assistantData.name.trim() ? assistantData.name.trim() : ''}" ตรวจสอบอีเมล (และโฟลเดอร์ Spam) แล้วทำตามคำแนะนำ`,
                [{ text: 'เข้าใจแล้ว' }]
              );
              
            } catch (error) {
              console.error('❌ ข้อผิดพลาดในการส่งลิงก์รีเซ็ท:', error);
              
              let errorMessage = 'ไม่สามารถส่งลิงก์รีเซ็ทรหัสผ่านได้';
              if (error.code === 'auth/user-not-found') {
                errorMessage = 'ไม่พบอีเมลนี้ใน Firebase Authentication';
              } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'รูปแบบอีเมลไม่ถูกต้อง';
              }
              
              Alert.alert('ข้อผิดพลาด', errorMessage);
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* ฟอร์มข้อมูลผู้ช่วย */}
        <View style={styles.formCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>ข้อมูลผู้ช่วย</Text>
          </View>

          {/* ชื่อ-นามสกุล */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>ชื่อ-นามสกุล *</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              placeholder="กรอกชื่อ-นามสกุล"
              placeholderTextColor="#999"
              editable={!loading}
            />
          </View>

          {/* อีเมล */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>อีเมล *</Text>
            <TextInput
              style={[styles.input, editMode && styles.readOnlyInput]}
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              placeholder="กรอกอีเมล"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading && !editMode} // ไม่ให้แก้ไขอีเมลในโหมดแก้ไข
            />
            {editMode && (
              <Text style={styles.hint}>ไม่สามารถแก้ไขอีเมลได้</Text>
            )}
          </View>

          {/* รหัสผ่าน */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              รหัสผ่าน {editMode ? '(กรอกเฉพาะเมื่อต้องการเปลี่ยน)' : '*'}
            </Text>
            <TextInput
              style={styles.input}
              value={formData.password}
              onChangeText={(value) => handleInputChange('password', value)}
              placeholder={editMode ? "กรอกรหัสผ่านใหม่ (ไม่บังคับ)" : "กรอกรหัสผ่าน (อย่างน้อย 6 ตัวอักษร)"}
              placeholderTextColor="#999"
              editable={!loading}
            />
          </View>

          {/* ยืนยันรหัสผ่าน */}
          {(!editMode || formData.password) && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>ยืนยันรหัสผ่าน *</Text>
              <TextInput
                style={styles.input}
                value={formData.confirmPassword}
                onChangeText={(value) => handleInputChange('confirmPassword', value)}
                placeholder="ยืนยันรหัสผ่าน"
                placeholderTextColor="#999"
                editable={!loading}
              />
            </View>
          )}

          {/* ข้อมูลฟาร์ม (แสดงข้อมูล) */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>ฟาร์มที่สังกัด</Text>
            <View style={styles.readOnlyContainer}>
              <Text style={styles.readOnlyText}>{user?.farmName || 'ฟาร์ม'}</Text>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>เจ้าของฟาร์ม</Text>
            <View style={styles.readOnlyContainer}>
              <Text style={styles.readOnlyText}>{user?.name || user?.email}</Text>
            </View>
          </View>
        </View>

        {/* ปุ่มดำเนินการ */}
        <View style={styles.actionContainer}>
          <TouchableOpacity 
            style={[styles.saveButton, loading && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>
                {editMode ? 'บันทึกการแก้ไข' : 'เพิ่มผู้ช่วย'}
              </Text>
            )}
          </TouchableOpacity>

          {/* ปุ่มส่งลิงก์รีเซ็ทรหัสผ่าน - แสดงเฉพาะในโหมดแก้ไข */}
          {editMode && (
            <TouchableOpacity 
              style={[styles.emailResetButton, loading && styles.buttonDisabled]}
              onPress={handleSendPasswordResetEmail}
              disabled={loading}
            >
              <Text style={styles.emailResetButtonText}>ส่งลิงก์รีเซ็ทอีเมล</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={handleCancel}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>ยกเลิก</Text>
          </TouchableOpacity>
        </View>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#8B4513" />
            <Text style={styles.loadingText}>
              {editMode ? 'กำลังบันทึกการแก้ไข...' : 'กำลังสร้างบัญชีผู้ช่วย...'}
            </Text>
          </View>
        )}

        {/* Card ผู้ช่วยใหม่ (ตัวอย่าง) */}
        <View style={styles.assistantCardModern}>
          <View style={{ flexDirection: 'column', flex: 1 }}>
            {/* <Text style={styles.assistantNameModern} numberOfLines={2} ellipsizeMode="tail">
              {formData.name && formData.name.trim() ? formData.name.trim() : '-'}
            </Text> */}
            <Text style={styles.assistantEmailModern} numberOfLines={2} ellipsizeMode="tail">
              {formData.email && formData.email.trim() ? formData.email.trim() : '-'}
            </Text>
            {formData.phone && (
              <Text style={styles.assistantPhoneModern} numberOfLines={2} ellipsizeMode="tail">
                {formData.phone}
              </Text>
            )}
            {editMode && assistantData && (
              <Text style={styles.assistantStatusModern}>
                สถานะ: {assistantData.isActive ? 'ใช้งานอยู่' : 'ปิดใช้งาน'}
              </Text>
            )}
          </View>
        </View>

      </ScrollView>
    </View>
  );
};

export default AddAssistantScreen;
