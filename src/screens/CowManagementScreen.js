import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, TextInput, ActivityIndicator, Alert, ScrollView, Image, RefreshControl, Modal } from 'react-native';
import { styles } from '../styles/CowManagementScreen.styles';
import { collection, getDocs, /* deleteDoc, */ doc, query, where, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useUser } from '../contexts/UserContext';
import { useFocusEffect } from '@react-navigation/native';

const CowManagementScreen = ({ navigation }) => {
  // State สำหรับการค้นหาและกรองข้อมูล
  const [searchText, setSearchText] = useState('');
  const [cows, setCows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Context และ Modal states
  const { user } = useUser();
  const [modalVisibleCowInfo, setModalVisibleCowInfo] = useState(false);
  const [selectedCow, setSelectedCow] = useState(null);
  
  /**
   * ฟังก์ชันดึงข้อมูลวัวจาก Firebase
   * รองรับทั้งเจ้าของฟาร์มและผู้ช่วย โดยแสดงข้อมูลเดียวกัน
   * แสดงวัวทุกสถานะ รวมถึงวัวที่ตายแล้ว
   */
  const fetchCows = async () => {
    try {
      console.log('🐄 กำลังดึงข้อมูลวัวจาก Firebase...');
      setLoading(true);
      
      if (!user || !user.email) {
        console.log('❌ ไม่พบข้อมูลผู้ใช้');
        Alert.alert('ข้อผิดพลาด', 'กรุณาเข้าสู่ระบบก่อน');
        setCows([]);
        return;
      }

      // กำหนด ownerEmail ที่จะใช้ query
      let ownerEmail = user.email;
      if (user.isAssistant || user.role === 'ผู้ช่วยฟาร์ม') {
        // ถ้าเป็นผู้ช่วย ให้ใช้ ownerId (email ของเจ้าของฟาร์ม)
        ownerEmail = user.ownerId;
        console.log('� ผู้ช่วยกำลังดูข้อมูลวัวของเจ้าของฟาร์ม:', ownerEmail);
      } else {
        console.log('👤 เจ้าของฟาร์มกำลังดูข้อมูลวัวของตัวเอง:', ownerEmail);
      }

      if (!ownerEmail) {
        console.log('❌ ไม่พบข้อมูลเจ้าของฟาร์ม');
        Alert.alert('ข้อผิดพลาด', 'ไม่พบข้อมูลเจ้าของฟาร์ม');
        setCows([]);
        return;
      }
      
      const cowsCollection = collection(db, 'cows');
      // กรองข้อมูลตาม email ของเจ้าของฟาร์ม
      const q = query(cowsCollection, where('ownerEmail', '==', ownerEmail));
      const cowsSnapshot = await getDocs(q);
      // แสดงวัวทุกสถานะรวมถึง "ตาย" ไม่กรองออกจากรายการ
      const cowsList = cowsSnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(item => !item.isDeleted); // แสดงทุกสถานะ รวมถึงสถานะ "ตาย"
      
      console.log('✅ ดึงข้อมูลวัวสำเร็จ:', cowsList.length, 'ตัว สำหรับเจ้าของฟาร์ม:', ownerEmail);
      setCows(cowsList);
      
    } catch (error) {
      console.error('❌ ข้อผิดพลาดในการดึงข้อมูลวัว:', error);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถดึงข้อมูลวัวได้');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /**
   * ฟังก์ชันรีเฟรชข้อมูล - Pull to refresh
   * เรียกใช้เมื่อผู้ใช้ลากหน้าจอลงเพื่ออัปเดตข้อมูล
   */
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCows();
  };

  /**
   * ฟังก์ชันลบข้อมูลวัว (Soft Delete)
   * เฉพาะเจ้าของฟาร์มเท่านั้นที่สามารถลบได้
   * ใช้วิธี Soft Delete คือเพียงทำเครื่องหมายเป็น isDeleted แทนการลบจริง
   */
  const deleteCow = async (cowDocId, cowId) => {
    // ตรวจสอบสิทธิ์: ผู้ช่วยไม่สามารถลบวัวได้
    if (user.isAssistant || user.role === 'ผู้ช่วยฟาร์ม') {
      Alert.alert(
        'ไม่มีสิทธิ์',
        'ผู้ช่วยฟาร์มไม่สามารถลบข้อมูลวัวได้\nกรุณาติดต่อเจ้าของฟาร์มเพื่อดำเนินการ',
        [{ text: 'เข้าใจแล้ว' }]
      );
      return;
    }

    Alert.alert(
      'ยืนยันการลบ',
      `ต้องการลบข้อมูลวัว ${cowId} หรือไม่?`,
      [
        { text: 'ยกเลิก', style: 'cancel' },
        { 
          text: 'ลบ', 
          style: 'destructive',
          onPress: async () => {
            try {
              // Soft delete: mark as deleted instead of removing the document
              const cowRef = doc(db, 'cows', cowDocId);
              await updateDoc(cowRef, { isDeleted: true, deletedAt: serverTimestamp() });
              console.log('✅ ลบวัว', cowId, 'สำเร็จ');
              Alert.alert('สำเร็จ', `ลบข้อมูลวัว ${cowId} เรียบร้อยแล้ว`);
              fetchCows(); // รีโหลดข้อมูล
            } catch (error) {
              console.error('❌ ข้อผิดพลาดในการลบวัว:', error);
              Alert.alert('ข้อผิดพลาด', 'ไม่สามารถลบข้อมูลวัวได้');
            }
          }
        }
      ]
    );
  };

  // โหลดข้อมูลเมื่อ component mount
  useEffect(() => {
    fetchCows();
  }, []);

  /**
   * Hook สำหรับรีโหลดข้อมูลเมื่อกลับเข้าหน้า
   * ทำงานเมื่อผู้ใช้กลับมาจากหน้าแก้ไขข้อมูลวัว
   */
  useFocusEffect(
    React.useCallback(() => {
      fetchCows();
    }, [user])
  );

  /**
   * ฟังก์ชันกรองข้อมูลวัวตามคำค้นหา
   * ค้นหาได้จาก: รหัสวัว, ชื่อวัว, และสายพันธุ์
   */
  const filteredCows = cows.filter(cow => {
    const q = searchText.toLowerCase();
    return (
      cow.cowId?.toLowerCase().includes(q) ||
      cow.cowName?.toLowerCase().includes(q) ||
      cow.breed?.toLowerCase().includes(q)
    );
  });

  /**
   * ฟังก์ชันแปลงสถานะวัวเป็นข้อมูลสุขภาพ
   * ใช้สำหรับแสดงสถานะสุขภาพในรูปแบบที่เข้าใจง่าย
   */
  const getHealthFromStatus = (status) => {
    switch (status) {
      case 'ปกติ':
        return 'ดี';
      case 'ป่วย':
        return 'ป่วย';
      case 'อยู่ระหว่างการรักษา':
        return 'อยู่ระหว่างการรักษา';
      case 'ถูกจำหน่าย':
        return 'ไม่แสดง';
      case 'ตาย':
        return 'ตาย';
      default:
        return '-';
    }
  };

  /**
   * ฟังก์ชันคำนวณและแสดงอายุวัว
   * แปลงวันเกิดเป็นอายุในรูปแบบ ปี เดือน วัน
   */
  const getCowAgeText = (birthDate) => {
    if (!birthDate) return '-';
    const birth = new Date(birthDate);
    const now = new Date();
    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    let days = now.getDate() - birth.getDate();
    if (days < 0) {
      months--;
      // days in previous month
      const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }
    let result = '';
    if (years > 0) result += years + ' ปี ';
    if (months > 0) result += months + ' เดือน';
    if (years === 0 && months === 0) result = days + ' วัน';
    return result.trim();
  };

  const renderCowItem = ({ item }) => {
    const cowImage = item.image || item.imageUrl;
    return (
      <TouchableOpacity
        style={styles.cowItem}
        activeOpacity={0.85}
        onPress={() => {
          setSelectedCow(item);
          setModalVisibleCowInfo(true);
        }}
      >
        <View style={styles.cowImageContainer}>
          {cowImage ? (
            <Image 
              source={{ uri: cowImage }} 
              style={styles.cowImage}
              onError={() => console.error('❌ ไม่สามารถโหลดรูปวัวได้:', item.cowId)}
            />
          ) : (
            <View style={styles.cowImagePlaceholder}>
              <Text style={styles.cowImagePlaceholderText}>วัว</Text>
            </View>
          )}
        </View>
        <View style={styles.cowInfo}>
          <Text style={styles.cowId}>
            {item.cowId}
            {item.cowName ? ` - ${item.cowName}` : ''}
          </Text>
          <Text style={styles.cowBreed}>{item.breed}</Text>
          <Text style={styles.cowStatus}>สถานะ: {item.status}</Text>
          
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            onPress={() => navigation.navigate('EditCow', { cowId: item.id, cowData: item })}
            style={styles.editButton}
          >
            <Text style={styles.editButtonText}>แก้ไข</Text>
          </TouchableOpacity>
          {/* ปุ่มลบ - แสดงเฉพาะเจ้าของฟาร์ม */}
          {!(user.isAssistant || user.role === 'ผู้ช่วยฟาร์ม') && (
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={() => deleteCow(item.id, item.cowId)}
            >
              <Text style={styles.deleteButtonText}>ลบ</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // เรียงลำดับวัวที่ผ่านการกรองแล้วตาม cowId ก่อนแสดงผลใน FlatList
  const sortedFilteredCows = filteredCows.sort((a, b) => a.cowId.localeCompare(b.cowId));

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={styles.loadingText}>กำลังโหลดข้อมูลวัว...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Modal แสดงข้อมูลวัว */}
      <Modal
        visible={modalVisibleCowInfo}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setModalVisibleCowInfo(false)}
      >
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }}
          activeOpacity={1}
          onPress={() => setModalVisibleCowInfo(false)}
        >
          <TouchableOpacity
            style={{
              backgroundColor: '#fff',
              borderRadius: 16,
              padding: 24,
              minWidth: 280,
              maxWidth: 340,
              elevation: 8,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              alignItems: 'center'
            }}
            activeOpacity={1}
            onPress={() => {}}
          >
            {/* รูปวัวด้านบนสุด */}
            {selectedCow && (
              selectedCow.image || selectedCow.imageUrl ? (
                <Image source={{ uri: selectedCow.image || selectedCow.imageUrl }} style={[styles.cowImage, { alignSelf: 'center', marginBottom: 16 }]} />
              ) : (
                <View style={[styles.cowImage, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#eee', alignSelf: 'center', marginBottom: 16 }]}> 
                  <Text style={{ fontSize: 32 }}>วัว</Text>
                </View>
              )
            )}
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 12, color: '#8B4513' }}>ข้อมูลวัว</Text>
            {selectedCow && (
              <>
                <Text style={{ fontSize: 16, marginBottom: 4, alignSelf: 'flex-start' }}><Text style={{ fontWeight: 'bold' }}>รหัสวัว (ID):</Text> {selectedCow.cowId}</Text>
                <Text style={{ fontSize: 16, marginBottom: 4, alignSelf: 'flex-start' }}><Text style={{ fontWeight: 'bold' }}>ชื่อวัว:</Text> {selectedCow.cowName || 'ไม่ระบุ'}</Text>
                <Text style={{ fontSize: 16, marginBottom: 4, alignSelf: 'flex-start' }}><Text style={{ fontWeight: 'bold' }}>พันธุ์วัว:</Text> {selectedCow.breed || '-'}</Text>
                <Text style={{ fontSize: 16, marginBottom: 4, alignSelf: 'flex-start' }}><Text style={{ fontWeight: 'bold' }}>วันเกิด:</Text> {selectedCow.birthDate ? new Date(selectedCow.birthDate).toLocaleDateString('th-TH') : '-'}</Text>
                <Text style={{ fontSize: 16, marginBottom: 4, alignSelf: 'flex-start' }}><Text style={{ fontWeight: 'bold' }}>อายุ:</Text> {getCowAgeText(selectedCow.birthDate)}</Text>
                <Text style={{ fontSize: 16, marginBottom: 4, alignSelf: 'flex-start' }}><Text style={{ fontWeight: 'bold' }}>น้ำหนัก:</Text> {selectedCow.weight ? selectedCow.weight + ' กก.' : '-'}</Text>
                <Text style={{ fontSize: 16, marginBottom: 4, alignSelf: 'flex-start' }}><Text style={{ fontWeight: 'bold' }}>ขนาดตัว:</Text> {(selectedCow.height ? `สูง ${selectedCow.height} ซม.` : '-') + (selectedCow.length ? ` ยาว ${selectedCow.length} ซม.` : '')}</Text>
                <Text style={{ fontSize: 16, marginBottom: 4, alignSelf: 'flex-start' }}><Text style={{ fontWeight: 'bold' }}>การฉีดวัคซีน:</Text> {selectedCow.vaccinations || '-'}</Text>
                <Text style={{ fontSize: 16, marginBottom: 4, alignSelf: 'flex-start' }}><Text style={{ fontWeight: 'bold' }}>การรักษา:</Text> {selectedCow.treatments || '-'}</Text>
                <Text style={{ fontSize: 16, marginBottom: 4, alignSelf: 'flex-start' }}><Text style={{ fontWeight: 'bold' }}>สถานะ:</Text> {selectedCow.status || '-'}</Text>
              </>
            )}
            <TouchableOpacity
              style={{ backgroundColor: '#8B4513', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 32, marginTop: 16, alignSelf: 'center' }}
              onPress={() => setModalVisibleCowInfo(false)}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>ปิด</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
      {/* ปุ่มด้านขวา */}
      <View style={styles.rightButtonsContainer}>
        {!(user.isAssistant || user.role === 'ผู้ช่วยฟาร์ม') ? (
          <>
            <TouchableOpacity 
              style={styles.breedButton}
              onPress={() => navigation.navigate('BreedManagement')}
            >
              <Text style={styles.breedButtonText}>+ พันธุ์วัว</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => navigation.navigate('AddCow')}
            >
              <Text style={styles.addButtonText}>+ เพิ่มวัว</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => navigation.navigate('AddCow')}
          >
            <Text style={styles.addButtonText}>+ เพิ่มวัว</Text>
          </TouchableOpacity>
        )}
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="ค้นหาโดยรหัสวัวหรือสายพันธุ์..."
        value={searchText}
        onChangeText={setSearchText}
      />

      {sortedFilteredCows.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {cows.length === 0 ? 'ไม่มีข้อมูลวัวในระบบ' : 'ไม่พบวัวที่ค้นหา'}
          </Text>
          <Text style={styles.emptySubText}>
            {cows.length === 0 ? 'เริ่มต้นด้วยการกดปุ่ม "+ เพิ่มวัว" เพื่อเพิ่มข้อมูลวัวแรก' : 'ลองใช้คำค้นหาอื่นดู'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={sortedFilteredCows}
          renderItem={renderCowItem}
          keyExtractor={item => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
};

export default CowManagementScreen;
