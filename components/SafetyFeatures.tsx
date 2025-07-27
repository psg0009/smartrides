import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { 
  Shield, 
  Phone, 
  Share2, 
  AlertTriangle, 
  Plus, 
  X,
  User,
  Mail,
  Heart
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { trpc } from '@/lib/trpc';
import { useAuthStore } from '@/store/auth-store';

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  relationship: string;
  isActive: boolean;
}

interface SafetyFeaturesProps {
  rideId: string;
  rideDetails: any;
}

export default function SafetyFeatures({ rideId, rideDetails }: SafetyFeaturesProps) {
  const { user } = useAuthStore();
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [isSharingLocation, setIsSharingLocation] = useState(false);
  const [isSharingStatus, setIsSharingStatus] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({
    name: '',
    phone: '',
    email: '',
    relationship: '',
  });

  // TODO: Replace with real tRPC hooks when routes are implemented
  const addEmergencyContactMutation = {
    mutateAsync: async (data: any) => {
      console.log('Would add emergency contact:', data);
      return { success: true };
    }
  };

  const shareRideMutation = {
    mutateAsync: async (data: any) => {
      console.log('Would share ride:', data);
      return { success: true };
    }
  };

  const sendSafetyAlertMutation = {
    mutateAsync: async (data: any) => {
      console.log('Would send safety alert:', data);
      return { success: true };
    }
  };

  useEffect(() => {
    // Load emergency contacts
    const mockContacts: EmergencyContact[] = [
      {
        id: '1',
        name: 'Mom',
        phone: '+1 (555) 123-4567',
        email: 'mom@example.com',
        relationship: 'Parent',
        isActive: true,
      },
      {
        id: '2',
        name: 'Dad',
        phone: '+1 (555) 987-6543',
        email: 'dad@example.com',
        relationship: 'Parent',
        isActive: true,
      },
    ];
    setEmergencyContacts(mockContacts);
  }, []);

  const handleAddContact = async () => {
    if (!newContact.name || !newContact.phone) {
      Alert.alert('Error', 'Please fill in name and phone number');
      return;
    }

    try {
      await addEmergencyContactMutation.mutateAsync({
        name: newContact.name,
        phone: newContact.phone,
        email: newContact.email,
        relationship: newContact.relationship,
      });

      const contact: EmergencyContact = {
        id: `contact-${Date.now()}`,
        name: newContact.name,
        phone: newContact.phone,
        email: newContact.email,
        relationship: newContact.relationship,
        isActive: true,
      };

      setEmergencyContacts(prev => [...prev, contact]);
      setNewContact({ name: '', phone: '', email: '', relationship: '' });
      setShowAddContact(false);

      Alert.alert('Success', 'Emergency contact added successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to add emergency contact');
    }
  };

  const handleCallEmergency = (contact: EmergencyContact) => {
    Alert.alert(
      'Call Emergency Contact',
      `Call ${contact.name} at ${contact.phone}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: () => console.log('Would call:', contact.phone) }
      ]
    );
  };

  const handleShareRide = async () => {
    try {
      const shareData = {
        rideId,
        shareType: 'both' as const,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      };

      await shareRideMutation.mutateAsync(shareData);

      const shareMessage = `I'm on a SmartRides trip!\n\nFrom: ${rideDetails.origin}\nTo: ${rideDetails.destination}\nDriver: ${rideDetails.driver.name}\n\nTrack my ride: ${process.env.EXPO_PUBLIC_APP_URL}/track/${rideId}`;

      // TODO: Implement real sharing when expo-sharing is available
      console.log('Would share:', shareMessage);
      Alert.alert('Ride Shared', 'Your ride status has been shared with your emergency contacts.');
    } catch (error) {
      Alert.alert('Error', 'Failed to share ride status');
    }
  };

  const handleSendSafetyAlert = async () => {
    Alert.alert(
      'Send Safety Alert',
      'This will notify your emergency contacts and send your location. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Alert',
          style: 'destructive',
          onPress: async () => {
            try {
              await sendSafetyAlertMutation.mutateAsync({
                rideId,
                alertType: 'safety',
                message: 'Safety alert from SmartRides user',
              });

              Alert.alert('Safety Alert Sent', 'Your emergency contacts have been notified.');
            } catch (error) {
              Alert.alert('Error', 'Failed to send safety alert');
            }
          }
        }
      ]
    );
  };

  const handleCall911 = () => {
    Alert.alert(
      'Call 911',
      'This will call emergency services. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call 911', style: 'destructive', onPress: () => console.log('Would call 911') }
      ]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Shield size={24} color={colors.primary} />
        <Text style={styles.title}>Safety Features</Text>
      </View>

      {/* Emergency Contacts */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Heart size={20} color={colors.gray[600]} />
          <Text style={styles.sectionTitle}>Emergency Contacts</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddContact(true)}
          >
            <Plus size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {emergencyContacts.length > 0 ? (
          <View style={styles.contactsList}>
            {emergencyContacts.map((contact) => (
              <View key={contact.id} style={styles.contactCard}>
                <View style={styles.contactInfo}>
                  <View style={styles.contactHeader}>
                    <User size={16} color={colors.gray[600]} />
                    <Text style={styles.contactName}>{contact.name}</Text>
                    <Text style={styles.contactRelationship}>({contact.relationship})</Text>
                  </View>
                  <View style={styles.contactDetails}>
                    <Phone size={14} color={colors.gray[500]} />
                    <Text style={styles.contactPhone}>{contact.phone}</Text>
                  </View>
                  {contact.email && (
                    <View style={styles.contactDetails}>
                      <Mail size={14} color={colors.gray[500]} />
                      <Text style={styles.contactEmail}>{contact.email}</Text>
                    </View>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.callButton}
                  onPress={() => handleCallEmergency(contact)}
                >
                  <Phone size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyContacts}>
            <Heart size={48} color={colors.gray[400]} />
            <Text style={styles.emptyText}>No emergency contacts</Text>
            <Text style={styles.emptySubtext}>
              Add emergency contacts to stay safe during your rides
            </Text>
          </View>
        )}
      </View>

      {/* Ride Sharing */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Share Ride Status</Text>
        
        <View style={styles.shareOptions}>
          <View style={styles.shareOption}>
            <Switch
              value={isSharingLocation}
              onValueChange={setIsSharingLocation}
              trackColor={{ false: colors.gray[300], true: colors.primary }}
              thumbColor="#FFFFFF"
            />
            <Text style={styles.shareOptionText}>Share location</Text>
          </View>
          
          <View style={styles.shareOption}>
            <Switch
              value={isSharingStatus}
              onValueChange={setIsSharingStatus}
              trackColor={{ false: colors.gray[300], true: colors.primary }}
              thumbColor="#FFFFFF"
            />
            <Text style={styles.shareOptionText}>Share ride status</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.shareButton}
          onPress={handleShareRide}
        >
          <Share2 size={16} color="#FFFFFF" />
          <Text style={styles.shareButtonText}>Share Ride</Text>
        </TouchableOpacity>
      </View>

      {/* Emergency Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Emergency Actions</Text>
        
        <View style={styles.emergencyActions}>
          <TouchableOpacity
            style={[styles.emergencyButton, styles.safetyAlertButton]}
            onPress={handleSendSafetyAlert}
          >
            <AlertTriangle size={20} color="#FFFFFF" />
            <Text style={styles.emergencyButtonText}>Safety Alert</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.emergencyButton, styles.call911Button]}
            onPress={handleCall911}
          >
            <Phone size={20} color="#FFFFFF" />
            <Text style={styles.emergencyButtonText}>Call 911</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Add Contact Modal */}
      <Modal
        visible={showAddContact}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Emergency Contact</Text>
            <TouchableOpacity
              onPress={() => setShowAddContact(false)}
              style={styles.closeButton}
            >
              <X size={24} color={colors.gray[600]} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Name *</Text>
              <TextInput
                style={styles.textInput}
                value={newContact.name}
                onChangeText={(text) => setNewContact(prev => ({ ...prev, name: text }))}
                placeholder="Enter full name"
                placeholderTextColor={colors.gray[400]}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number *</Text>
              <TextInput
                style={styles.textInput}
                value={newContact.phone}
                onChangeText={(text) => setNewContact(prev => ({ ...prev, phone: text }))}
                placeholder="Enter phone number"
                placeholderTextColor={colors.gray[400]}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email (Optional)</Text>
              <TextInput
                style={styles.textInput}
                value={newContact.email}
                onChangeText={(text) => setNewContact(prev => ({ ...prev, email: text }))}
                placeholder="Enter email address"
                placeholderTextColor={colors.gray[400]}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Relationship</Text>
              <TextInput
                style={styles.textInput}
                value={newContact.relationship}
                onChangeText={(text) => setNewContact(prev => ({ ...prev, relationship: text }))}
                placeholder="e.g., Parent, Spouse, Friend"
                placeholderTextColor={colors.gray[400]}
              />
            </View>

            <TouchableOpacity
              style={styles.addContactButton}
              onPress={handleAddContact}
            >
              <Text style={styles.addContactButtonText}>Add Contact</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
    flex: 1,
  },
  addButton: {
    padding: 4,
  },
  contactsList: {
    gap: 12,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  contactInfo: {
    flex: 1,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  contactRelationship: {
    fontSize: 14,
    color: colors.gray[500],
    marginLeft: 4,
  },
  contactDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  contactPhone: {
    fontSize: 14,
    color: colors.gray[600],
    marginLeft: 6,
  },
  contactEmail: {
    fontSize: 14,
    color: colors.gray[600],
    marginLeft: 6,
  },
  callButton: {
    backgroundColor: colors.success,
    padding: 8,
    borderRadius: 6,
  },
  emptyContacts: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: colors.gray[50],
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.gray[600],
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.gray[500],
    textAlign: 'center',
  },
  shareOptions: {
    gap: 16,
    marginBottom: 16,
  },
  shareOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  shareOptionText: {
    fontSize: 16,
    color: colors.text,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  shareButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emergencyActions: {
    flexDirection: 'row',
    gap: 12,
  },
  emergencyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  safetyAlertButton: {
    backgroundColor: '#F97316', // Orange
  },
  call911Button: {
    backgroundColor: colors.error,
  },
  emergencyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    backgroundColor: '#FFFFFF',
  },
  addContactButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  addContactButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
}); 