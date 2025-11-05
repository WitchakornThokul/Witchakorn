import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5DEB3', // เหมือน HomeScreen
    padding: 20,
  },
  
  // ส่วน Logo และหัวเรื่อง
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
    borderRadius: 60, // ทำให้เป็นวงกลมเหมือน HomeScreen
    resizeMode: 'cover',
  },
  
  title: {
    fontSize: 24, // ปรับขนาดให้เหมาะสม
    fontWeight: 'bold',
    color: '#4A4A4A', // เหมือน HomeScreen
    marginBottom: 15,
    textAlign: 'center',
  },
  
  subtitle: {
    fontSize: 18,
    color: '#4A4A4A', // เหมือน HomeScreen
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
  },
  
  input: {
    backgroundColor: '#FFFFFF', // เหมือน HomeScreen
    width: '100%',
    padding: 15,
    borderRadius: 25, // เหมือน HomeScreen
    marginBottom: 15,
    elevation: 3, // เหมือน HomeScreen
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    fontSize: 16,
    color: '#4A4A4A', // เหมือน HomeScreen
  },
  
  button: {
    backgroundColor: '#FFFFFF', // เหมือน HomeScreen
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25, // เหมือน HomeScreen
    width: '100%',
    marginVertical: 10,
    elevation: 3, // เหมือน HomeScreen
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    alignItems: 'center',
  },
  
  buttonDisabled: {
    backgroundColor: '#F0F0F0',
    opacity: 0.7,
  },
  
  buttonText: {
    color: '#4A4A4A', // เหมือน HomeScreen
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  
  loadingText: {
    marginTop: 10,
    color: '#4A4A4A', // เหมือน HomeScreen
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  
  linkButton: {
    marginTop: 15,
    padding: 10,
  },
  
  linkText: {
    color: '#4A4A4A', // เหมือน HomeScreen
    fontSize: 14,
    textAlign: 'center',
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
  
  backButton: {
    marginTop: 20,
  }
});
