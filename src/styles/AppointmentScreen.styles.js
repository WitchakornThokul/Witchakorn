import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  
  rightButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    margin: 15,
    marginBottom: 10,
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
  
  headerPlaceholder: {
    width: 60,
  },
  
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },

  headerActions: {
    width: 60, // เพื่อให้ Title อยู่กลาง
  },
  
  addButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 120,
  },
  
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },

  // Action Section (Dashboard style)
  actionSection: {
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

  dashboardAddButton: {
    backgroundColor: '#8B4513',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },

  dashboardAddButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // รายการนัดหมาย
  appointmentsList: {
    flex: 1,
    padding: 15,
  },
  
  appointmentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  
  appointmentInfo: {
    flex: 1,
    marginRight: 10,
  },
  
  cowImageContainer: {
    marginRight: 15,
  },
  
  appointmentCowImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  
  appointmentCowImagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  
  appointmentCowImagePlaceholderText: {
    fontSize: 20,
  },
  
  appointmentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  
  appointmentCowId: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  
  appointmentType: {
    fontSize: 14,
    color: '#8B4513',
    fontWeight: '600',
  },

  appointmentCountdown: {
    fontSize: 13,
    color: '#FF6B35',
    fontWeight: 'bold',
    marginTop: 2,
  },
  
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: 'transparent',
  },
  
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  appointmentDate: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  
  appointmentDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
    lineHeight: 18,
  },
  
  appointmentMeta: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  
  appointmentActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  
  completeButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  
  completeButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  
  editButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  
  editButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  
  deleteButton: {
    backgroundColor: '#F44336',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  
  deleteButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  
  emptyText: {
    fontSize: 60,
    marginBottom: 20,
  },
  
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  
  emptyDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },

  // Loading Container
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  
  inputGroup: {
    marginBottom: 15,
  },
  
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#f9f9f9',
  },
  
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  
  // ปุ่มประเภท
  typeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  
  typeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
  },
  
  typeButtonActive: {
    backgroundColor: '#8B4513',
    borderColor: '#8B4513',
  },
  
  typeButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  
  typeButtonTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  
  // ปุ่มวันที่และเวลา
  dateButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#f9f9f9',
  },
  
  dateButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  
  // Modal Actions
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  
  cancelButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  
  cancelButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: 'bold',
  },
  
  saveButton: {
    flex: 1,
    backgroundColor: '#8B4513',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },

  // Loading
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  loadingText: {
    color: '#fff',
    fontSize: 14,
    marginTop: 10,
    fontWeight: '500',
  },

  // Calendar Modal
  calendarModal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    margin: 20,
    maxHeight: '80%',
  },
  
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  
  calendarNavButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  
  calendarNavText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  
  calendarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  
  weekDaysRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  
  weekDayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  
  weekDayText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginVertical: 2,
  },
  
  calendarDayOtherMonth: {
    opacity: 0.3,
  },
  
  calendarDayPast: {
    backgroundColor: '#f5f5f5',
  },
  
  calendarDaySelected: {
    backgroundColor: '#8B4513',
  },
  
  calendarDayText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  
  calendarDayTextOtherMonth: {
    color: '#999',
  },
  
  calendarDayTextPast: {
    color: '#ccc',
  },
  
  calendarDayTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  
  calendarActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  
  calendarCancelButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  
  calendarCancelText: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  calendarConfirmButton: {
    flex: 1,
    backgroundColor: '#8B4513',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  
  calendarConfirmText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Time Modal
  timeModal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    margin: 20,
    maxHeight: '80%',
  },
  
  timeModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  
  timePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  
  timePickerSection: {
    flex: 1,
    alignItems: 'center',
  },
  
  timePickerLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#8B4513',
  },
  
  timePickerScroll: {
    maxHeight: 200,
    width: '100%',
  },
  
  timePickerOption: {
    padding: 15,
    alignItems: 'center',
    borderRadius: 10,
    marginVertical: 2,
  },
  
  timePickerOptionSelected: {
    backgroundColor: '#8B4513',
  },
  
  timePickerOptionText: {
    fontSize: 18,
    color: '#333',
  },
  
  timePickerOptionTextSelected: {
    color: 'white',
    fontWeight: 'bold',
  },
  
  timePickerSeparator: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B4513',
    marginHorizontal: 10,
  },
  
  selectedTimeDisplay: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  
  selectedTimeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  
  timeModalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  
  timeModalCancelButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    marginRight: 10,
    alignItems: 'center',
  },
  
  timeModalCancelText: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  timeModalConfirmButton: {
    flex: 1,
    backgroundColor: '#8B4513',
    padding: 15,
    borderRadius: 10,
    marginLeft: 10,
    alignItems: 'center',
  },
  
  timeModalConfirmText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Cow Selection Styles
  cowSelectionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    minHeight: 50,
  },
  
  cowSelectionText: {
    fontSize: 16,
    color: '#333',
  },
  
  cowSelectionPlaceholder: {
    color: '#999',
  },
  
  cowSelectionArrow: {
    fontSize: 16,
    color: '#8B4513',
  },
  
  cowSelectionModal: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 20,
    padding: 20,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  
  cowSelectionHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  
  cowSelectionModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 5,
  },
  
  cowSelectionStatus: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  
  cowLoadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  
  cowLoadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  
  cowList: {
    maxHeight: 400,
  },
  
  cowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: 'white',
  },
  
  cowItemSelected: {
    borderColor: '#8B4513',
    backgroundColor: '#f9f5f0',
  },
  
  cowItemInfo: {
    flex: 1,
  },
  
  cowItemTag: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 4,
  },
  
  cowItemName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  
  cowItemBreed: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  
  cowItemStatus: {
    fontSize: 14,
    color: '#666',
  },
  
  cowItemSelectedIcon: {
    fontSize: 20,
    color: '#8B4513',
    fontWeight: 'bold',
  },
  
  cowEmptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  
  cowEmptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  
  cowEmptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 8,
  },
  
  cowEmptyDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 15,
  },
  
  retryButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  
  cowSelectionCloseButton: {
    backgroundColor: '#8B4513',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  
  cowSelectionCloseText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
