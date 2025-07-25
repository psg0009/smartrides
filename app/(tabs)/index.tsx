import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Car, MapPin, Calendar, Users, Search, Plus, CreditCard, ArrowRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/constants/colors';
import { useRidesStore } from '@/store/rides-store';
import { useAuthStore } from '@/store/auth-store';
import RideCard from '@/components/RideCard';
import Button from '@/components/Button';
import TopPicksCarousel from '@/components/TopPicksCarousel';
import { RideCardSkeleton } from '@/components/SkeletonLoader';
import Toast from 'react-native-toast-message';

export default function HomeScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { rides, fetchRides, isLoading } = useRidesStore();
  const [refreshing, setRefreshing] = useState<boolean>(false);
  
  useEffect(() => {
    fetchRides().catch(() => {
      Toast.show({
        type: 'error',
        text1: 'Failed to fetch rides',
        text2: 'Please check your connection and try again.',
      });
    });
  }, [fetchRides]);
  
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRides();
    setRefreshing(false);
  };
  
  const upcomingRides = rides.slice(0, 3);
  const topPickRides = rides.filter(ride => ride.driver.rating >= 4.8).slice(0, 2);
  
  const handleLogin = () => {
    router.push('/auth/login');
  };
  
  const handleFindRides = () => {
    router.push('/rides');
  };
  

  
  const handleCreateRide = () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    router.push('/(tabs)/create-ride');
  };
  
  const handlePaymentMethods = () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    router.push('/payment-methods');
  };
  
  const handleBookSolo = () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    router.push('/book/solo');
  };
  
  const handleBookGroup = () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    router.push('/book/group');
  };
  
  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <LinearGradient
          colors={['rgba(53, 99, 233, 0.8)', 'rgba(53, 99, 233, 0.6)']}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerContent}>
            <Text style={styles.welcomeText}>
              {isAuthenticated ? `Welcome back, ${user?.name.split(' ')[0]}!` : 'Welcome to SmartRides'}
            </Text>
            <Text style={styles.tagline}>
              Student-focused airport rides made simple
            </Text>
            
            {!isAuthenticated && (
              <Button 
                title="Login to get started" 
                variant="secondary"
                style={styles.loginButton}
                onPress={handleLogin}
              />
            )}
          </View>
        </LinearGradient>
      </View>
      
      <View style={styles.quickActionsContainer}>
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={handleFindRides}
          activeOpacity={0.7}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: colors.primaryLight }]}>
            <Search size={20} color={colors.primary} />
          </View>
          <Text style={styles.quickActionText}>Find Rides</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={handleCreateRide}
          activeOpacity={0.7}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: colors.secondaryLight }]}>
            <Plus size={20} color={colors.secondary} />
          </View>
          <Text style={styles.quickActionText}>Offer Ride</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={handlePaymentMethods}
          activeOpacity={0.7}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: '#E6F7FF' }]}>
            <CreditCard size={20} color="#0096FF" />
          </View>
          <Text style={styles.quickActionText}>Payments</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.servicesContainer}>
        <Text style={styles.sectionTitle}>Our Services</Text>
        
        <View style={styles.servicesGrid}>
          <TouchableOpacity 
            style={styles.serviceCard}
            onPress={handleBookGroup}
            activeOpacity={0.7}
          >
            <View style={[styles.serviceIconContainer, styles.carpoolIcon]}>
              <Users size={24} color={colors.primary} />
            </View>
            <Text style={styles.serviceTitle}>Group Ride</Text>
            <Text style={styles.serviceDescription}>
              Share rides with other students and split costs
            </Text>
            <ArrowRight size={16} color={colors.gray[400]} style={styles.serviceArrow} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.serviceCard}
            onPress={handleBookSolo}
            activeOpacity={0.7}
          >
            <View style={[styles.serviceIconContainer, styles.chauffeurIcon]}>
              <Car size={24} color={colors.secondary} />
            </View>
            <Text style={styles.serviceTitle}>Solo Ride</Text>
            <Text style={styles.serviceDescription}>
              Book a private driver for your airport transfer
            </Text>
            <ArrowRight size={16} color={colors.gray[400]} style={styles.serviceArrow} />
          </TouchableOpacity>
        </View>
      </View>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <RideCardSkeleton />
          <RideCardSkeleton />
        </View>
      ) : topPickRides.length > 0 ? (
        <TopPicksCarousel rides={topPickRides} onSeeAll={handleFindRides} />
      ) : (
        <View style={styles.emptyStateContainer}>
          <Users size={48} color={colors.gray[300]} />
          <Text style={styles.emptyStateText}>No popular rides yet</Text>
          <Button
            title="Find a ride"
            onPress={handleFindRides}
            style={styles.findRideButton}
            leftIcon={<Search size={16} color={colors.background} />}
          />
        </View>
      )}
      
      <View style={styles.upcomingContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Rides</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/rides')}>
            <Text style={styles.seeAllText}>See all</Text>
          </TouchableOpacity>
        </View>
        
        {isLoading ? (
          <View>
            <RideCardSkeleton />
            <RideCardSkeleton />
          </View>
        ) : upcomingRides.length > 0 ? (
          upcomingRides.map(ride => (
            <RideCard key={ride.id} ride={ride} />
          ))
        ) : (
          <View style={styles.emptyStateContainer}>
            <Calendar size={48} color={colors.gray[300]} />
            <Text style={styles.emptyStateText}>No recent rides</Text>
            <Button 
              title="Find a ride" 
              onPress={() => router.push('/(tabs)/rides')}
              style={styles.findRideButton}
              leftIcon={<Search size={16} color={colors.background} />}
            />
          </View>
        )}
      </View>
      
      <View style={styles.featuresContainer}>
        <Text style={styles.sectionTitle}>Why Choose SmartRides?</Text>
        
        <View style={styles.featureCard}>
          <View style={styles.featureIconContainer}>
            <MapPin size={24} color={colors.primary} />
          </View>
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>Campus Pickup Zones</Text>
            <Text style={styles.featureDescription}>
              Designated pickup points at all major universities
            </Text>
          </View>
        </View>
        
        <View style={styles.featureCard}>
          <View style={styles.featureIconContainer}>
            <Users size={24} color={colors.primary} />
          </View>
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>Student Verification</Text>
            <Text style={styles.featureDescription}>
              Only verified students can use our platform
            </Text>
          </View>
        </View>
        
        <View style={styles.featureCard}>
          <View style={styles.featureIconContainer}>
            <Calendar size={24} color={colors.primary} />
          </View>
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>Flexible Scheduling</Text>
            <Text style={styles.featureDescription}>
              Book in advance or find last-minute rides
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          SmartRides © 2025 - Student Transportation Made Easy
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  header: {
    height: 200,
    overflow: 'hidden',
  },
  headerGradient: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  headerContent: {
    maxWidth: '80%',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.background,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: colors.background,
    opacity: 0.9,
    marginBottom: 20,
  },
  loginButton: {
    alignSelf: 'flex-start',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: colors.background,
    borderRadius: 20,
    marginTop: -20,
    marginHorizontal: 16,
    shadowColor: colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  quickActionButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text,
  },
  servicesContainer: {
    padding: 20,
    backgroundColor: colors.background,
    borderRadius: 20,
    marginTop: 16,
    marginHorizontal: 16,
    shadowColor: colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  servicesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  serviceCard: {
    width: '48%',
    backgroundColor: colors.background,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: colors.gray[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    position: 'relative',
  },
  serviceIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  carpoolIcon: {
    backgroundColor: colors.primaryLight,
  },
  chauffeurIcon: {
    backgroundColor: colors.secondaryLight,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  serviceDescription: {
    fontSize: 13,
    color: colors.gray[600],
    textAlign: 'center',
    lineHeight: 18,
  },
  serviceArrow: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  loadingContainer: {
    marginTop: 24,
  },
  topPicksContainer: {
    marginTop: 24,
    marginHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
  },
  topPickCard: {
    position: 'relative',
    marginBottom: 16,
  },
  topPickBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  topPickBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.background,
    marginLeft: 4,
  },
  upcomingContainer: {
    marginTop: 24,
    marginHorizontal: 16,
  },
  emptyStateContainer: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.gray[500],
    marginVertical: 12,
  },
  findRideButton: {
    marginTop: 12,
  },
  featuresContainer: {
    marginTop: 24,
    marginHorizontal: 16,
    marginBottom: 24,
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: colors.gray[600],
  },
  footer: {
    marginHorizontal: 16,
    marginBottom: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  footerText: {
    fontSize: 12,
    color: colors.gray[500],
    textAlign: 'center',
  },
});