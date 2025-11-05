import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5DEB3',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#8B4513',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 40,
  },
  backButton: {
    marginRight: 15,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
    marginRight: 80,
  },
  content: {
    flex: 1,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },

  // ข้อมูลวัวปัจจุบัน
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
    historyItem: {
      backgroundColor: '#FFF',
      borderRadius: 10,
      padding: 12,
      marginBottom: 10,
      elevation: 2,
    },
    action: {
      fontSize: 14,
      color: '#333',
      marginBottom: 2,
    },
    timestamp: {
      fontSize: 12,
      color: '#888',
    },
    emptyText: {
      color: '#666',
      textAlign: 'center',
      marginTop: 24,
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
  description: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  valueChange: {
    marginBottom: 5,
  },
  oldValue: {
    fontSize: 14,
    color: '#F44336',
    fontStyle: 'italic',
  },
  newValue: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  changedBy: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    textAlign: 'right',
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
  emptyContainer: {
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 48,
    color: '#CCC',
    textAlign: 'center',
    marginBottom: 10,
  },
  emptyMessage: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  emptySubMessage: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },

  // Cow Card styles for AllCowHistoryScreen
  cowCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    margin: 8,
    padding: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cowCardImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
    backgroundColor: '#F0F0F0',
  },
  cowCardContent: {
    flex: 1,
  },
  cowCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  cowCardId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  cowCardBreed: {
    fontSize: 14,
    color: '#666',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  cowCardInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cowCardStatus: {
    fontSize: 14,
    color: '#666',
  },
  cowCardWeight: {
    fontSize: 14,
    color: '#666',
  },
  cowCardStats: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  statBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    alignItems: 'center',
    minWidth: 50,
  },
  statBadgeNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  statBadgeLabel: {
    fontSize: 10,
    color: '#666',
  },
  cowCardLastUpdate: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  arrowIcon: {
    marginLeft: 10,
  },
  arrowText: {
    fontSize: 24,
    color: '#CCC',
  },

  // AllCowHistory specific styles
  statsSection: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    margin: 15,
    borderRadius: 10,
    padding: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  cowIdentifier: {
    marginBottom: 5,
  },
  cowIdText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  cowBreedText: {
    fontSize: 12,
    color: '#666',
  },
  detailButton: {
    backgroundColor: '#8B4513',
    padding: 8,
    borderRadius: 5,
    marginTop: 10,
    alignSelf: 'flex-end',
  },
  detailButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyMessage: {
    fontSize: 18,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
  },
  emptySubMessage: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
    textAlign: 'center',
  },

  // ปุ่มทดสอบ
  testSection: {
    margin: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  testButton: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  testHint: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  
  // ปุ่มควบคุม
  controlButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    margin: 10,
    padding: 15,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  controlButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 80,
  },
  controlButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  debugButton: {
    backgroundColor: '#FF5722',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 80,
  },
  debugButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
