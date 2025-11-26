import { Redirect } from 'expo-router';

export default function Index() {
  // Check if user is authenticated
  const isAuthenticated = false; // Replace with actual auth check
  
  if (isAuthenticated) {
    return <Redirect href="/(tabs)/shop" />;
  }
  
  return <Redirect href="/(auth)/login" />;
}