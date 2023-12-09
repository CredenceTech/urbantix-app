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