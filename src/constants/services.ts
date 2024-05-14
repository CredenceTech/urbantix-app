import { api } from "./api_manager";

export async function eventCheckin(params) {
  try {
    const result = await api.post(`/transactions/barcodeCheckIn`,params).then((response) => {
      return response.data;
    }).catch((error) => {
      return error.response.data;
    })
    if (result != null) {
      return result;
    }
  } catch (err) {
  }
  return null;
}

export async function socialLogin(params) {
  try {
    const result = await api.post(`/socialLogin`,params).then((response) => {
      return response.data;
    }).catch((error) => {
      return error.response.data;
    })
    if (result != null) {
      return result;
    }
  } catch (err) {
  }
  return null;
}

export async function logins(params) {
  try {
    const result = await api.post(`/login`,params).then((response) => {
      return response.data;
    }).catch((error) => {
      return error.response.data;
    })
    if (result != null) {
      return result;
    }
  } catch (err) {
  }
  return null;
}

export async function getEvent(params) {
  try {
    const result = await api.post(`/events/list`,params).then((response) => {
      return response.data;
    }).catch((error) => {
      return error.response.data;
    })
    if (result != null) {
      return result;
    }
  } catch (err) {
  }
  return null;
}