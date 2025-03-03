import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {Text, View} from "react-native";
import {Colors} from "../../constants/Colors";

export default function AuthenticatedLayout() {
    console.log("Authenticated Layout Page");
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
                name="diagnosis"
                options={{
                    tabBarLabel: 'Діагнози',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="medical" size={size} color={color} />
                    )
                }}
            />
            <Tabs.Screen
                name="tests"
                options={{
                    tabBarLabel: 'Тести',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="list" size={size} color={color} />
                    )
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    tabBarLabel: 'Профіль',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person" size={size} color={color} />
                    )
                }}
            />
        </Tabs>
    );
}