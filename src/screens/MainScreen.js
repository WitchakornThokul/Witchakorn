import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, SafeAreaView, StatusBar } from 'react-native';
import { useUser } from '../contexts/UserContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { styles } from '../styles/MainScreen.styles';

const MainScreen = ({ navigation }) => {
  const { user, setUser } = useUser();
  const [farmName, setFarmName] = useState('');

  // ตรวจสอบว่าผู้ใช้เป็นผู้ช่วยหรือไม่ เพื่อแสดงเมนูที่เหมาะสม
  const isAssistant = user?.isAssistant || user?.role === 'ผู้ช่วยฟาร์ม';
  
  /**
   * ฟังก์ชันดึงชื่อฟาร์มจากฐานข้อมูลแบบเรียลไทม์
   * รองรับทั้งเจ้าของฟาร์มและผู้ช่วย
   */
  useEffect(() => {
    const fetchFarmName = async () => {
      if (!user?.email) return;
      
      try {
        let ownerEmail = user.email;
        
        // ถ้าเป็นผู้ช่วย ให้ดึงข้อมูลจากเจ้าของฟาร์ม
        if (isAssistant && user.ownerId) {
          ownerEmail = user.ownerId;
        }
        
        // ดึงข้อมูลจาก users collection
        const userDocRef = doc(db, 'users', ownerEmail);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const currentFarmName = userData.farmName || '';
          setFarmName(currentFarmName);
          console.log('อัพเดตชื่อฟาร์ม:', currentFarmName);
        } else {
          // ถ้าไม่พบเอกสาร ใช้ชื่อจาก user context
          const fallbackName = user?.farmName || user?.ownerFarmName || '';
          setFarmName(fallbackName);
        }
      } catch (error) {
        console.error('ข้อผิดพลาดในการดึงชื่อฟาร์ม:', error);
        // ใช้ชื่อจาก user context เป็น fallback
        const fallbackName = user?.farmName || user?.ownerFarmName || '';
        setFarmName(fallbackName);
      }
    };

    fetchFarmName();
  }, [user, isAssistant]);

  /**
   * Hook สำหรับการรีเฟรชข้อมูลเมื่อผู้ใช้กลับมายังหน้านี้
   * ใช้ navigation listener เพื่อตรวจสอบการ focus ของหน้า
   */
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // รีเฟรชข้อมูลชื่อฟาร์มเมื่อกลับมาที่หน้านี้
      if (user?.email) {
        const fetchFarmName = async () => {
          try {
            let ownerEmail = user.email;
            
            if (isAssistant && user.ownerId) {
              ownerEmail = user.ownerId;
            }
            
            const userDocRef = doc(db, 'users', ownerEmail);
            const userDoc = await getDoc(userDocRef);
            
            if (userDoc.exists()) {
              const userData = userDoc.data();
              const currentFarmName = userData.farmName || '';
              setFarmName(currentFarmName);
            }
          } catch (error) {
            console.error('ข้อผิดพลาดในการรีเฟรชชื่อฟาร์ม:', error);
          }
        };
        
        fetchFarmName();
      }
    });

    return unsubscribe;
  }, [navigation, user, isAssistant]);

  /**
   * ส่วนแสดงผล UI หลักของระบบ
   * แสดงหน้าจอที่แตกต่างกันสำหรับเจ้าของฟาร์มและผู้ช่วย
   */
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* ส่วนหัวและข้อมูลโปรไฟล์ - แสดงชื่อฟาร์มและข้อมูลผู้ใช้ */}
      <View style={styles.header}>
        <Text style={[styles.title, isAssistant && styles.assistantTitle]}>
          {isAssistant ? `${farmName} - ผู้ช่วย` : farmName}
        </Text>
        
        {/* ส่วนโปรไฟล์ผู้ใช้ - แตะเพื่อแก้ไขข้อมูลส่วนตัว */}
        <TouchableOpacity 
          style={styles.profileSection}
          onPress={() => navigation.navigate('EditProfile')}
        >
          {user?.profileImage ? (
            <Image 
              source={{ uri: user.profileImage }} 
              style={styles.profileImage}
            />
          ) : (
            <View style={styles.profileCircle}>
              <Text style={styles.profileInitial}>
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </Text>
            </View>
          )}
          <Text style={styles.userName}>
            {user?.name} {isAssistant ? '(ผู้ช่วยฟาร์ม)' : '(เจ้าของฟาร์ม)'}
          </Text>
          {isAssistant && (
            <Text style={styles.farmInfo}>ฟาร์ม: {farmName}</Text>
          )}
          <Text style={styles.editHint}>แตะเพื่อแก้ไขข้อมูลส่วนตัว</Text>
        </TouchableOpacity>
      </View>

      {/* เมนูการทำงานหลัก - แสดงเมนูที่แตกต่างกันตามสิทธิ์ผู้ใช้ */}
      <View style={styles.menuContainer}>
        {/* เมนูแดชบอร์ด - แสดงข้อมูลสรุปและสถิติ */}
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => navigation.navigate('Dashboard')}
        >
          <Text style={styles.menuText}>ภาพรวมฟาร์ม</Text>
        </TouchableOpacity>

        {/* เมนูจัดการข้อมูลวัว - เพิ่ม แก้ไข ลบ และดูข้อมูลวัว */}
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => navigation.navigate('CowManagement')}
        >
          <Text style={styles.menuText}>จัดการข้อมูลวัวในฟาร์ม</Text>
        </TouchableOpacity>

        {/* เมนูประวัติสุขภาพ - ดูประวัติการรักษาและสถานะสุขภาพ */}
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => navigation.navigate('AllCowHistory')}
        >
          <Text style={styles.menuText}>ข้อมูล ประวัติสุขภาพและสถานะของวัว</Text>
        </TouchableOpacity>

        {/* เมนูการแจ้งเตือน - จัดการนัดหมายและการติดตาม */}
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => navigation.navigate('Appointment')}
        >
          <Text style={styles.menuText}>แจ้งเตือนและการติดตาม</Text>
        </TouchableOpacity>

        {/* เมนูเพิ่มสมาชิก - แสดงเฉพาะเจ้าของฟาร์ม */}
        {!isAssistant && (
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => navigation.navigate('AssistantManagement')}
          >
            <Text style={styles.menuText}>เพิ่มสมาชิก</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

export default MainScreen;
