import React, { useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts } from 'expo-font';
import { ThemeProvider } from '@react-navigation/native';
import { DefaultTheme, DarkTheme } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';
import { Provider } from 'react-redux';
import store from "@/redux/store";  // Імпорт Provider

import { router } from "expo-router";


export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        setIsAuthenticated(token !== null && token !== undefined);
      } catch (error) {
        console.error('Помилка при перевірці автентифікації:', error);
        await AsyncStorage.removeItem('token');
        router.push("/login");
        setIsAuthenticated(false);
      } finally {
        setAuthChecked(true);
      }
    };

    checkAuthStatus();
  }, []);

  /*const clearStorage = async () => {
      try {
          await AsyncStorage.clear();
          console.log("AsyncStorage очищено");
          router.push("/login")
      } catch (error) {
          console.error("Помилка при очищенні AsyncStorage:", error);
      }
  };

  // Виклик функції
  clearStorage();*/

  useEffect(() => {
    if (loaded && authChecked) {
      SplashScreen.hideAsync();
    }
  }, [loaded, authChecked]);

  if (!loaded || !authChecked) {
    return null;
  }

  console.log('isAuthenticated:', isAuthenticated);

  return (
      <Provider store={store}>  {/* Обгортаємо весь додаток в Provider */}
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack screenOptions={{ headerShown: false }}>
            {isAuthenticated ? (
                <Stack.Screen name="(authenticated)" options={{ headerShown: false }} />
            ) : (
                <Stack.Screen name="login" options={{ headerShown: false }} />
            )}

            <Stack.Screen name="+not-found" options={{ title: 'Oops!' }} />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </Provider>
  );
}
