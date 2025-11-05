import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  ActivityIndicator,
  Alert,
  RefreshControl
} from 'react-native';
import { styles } from '../styles/DashboardScreen.styles';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useUser } from '../contexts/UserContext';

const DashboardScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // State สำหรับข้อมูลสถิติและแดชบอร์ด
  const [dashboardData, setDashboardData] = useState({
    totalCows: 0,
    breedStats: {},      // สถิติตามพันธุ์วัว
    statusStats: {},     // สถิติตามสถานะวัว
    healthStats: {},     // สถิติสุขภาพ
    recentActivity: []   // กิจกรรมล่าสุด
  });
  const { user } = useUser();

  // โหลดข้อมูลสำหรับ Dashboard
  const loadDashboardData = async () => {
    try {
      if (!user || !user.email) {
        Alert.alert('ข้อผิดพลาด', 'กรุณาเข้าสู่ระบบก่อน');
        return;
      }

      // กำหนด ownerEmail ที่ถูกต้อง
      let ownerEmail = user.email;
      if (user.isAssistant || user.role === 'ผู้ช่วยฟาร์ม') {
        ownerEmail = user.ownerId; // ใช้ email ของเจ้าของฟาร์ม
        console.log('📊 ผู้ช่วยกำลังดู Dashboard ของเจ้าของฟาร์ม:', ownerEmail);
      } else {
        console.log('📊 เจ้าของฟาร์มกำลังดู Dashboard ของตัวเอง:', ownerEmail);
      }
      
      const cowsCollection = collection(db, 'cows');
      const q = query(cowsCollection, where('ownerEmail', '==', ownerEmail));
      const cowsSnapshot = await getDocs(q);
      const cowsList = cowsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // คำนวณสถิติ (กรองวัวที่ถูกลบใน calculateStats)
      const stats = calculateStats(cowsList);
      setDashboardData(stats);
      
      console.log('✅ โหลดข้อมูล Dashboard สำเร็จ:', stats);
      
    } catch (error) {
      console.error('❌ ข้อผิดพลาดในการโหลดข้อมูล Dashboard:', error);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // คำนวณสถิติต่างๆ
  const calculateStats = (cows) => {
    // กรองวัวที่ถูกลบออกก่อนคำนวณ
    const activeCows = cows.filter(cow => !cow.isDeleted);
    const breedStats = {};
    const statusStats = {};
    const healthStats = {};
    activeCows.forEach(cow => {
      if (cow.breed) {
        breedStats[cow.breed] = (breedStats[cow.breed] || 0) + 1;
      }
      if (cow.status) {
        statusStats[cow.status] = (statusStats[cow.status] || 0) + 1;
      }
      if (cow.health) {
        healthStats[cow.health] = (healthStats[cow.health] || 0) + 1;
      }
    });
    // กิจกรรมล่าสุด (เรียงตามวันที่สร้าง)
    const recentActivity = activeCows
      .filter(cow => cow.createdAt || cow.updatedAt)
      .sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt);
        const dateB = new Date(b.updatedAt || b.createdAt);
        return dateB - dateA;
      })
      .slice(0, 5);
    return {
      totalCows: activeCows.length,
      breedStats,
      statusStats,
      healthStats,
      recentActivity
    };
  };

  // รีเฟรชข้อมูล
  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  // โหลดข้อมูลเมื่อเข้าหน้า
  useEffect(() => {
    loadDashboardData();
  }, [user]);

  // ฟังก์ชันสำหรับแสดงสีของแต่ละพันธุ์
  const getBreedColor = (breed) => {
    const colors = {
      'โคนม': '#4CAF50',
      'โคเนื้อ': '#FF5722',
      'โคพื้นเมือง': '#795548',
      'โคบราห์มัน': '#9C27B0',
      'โคลิมูซิน': '#2196F3',
      'โคชาโรเลส์': '#FF9800'
    };
    return colors[breed] || '#607D8B';
  };

  // ฟังก์ชันสำหรับแสดงสีของสถานะ
  const getStatusColor = (status) => {
    const colors = {
      'ปกติ': '#4CAF50',
      'ป่วย': '#F44336',
      'อยู่ระหว่างการรักษา': '#FF9800',
      'ถูกจำหน่าย': '#9E9E9E',
      'ตาย': '#424242'
    };
    return colors[status] || '#607D8B';
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#8B4513" />
        <Text style={styles.loadingText}>กำลังโหลดข้อมูล Dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* สถิติรวม */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>สถิติรวม</Text>
          <View style={styles.totalCard}>
            <Text style={styles.totalNumber}>{dashboardData.totalCows}</Text>
            <Text style={styles.totalLabel}>วัวทั้งหมดในฟาร์ม</Text>
          </View>
        </View>

        {/* สถิติพันธุ์วัว */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>จำนวนตามพันธุ์</Text>
          {Object.keys(dashboardData.breedStats).length > 0 ? (
            Object.entries(dashboardData.breedStats).map(([breed, count]) => (
              <View key={breed} style={styles.statItem}>
                <View style={styles.statInfo}>
                  <View 
                    style={[
                      styles.statIndicator, 
                      { backgroundColor: getBreedColor(breed) }
                    ]} 
                  />
                  <Text style={styles.statLabel}>{breed}</Text>
                </View>
                <View style={styles.statValue}>
                  <Text style={styles.statNumber}>{count}</Text>
                  <Text style={styles.statUnit}>ตัว</Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noDataText}>ยังไม่มีข้อมูลวัว</Text>
          )}
        </View>

        {/* สถิติสถานะ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>สถานะวัว</Text>
          {Object.keys(dashboardData.statusStats).length > 0 ? (
            Object.entries(dashboardData.statusStats).map(([status, count]) => (
              <View key={status} style={styles.statItem}>
                <View style={styles.statInfo}>
                  <View 
                    style={[
                      styles.statIndicator, 
                      { backgroundColor: getStatusColor(status) }
                    ]} 
                  />
                  <Text style={styles.statLabel}>{status}</Text>
                </View>
                <View style={styles.statValue}>
                  <Text style={styles.statNumber}>{count}</Text>
                  <Text style={styles.statUnit}>ตัว</Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noDataText}>ยังไม่มีข้อมูลสถานะ</Text>
          )}
        </View>

        {dashboardData.recentActivity.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>กิจกรรมล่าสุด</Text>
            {dashboardData.recentActivity.filter(cow => !cow.isDeleted).map((cow, index) => (
              <View 
                key={cow.id} 
                style={styles.activityItem}
              >
                <View style={styles.activityInfo}>
                  <Text style={styles.activityTitle}>วัว {cow.cowId}</Text>
                  <Text style={styles.activitySubtitle}>
                    {cow.breed} • {cow.status}
                  </Text>
                  <Text style={styles.activityTime}>
                    {cow.updatedAt ? 
                      `แก้ไขล่าสุด: ${new Date(cow.updatedAt).toLocaleDateString('th-TH')}` :
                      `สร้างเมื่อ: ${new Date(cow.createdAt).toLocaleDateString('th-TH')}`
                    }
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ช่องว่างด้านล่าง */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

export default DashboardScreen;
