import React from 'react';
import { StyleSheet, View, Animated } from 'react-native';
import { colors } from '@/constants/colors';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export default function SkeletonLoader({ 
  width = '100%', 
  height = 20, 
  borderRadius = 8,
  style 
}: SkeletonLoaderProps) {
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [animatedValue]);

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.gray[200], colors.gray[300]],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          backgroundColor,
        },
        style,
      ]}
    />
  );
}

export function RideCardSkeleton() {
  return (
    <View style={styles.rideCardSkeleton}>
      <View style={styles.skeletonHeader}>
        <SkeletonLoader width={60} height={60} borderRadius={30} />
        <View style={styles.skeletonHeaderText}>
          <SkeletonLoader width="70%" height={16} />
          <SkeletonLoader width="50%" height={14} style={{ marginTop: 8 }} />
        </View>
      </View>
      <View style={styles.skeletonContent}>
        <SkeletonLoader width="100%" height={14} />
        <SkeletonLoader width="80%" height={14} style={{ marginTop: 8 }} />
        <SkeletonLoader width="60%" height={14} style={{ marginTop: 8 }} />
      </View>
      <View style={styles.skeletonFooter}>
        <SkeletonLoader width={80} height={32} borderRadius={16} />
        <SkeletonLoader width={60} height={20} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.gray[200],
  },
  rideCardSkeleton: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    marginHorizontal: 16,
    shadowColor: colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  skeletonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  skeletonHeaderText: {
    flex: 1,
    marginLeft: 12,
  },
  skeletonContent: {
    marginBottom: 16,
  },
  skeletonFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});