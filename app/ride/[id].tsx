import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  Image, 
  TouchableOpacity,
  Alert,
  Platform,
  Dimensions
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  Car, 
  MessageCircle, 
  Share2, 
  Star,
  UserPlus
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useRidesStore } from '@/store/rides-store';
import { useAuthStore } from '@/store/auth-store';
import Button from '@/components/Button';
import { mockChatRooms } from '@/mocks/data';
import MapView, { Marker } from 'react-native-maps';

export default function RideDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getRideById } = useRidesStore();
  const { isAuthenticated } = useAuthStore();
  
  const [ride, setRide] = useState(getRideById(id));
  const [chatRoom, setChatRoom] = useState(mockChatRooms.find(room => room.rideId === id));
  const [showBookingOptions, setShowBookingOptions] = useState(false);
  
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
  
  const handleBookSoloRide = () => {
    if (!isAuthenticated) {
      Alert.alert(
        'Login Required',
        'You need to login to book a ride',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Login',
            onPress: () => router.push('/auth/login'),
          },
        ]
      );
      return;
    }
    
    router.push({
      pathname: '/book/index',
      params: { rideId: ride.id }
    });
  };
  
  const handleBookGroupRide = () => {
    if (!isAuthenticated) {
      Alert.alert(
        'Login Required',
        'You need to login to book a group ride',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Login',
            onPress: () => router.push('/auth/login'),
          },
        ]
      );
      return;
    }
    
    router.push({
      pathname: '/book/group',
      params: { rideId: ride.id }
    });
  };
  
  const handleOpenChat = () => {
    if (!isAuthenticated) {
      Alert.alert(
        'Login Required',
        'You need to login to chat with ride participants',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Login',
            onPress: () => router.push('/auth/login'),
          },
        ]
      );
      return;
    }
    
    if (chatRoom) {
      router.push(`/chat/${chatRoom.id}`);
    } else {
      Alert.alert('Chat not available', 'This ride does not have an active chat room yet.');
    }
  };
  
  const handleShare = () => {
    if (Platform.OS === 'web') {
      Alert.alert('Share', 'Sharing is not available on web');
      return;
    }
    
    Alert.alert('Share', 'Share functionality would be implemented here');
  };

  const { width } = Dimensions.get('window');
  
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: ride.type === 'carpool' ? 'Carpool Ride' : 'Chauffeur Service',
          headerRight: () => (
            <TouchableOpacity 
              style={styles.shareButton}
              onPress={handleShare}
              activeOpacity={0.7}
            >
              <Share2 size={20} color={colors.text} />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Route Map */}
        <View style={{ height: Math.max(180, Math.min(300, width * 0.5)), borderRadius: 16, overflow: 'hidden', margin: width < 400 ? 8 : 16, marginBottom: 0 }}>
          <MapView
            style={{ flex: 1 }}
            initialRegion={{
              latitude: ride.originCoords?.latitude || 37.7749,
              longitude: ride.originCoords?.longitude || -122.4194,
              latitudeDelta: 0.1,
              longitudeDelta: 0.1,
            }}
            scrollEnabled={false}
            zoomEnabled={false}
            pitchEnabled={false}
            rotateEnabled={false}
          >
            <Marker
              coordinate={ride.originCoords || { latitude: 37.7749, longitude: -122.4194 }}
              title="Origin"
              description={ride.origin}
              pinColor={colors.primary}
            />
            <Marker
              coordinate={ride.destinationCoords || { latitude: 37.7849, longitude: -122.4094 }}
              title="Destination"
              description={ride.destination}
              pinColor={colors.secondary}
            />
          </MapView>
        </View>
        {/* End Route Map */}
        
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={[
              styles.typeContainer, 
              ride.type === 'chauffeur' ? styles.chauffeurType : styles.carpoolType
            ]}>
              <Text style={[
                styles.typeText, 
                ride.type === 'chauffeur' ? styles.chauffeurTypeText : styles.carpoolTypeText
              ]}>
                {ride.type === 'chauffeur' ? 'Chauffeur Service' : 'Carpool Ride'}
              </Text>
            </View>
            <Text style={styles.price}>${ride.price}</Text>
          </View>
          
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
            
            <View style={styles.infoItem}>
              <Users size={18} color={colors.gray[600]} />
              <Text style={styles.infoText}>{ride.availableSeats} available seats</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Car size={18} color={colors.gray[600]} />
              <Text style={styles.infoText}>{ride.duration} ({ride.distance})</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.driverCard}>
          <Text style={styles.sectionTitle}>
            {ride.type === 'chauffeur' ? 'Your Chauffeur' : 'Ride Host'}
          </Text>
          
          <View style={styles.driverContainer}>
            <Image source={{ uri: ride.driver.avatar }} style={styles.avatar} />
            <View style={styles.driverInfo}>
              <Text style={styles.driverName}>{ride.driver.name}</Text>
              <View style={styles.ratingContainer}>
                <Star size={16} color={colors.secondary} fill={colors.secondary} />
                <Text style={styles.rating}>{ride.driver.rating.toFixed(1)}</Text>
              </View>
              <Text style={styles.university}>{ride.driver.university}</Text>
            </View>
          </View>
        </View>
        
        {ride.passengers.length > 0 && (
          <View style={styles.passengersCard}>
            <Text style={styles.sectionTitle}>Other Passengers</Text>
            
            {ride.passengers.map(passenger => (
              <View key={passenger.id} style={styles.passengerContainer}>
                <Image source={{ uri: passenger.avatar }} style={styles.passengerAvatar} />
                <View style={styles.passengerInfo}>
                  <Text style={styles.passengerName}>{passenger.name}</Text>
                  <Text style={styles.university}>{passenger.university}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
        
        <View style={styles.additionalInfo}>
          <Text style={styles.sectionTitle}>Additional Information</Text>
          <Text style={styles.additionalInfoText}>
            {ride.type === 'carpool' 
              ? 'This is a shared ride with other students. The driver is a fellow student offering a ride to the same destination. Please be ready at the pickup location 5 minutes before the scheduled time.'
              : 'This is a professional chauffeur service. Your driver will meet you at the designated pickup location. You can contact the driver directly through the app once your booking is confirmed.'}
          </Text>
        </View>
      </ScrollView>
      
      {showBookingOptions ? (
        <View style={styles.bookingOptionsContainer}>
          <TouchableOpacity 
            style={styles.closeOptionsButton}
            onPress={() => setShowBookingOptions(false)}
            activeOpacity={0.7}
          >
            <Text style={styles.closeOptionsText}>Close</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.bookingOptionButton}
            onPress={handleBookSoloRide}
            activeOpacity={0.7}
          >
            <Car size={24} color={colors.primary} />
            <View style={styles.bookingOptionContent}>
              <Text style={styles.bookingOptionTitle}>Book Solo Ride</Text>
              <Text style={styles.bookingOptionDescription}>
                Book just for yourself
              </Text>
            </View>
            <Text style={styles.bookingOptionPrice}>${ride.price}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.bookingOptionButton}
            onPress={handleBookGroupRide}
            activeOpacity={0.7}
          >
            <UserPlus size={24} color={colors.primary} />
            <View style={styles.bookingOptionContent}>
              <Text style={styles.bookingOptionTitle}>Book Group Ride</Text>
              <Text style={styles.bookingOptionDescription}>
                Book for multiple people and split payment
              </Text>
            </View>
            <Text style={styles.bookingOptionPrice}>From ${(ride.price / 2).toFixed(2)}/person</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.footer}>
          {chatRoom && (
            <TouchableOpacity 
              style={styles.chatButton}
              onPress={handleOpenChat}
              activeOpacity={0.7}
            >
              <MessageCircle size={24} color={colors.primary} />
            </TouchableOpacity>
          )}
          
          <Button
            title={`Book for $${ride.price}`}
            onPress={() => setShowBookingOptions(true)}
            style={styles.bookButton}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  scrollView: {
    flex: 1,
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 16,
    margin: 16,
    shadowColor: colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  typeContainer: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  carpoolType: {
    backgroundColor: colors.primaryLight,
  },
  chauffeurType: {
    backgroundColor: colors.secondaryLight,
  },
  typeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  carpoolTypeText: {
    color: colors.primary,
  },
  chauffeurTypeText: {
    color: colors.secondary,
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
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
  driverCard: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  driverContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  driverInfo: {
    marginLeft: 16,
  },
  driverName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  rating: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginLeft: 4,
  },
  university: {
    fontSize: 14,
    color: colors.gray[600],
  },
  passengersCard: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  passengerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  passengerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  passengerInfo: {
    marginLeft: 12,
  },
  passengerName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  additionalInfo: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 100,
    shadowColor: colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  additionalInfoText: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.gray[600],
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  bookButton: {
    flex: 1,
  },
  bookingOptionsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: colors.gray[900],
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  closeOptionsButton: {
    alignSelf: 'flex-end',
    marginBottom: 8,
  },
  closeOptionsText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray[600],
  },
  bookingOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[50],
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  bookingOptionContent: {
    flex: 1,
    marginLeft: 16,
  },
  bookingOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  bookingOptionDescription: {
    fontSize: 12,
    color: colors.gray[600],
  },
  bookingOptionPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
});