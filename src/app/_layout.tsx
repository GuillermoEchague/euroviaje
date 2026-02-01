import { useEffect, useState } from 'react';
import { Provider, useDispatch } from 'react-redux';
import { Stack } from 'expo-router';
import { store } from '../store';
import { initDatabase } from '../infrastructure/database/sqlite';
import '../i18n';
import { View, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SettingsRepository } from '../infrastructure/database/repositories/SettingsRepository';
import { setSettings } from '../store/slices/settingsSlice';

function AppInitializer({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const setup = async () => {
      try {
        await initDatabase();

        // Load settings
        const settings = await SettingsRepository.getAll();
        if (Object.keys(settings).length > 0) {
          dispatch(setSettings({
            exchangeRate: parseFloat(settings.exchangeRate) || 1000,
            tripStartDate: settings.tripStartDate || null,
            initialBudgetEur: parseFloat(settings.initialBudgetEur) || 0,
          }));
        }

        setReady(true);
      } catch (error) {
        console.error('Error initializing app:', error);
      }
    };
    setup();
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <AppInitializer>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(main)" options={{ headerShown: false }} />
            <Stack.Screen name="index" options={{ headerShown: false }} />
          </Stack>
        </AppInitializer>
      </Provider>
    </GestureHandlerRootView>
  );
}
