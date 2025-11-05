import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  RefreshControl,
  Image,
  ScrollView,
  Modal
} from 'react-native';
import { styles } from '../styles/CowDetailHistoryScreen.styles';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useUser } from '../contexts/UserContext';

const CowDetailHistoryScreen = ({ navigation, route }) => {
  // ฟังก์ชันคำนวณอายุวัวจาก birthDate
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
  const [modalVisible, setModalVisible] = useState(false);
  const [modalVisibleCowInfo, setModalVisibleCowInfo] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState(null);
  const { cowId, cowData } = route.params;
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    loadCowHistory();
  }, []);

  const loadCowHistory = async () => {
    if (!user || !user.email) {
      Alert.alert('ข้อผิดพลาด', 'กรุณาเข้าสู่ระบบก่อน');
      navigation.goBack();
      return;
    }

    setLoading(true);
    try {
      console.log('กำลังโหลดประวัติของวัว:', cowId);
      
      // กำหนด ownerEmail ที่ถูกต้อง
      let ownerEmail = user.email;
      if (user.isAssistant || user.role === 'ผู้ช่วยฟาร์ม') {
        ownerEmail = user.ownerId; // ใช้ email ของเจ้าของฟาร์ม
      }
      
      // โหลดประวัติของวัวตัวนี้
      const historyQuery = query(
        collection(db, 'cowHistory'),
        where('cowId', '==', cowId),
        where('ownerEmail', '==', ownerEmail) // ใช้ ownerEmail ที่ถูกต้อง
      );
      
      const historySnapshot = await getDocs(historyQuery);
      const historyList = historySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // เรียงลำดับตามวันที่ล่าสุด
      historyList.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      console.log('โหลดประวัติวัวสำเร็จ:', historyList.length, 'รายการ');
      setHistory(historyList);
      
    } catch (error) {
      console.error('Error loading cow history:', error);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถโหลดประวัติได้');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCowHistory();
    setRefreshing(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // รับ item object แทน action string
  const getChangeTypeIcon = (item) => {
    if (item.vaccineDetails) return '';
    if (item.treatmentDetails) return '';
    switch (item.action) {
 
    }
  };

  const getChangeTypeColor = (action) => {
    switch (action) {
      case 'เพิ่มวัวใหม่': return '#4CAF50';
      case 'แก้ไขข้อมูลวัว': return '#2196F3';
      case 'อัพเดทน้ำหนัก': return '#2196F3';
      case 'อัพเดทสถานะ': return '#FF9800';
      case 'บันทึกการฉีดวัคซีน': return '#9C27B0';
      case 'บันทึกการรักษา': return '#F44336';
      case 'บันทึกข้อมูลวัคซีน': return '#9C27B0';
      case 'บันทึกการรักษาโรค': return '#F44336';
      case 'อัพเดทข้อมูลวัคซีน': return '#9C27B0';
      case 'อัพเดทข้อมูลการรักษา': return '#F44336';
      default: return '#666';
    }
  };

  const renderHistoryItem = ({ item, index }) => {
    const isVaccine = !!item.vaccineDetails;
    const isTreatment = !!item.treatmentDetails;
    return (
      <TouchableOpacity
        style={styles.historyItem}
        activeOpacity={0.8}
        onPress={() => {
          setSelectedHistory(item);
          setModalVisible(true);
        }}
      >
        <View style={styles.historyHeader}>
          <View style={styles.changeTypeContainer}>
            <Text style={styles.changeTypeIcon}>{getChangeTypeIcon(item)}</Text>
            {!(isVaccine || isTreatment) && (
              <Text style={[styles.changeType, { color: getChangeTypeColor(item.action) }]}> 
                {item.action}
              </Text>
            )}
          </View>
          <Text style={styles.timestamp}>{formatDate(item.timestamp)}</Text>
        </View>
        <View style={styles.changesContainer}>
          {/* ถ้าเป็นวัคซีน */}
          {isVaccine && (
            <View style={styles.extraDetails}>
              <Text style={styles.extraDetailTitle}>รายละเอียดวัคซีน:</Text>
              {Object.entries(item.vaccineDetails).map(([key, value]) => (
                <Text style={styles.extraDetailText} key={key}>• {key}: {value || 'ไม่ระบุ'}</Text>
              ))}
            </View>
          )}
          {/* ถ้าเป็นการรักษา */}
          {isTreatment && (
            <View style={styles.extraDetails}>
              <Text style={styles.extraDetailTitle}>รายละเอียดการรักษา:</Text>
              {Object.entries(item.treatmentDetails).map(([key, value]) => (
                <Text style={styles.extraDetailText} key={key}>• {key}: {value || 'ไม่ระบุ'}</Text>
              ))}
            </View>
          )}
          {/* ถ้าไม่ใช่สองกรณีนี้ ให้แสดง changes ตามปกติ */}
          {!(isVaccine || isTreatment) && Array.isArray(item.changes) && item.changes.map((change, idx) => {
            if (typeof change === 'string' && (change.startsWith('วัคซีน:') || change.startsWith('การรักษา:'))) {
              const [label, ...rest] = change.split(':');
              const value = rest.join(':').trim();
              return (
                <Text key={idx} style={styles.changeDetail}>• {label}: {value || '-'}</Text>
              );
            }
            return <Text key={idx} style={styles.changeDetail}>• {change}</Text>;
          })}
          {!(isVaccine || isTreatment) && !Array.isArray(item.changes) && Object.entries(item.changes || {}).map(([key, value]) => (
            <Text key={key} style={styles.changeDetail}>• {key}: {value}</Text>
          ))}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#8B4513" />
        <Text style={styles.loadingText}>กำลังโหลดประวัติวัว {cowId}...</Text>
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
              {cowData && (
                cowData.image ? (
                  <Image source={{ uri: cowData.image }} style={[styles.cowImage, { alignSelf: 'center', marginBottom: 16 }]} />
                ) : (
                  <View style={[styles.cowImage, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#eee', alignSelf: 'center', marginBottom: 16 }]}> 
                    <Text style={{ fontSize: 32 }}>วัว</Text>
                  </View>
                )
              )}
              <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 12, color: '#8B4513' }}>ข้อมูลวัว</Text>
              {cowData && (
                <>
                  <Text style={{ fontSize: 16, marginBottom: 4, alignSelf: 'flex-start' }}><Text style={{ fontWeight: 'bold' }}>รหัสวัว (ID):</Text> {cowData.cowId}</Text>
                  <Text style={{ fontSize: 16, marginBottom: 4, alignSelf: 'flex-start' }}><Text style={{ fontWeight: 'bold' }}>ชื่อวัว:</Text> {cowData.cowName || 'ไม่ระบุ'}</Text>
                  <Text style={{ fontSize: 16, marginBottom: 4, alignSelf: 'flex-start' }}><Text style={{ fontWeight: 'bold' }}>พันธุ์วัว:</Text> {cowData.breed || '-'}</Text>
                  <Text style={{ fontSize: 16, marginBottom: 4, alignSelf: 'flex-start' }}><Text style={{ fontWeight: 'bold' }}>วันเกิด:</Text> {cowData.birthDate ? new Date(cowData.birthDate).toLocaleDateString('th-TH') : '-'}</Text>
                  <Text style={{ fontSize: 16, marginBottom: 4, alignSelf: 'flex-start' }}>
                    <Text style={{ fontWeight: 'bold' }}>อายุ:</Text> {getCowAgeText(cowData.birthDate)}
                  </Text>
                  <Text style={{ fontSize: 16, marginBottom: 4, alignSelf: 'flex-start' }}><Text style={{ fontWeight: 'bold' }}>น้ำหนัก:</Text> {cowData.weight ? cowData.weight + ' กก.' : '-'}</Text>
                  <Text style={{ fontSize: 16, marginBottom: 4, alignSelf: 'flex-start' }}><Text style={{ fontWeight: 'bold' }}>ขนาดตัว:</Text> {(cowData.height ? `สูง ${cowData.height} ซม.` : '-') + (cowData.length ? ` ยาว ${cowData.length} ซม.` : '')}</Text>
                  <Text style={{ fontSize: 16, marginBottom: 4, alignSelf: 'flex-start' }}><Text style={{ fontWeight: 'bold' }}>การฉีดวัคซีน:</Text> {cowData.vaccinations || '-'}</Text>
                  <Text style={{ fontSize: 16, marginBottom: 4, alignSelf: 'flex-start' }}><Text style={{ fontWeight: 'bold' }}>การรักษา:</Text> {cowData.treatments || '-'}</Text>
                  <Text style={{ fontSize: 16, marginBottom: 4, alignSelf: 'flex-start' }}><Text style={{ fontWeight: 'bold' }}>สถานะ:</Text> {cowData.status || '-'}</Text>
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
        {/* Modal แสดงรายละเอียดประวัติการเปลี่ยนแปลง */}
        <Modal
          visible={modalVisible}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <TouchableOpacity
            style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }}
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
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
                alignItems: 'flex-start'
              }}
              activeOpacity={1}
              onPress={() => {}}
            >
              <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 12, color: '#8B4513' }}>รายละเอียดการเปลี่ยนแปลง</Text>
              {selectedHistory && (
                <>
                  <Text style={{ fontSize: 16, marginBottom: 4 }}><Text style={{ fontWeight: 'bold' }}>Action:</Text> {selectedHistory.action || '-'}</Text>
                  <Text style={{ fontSize: 16, marginBottom: 4 }}><Text style={{ fontWeight: 'bold' }}>เปลี่ยนโดย:</Text> {selectedHistory.changedBy || '-'}</Text>
                  <Text style={{ fontSize: 16, marginBottom: 4 }}><Text style={{ fontWeight: 'bold' }}>บทบาท:</Text> {selectedHistory.changedByRole || '-'}</Text>
                  <Text style={{ fontSize: 16, marginBottom: 8 }}><Text style={{ fontWeight: 'bold' }}>วันที่:</Text> {formatDate(selectedHistory.timestamp)}</Text>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 4 }}>รายละเอียด:</Text>
                  <View style={{ alignSelf: 'stretch', marginBottom: 12 }}>
                    {Array.isArray(selectedHistory.changes) && selectedHistory.changes.map((change, idx) => (
                      <Text key={idx} style={{ fontSize: 15, marginBottom: 2 }}>• {change}</Text>
                    ))}
                    {!Array.isArray(selectedHistory.changes) && selectedHistory.changes && Object.entries(selectedHistory.changes).map(([key, value]) => (
                      <Text key={key} style={{ fontSize: 15, marginBottom: 2 }}>• {key}: {value}</Text>
                    ))}
                  </View>
                </>
              )}
              <TouchableOpacity
                style={{ backgroundColor: '#8B4513', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 32, marginTop: 8 }}
                onPress={() => setModalVisible(false)}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>ปิด</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* ข้อมูลวัวปัจจุบัน */}
        {cowData && (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setModalVisibleCowInfo(true)}
          >
            <View style={styles.cowInfoSection}>
              <Text style={styles.sectionTitle}>ข้อมูลปัจจุบัน</Text>
              <View style={styles.cowInfo}>
                {/* รูปภาพวัว */}
                {cowData.image ? (
                  <Image source={{ uri: cowData.image }} style={styles.cowImage} />
                ) : (
                  <View style={[styles.cowImage, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#eee' }]}> 
                    <Text style={{ fontSize: 32 }}>วัว</Text>
                  </View>
                )}
                <View style={styles.cowDetails}>
                  <Text style={styles.cowId}>รหัสวัว (ID): {cowData.cowId}</Text>
                  <Text style={styles.cowName}>ชื่อวัว: {cowData.cowName || 'ไม่ระบุ'}</Text>
                  <Text style={styles.cowBreed}>พันธุ์วัว: {cowData.breed || '-'}</Text>
                  <Text style={styles.cowBirth}>วันเกิด: {cowData.birthDate ? new Date(cowData.birthDate).toLocaleDateString('th-TH') : '-'}</Text>
                  <Text style={styles.cowAge}>อายุ: {getCowAgeText(cowData.birthDate)}</Text>
                  <Text style={styles.cowWeight}>น้ำหนัก: {cowData.weight ? cowData.weight + ' กก.' : '-'}</Text>
                  {/* ลบ field ขนาดตัว, การฉีดวัคซีน, การรักษา, สถานะ ออกจาก section นี้ */}
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}

        {/* สถิติประวัติ */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>สถิติการเปลี่ยนแปลง</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{history.length}</Text>
              <Text style={styles.statLabel}>รายการทั้งหมด</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {history.filter(h => h.action.includes('วัคซีน')).length}
              </Text>
              <Text style={styles.statLabel}>วัคซีน</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {history.filter(h => h.action.includes('รักษา')).length}
              </Text>
              <Text style={styles.statLabel}>การรักษา</Text>
            </View>
          </View>
        </View>

        {/* ประวัติการเปลี่ยนแปลง */}
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>ประวัติการเปลี่ยนแปลง</Text>
          {history.length > 0 ? (
            <FlatList
              data={history}
              keyExtractor={(item) => item.id}
              renderItem={renderHistoryItem}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>ไม่มีประวัติการเปลี่ยนแปลง</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default CowDetailHistoryScreen;
