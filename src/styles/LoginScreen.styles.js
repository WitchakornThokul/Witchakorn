import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5DEB3', // ใช้สีเดียวกับหน้าอื่นๆ
    padding: 20,
  },
  
  // ส่วน Logo และหัวเรื่อง
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
    borderRadius: 60, // ทำให้เป็นวงกลมเหมือน HomeScreen
    resizeMode: 'cover',
  },
  
  appTitle: {
    fontSize: 28, // ลดขนาดเล็กน้อยเพื่อให้เข้ากับโลโก้
    fontWeight: 'bold',
    color: '#4A4A4A', // ใช้สีเดียวกับ HomeScreen
    marginBottom: 15,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  appSubtitle: {
    fontSize: 18, // ลดขนาดเล็กน้อย
    color: '#4A4A4A', // ใช้สีเดียวกับ HomeScreen
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 10,
  },
  
  // ส่วนฟอร์ม
  formContainer: {
    flex: 2,
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    paddingHorizontal: 10,
  },
  
  input: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    padding: 18,
    borderRadius: 25, // ใช้ความโค้งเหมือน HomeScreen
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderWidth: 1,
    borderColor: '#DEB887',
    fontSize: 16,
    color: '#4A4A4A', // ใช้สีเดียวกับ HomeScreen
  },
  
  inputFocus: {
    borderColor: '#4A4A4A', // ใช้สีเดียวกับ HomeScreen
    borderWidth: 2,
  },
  
  inputError: {
    borderColor: '#F44336',
    borderWidth: 2,
    backgroundColor: '#FFEBEE',
  },
  
  // ปุ่มเข้าสู่ระบบ
  loginButton: {
    backgroundColor: '#FFFFFF', // ใช้สีขาวเหมือน HomeScreen
    paddingVertical: 15, // ปรับให้เหมือน HomeScreen
    paddingHorizontal: 40,
    borderRadius: 25, // ใช้ความโค้งเหมือน HomeScreen
    width: '100%',
    marginVertical: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 55,
  },
  
  loginButtonText: {
    color: '#4A4A4A', // ใช้สีเดียวกับ HomeScreen
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  
  disabledButton: {
    backgroundColor: '#BDBDBD',
    elevation: 2,
  },

  // ปุ่มลืมรหัสผ่าน
  forgotPasswordButton: {
    marginTop: 10,
    marginBottom: 15,
    padding: 12,
    borderRadius: 8,
  },
  
  forgotPasswordText: {
    color: '#4A4A4A', // ใช้สีเดียวกับ HomeScreen
    fontSize: 15,
    textAlign: 'center',
    fontWeight: '600',
  },
  
  // ปุ่มสมัครสมาชิก
  registerButton: {
    backgroundColor: '#FFFFFF', // ใช้สีขาวเหมือน HomeScreen
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25, // ใช้ความโค้งเหมือน HomeScreen
    width: '100%',
    marginTop: 10,
    elevation: 3, // เพิ่ม elevation เหมือน HomeScreen
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  registerButtonText: {
    color: '#4A4A4A', // ใช้สีเดียวกับ HomeScreen
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  
  // Loading และ Error states
  loadingContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  
  // Error message styles
  errorContainer: {
    backgroundColor: '#FFFFFF', // ใช้พื้นหลังขาวเหมือน HomeScreen
    borderLeftColor: '#F44336',
    borderLeftWidth: 4,
    padding: 15,
    marginBottom: 15,
    borderRadius: 25, // ใช้ความโค้งเหมือน HomeScreen
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  
  errorText: {
    color: '#D32F2F',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  
  // Success message styles
  successContainer: {
    backgroundColor: '#FFFFFF', // ใช้พื้นหลังขาวเหมือน HomeScreen
    borderLeftColor: '#4CAF50',
    borderLeftWidth: 4,
    padding: 15,
    marginBottom: 15,
    borderRadius: 25, // ใช้ความโค้งเหมือน HomeScreen
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  
  successText: {
    color: '#2E7D32',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  
  // Warning message styles
  warningContainer: {
    backgroundColor: '#FFFFFF', // ใช้พื้นหลังขาวเหมือน HomeScreen
    borderLeftColor: '#FF9800',
    borderLeftWidth: 4,
    padding: 15,
    marginBottom: 15,
    borderRadius: 25, // ใช้ความโค้งเหมือน HomeScreen
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  
  warningText: {
    color: '#F57C00',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  
  // Link styles
  linkButton: {
    marginTop: 15,
    padding: 10,
  },
  
  linkText: {
    color: '#4A4A4A', // ใช้สีเดียวกับ HomeScreen
    fontSize: 14,
    textAlign: 'center',
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
});
