import React from 'react';
import { 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps
} from 'react-native';
import { colors } from '@/constants/colors';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export default function Button({
  title,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  style,
  textStyle,
  leftIcon,
  rightIcon,
  ...props
}: ButtonProps) {
  const getContainerStyle = () => {
    switch (variant) {
      case 'primary':
        return styles.primaryContainer;
      case 'secondary':
        return styles.secondaryContainer;
      case 'outline':
        return styles.outlineContainer;
      case 'ghost':
        return styles.ghostContainer;
      default:
        return styles.primaryContainer;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'primary':
        return styles.primaryText;
      case 'secondary':
        return styles.secondaryText;
      case 'outline':
        return styles.outlineText;
      case 'ghost':
        return styles.ghostText;
      default:
        return styles.primaryText;
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'sm':
        return styles.smallContainer;
      case 'md':
        return styles.mediumContainer;
      case 'lg':
        return styles.largeContainer;
      default:
        return styles.mediumContainer;
    }
  };

  const getTextSizeStyle = () => {
    switch (size) {
      case 'sm':
        return styles.smallText;
      case 'md':
        return styles.mediumText;
      case 'lg':
        return styles.largeText;
      default:
        return styles.mediumText;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        getContainerStyle(),
        getSizeStyle(),
        isLoading && styles.disabledContainer,
        style,
      ]}
      disabled={isLoading || props.disabled}
      activeOpacity={0.7}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator 
          color={variant === 'primary' ? colors.background : colors.primary} 
          size="small" 
        />
      ) : (
        <>
          {leftIcon}
          <Text
            style={[
              styles.text,
              getTextStyle(),
              getTextSizeStyle(),
              leftIcon && { marginLeft: 8 },
              rightIcon && { marginRight: 8 },
              textStyle,
            ]}
          >
            {title}
          </Text>
          {rightIcon}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    minHeight: 44,
  },
  text: {
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  // Variants
  primaryContainer: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryText: {
    color: colors.background,
  },
  secondaryContainer: {
    backgroundColor: colors.secondary,
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  secondaryText: {
    color: colors.background,
  },
  outlineContainer: {
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.primary,
    shadowColor: colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  outlineText: {
    color: colors.primary,
  },
  ghostContainer: {
    backgroundColor: 'transparent',
  },
  ghostText: {
    color: colors.primary,
  },
  // Sizes
  smallContainer: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  smallText: {
    fontSize: 12,
  },
  mediumContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  mediumText: {
    fontSize: 14,
  },
  largeContainer: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  largeText: {
    fontSize: 16,
  },
  // States
  disabledContainer: {
    opacity: 0.6,
  },
});