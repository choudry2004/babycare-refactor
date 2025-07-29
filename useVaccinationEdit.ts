// @ts-ignore
import { getAccessToken_Auth } from '../../../../screens/Authentications/Auth/authService';
import { useState, useRef, useCallback } from 'react';
import { getVaccinationStatus, updateVaccinationStatus } from '../services/vaccinationService';

export const useVaccinationEdit = (
  navigation: any,
  alertShownRef: any,
  babyId: string,
  vaccine: any
) => {
  const [vaccinationStatus, setVaccinationStatus] = useState<string | null>(null);
  const [postVaccineReaction, setPostVaccineReaction] = useState<string>('Yes');
  const [vaccineSymptom, setVaccineSymptom] = useState<string>('');
  const [storeDate, setStoreDate] = useState<string>('');
  const [displayDate, setDisplayeDate] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [storeTime, setStoreTime] = useState<string>('');
  const [displayTime, setDisplayTime] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<Date>(new Date());
  const [height, setHeight] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [fetchLoading, setFetchLoading] = useState<boolean>(false);
  const [updateLoading, setUpdateLoading] = useState<boolean>(false);
  const initialValuesRef = useRef<any>({});
  const [vaccineSymptomError, setVaccineSymptomError] = useState<string>('');
  const [heightError, setHeightError] = useState<string>('');
  const [weightError, setWeightError] = useState<string>('');
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [showTimePicker, setShowTimePicker] = useState<boolean>(false);
  const [statusmodalVisible, setStatusModalVisible] = useState<boolean>(false);
  const [statusModalTitle, setStatusModalTitle] = useState<string>('');
  const [statusModalMessage, setStatusModalMessage] = useState<string>('');
  const [statusModalIcon, setStatusModalIcon] = useState<any>(null);
  const [alertModalVisible, setAlertModalVisible] = useState<boolean>(false);
  const [alertModalTitle, setAlertModalTitle] = useState<string>('');
  const [alertModalMessage, setAlertModalMessage] = useState<string>('');
  const [isValidationModal, setIsValidationModal] = useState<boolean>(false);
  const heightInputRef = useRef<any>(null);
  const weightInputRef = useRef<any>(null);

  const fetchVaccinationStatus = useCallback(async () => {
    if (!babyId) return;
    setFetchLoading(true);
    try {
      const token = await getAccessToken_Auth(navigation, alertShownRef);
      const data = await getVaccinationStatus(String(babyId), vaccine.Vaccination_List_ID, token);
      setVaccinationStatus(data.Status);
      setPostVaccineReaction(data.Vaccine_Reaction || 'Yes');
      setVaccineSymptom(data.Post_Vaccination_Response || '');
      // ... set other fields as needed
      initialValuesRef.current = {
        vaccinationStatus: data.Status,
        postVaccineReaction: data.Vaccine_Reaction || 'Yes',
        vaccineSymptom: data.Post_Vaccination_Response || '',
        // ...
      };
    } catch (error) {
      // handle error
    } finally {
      setFetchLoading(false);
    }
  }, [navigation, alertShownRef, babyId, vaccine]);

  const submitVaccinationStatus = useCallback(async (payload: any) => {
    if (!babyId) return;
    setUpdateLoading(true);
    try {
      const token = await getAccessToken_Auth(navigation, alertShownRef);
      const data = await updateVaccinationStatus(String(babyId), payload, token);
      return data;
    } catch (error) {
      // handle error
      throw error;
    } finally {
      setUpdateLoading(false);
    }
  }, [navigation, alertShownRef, babyId]);

  return {
    vaccinationStatus,
    setVaccinationStatus,
    postVaccineReaction,
    setPostVaccineReaction,
    vaccineSymptom,
    setVaccineSymptom,
    storeDate,
    setStoreDate,
    displayDate,
    setDisplayeDate,
    selectedDate,
    setSelectedDate,
    storeTime,
    setStoreTime,
    displayTime,
    setDisplayTime,
    selectedTime,
    setSelectedTime,
    height,
    setHeight,
    weight,
    setWeight,
    fetchLoading,
    updateLoading,
    fetchVaccinationStatus,
    submitVaccinationStatus,
    initialValuesRef,
    vaccineSymptomError,
    setVaccineSymptomError,
    heightError,
    setHeightError,
    weightError,
    setWeightError,
    showDatePicker,
    setShowDatePicker,
    showTimePicker,
    setShowTimePicker,
    statusmodalVisible,
    setStatusModalVisible,
    statusModalTitle,
    setStatusModalTitle,
    statusModalMessage,
    setStatusModalMessage,
    statusModalIcon,
    setStatusModalIcon,
    alertModalVisible,
    setAlertModalVisible,
    alertModalTitle,
    setAlertModalTitle,
    alertModalMessage,
    setAlertModalMessage,
    isValidationModal,
    setIsValidationModal,
    heightInputRef,
    weightInputRef,
  };
};
