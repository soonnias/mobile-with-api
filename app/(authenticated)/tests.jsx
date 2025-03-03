import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {View, Text, FlatList, StyleSheet, ActivityIndicator, Button, TouchableOpacity} from "react-native";
import {downloadMedicalTestFile, getMedicalTestsByPatientId} from "../../redux/actions/medicalTestAction";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Colors } from "../../constants/Colors";

const TestsScreen = () => {
    const dispatch = useDispatch();
    const { patientTests, error } = useSelector((state) => state.medicalTests);

    // Створюємо локальний стан для patientId та стан завантаження
    const [patientId, setPatientId] = useState(null);
    const [loading, setLoading] = useState(true);

    // Отримуємо patientId з AsyncStorage
    useEffect(() => {
        const fetchPatientId = async () => {
            try {
                const storedPatientId = await AsyncStorage.getItem("patientId");
                if (storedPatientId) {
                    setPatientId(storedPatientId);
                } else {
                    console.error("Patient ID not found in AsyncStorage");
                }
            } catch (error) {
                console.error("Error retrieving patientId:", error);
            }
        };

        fetchPatientId();
    }, []);  // Виконується один раз при завантаженні компоненту

    // Викликаємо fetchData тільки коли patientId отримано
    useEffect(() => {
        if (patientId) {
            const fetchData = async () => {
                try {
                    setLoading(true); // Встановлюємо loading в true перед завантаженням
                    await dispatch(getMedicalTestsByPatientId(patientId));
                    setLoading(false); // Встановлюємо loading в false після отримання даних
                } catch (error) {
                    console.error('Error fetching medical tests:', error);
                    setLoading(false);
                }
            };

            fetchData();  // Викликаємо асинхронну функцію
        }
    }, [dispatch, patientId]);  // Залежність від patientId

    // Завантаження файлу тесту
    const handleDownload = async (testId) => {
        try {
            await dispatch(downloadMedicalTestFile(testId)); // викликаємо дію для завантаження файлу
        } catch (error) {
            console.error('Error downloading file:', error);
        }
    };

    if (loading) {
        return (
            <View style={styles.centeredContainer}>
                <ActivityIndicator size="large" color={Colors.light.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Медичні тести</Text>
            {error && <Text style={styles.error}>{error}</Text>}
            {patientTests.length === 0 ? (
                <Text style={styles.noTests}>Немає тестів для цього пацієнта.</Text>
            ) : (
                <FlatList
                    data={patientTests}
                    keyExtractor={(item) => item._id}
                    renderItem={({ item }) => (
                        <View style={styles.testItem}>
                            <Text style={styles.testTitle}>{item.testTypeId?.name}</Text>
                            <Text style={styles.testDate}>{new Date(item.testDate).toLocaleDateString("uk-UA")}</Text>
                            <Text><Text style={styles.label}>Статус:</Text> {item.status}</Text>
                            <Text><Text style={styles.label}>Результат:</Text> {item.result}</Text>
                            <Text><Text style={styles.label}>Рекомендації:</Text> {item.recommendations || "Немає"}</Text>

                            {/* Кнопка для завантаження файлу, якщо файл існує */}
                            {item.filePath ? (
                                <TouchableOpacity onPress={() => handleDownload(item._id)} style={styles.button}>
                                    <Text style={styles.buttonText}>Завантажити файл</Text>
                                </TouchableOpacity>
                            ) : (
                                <Text style={styles.noFile}>Немає файлу</Text>
                            )}
                        </View>
                    )}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    centeredContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    container: {
        flex: 1,
        padding: 16,
        alignItems: 'center',
        width: '100%',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
    error: {
        color: "red",
        marginBottom: 10,
    },
    noTests: {
        fontSize: 16,
        textAlign: "center",
        marginTop: 20,
    },
    testItem: {
        backgroundColor: "#f9f9f9",
        padding: 12,
        marginVertical: 6,
        borderRadius: 8,
        alignSelf: 'stretch',
        width: '100%',
    },
    testTitle: {
        fontSize: 18,
        fontWeight: "bold",
    },
    testDate: {
        fontSize: 14,
        color: "gray",
        marginBottom: 6,
    },
    label: {
        fontWeight: "bold",
    },
    noFile: {
        color: "gray",
        fontStyle: "italic",
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

export default TestsScreen;

