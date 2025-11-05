import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  ScrollView,
  ActivityIndicator,
  Image,
  Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { styles } from '../styles/EditProfileScreen.styles';
import { useUser } from '../contexts/UserContext';
import { doc, updateDoc, setDoc, collection, query, where, getDocs, getDoc, onSnapshot } from 'firebase/firestore';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth, db } from '../config/firebase';

const EditProfileScreen = ({ navigation }) => {
  const { user, setUser } = useUser();
  const [loading, setLoading] = useState(false);
  const [renderKey, setRenderKey] = useState(0); // เพิ่ม state สำหรับ force re-render
  const [formData, setFormData] = useState({
    name: user?.name || '',
    farmName: user?.farmName || user?.ownerFarmName || '',
    profileImage: user?.profileImage || null,
  });

  // ตรวจสอบว่าเป็นผู้ช่วยหรือไม่
  const isAssistant = user?.isAssistant || user?.role === 'ผู้ช่วยฟาร์ม';

  // โหลดข้อมูลล่าสุดสำหรับผู้ช่วย
  useEffect(() => {
    if (isAssistant && user?.email) {
      console.log('👁️ เริ่มฟังการเปลี่ยนแปลงข้อมูลผู้ช่วย...', user.email);
      
      const assistantRef = doc(db, 'assistants', user.email);
      
      // ฟังการเปลี่ยนแปลงแบบ real-time
      const unsubscribe = onSnapshot(assistantRef, (assistantSnap) => {
        if (assistantSnap.exists()) {
          const latestData = assistantSnap.data();
          console.log('🔄 ได้รับข้อมูลล่าสุดของผู้ช่วย:', latestData);
          console.log('📝 ชื่อฟาร์มปัจจุบัน:', latestData.ownerFarmName);
          console.log('📝 ชื่อฟาร์มในฟอร์มเดิม:', formData.farmName);
          
          // อัพเดต formData ทันที
          setFormData(prev => {
            const newData = {
              ...prev,
              farmName: latestData.ownerFarmName || '',
            };
            console.log('✅ อัพเดต formData:', newData);
            return newData;
          });

          // บังคับ re-render
          setRenderKey(prev => prev + 1);

          // อัพเดต UserContext ด้วย
          setUser(prevUser => ({
            ...prevUser,
            ownerFarmName: latestData.ownerFarmName,
          }));
        } else {
          console.log('❌ ไม่พบข้อมูลผู้ช่วยใน Firebase');
        }
      }, (error) => {
        console.error('❌ ข้อผิดพลาดในการฟังข้อมูลผู้ช่วย:', error);
      });

      // ยกเลิกการฟังเมื่อ component unmount
      return () => {
        console.log('🛑 หยุดฟังการเปลี่ยนแปลงข้อมูลผู้ช่วย');
        unsubscribe();
      };
    }
  }, [isAssistant, user?.email, setUser]);

  // ฟังก์ชันออกจากระบบ
  const handleLogout = () => {
    setUser(null);
    navigation.replace('Home');
  };

  const handleInputChange = (field, value) => {
    console.log(`🔄 handleInputChange: ${field} = ${value}`);
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };
      console.log('📝 FormData อัพเดตเป็น:', newData);
      return newData;
    });
  };

  // แปลงรูปเป็น base64 และเก็บใน users table
  const convertImageToBase64 = async (imageUri) => {
    try {
      console.log('� แปลงรูปเป็น base64...');
      
      // อ่านไฟล์และแปลงเป็น base64
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64String = reader.result;
          console.log('✅ แปลง base64 สำเร็จ');
          resolve(base64String);
        };
        reader.onerror = (error) => {
          console.error('❌ ข้อผิดพลาดในการแปลง base64:', error);
          reject(error);
        };
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('❌ ข้อผิดพลาดในการแปลงรูป:', error);
      throw new Error(`ไม่สามารถแปลงรูปภาพได้: ${error.message}`);
    }
  };

  const uploadImageToFirebase = async (imageUri) => {
    try {
      console.log('📤 เริ่มแปลงและเก็บรูปใน users table...');
      
      // แปลงรูปเป็น base64
      const base64Image = await convertImageToBase64(imageUri);
      
      console.log('✅ เก็บรูปใน users table สำเร็จ');
      return base64Image;
    } catch (error) {
      console.error('❌ ข้อผิดพลาดในการเก็บรูป:', error);
      throw new Error(`ไม่สามารถเก็บรูปภาพได้: ${error.message}`);
    }
  };

  const requestCameraPermission = async () => {
    try {
      console.log('📷 ขออนุญาตเข้าถึงกล้อง...');
      
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        console.log('📱 สถานะการอนุญาตกล้อง:', status);
        
        if (status !== 'granted') {
          Alert.alert(
            'ขออนุญาต',
            'แอปต้องการสิทธิ์เข้าถึงกล้องเพื่อถ่ายรูปโปรไฟล์',
            [
              { text: 'ยกเลิก', style: 'cancel' },
              { text: 'เข้าใจแล้ว', onPress: () => {} }
            ]
          );
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('❌ ข้อผิดพลาดในการขออนุญาตกล้อง:', error);
      return false;
    }
  };

  const requestMediaLibraryPermission = async () => {
    try {
      console.log('🔐 ขออนุญาตเข้าถึงแกลเลอรี่...');
      
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        console.log('📱 สถานะการอนุญาต:', status);
        
        if (status !== 'granted') {
          Alert.alert(
            'ขออนุญาต',
            'แอปต้องการสิทธิ์เข้าถึงแกลเลอรี่เพื่อเลือกรูปภาพ',
            [
              { text: 'ยกเลิก', style: 'cancel' },
              { text: 'เข้าใจแล้ว', onPress: () => {} }
            ]
          );
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('❌ ข้อผิดพลาดในการขออนุญาต:', error);
      return false;
    }
  };

  const takePhoto = async () => {
    try {
      console.log('📷 เริ่มกระบวนการถ่ายรูป...');
      
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) {
        console.log('❌ ไม่ได้รับอนุญาตเข้าถึงกล้อง');
        return;
      }

      console.log('✅ ได้รับอนุญาตแล้ว เปิดกล้อง...');
      
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        setLoading(true);
        
        try {
          // แปลงรูปเป็น base64 และเก็บใน Firestore
          const base64Image = await convertImageToBase64(imageUri);
          
          // อัพเดทในฟอร์ม
          handleInputChange('profileImage', base64Image);
          
          Alert.alert(
            'สำเร็จ!', 
            'ถ่ายรูปและเก็บใน users table สำเร็จแล้ว\nอย่าลืมกดปุ่ม "บันทึก" เพื่อเซฟข้อมูล',
            [{ text: 'เข้าใจแล้ว' }]
          );
        } catch (error) {
          console.error('❌ ข้อผิดพลาดในการแปลงรูป:', error);
          Alert.alert('ข้อผิดพลาด', 'ไม่สามารถประมวลผลรูปได้');
        } finally {
          setLoading(false);
        }
      }
    } catch (error) {
      console.error('❌ ข้อผิดพลาดในการถ่ายรูป:', error);
      Alert.alert('ข้อผิดพลาด', `ไม่สามารถถ่ายรูปได้: ${error.message}`);
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      console.log('🖼️ เริ่มกระบวนการเลือกรูป...');
      
      const hasPermission = await requestMediaLibraryPermission();
      if (!hasPermission) {
        console.log('❌ ไม่ได้รับอนุญาตเข้าถึงแกลเลอรี่');
        return;
      }

      console.log('✅ ได้รับอนุญาตแล้ว เปิดแกลเลอรี่...');
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        setLoading(true);
        
        try {
          // แปลงรูปเป็น base64 และเก็บใน Firestore
          const base64Image = await convertImageToBase64(imageUri);
          
          // อัพเดทในฟอร์ม
          handleInputChange('profileImage', base64Image);
          
          Alert.alert(
            'สำเร็จ!', 
            'เลือกรูปและเก็บใน users table สำเร็จแล้ว\nอย่าลืมกดปุ่ม "บันทึก" เพื่อเซฟข้อมูล',
            [{ text: 'เข้าใจแล้ว' }]
          );
        } catch (error) {
          console.error('❌ ข้อผิดพลาดในการแปลงรูป:', error);
          Alert.alert('ข้อผิดพลาด', 'ไม่สามารถประมวลผลรูปได้');
        } finally {
          setLoading(false);
        }
      }
    } catch (error) {
      console.error('❌ ข้อผิดพลาดในการเลือกรูป:', error);
      Alert.alert('ข้อผิดพลาด', `ไม่สามารถเลือกรูปภาพได้: ${error.message}`);
      setLoading(false);
    }
  };

  const selectImageOption = () => {
    Alert.alert(
      'เลือกรูปโปรไฟล์',
      'คุณต้องการจะเพิ่มรูปโปรไฟล์อย่างไร?',
      [
        { text: 'ยกเลิก', style: 'cancel' },
        { 
          text: 'ถ่ายรูป', 
          onPress: takePhoto 
        },
        { 
          text: ' เลือกจากแกลเลอรี่', 
          onPress: pickImage 
        }
      ]
    );
  };

  const removeImage = () => {
    Alert.alert(
      'ยืนยันการลบ',
      'ต้องการลบรูปโปรไฟล์หรือไม่?',
      [
        { text: 'ยกเลิก', style: 'cancel' },
        { 
          text: 'ลบ', 
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              // ลบจากฟอร์ม (ไม่ต้องลบจาก Firebase Storage เพราะใช้ base64)
              handleInputChange('profileImage', null);
              console.log('✅ ลบรูปโปรไฟล์แล้ว');
            } catch (error) {
              console.error('❌ ข้อผิดพลาดในการลบรูป:', error);
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกชื่อผู้ใช้');
      return;
    }

    // สำหรับผู้ช่วย ไม่ต้องตรวจสอบชื่อฟาร์ม เพราะไม่สามารถแก้ไขได้
    if (!isAssistant && !formData.farmName.trim()) {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกชื่อฟาร์ม');
      return;
    }

    setLoading(true);
    try {
      console.log('💾 กำลังบันทึกข้อมูลผู้ใช้ลง Firebase...');
      
      if (isAssistant) {
        // อัพเดทข้อมูลผู้ช่วยใน collection 'assistants'
        const assistantData = {
          name: formData.name.trim(),
          profileImage: formData.profileImage,
          updatedAt: new Date().toISOString(),
        };

        const assistantRef = doc(db, 'assistants', user?.email);
        await updateDoc(assistantRef, assistantData);
        
        console.log('✅ บันทึกข้อมูลผู้ช่วยลง Firebase สำเร็จ:', assistantData);

        const updatedUser = {
          ...user,
          name: assistantData.name,
          profileImage: assistantData.profileImage,
          updatedAt: assistantData.updatedAt
        };
        
        setUser(updatedUser);
        
      } else {
        // อัพเดทข้อมูลเจ้าของฟาร์มใน collection 'users'
        const userData = {
          name: formData.name.trim(),
          farmName: formData.farmName.trim(),
          profileImage: formData.profileImage,
          email: user?.email,
          updatedAt: new Date().toISOString(),
        };

        const userRef = doc(db, 'users', user?.email);
        await setDoc(userRef, userData, { merge: true });
        
        console.log('✅ บันทึกข้อมูลเจ้าของฟาร์มลง Firebase สำเร็จ:', userData);

        // อัพเดตชื่อฟาร์มในข้อมูลผู้ช่วยทั้งหมดที่อยู่ภายใต้เจ้าของฟาร์มคนนี้
        if (formData.farmName.trim() !== user?.farmName) {
          console.log('🔄 อัพเดตชื่อฟาร์มในข้อมูลผู้ช่วย...');
          
          const assistantsQuery = query(
            collection(db, 'assistants'),
            where('ownerId', '==', user?.email)
          );
          
          const assistantsSnapshot = await getDocs(assistantsQuery);
          
          const updatePromises = assistantsSnapshot.docs.map(assistantDoc => {
            return updateDoc(assistantDoc.ref, {
              ownerFarmName: formData.farmName.trim(),
              updatedAt: new Date().toISOString()
            });
          });
          
          await Promise.all(updatePromises);
          console.log(`✅ อัพเดตชื่อฟาร์มในข้อมูลผู้ช่วย ${assistantsSnapshot.docs.length} คน`);
        }

        const updatedUser = {
          ...user,
          ...userData
        };
        
        setUser(updatedUser);
      }
      
      Alert.alert(
        'สำเร็จ', 
        'อัพเดทข้อมูลโปรไฟล์เรียบร้อยแล้ว',
        [{ text: 'ตกลง' }]
      );
      
    } catch (error) {
      console.error('❌ ข้อผิดพลาดในการบันทึกข้อมูลลง Firebase:', error);
      Alert.alert('ข้อผิดพลาด', `ไม่สามารถบันทึกข้อมูลได้: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    Alert.alert(
      'รีเซ็ทรหัสผ่าน',
      `ส่งลิงก์รีเซ็ทรหัสผ่านไปยัง ${user?.email} หรือไม่?`,
      [
        { text: 'ยกเลิก', style: 'cancel' },
        {
          text: 'ส่ง',
          onPress: async () => {
            try {
              setLoading(true);
              await sendPasswordResetEmail(auth, user?.email);
              Alert.alert(
                'ส่งแล้ว!',
                'กรุณาตรวจสอบอีเมลของคุณและทำตามคำแนะนำเพื่อรีเซ็ทรหัสผ่าน'
              );
            } catch (error) {
              console.error('ข้อผิดพลาดในการรีเซ็ทรหัสผ่าน:', error);
              Alert.alert('ข้อผิดพลาด', 'ไม่สามารถส่งอีเมลรีเซ็ทรหัสผ่านได้');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Header ด้วยรูปโปรไฟล์ */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.profileImageContainer}
          onPress={selectImageOption}
          disabled={loading}
        >
          {formData.profileImage ? (
            <Image 
              source={{ uri: formData.profileImage }} 
              style={styles.profileImage}
              onLoad={() => console.log('✅ รูปโหลดสำเร็จ:', formData.profileImage)}
              onError={(error) => {
                console.error('❌ รูปโหลดไม่สำเร็จ:', error);
                Alert.alert('ข้อผิดพลาด', 'ไม่สามารถแสดงรูปภาพได้');
                handleInputChange('profileImage', null);
              }}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.profileCircle}>
              <Text style={styles.profileInitial}>
                {user?.name ? user.name[0].toUpperCase() : '🐄'}
              </Text>
            </View>
          )}
        </TouchableOpacity>
        
        <Text style={styles.appTitle}>โปรไฟล์</Text>
        
        {/* ข้อความแนะนำ */}
        <Text style={styles.profileHint}>แตะรูปเพื่อเปลี่ยนรูปโปรไฟล์</Text>
        
        {formData.profileImage && (
          <TouchableOpacity onPress={removeImage} style={styles.removeImageButton}>
            <Text style={styles.removeImageText}>ลบรูป</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* การ์ดข้อมูลส่วนตัว */}
        <View style={styles.profileCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>ข้อมูลส่วนตัว</Text>
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={handleSave}
              disabled={loading}
            >
              <Text style={styles.saveButtonText}>
                {loading ? 'กำลังบันทึก...' : 'บันทึก'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* ชื่อผู้ใช้ - แก้ไขได้ */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>ชื่อผู้ใช้</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              placeholder="กรอกชื่อผู้ใช้"
              placeholderTextColor="#999"
              editable={!loading}
            />
          </View>

          {/* ชื่อฟาร์ม - แสดงเฉพาะเจ้าของฟาร์ม */}
          {!isAssistant && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>ชื่อฟาร์ม</Text>
              <TextInput
                style={styles.input}
                value={formData.farmName}
                onChangeText={(value) => handleInputChange('farmName', value)}
                placeholder="กรอกชื่อฟาร์ม"
                placeholderTextColor="#999"
                editable={!loading}
              />
            </View>
          )}

          {/* อีเมล - อ่านอย่างเดียว */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>E-mail</Text>
            <View style={styles.readOnlyContainer}>
              <Text style={styles.readOnlyText}>{user?.email}</Text>
            </View>
          </View>

          
        </View>

        {/* ปุ่มเปลี่ยนรหัสผ่าน - แสดงเฉพาะเจ้าของฟาร์ม */}
        {!user?.isAssistant && (
          <TouchableOpacity 
            style={[styles.resetButton, { backgroundColor: '#4CAF50' }]}
            onPress={() => navigation.navigate('ChangePassword')}
            disabled={loading}
          >
            <Text style={styles.resetButtonText}>เปลี่ยนรหัสผ่าน</Text>
          </TouchableOpacity>
        )}

        {/* ปุ่มรีเซ็ทรหัสผ่าน - แสดงเฉพาะเจ้าของฟาร์ม */}
        {!user?.isAssistant && (
          <TouchableOpacity 
            style={styles.resetButton} 
            onPress={handleResetPassword}
            disabled={loading}
          >
            <Text style={styles.resetButtonText}>รีเซ็ทรหัสผ่านผ่านอีเมล</Text>
          </TouchableOpacity>
        )}

        {/* ปุ่มออกจากระบบ */}
        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={handleLogout}
          disabled={loading}
        >
          <Text style={styles.logoutButtonText}>ออกจากระบบ</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#8B4513" />
          <Text style={styles.loadingText}>กำลังประมวลผล...</Text>
        </View>
      )}
    </View>
  );
};

export default EditProfileScreen;
