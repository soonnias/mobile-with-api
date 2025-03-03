import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import { Platform, Alert } from 'react-native';

const BASE_URL = "http://192.168.0.101:3000/medical-tests";

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

// Отримання всіх тестів
export const fetchMedicalTests = async () => {
  try {
    const response = await axiosInstance.get("/");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error fetching tests");
  }
};

// Отримання тесту за ID
export const getTestById = async (id) => {
  try {
    const response = await axiosInstance.get(`/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Error fetching test by ID"
    );
  }
};

// Отримання тестів за ID пацієнта
export const getTestsByPatientId = async (userId) => {
  try {
    console.log("getting medical tests API", userId);
    const response = await axiosInstance.get(`/patient/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Error fetching tests by patient ID"
    );
  }
};

// Створення нового медичного тесту
export const createMedicalTest = async (testData) => {
  try {
    const response = await axiosInstance.post("/", testData);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Error creating medical test"
    );
  }
};

export const updateMedicalTest = async (id, updateData) => {
  try {
    // Лог перед відправкою
    /*console.log("FormData перед відправкою:", updateData);
    for (let pair of updateData.entries()) {
      console.log(pair[0], pair[1]);
    }*/

    // Відправляємо `updateData` напряму
    const response = await axiosInstance.patch(`/${id}`, updateData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("Відповідь сервера:", response.data);
    return response.data;
  } catch (error) {
    console.error("Помилка оновлення тесту:", error);
    throw new Error(
      error.response?.data?.message || "Помилка оновлення медичного тесту"
    );
  }
};

// Видалення медичного тесту
export const deleteMedicalTest = async (id) => {
  try {
    const response = await axiosInstance.delete(`/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Error deleting medical test"
    );
  }
};



export const downloadTestFile = async (id) => {
  try {
    // Отримуємо дані з сервера
    const response = await axiosInstance.get(`/${id}/download`, {
      responseType: 'blob',
    });

    // Отримуємо ім'я файлу з заголовків відповіді з безпечним декодуванням
    const contentDisposition = response.headers['content-disposition'];
    let fileName = 'download';

    if (contentDisposition) {
      try {
        const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
        if (fileNameMatch && fileNameMatch.length === 2) {
          // Безпечне декодування з обробкою помилок
          fileName = safeDecodeFileName(fileNameMatch[1]);
        }
      } catch (e) {
        console.warn('Помилка при декодуванні імені файлу:', e);
        // Використовуємо ім'я за замовчуванням з додаванням розширення
        const mimeType = response.headers['content-type'] || 'application/octet-stream';
        fileName = getDefaultFileName(mimeType);
      }
    }

    // Очищення імені файлу від недопустимих символів
    fileName = sanitizeFileName(fileName);

    // Отримуємо MIME-тип файлу
    const mimeType = response.headers['content-type'] || 'application/octet-stream';

    // Створюємо тимчасовий файл у кеші Expo
    const fileUri = FileSystem.cacheDirectory + fileName;

    // Перетворюємо дані у формат, який можна зберегти
    const blobData = response.data;
    const base64Data = await blobToBase64(blobData);

    // Записуємо файл
    await FileSystem.writeAsStringAsync(fileUri, base64Data, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Перевіряємо, чи можна ділитися файлами
    const canShare = await Sharing.isAvailableAsync();

    if (canShare) {
      // Ділимося файлом без запиту дозволів на доступ до медіатеки
      await Sharing.shareAsync(fileUri, {
        mimeType: mimeType,
        dialogTitle: `Завантажити ${fileName}`,
        UTI: mimeType // для iOS
      });
      return { success: true, message: 'Файл готовий до збереження' };
    } else {
      // Тільки якщо sharing недоступний і це медіафайл, запитуємо дозвіл на доступ до медіатеки
      if (mimeType.startsWith('image/') || mimeType.startsWith('video/')) {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status === 'granted') {
          const asset = await MediaLibrary.createAssetAsync(fileUri);
          await MediaLibrary.createAlbumAsync('Downloads', asset, false);
          Alert.alert('Успіх', `Файл збережено в галереї: ${fileName}`);
          return { success: true, message: 'Файл збережено в галереї' };
        } else {
          Alert.alert('Помилка', 'Потрібні дозволи для збереження медіа-файлів');
          return { success: false, message: 'Немає дозволу на збереження' };
        }
      } else {
        Alert.alert('Помилка', 'Неможливо поділитися цим типом файлу на вашому пристрої');
        return { success: false, message: 'Неможливо поділитися файлом' };
      }
    }
  } catch (error) {
    console.error('Full error:', error);
    throw new Error(
        error.response?.data?.message || "Помилка при завантаженні файлу"
    );
  }
};

// Допоміжна функція для конвертації Blob у base64
const blobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result.split(',')[1];
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// Безпечне декодування імені файлу
const safeDecodeFileName = (encodedFileName) => {
  try {
    // Спочатку пробуємо просте декодування
    return decodeURIComponent(encodedFileName);
  } catch (e) {
    try {
      // Якщо виникла помилка, пробуємо інший підхід - декодувати тільки URI-компоненти
      return encodedFileName.replace(/%([0-9A-F]{2})/gi, (match, p1) => {
        return String.fromCharCode('0x' + p1);
      });
    } catch (e2) {
      // Якщо все ще помилка, повертаємо оригінальний рядок
      console.warn('Неможливо декодувати ім\'я файлу:', e2);
      return encodedFileName;
    }
  }
};

// Очищення імені файлу від недопустимих символів
const sanitizeFileName = (fileName) => {
  // Видаляємо недопустимі символи для імен файлів
  return fileName.replace(/[\/\\:*?"<>|]/g, '_');
};

// Генерування імені за замовчуванням на основі MIME-типу
const getDefaultFileName = (mimeType) => {
  const date = new Date().toISOString().slice(0, 10);

  switch (mimeType) {
    case 'application/pdf':
      return `document_${date}.pdf`;
    case 'image/jpeg':
      return `image_${date}.jpg`;
    case 'image/png':
      return `image_${date}.png`;
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return `document_${date}.docx`;
    case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
      return `spreadsheet_${date}.xlsx`;
    default:
      return `file_${date}`;
  }
};