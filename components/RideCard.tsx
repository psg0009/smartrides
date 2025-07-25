import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { MapPin, Clock, Users, Car, Calendar } from 'lucide-react-native';
import { Ride } from '@/types';
import { colors } from '@/constants/colors';

type RideCardProps = {
  ride: Ride;
  compact?: boolean;
};

export default function RideCard({ ride, compact = false }: RideCardProps) {
  const router = useRouter();
  
  const departureDate = new Date(ride.departureTime);
  const formattedDate = departureDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
  const formattedTime = departureDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
  
  const handlePress = () => {
    router.push(`/book?rideId=${ride.id}`);
  };
  
  return (
    <TouchableOpacity 
      style={[styles.container, compact && styles.compactContainer]} 
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.typeContainer}>
          <Text style={[
            styles.typeText, 
            ride.type === 'chauffeur' ? styles.chauffeurType : styles.carpoolType
          ]}>
            {ride.type === 'chauffeur' ? 'Chauffeur' : 'Carpool'}
          </Text>
        </View>
        <Text style={styles.price}>${ride.price}</Text>
      </View>
      
      <View style={styles.routeContainer}>
        <View style={styles.locationContainer}>
          <MapPin size={16} color={colors.primary} />
          <Text style={styles.locationText} numberOfLines={1}>
            {ride.origin}
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
            {ride.destination}
          </Text>
        </View>
      </View>
      
      {!compact && (
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
            <Text style={styles.infoText}>{ride.availableSeats} seats</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Car size={14} color={colors.gray[600]} />
            <Text style={styles.infoText}>{ride.duration}</Text>
          </View>
        </View>
      )}
      
      {!compact && (
        <View style={styles.driverContainer}>
          <Image source={{ uri: ride.driver.avatar }} style={styles.avatar} />
          <View style={styles.driverInfo}>
            <Text style={styles.driverName}>{ride.driver.name}</Text>
            <View style={styles.ratingContainer}>
              <Text style={styles.rating}>★ {ride.driver.rating.toFixed(1)}</Text>
            </View>
          </View>
        </View>
      )}
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
  compactContainer: {
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeContainer: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  carpoolType: {
    color: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  chauffeurType: {
    color: colors.secondary,
    backgroundColor: colors.secondaryLight,
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
    marginBottom: 16,
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
  driverContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
    paddingTop: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  driverInfo: {
    marginLeft: 12,
  },
  driverName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 12,
    color: colors.gray[600],
  },
});