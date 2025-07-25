import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { colors } from '@/constants/colors';

interface FilterChipProps {
  label: string;
  isSelected: boolean;
  onPress: () => void;
}

export default function FilterChip({
  label,
  isSelected,
  onPress,
}: FilterChipProps) {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        isSelected ? styles.selectedContainer : styles.unselectedContainer,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.label,
          isSelected ? styles.selectedLabel : styles.unselectedLabel,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedContainer: {
    backgroundColor: colors.primary,
  },
  unselectedContainer: {
    backgroundColor: colors.gray[100],
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  selectedLabel: {
    color: colors.background,
  },
  unselectedLabel: {
    color: colors.gray[600],
  },
});