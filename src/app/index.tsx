import { Redirect } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

export default function Index() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  if (isAuthenticated) {
    return <Redirect href="/(main)/(tabs)/dashboard" />;
  }

  return <Redirect href="/(auth)/login" />;
}
