import {useEffect, useRef, useState} from 'react';
import {useNavigation, useRoute} from '@react-navigation/native';
import {getAccessToken_Auth} from '../../../../screens/Authentications/Auth/authService';
import {reportService} from '../services/reportService';

export const useVaccinationReport = () => {
  const navigation = useNavigation();
  const alertShownRef = useRef(false);
  const route = useRoute();
  const {selectedAgeGroups, selectedCategories, babyId, babyRegion} =
    route.params || {
      selectedAgeGroups: [],
      selectedCategories: [],
      babyId: null,
      babyRegion: null,
    };

  const [babyData, setBabyData] = useState(null);
  const [vaccinationDetails, setVaccinationDetails] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [alertModalVisible, setAlertModalVisible] = useState(false);
  const [alertModalTitle, setAlertModalTitle] = useState('');
  const [alertModalMessage, setAlertModalMessage] = useState('');

  // Filtered lists
  const vaccinatedList = vaccinationDetails.filter(
    v => v.Status === 'Vaccinated',
  );
  const notVaccinatedList = vaccinationDetails.filter(
    v => v.Status === 'Not Vaccinated',
  );
  const skippedList = vaccinationDetails.filter(v => v.Status === 'Skipped');

  // Fetch baby data and vaccination details
  useEffect(() => {
    const fetchBabyData = async () => {
      try {
        setFetchLoading(true);
        const token = await getAccessToken_Auth(navigation, alertShownRef);
        
        const {babyData: fetchedBabyData, vaccinationDetails: fetchedVaccinationDetails} = 
          await reportService.fetchBabyAndVaccinationData(
            babyId,
            babyRegion,
            selectedAgeGroups,
            selectedCategories,
            token
          );

        setBabyData(fetchedBabyData);
        setVaccinationDetails(fetchedVaccinationDetails);
      } catch (error) {
        console.log('Error fetching data:', error);
      } finally {
        setFetchLoading(false);
      }
    };

    fetchBabyData();
  }, [selectedAgeGroups, selectedCategories, babyId, babyRegion]);

  // Calculate age from DOB
  const calculateAge = (dob) => {
    return reportService.calculateAge(dob);
  };

  // Calculate due date for vaccination
  const calculateDueDate = (vaccineCategoryName) => {
    return reportService.calculateDueDate(vaccineCategoryName, babyData?.DOB);
  };

  // Format time from 24-hour to 12-hour format
  const formatTime = (time24) => {
    return reportService.formatTime(time24);
  };

  // Generate and share PDF
  const generateAndSharePDF = async () => {
    if (shareLoading) return;
    setShareLoading(true);
    try {
      const htmlContent = reportService.generateHTMLContent({
        babyData,
        vaccinatedList,
        notVaccinatedList,
        skippedList,
        calculateAge,
        calculateDueDate,
        formatTime,
        formattedDate: reportService.getCurrentFormattedDate()
      });

      await reportService.generateAndSharePDF(htmlContent);
    } catch (error) {
      console.log('Error generating PDF:', error);
    } finally {
      setShareLoading(false);
    }
  };

  // Download PDF
  const downloadPDF = async () => {
    try {
      const htmlContent = reportService.generateHTMLContent({
        babyData,
        vaccinatedList,
        notVaccinatedList,
        skippedList,
        calculateAge,
        calculateDueDate,
        formatTime,
        formattedDate: reportService.getCurrentFormattedDate()
      });

      const result = await reportService.downloadPDF(htmlContent);
      
      setAlertModalTitle(result.title);
      setAlertModalMessage(result.message);
      setAlertModalVisible(true);
    } catch (error) {
      console.log('Error downloading PDF:', error);
    }
  };

  return {
    // Route params
    selectedAgeGroups,
    selectedCategories,
    babyId,
    babyRegion,
    
    // State
    babyData,
    vaccinationDetails,
    fetchLoading,
    shareLoading,
    alertModalVisible,
    alertModalTitle,
    alertModalMessage,
    
    // Filtered lists
    vaccinatedList,
    notVaccinatedList,
    skippedList,
    
    // Functions
    calculateAge,
    calculateDueDate,
    formatTime,
    generateAndSharePDF,
    downloadPDF,
    
    // Alert modal functions
    setAlertModalVisible,
    
    // Navigation
    navigation,
    
    // Computed values
    age: calculateAge(babyData?.DOB),
    formattedDate: reportService.getCurrentFormattedDate()
  };
};