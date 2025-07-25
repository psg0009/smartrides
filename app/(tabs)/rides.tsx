import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Calendar, SlidersHorizontal, Clock } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useRidesStore } from '@/store/rides-store';
import { RideType } from '@/types';
import RideCard from '@/components/RideCard';
import SearchBar from '@/components/SearchBar';
import FilterChip from '@/components/FilterChip';
import { RideCardSkeleton } from '@/components/SkeletonLoader';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import DateTimePicker from '@react-native-community/datetimepicker';
import Toast from 'react-native-toast-message';

export default function RidesScreen() {
  const { filteredRides, fetchRides, filterRides, isLoading } = useRidesStore();
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedType, setSelectedType] = useState<RideType | undefined>(undefined);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [location, setLocation] = useState('');
  
  useEffect(() => {
    fetchRides().catch(() => {
      Toast.show({
        type: 'error',
        text1: 'Failed to fetch rides',
        text2: 'Please check your connection and try again.',
      });
    });
  }, [fetchRides]);
  
  useEffect(() => {
    filterRides(selectedType, location, undefined, selectedDate ? selectedDate.toISOString() : undefined);
  }, [selectedType, location, selectedDate, filterRides]);
  
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRides();
    setRefreshing(false);
  };
  
  const handleTypeFilter = (type: RideType | undefined) => {
    setSelectedType(type);
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
          placeholder="Search destinations, origins..."
          showFilter
          onFilterPress={toggleFilters}
          style={styles.searchBar}
        />
      </View>
      
      {showFilters && (
        <View style={styles.filtersContainer}>
          <View style={styles.filterHeader}>
            <SlidersHorizontal size={18} color={colors.primary} />
            <Text style={styles.filterTitle}>Filter Options</Text>
          </View>
          <Text style={styles.filterSubtitle}>Location</Text>
          <GooglePlacesAutocomplete
            placeholder="Enter location"
            onPress={(data, details = null) => {
              setLocation(data.description);
            }}
            query={{
              // TODO: Replace with your real Google Places API key. For best practice, use process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY or similar.
              key: process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY || '',
              language: 'en',
            }}
            styles={{
              textInput: { height: 40, borderColor: colors.gray[200], borderWidth: 1, borderRadius: 8, paddingHorizontal: 8 },
              container: { flex: 0, marginBottom: 12 },
            }}
            fetchDetails={false}
            enablePoweredByContainer={false}
          />
          <Text style={styles.filterSubtitle}>Date</Text>
          <TouchableOpacity onPress={() => setShowDatePicker(true)} style={{ marginBottom: 12 }}>
            <Text style={{ color: colors.primary, fontWeight: '600' }}>
              {selectedDate ? selectedDate.toLocaleDateString() : 'Select date'}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={selectedDate || new Date()}
              mode="date"
              display="default"
              onChange={(event, date) => {
                setShowDatePicker(false);
                if (date) setSelectedDate(date);
              }}
              minimumDate={new Date()}
            />
          )}
          <Text style={styles.filterSubtitle}>Ride Type</Text>
          <View style={styles.filterChips}>
            <FilterChip
              label="All Rides"
              isSelected={selectedType === undefined}
              onPress={() => handleTypeFilter(undefined)}
            />
            <FilterChip
              label="🚗 Carpool"
              isSelected={selectedType === 'carpool'}
              onPress={() => handleTypeFilter('carpool')}
            />
            <FilterChip
              label="🚙 Chauffeur"
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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {isLoading ? (
          <View>
            <RideCardSkeleton />
            <RideCardSkeleton />
            <RideCardSkeleton />
          </View>
        ) : filteredRides.length > 0 ? (
          <>
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsCount}>
                {filteredRides.length} ride{filteredRides.length !== 1 ? 's' : ''} found
              </Text>
              <View style={styles.sortContainer}>
                <Clock size={14} color={colors.gray[500]} />
                <Text style={styles.sortText}>Sorted by departure time</Text>
              </View>
            </View>
            {filteredRides.map(ride => (
              <RideCard key={ride.id} ride={ride} />
            ))}
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Calendar size={64} color={colors.gray[300]} />
            <Text style={styles.emptyTitle}>No rides match your search</Text>
            <Text style={styles.emptyDescription}>
              Try adjusting your search, filters, or date.
            </Text>
            <TouchableOpacity 
              style={styles.clearFiltersButton}
              onPress={() => {
                setSearchQuery('');
                setSelectedType(undefined);
                setLocation('');
                setSelectedDate(undefined);
                Toast.show({
                  type: 'info',
                  text1: 'Filters cleared',
                });
              }}
            >
              <Text style={styles.clearFiltersText}>Clear all filters</Text>
            </TouchableOpacity>
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
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: colors.background,
    shadowColor: colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchBar: {
    flex: 1,
  },
  filtersContainer: {
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginLeft: 8,
  },
  filterSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[600],
    marginBottom: 12,
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
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  resultsCount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortText: {
    fontSize: 12,
    color: colors.gray[500],
    marginLeft: 4,
  },
  emptyContainer: {
    backgroundColor: colors.background,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 24,
    shadowColor: colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 15,
    color: colors.gray[500],
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  clearFiltersButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: colors.primaryLight,
    borderRadius: 20,
  },
  clearFiltersText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
});