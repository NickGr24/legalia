import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useSupabaseConnection } from '../hooks/useSupabaseData';
import { colors } from '../utils/colors';
import { spacing, borderRadius, fontSize } from '../utils/styles';

export const AuthDebugPanel: React.FC = () => {
  const { user, session } = useAuth();
  const { connected, testConnection } = useSupabaseConnection();
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    await testConnection();
    setIsTestingConnection(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔐 Supabase Debug Panel</Text>
      
      <View style={styles.section}>
        <Text style={styles.label}>User Authentication:</Text>
        <Text style={styles.value}>
          {user ? `✅ ${user.email}` : '❌ Not logged in'}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Session Status:</Text>
        <Text style={styles.value}>
          {session ? `✅ Active session` : '❌ No session'}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Database Connection:</Text>
        <Text style={styles.value}>
          {connected === null ? '⏳ Testing...' : connected ? '✅ Connected' : '❌ Connection failed'}
        </Text>
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity 
          style={styles.button} 
          onPress={handleTestConnection} 
          disabled={isTestingConnection}
        >
          <Text style={styles.buttonText}>
            {isTestingConnection ? 'Testing...' : 'Test Connection'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    margin: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  section: {
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: 'bold',
    color: colors.text.secondary,
  },
  value: {
    fontSize: fontSize.sm,
    color: colors.text.primary,
    marginTop: spacing.xs,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  button: {
    backgroundColor: colors.primary.main,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    alignItems: 'center',
    minWidth: 120,
  },
  buttonText: {
    color: 'white',
    fontSize: fontSize.sm,
    fontWeight: 'bold',
  },
});