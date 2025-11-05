import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  ActivityIndicator, 
  FlatList, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar,
  RefreshControl,
  Image
} from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { styles } from '../styles/FarmOverviewScreen.styles';

const FarmOverviewScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [totalFarms, setTotalFarms] = useState(0);
  const [totalCows, setTotalCows] = useState(0);
  const [farmRows, setFarmRows] = useState([]); // [{ ownerEmail, ownerName, cowCount }]

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const usersSnap = await getDocs(collection(db, 'users'));
      const owners = usersSnap.docs
        .map((d) => ({ id: d.id, ...(d.data() || {}) }))
        .filter((u) => !u.isDeleted); // ข้ามผู้ใช้ที่ถูกลบ
      const ownerByEmail = new Map(owners.map((o) => [o.email || o.id, o]));
      setTotalFarms(owners.length);

      const cowsSnap = await getDocs(collection(db, 'cows'));
      const cows = cowsSnap.docs
        .map((d) => ({ id: d.id, ...(d.data() || {}) }))
        .filter((c) => !c.isDeleted); // ข้ามวัวที่ถูกลบ
      const cowsByOwner = new Map();
      cows.forEach((c) => {
        const key = c.ownerEmail || 'unknown';
        cowsByOwner.set(key, (cowsByOwner.get(key) || 0) + 1);
      });
      setTotalCows(cows.length);

      const rows = Array.from(ownerByEmail.keys()).map((email) => {
        const o = ownerByEmail.get(email) || {};
        const name = o.fullName || o.name || o.displayName || '-';
        const profileImage = o.profileImage || null;
        return { ownerEmail: email, ownerName: name, cowCount: cowsByOwner.get(email) || 0, ownerProfileImage: profileImage };
      });

      Array.from(cowsByOwner.keys()).forEach((email) => {
        if (!ownerByEmail.has(email)) {
          rows.push({ ownerEmail: email, ownerName: '(ไม่พบเจ้าของใน users)', cowCount: cowsByOwner.get(email) || 0, ownerProfileImage: null });
        }
      });

      rows.sort((a, b) => (a.ownerName || '').localeCompare(b.ownerName || ''));
      setFarmRows(rows);
    } catch (e) {
      setError(e?.message || 'เกิดข้อผิดพลาดในการดึงข้อมูล');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#8B4513" />

      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#8B4513" />
            <Text style={styles.loadingText}>กำลังโหลดข้อมูล...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>❌ {error}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => {
                setError(null);
                fetchData();
              }}
            >
              <Text style={styles.retryButtonText}>🔄 ลองใหม่</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.metricsRow}>
              <View style={styles.metricBox}>
                <Text style={styles.metricIcon}></Text>
                <Text style={styles.metricLabel}>จำนวนฟาร์ม</Text>
                <Text style={styles.metricValue}>{totalFarms}</Text>
              </View>
              <View style={styles.metricBox}>
                <Text style={styles.metricIcon}></Text>
                <Text style={styles.metricLabel}>วัวทั้งหมด</Text>
                <Text style={styles.metricValue}>{totalCows}</Text>
              </View>
            </View>
            
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>รายละเอียดฟาร์ม</Text>
              <Text style={styles.sectionSubtitle}>วัวต่อฟาร์ม</Text>
            </View>
            
            <FlatList
              data={farmRows}
              keyExtractor={(item) => item.ownerEmail || Math.random().toString(36)}
              style={styles.farmList}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              renderItem={({ item }) => (
                <View style={styles.farmRow}>
                  <View style={styles.farmIcon}>
                    {item.ownerProfileImage ? (
                      <Image
                        source={{ uri: item.ownerProfileImage }}
                        style={{ width: 40, height: 40, borderRadius: 20 }}
                      />
                    ) : (
                      <Text style={styles.farmIconText}>🏠</Text>
                    )}
                  </View>
                  <View style={styles.farmInfo}>
                    <Text style={styles.farmName}>{item.ownerName}</Text>
                    <Text style={styles.farmEmail}>{item.ownerEmail}</Text>
                  </View>
                  <View style={styles.farmCountContainer}>
                    <Text style={styles.farmCount}>{item.cowCount}</Text>
                    <Text style={styles.farmCountLabel}>ตัว</Text>
                  </View>
                </View>
              )}
              ListEmptyComponent={() => (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyIcon}>📝</Text>
                  <Text style={styles.emptyTitle}>ไม่พบข้อมูลฟาร์ม</Text>
                  <Text style={styles.emptyText}>ยังไม่มีข้อมูลฟาร์มในระบบ</Text>
                </View>
              )}
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

export default FarmOverviewScreen;
