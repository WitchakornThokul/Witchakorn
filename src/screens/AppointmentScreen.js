import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  Modal,
  FlatList,
  ActivityIndicator,
  Image,
  SafeAreaView,
  StatusBar
} from 'react-native';
import * as Notifications from 'expo-notifications';
import { styles } from '../styles/AppointmentScreen.styles';
import { useUser } from '../contexts/UserContext';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  onSnapshot,
  doc,
  updateDoc,
  // deleteDoc,
  getDocs,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';

// กำหนดการแสดงผลการแจ้งเตือน
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const AppointmentScreen = ({ navigation }) => {
  const { user } = useUser();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [showCowSelectionModal, setShowCowSelectionModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(new Date());
  const [cows, setCows] = useState([]);
  const [loadingCows, setLoadingCows] = useState(false);
  const [selectedHour, setSelectedHour] = useState(9);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [imageErrors, setImageErrors] = useState(new Set()); // เก็บ cowId ที่รูปโหลดไม่ได้

  const [appointmentForm, setAppointmentForm] = useState({
    title: '',
    description: '',
    cowId: '',
    appointmentDate: new Date(),
    appointmentTime: new Date(),
    type: 'ตรวจสุขภาพ',
    status: 'pending'
  });

  const appointmentTypes = [
    'ตรวจสุขภาพ',
    'ฉีดวัคซีน',
    'รักษา',
    'อื่นๆ'
  ];

  // ขออนุญาตการแจ้งเตือน
  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  // โหลดข้อมูลวัวจาก Firebase (เฉพาะที่เพิ่มผ่านหน้า CowManagement)
  const loadCows = useCallback(async () => {
    if (!user?.email) {
      setCows([]);
      setLoadingCows(false);
      return;
    }
    
    try {
      setLoadingCows(true);
      setCows([]); // เคลียร์ข้อมูลเก่าก่อน
      
      // กำหนด ownerEmail ที่ถูกต้อง
      let ownerEmail = user.email;
      if (user.isAssistant || user.role === 'ผู้ช่วยฟาร์ม') {
        ownerEmail = user.ownerId; // ใช้ email ของเจ้าของฟาร์ม
        if (__DEV__) {
          console.log('ผู้ช่วยกำลังดูข้อมูลวัวของเจ้าของฟาร์ม:', ownerEmail);
        }
      } else {
        if (__DEV__) {
          console.log('เจ้าของฟาร์มกำลังดูข้อมูลวัวของตัวเอง:', ownerEmail);
        }
      }
      
      const cowsRef = collection(db, 'cows');
      const cowQuery = query(
        cowsRef,
        where('ownerEmail', '==', ownerEmail) // ใช้ ownerEmail ที่ถูกต้อง
      );

  const snapshot = await getDocs(cowQuery);
      
      if (!snapshot || snapshot.empty) {
        setCows([]);
        setLoadingCows(false);
        return;
      }
      
      const cowData = [];
      snapshot.docs.forEach((doc, index) => {
        try {
          const data = doc.data();
          
          if (!data || typeof data !== 'object') return;
          
          // เก็บเฉพาะวัวที่มี cowId จาก CowManagement และ ownerEmail ตรงกัน
          if (!data.isDeleted && data.cowId && typeof data.cowId === 'string' && data.ownerEmail === ownerEmail) {
            // Debug: แสดงข้อมูลรูปภาพจาก Firebase (ใช้ในการพัฒนาเท่านั้น)
            if (__DEV__) {
              console.log(`🐄 วัว ${data.cowId} จาก Firebase:`, {
                hasImage: !!data.image,
                hasImageUrl: !!data.imageUrl,
                imageType: data.image ? (data.image.startsWith('data:image/') ? 'base64' : 'url') : 'ไม่มี',
                imageLength: data.image ? data.image.length : 0
              });
            }
            
            const cowItem = {
              id: doc.id || `cow-${Date.now()}-${index}`,
              cowId: String(data.cowId).trim(),
              name: String(data.name || data.cowName || '').trim(),
              breed: data.breed || data.breedType || '',
              status: data.status || data.health || '',
              gender: data.gender || data.sex || '',
              birthDate: data.birthDate,
              ownerEmail: data.ownerEmail,
              imageUrl: data.image || data.imageUrl, // ใช้ image เป็นหลัก แล้ว fallback เป็น imageUrl
              image: data.image || data.imageUrl // เพิ่ม image field ด้วย
            };
            cowData.push(cowItem);
          }
        } catch (itemError) {
          if (__DEV__) {
            console.error('Error processing cow document:', doc.id, itemError);
          }
        }
      });
      
      // เรียงลำดับตาม cowId จาก CowManagement
      cowData.sort((a, b) => {
        const aId = String(a.cowId || '');
        const bId = String(b.cowId || '');
        return aId.localeCompare(bId);
      });
      
      setCows(cowData);
      
      // Debug: แสดงข้อมูลวัวที่โหลดมา (ใช้ในการพัฒนาเท่านั้น)
      if (__DEV__) {
        console.log('🐄 จำนวนวัวที่โหลดมา:', cowData.length);
        cowData.forEach(cow => {
          console.log(`วัว ${cow.cowId}:`, {
            id: cow.id,
            name: cow.name,
            hasImage: !!cow.image,
            imageUrl: cow.image ? 'มีรูป' : 'ไม่มีรูป'
          });
        });
      }
      
    } catch (error) {
      if (__DEV__) {
        console.error('Error loading cows:', error);
      }
      setCows([]);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลวัวได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoadingCows(false);
    }
  }, [user?.email, user?.isAssistant, user?.role, user?.ownerId]);

  // โหลดข้อมูลวัวเมื่อมี user
  useEffect(() => {
    if (user?.email) {
      loadCows();
    }
  }, [user, loadCows]);

  // โหลดข้อมูลนัดหมาย
  useEffect(() => {
    if (user?.email) {
      setLoadingAppointments(true);
      let unsubscribe = null;
      
      const setupListener = async () => {
        try {
          unsubscribe = await loadAppointments();
        } catch (error) {
          if (__DEV__) {
            console.error('Error setting up appointments listener:', error);
          }
          setLoadingAppointments(false);
        }
      };
      
      setupListener();
      
      const timeout = setTimeout(() => {
        setLoadingAppointments(false);
      }, 10000);
      
      return () => {
        if (unsubscribe && typeof unsubscribe === 'function') {
          unsubscribe();
        }
        clearTimeout(timeout);
      };
    } else {
      setLoadingAppointments(false);
    }
  }, [user, loadAppointments]);

  const registerForPushNotificationsAsync = async () => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        Alert.alert(
          'การแจ้งเตือน',
          'กรุณาอนุญาตการแจ้งเตือนเพื่อรับการแจ้งเตือนนัดหมาย',
          [{ text: 'ตกลง' }]
        );
        return;
      }

    } catch (error) {
      if (__DEV__) {
        console.error('ข้อผิดพลาดในการขออนุญาตแจ้งเตือน:', error);
      }
    }
  };

  const loadAppointments = useCallback(async () => {
    try {
      // กำหนด userEmail ที่ถูกต้อง
      let userEmail = user.email;
      if (user.isAssistant || user.role === 'ผู้ช่วยฟาร์ม') {
        userEmail = user.ownerId; // ใช้ email ของเจ้าของฟาร์ม
        if (__DEV__) {
          console.log('ผู้ช่วยกำลังดูข้อมูลนัดหมายของเจ้าของฟาร์ม:', userEmail);
        }
      } else {
        if (__DEV__) {
          console.log('เจ้าของฟาร์มกำลังดูข้อมูลนัดหมายของตัวเอง:', userEmail);
        }
      }
      
      const appointmentsRef = collection(db, 'appointments');
      const simpleQuery = query(
        appointmentsRef,
        where('userEmail', '==', userEmail) // ใช้ userEmail ที่ถูกต้อง
      );

      const unsubscribe = onSnapshot(simpleQuery, (snapshot) => {
        const appointmentData = [];
        
    snapshot.docs.forEach(doc => {
          try {
            const data = doc.data();
      if (data.isDeleted) return; // ข้ามรายการที่ถูกลบ
            
            let appointmentDateTime = new Date();
            if (data.appointmentDateTime) {
              if (data.appointmentDateTime.toDate) {
                appointmentDateTime = data.appointmentDateTime.toDate();
              } else if (data.appointmentDateTime instanceof Date) {
                appointmentDateTime = data.appointmentDateTime;
              } else {
                appointmentDateTime = new Date(data.appointmentDateTime);
              }
            }
            
            appointmentData.push({
              id: doc.id,
              title: data.title || '',
              description: data.description || '',
              cowId: data.cowId || '',
              type: data.type || '',
              status: data.status || 'pending',
              appointmentDateTime: appointmentDateTime,
              userEmail: data.userEmail || '',
              farmName: data.farmName || '',
              createdAt: data.createdAt,
              updatedAt: data.updatedAt,
              notificationId: data.notificationId
            });
            
          } catch (error) {
            if (__DEV__) {
              console.error('Error processing appointment document:', doc.id, error);
            }
          }
        });
        
        appointmentData.sort((a, b) => a.appointmentDateTime - b.appointmentDateTime);
        
        setAppointments(appointmentData);
        setLoadingAppointments(false);
        
      }, (error) => {
        if (__DEV__) {
          console.error('Error loading appointments:', error);
        }
        setLoadingAppointments(false);
        Alert.alert('ข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลนัดหมายได้');
      });

      return unsubscribe;
    } catch (error) {
      if (__DEV__) {
        console.error('Error in loadAppointments:', error);
      }
      setLoadingAppointments(false);
      Alert.alert('ข้อผิดพลาด', 'เกิดข้อผิดพลาดในการเชื่อมต่อ');
    }
  }, [user.email, user.isAssistant, user.ownerId]);

  const scheduleNotification = useCallback(async (appointment) => {
    try {
      const appointmentDateTime = new Date(appointment.appointmentDateTime);
      const now = new Date();
      
      const notificationTime = new Date(appointmentDateTime.getTime() - 60 * 60 * 1000);
      
      if (notificationTime > now) {
        const notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: `นัดหมายกำลังจะมาถึง`,
            body: `${appointment.title} - ${appointment.cowId} (${appointment.cowName || ''})\nอีก 1 ชั่วโมงจะถึงเวลานัดหมาย`,
            data: { appointmentId: appointment.id },
            sound: true,
          },
          trigger: notificationTime,
        });

        return notificationId;
      }

      if (appointmentDateTime > now) {
        const exactNotificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: `ถึงเวลานัดหมายแล้ว!`,
            body: `${appointment.title} - ${appointment.cowId} (${appointment.cowName || ''})\nเวลา: ${appointmentDateTime.toLocaleString('th-TH')}`,
            data: { appointmentId: appointment.id },
            sound: true,
          },
          trigger: appointmentDateTime,
        });

        return exactNotificationId;
      }

    } catch (error) {
      if (__DEV__) {
        console.error('Error scheduling notification:', error);
      }
    }
  }, []);

  const cancelNotification = useCallback(async (notificationId) => {
    try {
      if (notificationId) {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
      }
    } catch (error) {
      if (__DEV__) {
        console.error('Error canceling notification:', error);
      }
    }
  }, []);

  const selectDate = () => {
    setSelectedCalendarDate(appointmentForm.appointmentDate);
    setCurrentMonth(appointmentForm.appointmentDate);
    setShowDateModal(true);
  };

  const selectTime = () => {
    // ตั้งค่าเริ่มต้นจากเวลาปัจจุบันของ appointmentForm
    const currentTime = appointmentForm.appointmentTime;
    setSelectedHour(currentTime.getHours());
    setSelectedMinute(currentTime.getMinutes());
    setShowTimeModal(true);
  };

  const selectCow = useCallback(() => {
    try {
      if (!user?.email) {
        Alert.alert('ข้อผิดพลาด', 'ไม่พบข้อมูลผู้ใช้');
        return;
      }
      
      // โหลดข้อมูลวัวใหม่ก่อนแสดง modal
      loadCows();
      setShowCowSelectionModal(true);
    } catch (error) {
      if (__DEV__) {
        console.error('Error opening cow selection:', error);
      }
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถเปิดหน้าเลือกวัวได้');
    }
  }, [loadCows, user?.email]);

  // ฟังก์ชันสำหรับสร้างปฏิทิน
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
        isPast: prevDate < new Date().setHours(0, 0, 0, 0)
      });
    }
    
    // เพิ่มวันในเดือนปัจจุบัน
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const currentDate = new Date(year, month, day);
      days.push({
        date: currentDate,
        isCurrentMonth: true,
        isPast: currentDate < new Date().setHours(0, 0, 0, 0)
      });
    }
    
    // เพิ่มวันในเดือนถัดไป
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const nextDate = new Date(year, month + 1, day);
      days.push({
        date: nextDate,
        isCurrentMonth: false,
        isPast: false
      });
    }
    
    return days;
  };

  const formatCalendarDate = (date) => {
    return date.getDate().toString();
  };

  const isSelectedDate = (date) => {
    return selectedCalendarDate.toDateString() === date.toDateString();
  };

  const selectCalendarDate = (date) => {
    if (date < new Date().setHours(0, 0, 0, 0)) {
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถเลือกวันที่ในอดีตได้');
      return;
    }
    setSelectedCalendarDate(date);
  };

  const confirmDateSelection = () => {
    setAppointmentForm(prev => ({ 
      ...prev, 
      appointmentDate: selectedCalendarDate 
    }));
    setShowDateModal(false);
  };

  const confirmTimeSelection = () => {
    const time = new Date();
    time.setHours(selectedHour, selectedMinute, 0, 0);
    setAppointmentForm(prev => ({ 
      ...prev, 
      appointmentTime: time 
    }));
    setShowTimeModal(false);
  };

  const selectCowFromList = useCallback((cow) => {
    try {
      if (!cow || typeof cow !== 'object') {
        Alert.alert('ข้อผิดพลาด', 'ข้อมูลวัวไม่ถูกต้อง');
        return;
      }
      
      // ใช้เฉพาะ cowId จาก CowManagement
      const cowId = cow.cowId;
      const cowName = cow.name || ''; // Assuming cow object has a 'name' property
      const cowIdWithName = `${cowId.trim()} (${cowName})`;

      if (!cowId || typeof cowId !== 'string' || cowId.trim() === '') {
        Alert.alert('ข้อผิดพลาด', 'ไม่พบรหัสวัวจาก CowManagement กรุณาตรวจสอบข้อมูลวัว');
        return;
      }
      
      setAppointmentForm(prev => ({ 
        ...prev, 
        cowId: cowIdWithName 
      }));
      
      setShowCowSelectionModal(false);
      
    } catch (error) {
      if (__DEV__) {
        console.error('Error selecting cow:', error);
      }
      Alert.alert('ข้อผิดพลาด', 'เกิดข้อผิดพลาดในการเลือกวัว');
    }
  }, []);

  const goToPreviousMonth = useCallback(() => {
    const prevMonth = new Date(currentMonth);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    setCurrentMonth(prevMonth);
  }, [currentMonth]);

  const goToNextMonth = useCallback(() => {
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setCurrentMonth(nextMonth);
  }, [currentMonth]);

  const getMonthYearText = useCallback(() => {
    return currentMonth.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long'
    });
  }, [currentMonth]);

  const handleSaveAppointment = useCallback(async () => {
    // ตรวจสอบสิทธิ์: เฉพาะเจ้าของฟาร์มเท่านั้นที่สามารถเพิ่ม/แก้ไขนัดหมายได้
    if (user.isAssistant || user.role === 'ผู้ช่วยฟาร์ม') {
      Alert.alert(
        'ไม่มีสิทธิ์',
        'ผู้ช่วยฟาร์มไม่สามารถเพิ่มหรือแก้ไขนัดหมายได้\nกรุณาติดต่อเจ้าของฟาร์มเพื่อดำเนินการ',
        [{ text: 'เข้าใจแล้ว' }]
      );
      return;
    }

    if (!appointmentForm.title.trim()) {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกหัวข้อนัดหมาย');
      return;
    }

    if (!appointmentForm.cowId.trim()) {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกรหัสวัว');
      return;
    }

    setLoading(true);
    try {
      // รวมวันที่และเวลา
      const appointmentDateTime = new Date(appointmentForm.appointmentDate);
      appointmentDateTime.setHours(appointmentForm.appointmentTime.getHours());
      appointmentDateTime.setMinutes(appointmentForm.appointmentTime.getMinutes());

      // กำหนด userEmail และ farmName ที่ถูกต้อง
      // ผู้ช่วยสามารถเพิ่มนัดหมายได้ในนามเจ้าของฟาร์ม
      let userEmail = user.email;
      let farmName = user.farmName || '';
      
      if (user.isAssistant || user.role === 'ผู้ช่วยฟาร์ม') {
        userEmail = user.ownerId; // ใช้ email ของเจ้าของฟาร์ม
        farmName = user.ownerFarmName || ''; // ใช้ชื่อฟาร์มของเจ้าของ
        if (__DEV__) {
          console.log('ผู้ช่วยกำลังสร้างนัดหมายในนามเจ้าของฟาร์ม:', userEmail);
        }
      } else {
        if (__DEV__) {
          console.log('เจ้าของฟาร์มกำลังสร้างนัดหมายของตัวเอง:', userEmail);
        }
      }

      const appointmentData = {
        title: appointmentForm.title.trim(),
        description: appointmentForm.description.trim(),
        cowId: appointmentForm.cowId.trim(),
        appointmentDateTime: Timestamp.fromDate(appointmentDateTime),
        type: appointmentForm.type,
        status: appointmentForm.status,
        userEmail: userEmail, // ใช้ userEmail ที่ถูกต้อง
        farmName: farmName, // ใช้ farmName ที่ถูกต้อง
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: user.name || user.email, // เก็บข้อมูลว่าใครเป็นคนสร้าง
        createdByRole: user.isAssistant ? 'ผู้ช่วยฟาร์ม' : 'เจ้าของฟาร์ม'
      };

      if (editingAppointment) {
        // แก้ไขนัดหมาย
        const appointmentRef = doc(db, 'appointments', editingAppointment.id);
        await updateDoc(appointmentRef, {
          ...appointmentData,
          updatedAt: Timestamp.now()
        });

        // ยกเลิกการแจ้งเตือนเก่า
        if (editingAppointment.notificationId) {
          await cancelNotification(editingAppointment.notificationId);
        }

        Alert.alert('สำเร็จ', 'แก้ไขนัดหมายเรียบร้อยแล้ว');
      } else {
        const docRef = await addDoc(collection(db, 'appointments'), appointmentData);
        Alert.alert('สำเร็จ', 'เพิ่มนัดหมายเรียบร้อยแล้ว');
      }

      // ตั้งการแจ้งเตือน
      const notificationId = await scheduleNotification({
        ...appointmentData,
        appointmentDateTime,
        id: editingAppointment?.id || 'new'
      });

      resetForm();
      setShowModal(false);

    } catch (error) {
      if (__DEV__) {
        console.error('ข้อผิดพลาดในการบันทึกนัดหมาย:', error);
      }
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถบันทึกนัดหมายได้');
    } finally {
      setLoading(false);
    }
  }, [appointmentForm, editingAppointment, user, scheduleNotification, cancelNotification, resetForm]);

  const handleDeleteAppointment = useCallback(async (appointment) => {
    Alert.alert(
      'ยืนยันการลบ',
      `ต้องการลบนัดหมาย "${appointment.title}" หรือไม่?`,
      [
        { text: 'ยกเลิก', style: 'cancel' },
        {
          text: 'ลบ',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);

              // ยกเลิกการแจ้งเตือน
              if (appointment.notificationId) {
                await cancelNotification(appointment.notificationId);
              }

              // Soft delete แทนการลบเอกสารจริง
              await updateDoc(doc(db, 'appointments', appointment.id), {
                isDeleted: true,
                deletedAt: Timestamp.now(),
                deletedBy: user.name || user.email
              });
              
              Alert.alert('สำเร็จ', 'ลบนัดหมายเรียบร้อยแล้ว');
            } catch (error) {
              if (__DEV__) {
                console.error('ข้อผิดพลาดในการลบนัดหมาย:', error);
              }
              Alert.alert('ข้อผิดพลาด', 'ไม่สามารถลบนัดหมายได้');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  }, [cancelNotification]);

  const handleCompleteAppointment = useCallback(async (appointment) => {
    try {
      setLoading(true);
      const appointmentRef = doc(db, 'appointments', appointment.id);
      await updateDoc(appointmentRef, {
        status: 'completed',
        completedAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        completedBy: user.name || user.email, // เก็บข้อมูลว่าใครเป็นคนทำเครื่องหมายเสร็จ
        completedByRole: user.isAssistant ? 'ผู้ช่วยฟาร์ม' : 'เจ้าของฟาร์ม'
      });

      // ยกเลิกการแจ้งเตือน
      if (appointment.notificationId) {
        await cancelNotification(appointment.notificationId);
      }

      Alert.alert('สำเร็จ', 'ทำเครื่องหมายว่าเสร็จสิ้นแล้ว');
    } catch (error) {
      if (__DEV__) {
        console.error('ข้อผิดพลาดในการอัพเดทสถานะ:', error);
      }
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถอัพเดทสถานะได้');
    } finally {
      setLoading(false);
    }
  }, [cancelNotification]);

  const resetForm = useCallback(() => {
    setAppointmentForm({
      title: '',
      description: '',
      cowId: '',
      appointmentDate: new Date(),
      appointmentTime: new Date(),
      type: 'ตรวจสุขภาพ',
      status: 'pending'
    });
    setEditingAppointment(null);
  }, []);

  const openEditModal = useCallback((appointment) => {
    const appointmentDate = new Date(appointment.appointmentDateTime);
    setAppointmentForm({
      title: appointment.title,
      description: appointment.description || '',
      cowId: appointment.cowId,
      appointmentDate: appointmentDate,
      appointmentTime: appointmentDate,
      type: appointment.type,
      status: appointment.status
    });
    setEditingAppointment(appointment);
    setShowModal(true);
  }, []);

  const formatDateTime = useCallback((dateTime) => {
    const date = new Date(dateTime);
    return date.toLocaleString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  const getStatusColor = useCallback((status) => {
    switch (status) {
      case 'completed': return '#E8F5E8';
      case 'cancelled': return '#FFEBEE';
      case 'pending': return '#FFF3E0';
      default: return '#E3F2FD';
    }
  }, []);

  const getStatusTextColor = useCallback((status) => {
    switch (status) {
      case 'completed': return '#2E7D32';
      case 'cancelled': return '#C62828';
      case 'pending': return '#E65100';
      default: return '#1565C0';
    }
  }, []);

  const getStatusBorderColor = useCallback((status) => {
    switch (status) {
      case 'completed': return '#4CAF50';
      case 'cancelled': return '#F44336';
      case 'pending': return '#FF9800';
      default: return '#2196F3';
    }
  }, []);

  const getStatusText = useCallback((status) => {
    switch (status) {
      case 'completed': return 'เสร็จสิ้น';
      case 'cancelled': return 'ยกเลิก';
      case 'pending': return 'รอดำเนินการ';
      default: return 'ไม่ทราบสถานะ';
    }
  }, []);

  // ข้อมูลวัวที่กรองแล้ว
  const filteredCows = useMemo(() => {
    return (cows || []).filter(item => item && item.cowId && typeof item.cowId === 'string');
  }, [cows]);

  const renderAppointmentItem = useCallback(({ item }) => {
    const isUpcoming = new Date(item.appointmentDateTime) > new Date();
    const timeUntil = isUpcoming ? 
      Math.ceil((new Date(item.appointmentDateTime) - new Date()) / (1000 * 60 * 60 * 24)) : 
      null;
    
    // ตรวจสอบว่า cows โหลดเสร็จแล้วหรือยัง
    if (__DEV__ && loadingCows) {
      console.log('⏳ ยังโหลดข้อมูลวัวอยู่...');
    }
    
    // หาข้อมูลวัวจาก cowId (รองรับการจับคู่แบบต่างๆ)
    let cowData = null;
    
    if (item.cowId && cows.length > 0) {
      // แยก cowId จากชื่อ (กรณีที่เป็น "C1 (ชื่อวัว)")
      const appointmentCowId = item.cowId.includes('(') 
        ? item.cowId.split('(')[0].trim() 
        : item.cowId.trim();
      
      if (__DEV__) {
        console.log(`🔍 ค้นหาวัว: appointment cowId = "${item.cowId}", ที่แยกแล้ว = "${appointmentCowId}"`);
      }
      
      // ลองหาแบบต่างๆ
      cowData = cows.find(cow => {
        if (!cow.cowId) return false;
        
        const cowId = cow.cowId.trim();
        
        // 1. ตรงทุกตัวอักษร
        if (cowId === appointmentCowId) return true;
        
        // 2. ตรงโดยไม่สนใจ case
        if (cowId.toLowerCase() === appointmentCowId.toLowerCase()) return true;
        
        // 3. ตรงกับ item.cowId ทั้งหมด
        if (cowId.toLowerCase() === item.cowId.trim().toLowerCase()) return true;
        
        return false;
      });
      
      if (__DEV__) {
        console.log(`🔍 ผลการค้นหา: พบข้อมูลวัว = ${!!cowData}`);
        if (cowData) {
          console.log(`✅ จับคู่สำเร็จ: วัว ${cowData.cowId} สำหรับนัดหมาย ${item.cowId}`);
        } else {
          console.log(`❌ ไม่พบข้อมูลวัวสำหรับ: ${item.cowId}`);
          console.log(`📋 วัวทั้งหมดในระบบ:`, cows.map(c => c.cowId));
        }
      }
    }
    
    // ประมวลผลรูปภาพจาก Firebase
    let cowImage = null;
    if (cowData) {
      // ลองใช้ image ก่อน แล้ว imageUrl
      const rawImage = cowData.image || cowData.imageUrl;
      
      if (rawImage) {
        // ตรวจสอบและแก้ไข URI
        if (rawImage.startsWith('http')) {
          // URL ปกติ
          cowImage = rawImage;
        } else if (rawImage.startsWith('data:image/')) {
          // Base64 ที่มี data URI scheme แล้ว
          cowImage = rawImage;
        } else {
          // Base64 ที่ไม่มี data URI scheme
          cowImage = `data:image/jpeg;base64,${rawImage}`;
          if (__DEV__) {
            console.log(`🔧 แก้ไข base64 URI สำหรับวัว ${item.cowId}`);
          }
        }
      }
    }
    
    // Debug logging (ใช้ในการพัฒนาเท่านั้น)
    if (__DEV__) {
      console.log(`🔍 ตรวจสอบนัดหมาย ${item.cowId}:`, {
        appointmentCowId: item.cowId,
        foundCowData: !!cowData,
        cowData: cowData ? { 
          id: cowData.id, 
          cowId: cowData.cowId, 
          hasImage: !!cowData.image,
          hasImageUrl: !!cowData.imageUrl,
          imageLength: cowData.image ? cowData.image.length : 0,
          imagePreview: cowData.image ? cowData.image.substring(0, 50) + '...' : 'ไม่มี'
        } : null,
        finalImage: cowImage ? 'มีรูป' : 'ไม่มีรูป',
        imageIsBase64: cowImage ? cowImage.startsWith('data:image/') : false,
        totalCows: cows.length,
        loadingCows: loadingCows
      });
    }

    return (
      <View style={styles.appointmentCard}>
        <View style={styles.appointmentHeader}>
          <View style={styles.cowImageContainer}>
            {cowImage && !imageErrors.has(item.cowId) ? (
              <Image 
                source={{ uri: cowImage }} 
                style={styles.appointmentCowImage}
                onError={(error) => {
                  // เพิ่ม cowId เข้า error set
                  setImageErrors(prev => new Set(prev).add(item.cowId));
                }}
                onLoad={() => {
                  // รูปโหลดสำเร็จ
                }}
                resizeMode="cover"
              />
            ) : cowData ? (
              // ลองโหลดรูปจาก Firebase อีกครั้งถ้ามีข้อมูลวัว
              cowData.image || cowData.imageUrl ? (
                <Image 
                  source={{ uri: cowData.image || cowData.imageUrl }} 
                  style={styles.appointmentCowImage}
                  onError={(error) => {
                    setImageErrors(prev => new Set(prev).add(item.cowId));
                  }}
                  onLoad={() => {
                    // รูปโหลดสำเร็จ
                  }}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.appointmentCowImagePlaceholder}>
                  <Text style={styles.appointmentCowImagePlaceholderText}>วัว</Text>
                </View>
              )
            ) : (
              <View style={styles.appointmentCowImagePlaceholder}>
                <Text style={styles.appointmentCowImagePlaceholderText}>วัว</Text>
              </View>
            )}
          </View>
          <View style={styles.appointmentInfo}>
            {item.title ? (
              <Text style={styles.appointmentTitle}>{item.title}</Text>
            ) : null}
            {item.cowId ? (
              <Text style={styles.appointmentCowId}>
                รหัสวัว: {item.cowId}{item.name ? ` - ${item.name}` : ''}
              </Text>
            ) : null}
            {item.type ? (
              <Text style={styles.appointmentType}>ประเภท: {item.type}</Text>
            ) : null}
            {isUpcoming && timeUntil ? (
              <Text style={styles.appointmentCountdown}>
                ⏰ อีก {timeUntil} วัน
              </Text>
            ) : null}
          </View>
          <View style={[
            styles.statusBadge, 
            { 
              backgroundColor: getStatusColor(item.status),
              borderColor: getStatusBorderColor(item.status)
            }
          ]}>
            <Text style={[
              styles.statusText, 
              { color: getStatusTextColor(item.status) }
            ]}>
              {getStatusText(item.status)}
            </Text>
          </View>
        </View>

        <Text style={styles.appointmentDate}>
          {formatDateTime(item.appointmentDateTime)}
        </Text>

        {item.description ? (
          <Text style={styles.appointmentDescription}>รายละเอียด: {item.description}</Text>
        ) : null}

        {/* แสดงข้อมูลผู้สร้าง */}
        {item.createdBy ? (
          <Text style={styles.appointmentMeta}>
            สร้างโดย: {item.createdBy} ({item.createdByRole || 'ไม่ระบุ'})
          </Text>
        ) : null}
        
        {/* แสดงข้อมูลผู้ทำเครื่องหมายเสร็จ */}
        {item.status === 'completed' && item.completedBy ? (
          <Text style={styles.appointmentMeta}>
            ทำเครื่องหมายเสร็จโดย: {item.completedBy} ({item.completedByRole || 'ไม่ระบุ'})
          </Text>
        ) : null}

        <View style={styles.appointmentActions}>
          {item.status === 'pending' ? (
            <>
              <TouchableOpacity 
                style={styles.completeButton}
                onPress={() => handleCompleteAppointment(item)}
                disabled={new Date() < new Date(item.appointmentDateTime)}
              >
                <Text style={[styles.completeButtonText, new Date() < new Date(item.appointmentDateTime) && { color: '#aaa' }]}>เสร็จสิ้น</Text>
              </TouchableOpacity>

              {/* แก้ไขได้เฉพาะก่อนถึงเวลานัดหมาย และเฉพาะเจ้าของฟาร์ม */}
              {new Date() < new Date(item.appointmentDateTime) && !(user.isAssistant || user.role === 'ผู้ช่วยฟาร์ม') && (
                <TouchableOpacity 
                  style={styles.editButton}
                  onPress={() => openEditModal(item)}
                >
                  <Text style={styles.editButtonText}> แก้ไข</Text>
                </TouchableOpacity>
              )}
            </>
          ) : null}
          
          {/* ปุ่มลบ - แสดงเฉพาะเจ้าของฟาร์ม */}
          {!(user.isAssistant || user.role === 'ผู้ช่วยฟาร์ม') && (
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={() => handleDeleteAppointment(item)}
            >
              <Text style={styles.deleteButtonText}> ลบ</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }, [handleCompleteAppointment, openEditModal, handleDeleteAppointment, formatDateTime, getStatusColor, getStatusTextColor, getStatusBorderColor, getStatusText, cows, loadingCows, imageErrors]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* ปุ่มด้านขวา - แสดงเฉพาะเจ้าของฟาร์ม */}
      {!(user.isAssistant || user.role === 'ผู้ช่วยฟาร์ม') && (
        <View style={styles.rightButtonsContainer}>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => {
              resetForm();
              setShowModal(true);
            }}
          >
            <Text style={styles.addButtonText}>+ เพิ่มนัดหมาย</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* รายการนัดหมาย */}
      {loadingAppointments ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B4513" />
          <Text style={styles.loadingText}>กำลังโหลดนัดหมาย...</Text>
        </View>
      ) : (
        <FlatList
          data={appointments}
          renderItem={renderAppointmentItem}
          keyExtractor={(item) => item.id}
          style={styles.appointmentsList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>ไม่มีนัดหมาย</Text>
              <Text style={styles.emptyTitle}>ยังไม่มีนัดหมาย</Text>
              <Text style={styles.emptyDescription}>
                กดปุ่ม "+ เพิ่ม" เพื่อสร้างนัดหมายใหม่
              </Text>
            </View>
          )}
          refreshing={loadingAppointments}
          onRefresh={() => {
            setLoadingAppointments(true);
            loadAppointments();
          }}
        />
      )}

      {/* Modal สำหรับเพิ่ม/แก้ไขนัดหมาย */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>
                {editingAppointment ? 'แก้ไขนัดหมาย' : 'เพิ่มนัดหมายใหม่'}
              </Text>

              {/* หัวข้อนัดหมาย */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>หัวข้อนัดหมาย *</Text>
                <TextInput
                  style={styles.input}
                  value={appointmentForm.title}
                  onChangeText={(text) => setAppointmentForm(prev => ({ ...prev, title: text }))}
                  placeholder="เช่น ตรวจสุขภาพประจำเดือน"
                  placeholderTextColor="#999"
                />
              </View>

              {/* รหัสวัว */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>รหัสวัว *</Text>
                <TouchableOpacity 
                  style={styles.cowSelectionButton}
                  onPress={() => {
                    selectCow();
                  }}
                >
                  <Text style={[
                    styles.cowSelectionText,
                    !appointmentForm.cowId && styles.cowSelectionPlaceholder
                  ]}>
                    {appointmentForm.cowId ? `${appointmentForm.cowId}` : 'เลือกรหัสวัว'}
                  </Text>
                  <Text style={styles.cowSelectionArrow}>▼</Text>
                </TouchableOpacity>
              </View>

              {/* ประเภทนัดหมาย */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>ประเภทนัดหมาย</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.typeButtons}>
                    {appointmentTypes.map((type) => (
                      <TouchableOpacity
                        key={type}
                        style={[
                          styles.typeButton,
                          appointmentForm.type === type && styles.typeButtonActive
                        ]}
                        onPress={() => setAppointmentForm(prev => ({ ...prev, type }))}
                      >
                        <Text style={[
                          styles.typeButtonText,
                          appointmentForm.type === type && styles.typeButtonTextActive
                        ]}>
                          {type}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              {/* วันที่นัดหมาย */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>วันที่นัดหมาย</Text>
                <TouchableOpacity 
                  style={styles.dateButton}
                  onPress={selectDate}
                >
                  <Text style={styles.dateButtonText}>
                    วันที่: {appointmentForm.appointmentDate.toLocaleDateString('th-TH', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* เวลานัดหมาย */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>เวลานัดหมาย</Text>
                <TouchableOpacity 
                  style={styles.dateButton}
                  onPress={selectTime}
                >
                  <Text style={styles.dateButtonText}>
                     {appointmentForm.appointmentTime.toLocaleTimeString('th-TH', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* รายละเอียด */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>รายละเอียดเพิ่มเติม</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={appointmentForm.description}
                  onChangeText={(text) => setAppointmentForm(prev => ({ ...prev, description: text }))}
                  placeholder="รายละเอียดเพิ่มเติม (ไม่บังคับ)"
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={3}
                />
              </View>

              {/* ปุ่มดำเนินการ */}
              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => setShowModal(false)}
                >
                  <Text style={styles.cancelButtonText}>ยกเลิก</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.saveButton}
                  onPress={handleSaveAppointment}
                  disabled={loading}
                >
                  <Text style={styles.saveButtonText}>
                    {loading ? 'กำลังบันทึก...' : editingAppointment ? 'บันทึกการแก้ไข' : 'บันทึก'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal เลือกวันที่ */}
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
              {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map((day) => (
                <View key={day} style={styles.weekDayCell}>
                  <Text style={styles.weekDayText}>{day}</Text>
                </View>
              ))}
            </View>

            {/* ปฏิทิน */}
            <View style={styles.calendarGrid}>
              {generateCalendar(currentMonth).map((dayInfo, index) => (
                <TouchableOpacity
                  key={`calendar-${dayInfo.date.getTime()}-${index}`}
                  style={[
                    styles.calendarDay,
                    !dayInfo.isCurrentMonth && styles.calendarDayOtherMonth,
                    dayInfo.isPast && styles.calendarDayPast,
                    isSelectedDate(dayInfo.date) && styles.calendarDaySelected
                  ]}
                  onPress={() => selectCalendarDate(dayInfo.date)}
                  disabled={dayInfo.isPast}
                >
                  <Text style={[
                    styles.calendarDayText,
                    !dayInfo.isCurrentMonth && styles.calendarDayTextOtherMonth,
                    dayInfo.isPast && styles.calendarDayTextPast,
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

      {/* Modal เลือกเวลา */}
      <Modal
        visible={showTimeModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTimeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.timeModal}>
            <Text style={styles.timeModalTitle}>เลือกเวลานัดหมาย</Text>
            
            <View style={styles.timePickerContainer}>
              {/* เลือกชั่วโมง */}
              <View style={styles.timePickerSection}>
                <Text style={styles.timePickerLabel}>ชั่วโมง</Text>
                <ScrollView style={styles.timePickerScroll} showsVerticalScrollIndicator={false}>
                  {Array.from({ length: 24 }, (_, hour) => (
                    <TouchableOpacity
                      key={`hour-${hour}`}
                      style={[
                        styles.timePickerOption,
                        selectedHour === hour && styles.timePickerOptionSelected
                      ]}
                      onPress={() => setSelectedHour(hour)}
                    >
                      <Text style={[
                        styles.timePickerOptionText,
                        selectedHour === hour && styles.timePickerOptionTextSelected
                      ]}>
                        {hour.toString().padStart(2, '0')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <Text style={styles.timePickerSeparator}>:</Text>

              {/* เลือกนาที */}
              <View style={styles.timePickerSection}>
                <Text style={styles.timePickerLabel}>นาที</Text>
                <ScrollView style={styles.timePickerScroll} showsVerticalScrollIndicator={false}>
                  {Array.from({ length: 60 }, (_, minute) => (
                    <TouchableOpacity
                      key={`minute-${minute}`}
                      style={[
                        styles.timePickerOption,
                        selectedMinute === minute && styles.timePickerOptionSelected
                      ]}
                      onPress={() => setSelectedMinute(minute)}
                    >
                      <Text style={[
                        styles.timePickerOptionText,
                        selectedMinute === minute && styles.timePickerOptionTextSelected
                      ]}>
                        {minute.toString().padStart(2, '0')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            {/* แสดงเวลาที่เลือก */}
            <View style={styles.selectedTimeDisplay}>
              <Text style={styles.selectedTimeText}>
                เวลาที่เลือก: {selectedHour.toString().padStart(2, '0')}:{selectedMinute.toString().padStart(2, '0')}
              </Text>
            </View>
            
            {/* ปุ่มดำเนินการ */}
            <View style={styles.timeModalActions}>
              <TouchableOpacity 
                style={styles.timeModalCancelButton}
                onPress={() => setShowTimeModal(false)}
              >
                <Text style={styles.timeModalCancelText}>ยกเลิก</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.timeModalConfirmButton}
                onPress={confirmTimeSelection}
              >
                <Text style={styles.timeModalConfirmText}>ยืนยัน</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal เลือกวัว */}
      <Modal
        visible={showCowSelectionModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCowSelectionModal(false)}
      >
        <View style={styles.modalOverlay}>
        <View style={[styles.cowSelectionModal, { flex: 1, margin: 10, padding: 30, backgroundColor: 'white', borderRadius: 15, width: '90%' }]}>
          <View style={styles.cowSelectionHeader}>
            <Text style={styles.cowSelectionModalTitle}>เลือกรหัสวัว</Text>
            <Text style={styles.cowSelectionStatus}>
              {loadingCows ? 'กำลังโหลด...' : `พบ ${filteredCows.length} ตัว`}
            </Text>
          </View>
          
          {loadingCows ? (
            <View style={styles.cowLoadingContainer}>
              <ActivityIndicator size="large" color="#8B4513" />
              <Text style={styles.cowLoadingText}>กำลังโหลดข้อมูลวัว...</Text>
            </View>
          ) : (
            <FlatList
              data={filteredCows}
              keyExtractor={(item, index) => {
                return item?.id || item?.cowId || `cow-${index}`;
              }}
              style={styles.cowList}
              showsVerticalScrollIndicator={false}
              renderItem={({ item, index }) => {
                  // ใช้เฉพาะ cowId จาก CowManagement
                  const cowId = item.cowId;
                  
                  const isSelected = appointmentForm.cowId === cowId;
                  
                  return (
                    <TouchableOpacity
                      style={[
                        styles.cowItem,
                        isSelected && styles.cowItemSelected
                      ]}
                      onPress={() => {
                        try {
                          selectCowFromList(item);
                        } catch (error) {
                          if (__DEV__) {
                            console.error('Error in cow selection:', error);
                          }
                          Alert.alert('ข้อผิดพลาด', 'ไม่สามารถเลือกวัวนี้ได้');
                        }
                      }}
                    >
                      <View style={styles.cowItemInfo}>
                        {(item.image || item.imageUrl) ? (
                          <Image
                            source={{ uri: item.image || item.imageUrl }}
                            style={{ width: 50, height: 50, borderRadius: 25, marginRight: 10 }}
                            onError={() => {
                              // เกิดข้อผิดพลาดในการโหลดรูป
                            }}
                          />
                        ) : (
                          <View style={{ 
                            width: 50, 
                            height: 50, 
                            borderRadius: 25, 
                            marginRight: 10, 
                            backgroundColor: '#ddd', 
                            justifyContent: 'center', 
                            alignItems: 'center' 
                          }}>
                            <Text style={{ fontSize: 20 }}>�</Text>
                          </View>
                        )}
                        <View style={{ flex: 1 }}>
                          <Text style={styles.cowItemTag}>{cowId}{item.name ? ` - ${item.name}` : ''}</Text>
                          {item.name ? (
                            <Text style={styles.cowItemName}>ชื่อ: {item.name}</Text>
                          ) : null}
                          {item.breed ? (
                            <Text style={styles.cowItemBreed}>สายพันธุ์: {item.breed}</Text>
                          ) : null}
                          {item.status ? (
                            <Text style={styles.cowItemStatus}>สถานะ: {item.status}</Text>
                          ) : null}
                        </View>
                      </View>
                      {isSelected ? (
                        <Text style={styles.cowItemSelectedIcon}>✓</Text>
                      ) : null}
                    </TouchableOpacity>
                  );
                }}
                ListEmptyComponent={() => (
                  <View style={styles.cowEmptyContainer}>
                    <Text style={styles.cowEmptyIcon}></Text>
                    <Text style={styles.cowEmptyTitle}>ยังไม่มีข้อมูลวัว</Text>
                    <Text style={styles.cowEmptyDescription}>
                      กรุณาเพิ่มข้อมูลวัวในหน้า "จัดการวัว" ก่อน
                    </Text>
                    <TouchableOpacity 
                      style={styles.retryButton}
                      onPress={() => loadCows()}
                    >
                      <Text style={styles.retryButtonText}>โหลดข้อมูลใหม่</Text>
                    </TouchableOpacity>
                  </View>
                )}
              />
            )}
            
            <TouchableOpacity 
              style={styles.cowSelectionCloseButton}
              onPress={() => setShowCowSelectionModal(false)}
            >
              <Text style={styles.cowSelectionCloseText}>ปิด</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Loading Overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#8B4513" />
          <Text style={styles.loadingText}>กำลังดำเนินการ...</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default AppointmentScreen;
