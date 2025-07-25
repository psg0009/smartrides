import React from 'react';
import { StyleSheet, Text, View, Image, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { LogOut, Settings, Star, Shield, CreditCard, HelpCircle, Bell } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useAuthStore } from '@/store/auth-store';
import Button from '@/components/Button';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  
  const handleLogin = () => {
    router.push('/auth/login');
  };
  
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: () => {
            logout();
          },
          style: 'destructive',
        },
      ]
    );
  };
  
  if (!isAuthenticated) {
    return (
      <View style={styles.authContainer}>
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' }} 
          style={styles.authImage} 
        />
        <Text style={styles.authTitle}>Create your account</Text>
        <Text style={styles.authDescription}>
          Join SmartRides to book rides, share trips, and save money on your airport transfers
        </Text>
        <Button 
          title="Login" 
          onPress={handleLogin}
          style={styles.authButton}
        />
        <TouchableOpacity onPress={() => router.push('/auth/signup')}>
          <Text style={styles.signupText}>Don't have an account? Sign up</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Image source={{ uri: user?.avatar }} style={styles.avatar} />
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.university}>{user?.university}</Text>
        <View style={styles.ratingContainer}>
          <Star size={16} color={colors.secondary} fill={colors.secondary} />
          <Text style={styles.rating}>{user?.rating.toFixed(1)}</Text>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
          <View style={styles.menuIconContainer}>
            <Settings size={20} color={colors.primary} />
          </View>
          <Text style={styles.menuText}>Account Settings</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
          <View style={styles.menuIconContainer}>
            <Shield size={20} color={colors.primary} />
          </View>
          <Text style={styles.menuText}>Verification Status</Text>
          {user?.verified && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
          <View style={styles.menuIconContainer}>
            <CreditCard size={20} color={colors.primary} />
          </View>
          <Text style={styles.menuText}>Payment Methods</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        
        <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
          <View style={styles.menuIconContainer}>
            <Bell size={20} color={colors.primary} />
          </View>
          <Text style={styles.menuText}>Notifications</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        
        <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
          <View style={styles.menuIconContainer}>
            <HelpCircle size={20} color={colors.primary} />
          </View>
          <Text style={styles.menuText}>Help Center</Text>
        </TouchableOpacity>
      </View>
      
      <Button
        title="Logout"
        variant="outline"
        leftIcon={<LogOut size={18} color={colors.primary} />}
        onPress={handleLogout}
        style={styles.logoutButton}
      />
      
      <Text style={styles.versionText}>SmartRides v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  header: {
    backgroundColor: colors.background,
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  university: {
    fontSize: 14,
    color: colors.gray[600],
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[100],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  rating: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginLeft: 4,
  },
  section: {
    backgroundColor: colors.background,
    marginTop: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.gray[100],
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[500],
    marginVertical: 8,
    paddingHorizontal: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuText: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  verifiedBadge: {
    backgroundColor: colors.success + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.success,
  },
  logoutButton: {
    marginHorizontal: 16,
    marginTop: 24,
  },
  versionText: {
    fontSize: 12,
    color: colors.gray[500],
    textAlign: 'center',
    marginVertical: 24,
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: colors.background,
  },
  authImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 24,
  },
  authTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  authDescription: {
    fontSize: 14,
    color: colors.gray[500],
    textAlign: 'center',
    marginBottom: 24,
    maxWidth: '80%',
  },
  authButton: {
    width: '80%',
    marginBottom: 16,
  },
  signupText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
});