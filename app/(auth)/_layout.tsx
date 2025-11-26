import { Stack } from 'expo-router';
import { Platform } from 'react-native';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#fff' },
        animation: 'fade',
        presentation: 'card',
      }}>
      <Stack.Screen 
        name="login"
        options={{
          headerShown: false,
          title: '',
          headerBackVisible: false,
        }}
      />
      <Stack.Screen 
        name="register"
        options={{
          headerShown: false,
          title: '',
          headerBackVisible: false,
        }}
      />
    </Stack>
  );
}