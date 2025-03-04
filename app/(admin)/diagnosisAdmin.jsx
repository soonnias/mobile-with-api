import React, { useEffect, useState } from "react";
import {View, Text, TextInput, Button, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "expo-router";
import { getAllDiagnosis } from "../../redux/actions/diagnosisAction";
import { Colors } from "../../constants/Colors";
import MaskInput from 'react-native-mask-input';

const DiagnosisScreen = () => {
    const dispatch = useDispatch();
    const router = useRouter();
    const { diagnosis, error } = useSelector((state) => state.diagnosis);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [dateError, setDateError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            await dispatch(getAllDiagnosis());
            setLoading(false);
        };
        fetchData();
    }, [dispatch]);

    useEffect(() => {
        if (error) {
            setErrorMessage(error);
        }
    }, [error]);

    useEffect(() => {
        if (startDate && endDate && new Date(startDate.split('.').reverse().join('-')) > new Date(endDate.split('.').reverse().join('-'))) {
            setDateError("Некоректний діапазон дат");
        } else {
            setDateError(null);
        }
    }, [startDate, endDate]);

    const filteredDiagnosis = diagnosis?.filter((diagnos) => {
        const fullName = `${diagnos.patientId.lastName} ${diagnos.patientId.firstName}`.toLowerCase();
        const diagnosisDate = new Date(diagnos.diagnosisDate);
        const start = startDate ? new Date(startDate.split('.').reverse().join('-')) : null;
        const end = endDate ? new Date(endDate.split('.').reverse().join('-')) : null;

        return (
            fullName.includes(searchTerm.toLowerCase()) &&
            (!start || diagnosisDate >= start) &&
            (!end || diagnosisDate <= end)
        );
    });

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Усі діагнози</Text>
            <TextInput
                style={styles.input}
                placeholder="Пошук за ім'ям або прізвищем"
                value={searchTerm}
                onChangeText={setSearchTerm}
            />
            <MaskInput
                style={styles.input}
                placeholder="Початкова дата (DD.MM.YYYY)"
                value={startDate}
                onChangeText={setStartDate}
                mask={[/\d/, /\d/, '.', /\d/, /\d/, '.', /\d/, /\d/, /\d/, /\d/]}
            />
            <MaskInput
                style={styles.input}
                placeholder="Кінцева дата (DD.MM.YYYY)"
                value={endDate}
                onChangeText={setEndDate}
                mask={[/\d/, /\d/, '.', /\d/, /\d/, '.', /\d/, /\d/, /\d/, /\d/]}
            />
            {dateError && <Text style={styles.error}>{dateError}</Text>}

            {loading ? (
                <ActivityIndicator size="large" color={Colors.light.primary} />
            ) : filteredDiagnosis && filteredDiagnosis.length > 0 ? (
                <FlatList
                    contentContainerStyle={{ paddingBottom: 80 }}
                    style={styles.flatList}
                    data={filteredDiagnosis}
                    keyExtractor={(item) => item._id}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>{item.patientId.lastName} {item.patientId.firstName}</Text>
                            <Text style={styles.cardSubtitle}>{item.diagnosisName}</Text>
                            <Text>{item.description}</Text>
                            <Text style={styles.date}>Діагноз поставлений: {new Date(item.diagnosisDate).toLocaleDateString("uk-UA")}</Text>
                            <TouchableOpacity
                                style={styles.button}
                                onPress={() => router.push(`/patientDetail/${item.patientId._id})`)}
                            >
                                <Text style={styles.buttonText}>Перейти до пацієнта</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                />
            ) : (
                <Text>Немає діагнозів за заданими фільтрами</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        alignItems: "center",
        justifyContent: "flex-start",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        padding: 8,
        marginBottom: 10,
        width: "100%",
    },
    error: {
        color: "red",
        marginBottom: 10,
    },
    card: {
        padding: 15,
        backgroundColor: "#f9f9f9",
        borderRadius: 8,
        marginBottom: 10,
        width: "100%",
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: "bold",
    },
    cardSubtitle: {
        fontSize: 16,
        fontWeight: "600",
    },
    date: {
        fontSize: 14,
        color: "gray",
    },
    button: {
        marginTop: 10,
        backgroundColor: Colors.light.primary,
        padding: 10,
        borderRadius: 5,
        alignItems: "center",
    },
    buttonText: {
        color: "white",
        fontWeight: "bold",
    },
    flatList: {
        width: "100%",
    }
});

export default DiagnosisScreen;