import React from "react";
import axios from "axios";
import { store } from "../state/store";
import { baseURL, login } from "../constants/api_constants";
import EncryptedStorage from 'react-native-encrypted-storage';

const api = axios.create({
  baseURL: baseURL, // Replace with your API base URL
});

// Request interceptor
api.interceptors.request.use(
  async config => {
    let token = '';

    try {
      const session = await EncryptedStorage.getItem("user_session");
      if (session !== undefined) {
        let userObj = JSON.parse(session);
        if (userObj.user != null && userObj.user.access_token != null) {
          token = userObj.user.access_token;
        }
      }
    } catch (error) {
      // There was an error on the native side
    }

    config.headers['Accept'] = 'application/json'; // Replace with your authorization logic
    config.headers['Content-Type'] = 'application/json'; // Replace with your authorization logic
    config.headers.Authorization = 'Bearer ' + token; // Replace with your authorization logic
    return config;
  },
  error => {
    // Handle request error
    return Promise.reject(error);
  }
);

const getParamRequest = async (url) => {
  try {
    const result = await api.get(url).then((response) => {
      return response.data;
    }).catch((error) => {
      return [false, null, null, error]
    })
    if (result != null) {
      console.log(result);
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
      console.log(result);
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

// const postParamRequest = async (url, header, params) => {
//     try {
//         console.log('====================================');
//         console.log('REQUEST');
//         console.log(url);
//         console.log(header);
//         console.log(params);
//         console.log('====================================');
//         const response = await fetch(url, {
//             method: 'POST',
//             headers: header,
//             body: params,
//         });
//         // const response = await fetch(baseURL + login, {
//         //     method: 'POST',
//         //     headers: {
//         //         Accept: 'application/json',
//         //         'Content-Type': 'application/json',
//         //     },
//         //     body: JSON.stringify({
//         //         'email': params.email,
//         //         'password': params.password,
//         //     }),
//         // });
//         const json = await response.json();
//         console.log('RESPONCE');
//         console.log(json);
//         let code = json.statusCode;
//         let message = json.message;
//         let data = json.data;
//         return [code, message, data, null]
//     } catch (error) {
//         console.error(error);
//         return [101, null, null, error]
//     }
// };

export {
  postParamRequest,
  getParamRequest,
}