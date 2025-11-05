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
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useUser } from '../contexts/UserContext';

const AddCowScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [showBreedDropdown, setShowBreedDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { user } = useUser();
  const [cowData, setCowData] = useState({
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

  // Default starter breeds
  const starterBreeds = [
    'โคนม',
    'โคเนื้อ',
    'โคพื้นเมือง',
    'โคบราห์มัน',
    'โคลิมูซิน',
    'โคชาโรเลส์'
  ];
  const [breedOptions, setBreedOptions] = useState(starterBreeds);

  useEffect(() => {
    // Fetch breeds added by this farm only
    const fetchFarmBreeds = async () => {
      if (!user || !user.email) return;
      let ownerEmail = user.email;
      if (user.isAssistant || user.role === 'ผู้ช่วยฟาร์ม') {
        ownerEmail = user.ownerId;
      }
      try {
        const { getDocs } = await import('firebase/firestore');
        const breedsQuery = collection(db, 'breeds');
        const breedsSnapshot = await getDocs(breedsQuery);
        const farmBreeds = breedsSnapshot.docs
          .map(doc => doc.data())
          .filter(b => b.ownerEmail === ownerEmail && b.name)
          .map(b => b.name);
        // Merge with starter breeds, remove duplicates
        const allBreeds = Array.from(new Set([...starterBreeds, ...farmBreeds]));
        setBreedOptions(allBreeds);
      } catch (e) {
        setBreedOptions(starterBreeds);
      }
    };
    fetchFarmBreeds();
  }, [user]);

  // Auto-generate cowId สำหรับเจ้าของฟาร์มแต่ละคน
  useEffect(() => {
    const generateCowId = async () => {
      try {
        console.log('Fetching data from cows collection...');
        
        // กำหนด ownerEmail ที่ถูกต้อง
        let ownerEmail = user.email;
        if (user.isAssistant || user.role === 'ผู้ช่วยฟาร์ม') {
          ownerEmail = user.ownerId; // ใช้ email ของเจ้าของฟาร์ม
        }
        
        // ดึงข้อมูลวัวของเจ้าของฟาร์มคนนี้เท่านั้น
        const cowsQuery = query(
          collection(db, 'cows'),
          where('ownerEmail', '==', ownerEmail)
        );
        const cowsSnapshot = await getDocs(cowsQuery);

        if (!cowsSnapshot.empty) {
          console.log('Cows collection fetched successfully:', cowsSnapshot.docs.map(doc => doc.data()));
          // ดึงรหัสวัวที่มีอยู่แล้วของเจ้าของฟาร์มคนนี้
          const cowIds = cowsSnapshot.docs
            .map(doc => doc.data().cowId)
            .filter(id => id && /^C\d+$/.test(id)) // รองรับ C1, C2, C10, C100 เป็นต้น
            .map(id => parseInt(id.substring(1), 10))
            .filter(num => !isNaN(num));

          // หารหัสถัดไปสำหรับเจ้าของฟาร์มคนนี้
          const nextId = cowIds.length > 0 ? Math.max(...cowIds) + 1 : 1;
          const formattedId = `C${nextId}`;

          setCowData(prevData => ({ ...prevData, cowId: formattedId }));
        } else {
          console.warn('No documents found for this farm owner. Starting with C1.');
          setCowData(prevData => ({ ...prevData, cowId: 'C1' }));
        }
      } catch (error) {
        console.error('Error generating cowId:', error);
        Alert.alert('Error', 'Failed to generate cow ID. Please try again.');
      }
    };

    if (user?.email) {
      generateCowId();
    }
  }, []);

  const statuses = [
    'ปกติ',
    'ป่วย',
    'อยู่ระหว่างการรักษา',
    'ถูกจำหน่าย',
    'ตาย'
  ];

  // เลือกรูปภาพ
  const pickImage = async () => {
    try {
      // ตรวจสอบและขอสิทธิ์
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'ต้องการสิทธิ์เข้าถึงรูปภาพ',
          'กรุณาอนุญาตให้แอปเข้าถึงรูปภาพในการตั้งค่า',
          [{ text: 'ตกลง' }]
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      console.log('Image picker result:', result);

      // Check for both canceled and cancelled for backward compatibility
      const isCanceled = result.canceled || result.cancelled;
      if (!isCanceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        console.log('Selected image:', selectedImage);
        setCowData({ ...cowData, image: selectedImage.uri });
        Alert.alert('สำเร็จ', 'เลือกรูปภาพเรียบร้อยแล้ว');
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('ข้อผิดพลาด', `ไม่สามารถเลือกรูปภาพได้: ${error.message}`);
    }
  };

  // ถ่ายรูป
  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'ต้องการสิทธิ์เข้าถึงกล้อง',
          'กรุณาอนุญาตให้แอปเข้าถึงกล้องในการตั้งค่า',
          [{ text: 'ตกลง' }]
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 0.8,
      });

      console.log('Camera result:', result);

      // Check for both canceled and cancelled for backward compatibility
      const isCanceled = result.canceled || result.cancelled;
      if (!isCanceled && result.assets && result.assets.length > 0) {
        const takenPhoto = result.assets[0];
        console.log('Taken photo:', takenPhoto);
        setCowData({ ...cowData, image: takenPhoto.uri });
        Alert.alert('สำเร็จ', 'ถ่ายรูปเรียบร้อยแล้ว');
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('ข้อผิดพลาด', `ไม่สามารถถ่ายรูปได้: ${error.message}`);
    }
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
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for comparison

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDay.getDay();

    const days = [];

    // Add days from the previous month
    for (let i = 0; i < firstDayOfWeek; i++) {
      const prevDate = new Date(year, month, -firstDayOfWeek + i + 1);
      days.push({
        date: prevDate,
        isCurrentMonth: false,
        isFuture: prevDate > today,
      });
    }

    // Add days from the current month    
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const currentDate = new Date(year, month, day);
      days.push({
        date: currentDate,
        isCurrentMonth: true,
        isFuture: currentDate > today,
      });
    }

    // Add days from the next month
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const nextDate = new Date(year, month + 1, day);
      days.push({
        date: nextDate,
        isCurrentMonth: false,
        isFuture: nextDate > today,
      });
    }

    return days;
  };

  const selectBirthDate = () => {
    setSelectedDate(cowData.birthDate ? new Date(cowData.birthDate) : new Date());
    setCurrentMonth(cowData.birthDate ? new Date(cowData.birthDate) : new Date());
    setShowDateModal(true);
  };

  const confirmDateSelection = () => {
    // Use local timezone instead of UTC to prevent date shifting
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    
    const age = calculateAge(dateString);
    setCowData({ 
      ...cowData, 
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

  const formatCalendarDate = (date) => {
    return date.getDate().toString(); // Only display the day number
  };

  const isSelectedDate = (date) => {
    return selectedDate && selectedDate.toDateString() === date.toDateString();
  };

  const selectCalendarDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for comparison
    const selectedDateOnly = new Date(date);
    selectedDateOnly.setHours(0, 0, 0, 0); // Reset time to start of day
    
    if (selectedDateOnly > today) {
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถเลือกวันที่ในอนาคตได้');
      return;
    }
    setSelectedDate(date);
  };

  // แสดงตัวเลือกรูปภาพ
  const showImagePicker = () => {
    Alert.alert(
      'เลือกรูปภาพวัว',
      'ต้องการเลือกรูปภาพจากแหล่งใด?',
      [
        { text: 'คลังรูปภาพ', onPress: pickImage },
        { text: 'กล้อง', onPress: takePhoto },
        { text: 'ลบรูปภาพ', onPress: () => setCowData({ ...cowData, image: null }), style: 'destructive' },
        { text: 'ยกเลิก', style: 'cancel' }
      ]
    );
  };

  // แสดงตัวเลือกพันธุ์วัว dropdown
  const selectBreed = (breed) => {
    setCowData({ ...cowData, breed });
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
    setCowData({ ...cowData, status });
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

  // บันทึกข้อมูลวัว
  const saveCow = async () => {
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!cowData.cowId || !cowData.breed) {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกรหัสวัวและพันธุ์วัว');
      return;
    }

    if (!user || !user.email) {
      Alert.alert('ข้อผิดพลาด', 'กรุณาเข้าสู่ระบบก่อน');
      return;
    }

    setLoading(true);
    try {
      // กำหนด ownerEmail ที่ถูกต้อง
      let ownerEmail = user.email;
      if (user.isAssistant || user.role === 'ผู้ช่วยฟาร์ม') {
        ownerEmail = user.ownerId; // ใช้ email ของเจ้าของฟาร์ม
        console.log('ผู้ช่วยกำลังบันทึกข้อมูลวัวใหม่สำหรับเจ้าของฟาร์ม:', ownerEmail);
      } else {
        console.log('เจ้าของฟาร์มกำลังบันทึกข้อมูลวัวใหม่:', ownerEmail);
      }
      
      const newCow = {
        cowId: cowData.cowId,
        cowName: cowData.cowName || '',
        breed: cowData.breed,
        birthDate: cowData.birthDate || '',
        age: cowData.age ? parseInt(cowData.age) : 0,
        weight: cowData.weight ? parseFloat(cowData.weight) : 0,
        height: cowData.height ? parseFloat(cowData.height) : 0,
        length: cowData.length ? parseFloat(cowData.length) : 0,
        status: cowData.status,
        vaccinations: cowData.vaccinations || '',
        treatments: cowData.treatments || '',
        image: cowData.image || null,
        ownerEmail: ownerEmail, // ใช้ ownerEmail ที่ถูกต้อง
        createdAt: new Date().toISOString(),
        lastCheckup: new Date().toISOString(),
        health: 'ดี',
        addedBy: user.email, // บันทึกว่าใครเป็นคนเพิ่ม
        addedByRole: user.isAssistant || user.role === 'ผู้ช่วยฟาร์ม' ? 'ผู้ช่วยฟาร์ม' : 'เจ้าของฟาร์ม'
      };

      const cowsCollection = collection(db, 'cows');
      const cowDoc = await addDoc(cowsCollection, newCow);
      
      // บันทึกประวัติการเพิ่มวัวใหม่
      const historyData = {
        cowId: cowData.cowId,
        cowDocId: cowDoc.id,
        ownerEmail: ownerEmail, // ใช้ ownerEmail ที่ถูกต้อง
        action: 'เพิ่มวัวใหม่',
        changes: {
          สร้างข้อมูล: 'เพิ่มวัวใหม่เข้าสู่ระบบ',
          รหัสวัว: cowData.cowId,
          พันธุ์: cowData.breed,
          สถานะ: cowData.status,
          ผู้เพิ่มข้อมูล: user.email,
          บทบาท: user.isAssistant || user.role === 'ผู้ช่วยฟาร์ม' ? 'ผู้ช่วยฟาร์ม' : 'เจ้าของฟาร์ม'
        },
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      
      const historyCollection = collection(db, 'cowHistory');
      await addDoc(historyCollection, historyData);
      
      console.log('บันทึกข้อมูลวัวและประวัติสำเร็จ:', cowData.cowId);
      
      Alert.alert(
        'สำเร็จ!',
        `บันทึกข้อมูลวัว ${cowData.cowId} เรียบร้อยแล้ว`,
        [{ text: 'ตกลง', onPress: () => navigation.goBack() }]
      );
      
    } catch (error) {
      console.error('ข้อผิดพลาดในการบันทึกข้อมูลวัว:', error);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถบันทึกข้อมูลวัวได้');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>

      {/* รูปภาพวัว */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>รูปภาพวัว</Text>
        <TouchableOpacity style={styles.imageContainer} onPress={showImagePicker}>
          {cowData.image ? (
            <Image source={{ uri: cowData.image }} style={styles.cowImage} />
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
          <Text style={styles.cowIdText}>{cowData.cowId || 'กำลังสร้างรหัส...'}</Text>
          <Text style={styles.cowIdSubtext}>รหัสสร้างอัตโนมัติ</Text>
        </View>

        {/* 2.2.3 ชื่อวัว */}
        <Text style={styles.label}>ชื่อวัว (ถ้ามี)</Text>
        <TextInput
          style={styles.input}
          placeholder="เช่น หนูน้อย"
          value={cowData.cowName}
          onChangeText={(text) => setCowData({ ...cowData, cowName: text })}
        />

        {/* 2.2.4 พันธุ์วัว */}
        <Text style={styles.label}>พันธุ์วัว *</Text>
        <TouchableOpacity 
          style={styles.pickerButton} 
          onPress={() => setShowBreedDropdown(!showBreedDropdown)}
        >
          <Text style={styles.pickerButtonText}>
            {cowData.breed || 'เลือกพันธุ์วัว'}
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
                data={breedOptions}
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
            {cowData.birthDate ? 
              `วันเกิด: ${new Date(cowData.birthDate).toLocaleDateString('th-TH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}` : 
              'เลือกวันเกิด'
            }
          </Text>
        </TouchableOpacity>

        <Text style={styles.label}>อายุ (เดือน)</Text>
        <TextInput
          style={[styles.input, { backgroundColor: '#F0F0F0' }]}
          placeholder="คำนวณอัตโนมัติจากวันเกิด"
          value={cowData.age}
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
          value={cowData.weight}
          onChangeText={(text) => setCowData({ ...cowData, weight: text })}
          keyboardType="numeric"
        />

        {/* 2.2.6.2 ขนาดตัว */}
        <Text style={styles.label}>ความสูง (เซนติเมตร)</Text>
        <TextInput
          style={styles.input}
          placeholder="เช่น 130"
          value={cowData.height}
          onChangeText={(text) => setCowData({ ...cowData, height: text })}
          keyboardType="numeric"
        />

        <Text style={styles.label}>ความยาว (เซนติเมตร)</Text>
        <TextInput
          style={styles.input}
          placeholder="เช่น 180"
          value={cowData.length}
          onChangeText={(text) => setCowData({ ...cowData, length: text })}
          keyboardType="numeric"
        />

        {/* 2.2.6.3 การฉีดวัคซีน */}
        <Text style={styles.label}>การฉีดวัคซีน</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="ระบุประวัติการฉีดวัคซีน..."
          value={cowData.vaccinations}
          onChangeText={(text) => setCowData({ ...cowData, vaccinations: text })}
          multiline
          numberOfLines={3}
        />

        {/* 2.2.6.4 การรักษา */}
        <Text style={styles.label}>การรักษา</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="ระบุประวัติการรักษา..."
          value={cowData.treatments}
          onChangeText={(text) => setCowData({ ...cowData, treatments: text })}
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
            {cowData.status || 'เลือกสถานะ'}
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
          onPress={saveCow}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'กำลังบันทึก...' : 'บันทึกข้อมูลวัว'}
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
          <Text style={styles.loadingText}>กำลังบันทึกข้อมูล...</Text>
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
            {/* Calendar Header */}
            <View style={styles.calendarHeader}>
              <TouchableOpacity onPress={goToPreviousMonth} style={styles.calendarNavButton}>
                <Text style={styles.calendarNavText}>◀</Text>
              </TouchableOpacity>

              <Text style={styles.calendarTitle}>{getMonthYearText()}</Text>

              <TouchableOpacity onPress={goToNextMonth} style={styles.calendarNavButton}>
                <Text style={styles.calendarNavText}>▶</Text>
              </TouchableOpacity>
            </View>

            {/* Weekdays Row */}
            <View style={styles.weekDaysRow}>
              {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map((day, index) => (
                <View key={index} style={styles.weekDayCell}>
                  <Text style={styles.weekDayText}>{day}</Text>
                </View>
              ))}
            </View>

            {/* Calendar Grid */}
            <View style={styles.calendarGrid}>
              {generateCalendar(currentMonth).map((dayInfo, index) => (
                <TouchableOpacity
                  key={`calendar-${dayInfo.date.getTime()}-${index}`}
                  style={[
                    styles.calendarDay,
                    !dayInfo.isCurrentMonth && styles.calendarDayOtherMonth,
                    dayInfo.isFuture && styles.calendarDayFuture,
                    isSelectedDate(dayInfo.date) && styles.calendarDaySelected,
                  ]}
                  onPress={() => selectCalendarDate(dayInfo.date)}
                  disabled={dayInfo.isFuture}
                >
                  <Text
                    style={[
                      styles.calendarDayText,
                      !dayInfo.isCurrentMonth && styles.calendarDayTextOtherMonth,
                      dayInfo.isFuture && styles.calendarDayTextFuture,
                      isSelectedDate(dayInfo.date) && styles.calendarDayTextSelected,
                    ]}
                  >
                    {formatCalendarDate(dayInfo.date)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Calendar Actions */}
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

export default AddCowScreen;
