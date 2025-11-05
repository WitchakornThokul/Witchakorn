import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LogBox } from 'react-native';
import './src/config/firebase';

// ซ่อน console.log และ warnings ทั้งหมดในแอพมือถือ
if (!__DEV__) {
  console.log = () => {};
  console.warn = () => {};
  console.info = () => {};
  console.debug = () => {};
  console.error = () => {}; // ซ่อน error messages ด้วย
}

// ซ่อน LogBox warnings และ errors ทั้งหมด
LogBox.ignoreAllLogs(true);

import HomeScreen from './src/screens/HomeScreen';
import RegistrationScreen from './src/screens/RegistrationScreen';
import LoginScreen from './src/screens/LoginScreen';
import MainScreen from './src/screens/MainScreen';
import CowManagementScreen from './src/screens/CowManagementScreen';
import AddCowScreen from './src/screens/AddCowScreen';
import EditCowScreen from './src/screens/EditCowScreen';
import BreedManagementScreen from './src/screens/BreedManagementScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import FarmOverviewScreen from './src/screens/FarmOverviewScreen';
import AllCowHistoryScreen from './src/screens/AllCowHistoryScreen';
import CowDetailHistoryScreen from './src/screens/CowDetailHistoryScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';
import AppointmentScreen from './src/screens/AppointmentScreen';
import ChangePasswordScreen from './src/screens/ChangePasswordScreen';
import AssistantManagementScreen from './src/screens/AssistantManagementScreen';
import AddAssistantScreen from './src/screens/AddAssistantScreen';
import ChangeAssistantPasswordScreen from './src/screens/ChangeAssistantPasswordScreen';
import { UserProvider } from './src/contexts/UserContext';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <UserProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        {/* Registration Screen */}
        <Stack.Screen 
          name="Registration" 
          component={RegistrationScreen}
          options={{ headerShown: false }}
        />
        {/* Login Screen */}
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        {/* Main Screen */}
        <Stack.Screen 
          name="Main" 
          component={MainScreen}
            options={{ headerShown: false }}
          />
          {/* Farm Overview Screen */}
          <Stack.Screen 
            name="FarmOverview" 
            component={FarmOverviewScreen}
            options={{ 
              title: 'ภาพรวมฟาร์มทั้งหมด',
              headerStyle: { backgroundColor: '#8B4513' },
              headerTintColor: '#fff',
              headerShown: false,
            }}
          />
          {/* Cow Management Screen */}
          <Stack.Screen 
            name="CowManagement" 
            component={CowManagementScreen}
            options={{ 
              title: 'จัดการข้อมูลวัว',
              headerStyle: {
                backgroundColor: '#8B4513',
              },
              headerTintColor: '#fff',
              headerShown: false,
            }}
          />
          {/* Add Cow Screen */}
          <Stack.Screen 
            name="AddCow" 
            component={AddCowScreen}
            options={{ 
              title: 'เพิ่มข้อมูลวัว',
              headerStyle: {
                backgroundColor: '#8B4513',
              },
              headerTintColor: '#fff',
              headerShown: false,
            }}
          />
          {/* Edit Cow Screen */}
          <Stack.Screen 
            name="EditCow" 
            component={EditCowScreen}
            options={{ 
              title: 'แก้ไขข้อมูลวัว',
              headerStyle: {
                backgroundColor: '#8B4513',
              },
              headerTintColor: '#fff',
              headerShown: false,
            }}
          />
          {/* Breed Management Screen */}
          <Stack.Screen 
            name="BreedManagement" 
            component={BreedManagementScreen}
            options={{ 
              title: 'จัดการพันธุ์วัว',
              headerStyle: {
                backgroundColor: '#FF6B35',
              },
              headerTintColor: '#fff',
              headerShown: false,
            }}
          />
          {/* Dashboard Screen */}
          <Stack.Screen 
            name="Dashboard" 
            component={DashboardScreen}
            options={{ 
              title: 'Dashboard ฟาร์มวัว',
              headerStyle: {
                backgroundColor: '#8B4513',
              },
              headerTintColor: '#fff',
              headerShown: false,
            }}
          />
          {/* All Cow History Screen */}
          <Stack.Screen 
            name="AllCowHistory" 
            component={AllCowHistoryScreen}
            options={{ 
              title: 'รายการวัวทั้งหมด',
              headerStyle: {
                backgroundColor: '#8B4513',
              },
              headerTintColor: '#fff',
              headerShown: false,
            }}
          />
          {/* Cow Detail History Screen */}
          <Stack.Screen 
            name="CowDetailHistory" 
            component={CowDetailHistoryScreen}
            options={{ 
              title: 'ประวัติวัว',
              headerStyle: {
                backgroundColor: '#8B4513',
              },
              headerTintColor: '#fff',
              headerShown: false,
            }}
          />
          {/* Edit Profile Screen */}
          <Stack.Screen 
            name="EditProfile" 
            component={EditProfileScreen}
            options={{ 
              title: 'แก้ไขข้อมูลส่วนตัว',
              headerStyle: {
                backgroundColor: '#8B4513',
              },
              headerTintColor: '#fff',
              headerShown: false,
            }}
          />
          {/* Appointment Screen */}
          <Stack.Screen 
            name="Appointment" 
            component={AppointmentScreen}
            options={{ 
              title: 'นัดหมายและติดตาม',
              headerStyle: {
                backgroundColor: '#8B4513',
              },
              headerTintColor: '#fff',
              headerShown: false,
            }}
          />
          {/* Change Password Screen */}
          <Stack.Screen 
            name="ChangePassword" 
            component={ChangePasswordScreen}
            options={{ 
              title: 'เปลี่ยนรหัสผ่าน',
              headerStyle: {
                backgroundColor: '#8B4513',
              },
              headerTintColor: '#fff',
              headerShown: false,
            }}
          />
          {/* Assistant Management Screen */}
          <Stack.Screen 
            name="AssistantManagement" 
            component={AssistantManagementScreen}
            options={{ 
              title: 'จัดการผู้ช่วย',
              headerStyle: {
                backgroundColor: '#8B4513',
              },
              headerTintColor: '#fff',
              headerShown: false,
            }}
          />
          {/* Add Assistant Screen */}
          <Stack.Screen 
            name="AddAssistant" 
            component={AddAssistantScreen}
            options={{ 
              title: 'เพิ่มผู้ช่วย',
              headerStyle: {
                backgroundColor: '#8B4513',
              },
              headerTintColor: '#fff',
              headerShown: false,
            }}
          />
          {/* Change Assistant Password Screen */}
          <Stack.Screen 
            name="ChangeAssistantPassword" 
            component={ChangeAssistantPasswordScreen}
            options={{ 
              title: 'เปลี่ยนรหัสผ่านผู้ช่วย',
              headerStyle: {
                backgroundColor: '#8B4513',
              },
              headerTintColor: '#fff',
              headerShown: false,
            }}
          />
          {/* Dashboard Screen */}
          {/* <Stack.Screen name="Dashboard" component={DashboardScreen} /> */}
        </Stack.Navigator>
      </NavigationContainer>
    </UserProvider>
  );
};

export default App;
