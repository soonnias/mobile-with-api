import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TextInput,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Modal,
    Button,
    StyleSheet
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "expo-router";
import {
    clearError,
    createTestTypeAction,
    deleteTestTypeAction,
    getTestTypes,
    updateTestTypeAction
} from "../../redux/actions/testTypeActions";
import {Colors} from "../../constants/Colors";


const TestTypesScreen = () => {
    const dispatch = useDispatch();
    const router = useRouter();
    const { testTypes, error } = useSelector((state) => state.testType);
    const [search, setSearch] = useState("");
    const [modalVisible, setModalVisible] = useState(false);
    const [currentTestType, setCurrentTestType] = useState({ name: "" });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            await dispatch(getTestTypes());
            setLoading(false);
        };
        fetchData();
        if (error === "Unauthorized") {
            dispatch(clearError());
        }
    }, [dispatch]);

    useEffect(() => {
        if (error) {
            Alert.alert("Помилка", error);

            const timer = setTimeout(() => {
                dispatch(clearError());
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [error, dispatch]);

    const handleSave = () => {
        if (currentTestType._id) {
            dispatch(updateTestTypeAction(currentTestType._id, currentTestType));
        } else {
            dispatch(createTestTypeAction(currentTestType));
        }
        setModalVisible(false);
        setCurrentTestType({ name: "" });
    };

    const handleDelete = (id) => {
        Alert.alert("Підтвердження", "Ви впевнені, що хочете видалити цей тип тесту?", [
            { text: "Скасувати", style: "cancel" },
            { text: "Видалити", onPress: () => dispatch(deleteTestTypeAction(id)) }
        ]);
    };

    const filteredTestTypes = !loading
        ? testTypes.filter((type) => type.name && type.name.toLowerCase().includes(search.toLowerCase()))
        : [];

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Типи тестів</Text>
            {/*error && <Text style={styles.error}>{error}</Text>*/}

            <TextInput
                placeholder="Пошук..."
                value={search}
                onChangeText={setSearch}
                style={styles.input}
            />

            <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addButton}>
                <Text style={styles.buttonText}>Додати</Text>
            </TouchableOpacity>

            {loading ? (
                <ActivityIndicator size="large" color={Colors.light.primary} />
            ) : filteredTestTypes.length === 0 ? (
                <Text style={styles.noResultsText}>Нічого не знайдено</Text>
            ) : (
                <FlatList
                    data={filteredTestTypes}
                    keyExtractor={(item) => item._id}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <Text style={styles.cardText}>{item.name}</Text>
                            <View style={styles.cardButtons}>
                                <TouchableOpacity onPress={() => { setCurrentTestType(item); setModalVisible(true); }}>
                                    <Text style={styles.editButton}>Редагувати</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handleDelete(item._id)}>
                                    <Text style={styles.deleteButton}>Видалити</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => router.push(`/medical-tests/${item._id}`)}>
                                    <Text style={styles.detailButton}>Детальніше</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                />
            )}


            <Modal visible={modalVisible} animationType="fade" transparent>
                <View style={styles.modalBackground}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalHeader}>{currentTestType._id ? "Редагувати" : "Додати"} тип тесту</Text>
                        <TextInput
                            placeholder="Назва"
                            value={currentTestType.name}
                            onChangeText={(text) => setCurrentTestType({ ...currentTestType, name: text })}
                            style={styles.input}
                        />
                        <View style={styles.modalButtons}>
                            <Button title="Скасувати" onPress={() => setModalVisible(false)} color="gray" />
                            <Button title="Зберегти" onPress={handleSave} color={Colors.light.primary} />
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    header: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
    error: { color: "red" },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
        color: "#333",
        textAlign: "center",
    },
    input: {
    borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        padding: 8,
        marginBottom: 10,
        width: "100%",
    }  ,
    addButton: { backgroundColor: Colors.light.primary, padding: 10, borderRadius: 5, marginBottom: 10 },
    buttonText: { color: "white", textAlign: "center" },
    card: { padding: 15, borderRadius: 10, backgroundColor: "white", marginBottom: 10, shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 5, elevation: 3 },
    cardText: { fontSize: 18, fontWeight: "bold" },
    cardButtons: { flexDirection: "row", justifyContent: "space-between", marginTop: 5 },
    editButton: { color: Colors.light.primary },
    deleteButton: { color: "red" },
    detailButton: { color: "green" },
    modalBackground: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
    modalContainer: { width: "80%", backgroundColor: "white", padding: 20, borderRadius: 10, elevation: 5 },
    modalHeader: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
    modalButtons: { flexDirection: "row", justifyContent: "space-between", marginTop: 20 },
    noResultsText: {
        textAlign: "center",
        fontSize: 18,
        color: "gray",
        marginTop: 20,
    },
});

export default TestTypesScreen;