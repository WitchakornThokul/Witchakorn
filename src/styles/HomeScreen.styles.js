import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5DEB3', // สีพื้นหลังแบบ gradient
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
    borderRadius: 60, // ทำให้เป็นวงกลม
    resizeMode: 'cover', // ปรับขนาดภาพให้พอดีกับพื้นที่
  },
  logoText: {
    fontSize: 80,
    marginBottom: 20,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A4A4A',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    width: 250,
    marginVertical: 8,
    elevation: 3,
  },
  assistantButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: '#4A4A4A',
    fontSize: 16,
    textAlign: 'center',
  }
});
