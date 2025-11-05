import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList, 
  TextInput, 
  Alert, 
  ActivityIndicator,
  Modal,
  RefreshControl 
} from 'react-native';
import { styles } from '../styles/BreedManagementScreen.styles';
import { collection, getDocs, addDoc, /* deleteDoc, */ doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useUser } from '../contexts/UserContext';
import { initializeDefaultData, isProtectedData, getProtectionMessage } from '../utils/defaultData';

const BreedManagementScreen = ({ navigation }) => {
  const [breeds, setBreeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newBreedName, setNewBreedName] = useState('');
  const [editingBreed, setEditingBreed] = useState(null);
  const [searchText, setSearchText] = useState('');
  const { user } = useUser();

  // พันธุ์วัวเริ่มต้น
  const defaultBreeds = [
    'โคนม',
    'โคเนื้อ',
    'โคพื้นเมือง',
    'โคบราห์มัน',
    'โคลิมูซิน',
    'โคชาโรเลส์',
    'โคแองกัส',
    'โคเฮียร์ฟอร์ด',
    'โคซิมเมนทัล',
    'โคเชโรเล'
  ];

  useEffect(() => {
    initializeDefaultData().then(() => {
      fetchBreeds();
    });
  }, []);

  // ดึงข้อมูลพันธุ์วัวจาก Firebase
  const fetchBreeds = async () => {
    try {
      console.log('🐄 กำลังดึงข้อมูลพันธุ์วัวจาก Firebase...');
      setLoading(true);
      
      const breedsCollection = collection(db, 'breeds');
      const breedsSnapshot = await getDocs(breedsCollection);
      let breedsList = breedsSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(item => !item.isDeleted);
      
      // กรองเฉพาะพันธุ์วัวของฟาร์มนี้
      let ownerEmail = user?.email;
      if (user?.isAssistant || user?.role === 'ผู้ช่วยฟาร์ม') {
        ownerEmail = user?.ownerId;
      }
      breedsList = breedsList.filter(breed => breed.ownerEmail === ownerEmail || breed.isDefault);
      
      console.log('✅ ดึงข้อมูลพันธุ์วัวสำเร็จ:', breedsList.length, 'พันธุ์');
      setBreeds(breedsList);
      
    } catch (error) {
      console.error('❌ ข้อผิดพลาดในการดึงข้อมูลพันธุ์วัว:', error);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถดึงข้อมูลพันธุ์วัวได้');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBreeds();
  };

  // สร้างข้อมูลพันธุ์วัวเริ่มต้น
  const createDefaultBreeds = async () => {
    try {
      const breedsCollection = collection(db, 'breeds');
      const promises = defaultBreeds.map(breedName => 
        addDoc(breedsCollection, {
          name: breedName,
          description: `พันธุ์${breedName}`,
          isDefault: true,
          createdAt: new Date().toISOString()
        })
      );
      
      await Promise.all(promises);
      console.log('✅ สร้างข้อมูลพันธุ์วัวเริ่มต้นสำเร็จ');
      await fetchBreeds(); // รีเฟรชข้อมูล
      
    } catch (error) {
      console.error('❌ ข้อผิดพลาดในการสร้างข้อมูลเริ่มต้น:', error);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถสร้างข้อมูลพันธุ์วัวได้');
    }
  };

  // เพิ่มพันธุ์วัวใหม่
  const addBreed = async () => {
    if (!newBreedName.trim()) {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกชื่อพันธุ์วัว');
      return;
    }

    // ตรวจสอบว่ามีพันธุ์นี้อยู่แล้วหรือไม่
    const existingBreed = breeds.find(breed => 
      breed.name.toLowerCase() === newBreedName.trim().toLowerCase()
    );
    
    if (existingBreed) {
      Alert.alert('ข้อผิดพลาด', 'มีพันธุ์วัวนี้อยู่ในระบบแล้ว');
      return;
    }

    try {
      console.log('🐄 กำลังเพิ่มพันธุ์วัวใหม่:', newBreedName);
      
      const breedsCollection = collection(db, 'breeds');
      let ownerEmail = user?.email;
      if (user?.isAssistant || user?.role === 'ผู้ช่วยฟาร์ม') {
        ownerEmail = user?.ownerId;
      }
      await addDoc(breedsCollection, {
        name: newBreedName.trim(),
        description: `พันธุ์${newBreedName.trim()}`,
        isDefault: false,
        ownerEmail,
        createdAt: new Date().toISOString()
      });
      
      console.log('✅ เพิ่มพันธุ์วัวสำเร็จ');
      setNewBreedName('');
      setShowAddModal(false);
      Alert.alert('สำเร็จ', 'เพิ่มพันธุ์วัวใหม่เรียบร้อยแล้ว');
      await fetchBreeds();
      
    } catch (error) {
      console.error('❌ ข้อผิดพลาดในการเพิ่มพันธุ์วัว:', error);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถเพิ่มพันธุ์วัวได้');
    }
  };

  // แก้ไขพันธุ์วัว
  const updateBreed = async () => {
    if (!newBreedName.trim()) {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกชื่อพันธุ์วัว');
      return;
    }

    // ตรวจสอบว่าเป็นพันธุ์เริ่มต้นหรือไม่
    if (isProtectedData(editingBreed)) {
      Alert.alert('ไม่สามารถแก้ไขได้', getProtectionMessage('พันธุ์วัว'));
      return;
    }

    try {
      console.log('🐄 กำลังแก้ไขพันธุ์วัว:', editingBreed.id);
      
      const breedRef = doc(db, 'breeds', editingBreed.id);
      await updateDoc(breedRef, {
        name: newBreedName.trim(),
        description: `พันธุ์${newBreedName.trim()}`,
        updatedAt: new Date().toISOString()
      });
      
      console.log('✅ แก้ไขพันธุ์วัวสำเร็จ');
      setNewBreedName('');
      setEditingBreed(null);
      setShowEditModal(false);
      Alert.alert('สำเร็จ', 'แก้ไขพันธุ์วัวเรียบร้อยแล้ว');
      await fetchBreeds();
      
    } catch (error) {
      console.error('❌ ข้อผิดพลาดในการแก้ไขพันธุ์วัว:', error);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถแก้ไขพันธุ์วัวได้');
    }
  };

  // ลบพันธุ์วัว
  const deleteBreed = async (breedId, breedName, breedData) => {
    // ตรวจสอบว่าเป็นพันธุ์เริ่มต้นหรือไม่
    if (isProtectedData(breedData)) {
      Alert.alert('ไม่สามารถลบได้', getProtectionMessage('พันธุ์วัว'));
      return;
    }

    Alert.alert(
      'ยืนยันการลบ',
      `ต้องการลบพันธุ์วัว "${breedName}" หรือไม่?`,
      [
        { text: 'ยกเลิก', style: 'cancel' },
        { 
          text: 'ลบ', 
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🗑️ กำลังลบพันธุ์วัว:', breedId);
              
              const breedRef = doc(db, 'breeds', breedId);
              await updateDoc(breedRef, { isDeleted: true, deletedAt: serverTimestamp() });
              
              console.log('✅ ลบพันธุ์วัวสำเร็จ');
              Alert.alert('สำเร็จ', 'ลบพันธุ์วัวเรียบร้อยแล้ว');
              await fetchBreeds();
              
            } catch (error) {
              console.error('❌ ข้อผิดพลาดในการลบพันธุ์วัว:', error);
              Alert.alert('ข้อผิดพลาด', 'ไม่สามารถลบพันธุ์วัวได้');
            }
          }
        }
      ]
    );
  };

  // เริ่มแก้ไขพันธุ์วัว
  const startEditBreed = (breed) => {
    // ตรวจสอบว่าเป็นพันธุ์เริ่มต้นหรือไม่
    if (isProtectedData(breed)) {
      Alert.alert('ไม่สามารถแก้ไขได้', getProtectionMessage('พันธุ์วัว'));
      return;
    }

    setEditingBreed(breed);
    setNewBreedName(breed.name);
    setShowEditModal(true);
  };

  // กรองข้อมูลตามการค้นหา
  const filteredBreeds = breeds.filter(breed =>
    breed.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const renderBreedItem = ({ item }) => {
    const isProtected = isProtectedData(item);
    
    return (
      <View style={styles.breedItem}>
        <View style={styles.breedInfo}>
          <Text style={styles.breedName}>{item.name}</Text>
          <Text style={styles.breedDescription}>{item.description}</Text>
          {isProtected && (
            <Text style={styles.defaultLabel}>
              🔒 พันธุ์เริ่มต้น (ไม่สามารถแก้ไขได้)
            </Text>
          )}
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            onPress={() => startEditBreed(item)}
            style={[styles.editButton, isProtected && styles.disabledButton]}
            disabled={isProtected}
          >
            <Text style={[styles.editButtonText, isProtected && styles.disabledButtonText]}>
              {isProtected ? '🔒' : '✏️'}
            </Text>
          </TouchableOpacity>
          {!isProtected && (
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={() => deleteBreed(item.id, item.name, item)}
            >
              <Text style={styles.deleteButtonText}>🗑️</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={styles.loadingText}>กำลังโหลดข้อมูลพันธุ์วัว...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>จัดการพันธุ์วัว</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <Text style={styles.addButtonText}>+ พันธุ์วัว</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search */}
      <TextInput
        style={styles.searchInput}
        placeholder="ค้นหาพันธุ์วัว..."
        value={searchText}
        onChangeText={setSearchText}
      />

      {/* Breeds List */}
      <FlatList
        data={filteredBreeds}
        renderItem={renderBreedItem}
        keyExtractor={item => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Add Breed Modal */}
      <Modal
        visible={showAddModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>เพิ่มพันธุ์วัวใหม่</Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="ชื่อพันธุ์วัว เช่น โคไทย"
              value={newBreedName}
              onChangeText={setNewBreedName}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => {
                  setShowAddModal(false);
                  setNewBreedName('');
                }}
              >
                <Text style={styles.cancelButtonText}>ยกเลิก</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.confirmButton}
                onPress={addBreed}
              >
                <Text style={styles.confirmButtonText}>เพิ่ม</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Breed Modal */}
      <Modal
        visible={showEditModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>แก้ไขพันธุ์วัว</Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="ชื่อพันธุ์วัว"
              value={newBreedName}
              onChangeText={setNewBreedName}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => {
                  setShowEditModal(false);
                  setEditingBreed(null);
                  setNewBreedName('');
                }}
              >
                <Text style={styles.cancelButtonText}>ยกเลิก</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.confirmButton}
                onPress={updateBreed}
              >
                <Text style={styles.confirmButtonText}>บันทึก</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default BreedManagementScreen;
