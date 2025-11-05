import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#8B4513',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 10,
  },
  
  backButton: {
    padding: 8,
  },
  
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  
  headerSpacer: {
    width: 40, // เพื่อให้ title อยู่กลาง
  },
  
  content: {
    flex: 1,
    backgroundColor: '#F5DEB3',
    padding: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  
  errorText: {
    color: '#D32F2F',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  
  retryButton: {
    backgroundColor: '#8B4513',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // Metrics
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  
  metricBox: {
      flex: 1,
      backgroundColor: '#FFFFFF',
      paddingVertical: 2,
      paddingHorizontal: 3,
      borderRadius: 12,
      marginHorizontal: 8,
      alignItems: 'center',
      elevation: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 1,
    },
  
  metricIcon: {
    fontSize: 18,
    marginBottom: 4,
  },
  
  metricLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 2,
    textAlign: 'center',
  },
  
  metricValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#8B4513',
    marginTop: 2,
  },
  
  // Section
  sectionHeader: {
    marginBottom: 16,
  },
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  
  // Farm List
  farmList: {
    flex: 1,
  },
  
  farmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  
  farmIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5DEB3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  
  farmIconText: {
    fontSize: 20,
  },
  
  farmInfo: {
    flex: 1,
    paddingRight: 8,
  },
  
  farmName: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  
  farmEmail: {
    fontSize: 14,
    color: '#666',
  },
  
  farmCountContainer: {
    alignItems: 'center',
    minWidth: 60,
  },
  
  farmCount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  
  farmCountLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  
  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  
  emptyText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
});
