import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { AuthService } from "../../api/authService";
import { useRouter } from "expo-router";
import { Colors } from "../../constants/Colors";

const ProfileScreen = () => {
    const router = useRouter();
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            const user = await AuthService.getCurrentUser();
            if (user) {
                setCurrentUser(user);
            }
            setLoading(false);

        };

        fetchUser();

    }, []);

    const handleLogout = async () => {
        await AuthService.logout();
        router.push('/login');
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color={Colors.light.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Профіль</Text>
            {currentUser ? (
                <>
                    <View style={styles.infoContainer}>
                        <Text style={styles.label}>Ім'я:</Text>
                        <Text style={styles.value}>{currentUser.firstName}</Text>
                    </View>
                    <View style={styles.infoContainer}>
                        <Text style={styles.label}>Прізвище:</Text>
                        <Text style={styles.value}>{currentUser.lastName}</Text>
                    </View>
                    <View style={styles.infoContainer}>
                        <Text style={styles.label}>Email:</Text>
                        <Text style={styles.value}>{currentUser.email}</Text>
                    </View>
                    <View style={styles.infoContainer}>
                        <Text style={styles.label}>Дата народження:</Text>
                        <Text style={styles.value}>
                            {new Date(currentUser.birthDate).toLocaleDateString('uk-UA')}
                        </Text>
                    </View>
                    <View style={styles.infoContainer}>
                        <Text style={styles.label}>Телефон:</Text>
                        <Text style={styles.value}>{currentUser.phoneNumber}</Text>
                    </View>
                </>
            ) : (
                <Text style={styles.errorText}>Користувач не знайдений</Text>
            )}

            {/* Використовуємо TouchableOpacity для кастомного стилю */}
            <TouchableOpacity onPress={handleLogout} style={styles.button}>
                <Text style={styles.buttonText}>Вийти з профілю</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "flex-start",
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
    infoContainer: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#555',
    },
    value: {
        fontSize: 16,
        color: '#000',
    },
    errorText: {
        fontSize: 16,
        color: 'red',
        marginTop: 20,
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

export default ProfileScreen;
