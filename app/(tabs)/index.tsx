import React, { useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Car, MapPin, Calendar, Users, Star, TrendingUp, Search, Plus, CreditCard } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/constants/colors';
import { useRidesStore } from '@/store/rides-store';
import { useAuthStore } from '@/store/auth-store';
import RideCard from '@/components/RideCard';
import Button from '@/components/Button';

export default function HomeScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { rides, fetchRides } = useRidesStore();
  
  useEffect(() => {
    fetchRides();
  }, [fetchRides]);
  
  const upcomingRides = rides.slice(0, 3);
  const topPickRides = rides.filter(ride => ride.driver.rating >= 4.8).slice(0, 2);
  
  const handleLogin = () => {
    router.push('/auth/login');
  };
  
  const handleFindRides = () => {
    router.push('/rides');
  };
  
  const handleBookChauffeur = () => {
    router.push('/rides?type=chauffeur');
  };
  
  const handleCreateRide = () => {
    router.push('/create-ride');
  };
  
  const handlePaymentMethods = () => {
    router.push('/payment-methods');
  };
  
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
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
            onPress={handleFindRides}
            activeOpacity={0.7}
          >
            <View style={[styles.serviceIconContainer, styles.carpoolIcon]}>
              <Users size={24} color={colors.primary} />
            </View>
            <Text style={styles.serviceTitle}>Carpooling</Text>
            <Text style={styles.serviceDescription}>
              Share rides with other students and split costs
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.serviceCard}
            onPress={handleBookChauffeur}
            activeOpacity={0.7}
          >
            <View style={[styles.serviceIconContainer, styles.chauffeurIcon]}>
              <Car size={24} color={colors.secondary} />
            </View>
            <Text style={styles.serviceTitle}>Chauffeur</Text>
            <Text style={styles.serviceDescription}>
              Book a private driver for your airport transfer
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.topPicksContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top Picks</Text>
          <TouchableOpacity onPress={handleFindRides}>
            <Text style={styles.seeAllText}>See all</Text>
          </TouchableOpacity>
        </View>
        
        {topPickRides.length > 0 ? (
          topPickRides.map(ride => (
            <View key={ride.id} style={styles.topPickCard}>
              <RideCard ride={ride} />
              <View style={styles.topPickBadge}>
                <Star size={12} color={colors.background} fill={colors.background} />
                <Text style={styles.topPickBadgeText}>Top Rated</Text>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyStateContainer}>
            <TrendingUp size={48} color={colors.gray[300]} />
            <Text style={styles.emptyStateText}>No top picks available</Text>
          </View>
        )}
      </View>
      
      <View style={styles.upcomingContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Rides</Text>
          <TouchableOpacity onPress={handleFindRides}>
            <Text style={styles.seeAllText}>See all</Text>
          </TouchableOpacity>
        </View>
        
        {upcomingRides.length > 0 ? (
          upcomingRides.map(ride => (
            <RideCard key={ride.id} ride={ride} />
          ))
        ) : (
          <View style={styles.emptyStateContainer}>
            <Calendar size={48} color={colors.gray[300]} />
            <Text style={styles.emptyStateText}>No upcoming rides</Text>
            <Button 
              title="Find a ride" 
              onPress={handleFindRides}
              style={styles.findRideButton}
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
    backgroundColor: colors.gray[50],
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
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
    fontSize: 12,
    color: colors.gray[600],
    textAlign: 'center',
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