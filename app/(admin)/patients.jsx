import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, TextInput, View, Text, Modal, Alert, TouchableOpacity, ActivityIndicator, FlatList } from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { Colors } from "../../constants/Colors";
import {createPatientAction, getAllPatients} from "../../redux/actions/patientActions";
import MaskInput from "react-native-mask-input";
import { StyleSheet } from "react-native";


const PatientsScreen = () => {
    const dispatch = useDispatch();
    const { patients, error } = useSelector((state) => state.patients);
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [currentPatient, setCurrentPatient] = useState({
        lastName: "",
        firstName: "",
        birthDate: "",
        phoneNumber: "",
        email: "",
        password: "",
    });
    const [errors, setErrors] = useState({
        lastName: "",
        firstName: "",
        birthDate: "",
        email: "",
        phoneNumber: "",
        password: "",
        submit: "",
    });
    const [loading, setLoading] = useState(true);

    const [filteredPatients, setFilteredPatients] = useState([]);
    const phoneMask = ['+', '3', '8', '0', ' ', /\d/, /\d/, ' ', /\d/, /\d/, /\d/, ' ', /\d/, /\d/, ' ', /\d/, /\d/];

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            await dispatch(getAllPatients());
            setLoading(false);
        };

        fetchData();
    }, [dispatch]);

    // Відстеження помилок з Redux store
    useEffect(() => {
        if (error) {
            setErrors(prev => ({
                ...prev,
                submit: error
            }));
        }
    }, [error]);

    useEffect(() => {
        setFilteredPatients(
            patients.filter((patient) =>
                patient.phoneNumber.replace(/\s/g, "").includes(search.trim().replace(/\s/g, ""))
            )
        );
    }, [patients, search]);

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validateBirthDate = (date) => {
        const dateRegex = /^\d{2}\.\d{2}\.\d{4}$/;
        if (!dateRegex.test(date)) return false;

        const [day, month, year] = date.split('.');
        const birthDate = new Date(year, month - 1, day);
        const today = new Date();

        if (isNaN(birthDate.getTime())) return false;
        return birthDate <= today;
    };

    const validateForm = () => {
        let isValid = true;
        const newErrors = {
            lastName: "",
            firstName: "",
            birthDate: "",
            email: "",
            phoneNumber: "",
            password: "",
            submit: "",
        };

        // Перевірка прізвища
        if (!currentPatient.lastName.trim()) {
            newErrors.lastName = "Прізвище обов'язкове";
            isValid = false;
        }

        // Перевірка імені
        if (!currentPatient.firstName.trim()) {
            newErrors.firstName = "Ім'я обов'язкове";
            isValid = false;
        }

        // Перевірка дати народження
        if (!currentPatient.birthDate.trim()) {
            newErrors.birthDate = "Дата народження обов'язкова";
            isValid = false;
        } else if (!validateBirthDate(currentPatient.birthDate)) {
            newErrors.birthDate = "Введіть коректну дату народження у форматі ДД.ММ.РРРР";
            isValid = false;
        }

        // Перевірка телефону
        const rawPhone = currentPatient.phoneNumber.replace(/\s/g, "");
        const isValidPhone = rawPhone.startsWith("+380") && rawPhone.length === 13;
        if (!currentPatient.phoneNumber.trim()) {
            newErrors.phoneNumber = "Номер телефону обов'язковий";
            isValid = false;
        } else if (!isValidPhone) {
            newErrors.phoneNumber = "Введіть коректний номер телефону формату +380 XX XXX XX XX";
            isValid = false;
        }

        // Перевірка електронної пошти
        if (!currentPatient.email.trim()) {
            newErrors.email = "Email обов'язковий";
            isValid = false;
        } else if (!validateEmail(currentPatient.email)) {
            newErrors.email = "Введіть коректну email адресу";
            isValid = false;
        }

        // Перевірка пароля
        if (!currentPatient.password.trim()) {
            newErrors.password = "Пароль обов'язковий";
            isValid = false;
        } else if (currentPatient.password.length < 6) {
            newErrors.password = "Пароль має бути не менше 6 символів";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleChange = (name, value) => {
        setCurrentPatient((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Очищення помилки для поля, яке редагується
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: "",
                submit: "",
            }));
        }
    };

    const handlePhoneChange = (maskedValue, rawValue) => {
        setCurrentPatient((prev) => ({
            ...prev,
            phoneNumber: maskedValue,
        }));

        // Очищення помилки для телефону, якщо він редагується
        if (errors.phoneNumber) {
            setErrors((prev) => ({
                ...prev,
                phoneNumber: "",
                submit: "",
            }));
        }
    };

    const handleSearch = (value) => {
        setSearch(value);
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        setLoading(true);

        // Очищаємо будь-які попередні помилки
        dispatch({ type: "CLEAR_ERROR" });

        try {
            // Замість використання dispatch безпосередньо,
            // можемо викликати createPatientAction з промісом для кращого контролю
            const result = await Promise.resolve(dispatch(createPatientAction(currentPatient))).catch(e => {
                console.log("Caught error in Promise.resolve:", e);
                throw e; // Це дозволить catch блоку зловити помилку
            });

            // Перевіряємо, чи була помилка в результаті (різні Redux бібліотеки можуть відрізнятися)
            if (result && result.error) {
                throw new Error(result.error);
            }

            // Якщо успішно, оновлюємо стан
            setShowModal(false);
            dispatch(getAllPatients());
            setCurrentPatient({
                lastName: "",
                firstName: "",
                birthDate: "",
                phoneNumber: "",
                email: "",
                password: "",
            });
            setErrors({
                lastName: "",
                firstName: "",
                birthDate: "",
                email: "",
                phoneNumber: "",
                password: "",
                submit: "",
            });
        } catch (error) {
            console.log("Caught error in handleSubmit:", error);
            setErrors((prev) => ({
                ...prev,
                submit: "Помилка при реєстрації, телефон або пошта вже існують",
            }));
            // Не закриваємо модальне вікно у випадку помилки
        } finally {
            setLoading(false);
        }
    };

    const handleErrorClose = () => {
        dispatch({ type: "CLEAR_ERROR" });
    };

    const handleCloseModal = () => {
        // Очищення стану в Redux
        dispatch({ type: "CLEAR_ERROR" });

        setCurrentPatient({
            lastName: "",
            firstName: "",
            birthDate: "",
            phoneNumber: "",
            email: "",
            password: "",
        });

        setShowModal(false);
        setErrors({
            lastName: "",
            firstName: "",
            birthDate: "",
            email: "",
            phoneNumber: "",
            password: "",
            submit: "",
        });
    };

    const handleNavigate = (id) => {
        console.log("Navigate to patient detail with ID:", id);
    };

    const isFormValid = () => {
        return (
            currentPatient.lastName.trim() !== "" &&
            currentPatient.firstName.trim() !== "" &&
            currentPatient.birthDate.trim() !== "" &&
            currentPatient.phoneNumber.trim() !== "" &&
            currentPatient.email.trim() !== "" &&
            currentPatient.password.trim() !== "" &&
            errors.lastName === "" &&
            errors.firstName === "" &&
            errors.birthDate === "" &&
            errors.phoneNumber === "" &&
            errors.email === "" &&
            errors.password === ""
        );
    };

    return (
        <View style={{ padding: 20 }}>
            <Text style={styles.title}>Пацієнти</Text>
            {error && (
                <Alert variant="danger" onClose={handleErrorClose} dismissible>
                    {error}
                </Alert>
            )}
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 15 }}>
                <TextInput
                    style={styles.input}
                    placeholder="Пошук за номером..."
                    value={search}
                    onChangeText={handleSearch}
                    editable={!loading}
                />

                {
                    /*
                    <TouchableOpacity
                    onPress={() => setShowModal(true)}
                    disabled={loading}
                    style={{
                        backgroundColor: loading ? "#ccc" : Colors.light.primary,
                        padding: 10,
                        borderRadius: 5,
                        alignItems: "center",
                        marginLeft: 10,
                        justifyContent: "center",
                    }}
                >
                    <Text style={{ color: "#fff", fontWeight: "bold" }}>Додати</Text>
                </TouchableOpacity>
                    * */
                }

            </View>

            {loading ? (
                <ActivityIndicator size="large" color={Colors.light.primary} />
            )  : filteredPatients.length === 0 ? (
                <Text style={{ textAlign: "center", fontSize: 18, marginTop: 20 }}>
                    Немає пацієнтів за даним номером
                </Text>
            ) : (
                <FlatList
                    contentContainerStyle={{ paddingBottom: 80 }}
                    data={filteredPatients}
                    keyExtractor={(item) => item._id.toString()}
                    renderItem={({ item }) => (
                        <View style={{ marginBottom: 15 }}>
                            <View style={{ padding: 15, borderWidth: 1, borderColor: "#ccc", borderRadius: 5 }}>
                                <Text style={{ fontWeight: 'bold', fontSize: 20 }}>
                                    {item.lastName} {item.firstName}
                                </Text>

                                <Text>
                                    <Text style={{ fontWeight: 'bold' }}>Дата народження:</Text> {new Date(item.birthDate).toLocaleDateString("uk-UA")}
                                </Text>
                                <Text>
                                    <Text style={{ fontWeight: 'bold' }}>Телефон:</Text> {item.phoneNumber}
                                </Text>
                                <Text>
                                    <Text style={{ fontWeight: 'bold' }}>Email:</Text> {item.email}
                                </Text>

                                <TouchableOpacity
                                    onPress={() => handleNavigate(item._id)}
                                    style={{
                                        backgroundColor: Colors.light.primary,
                                        padding: 10,
                                        borderRadius: 5,
                                        alignItems: "center",
                                        marginTop: 10,
                                    }}
                                >
                                    <Text style={{ color: "#fff", fontWeight: "bold" }}>Детальніше</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                />
            )}

            <Modal visible={showModal} onRequestClose={handleCloseModal} animationType="slide">
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.title}>Додати пацієнта</Text>
                            <TouchableOpacity style={styles.closeButton} onPress={handleCloseModal}>
                                <Text style={styles.closeButtonText}>×</Text>
                            </TouchableOpacity>
                        </View>

                        {errors.submit && (
                            <View style={styles.errorContainer}>
                                <Text style={styles.errorText}>{errors.submit}</Text>
                            </View>
                        )}

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Прізвище *</Text>
                            <TextInput
                                style={[styles.input, errors.lastName ? styles.inputError : null]}
                                placeholder="Введіть прізвище"
                                value={currentPatient.lastName}
                                onChangeText={(value) => handleChange("lastName", value)}
                            />
                            {errors.lastName ? <Text style={styles.errorText}>{errors.lastName}</Text> : null}
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Ім'я *</Text>
                            <TextInput
                                style={[styles.input, errors.firstName ? styles.inputError : null]}
                                placeholder="Введіть ім'я"
                                value={currentPatient.firstName}
                                onChangeText={(value) => handleChange("firstName", value)}
                            />
                            {errors.firstName ? <Text style={styles.errorText}>{errors.firstName}</Text> : null}
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Дата народження * (ДД.ММ.РРРР)</Text>
                            <TextInput
                                style={[styles.input, errors.birthDate ? styles.inputError : null]}
                                placeholder="ДД.ММ.РРРР"
                                value={currentPatient.birthDate}
                                onChangeText={(value) => handleChange("birthDate", value)}
                                keyboardType="numbers-and-punctuation"
                            />
                            {errors.birthDate ? <Text style={styles.errorText}>{errors.birthDate}</Text> : null}
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Телефон *</Text>
                            <MaskInput
                                style={[styles.input, errors.phoneNumber ? styles.inputError : null]}
                                mask={phoneMask}
                                placeholder="+380 XX XXX XX XX"
                                value={currentPatient.phoneNumber}
                                onChangeText={handlePhoneChange}
                                keyboardType="phone-pad"
                            />
                            {errors.phoneNumber ? <Text style={styles.errorText}>{errors.phoneNumber}</Text> : null}
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Email *</Text>
                            <TextInput
                                style={[styles.input, errors.email ? styles.inputError : null]}
                                placeholder="example@mail.com"
                                value={currentPatient.email}
                                onChangeText={(value) => handleChange("email", value)}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                            {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Пароль *</Text>
                            <TextInput
                                style={[styles.input, errors.password ? styles.inputError : null]}
                                placeholder="Введіть пароль"
                                value={currentPatient.password}
                                onChangeText={(value) => handleChange("password", value)}
                                secureTextEntry
                            />
                            {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
                        </View>

                        <TouchableOpacity
                            onPress={handleSubmit}
                            disabled={loading || !isFormValid()}
                            style={[
                                styles.submitButton,
                                (loading || !isFormValid()) ? styles.disabledButton : null
                            ]}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={styles.submitButtonText}>Зареєструвати</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
        color: "#333",
        textAlign: "center",
    },
    modalContent: {
        width: "90%",
        maxHeight: "90%",
        backgroundColor: "white",
        borderRadius: 10,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0",
        paddingBottom: 10,
    },

    closeButton: {
        padding: 5,
    },
    closeButtonText: {
        fontSize: 24,
        fontWeight: "bold",
    },
    formGroup: {
        marginBottom: 15,
    },
    label: {
        fontSize: 16,
        marginBottom: 5,
        fontWeight: "500",
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        padding: 8,
        marginBottom: 10,
        width: "100%",
    },
    inputError: {
        borderColor: "red",
    },
    errorContainer: {
        backgroundColor: "#ffebee",
        padding: 10,
        borderRadius: 5,
        marginBottom: 15,
        borderLeftWidth: 4,
        borderLeftColor: "red",
    },
    errorText: {
        color: "red",
        fontSize: 14,
        marginTop: 5,
    },
    submitButton: {
        backgroundColor: Colors.light.primary,
        padding: 15,
        borderRadius: 5,
        alignItems: "center",
        marginTop: 10,
    },
    disabledButton: {
        backgroundColor: "#cccccc",
    },
    submitButtonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
});

export default PatientsScreen;