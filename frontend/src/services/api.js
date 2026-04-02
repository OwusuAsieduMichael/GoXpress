import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 12000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json"
  }
});

const buildTypedError = ({ message, type, status, code }) => {
  const err = new Error(message);
  err.type = type;
  err.status = status;
  err.code = code;
  return err;
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === "ECONNABORTED") {
      return Promise.reject(
        buildTypedError({
          message: "Request timed out. Backend may be unreachable or slow.",
          type: "TIMEOUT",
          code: error.code
        })
      );
    }

    if (!error.response) {
      if (typeof navigator !== "undefined" && navigator.onLine === false) {
        return Promise.reject(
          buildTypedError({
            message: "No internet connection detected.",
            type: "OFFLINE",
            code: error.code
          })
        );
      }

      return Promise.reject(
        buildTypedError({
          message: "Unable to connect. Please try again.",
          type: "NETWORK_UNREACHABLE",
          code: error.code
        })
      );
    }

    const status = error.response.status;
    const message = error.response?.data?.message || error.message || "Request failed";

    if (status === 400) {
      return Promise.reject(
        buildTypedError({ message, type: "VALIDATION", status, code: error.code })
      );
    }
    if (status === 401) {
      return Promise.reject(
        buildTypedError({ message, type: "UNAUTHORIZED", status, code: error.code })
      );
    }
    if (status === 403) {
      return Promise.reject(
        buildTypedError({ message, type: "FORBIDDEN", status, code: error.code })
      );
    }
    if (status === 404) {
      return Promise.reject(
        buildTypedError({ message, type: "NOT_FOUND", status, code: error.code })
      );
    }
    if (status >= 500) {
      return Promise.reject(
        buildTypedError({ message, type: "SERVER_ERROR", status, code: error.code })
      );
    }

    return Promise.reject(
      buildTypedError({ message, type: "REQUEST_ERROR", status, code: error.code })
    );
  }
);
