import axios from 'axios';
// @ts-ignore
import properties from '../../../../targetenv.json';

const api = axios.create({
  baseURL: properties.API_BASE_URL,
});

export const getBabyDetails = async (
  babyId: string,
  token: string
): Promise<any> => {
  const headers = { Authorization: `Bearer ${token}` };
  const response = await api.get(`/babies/${babyId}`, { headers });
  return response.data;
}; 