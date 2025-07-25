import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity,
  Alert
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  User,
  ChevronRight,
  Star
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useRidesStore } from '@/store/rides-store';
import Button from '@/components/Button';

export default function BookRideScreen() {
  const { rideId } = useLocalSearchParams<{ rideId: string }>();
  const router = useRouter();
  const { getRideById } = useRidesStore();
  
  const [ride, setRide] = useState(getRideById(rideId));
  
  useEffect(() => {
    if (!ride) {
      Alert.alert('Error', 'Ride not found');
      router.back();
    }
  }, [ride]);
  
  if (!ride) {
    return null;
  }
  
  const departureDate = new Date(ride.departureTime);
  const formattedDate = departureDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = departureDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
  
  const handleSoloBooking = () => {
    router.push(`/book/solo?rideId=${rideId}`);
  };
  
  const handleGroupBooking = () => {
    router.push(`/book/group?rideId=${rideId}`);
  };
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Book Your Ride</Text>
        <Text style={styles.subtitle}>
          Choose how you'd like to book this ride
        </Text>
      </View>
      
      <View style={styles.rideCard}>
        <View style={styles.routeContainer}>
          <View style={styles.locationContainer}>
            <MapPin size={20} color={colors.primary} />
            <Text style={styles.locationText}>{ride.origin}</Text>
          </View>
          
          <View style={styles.routeLine}>
            <View style={styles.routeDot} />
            <View style={styles.routeDash} />
            <View style={styles.routeDot} />
          </View>
          
          <View style={styles.locationContainer}>
            <MapPin size={20} color={colors.secondary} />
            <Text style={styles.locationText}>{ride.destination}</Text>
          </View>
        </View>
        
        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <Calendar size={18} color={colors.gray[600]} />
            <Text style={styles.infoText}>{formattedDate}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Clock size={18} color={colors.gray[600]} />
            <Text style={styles.infoText}>{formattedTime}</Text>
          </View>
        </View>
        
        <View style={styles.driverInfo}>
          <View style={styles.driverAvatar}>
            <User size={20} color={colors.primary} />
          </View>
          <View style={styles.driverDetails}>
            <Text style={styles.driverName}>{ride.driver.name}</Text>
            <View style={styles.ratingContainer}>
              <Star size={12} color={colors.secondary} fill={colors.secondary} />
              <Text style={styles.rating}>{ride.driver.rating}</Text>
            </View>
          </View>
          <Text style={styles.price}>${ride.price.toFixed(2)}</Text>
        </View>
        
        <Text style={styles.availableSeats}>
          {ride.availableSeats} seat{ride.availableSeats > 1 ? 's' : ''} available
        </Text>
      </View>
      
      <View style={styles.bookingOptionsContainer}>
        <Text style={styles.sectionTitle}>Booking Options</Text>
        
        <TouchableOpacity 
          style={styles.bookingOption}
          onPress={handleSoloBooking}
          activeOpacity={0.7}
        >
          <View style={styles.bookingIconContainer}>
            <User size={24} color={colors.primary} />
          </View>
          <View style={styles.bookingDetails}>
            <Text style={styles.bookingTitle}>Solo Booking</Text>
            <Text style={styles.bookingDescription}>
              Book a single seat for yourself
            </Text>
            <Text style={styles.bookingPrice}>${ride.price.toFixed(2)} per person</Text>
          </View>
          <ChevronRight size={20} color={colors.gray[400]} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.bookingOption}
          onPress={handleGroupBooking}
          activeOpacity={0.7}
        >
          <View style={styles.bookingIconContainer}>
            <Users size={24} color={colors.secondary} />
          </View>
          <View style={styles.bookingDetails}>
            <Text style={styles.bookingTitle}>Group Booking</Text>
            <Text style={styles.bookingDescription}>
              Book multiple seats and split payment
            </Text>
            <Text style={styles.bookingPrice}>From ${ride.price.toFixed(2)} per person</Text>
          </View>
          <ChevronRight size={20} color={colors.gray[400]} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.benefitsContainer}>
        <Text style={styles.sectionTitle}>Why Book with SmartRides?</Text>
        
        <View style={styles.benefitItem}>
          <View style={styles.benefitDot} />
          <Text style={styles.benefitText}>Verified student drivers and passengers</Text>
        </View>
        
        <View style={styles.benefitItem}>
          <View style={styles.benefitDot} />
          <Text style={styles.benefitText}>Secure payment processing</Text>
        </View>
        
        <View style={styles.benefitItem}>
          <View style={styles.benefitDot} />
          <Text style={styles.benefitText}>24/7 customer support</Text>
        </View>
        
        <View style={styles.benefitItem}>
          <View style={styles.benefitDot} />
          <Text style={styles.benefitText}>Real-time ride tracking</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.gray[600],
  },
  rideCard: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  routeContainer: {
    marginBottom: 16,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  locationText: {
    marginLeft: 12,
    fontSize: 16,
    color: colors.text,
  },
  routeLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
    height: 24,
  },
  routeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  routeDash: {
    flex: 1,
    height: 1,
    backgroundColor: colors.gray[300],
    marginHorizontal: 4,
  },
  infoContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
    minWidth: '45%',
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.gray[600],
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight + '20',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  driverAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  driverDetails: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    color: colors.gray[600],
    marginLeft: 4,
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  availableSeats: {
    fontSize: 14,
    color: colors.gray[600],
    textAlign: 'center',
  },
  bookingOptionsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  bookingOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  bookingIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  bookingDetails: {
    flex: 1,
  },
  bookingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  bookingDescription: {
    fontSize: 14,
    color: colors.gray[600],
    marginBottom: 8,
  },
  bookingPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  benefitsContainer: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 16,
    shadowColor: colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
    marginRight: 12,
  },
  benefitText: {
    fontSize: 14,
    color: colors.gray[600],
    flex: 1,
  },
});