import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert, 
  ActivityIndicator,
  Image,
  Modal,
  FlatList
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { styles } from '../styles/AddCowScreen.styles';
import { doc, updateDoc, getDoc, collection, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useUser } from '../contexts/UserContext';

const EditCowScreen = ({ navigation, route }) => {
  const { cowId, cowData } = route.params;
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showBreedDropdown, setShowBreedDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { user } = useUser();
  const [editedCowData, setEditedCowData] = useState({
    cowId: '',
    cowName: '',
    breed: '',
    birthDate: '',
    age: '',
    weight: '',
    height: '',
    length: '',
    status: 'ปกติ',
    vaccinations: '',
    treatments: '',
    image: null
  });

  const breeds = [
    'โคนม',
    'โคเนื้อ', 
    'โคพื้นเมือง',
    'โคบราห์มัน',
    'โคลิมูซิน',
    'โคชาโรเลส์'
  ];

  const statuses = [
    'ปกติ',
    'ป่วย',
    'อยู่ระหว่างการรักษา',
    'ถูกจำหน่าย',
    'ตาย'
  ];

  // โหลดข้อมูลวัวเริ่มต้น
  useEffect(() => {
    loadCowData();
  }, []);

  const loadCowData = async () => {
    try {
      setInitialLoading(true);
      console.log('🐄 กำลังโหลดข้อมูลวัว:', cowId);
      
      if (cowData) {
        // ใช้ข้อมูลที่ส่งมา
        setEditedCowData({
          cowId: cowData.cowId || '',
          cowName: cowData.cowName || '',
          breed: cowData.breed || '',
          birthDate: cowData.birthDate || '',
          age: cowData.age ? cowData.age.toString() : '',
          weight: cowData.weight ? cowData.weight.toString() : '',
          height: cowData.height ? cowData.height.toString() : '',
          length: cowData.length ? cowData.length.toString() : '',
          status: cowData.status || 'ปกติ',
          vaccinations: cowData.vaccinations || '',
          treatments: cowData.treatments || '',
          image: cowData.image || null
        });
      } else {
        // ดึงข้อมูลจาก Firebase ใหม่
        const cowDoc = await getDoc(doc(db, 'cows', cowId));
        if (cowDoc.exists()) {
          const data = cowDoc.data();
          setEditedCowData({
            cowId: data.cowId || '',
            cowName: data.cowName || '',
            breed: data.breed || '',
            birthDate: data.birthDate || '',
            age: data.age ? data.age.toString() : '',
            weight: data.weight ? data.weight.toString() : '',
            height: data.height ? data.height.toString() : '',
            length: data.length ? data.length.toString() : '',
            status: data.status || 'ปกติ',
            vaccinations: data.vaccinations || '',
            treatments: data.treatments || '',
            image: data.image || null
          });
        }
      }
      
      console.log('✅ โหลดข้อมูลวัวสำเร็จ');
    } catch (error) {
      console.error('❌ ข้อผิดพลาดในการโหลดข้อมูลวัว:', error);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลวัวได้');
    } finally {
      setInitialLoading(false);
    }
  };

  // เลือกรูปภาพ
  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('ข้อผิดพลาด', 'ต้องการสิทธิ์เข้าถึงรูปภาพ');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setEditedCowData({ ...editedCowData, image: result.assets[0].uri });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถเลือกรูปภาพได้');
    }
  };

  // ถ่ายรูป
  const takePhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('ข้อผิดพลาด', 'ต้องการสิทธิ์เข้าถึงกล้อง');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setEditedCowData({ ...editedCowData, image: result.assets[0].uri });
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถถ่ายรูปได้');
    }
  };

  // แสดงตัวเลือกรูปภาพ
  const showImagePicker = () => {
    Alert.alert(
      'เลือกรูปภาพวัว',
      'ต้องการเลือกรูปภาพจากแหล่งใด?',
      [
        { text: 'กล้อง', onPress: takePhoto },
        { text: 'คลังรูปภาพ', onPress: pickImage },
        { text: 'ยกเลิก', style: 'cancel' }
      ]
    );
  };

  // คำนวณอายุจากวันเกิด
  const calculateAge = (birthDate) => {
    if (!birthDate) return '';
    
    const birth = new Date(birthDate);
    const today = new Date();
    
    let ageYears = today.getFullYear() - birth.getFullYear();
    let ageMonths = today.getMonth() - birth.getMonth();
    
    if (ageMonths < 0) {
      ageYears--;
      ageMonths += 12;
    }
    
    if (today.getDate() < birth.getDate()) {
      ageMonths--;
      if (ageMonths < 0) {
        ageYears--;
        ageMonths += 12;
      }
    }
    
    const totalMonths = (ageYears * 12) + ageMonths;
    return totalMonths.toString();
  };

  // ปฏิทินฟังก์ชัน
  const generateCalendar = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // เพิ่มวันว่างจากเดือนก่อน
    for (let i = 0; i < firstDayOfWeek; i++) {
      const prevDate = new Date(year, month, -firstDayOfWeek + i + 1);
      days.push({
        date: prevDate,
        isCurrentMonth: false,
        isFuture: prevDate > new Date()
      });
    }
    
    // เพิ่มวันในเดือนปัจจุบัน
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const currentDate = new Date(year, month, day);
      days.push({
        date: currentDate,
        isCurrentMonth: true,
        isFuture: currentDate > new Date()
      });
    }
    
    // เพิ่มวันในเดือนถัดไป
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const nextDate = new Date(year, month + 1, day);
      days.push({
        date: nextDate,
        isCurrentMonth: false,
        isFuture: nextDate > new Date()
      });
    }
    
    return days;
  };

  const selectBirthDate = () => {
    setSelectedDate(editedCowData.birthDate ? new Date(editedCowData.birthDate) : new Date());
    setCurrentMonth(editedCowData.birthDate ? new Date(editedCowData.birthDate) : new Date());
    setShowDateModal(true);
  };

  const confirmDateSelection = () => {
    const dateString = selectedDate.toISOString().split('T')[0];
    const age = calculateAge(dateString);
    setEditedCowData({ 
      ...editedCowData, 
      birthDate: dateString,
      age: age
    });
    setShowDateModal(false);
  };

  const goToPreviousMonth = () => {
    const prevMonth = new Date(currentMonth);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    setCurrentMonth(prevMonth);
  };

  const goToNextMonth = () => {
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setCurrentMonth(nextMonth);
  };

  const getMonthYearText = () => {
    return currentMonth.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long'
    });
  };

  const isSelectedDate = (date) => {
    return selectedDate.toDateString() === date.toDateString();
  };

  const selectCalendarDate = (date) => {
    if (date > new Date()) {
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถเลือกวันที่ในอนาคตได้');
      return;
    }
    setSelectedDate(date);
  };

  const formatCalendarDate = (date) => {
    return date.getDate().toString();
  };

  // แสดงตัวเลือกพันธุ์วัว dropdown
  const selectBreed = (breed) => {
    setEditedCowData({ ...editedCowData, breed });
    setShowBreedDropdown(false);
  };

  const renderBreedItem = ({ item }) => (
    <TouchableOpacity
      style={styles.dropdownItem}
      onPress={() => selectBreed(item)}
    >
      <Text style={styles.dropdownItemText}>{item}</Text>
    </TouchableOpacity>
  );

  // แสดงตัวเลือกสถานะ dropdown
  const selectStatus = (status) => {
    setEditedCowData({ ...editedCowData, status });
    setShowStatusDropdown(false);
  };

  const renderStatusItem = ({ item }) => (
    <TouchableOpacity
      style={styles.dropdownItem}
      onPress={() => selectStatus(item)}
    >
      <Text style={styles.dropdownItemText}>{item}</Text>
    </TouchableOpacity>
  );

  // บันทึกประวัติการเปลี่ยนแปลง
  const saveChangeHistory = async (changeType, description, oldValue, newValue) => {
    try {
      if (!user || !user.email) return;
      // กำหนด ownerEmail ที่ถูกต้อง
      let ownerEmail = user.email;
      if (user.isAssistant || user.role === 'ผู้ช่วยฟาร์ม') {
        ownerEmail = user.ownerId; // ใช้ email ของเจ้าของฟาร์ม
      }
      const historyData = {
        cowId: cowData?.id || cowId,
        action: changeType,
        changes: changes || [],
        timestamp: new Date().toISOString(),
        changedBy: user.email,
        changedByRole: user.isAssistant || user.role === 'ผู้ช่วยฟาร์ม' ? 'ผู้ช่วยฟาร์ม' : 'เจ้าของฟาร์ม',
        ownerEmail: ownerEmail
      };
      await addDoc(collection(db, 'cow_history'), historyData);
      console.log('✅ บันทึกประวัติสำเร็จ:', changeType);
    } catch (error) {
      console.error('❌ Error saving history:', error);
    }
  };

  // ตรวจสอบการเปลี่ยนแปลงและบันทึกประวัติ
  const checkAndSaveChanges = async (originalData, newData) => {
    const changes = [];
    if (originalData.weight !== newData.weight) {
      changes.push(`น้ำหนัก: ${originalData.weight} กก. → ${newData.weight} กก.`);
    }
    if (originalData.status !== newData.status) {
      changes.push(`สถานะ: ${originalData.status} → ${newData.status}`);
    }
    if (originalData.breed !== newData.breed) {
      changes.push(`พันธุ์: ${originalData.breed} → ${newData.breed}`);
    }
    if (originalData.vaccinations !== newData.vaccinations) {
      changes.push(`วัคซีน: ${newData.vaccinations || 'ไม่มี'}`);
    }
    if (originalData.treatments !== newData.treatments) {
      changes.push(`การรักษา: ${newData.treatments || 'ไม่มี'}`);
    }
    // ส่ง changes array ไปบันทึกใน cowHistory
    await saveChangeHistory('แก้ไขข้อมูลวัว', '', '', '', changes);
  };
  // บันทึกการแก้ไข
  const updateCow = async () => {
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!editedCowData.cowId || !editedCowData.breed) {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกรหัสวัวและพันธุ์วัว');
      return;
    }

    if (!user || !user.email) {
      Alert.alert('ข้อผิดพลาด', 'กรุณาเข้าสู่ระบบก่อน');
      return;
    }

    setLoading(true);
    try {
      console.log('🐄 กำลังอัปเดตข้อมูลวัว:', editedCowData.cowId);
      
      // เก็บข้อมูลเดิมสำหรับเปรียบเทียบ
      const originalData = cowData || {};
      // กำหนด ownerEmail ที่ถูกต้อง
      let ownerEmail = user.email;
      if (user.isAssistant || user.role === 'ผู้ช่วยฟาร์ม') {
        ownerEmail = user.ownerId; // ใช้ email ของเจ้าของฟาร์ม
      }
      
      const updatedCow = {
        cowId: editedCowData.cowId,
        cowName: editedCowData.cowName || '',
        breed: editedCowData.breed,
        birthDate: editedCowData.birthDate || '',
        age: editedCowData.age ? parseInt(editedCowData.age) : 0,
        weight: editedCowData.weight ? parseFloat(editedCowData.weight) : 0,
        height: editedCowData.height ? parseFloat(editedCowData.height) : 0,
        length: editedCowData.length ? parseFloat(editedCowData.length) : 0,
        status: editedCowData.status,
        vaccinations: editedCowData.vaccinations || '',
        treatments: editedCowData.treatments || '',
        image: editedCowData.image || null,
        ownerEmail: ownerEmail, // ใช้ ownerEmail ที่ถูกต้อง
        updatedAt: new Date().toISOString(),
        lastCheckup: new Date().toISOString(),
        lastUpdatedBy: user.email, // บันทึกว่าใครเป็นคนแก้ไขล่าสุด
        lastUpdatedByRole: user.isAssistant || user.role === 'ผู้ช่วยฟาร์ม' ? 'ผู้ช่วยฟาร์ม' : 'เจ้าของฟาร์ม'
      };

      // อัปเดตข้อมูลใน Firebase
      const docId = cowData?.id || cowId;
      await updateDoc(doc(db, 'cows', docId), updatedCow);
      
      // บันทึกประวัติการแก้ไข
      const changes = [];
      
      if (originalData.weight !== updatedCow.weight) {
        changes.push(`น้ำหนัก: ${originalData.weight || 0} กก. → ${updatedCow.weight} กก.`);
      }
      if (originalData.status !== updatedCow.status) {
        changes.push(`สถานะ: ${originalData.status || 'ไม่ระบุ'} → ${updatedCow.status}`);
      }
      if (originalData.breed !== updatedCow.breed) {
        changes.push(`พันธุ์: ${originalData.breed || 'ไม่ระบุ'} → ${updatedCow.breed}`);
      }
      if (originalData.vaccinations !== updatedCow.vaccinations) {
  changes.push(`วัคซีน: ${updatedCow.vaccinations || 'ไม่มี'}`);
      }
      if (originalData.treatments !== updatedCow.treatments) {
  changes.push(`การรักษา: ${updatedCow.treatments || 'ไม่มี'}`);
      }
      
      if (changes.length > 0) {
        const historyData = {
          cowId: editedCowData.cowId,
          cowDocId: docId,
          ownerEmail: ownerEmail, // ใช้ ownerEmail ที่ถูกต้อง
          action: 'แก้ไขข้อมูลวัว',
          changes: changes,
          timestamp: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          changedBy: user.email, // บันทึกว่าใครเป็นคนแก้ไข
          changedByRole: user.isAssistant || user.role === 'ผู้ช่วยฟาร์ม' ? 'ผู้ช่วยฟาร์ม' : 'เจ้าของฟาร์ม'
        };
        
        const historyCollection = collection(db, 'cowHistory');
        await addDoc(historyCollection, historyData);
      }
      
      console.log('✅ อัปเดตข้อมูลวัวและประวัติสำเร็จ:', editedCowData.cowId);
      
      Alert.alert(
        'สำเร็จ!',
        `อัปเดตข้อมูลวัว ${editedCowData.cowId} เรียบร้อยแล้ว`,
        [{ text: 'ตกลง', onPress: () => navigation.goBack() }]
      );
      
    } catch (error) {
      console.error('❌ ข้อผิดพลาดในการอัปเดตข้อมูลวัว:', error);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถอัปเดตข้อมูลวัวได้');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={styles.loadingText}>กำลังโหลดข้อมูลวัว...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>

      {/* รูปภาพวัว */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>รูปภาพวัว</Text>
        <TouchableOpacity style={styles.imageContainer} onPress={showImagePicker}>
          {editedCowData.image ? (
            <Image source={{ uri: editedCowData.image }} style={styles.cowImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderText}>เพิ่มรูปภาพวัว</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* ข้อมูลพื้นฐาน */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ข้อมูลพื้นฐาน</Text>
        
        {/* 2.2.1 รหัสวัว */}
        <Text style={styles.label}>รหัสวัว (ID) *</Text>
        <View style={styles.cowIdDisplay}>
          <Text style={styles.cowIdText}>{editedCowData.cowId}</Text>
          <Text style={styles.cowIdSubtext}>ไม่สามารถแก้ไขรหัสวัวได้</Text>
        </View>

        {/* 2.2.3 ชื่อวัว */}
        <Text style={styles.label}>ชื่อวัว (ถ้ามี)</Text>
        <TextInput
          style={styles.input}
          placeholder="เช่น หนูน้อย"
          value={editedCowData.cowName}
          onChangeText={(text) => setEditedCowData({ ...editedCowData, cowName: text })}
        />

        {/* 2.2.4 พันธุ์วัว */}
        <Text style={styles.label}>พันธุ์วัว *</Text>
        <TouchableOpacity 
          style={styles.pickerButton} 
          onPress={() => setShowBreedDropdown(!showBreedDropdown)}
        >
          <Text style={styles.pickerButtonText}>
            {editedCowData.breed || 'เลือกพันธุ์วัว'}
          </Text>
          <Text style={styles.pickerArrow}>{showBreedDropdown ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        {/* Dropdown Modal */}
        <Modal
          visible={showBreedDropdown}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowBreedDropdown(false)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay}
            onPress={() => setShowBreedDropdown(false)}
          >
            <View style={styles.dropdownContainer}>
              <FlatList
                data={breeds}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderBreedItem}
                style={styles.dropdown}
              />
            </View>
          </TouchableOpacity>
        </Modal>

        {/* 2.2.5 วันเกิด/อายุ */}
        <Text style={styles.label}>วันเกิด</Text>
        <TouchableOpacity 
          style={styles.dateButton}
          onPress={selectBirthDate}
        >
          <Text style={styles.dateButtonText}>
            {editedCowData.birthDate ? 
              ` ${new Date(editedCowData.birthDate).toLocaleDateString('th-TH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}` : 
              ' เลือกวันเกิด'
            }
          </Text>
        </TouchableOpacity>

        <Text style={styles.label}>อายุ (เดือน)</Text>
        <TextInput
          style={[styles.input, { backgroundColor: '#F0F0F0' }]}
          placeholder="คำนวณอัตโนมัติจากวันเกิด"
          value={editedCowData.age}
          editable={false}
        />
      </View>

      {/* ประวัติสุขภาพ */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ประวัติสุขภาพ</Text>
        
        {/* 2.2.6.1 น้ำหนัก */}
        <Text style={styles.label}>น้ำหนัก (กิโลกรัม)</Text>
        <TextInput
          style={styles.input}
          placeholder="เช่น 450"
          value={editedCowData.weight}
          onChangeText={(text) => setEditedCowData({ ...editedCowData, weight: text })}
          keyboardType="numeric"
        />

        {/* 2.2.6.2 ขนาดตัว */}
        <Text style={styles.label}>ความสูง (เซนติเมตร)</Text>
        <TextInput
          style={styles.input}
          placeholder="เช่น 130"
          value={editedCowData.height}
          onChangeText={(text) => setEditedCowData({ ...editedCowData, height: text })}
          keyboardType="numeric"
        />

        <Text style={styles.label}>ความยาว (เซนติเมตร)</Text>
        <TextInput
          style={styles.input}
          placeholder="เช่น 180"
          value={editedCowData.length}
          onChangeText={(text) => setEditedCowData({ ...editedCowData, length: text })}
          keyboardType="numeric"
        />

        {/* 2.2.6.3 การฉีดวัคซีน */}
        <Text style={styles.label}>การฉีดวัคซีน</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="ระบุประวัติการฉีดวัคซีน..."
          value={editedCowData.vaccinations}
          onChangeText={(text) => setEditedCowData({ ...editedCowData, vaccinations: text })}
          multiline
          numberOfLines={3}
        />

        {/* 2.2.6.4 การรักษา */}
        <Text style={styles.label}>การรักษา</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="ระบุประวัติการรักษา..."
          value={editedCowData.treatments}
          onChangeText={(text) => setEditedCowData({ ...editedCowData, treatments: text })}
          multiline
          numberOfLines={3}
        />
      </View>

      {/* สถานะ */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>สถานะ</Text>
        <TouchableOpacity 
          style={styles.pickerButton} 
          onPress={() => setShowStatusDropdown(!showStatusDropdown)}
        >
          <Text style={styles.pickerButtonText}>
            {editedCowData.status || 'เลือกสถานะ'}
          </Text>
          <Text style={styles.pickerArrow}>{showStatusDropdown ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        {/* Status Dropdown Modal */}
        <Modal
          visible={showStatusDropdown}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowStatusDropdown(false)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay}
            onPress={() => setShowStatusDropdown(false)}
          >
            <View style={styles.dropdownContainer}>
              <FlatList
                data={statuses}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderStatusItem}
                style={styles.dropdown}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      </View>

      {/* ปุ่มบันทึก */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.saveButton, loading && styles.buttonDisabled]}
          onPress={updateCow}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'กำลังอัปเดต...' : 'บันทึกการแก้ไข'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>ยกเลิก</Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text style={styles.loadingText}>กำลังอัปเดตข้อมูล...</Text>
        </View>
      )}

      {/* Modal เลือกวันเกิด */}
      <Modal
        visible={showDateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.calendarModal}>
            {/* Header ปฏิทิน */}
            <View style={styles.calendarHeader}>
              <TouchableOpacity onPress={goToPreviousMonth} style={styles.calendarNavButton}>
                <Text style={styles.calendarNavText}>◀</Text>
              </TouchableOpacity>
              
              <Text style={styles.calendarTitle}>{getMonthYearText()}</Text>
              
              <TouchableOpacity onPress={goToNextMonth} style={styles.calendarNavButton}>
                <Text style={styles.calendarNavText}>▶</Text>
              </TouchableOpacity>
            </View>

            {/* วันในสัปดาห์ */}
            <View style={styles.weekDaysRow}>
              {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map((day, index) => (
                <View key={index} style={styles.weekDayCell}>
                  <Text style={styles.weekDayText}>{day}</Text>
                </View>
              ))}
            </View>

            {/* ปฏิทิน */}
            <View style={styles.calendarGrid}>
              {generateCalendar(currentMonth).map((dayInfo, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.calendarDay,
                    !dayInfo.isCurrentMonth && styles.calendarDayOtherMonth,
                    dayInfo.isFuture && styles.calendarDayFuture,
                    isSelectedDate(dayInfo.date) && styles.calendarDaySelected
                  ]}
                  onPress={() => selectCalendarDate(dayInfo.date)}
                  disabled={dayInfo.isFuture}
                >
                  <Text style={[
                    styles.calendarDayText,
                    !dayInfo.isCurrentMonth && styles.calendarDayTextOtherMonth,
                    dayInfo.isFuture && styles.calendarDayTextFuture,
                    isSelectedDate(dayInfo.date) && styles.calendarDayTextSelected
                  ]}>
                    {formatCalendarDate(dayInfo.date)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* ปุ่มดำเนินการ */}
            <View style={styles.calendarActions}>
              <TouchableOpacity 
                style={styles.calendarCancelButton}
                onPress={() => setShowDateModal(false)}
              >
                <Text style={styles.calendarCancelText}>ยกเลิก</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.calendarConfirmButton}
                onPress={confirmDateSelection}
              >
                <Text style={styles.calendarConfirmText}>ยืนยัน</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default EditCowScreen;
