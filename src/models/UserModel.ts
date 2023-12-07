import React from "react";
import { baseURL, login } from "../constants/api_constants";

const loginRequest = async (email, password) => {
    try {
        const response = await fetch(baseURL + login, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                'email': email,
                'password': password,
            }),
        });
        const json = await response.json();
        let status = json.status;
        let message = json.message;
        let data = json.data;
        return [status, message, data, null]
    } catch (error) {
        console.error(error);
        return [101, null, null, error]
    }
};

export {
    loginRequest,
}