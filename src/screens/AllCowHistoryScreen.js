import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  RefreshControl,
  Image
} from 'react-native';
import { styles } from '../styles/AllCowHistoryScreen.styles';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useUser } from '../contexts/UserContext';

const AllCowHistoryScreen = ({ navigation }) => {
  /**
   * ฟังก์ชันคำนวณอายุวัวจากวันเกิด
   * แปลงเป็นรูปแบบ ปี เดือน วัน ที่อ่านเข้าใจง่าย
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
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [history, setHistory] = useState([]);
  const [cows, setCows] = useState([]);

  useEffect(() => {
    loadAllHistory();
  }, []);

  const loadAllHistory = async () => {
    if (!user || !user.email) {
      Alert.alert('ข้อผิดพลาด', 'กรุณาเข้าสู่ระบบก่อน');
      navigation.goBack();
      return;
    }

    setLoading(true);
    try {
      // กำหนด ownerEmail ที่ถูกต้อง
      let ownerEmail = user.email;
      if (user.isAssistant || user.role === 'ผู้ช่วยฟาร์ม') {
        ownerEmail = user.ownerId; // ใช้ email ของเจ้าของฟาร์ม
        console.log('ผู้ช่วยกำลังดูประวัติวัวของเจ้าของฟาร์ม:', ownerEmail);
      } else {
        console.log('เจ้าของฟาร์มกำลังดูประวัติวัวของตัวเอง:', ownerEmail);
      }

      // โหลดข้อมูลวัวทั้งหมด
      const cowsQuery = query(
        collection(db, 'cows'),
        where('ownerEmail', '==', ownerEmail)
      );
      const cowsSnapshot = await getDocs(cowsQuery);
      const cowsList = cowsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCows(cowsList);

      // โหลดประวัติทั้งหมด
      const historyQuery = query(
        collection(db, 'cowHistory'),
        where('ownerEmail', '==', ownerEmail), // ใช้ ownerEmail ที่ถูกต้อง
        orderBy('timestamp', 'desc')
      );
      
      const historySnapshot = await getDocs(historyQuery);
      const historyList = historySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log('โหลดประวัติทั้งหมดสำเร็จ:', historyList.length, 'รายการ');
      setHistory(historyList);
      
    } catch (error) {
      console.error('Error loading all history:', error);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถโหลดประวัติได้');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAllHistory();
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

  const getChangeTypeIcon = (action) => {
    switch (action) {
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

  const getCowInfo = (cowId) => {
    return cows.find(cow => cow.cowId === cowId);
  };

  const getCowHistory = (cowId) => {
    return history.filter(h => h.cowId === cowId);
  };

  const renderCowItem = ({ item }) => {
    const cowHistory = getCowHistory(item.cowId);
    const lastUpdate = cowHistory.length > 0 ? cowHistory[0].timestamp : item.createdAt;
    
    // กำหนดสีของการ์ดตามสถานะ
    const getCardStyle = () => {
      if (item.status === 'ตาย' || item.status === 'ตายแล้ว') {
        return [styles.cowCardModern, { borderLeftColor: '#F44336', borderLeftWidth: 4, opacity: 0.7 }];
      } else if (item.status === 'จำหน่าย' || item.status === 'จำหน่ายแล้ว') {
        return [styles.cowCardModern, { borderLeftColor: '#FF9800', borderLeftWidth: 4, opacity: 0.8 }];
      }
      return styles.cowCardModern;
    };
    
    return (
      <TouchableOpacity 
        style={getCardStyle()}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('CowDetailHistory', { 
          cowId: item.cowId,
          cowData: item 
        })}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={styles.cowAvatarCircle}>
            {item.image ? (
              <Image source={{ uri: item.image }} style={styles.cowAvatarImage} />
            ) : (
              <Text style={styles.cowAvatarText}>{item.cowName ? item.cowName.charAt(0).toUpperCase() : 'วัว'}</Text>
            )}
          </View>
          <View style={{ flex: 1, marginLeft: 16 }}>
            <Text style={styles.cowCardIdModern} numberOfLines={2} ellipsizeMode="tail">
              {item.cowId}{item.cowName ? ` - ${item.cowName}` : ''}
            </Text>
            <Text style={styles.cowCardBreedModern} numberOfLines={2} ellipsizeMode="tail">
              {item.breed}
            </Text>
            <View style={{ flexDirection: 'row', marginTop: 4, flexWrap: 'wrap' }}>
              <Text style={styles.cowCardStatusModern} numberOfLines={2} ellipsizeMode="tail">สถานะ: {item.status}</Text>
              <Text style={styles.cowCardWeightModern} numberOfLines={2} ellipsizeMode="tail">น้ำหนัก: {item.weight} กก.</Text>
              <Text style={styles.cowCardAgeModern} numberOfLines={2} ellipsizeMode="tail">
                อายุ: {getCowAgeText(item.birthDate)}
              </Text>
            </View>
            <Text style={styles.cowCardLastUpdateModern} numberOfLines={2} ellipsizeMode="tail">อัพเดทล่าสุด: {formatDate(lastUpdate)}</Text>
          </View>
          <View style={styles.arrowIconModern}>
            <Text style={styles.arrowTextModern}>›</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#8B4513" />
        <Text style={styles.loadingText}>กำลังโหลดประวัติการเปลี่ยนแปลงข้อมูลวัว...</Text>
        <Text style={styles.loadingSubText}>แสดงรายการว่าเปลี่ยนอะไรเป็นอะไร</Text>
      </View>
    );
  }

  // Sort cows by cowId before rendering
  // กรองวัวที่ถูกลบออก แต่แสดงวัวที่ตายหรือถูกจำหน่าย
  const filteredCows = cows.filter(cow => !cow.isDeleted);
  const sortedCows = filteredCows.sort((a, b) => a.cowId.localeCompare(b.cowId));

  return (
    <View style={styles.container}>
      {/* เว้นพื้นที่สำหรับกล้อง */}
      <View style={styles.topSpacer} />
      
      {/* สถิติโดยย่อ */}
      <View style={styles.statsSection}>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{cows.filter(cow => !cow.isDeleted).length}</Text>
            <Text style={styles.statLabel}>จำนวนวัว</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{history.length}</Text>
            <Text style={styles.statLabel}>บันทึกทั้งหมด</Text>
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

      {/* รายการวัว */}
      {filteredCows.length > 0 ? (
        <FlatList
          data={sortedCows}
          keyExtractor={(item) => item.id}
          renderItem={renderCowItem}
          style={styles.historyList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>�</Text>
          <Text style={styles.emptyMessage}>ยังไม่มีข้อมูลวัวในระบบ</Text>
          <Text style={styles.emptySubMessage}>เริ่มต้นด้วยการเพิ่มวัวเข้าสู่ระบบ</Text>
        </View>
      )}
    </View>
  );
};

export default AllCowHistoryScreen;
