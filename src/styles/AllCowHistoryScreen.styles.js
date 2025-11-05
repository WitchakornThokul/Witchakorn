import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  // Container และ Layout
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  topSpacer: {
    height: 20,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
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
  loadingSubText: {
    marginTop: 5,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
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
    flex: 1,
    paddingHorizontal: 5,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 2,
  },

  // Cow Card styles
  historyList: {
    flex: 1,
  },
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
  cowCardModern: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginHorizontal: 10,
    marginVertical: 6,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: '#ececec',
  },
  cowAvatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  cowAvatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  cowAvatarText: {
    color: '#2E7D32',
    fontSize: 22,
    fontWeight: 'bold',
  },
  cowCardId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  cowCardIdModern: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 2,
    flexWrap: 'wrap',
  },
  cowCardBreed: {
    fontSize: 14,
    color: '#666',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  cowCardBreedModern: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
    flexWrap: 'wrap',
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
  cowCardStatusModern: {
    fontSize: 12,
    color: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: 'hidden',
    flexWrap: 'wrap',
  },
  cowCardWeight: {
    fontSize: 14,
    color: '#666',
  },
  cowCardWeightModern: {
    fontSize: 12,
    color: '#1565c0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: 'hidden',
    marginLeft: 8,
    flexWrap: 'wrap',
  },
  cowCardStats: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  cowCardStatsModern: {
    flexDirection: 'row',
    marginTop: 8,
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
  statBadgeModern: {
    backgroundColor: '#f6f6f6',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
    alignItems: 'center',
    minWidth: 48,
  },
  statBadgeNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  statBadgeNumberModern: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#4e73df',
  },
  statBadgeLabel: {
    fontSize: 10,
    color: '#666',
  },
  statBadgeLabelModern: {
    fontSize: 11,
    color: '#888',
  },
  cowCardLastUpdate: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  cowCardLastUpdateModern: {
    fontSize: 12,
    color: '#888',
    marginTop: 6,
    flexWrap: 'wrap',
  },
  arrowIcon: {
    marginLeft: 10,
  },
  arrowIconModern: {
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowText: {
    fontSize: 24,
    color: '#CCC',
  },
  arrowTextModern: {
    fontSize: 28,
    color: '#d1d1d1',
    fontWeight: 'bold',
  },

  // Empty state
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
});
