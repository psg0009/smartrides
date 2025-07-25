import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Star, X } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import Button from '@/components/Button';
import { trpc } from '@/lib/trpc';

interface RatingModalProps {
  visible: boolean;
  onClose: () => void;
  rideId: string;
  ratedUserId: string;
  ratedUserName: string;
  type: 'driver' | 'passenger';
  raterId: string;
}

export default function RatingModal({
  visible,
  onClose,
  rideId,
  ratedUserId,
  ratedUserName,
  type,
  raterId,
}: RatingModalProps) {
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const createRatingMutation = trpc.ratings.create.useMutation({
    onSuccess: () => {
      Alert.alert('Success', 'Rating submitted successfully!');
      handleClose();
    },
    onError: (error) => {
      Alert.alert('Error', 'Failed to submit rating. Please try again.');
      console.error('Rating submission error:', error);
    },
  });

  const handleClose = () => {
    setRating(0);
    setComment('');
    setIsSubmitting(false);
    onClose();
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Error', 'Please select a rating');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await createRatingMutation.mutateAsync({
        rideId,
        raterId,
        ratedUserId,
        rating,
        comment: comment.trim() || undefined,
        type,
      });
    } catch (error) {
      console.error('Error submitting rating:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setRating(star)}
            style={styles.starButton}
            activeOpacity={0.7}
          >
            <Star
              size={32}
              color={star <= rating ? colors.secondary : colors.gray[300]}
              fill={star <= rating ? colors.secondary : 'transparent'}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>
              Rate {type === 'driver' ? 'Driver' : 'Passenger'}
            </Text>
            <TouchableOpacity
              onPress={handleClose}
              style={styles.closeButton}
              activeOpacity={0.7}
            >
              <X size={24} color={colors.gray[600]} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Text style={styles.subtitle}>
              How was your experience with {ratedUserName}?
            </Text>

            {renderStars()}

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Comment (Optional)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Share your experience..."
                placeholderTextColor={colors.gray[400]}
                value={comment}
                onChangeText={setComment}
                multiline
                numberOfLines={3}
                maxLength={200}
              />
              <Text style={styles.characterCount}>
                {comment.length}/200
              </Text>
            </View>

            <View style={styles.buttonContainer}>
              <Button
                title="Cancel"
                variant="secondary"
                onPress={handleClose}
                style={styles.cancelButton}
              />
              <Button
                title="Submit Rating"
                onPress={handleSubmit}
                isLoading={isSubmitting}
                style={styles.submitButton}
                disabled={rating === 0}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: colors.background,
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
  },
  subtitle: {
    fontSize: 16,
    color: colors.gray[600],
    textAlign: 'center',
    marginBottom: 24,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  starButton: {
    padding: 4,
    marginHorizontal: 4,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: colors.gray[100],
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  characterCount: {
    fontSize: 12,
    color: colors.gray[500],
    textAlign: 'right',
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 1,
  },
});