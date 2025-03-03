import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "http://192.168.0.101:3000/auth/";

export const AuthService = {
  register: async (userData) => {
    try {
      const response = await axios.post(API_URL + "register", userData);
      if (response.data.token) {
        await AsyncStorage.setItem("token", response.data.token);
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Something went wrong" };
    }
  },

  login: async (credentials) => {
    try {
      console.log(credentials);
      const response = await axios.post(API_URL + "login", credentials);
      if (response.data.token) {
        await AsyncStorage.setItem("token", response.data.token);
        console.log("Login successful token");
      }
      console.log("Login successful");
      return response.data;
    } catch (error) {
      console.log(error.response?.data);
      throw { message: `Не існує користувача з такими даними` };
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("patientId");
  },

  getCurrentToken: async () => {
    return await AsyncStorage.getItem("token");
  },

  getCurrentUser: async () => {
    try {

      console.log("Get current user");
      const token = await AsyncStorage.getItem("token");
      console.log(token);
      if (!token) {
        throw { message: "No token found" };
      }

      const response = await axios.get(API_URL + "me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      //console.log("RESPONSE", response.data);

      await AsyncStorage.setItem("patientId", response.data._id);

      return response.data;
    } catch (error) {
      console.log("ERROR");
      throw error.response?.data || { message: "Something went wrong" };
    }
  },
};
