import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar, MapPin, Filter } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useRidesStore } from '@/store/rides-store';
import { RideType } from '@/types';
import RideCard from '@/components/RideCard';
import SearchBar from '@/components/SearchBar';
import FilterChip from '@/components/FilterChip';
import Button from '@/components/Button';

export default function RidesScreen() {
  const router = useRouter();
  const { rides, filteredRides, fetchRides, filterRides, isLoading } = useRidesStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<RideType | undefined>(undefined);
  const [showFilters, setShowFilters] = useState(false);
  
  useEffect(() => {
    fetchRides();
  }, []);
  
  useEffect(() => {
    filterRides(selectedType, searchQuery, undefined, undefined);
  }, [selectedType, searchQuery]);
  
  const handleTypeFilter = (type: RideType | undefined) => {
    setSelectedType(type);
  };
  
  const handleRidePress = (rideId: string) => {
    router.push(`/ride/${rideId}`);
  };
  
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by location..."
        />
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={toggleFilters}
          activeOpacity={0.7}
        >
          <Filter size={20} color={colors.text} />
        </TouchableOpacity>
      </View>
      
      {showFilters && (
        <View style={styles.filtersContainer}>
          <Text style={styles.filterTitle}>Ride Type</Text>
          <View style={styles.filterChips}>
            <FilterChip
              label="All"
              isSelected={selectedType === undefined}
              onPress={() => handleTypeFilter(undefined)}
            />
            <FilterChip
              label="Carpool"
              isSelected={selectedType === 'carpool'}
              onPress={() => handleTypeFilter('carpool')}
            />
            <FilterChip
              label="Chauffeur"
              isSelected={selectedType === 'chauffeur'}
              onPress={() => handleTypeFilter('chauffeur')}
            />
          </View>
        </View>
      )}
      
      <ScrollView 
        style={styles.ridesContainer}
        contentContainerStyle={styles.ridesContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading rides...</Text>
          </View>
        ) : filteredRides.length > 0 ? (
          filteredRides.map(ride => (
            <RideCard key={ride.id} ride={ride} />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Calendar size={48} color={colors.gray[300]} />
            <Text style={styles.emptyTitle}>No rides found</Text>
            <Text style={styles.emptyDescription}>
              Try adjusting your search or filters
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.background,
  },
  filterButton: {
    marginLeft: 12,
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersContainer: {
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  ridesContainer: {
    flex: 1,
  },
  ridesContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    fontSize: 16,
    color: colors.gray[500],
  },
  emptyContainer: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: colors.gray[500],
    textAlign: 'center',
  },
});