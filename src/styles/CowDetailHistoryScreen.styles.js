import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  // Container และ Layout
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#8B4513',
    paddingHorizontal: 15,
    paddingVertical: 12,
    paddingTop: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 60,
  },

  // Loading
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#8B4513',
    textAlign: 'center',
  },

  // ข้อมูลวัว
  cowInfoSection: {
    margin: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#8B4513',
    paddingBottom: 5,
  },
  cowInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cowImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
    backgroundColor: '#F0F0F0',
  },
  cowDetails: {
    flex: 1,
  },
  cowId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 5,
  },
  cowName: {
    fontSize: 16,
    color: '#666',
    marginBottom: 3,
  },
  cowBreed: {
    fontSize: 16,
    color: '#666',
    marginBottom: 3,
  },
  cowStatus: {
    fontSize: 16,
    color: '#666',
    marginBottom: 3,
  },
  cowWeight: {
    fontSize: 16,
    color: '#666',
    marginBottom: 3,
  },
  cowAge: {
    fontSize: 16,
    color: '#666',
  },

  // สถิติ
  statsSection: {
    margin: 15,
    marginTop: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    padding: 10,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },

  // ประวัติการเปลี่ยนแปลง
  historySection: {
    margin: 15,
    marginTop: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginBottom: 30,
  },
  historyList: {
    flex: 1,
  },
  historyItem: {
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#8B4513',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  changeTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeTypeIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  changeType: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
  changesContainer: {
    marginTop: 8,
    paddingHorizontal: 12,
  },
  changeDetail: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
    lineHeight: 18,
  },

  // รายละเอียดเพิ่มเติม
  extraDetails: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#F0F8FF',
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#2196F3',
  },
  extraDetailTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 5,
  },
  extraDetailText: {
    fontSize: 13,
    color: '#333',
    marginBottom: 2,
    paddingLeft: 10,
  },

  // Empty state
  emptyContainer: {
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
