import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Switch,
  Alert,
  Modal,
} from 'react-native';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Plus, 
  X, 
  Trash2,
  Repeat,
  CheckCircle,
  XCircle
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { trpc } from '@/lib/trpc';
import { useAuthStore } from '@/store/auth-store';

interface ScheduledRide {
  id: string;
  origin: string;
  destination: string;
  departureTime: Date;
  passengers: number;
  recurring: boolean;
  recurringDays?: string[];
  status: 'active' | 'cancelled' | 'completed';
  createdAt: Date;
}

export default function ScheduledRides() {
  const { user } = useAuthStore();
  const [scheduledRides, setScheduledRides] = useState<ScheduledRide[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    departureTime: new Date(),
    passengers: 1,
    recurring: false,
    recurringDays: [] as string[],
  });

  // TODO: Replace with real tRPC hooks when routes are implemented
  const userScheduledRides: ScheduledRide[] = [
    {
      id: '1',
      origin: 'Home',
      destination: 'University',
      departureTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      passengers: 2,
      recurring: true,
      recurringDays: ['monday', 'wednesday', 'friday'],
      status: 'active',
      createdAt: new Date(),
    },
    {
      id: '2',
      origin: 'University',
      destination: 'Home',
      departureTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
      passengers: 1,
      recurring: false,
      status: 'active',
      createdAt: new Date(),
    },
  ];

  const createScheduledRideMutation = {
    mutateAsync: async (data: any) => {
      console.log('Would create scheduled ride:', data);
      return { success: true };
    }
  };

  const cancelScheduledRideMutation = {
    mutateAsync: async (data: any) => {
      console.log('Would cancel scheduled ride:', data);
      return { success: true };
    }
  };

  useEffect(() => {
    setScheduledRides(userScheduledRides);
  }, [userScheduledRides]);

  const handleCreateScheduledRide = async () => {
    if (!formData.origin || !formData.destination) {
      Alert.alert('Error', 'Please fill in origin and destination');
      return;
    }

    try {
      await createScheduledRideMutation.mutateAsync({
        origin: formData.origin,
        destination: formData.destination,
        departureTime: formData.departureTime.toISOString(),
        passengers: formData.passengers,
        recurring: formData.recurring,
        recurringDays: formData.recurringDays,
      });

      const newRide: ScheduledRide = {
        id: `ride-${Date.now()}`,
        origin: formData.origin,
        destination: formData.destination,
        departureTime: formData.departureTime,
        passengers: formData.passengers,
        recurring: formData.recurring,
        recurringDays: formData.recurringDays,
        status: 'active',
        createdAt: new Date(),
      };

      setScheduledRides(prev => [...prev, newRide]);
      setFormData({
        origin: '',
        destination: '',
        departureTime: new Date(),
        passengers: 1,
        recurring: false,
        recurringDays: [],
      });
      setShowCreateForm(false);

      Alert.alert('Success', 'Scheduled ride created successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to create scheduled ride');
    }
  };

  const handleCancelScheduledRide = async (rideId: string) => {
    Alert.alert(
      'Cancel Scheduled Ride',
      'Are you sure you want to cancel this scheduled ride?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelScheduledRideMutation.mutateAsync({ rideId });
              
              setScheduledRides(prev => 
                prev.map(ride => 
                  ride.id === rideId 
                    ? { ...ride, status: 'cancelled' as const }
                    : ride
                )
              );

              Alert.alert('Success', 'Scheduled ride cancelled successfully!');
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel scheduled ride');
            }
          }
        }
      ]
    );
  };

  const handleRecurringDayToggle = (day: string) => {
    setFormData(prev => ({
      ...prev,
      recurringDays: prev.recurringDays.includes(day)
        ? prev.recurringDays.filter(d => d !== day)
        : [...prev.recurringDays, day]
    }));
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return colors.success;
      case 'cancelled':
        return colors.error;
      case 'completed':
        return colors.gray[500];
      default:
        return colors.gray[500];
    }
  };

  const renderScheduledRide = (ride: ScheduledRide) => (
    <View key={ride.id} style={styles.scheduledRideCard}>
      <View style={styles.rideHeader}>
        <View style={styles.rideInfo}>
          <View style={styles.locationInfo}>
            <MapPin size={16} color={colors.primary} />
            <Text style={styles.locationText}>
              {ride.origin} → {ride.destination}
            </Text>
          </View>
          
          <View style={styles.timeInfo}>
            <Clock size={16} color={colors.gray[600]} />
            <Text style={styles.timeText}>
              {formatDate(ride.departureTime)} at {formatTime(ride.departureTime)}
            </Text>
          </View>

          <View style={styles.passengerInfo}>
            <Users size={16} color={colors.gray[600]} />
            <Text style={styles.passengerText}>
              {ride.passengers} passenger{ride.passengers !== 1 ? 's' : ''}
            </Text>
          </View>

          {ride.recurring && ride.recurringDays && (
            <View style={styles.recurringInfo}>
              <Repeat size={16} color={colors.gray[600]} />
              <Text style={styles.recurringText}>
                {ride.recurringDays.map(day => day.charAt(0).toUpperCase() + day.slice(1, 3)).join(', ')}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.rideStatus}>
          <View style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(ride.status) + '20' }
          ]}>
            <Text style={[
              styles.statusText,
              { color: getStatusColor(ride.status) }
            ]}>
              {ride.status.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      {ride.status === 'active' && (
        <View style={styles.rideActions}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => handleCancelScheduledRide(ride.id)}
          >
            <Trash2 size={16} color={colors.error} />
            <Text style={[styles.actionButtonText, styles.cancelButtonText]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderCreateForm = () => (
    <Modal
      visible={showCreateForm}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.createForm}>
        <View style={styles.formHeader}>
          <Text style={styles.formTitle}>Create Scheduled Ride</Text>
          <TouchableOpacity
            onPress={() => setShowCreateForm(false)}
            style={styles.closeButton}
          >
            <X size={24} color={colors.gray[600]} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.formContent} showsVerticalScrollIndicator={false}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Origin *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.origin}
              onChangeText={(text) => setFormData(prev => ({ ...prev, origin: text }))}
              placeholder="Enter pickup location"
              placeholderTextColor={colors.gray[400]}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Destination *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.destination}
              onChangeText={(text) => setFormData(prev => ({ ...prev, destination: text }))}
              placeholder="Enter destination"
              placeholderTextColor={colors.gray[400]}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Departure Time</Text>
            <View style={styles.dateTimeInput}>
              <Calendar size={20} color={colors.gray[600]} />
              <Text style={styles.dateTimeText}>
                {formatDate(formData.departureTime)} at {formatTime(formData.departureTime)}
              </Text>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Number of Passengers</Text>
            <View style={styles.passengerInput}>
              <Users size={20} color={colors.gray[600]} />
              <TextInput
                style={styles.numberInput}
                value={formData.passengers.toString()}
                onChangeText={(text) => {
                  const num = parseInt(text) || 1;
                  setFormData(prev => ({ ...prev, passengers: Math.max(1, Math.min(4, num)) }));
                }}
                keyboardType="numeric"
                maxLength={1}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.recurringToggle}>
              <View style={styles.toggleLabel}>
                <Repeat size={20} color={colors.gray[600]} />
                <Text style={styles.inputLabel}>Recurring Ride</Text>
              </View>
              <Switch
                value={formData.recurring}
                onValueChange={(value) => setFormData(prev => ({ ...prev, recurring: value }))}
                trackColor={{ false: colors.gray[300], true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>

          {formData.recurring && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Recurring Days</Text>
              <View style={styles.daysGrid}>
                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                  <TouchableOpacity
                    key={day}
                    style={[
                      styles.dayButton,
                      formData.recurringDays.includes(day) && styles.selectedDayButton,
                    ]}
                    onPress={() => handleRecurringDayToggle(day)}
                  >
                    <Text style={[
                      styles.dayButtonText,
                      formData.recurringDays.includes(day) && styles.selectedDayButtonText,
                    ]}>
                      {day.charAt(0).toUpperCase() + day.slice(1, 3)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleCreateScheduledRide}
          >
            <Text style={styles.submitButtonText}>Create Scheduled Ride</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Calendar size={24} color={colors.primary} />
        <Text style={styles.title}>Scheduled Rides</Text>
      </View>

      {scheduledRides.length > 0 ? (
        <ScrollView style={styles.ridesList} showsVerticalScrollIndicator={false}>
          {scheduledRides.map(renderScheduledRide)}
        </ScrollView>
      ) : (
        <View style={styles.emptyState}>
          <Calendar size={64} color={colors.gray[400]} />
          <Text style={styles.emptyText}>No scheduled rides</Text>
          <Text style={styles.emptySubtext}>
            Create a scheduled ride to plan your trips in advance
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowCreateForm(true)}
      >
        <Plus size={20} color="#FFFFFF" />
      </TouchableOpacity>

      {renderCreateForm()}
    </View>
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
  ridesList: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray[600],
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.gray[500],
    textAlign: 'center',
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  createForm: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  closeButton: {
    padding: 4,
  },
  formContent: {
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
  dateTimeInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  dateTimeText: {
    marginLeft: 8,
    fontSize: 16,
    color: colors.text,
  },
  passengerInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  numberInput: {
    marginLeft: 8,
    fontSize: 16,
    color: colors.text,
    minWidth: 40,
  },
  recurringToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: colors.gray[100],
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  selectedDayButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dayButtonText: {
    fontSize: 14,
    color: colors.gray[700],
  },
  selectedDayButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  scheduledRideCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  rideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  rideInfo: {
    flex: 1,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 14,
    color: colors.gray[600],
    marginLeft: 8,
  },
  passengerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  passengerText: {
    fontSize: 14,
    color: colors.gray[600],
    marginLeft: 8,
  },
  recurringInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recurringText: {
    fontSize: 14,
    color: colors.gray[600],
    marginLeft: 8,
  },
  rideStatus: {
    marginLeft: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  rideActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: colors.error + '10',
  },
  cancelButtonText: {
    color: colors.error,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
}); 