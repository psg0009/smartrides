import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { Star, ThumbsUp, ThumbsDown, MessageCircle, Send } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { trpc } from '@/lib/trpc';
import { useAuthStore } from '@/store/auth-store';

interface RatingSystemProps {
  rideId: string;
  driverId: string;
  onRatingSubmitted?: (rating: number) => void;
}

interface RatingCategory {
  id: string;
  name: string;
  description: string;
}

const RATING_CATEGORIES: RatingCategory[] = [
  {
    id: 'overall',
    name: 'Overall Experience',
    description: 'How was your overall ride experience?',
  },
  {
    id: 'safety',
    name: 'Safety',
    description: 'Did you feel safe during the ride?',
  },
  {
    id: 'cleanliness',
    name: 'Cleanliness',
    description: 'How clean was the vehicle?',
  },
  {
    id: 'communication',
    name: 'Communication',
    description: 'How well did the driver communicate?',
  },
  {
    id: 'punctuality',
    name: 'Punctuality',
    description: 'Was the driver on time?',
  },
];

export default function RatingSystem({ rideId, driverId, onRatingSubmitted }: RatingSystemProps) {
  const { user } = useAuthStore();
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [review, setReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // TODO: Replace with real tRPC hook when route is implemented
  const createRatingMutation = {
    mutateAsync: async (data: any) => {
      console.log('Would create rating:', data);
      return { success: true };
    }
  };

  const handleRatingChange = (categoryId: string, rating: number) => {
    setRatings(prev => ({
      ...prev,
      [categoryId]: rating,
    }));
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to submit a rating');
      return;
    }

    // Check if overall rating is provided
    if (!ratings.overall || ratings.overall === 0) {
      Alert.alert('Error', 'Please provide an overall rating');
      return;
    }

    setIsSubmitting(true);

    try {
      const ratingData = {
        type: 'driver' as const,
        rideId,
        raterId: user.id,
        ratedUserId: driverId,
        rating: ratings.overall,
        comment: review,
      };

      await createRatingMutation.mutateAsync(ratingData);

      Alert.alert('Success', 'Rating submitted successfully! Thank you for your feedback.');

      onRatingSubmitted?.(ratings.overall);
    } catch (error) {
      console.error('Error submitting rating:', error);
      Alert.alert('Error', 'Failed to submit rating. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (categoryId: string, currentRating: number) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => handleRatingChange(categoryId, star)}
            style={styles.starButton}
          >
            <Star
              size={24}
              fill={star <= currentRating ? '#FBBF24' : 'transparent'}
              color={star <= currentRating ? '#FBBF24' : colors.gray[300]}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderCategory = (category: RatingCategory) => {
    const currentRating = ratings[category.id] || 0;

    return (
      <View key={category.id} style={styles.categoryContainer}>
        <View style={styles.categoryHeader}>
          <Text style={styles.categoryName}>{category.name}</Text>
          {currentRating > 0 && (
            <Text style={styles.ratingText}>{currentRating}/5</Text>
          )}
        </View>
        <Text style={styles.categoryDescription}>{category.description}</Text>
        {renderStars(category.id, currentRating)}
      </View>
    );
  };

  const QUICK_TAGS = [
    'Great driver!',
    'Safe ride',
    'Clean vehicle',
    'On time',
    'Good communication',
    'Friendly',
    'Professional',
    'Would recommend',
    'Smooth ride',
    'Helpful',
  ];

  const renderQuickTags = () => (
    <View style={styles.tagsContainer}>
      <Text style={styles.tagsTitle}>Quick Tags (Optional)</Text>
      <View style={styles.tagsGrid}>
        {QUICK_TAGS.map((tag) => (
          <TouchableOpacity
            key={tag}
            style={[
              styles.tagButton,
              selectedTags.includes(tag) && styles.selectedTagButton,
            ]}
            onPress={() => handleTagToggle(tag)}
          >
            <Text style={[
              styles.tagText,
              selectedTags.includes(tag) && styles.selectedTagText,
            ]}>
              {tag}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderReviewSection = () => (
    <View style={styles.reviewContainer}>
      <View style={styles.reviewHeader}>
        <MessageCircle size={20} color={colors.gray[600]} />
        <Text style={styles.reviewTitle}>Write a Review (Optional)</Text>
      </View>
      <TextInput
        style={styles.reviewInput}
        placeholder="Share your experience with this driver..."
        placeholderTextColor={colors.gray[400]}
        value={review}
        onChangeText={setReview}
        multiline
        numberOfLines={4}
        maxLength={500}
      />
      <Text style={styles.characterCount}>
        {review.length}/500 characters
      </Text>
    </View>
  );

  const canSubmit = ratings.overall && ratings.overall > 0;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Rate Your Ride</Text>
        <Text style={styles.subtitle}>
          Help other users by sharing your experience
        </Text>
      </View>

      {/* Rating Categories */}
      <View style={styles.categoriesContainer}>
        {RATING_CATEGORIES.map(renderCategory)}
      </View>

      {/* Quick Tags */}
      {renderQuickTags()}

      {/* Review Section */}
      {renderReviewSection()}

      {/* Submit Button */}
      <TouchableOpacity
        style={[
          styles.submitButton,
          (!canSubmit || isSubmitting) && styles.submitButtonDisabled,
        ]}
        onPress={handleSubmit}
        disabled={!canSubmit || isSubmitting}
      >
        <Send size={20} color="#FFFFFF" />
        <Text style={styles.submitButtonText}>
          {isSubmitting ? 'Submitting...' : 'Submit Rating'}
        </Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Your feedback helps improve the community experience for everyone.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.gray[600],
    textAlign: 'center',
  },
  categoriesContainer: {
    paddingHorizontal: 20,
  },
  categoryContainer: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
  },
  categoryDescription: {
    fontSize: 14,
    color: colors.gray[600],
    marginBottom: 12,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  starButton: {
    padding: 4,
  },
  tagsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  tagsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.gray[100],
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  selectedTagButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tagText: {
    fontSize: 14,
    color: colors.gray[700],
  },
  selectedTagText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  reviewContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  reviewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: colors.text,
    backgroundColor: '#FFFFFF',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: colors.gray[500],
    textAlign: 'right',
    marginTop: 4,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  submitButtonDisabled: {
    backgroundColor: colors.gray[300],
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: colors.gray[500],
    textAlign: 'center',
    lineHeight: 20,
  },
}); 