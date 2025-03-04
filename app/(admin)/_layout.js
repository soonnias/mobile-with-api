import React from 'react';
import {router, Tabs} from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {Text, TouchableOpacity, View} from "react-native";
import {Colors} from "../../constants/Colors";
import {AuthService} from "../../api/authService";

export default function AdminLayout() {
    console.log("Admin Layout Page");

    // Функція для виходу
    const handleLogout = async () => {
        await AuthService.logout();
        router.push('/login');
    };

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: Colors.light.primary, // Використовуємо з Colors
                tabBarInactiveTintColor: 'gray',
                headerStyle: {
                    backgroundColor: Colors.light.primary, // Фон заголовка
                },
                headerTitle: '',
                headerLeft: () => (
                    <View style={{ marginLeft: 15 }}>
                        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#fff' }}>
                            Med.ua
                        </Text>
                    </View>
                ),
                headerRight: () => (
                    <TouchableOpacity onPress={handleLogout} style={{ marginRight: 15 }}>
                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#fff' }}>
                            Вийти
                        </Text>
                    </TouchableOpacity>
                ),
            }}
        >
            {/* Hide the index route from the tab bar */}
            <Tabs.Screen
                name="index"
                options={{
                    href: null, // This prevents the tab from appearing
                }}
            />

            <Tabs.Screen
                name="patients"
                options={{
                    tabBarLabel: 'Пацієнти',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person" size={size} color={color} />
                    )
                }}
            />

            <Tabs.Screen
                name="diagnosisAdmin"
                options={{
                    tabBarLabel: 'Діагнози',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="medical" size={size} color={color} />
                    )
                }}
            />

            <Tabs.Screen
                name="testTypes"
                options={{
                    tabBarLabel: 'Типи тестів',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="hand-right-outline" size={size} color={color} />
                    )
                }}
            />

        </Tabs>
    );
}