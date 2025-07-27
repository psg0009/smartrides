import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Navigation, MapPin, Clock, Car, CheckCircle, XCircle } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { trpc } from '@/lib/trpc';
import { useAuthStore } from '@/store/auth-store';

const { width } = Dimensions.get('window');

interface RideTrackerProps {
  rideId: string;
  isDriver?: boolean;
  onStatusUpdate?: (status: string) => void;
}

export default function RideTracker({ rideId, isDriver = false, onStatusUpdate }: RideTrackerProps) {
  const { user } = useAuthStore();
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [rideStatus, setRideStatus] = useState('pending');
  const [eta, setEta] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const locationSubscription = useRef<any>(null);

  // TODO: Replace with real tRPC hooks when routes are implemented
  const updateLocationMutation = {
    mutateAsync: async (data: any) => {
      console.log('Would update location:', data);
      return { success: true };
    }
  };

  const updateStatusMutation = {
    mutateAsync: async (data: any) => {
      console.log('Would update status:', data);
      return { success: true };
    }
  };

  const requestLocationPermission = async () => {
    try {
      // TODO: Implement real location permission when expo-location is available
      Alert.alert('Location Permission', 'Location permission will be requested when the feature is available.');
      return true;
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  };

  const startLocationTracking = async () => {
    try {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        Alert.alert('Permission Denied', 'Location permission is required for ride tracking.');
        return;
      }

      setIsLoading(true);

      // TODO: Implement real location tracking when expo-location is available
      console.log('Starting location tracking...');
      
      // Simulate location updates
      const mockLocation = {
        coords: {
          latitude: 40.7128,
          longitude: -74.0060,
          accuracy: 10,
          speed: 25,
          heading: 90,
        }
      };

      setCurrentLocation(mockLocation);
      setIsTracking(true);

      // Simulate periodic location updates
      const interval = setInterval(() => {
        const newLocation = {
          coords: {
            latitude: mockLocation.coords.latitude + (Math.random() - 0.5) * 0.001,
            longitude: mockLocation.coords.longitude + (Math.random() - 0.5) * 0.001,
            accuracy: 10,
            speed: 25 + Math.random() * 10,
            heading: 90 + Math.random() * 20,
          }
        };
        setCurrentLocation(newLocation);
        updateDriverLocation(newLocation);
      }, 5000);

      locationSubscription.current = interval;

      Alert.alert('Success', 'Location tracking started!');
    } catch (error) {
      console.error('Error starting location tracking:', error);
      Alert.alert('Error', 'Failed to start location tracking.');
    } finally {
      setIsLoading(false);
    }
  };

  const stopLocationTracking = async () => {
    try {
      if (locationSubscription.current) {
        clearInterval(locationSubscription.current);
        locationSubscription.current = null;
      }

      setIsTracking(false);
      setCurrentLocation(null);

      Alert.alert('Success', 'Location tracking stopped.');
    } catch (error) {
      console.error('Error stopping location tracking:', error);
      Alert.alert('Error', 'Failed to stop location tracking.');
    }
  };

  const updateDriverLocation = async (location: any) => {
    try {
      await updateLocationMutation.mutateAsync({
        rideId,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || 0,
        speed: location.coords.speed || 0,
        heading: location.coords.heading || 0,
      });
    } catch (error) {
      console.error('Error updating location:', error);
    }
  };

  const handleStatusUpdate = async (status: 'in_progress' | 'completed' | 'cancelled') => {
    try {
      setIsLoading(true);
      
      await updateStatusMutation.mutateAsync({
        rideId,
        status,
      });

      setRideStatus(status);
      onStatusUpdate?.(status);

      if (status === 'completed' || status === 'cancelled') {
        await stopLocationTracking();
      }

      Alert.alert('Success', `Ride status updated to ${status}`);
    } catch (error) {
      console.error('Error updating ride status:', error);
      Alert.alert('Error', 'Failed to update ride status.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatETA = (eta: string | null) => {
    if (!eta) return 'Calculating...';
    return eta;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress':
        return colors.success;
      case 'completed':
        return colors.primary;
      case 'cancelled':
        return colors.error;
      default:
        return colors.gray[500];
    }
  };

  return (
    <View style={styles.container}>
      {/* Status Header */}
      <View style={styles.statusHeader}>
        <View style={styles.statusInfo}>
          <View style={[
            styles.statusDot,
            { backgroundColor: isTracking ? colors.success : colors.gray[400] }
          ]} />
          <Text style={styles.statusText}>
            {isTracking ? 'Active' : 'Inactive'}
          </Text>
        </View>
        <Text style={[styles.rideStatus, { color: getStatusColor(rideStatus) }]}>
          {rideStatus.replace('_', ' ').toUpperCase()}
        </Text>
      </View>

      {/* Location Info */}
      {currentLocation && (
        <View style={styles.locationInfo}>
          <MapPin size={16} color={colors.primary} />
          <Text style={styles.locationText}>
            {currentLocation.coords.latitude.toFixed(6)}, {currentLocation.coords.longitude.toFixed(6)}
          </Text>
        </View>
      )}

      {/* ETA */}
      <View style={styles.etaContainer}>
        <Clock size={16} color={colors.gray[600]} />
        <Text style={styles.etaText}>
          ETA: {formatETA(eta)}
        </Text>
      </View>

      {/* Driver Controls */}
      {isDriver && (
        <View style={styles.driverControls}>
          <TouchableOpacity
            style={[
              styles.trackingButton,
              isTracking ? styles.stopButton : styles.startButton,
            ]}
            onPress={isTracking ? stopLocationTracking : startLocationTracking}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Navigation size={20} color="#FFFFFF" />
            )}
            <Text style={styles.buttonText}>
              {isTracking ? 'Stop Tracking' : 'Start Tracking'}
            </Text>
          </TouchableOpacity>

          {/* Status Update Buttons */}
          <View style={styles.statusActions}>
            <TouchableOpacity
              style={[styles.statusButton, { backgroundColor: colors.success }]}
              onPress={() => handleStatusUpdate('in_progress')}
              disabled={isLoading}
            >
              <Car size={16} color="#FFFFFF" />
              <Text style={styles.statusButtonText}>Start Ride</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.statusButton, { backgroundColor: colors.primary }]}
              onPress={() => handleStatusUpdate('completed')}
              disabled={isLoading}
            >
              <CheckCircle size={16} color="#FFFFFF" />
              <Text style={styles.statusButtonText}>Complete</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.statusButton, { backgroundColor: colors.error }]}
              onPress={() => handleStatusUpdate('cancelled')}
              disabled={isLoading}
            >
              <XCircle size={16} color="#FFFFFF" />
              <Text style={styles.statusButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Passenger Info */}
      {!isDriver && (
        <View style={styles.passengerInfo}>
          <Text style={styles.passengerText}>
            Your driver is on the way. You'll receive updates as they travel.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  rideStatus: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 8,
    fontFamily: 'monospace',
  },
  etaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  etaText: {
    fontSize: 14,
    color: colors.gray[600],
    marginLeft: 8,
  },
  driverControls: {
    gap: 16,
  },
  trackingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  startButton: {
    backgroundColor: colors.success,
  },
  stopButton: {
    backgroundColor: colors.error,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statusActions: {
    flexDirection: 'row',
    gap: 8,
  },
  statusButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 4,
  },
  statusButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  passengerInfo: {
    padding: 16,
    backgroundColor: colors.gray[50],
    borderRadius: 8,
  },
  passengerText: {
    fontSize: 14,
    color: colors.gray[600],
    textAlign: 'center',
  },
}); 