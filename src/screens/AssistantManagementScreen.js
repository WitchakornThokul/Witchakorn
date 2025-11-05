import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Alert,
  ScrollView,
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StatusBar,
  Image,
  RefreshControl
} from 'react-native';
import { styles } from '../styles/AssistantManagementScreen.styles';
import { useUser } from '../contexts/UserContext';
import { collection, query, where, getDocs, /* deleteDoc, */ doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth, db } from '../config/firebase';
import CryptoJS from 'crypto-js';

const AssistantManagementScreen = ({ navigation }) => {
  const { user } = useUser();
  const [assistants, setAssistants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAssistants();
  }, []);

  const loadAssistants = async () => {
    if (!user?.email) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('🔍 กำลังโหลดข้อมูลผู้ช่วย...');
      
      // Query assistants ที่สร้างโดย owner คนนี้
      const assistantsQuery = query(
        collection(db, 'assistants'),
        where('ownerId', '==', user.email)
      );
      
  const querySnapshot = await getDocs(assistantsQuery);
  const assistantsData = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (!data.isDeleted) {
          assistantsData.push({
            id: doc.id,
            ...data
          });
        }
      });
      
      console.log('✅ โหลดข้อมูลผู้ช่วยสำเร็จ:', assistantsData.length, 'คน');
      setAssistants(assistantsData);
      
    } catch (error) {
      console.error('❌ ข้อผิดพลาดในการโหลดผู้ช่วย:', error);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลผู้ช่วยได้');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAssistants();
  };

  const handleDeleteAssistant = async (assistant) => {
    Alert.alert(
      'ยืนยันการลบ',
      `ต้องการลบผู้ช่วย "${assistant.name}" หรือไม่?\n\nการดำเนินการนี้ไม่สามารถยกเลิกได้`,
      [
        { text: 'ยกเลิก', style: 'cancel' },
        { 
          text: 'ลบ', 
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              
              // ทำ soft delete โดยตั้ง flag isDeleted แทนการลบเอกสาร
              await updateDoc(doc(db, 'assistants', assistant.email), {
                isDeleted: true,
                deletedAt: serverTimestamp(),
              });
              
              console.log('✅ ลบผู้ช่วยสำเร็จ:', assistant.name);
              Alert.alert('สำเร็จ', `ลบผู้ช่วย "${assistant.name}" เรียบร้อยแล้ว`);
              
              // รีโหลดข้อมูล
              loadAssistants();
              
            } catch (error) {
              console.error('❌ ข้อผิดพลาดในการลบผู้ช่วย:', error);
              Alert.alert('ข้อผิดพลาด', 'ไม่สามารถลบผู้ช่วยได้');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleChangePassword = (assistant) => {
    navigation.navigate('ChangeAssistantPassword', { 
      assistantData: assistant
    });
  };

  const renderAssistantItem = ({ item }) => (
    <View style={styles.assistantCard}>
      <View style={styles.assistantInfo}>
        <View style={styles.assistantAvatar}>
          {item.profileImage ? (
            <Image 
              source={{ uri: item.profileImage }} 
              style={styles.assistantImage}
              onError={() => console.error('❌ ไม่สามารถโหลดรูปผู้ช่วยได้:', item.email)}
            />
          ) : (
            <Text style={styles.assistantInitial}>
              {item.name?.charAt(0)?.toUpperCase() || 'A'}
            </Text>
          )}
        </View>
        <View style={styles.assistantDetails}>
          <Text style={styles.assistantName}>{item.name}</Text>
          <Text style={styles.assistantEmail}>{item.email}</Text>
          <Text style={styles.assistantRole}>ผู้ช่วยฟาร์ม</Text>
          <Text style={styles.assistantDate}>
            สร้างเมื่อ: {new Date(item.createdAt).toLocaleDateString('th-TH')}
          </Text>
          {item.updatedAt && item.updatedAt !== item.createdAt && (
            <Text style={styles.assistantUpdated}>
              แก้ไขล่าสุด: {new Date(item.updatedAt).toLocaleDateString('th-TH')}
            </Text>
          )}
          {item.passwordResetAt && (
            <Text style={styles.assistantPasswordReset}>
              รีเซ็ทรหัสผ่านล่าสุด: {new Date(item.passwordResetAt).toLocaleDateString('th-TH')}
            </Text>
          )}
          {item.passwordChangedAt && (
            <Text style={styles.assistantPasswordChanged}>
              เปลี่ยนรหัสผ่านล่าสุด: {new Date(item.passwordChangedAt).toLocaleDateString('th-TH')}
              {item.passwordChangedBy && ` โดย: ${item.passwordChangedBy}`}
            </Text>
          )}
          <Text style={[styles.assistantStatus, { color: item.isActive ? '#4CAF50' : '#f44336' }]}>
            สถานะ: {item.isActive ? 'ใช้งานอยู่' : 'ปิดใช้งาน'}
          </Text>
        </View>
      </View>
      
      <View style={styles.assistantActions}>
        <TouchableOpacity 
          style={styles.changePasswordButton}
          onPress={() => handleChangePassword(item)}
        >
          <Text style={styles.changePasswordButtonText}>เปลี่ยนรหัส</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => handleDeleteAssistant(item)}
        >
          <Text style={styles.deleteButtonText}>ลบ</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* สถิติ */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{assistants.length}</Text>
          <Text style={styles.statLabel}>ผู้ช่วยทั้งหมด</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {assistants.filter(a => a.isActive).length}
          </Text>
          <Text style={styles.statLabel}>ใช้งานอยู่</Text>
        </View>
      </View>

      {/* ปุ่มด้านขวา */}
      <View style={styles.rightButtonsContainer}>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('AddAssistant')}
        >
          <Text style={styles.addButtonText}>+ เพิ่มผู้ช่วย</Text>
        </TouchableOpacity>
      </View>

      {/* รายการผู้ช่วย */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B4513" />
          <Text style={styles.loadingText}>กำลังโหลดข้อมูลผู้ช่วย...</Text>
        </View>
      ) : assistants.length > 0 ? (
        <FlatList
          data={assistants}
          renderItem={renderAssistantItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>ไม่มีข้อมูล</Text>
          <Text style={styles.emptyTitle}>ยังไม่มีผู้ช่วย</Text>
          <Text style={styles.emptySubtitle}>เพิ่มผู้ช่วยเพื่อช่วยจัดการฟาร์มของคุณ</Text>
          <TouchableOpacity 
            style={styles.emptyButton}
            onPress={() => navigation.navigate('AddAssistant')}
          >
            <Text style={styles.emptyButtonText}>+ เพิ่มผู้ช่วยคนแรก</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

export default AssistantManagementScreen;
