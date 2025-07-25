import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, Animated } from 'react-native';
import { Search, X, Filter } from 'lucide-react-native';
import { colors } from '@/constants/colors';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
  onFilterPress?: () => void;
  showFilter?: boolean;
  style?: any;
}

export default function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search rides, destinations...',
  onClear,
  onFilterPress,
  showFilter = false,
  style,
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [focusAnimation] = useState(new Animated.Value(0));
  const handleClear = () => {
    onChangeText('');
    if (onClear) {
      onClear();
    }
  };
  
  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(focusAnimation, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };
  
  const handleBlur = () => {
    setIsFocused(false);
    Animated.timing(focusAnimation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };
  
  const borderColor = focusAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.gray[200], colors.primary],
  });
  
  const backgroundColor = focusAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.gray[50], colors.background],
  });

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          borderColor,
          backgroundColor,
        },
        style,
      ]}
    >
      <Search 
        size={20} 
        color={isFocused ? colors.primary : colors.gray[400]} 
        style={styles.icon} 
      />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        placeholderTextColor={colors.gray[400]}
        returnKeyType="search"
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
          <X size={18} color={colors.gray[500]} />
        </TouchableOpacity>
      )}
      {showFilter && (
        <TouchableOpacity onPress={onFilterPress} style={styles.filterButton}>
          <Filter size={18} color={colors.gray[500]} />
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 2,
    shadowColor: colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  clearButton: {
    padding: 6,
    marginLeft: 4,
  },
  filterButton: {
    padding: 6,
    marginLeft: 8,
    borderLeftWidth: 1,
    borderLeftColor: colors.gray[200],
    paddingLeft: 12,
  },
});