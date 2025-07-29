import axios from 'axios';
import properties from '../../../../targetenv.json';

const api = axios.create({
  baseURL: properties.API_BASE_URL,
});

export const getVaccinationStatus = async (
  babyId: string,
  vaccinationListId: string,
  token: string
): Promise<any> => {
  const headers = { Authorization: `Bearer ${token}` };
  const response = await api.get(`/babies/${babyId}/vaccination-status/${vaccinationListId}`, { headers });
  return response.data;
};

export const updateVaccinationStatus = async (
  babyId: string,
  payload: any,
  token: string
): Promise<any> => {
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  const response = await api.post(`babies/${babyId}/vaccination-status`, payload, { headers });
  return response.data;
};

export const getVaccinations = async (
  babyId: string,
  token: string
): Promise<any> => {
  const headers = { Authorization: `Bearer ${token}` };
  const response = await api.get(`/babies/${babyId}/vaccinations`, { headers });
  return response.data;
};
