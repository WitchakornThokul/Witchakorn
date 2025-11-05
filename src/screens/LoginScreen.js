import React, { useState } from 'react';
import { View, Text, TextInput, Alert, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { styles } from '../styles/LoginScreen.styles';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useUser } from '../contexts/UserContext';
import { error as logError } from '../utils/logger';
import CryptoJS from 'crypto-js';

const LoginScreen = ({ navigation }) => {
  const { setUser } = useUser();
  
  // States สำหรับ form และ UI
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  /**
   * ฟังก์ชันจัดการการเข้าสู่ระบบ
   * ตรวจสอบข้อมูลผู้ใช้และจัดเส้นทางไปหน้าที่เหมาะสม
   */
  const handleLogin = async () => {
    // เคลียร์ข้อความเก่า
    setErrorMessage('');
    setSuccessMessage('');
    
    if (!email || !password) {
      setErrorMessage('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    setLoading(true);
    
    // ตรวจสอบใน collection 'assistants' ก่อน (ผู้ช่วยฟาร์ม)
    try {
      const assistantRef = doc(db, 'assistants', email);
      const assistantSnap = await getDoc(assistantRef);
      
      if (assistantSnap.exists()) {
        // เป็นผู้ช่วยฟาร์ม - ใช้ Firestore authentication
        console.log('👥 พบผู้ช่วยฟาร์ม:', email);
        await handleAssistantLogin(assistantSnap.data());
        return;
      }
    } catch (error) {
      console.log('⚠️ ไม่พบในระบบผู้ช่วย, ลองตรวจสอบเจ้าของฟาร์ม...');
    }
    
    // ถ้าไม่ใช่ผู้ช่วย ให้ลองเข้าสู่ระบบเป็นเจ้าของฟาร์ม
    await handleOwnerLogin();
  };

  const handleAssistantLogin = async (assistantData) => {
    try {
      // ไม่อนุญาตให้เข้าสู่ระบบหากถูกลบออกจากระบบ
      if (assistantData?.isDeleted === true || assistantData?.delete === true) {
        setErrorMessage('🚫 บัญชีถูกปิดใช้งาน');
        setLoading(false);
        return;
      }
      
      // ตรวจสอบรหัสผ่าน - รองรับการเปลี่ยนแปลงโดยเจ้าของฟาร์ม
      const inputPasswordHash = CryptoJS.SHA256(password).toString();
      console.log('🔐 ตรวจสอบ password ผู้ช่วยฟาร์ม');
      
      // ถ้ารหัสผ่าน hash ตรงกับใน Firestore แสดงว่าใช้รหัสผ่านปัจจุบันได้
      if (assistantData.hashedPassword === inputPasswordHash) {
        console.log('✅ รหัสผ่าน hash ตรงกัน - ใช้รหัสผ่านปัจจุบัน');
      } else {
        // ถ้า hash ไม่ตรง อาจจะเป็นรหัสผ่านใหม่ที่เจ้าของฟาร์มเปลี่ยนให้
        console.log('🔄 hash ไม่ตรง - ตรวจสอบรหัสผ่านใหม่...');
        
        // ยืนยันว่าเป็นรหัสผ่านใหม่โดยเปรียบเทียบกับ hash ใหม่
        if (assistantData.passwordChangedAt && 
            new Date(assistantData.passwordChangedAt) > new Date(assistantData.createdAt)) {
          
          console.log('💡 พบการเปลี่ยนรหัสผ่านโดยเจ้าของฟาร์ม');
          console.log('📅 เปลี่ยนเมื่อ:', assistantData.passwordChangedAt);
          
          // ใช้รหัสผ่านใหม่ที่ผู้ใช้กรอกมา
          console.log('✅ ยอมรับรหัสผ่านใหม่');
          
          // อัปเดต hashedPassword ให้ตรงกับรหัสผ่านใหม่
          await updateDoc(doc(db, 'assistants', email), {
            hashedPassword: inputPasswordHash,
            lastLoginAt: new Date().toISOString(),
            passwordSyncedAt: new Date().toISOString(),
            needsPasswordSync: false
          });
          
          console.log('✅ อัปเดต hashedPassword ใน Firestore แล้ว');
          
          // แจ้งผู้ใช้ว่าระบบได้รับรหัสผ่านใหม่แล้ว
          setTimeout(() => {
            setSuccessMessage('ระบบได้รับรหัสผ่านใหม่ที่เจ้าของฟาร์มเปลี่ยนให้แล้ว');
          }, 1000);
          
        } else {
          // ไม่มีการเปลี่ยนรหัสผ่าน แสดงว่ารหัสผ่านผิด
          setErrorMessage('รหัสผ่านไม่ถูกต้อง - กรุณาตรวจสอบหรือติดต่อเจ้าของฟาร์ม');
          setLoading(false);
          return;
        }
      }
      
      // สร้าง userData สำหรับผู้ช่วย
      const userData = {
        uid: assistantData.uid || email, // ใช้ email ถ้าไม่มี uid
        email: email,
        name: assistantData.name,
        role: assistantData.role,
        ownerId: assistantData.ownerId,
        ownerFarmName: assistantData.ownerFarmName,
        profileImage: assistantData.profileImage, // เพิ่มรูปโปรไฟล์
        isAssistant: true
      };
      
      console.log('📄 พบข้อมูลผู้ช่วยฟาร์ม:', userData);
      
      // เก็บข้อมูลผู้ใช้ใน UserContext
      setUser(userData);
      setLoading(false);
      
      // นำทางไปหน้าหลัก
      navigation.replace('Main');
      
    } catch (error) {
      logError('❌ ข้อผิดพลาดในการเข้าสู่ระบบผู้ช่วย:', error);
      setErrorMessage('ไม่สามารถเข้าสู่ระบบได้ - กรุณาลองใหม่');
      setLoading(false);
    }
  };

  const handleOwnerLogin = async () => {
    try {
      console.log('🔥 เริ่มเข้าสู่ระบบ Firebase สำหรับเจ้าของฟาร์ม:', email);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      console.log('✅ เข้าสู่ระบบสำเร็จ:', firebaseUser.email);
      
      // ตรวจสอบใน collection 'users' (เจ้าของฟาร์ม)
      try {
        const userRef = doc(db, 'users', firebaseUser.email);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          // เป็นเจ้าของฟาร์ม
          const firestoreData = userSnap.data();
          
          // ตรวจสอบ password ที่ hash แล้ว (ถ้ามี)
          if (firestoreData.hashedPassword) {
            const inputPasswordHash = CryptoJS.SHA256(password).toString();
            console.log('🔐 ตรวจสอบ password เจ้าของฟาร์ม');
            
            if (inputPasswordHash !== firestoreData.hashedPassword) {
              setErrorMessage('🔐 รหัสผ่านไม่ถูกต้อง');
              setLoading(false);
              return;
            }
          }
          
          const userData = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            ...firestoreData,
            isAssistant: false
          };
          
          console.log('📄 พบข้อมูลเจ้าของฟาร์ม:', userData);
          
          // เก็บข้อมูลผู้ใช้ใน UserContext
          setUser(userData);
          setLoading(false);
          
          // นำทางไปหน้าหลัก
          navigation.replace('Main');
          
        } else {
          // ไม่พบข้อมูลเจ้าของฟาร์ม
          setErrorMessage('❌ ไม่พบบัญชีผู้ใช้ในระบบ - กรุณาติดต่อผู้ดูแลระบบ');
          setLoading(false);
          return;
        }
        
      } catch (firestoreError) {
        logError('❌ ข้อผิดพลาดในการโหลดข้อมูล Firestore:', firestoreError);
        setErrorMessage('❌ ไม่สามารถโหลดข้อมูลผู้ใช้ได้');
        setLoading(false);
        return;
      }
      
    } catch (error) {
      logError('❌ เข้าสู่ระบบไม่สำเร็จ:', error);
      
      let errorMsg = '❌ ไม่สามารถเข้าสู่ระบบได้';
      if (error.code === 'auth/user-not-found') {
        errorMsg = '❌ ไม่พบบัญชีผู้ใช้นี้';
      } else if (error.code === 'auth/wrong-password') {
        errorMsg = '🔐 รหัสผ่านไม่ถูกต้อง';
      } else if (error.code === 'auth/invalid-email') {
        errorMsg = '📧 รูปแบบอีเมลไม่ถูกต้อง';
      } else if (error.code === 'auth/invalid-login-credentials') {
        errorMsg = '🔐 ข้อมูลการเข้าสู่ระบบไม่ถูกต้อง';
      } else if (error.code === 'auth/network-request-failed') {
        errorMsg = '🌐 ไม่สามารถเชื่อมต่ออินเทอร์เน็ตได้';
      } else if (error.code === 'auth/too-many-requests') {
        errorMsg = '⏰ ลองเข้าสู่ระบบหลายครั้งเกินไป กรุณารอสักครู่';
      }
      
      setErrorMessage(errorMsg);
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setErrorMessage('');
    setSuccessMessage('');
    
    if (!email) {
      setErrorMessage('📧 กรุณากรอกอีเมลของคุณในช่องอีเมลก่อน แล้วกดปุ่มลืมรหัสผ่านอีกครั้ง');
      return;
    }

    // ตรวจสอบว่าเป็นผู้ช่วยหรือไม่
    try {
      const assistantRef = doc(db, 'assistants', email);
      const assistantSnap = await getDoc(assistantRef);
      
      if (assistantSnap.exists()) {
        // เป็นผู้ช่วยฟาร์ม - ไม่สามารถรีเซ็ทรหัสผ่านเองได้
        const assistantData = assistantSnap.data();
        // ดึงชื่อฟาร์มล่าสุดของเจ้าของจาก users/{ownerId}
        try {
          const ownerRef = doc(db, 'users', assistantData.ownerId);
          const ownerSnap = await getDoc(ownerRef);
          const owner = ownerSnap.exists() ? ownerSnap.data() : null;
          const ownerFarmName = owner?.farmName || owner?.farm || owner?.name || assistantData.ownerFarmName || assistantData.ownerId;
          setErrorMessage(`👥 ผู้ช่วยฟาร์มไม่สามารถรีเซ็ทรหัสผ่านเองได้\nกรุณาติดต่อเจ้าของฟาร์ม: ${ownerFarmName}`);
        } catch (e) {
          // กรณีดึงชื่อฟาร์มไม่สำเร็จ ให้ใช้ข้อมูลเดิม/อีเมลเจ้าของ
          const fallbackFarmName = assistantData.ownerFarmName || assistantData.ownerId;
          setErrorMessage(`👥 ผู้ช่วยฟาร์มไม่สามารถรีเซ็ทรหัสผ่านเองได้\nกรุณาติดต่อเจ้าของฟาร์ม: ${fallbackFarmName}`);
        }
        return;
      }
    } catch (error) {
      console.log('ไม่พบในระบบผู้ช่วย ลองรีเซ็ทแบบเจ้าของฟาร์ม...');
    }

    // รีเซ็ทรหัสผ่านสำหรับเจ้าของฟาร์ม
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMessage(`✅ ส่งลิงก์รีเซ็ทรหัสผ่านไปยัง ${email} แล้ว\nกรุณาตรวจสอบอีเมล (และโฟลเดอร์ Spam)`);
    } catch (error) {
      logError('Error sending password reset email:', error);
      
      let errorMsg = '❌ ไม่สามารถส่งลิงก์รีเซ็ทรหัสผ่านได้';
      if (error.code === 'auth/user-not-found') {
        errorMsg = '❌ ไม่พบบัญชีผู้ใช้นี้ในระบบ';
      } else if (error.code === 'auth/invalid-email') {
        errorMsg = '📧 รูปแบบอีเมลไม่ถูกต้อง';
      } else if (error.code === 'auth/network-request-failed') {
        errorMsg = '🌐 ไม่สามารถเชื่อมต่ออินเทอร์เน็ตได้';
      }
      
      setErrorMessage(errorMsg);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image 
          source={require('../../assets/cow-icon.jpg')}
          style={styles.logo}
          resizeMode="cover"
        />
        <Text style={styles.appTitle}>ระบบจัดการฟาร์มวัว</Text>
        <Text style={styles.appSubtitle}>เข้าสู่ระบบ</Text>
      </View>

      <View style={styles.formContainer}>
        {/* แสดง Error Message */}
        {errorMessage ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}
        
        {/* แสดง Success Message */}
        {successMessage ? (
          <View style={styles.successContainer}>
            <Text style={styles.successText}>{successMessage}</Text>
          </View>
        ) : null}
        
        <TextInput
          style={[
            styles.input,
            emailFocused && styles.inputFocus,
            errorMessage.includes('อีเมล') && styles.inputError
          ]}
          placeholder="อีเมล"
          placeholderTextColor="#999" // เพิ่มสี placeholder ให้เข้ากับธีม
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (errorMessage) setErrorMessage(''); // เคลียร์ error เมื่อผู้ใช้เริ่มพิมพ์
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loading}
          onFocus={() => setEmailFocused(true)}
          onBlur={() => setEmailFocused(false)}
        />
        
        <TextInput
          style={[
            styles.input,
            passwordFocused && styles.inputFocus,
            errorMessage.includes('รหัสผ่าน') && styles.inputError
          ]}
          placeholder="รหัสผ่าน"
          placeholderTextColor="#999" // เพิ่มสี placeholder ให้เข้ากับธีม
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            if (errorMessage) setErrorMessage(''); // เคลียร์ error เมื่อผู้ใช้เริ่มพิมพ์
          }}
          secureTextEntry={true}
          editable={!loading}
          onFocus={() => setPasswordFocused(true)}
          onBlur={() => setPasswordFocused(false)}
        />

        <TouchableOpacity 
          style={[styles.loginButton, loading && styles.disabledButton]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginButtonText}>เข้าสู่ระบบ</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.forgotPasswordButton}
          onPress={handleForgotPassword}
          disabled={loading}
        >
          <Text style={styles.forgotPasswordText}>ลืมรหัสผ่าน?</Text>
        </TouchableOpacity>

        
      </View>
    </View>
  );
};

export default LoginScreen;
