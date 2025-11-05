import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { styles } from '../styles/CowHistoryScreen.styles';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

const CowHistoryScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [history, setHistory] = useState([]);
  const [cowNames, setCowNames] = useState({}); // { cowId: cowName }

  const fetchHistoryAndNames = async () => {
    setLoading(true);
    try {
      // Fetch all cow history
      const historySnap = await getDocs(collection(db, 'cowHistory'));
      const historyList = historySnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setHistory(historyList);

      // Get all cowIds from history
      const cowIds = Array.from(new Set(historyList.map(h => h.cowId)));
      // Fetch cow names for those cowIds
      const cowsSnap = await getDocs(collection(db, 'cows'));
      const cowNameMap = {};
      cowsSnap.docs.forEach(doc => {
        const data = doc.data();
        if (data.cowId) {
          cowNameMap[data.cowId] = data.cowName || '';
        }
      });
      setCowNames(cowNameMap);
    } catch (e) {
      setHistory([]);
      setCowNames({});
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchHistoryAndNames();
  };

  useEffect(() => {
    fetchHistoryAndNames();
  }, []);

  const renderItem = ({ item }) => {
    let cowName = cowNames[item.cowId];
    if (typeof cowName !== 'string') cowName = '';
    // fallback: try item.cowName, or show 'ไม่พบชื่อ'
    if (!cowName && item.cowName) cowName = item.cowName;
    if (!cowName) cowName = 'ไม่พบชื่อ';
    return (
      <View style={styles.historyItem}>
        <Text style={styles.cowId}>{item.cowId} - {cowName}</Text>
        <Text style={styles.action}>{item.action || 'ไม่ระบุ'}</Text>
        <Text style={styles.timestamp}>{item.timestamp ? new Date(item.timestamp).toLocaleString('th-TH') : ''}</Text>
        {/* แสดงรายละเอียดอื่น ๆ ตามต้องการ */}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={styles.loadingText}>กำลังโหลดประวัติ...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={history}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        ListEmptyComponent={<Text style={styles.emptyText}>ไม่พบประวัติ</Text>}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
};

export default CowHistoryScreen;
