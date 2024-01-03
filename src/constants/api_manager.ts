import React from "react";
import axios from "axios";
import { store } from "../state/store";
import { baseURL, login } from "../constants/api_constants";

const api = axios.create({
  baseURL: baseURL, // Replace with your API base URL
});


// Request interceptor
api.interceptors.request.use(
  async config => {
    const authenticationUser = store.getState().authentication;

    config.headers['Accept'] = 'application/json'; // Replace with your authorization logic
    config.headers['Content-Type'] = 'application/json'; // Replace with your authorization logic
    config.headers.Authorization = 'Bearer ' + authenticationUser?.user?.access_token; // Replace with your authorization logic
    return config;
  },
  error => {
    // Handle request error
    return Promise.reject(error);
  }
);

const getParamRequest = async (url: string) => {
  try {
    const result = await api.get(url).then((response) => {
      return response.data;
    }).catch((error) => {
      return [false, null, null, error]
    })
    if (result != null) {
      let success = result.success;
      let message = result.message;
      let data = result.data;
      return [success, message, data, null]
    }
  } catch (err) {
    return [false, null, null, err]
  }
  return null;
};

const postParamRequest = async (url, params) => {
  try {
    const result = await api.post(url, params).then((response) => {
      return response.data;
    }).catch((error) => {
      return [false, null, null, error]
    })
    if (result != null) {
      let success = result.success;
      let message = result.message;
      let data = result.data;
      return [success, message, data, null]
    }
  } catch (err) {
    return [false, null, null, err]
  }
  return null;
};


export {
  postParamRequest,
  getParamRequest,
  api,
}