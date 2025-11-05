import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';

// ข้อมูลเริ่มต้นต่างๆ
export const DEFAULT_DATA = {
  breeds: [
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
  ],
  healthCategories: [
    'ตรวจสุขภาพทั่วไป',
    'ฉีดวัคซีน',
    'รักษาโรค',
    'ผสมพันธุ์',
    'คลอดลูก',
    'ตรวจท้อง',
    'ตัดขน',
    'ตัดเขา',
    'อื่นๆ'
  ]
};

// สร้างข้อมูลพันธุ์วัวเริ่มต้น
export const createDefaultBreeds = async () => {
  try {
    console.log('🐄 ตรวจสอบข้อมูลพันธุ์วัวเริ่มต้น...');
    
    // ตรวจสอบว่ามีข้อมูลเริ่มต้นแล้วหรือไม่
    const breedsQuery = query(
      collection(db, 'breeds'),
      where('isDefault', '==', true)
    );
    const existingBreeds = await getDocs(breedsQuery);
    
    if (existingBreeds.empty) {
      console.log('🔧 สร้างข้อมูลพันธุ์วัวเริ่มต้น...');
      
      const breedsCollection = collection(db, 'breeds');
      const promises = DEFAULT_DATA.breeds.map(breedName => 
        addDoc(breedsCollection, {
          name: breedName,
          description: `พันธุ์${breedName}`,
          isDefault: true,
          protected: true, // ป้องกันการแก้ไข
          createdAt: new Date().toISOString(),
          createdBy: 'system'
        })
      );
      
      await Promise.all(promises);
      console.log('✅ สร้างข้อมูลพันธุ์วัวเริ่มต้นสำเร็จ:', DEFAULT_DATA.breeds.length, 'พันธุ์');
    } else {
      console.log('ℹ️ ข้อมูลพันธุ์วัวเริ่มต้นมีอยู่แล้ว');
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ ข้อผิดพลาดในการสร้างข้อมูลเริ่มต้น:', error);
    return false;
  }
};

// สร้างข้อมูลหมวดหมู่สุขภาพเริ่มต้น
export const createDefaultHealthCategories = async () => {
  try {
    console.log('🏥 ตรวจสอบข้อมูลหมวดหมู่สุขภาพเริ่มต้น...');
    
    const categoriesQuery = query(
      collection(db, 'health_categories'),
      where('isDefault', '==', true)
    );
    const existingCategories = await getDocs(categoriesQuery);
    
    if (existingCategories.empty) {
      console.log('🔧 สร้างข้อมูลหมวดหมู่สุขภาพเริ่มต้น...');
      
      const categoriesCollection = collection(db, 'health_categories');
      const promises = DEFAULT_DATA.healthCategories.map(categoryName => 
        addDoc(categoriesCollection, {
          name: categoryName,
          description: `หมวดหมู่${categoryName}`,
          isDefault: true,
          protected: true,
          createdAt: new Date().toISOString(),
          createdBy: 'system'
        })
      );
      
      await Promise.all(promises);
      console.log('✅ สร้างข้อมูลหมวดหมู่สุขภาพเริ่มต้นสำเร็จ:', DEFAULT_DATA.healthCategories.length, 'หมวดหมู่');
    } else {
      console.log('ℹ️ ข้อมูลหมวดหมู่สุขภาพเริ่มต้นมีอยู่แล้ว');
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ ข้อผิดพลาดในการสร้างข้อมูลหมวดหมู่สุขภาพเริ่มต้น:', error);
    return false;
  }
};

// สร้างข้อมูลเริ่มต้นทั้งหมด
export const initializeDefaultData = async () => {
  try {
    console.log('🚀 เริ่มต้นการสร้างข้อมูลเริ่มต้นของระบบ...');
    
    // สร้างข้อมูลเริ่มต้นแบบ parallel
    const results = await Promise.allSettled([
      createDefaultBreeds(),
      createDefaultHealthCategories()
    ]);
    
    // ตรวจสอบผลลัพธ์
    const successful = results.filter(result => 
      result.status === 'fulfilled' && result.value === true
    ).length;
    
    console.log(`✅ สร้างข้อมูลเริ่มต้นสำเร็จ ${successful}/${results.length} หมวดหมู่`);
    
    return successful === results.length;
    
  } catch (error) {
    console.error('❌ ข้อผิดพลาดในการสร้างข้อมูลเริ่มต้น:', error);
    return false;
  }
};

// ตรวจสอบว่าข้อมูลนั้นเป็นข้อมูลเริ่มต้นหรือไม่
export const isProtectedData = (data) => {
  return data?.isDefault === true || data?.protected === true;
};

// ได้รับข้อความแจ้งเตือนเมื่อพยายามแก้ไขข้อมูลเริ่มต้น
export const getProtectionMessage = (itemType = 'ข้อมูล') => {
  return `ไม่สามารถแก้ไข${itemType}เริ่มต้นของระบบได้\n\nข้อมูลเหล่านี้ถูกป้องกันเพื่อรักษาความสมบูรณ์ของระบบ`;
};