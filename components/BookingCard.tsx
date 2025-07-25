import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar, Clock, MapPin, Users } from 'lucide-react-native';
import { Booking } from '@/types';
import { colors } from '@/constants/colors';

type BookingCardProps = {
  booking: Booking;
};

export default function BookingCard({ booking }: BookingCardProps) {
  const router = useRouter();
  
  const departureDate = new Date(booking.ride.departureTime);
  const formattedDate = departureDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
  const formattedTime = departureDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
  
  const getStatusColor = () => {
    switch (booking.status) {
      case 'confirmed':
        return colors.success;
      case 'pending':
        return colors.secondary;
      case 'cancelled':
        return colors.error;
      default:
        return colors.gray[500];
    }
  };
  
  const handlePress = () => {
    router.push(`/ride/${booking.ride.id}`);
  };
  
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={[styles.statusContainer, { backgroundColor: `${getStatusColor()}20` }]}>
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
          </Text>
        </View>
        <Text style={styles.price}>${booking.totalPrice}</Text>
      </View>
      
      <View style={styles.routeContainer}>
        <View style={styles.locationContainer}>
          <MapPin size={16} color={colors.primary} />
          <Text style={styles.locationText} numberOfLines={1}>
            {booking.ride.origin}
          </Text>
        </View>
        
        <View style={styles.routeLine}>
          <View style={styles.routeDot} />
          <View style={styles.routeDash} />
          <View style={styles.routeDot} />
        </View>
        
        <View style={styles.locationContainer}>
          <MapPin size={16} color={colors.secondary} />
          <Text style={styles.locationText} numberOfLines={1}>
            {booking.ride.destination}
          </Text>
        </View>
      </View>
      
      <View style={styles.infoContainer}>
        <View style={styles.infoItem}>
          <Calendar size={14} color={colors.gray[600]} />
          <Text style={styles.infoText}>{formattedDate}</Text>
        </View>
        
        <View style={styles.infoItem}>
          <Clock size={14} color={colors.gray[600]} />
          <Text style={styles.infoText}>{formattedTime}</Text>
        </View>
        
        <View style={styles.infoItem}>
          <Users size={14} color={colors.gray[600]} />
          <Text style={styles.infoText}>{booking.passengers} passenger{booking.passengers > 1 ? 's' : ''}</Text>
        </View>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.rideType}>
          {booking.ride.type === 'chauffeur' ? 'Chauffeur Service' : 'Carpool Ride'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.gray[100],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusContainer: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  routeContainer: {
    marginBottom: 16,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  locationText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  routeLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
    height: 16,
  },
  routeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
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
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 4,
    fontSize: 12,
    color: colors.gray[600],
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
    paddingTop: 12,
  },
  rideType: {
    fontSize: 14,
    color: colors.gray[600],
  },
});