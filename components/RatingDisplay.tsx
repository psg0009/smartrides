import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Star } from 'lucide-react-native';
import { colors } from '@/constants/colors';

interface RatingDisplayProps {
  rating: number;
  totalRatings?: number;
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
}

export default function RatingDisplay({
  rating,
  totalRatings,
  size = 'medium',
  showText = true,
}: RatingDisplayProps) {
  const starSize = size === 'small' ? 12 : size === 'medium' ? 16 : 20;
  const fontSize = size === 'small' ? 12 : size === 'medium' ? 14 : 16;
  
  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star
          key={`full-${i}`}
          size={starSize}
          color={colors.secondary}
          fill={colors.secondary}
        />
      );
    }
    
    // Half star (if needed)
    if (hasHalfStar) {
      stars.push(
        <View key="half" style={styles.halfStarContainer}>
          <Star
            size={starSize}
            color={colors.gray[300]}
            fill={colors.gray[300]}
            style={styles.halfStarBackground}
          />
          <View style={[styles.halfStarOverlay, { width: starSize * 0.5 }]}>
            <Star
              size={starSize}
              color={colors.secondary}
              fill={colors.secondary}
            />
          </View>
        </View>
      );
    }
    
    // Empty stars
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star
          key={`empty-${i}`}
          size={starSize}
          color={colors.gray[300]}
          fill="transparent"
        />
      );
    }
    
    return stars;
  };

  return (
    <View style={styles.container}>
      <View style={styles.starsContainer}>
        {renderStars()}
      </View>
      {showText && (
        <View style={styles.textContainer}>
          <Text style={[styles.ratingText, { fontSize }]}>
            {rating.toFixed(1)}
          </Text>
          {totalRatings !== undefined && (
            <Text style={[styles.countText, { fontSize: fontSize - 2 }]}>
              ({totalRatings})
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 6,
  },
  halfStarContainer: {
    position: 'relative',
  },
  halfStarBackground: {
    position: 'absolute',
  },
  halfStarOverlay: {
    overflow: 'hidden',
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontWeight: '600',
    color: colors.text,
    marginRight: 4,
  },
  countText: {
    color: colors.gray[500],
  },
});