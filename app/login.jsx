import React, { useState, useEffect } from "react";
import {View, Text, TextInput, Button, StyleSheet, TouchableOpacity} from "react-native";
import { router } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthService } from "../api/authService";
import MaskInput from 'react-native-mask-input';
import {Colors} from "../constants/Colors"; // Імпортуйте компонент маски

export default function LoginScreen() {
    const [formData, setFormData] = useState({
        phoneNumber: "",
        password: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Створіть маску для номера телефону
    const phoneMask = ['+', '3', '8', '0', ' ', /\d/, /\d/, ' ', /\d/, /\d/, /\d/, ' ', /\d/, /\d/, ' ', /\d/, /\d/];

    const handleChange = (name, value) => {
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async () => {
        setError("");
        setLoading(true);

        const numbersOnly = formData.phoneNumber.replace(/\D/g, "");
        const isValid = numbersOnly.startsWith("380") && numbersOnly.length === 12;

        if (!isValid) {
            setError("Введіть коректний номер телефону формату +380 XX XXX XX XX");
            setLoading(false);
            return;
        }

        try {
            console.log("IN TRY CATCH");
            const response = await AuthService.login(formData);
            const user = await AuthService.getCurrentUser();

            const userRole = user?.role;
            const userId = user?._id;

            console.log(userId);
            console.log(userRole);

            if (userRole === "user" && userId) {
                await AsyncStorage.setItem("id", userId);
                router.push(`/(authenticated)/profile`);
            } else {
                router.push("/(authenticated)/profile");
            }
        } catch (error) {
            //console.error(error);
            setError("Сталася помилка при вході.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const navigateTo = async () => {
            try {
                const token = await AsyncStorage.getItem("token");

                if (token) {
                    const id = await AsyncStorage.getItem("id");
                    if (id) {
                        router.push(`/(authenticated)/profile`);
                    } else {
                        router.push("/(authenticated)/profile");
                    }
                }
            } catch (error) {
                console.error(error);
            }
        };

        navigateTo();
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Вхід</Text>

            {error && <Text style={styles.error}>{error}</Text>}

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Номер телефону</Text>
                {/* Замініть TextInput на MaskInput */}
                <MaskInput
                    style={styles.input}
                    value={formData.phoneNumber}
                    onChangeText={(masked, unmasked) => {
                        handleChange("phoneNumber", masked);
                    }}
                    mask={phoneMask}
                    keyboardType="phone-pad"
                    placeholder="+380 __ ___ __ __"
                    required
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Пароль</Text>
                <TextInput
                    style={styles.input}
                    value={formData.password}
                    onChangeText={(text) => handleChange("password", text)}
                    secureTextEntry
                    placeholder="Введіть пароль"
                    required
                />
            </View>

            <TouchableOpacity
                onPress={handleSubmit}
                disabled={loading}
                style={[styles.button, loading && styles.buttonDisabled]}
            >
                <Text style={styles.buttonText}>
                    {loading ? "Вхід..." : "Увійти"}
                </Text>
            </TouchableOpacity>

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 20,
    },
    inputGroup: {
        marginBottom: 15,
    },
    label: {
        fontSize: 16,
        marginBottom: 5,
    },
    input: {
        height: 50,
        borderColor: "#ccc",
        borderWidth: 1,
        borderRadius: 5,
        paddingLeft: 10,
        fontSize: 16,
    },
    error: {
        color: "red",
        marginBottom: 10,
        textAlign: "center",
    },
    button: {
        marginTop: 20,
        backgroundColor: Colors.light.primary,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
        width: '100%',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});