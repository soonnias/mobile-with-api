import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "http://192.168.0.101:3000/patients";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
    async (config) => {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
);

// Отримання всіх пацієнтів
export const fetchPatients = async () => {
  try {
    const response = await axiosInstance.get("/");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error fetching patients");
  }
};

// Створення нового пацієнту
export const createPatients = async (patientsData) => {
  try {
    console.log("create patient api", patientsData);
    const response = await axiosInstance.post("/", patientsData);
    console.log("response patient api", response.data);
    return response.data;
  } catch (error) {
    console.log(error.response?.data?.message || "Error creating patients");
    throw new Error(error.response?.data?.message || "Error creating patient");
  }
};

// Отримання тесту за ІД
export const getPatientById = async (id) => {
  try {
    const response = await axiosInstance.get(`/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Error getting patient by ID"
    );
  }
};

// Пошук за номером
export const getPatientsByPhoneNumber = async (phoneNumber) => {
  try {
    const response = await axiosInstance.get(`/search/${phoneNumber}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Error getting patients by phine"
    );
  }
};
