import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { getAllDiagnosisByPatientIdAction } from "../../redux/actions/diagnosisAction";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Card } from "react-native-paper";
import { Colors } from "../../constants/Colors";

const DiagnosesScreen = () => {
    const dispatch = useDispatch();
    const { diagnosis_by_patient, error } = useSelector((state) => state.diagnosis);
    const [loading, setLoading] = useState(true);
    const [patientId, setPatientId] = useState(null);

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
    }, []);

    // Завантажуємо діагнози після отримання patientId
    useEffect(() => {
        if (patientId) {
            const fetchData = async () => {
                try {
                    setLoading(true);
                    await dispatch(getAllDiagnosisByPatientIdAction(patientId));
                    setLoading(false);
                } catch (error) {
                    console.error('Error fetching diagnoses:', error);
                    setLoading(false);
                }
            };

            fetchData();
        }
    }, [dispatch, patientId]);

    if (loading) {
        return (
            <View style={styles.centeredContainer}>
                <ActivityIndicator size="large" color={Colors.light.primary} />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centeredContainer}>
                <Text style={styles.errorText}>Помилка: {error}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Діагнози</Text>
            {diagnosis_by_patient.length === 0 ? (
                <Text style={styles.emptyText}>Немає діагнозів для цього пацієнта</Text>
            ) : (
                <FlatList
                    data={diagnosis_by_patient}
                    keyExtractor={(item) => item._id}
                    renderItem={({ item }) => (
                        <Card style={styles.card}>
                            <Card.Content>
                                <Text style={styles.cardTitle}>{item.diagnosisName}</Text>
                                <Text style={styles.description}>{item.description}</Text>
                                <Text style={styles.date}>
                                    Діагноз поставлений: {new Date(item.diagnosisDate).toLocaleDateString("uk-UA")}
                                </Text>


                            </Card.Content>
                        </Card>
                    )}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: "#fff",
    },
    centeredContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
        color: "#333",
        textAlign: "center",
    },
    card: {
        width: "100%",
        marginBottom: 10,
        padding: 10,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: "bold",
    },
    description: {
        fontSize: 16,
        marginTop: 5,
    },
    date: {
        fontSize: 14,
        color: "gray",
        marginTop: 5,
    },
    emptyText: {
        textAlign: "center",
        fontSize: 16,
        marginTop: 20,
    },
    errorText: {
        color: "red",
        fontSize: 16,
        textAlign: "center",
    },
});

export default DiagnosesScreen;
