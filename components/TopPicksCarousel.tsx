import React from 'react';
import { StyleSheet, Text, View, FlatList, Dimensions, TouchableOpacity } from 'react-native';
import { Star } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import RideCard from './RideCard';
import { Ride } from '@/types';

interface TopPicksCarouselProps {
  rides: Ride[];
  onSeeAll: () => void;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;
const SPACING = 16;

export default function TopPicksCarousel({ rides, onSeeAll }: TopPicksCarouselProps) {
  const renderRideCard = ({ item }: { item: Ride }) => (
    <View style={[styles.cardContainer, { width: CARD_WIDTH }]}>
      <RideCard ride={item} />
      <View style={styles.topPickBadge}>
        <Star size={12} color={colors.background} fill={colors.background} />
        <Text style={styles.topPickBadgeText}>Top Rated</Text>
      </View>
    </View>
  );

  if (rides.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Top Picks</Text>
          <TouchableOpacity onPress={onSeeAll}>
            <Text style={styles.seeAllText}>See all</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.emptyState}>
          <Star size={48} color={colors.gray[300]} />
          <Text style={styles.emptyStateText}>No top picks available</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🔥 Top Picks</Text>
        <TouchableOpacity onPress={onSeeAll}>
          <Text style={styles.seeAllText}>See all</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={rides}
        renderItem={renderRideCard}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToAlignment="center"
        snapToInterval={CARD_WIDTH + SPACING}
        decelerationRate="fast"
        contentContainerStyle={styles.listContainer}
        ItemSeparatorComponent={() => <View style={{ width: SPACING }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  cardContainer: {
    position: 'relative',
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
    shadowColor: colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  topPickBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.background,
    marginLeft: 4,
  },
  emptyState: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.gray[500],
    marginTop: 12,
    textAlign: 'center',
  },
});