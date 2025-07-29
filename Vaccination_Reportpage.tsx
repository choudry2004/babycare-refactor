// import {
//   ActivityIndicator,
//   Alert,
//   Dimensions,
//   Image,
//   ImageSourcePropType,
//   PermissionsAndroid,
//   Platform,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from 'react-native';
// import React, {useEffect, useRef, useState} from 'react';
// import {useNavigation, useRoute} from '@react-navigation/native';
// import {
//   responsiveHeight as rh,
//   responsiveWidth as rw,
//   responsiveFontSize as rf,
// } from 'react-native-responsive-dimensions';
// import {ScrollView} from 'react-native-gesture-handler';
// import {useVaccinationReport} from '../../../../features/Babycare/vaccination/hooks/useVaccinationReport';
// import {getAccessToken_Auth} from '../../../Authentications/Auth/authService';
// import axios from 'axios';
// import properties from '../../../../targetenv.json';
// import RNHTMLtoPDF from 'react-native-html-to-pdf';
// import Share from 'react-native-share';
// import RNFS from 'react-native-fs';
// import Custom_Alert from '../../../Home/Alarm/Custom_Alert';
// import DeviceInfo from 'react-native-device-info';
// // import { requestStoragePermission } from '../utils/permissions';

// const api = axios.create({
//   baseURL: properties.API_BASE_URL,
// });

// const {width, height} = Dimensions.get('window');

// const isTablet = DeviceInfo.isTablet();
// const isPortrait = height > width;
// const isTabletPortrait = isTablet && isPortrait;

// const Vaccination_Reportpage = () => {
//   const back: ImageSourcePropType = require('../../../../assets/back.png');
//   const share: ImageSourcePropType = require('../../../../assets/shareBlue.png');
//   const download: ImageSourcePropType = require('../../../../assets/download.png');
//   const logo: ImageSourcePropType = require('../../../../assets/AroCordLogo.png');
//   const vaccinated_tick: ImageSourcePropType = require('../../../../assets/vaccinated_tick_icon.png');
//   const not_vaccinated: ImageSourcePropType = require('../../../../assets/notvaccinated_icon.png');
//   const skipped: ImageSourcePropType = require('../../../../assets/skipped_icon.png');
//   const qr: ImageSourcePropType = require('../../../../assets/qr_code.png');

//   const navigation = useNavigation();
//   const alertShownRef = useRef(false);
//   const route = useRoute();
//   const {selectedAgeGroups, selectedCategories, babyId, babyRegion} =
//     route.params || {
//       selectedAgeGroups: [],
//       selectedCategories: [],
//       babyId: null,
//       babyRegion: null,
//     };

//   console.log('Selected Age Groups:', selectedAgeGroups);
//   console.log('Selected Categories:', selectedCategories);
//   console.log('baby region', babyRegion);

//   const [babyData, setBabyData] = useState(null);
//   const [vaccinationDetails, setVaccinationDetails] = useState([]);

//   const vaccinatedList = vaccinationDetails.filter(
//     v => v.Status === 'Vaccinated',
//   );
//   const notVaccinatedList = vaccinationDetails.filter(
//     v => v.Status === 'Not Vaccinated',
//   );
//   const skippedList = vaccinationDetails.filter(v => v.Status === 'Skipped');

//   const [fetchLoading, setFetchLoading] = useState(false);

//   const [shareLoading, setShareLoading] = useState(false);

//   const [alertModalVisible, setAlertModalVisible] = useState(false);
//   const [alertModalTitle, setAlertModalTitle] = useState('');
//   const [alertModalMessage, setAlertModalMessage] = useState('');

//   useEffect(() => {
//     const fetchBabyData = async () => {
//       try {
//         setFetchLoading(true);
//         const token = await getAccessToken_Auth(navigation, alertShownRef);
//         const headers = {Authorization: `Bearer ${token}`};

//         const response_baby = await api.get(`/babies/${babyId}`, {headers});
//         setBabyData(response_baby.data);

//         const response_vaccine = await api.get(
//           `/babies/${babyId}/vaccinations`,
//           {headers},
//         );
//         const allVaccinations = response_vaccine.data;

//         if (!allVaccinations.categories) {
//           console.log("Invalid API response: Missing 'categories' key");
//           return;
//         }

//         const filteredCategories = allVaccinations.categories
//           .map(category => {
//             // Filter vaccinations by region and selected categories (Status)
//             const matchingVaccinations = category.vaccinations.filter(
//               vaccine =>
//                 vaccine.Region?.toLowerCase() === babyRegion &&
//                 selectedCategories.includes(vaccine.Status),
//             );
//             if (
//               matchingVaccinations.length > 0 &&
//               selectedAgeGroups.includes(category.Vaccination_Category_Name)
//             ) {
//               return {
//                 ...category,
//                 vaccinations: matchingVaccinations,
//               };
//             }
//             return null;
//           })
//           .filter(category => category !== null);

//         let filteredVaccinations = [];
//         filteredCategories.forEach(category => {
//           category.vaccinations.forEach(vaccine => {
//             if (selectedCategories.includes(vaccine.Status)) {
//               filteredVaccinations.push({
//                 ...vaccine,
//                 Age_Group: category.Vaccination_Category_Name,
//               });
//             }
//           });
//         });

//         const vaccinationListIDs = filteredVaccinations.map(
//           vaccine => vaccine.Vaccination_List_ID,
//         );
//         console.log('Filtered Vaccination List IDs:', vaccinationListIDs);

//         let fetchedData = [];

//         for (const listID of vaccinationListIDs) {
//           console.log('Fetching vaccination status for List ID:', listID);
//           const response = await api.get(
//             `/babies/${babyId}/vaccination-status/${listID}`,
//             {
//               headers,
//             },
//           );
//           const vaccinationDetail = response.data;

//           const matchingVaccination = filteredVaccinations.find(
//             v => v.Vaccination_List_ID === listID,
//           );
//           fetchedData.push({
//             ...vaccinationDetail,
//             Age_Group: matchingVaccination
//               ? matchingVaccination.Age_Group
//               : 'Unknown',
//             Vaccine_Name: matchingVaccination
//               ? matchingVaccination.Vaccine_Name
//               : 'Unknown',
//           });

//           console.log('Merged Data:', fetchedData);
//         }
//         setVaccinationDetails(fetchedData);
//       } catch (error) {
//         console.log('Error fetching data:', error);
//       } finally {
//         setFetchLoading(false);
//       }
//     };

//     fetchBabyData();
//   }, [selectedAgeGroups, selectedCategories]);

//   const calculateAge = dob => {
//     console.log('aaaaaa', vaccinationDetails);
//     const birthDate = new Date(dob);
//     const today = new Date();

//     let years = today.getFullYear() - birthDate.getFullYear();
//     let months = today.getMonth() - birthDate.getMonth();
//     let days = today.getDate() - birthDate.getDate();

//     if (days < 0) {
//       months -= 1;
//       const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
//       days += lastMonth.getDate();
//     }

//     if (months < 0) {
//       years -= 1;
//       months += 12;
//     }

//     const diffTime = Math.abs(today - birthDate);
//     const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
//     const weeks = Math.floor(totalDays / 7);

//     if (years > 0) {
//       return `${years} year${years > 1 ? 's' : ''} ${
//         months > 0 ? months + ' month' + (months > 1 ? 's' : '') : ''
//       }`.trim();
//     } else if (months > 0) {
//       return `${months} month${months > 1 ? 's' : ''} ${
//         days > 0 ? days + ' day' + (days > 1 ? 's' : '') : ''
//       }`.trim();
//     } else if (totalDays >= 21) {
//       return `${weeks} week${weeks > 1 ? 's' : ''}`;
//     } else {
//       return `${totalDays} day${totalDays > 1 ? 's' : ''}`;
//     }
//   };

//   const age = calculateAge(babyData?.DOB);

//   const currentDate = new Date();
//   const formattedDate = `${currentDate.getDate()}.${
//     currentDate.getMonth() + 1
//   }.${currentDate.getFullYear().toString().slice(-2)}`;

//   const calculateDueDate = vaccineCategoryName => {
//     console.log('dob', babyData?.DOB);

//     if (!babyData?.DOB) return '-';

//     const dobDate = new Date(babyData?.DOB);
//     let dueDate = new Date(dobDate);

//     const match = vaccineCategoryName.match(/(\d+)\s*(weeks|months|years)/i);
//     if (match) {
//       const value = parseInt(match[1], 10);
//       const unit = match[2].toLowerCase();

//       if (unit === 'weeks') {
//         dueDate.setDate(dobDate.getDate() + value * 7);
//       } else if (unit === 'months') {
//         dueDate.setMonth(dobDate.getMonth() + value);
//       } else if (unit === 'years') {
//         dueDate.setFullYear(dobDate.getFullYear() + value);
//       }
//       return formatDate(dueDate);
//     }

//     if (vaccineCategoryName.toLowerCase() === 'birth') {
//       return formatDate(dobDate);
//     }

//     return '';
//   };

//   const formatDate = date => {
//     return date.toLocaleDateString('en-US', {
//       month: 'long',
//       day: 'numeric',
//       year: 'numeric',
//     });
//   };


//   const generateAndSharePDF = async () => {
//     if (shareLoading) return;
//     setShareLoading(true);
//     try {
//       const filePath = await generatePDF();
//       if (!filePath) {
//         console.log('Failed to generate PDF');
//         return;
//       }

//       // Share the PDF
//       await Share.open({
//         url: `file://${filePath}`,
//         type: 'application/pdf',
//         failOnCancel: false,
//       });

//       // Delete the file after sharing
//       await RNFS.unlink(filePath);
//       console.log('Temporary file deleted after sharing.');
//     } catch (error) {
//       console.log('Error generating PDF:', error);
//     } finally {
//       setShareLoading(false);
//     }
//   };

//   const downloadPDF = async () => {
//     try {
//       const timestamp = new Date().getTime();
//       const uniqueFileName = `Vaccination_Report_${timestamp}.pdf`;

//       const downloadPath = `${RNFS.DownloadDirectoryPath}/${uniqueFileName}`;

//       console.log('path', downloadPath);

//       const fileExists = await RNFS.exists(downloadPath);
//       if (fileExists) {
//         // Show modal saying file already exists
//         setAlertModalTitle('File Already Exists!');
//         setAlertModalMessage(
//           'The report is already downloaded in the Downloads folder. Please check there.',
//         );
//         setAlertModalVisible(true);
//         return;
//       }

//       const filePath = await generatePDF();
//       if (!filePath) {
//         console.log('Failed to generate PDF');
//         return;
//       }

//       // Move file to Downloads folder
//       await RNFS.moveFile(filePath, downloadPath);
//       console.log('PDF saved to:', downloadPath);

//       setAlertModalTitle('Download Complete!');
//       setAlertModalMessage(
//         'PDF downloaded successfully! Check your Downloads folder.',
//       );
//       setAlertModalVisible(true);
//     } catch (error) {
//       console.log('Error downloading PDF:', error);
//     }
//   };

//   const formatTime = time24 => {
//     if (!time24) return null;

//     // Extract hours and minutes
//     const [hours, minutes] = time24.split(':').map(Number);

//     // Convert 24-hour format to 12-hour format
//     const period = hours >= 12 ? 'PM' : 'AM';
//     const hours12 = hours % 12 || 12; // Convert 0 -> 12 for 12 AM

//     // Return formatted time
//     return `${hours12}:${String(minutes).padStart(2, '0')} ${period}`;
//   };

//   return (
//     <View style={styles.vaccine_report_container}>
//       <View style={styles.vaccine_report_header}>
//         <View style={styles.vaccine_report_header_left}>
//           <TouchableOpacity onPress={() => navigation.goBack()}>
//             <Image
//               source={back}
//               style={styles.back_icon}
//               resizeMode="contain"
//             />
//           </TouchableOpacity>
//           <Text style={styles.vaccine_report_heading}>Vaccination Report</Text>
//         </View>
//         <View style={styles.vaccine_report_header_right}>
//           <TouchableOpacity
//             onPress={generateAndSharePDF}
//             disabled={shareLoading}>
//             <Image source={share} style={styles.vaccine_report_share_icon} />
//           </TouchableOpacity>
//           <TouchableOpacity onPress={downloadPDF}>
//             <Image
//               source={download}
//               style={styles.vaccine_report_download_icon}
//             />
//           </TouchableOpacity>
//         </View>
//       </View>
//       {fetchLoading ? (
//         <View style={styles.loading_container}>
//           <ActivityIndicator size="small" color="#4789FC" />
//         </View>
//       ) : (
//         <ScrollView contentContainerStyle={{flexGrow: 1}}>
//           <View style={styles.vaccine_report_preview}>
//             <View style={styles.preview_header}>
//               <View style={styles.preview_header_left}>
//                 <Image source={logo} style={styles.preview_logo} />
//                 <Text style={styles.preview_logo_text}>AroCord</Text>
//               </View>
//               <View style={styles.preview_header_right}>
//                 <View style={styles.baby_personal}>
//                   <Text style={styles.personal_title}>Name</Text>
//                   <Text style={styles.personal_colon}>:</Text>
//                   <Text style={styles.personal_value}>
//                     {babyData?.Baby_Name}
//                   </Text>
//                 </View>
//                 <View style={styles.baby_personal}>
//                   <Text style={styles.personal_title}>Date of Birth</Text>
//                   <Text style={styles.personal_colon}>:</Text>
//                   <Text style={styles.personal_value}>{babyData?.DOB}</Text>
//                 </View>
//                 <View style={styles.baby_personal}>
//                   <Text style={styles.personal_title}>Birth Time</Text>
//                   <Text style={styles.personal_colon}>:</Text>
//                   <Text style={styles.personal_value}>
//                     {formatTime(babyData?.Birth_Time)}
//                   </Text>
//                 </View>
//                 <View style={styles.baby_personal}>
//                   <Text style={styles.personal_title}>Gender</Text>
//                   <Text style={styles.personal_colon}>:</Text>
//                   <Text style={styles.personal_value}>{babyData?.Gender}</Text>
//                 </View>
//                 <View style={styles.baby_personal_last}>
//                   <Text style={styles.personal_title}>Age</Text>
//                   <Text style={styles.personal_colon}>:</Text>
//                   <Text style={styles.personal_value}>{age}</Text>
//                 </View>
//               </View>
//             </View>
//             <View style={styles.vaccine_report_preview_Content}>
//               <Text style={styles.vaccine_report_preview_heading}>
//                 Vaccination Report (Only Recommended In India)
//               </Text>
//               {vaccinatedList?.length > 0 && (
//                 <View style={styles.preview_vaccination}>
//                   <View style={styles.preview_vaccination_heading}>
//                     <View style={styles.preview_vaccination_heading_left}>
//                       <Image
//                         source={vaccinated_tick}
//                         style={styles.preview_vaccination_icon}
//                       />
//                       <Text style={styles.preview_vaccination_Status}>
//                         Completed Vaccination
//                       </Text>
//                     </View>
//                     <View style={styles.preview_vaccination_heading_right}>
//                       <Text style={styles.preview_vaccination_generated}>
//                         Generated on:
//                       </Text>
//                       <Text style={styles.preview_vaccination_generated_date}>
//                         {formattedDate}
//                       </Text>
//                     </View>
//                   </View>
//                   <View style={styles.vaccination_tablecontainer}>
//                     <View style={styles.vaccination_tableRowHeader}>
//                       <Text style={styles.headerCell}>Age Group</Text>
//                       <Text style={styles.headerCell}>Vaccine Name</Text>
//                       <Text style={styles.headerCell}>Date Given</Text>
//                       <Text style={styles.headerCell}>Reactions</Text>
//                       <Text style={styles.headerCell}>Height & Weight</Text>
//                     </View>
//                     {vaccinatedList.map((item, index) => (
//                       <View
//                         style={styles.vaccination_tablerow}
//                         key={item.Vaccination_List_ID}>
//                         <Text style={styles.cell}>{item.Age_Group}</Text>
//                         <Text style={styles.cell}>{item.Vaccine_Name}</Text>
//                         <Text style={styles.cell}>{item.Date}</Text>
//                         <Text style={styles.cell}>
//                           {item.Post_Vaccination_Response
//                             ? item.Post_Vaccination_Response
//                             : '-'}
//                         </Text>
//                         <View style={styles.cell}>
//                           <Text style={styles.cell_hw}>{item.Height} cm</Text>
//                           <Text style={styles.cell_hw}>{item.Weight} Kg</Text>
//                         </View>
//                       </View>
//                     ))}
//                   </View>
//                 </View>
//               )}
//               {notVaccinatedList.length > 0 && (
//                 <View style={styles.preview_not_vaccination}>
//                   <View style={styles.preview_not_vaccination_heading}>
//                     <Image
//                       source={not_vaccinated}
//                       style={styles.preview_vaccination_icon}
//                     />
//                     <Text style={styles.preview_vaccination_Status}>
//                       Not Vaccinated
//                     </Text>
//                   </View>
//                   <View style={styles.not_vaccination_tablecontainer}>
//                     <View style={styles.not_vaccination_tableRowHeader}>
//                       <Text style={styles.headerCell}>Age Group</Text>
//                       <Text style={styles.headerCell}>Vaccine Name</Text>
//                       <Text style={styles.headerCell}>Due Date</Text>
//                     </View>

//                     {notVaccinatedList.map((item, index) => (
//                       <View key={index} style={styles.not_vaccination_tablerow}>
//                         <Text style={styles.cell}>{item.Age_Group}</Text>
//                         <Text style={styles.cell}>{item.Vaccine_Name}</Text>
//                         <Text style={styles.cell_hw}>
//                           {calculateDueDate(item.Age_Group)}
//                         </Text>
//                       </View>
//                     ))}
//                   </View>
//                 </View>
//               )}
//               {skippedList.length > 0 && (
//                 <View style={styles.preview_skipped}>
//                   <View style={styles.preview_skipped_heading}>
//                     <Image
//                       source={skipped}
//                       style={styles.preview_skipped_icon}
//                     />
//                     <Text style={styles.preview_skipped_Status}>Skipped</Text>
//                   </View>
//                   <View style={styles.skipped_tablecontainer}>
//                     <View style={styles.skipped_tableRowHeader}>
//                       <Text style={styles.headerCell}>Age Group</Text>
//                       <Text style={styles.headerCell}>Vaccine Name</Text>
//                       <Text style={styles.headerCell}>Due Date</Text>
//                     </View>

//                     {skippedList.map((item, index) => (
//                       <View key={index} style={styles.skipped_tablerow}>
//                         <Text style={styles.cell}>{item.Age_Group}</Text>
//                         <Text style={styles.cell}>{item.Vaccine_Name}</Text>
//                         <Text style={styles.cell_hw}>
//                           {calculateDueDate(item.Age_Group)}
//                         </Text>
//                       </View>
//                     ))}
//                   </View>
//                 </View>
//               )}
//             </View>
//             <View style={styles.preview_footer}>
//               <View style={styles.footer_logo}>
//                 <Image source={logo} style={styles.footer_logo_icon} />
//               </View>
//               <View style={styles.footer_contents}>
//                 <Text style={styles.footer_contents_1}>
//                   This report is generated by AroCord based on user-provided
//                   data. It is for reference purpose only & does not replace
//                   medical advice. Please consult your doctor for guidance & stay
//                   on track for a happy, healthy journey!
//                 </Text>
//                 <Text style={styles.footer_contents_2}>
//                   Visit: www.arocord.com
//                 </Text>
//               </View>
//               <View style={styles.footer_qr}>
//                 <Image source={qr} style={styles.footer_qr_icon} />
//               </View>
//             </View>
//           </View>
//         </ScrollView>
//       )}
//       <Custom_Alert
//         visible={alertModalVisible}
//         onClose={() => {
//           setAlertModalVisible(false);
//         }}
//         title={alertModalTitle}
//         message={alertModalMessage}
//       />
//     </View>
//   );
// };

// export default Vaccination_Reportpage;

import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  ImageSourcePropType,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React from 'react';
import {
  responsiveHeight as rh,
  responsiveWidth as rw,
  responsiveFontSize as rf,
} from 'react-native-responsive-dimensions';
import {ScrollView} from 'react-native-gesture-handler';
import Custom_Alert from '../../../Home/Alarm/Custom_Alert';
import DeviceInfo from 'react-native-device-info';
import {useVaccinationReport} from '../../../../features/Babycare/vaccination/hooks/useVaccinationReport';

const {width, height} = Dimensions.get('window');

const isTablet = DeviceInfo.isTablet();
const isPortrait = height > width;
const isTabletPortrait = isTablet && isPortrait;

const Vaccination_Reportpage = () => {
  const {
    babyData,
    vaccinationDetails,
    fetchLoading,
    shareLoading,
    alertModalVisible,
    alertModalTitle,
    alertModalMessage,
    vaccinatedList,
    notVaccinatedList,
    skippedList,
    calculateAge,
    calculateDueDate,
    formatTime,
    generateAndSharePDF,
    downloadPDF,
    setAlertModalVisible,
    navigation,
    age,
    formattedDate
  } = useVaccinationReport();

  const back: ImageSourcePropType = require('../../../../assets/back.png');
  const share: ImageSourcePropType = require('../../../../assets/shareBlue.png');
  const download: ImageSourcePropType = require('../../../../assets/download.png');
  const logo: ImageSourcePropType = require('../../../../assets/AroCordLogo.png');
  const vaccinated_tick: ImageSourcePropType = require('../../../../assets/vaccinated_tick_icon.png');
  const not_vaccinated: ImageSourcePropType = require('../../../../assets/notvaccinated_icon.png');
  const skipped: ImageSourcePropType = require('../../../../assets/skipped_icon.png');
  const qr: ImageSourcePropType = require('../../../../assets/qr_code.png');

  return (
    <View style={styles.vaccine_report_container}>
      <View style={styles.vaccine_report_header}>
        <View style={styles.vaccine_report_header_left}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image
              source={back}
              style={styles.back_icon}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <Text style={styles.vaccine_report_heading}>Vaccination Report</Text>
        </View>
        <View style={styles.vaccine_report_header_right}>
          <TouchableOpacity
            onPress={generateAndSharePDF}
            disabled={shareLoading}>
            <Image source={share} style={styles.vaccine_report_share_icon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={downloadPDF}>
            <Image
              source={download}
              style={styles.vaccine_report_download_icon}
            />
          </TouchableOpacity>
        </View>
      </View>
      {fetchLoading ? (
        <View style={styles.loading_container}>
          <ActivityIndicator size="small" color="#4789FC" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{flexGrow: 1}}>
          <View style={styles.vaccine_report_preview}>
            <View style={styles.preview_header}>
              <View style={styles.preview_header_left}>
                <Image source={logo} style={styles.preview_logo} />
                <Text style={styles.preview_logo_text}>AroCord</Text>
              </View>
              <View style={styles.preview_header_right}>
                <View style={styles.baby_personal}>
                  <Text style={styles.personal_title}>Name</Text>
                  <Text style={styles.personal_colon}>:</Text>
                  <Text style={styles.personal_value}>
                    {babyData?.Baby_Name}
                  </Text>
                </View>
                <View style={styles.baby_personal}>
                  <Text style={styles.personal_title}>Date of Birth</Text>
                  <Text style={styles.personal_colon}>:</Text>
                  <Text style={styles.personal_value}>{babyData?.DOB}</Text>
                </View>
                <View style={styles.baby_personal}>
                  <Text style={styles.personal_title}>Birth Time</Text>
                  <Text style={styles.personal_colon}>:</Text>
                  <Text style={styles.personal_value}>
                    {formatTime(babyData?.Birth_Time)}
                  </Text>
                </View>
                <View style={styles.baby_personal}>
                  <Text style={styles.personal_title}>Gender</Text>
                  <Text style={styles.personal_colon}>:</Text>
                  <Text style={styles.personal_value}>{babyData?.Gender}</Text>
                </View>
                <View style={styles.baby_personal_last}>
                  <Text style={styles.personal_title}>Age</Text>
                  <Text style={styles.personal_colon}>:</Text>
                  <Text style={styles.personal_value}>{age}</Text>
                </View>
              </View>
            </View>
            <View style={styles.vaccine_report_preview_Content}>
              <Text style={styles.vaccine_report_preview_heading}>
                Vaccination Report (Only Recommended In India)
              </Text>
              {vaccinatedList?.length > 0 && (
                <View style={styles.preview_vaccination}>
                  <View style={styles.preview_vaccination_heading}>
                    <View style={styles.preview_vaccination_heading_left}>
                      <Image
                        source={vaccinated_tick}
                        style={styles.preview_vaccination_icon}
                      />
                      <Text style={styles.preview_vaccination_Status}>
                        Completed Vaccination
                      </Text>
                    </View>
                    <View style={styles.preview_vaccination_heading_right}>
                      <Text style={styles.preview_vaccination_generated}>
                        Generated on:
                      </Text>
                      <Text style={styles.preview_vaccination_generated_date}>
                        {formattedDate}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.vaccination_tablecontainer}>
                    <View style={styles.vaccination_tableRowHeader}>
                      <Text style={styles.headerCell}>Age Group</Text>
                      <Text style={styles.headerCell}>Vaccine Name</Text>
                      <Text style={styles.headerCell}>Date Given</Text>
                      <Text style={styles.headerCell}>Reactions</Text>
                      <Text style={styles.headerCell}>Height & Weight</Text>
                    </View>
                    {vaccinatedList.map((item, index) => (
                      <View
                        style={styles.vaccination_tablerow}
                        key={item.Vaccination_List_ID}>
                        <Text style={styles.cell}>{item.Age_Group}</Text>
                        <Text style={styles.cell}>{item.Vaccine_Name}</Text>
                        <Text style={styles.cell}>{item.Date}</Text>
                        <Text style={styles.cell}>
                          {item.Post_Vaccination_Response
                            ? item.Post_Vaccination_Response
                            : '-'}
                        </Text>
                        <View style={styles.cell}>
                          <Text style={styles.cell_hw}>{item.Height} cm</Text>
                          <Text style={styles.cell_hw}>{item.Weight} Kg</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              )}
              {notVaccinatedList.length > 0 && (
                <View style={styles.preview_not_vaccination}>
                  <View style={styles.preview_not_vaccination_heading}>
                    <Image
                      source={not_vaccinated}
                      style={styles.preview_vaccination_icon}
                    />
                    <Text style={styles.preview_vaccination_Status}>
                      Not Vaccinated
                    </Text>
                  </View>
                  <View style={styles.not_vaccination_tablecontainer}>
                    <View style={styles.not_vaccination_tableRowHeader}>
                      <Text style={styles.headerCell}>Age Group</Text>
                      <Text style={styles.headerCell}>Vaccine Name</Text>
                      <Text style={styles.headerCell}>Due Date</Text>
                    </View>

                    {notVaccinatedList.map((item, index) => (
                      <View key={index} style={styles.not_vaccination_tablerow}>
                        <Text style={styles.cell}>{item.Age_Group}</Text>
                        <Text style={styles.cell}>{item.Vaccine_Name}</Text>
                        <Text style={styles.cell_hw}>
                          {calculateDueDate(item.Age_Group)}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
              {skippedList.length > 0 && (
                <View style={styles.preview_skipped}>
                  <View style={styles.preview_skipped_heading}>
                    <Image
                      source={skipped}
                      style={styles.preview_skipped_icon}
                    />
                    <Text style={styles.preview_skipped_Status}>Skipped</Text>
                  </View>
                  <View style={styles.skipped_tablecontainer}>
                    <View style={styles.skipped_tableRowHeader}>
                      <Text style={styles.headerCell}>Age Group</Text>
                      <Text style={styles.headerCell}>Vaccine Name</Text>
                      <Text style={styles.headerCell}>Due Date</Text>
                    </View>

                    {skippedList.map((item, index) => (
                      <View key={index} style={styles.skipped_tablerow}>
                        <Text style={styles.cell}>{item.Age_Group}</Text>
                        <Text style={styles.cell}>{item.Vaccine_Name}</Text>
                        <Text style={styles.cell_hw}>
                          {calculateDueDate(item.Age_Group)}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
            <View style={styles.preview_footer}>
              <View style={styles.footer_logo}>
                <Image source={logo} style={styles.footer_logo_icon} />
              </View>
              <View style={styles.footer_contents}>
                <Text style={styles.footer_contents_1}>
                  This report is generated by AroCord based on user-provided
                  data. It is for reference purpose only & does not replace
                  medical advice. Please consult your doctor for guidance & stay
                  on track for a happy, healthy journey!
                </Text>
                <Text style={styles.footer_contents_2}>
                  Visit: www.arocord.com
                </Text>
              </View>
              <View style={styles.footer_qr}>
                <Image source={qr} style={styles.footer_qr_icon} />
              </View>
            </View>
          </View>
        </ScrollView>
      )}
      <Custom_Alert
        visible={alertModalVisible}
        onClose={() => {
          setAlertModalVisible(false);
        }}
        title={alertModalTitle}
        message={alertModalMessage}
      />
    </View>
  );
};

export default Vaccination_Reportpage;

const styles = StyleSheet.create({
  loading_container: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  vaccine_report_container: {
    backgroundColor: '#FBFBFB',
    flex: 1,
  },
  vaccine_report_header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    marginVertical: rh(3),
    marginHorizontal: rw(4),
  },
  vaccine_report_header_left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rw(3),
  },
  back_icon: {
    width: rh(4),
    height: rh(4),
  },
  vaccine_report_heading: {
    color: '#151515',
    fontSize: isTabletPortrait ? rf(2.1) : rf(2.3),
    fontWeight: '900',
    fontFamily: Platform.OS === 'android' ? 'satoshi' : 'System',
    marginLeft: rh(1),
  },
  vaccine_report_header_right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rw(4),
  },
  vaccine_report_share_icon: {
    width: rh(3),
    height: rh(3),
  },
  vaccine_report_download_icon: {
    width: rh(3),
    height: rh(3),
    marginLeft: rh(1),
  },
  vaccine_report_preview: {
    borderWidth: 1,
    borderColor: '#4789FC',
    marginVertical: rh(3),
    marginHorizontal: rw(4),
    overflow: 'hidden',
  },
  preview_header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#4789FC',
  },
  preview_header_left: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    padding: rh(1),
  },
  preview_logo: {
    width: rh(6),
    height: rh(6),
  },
  preview_logo_text: {
    color: '#151515',
    fontSize: isTabletPortrait ? rf(2) : rf(2.1),
    fontWeight: '900',
    fontFamily: Platform.OS === 'android' ? 'satoshi' : 'System',
    marginLeft: rh(1),
  },
  preview_header_right: {
    flexDirection: 'column',
    borderLeftWidth: 1,
    borderLeftColor: '#4789FC4D',
  },
  baby_personal: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#4789FC4D',
    paddingVertical: rh(1),
    paddingHorizontal: rw(2),
    // flexWrap: 'wrap',
  },
  baby_personal_last: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: rh(1),
    paddingHorizontal: rw(2),
  },
  personal_title: {
    color: '#605C5C',
    fontSize: isTabletPortrait ? rf(1.6) : rf(1.7),
    fontWeight: '500',
    width: rw(25),
    textAlign: 'left',
    flexShrink: 1,
    fontFamily: Platform.OS === 'android' ? 'satoshi' : 'System',
  },
  personal_value: {
    color: '#000000',
    fontSize: isTabletPortrait ? rf(1.6) : rf(1.7),
    fontWeight: '700',
    width: rw(20),
    textAlign: 'left',
    flexWrap: 'wrap',
    fontFamily: Platform.OS === 'android' ? 'satoshi' : 'System',
  },
  personal_colon: {
    color: '#605C5C',
    fontSize: isTabletPortrait ? rf(1.6) : rf(1.7),
    fontWeight: '500',
    width: rw(5),
    textAlign: 'center',
    fontFamily: Platform.OS === 'android' ? 'satoshi' : 'System',
  },
  vaccine_report_preview_Content: {
    paddingTop: rh(3),
  },
  vaccine_report_preview_heading: {
    color: '#151515',
    fontSize: isTabletPortrait ? rf(1.6) : rf(1.7),
    fontWeight: '900',
    textAlign: 'center',
    textDecorationLine: 'underline',
    fontFamily: Platform.OS === 'android' ? 'satoshi' : 'System',
  },
  preview_vaccination: {
    flexDirection: 'column',
    paddingVertical: rh(3),
    paddingHorizontal: rw(1),
  },
  preview_vaccination_heading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  preview_vaccination_heading_left: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: rh(1),
  },
  preview_vaccination_heading_right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rw(1),
  },
  preview_vaccination_icon: {
    width: rh(2),
    height: rh(2),
  },
  preview_vaccination_Status: {
    color: '#151515',
    fontSize: rf(1.5),
    fontWeight: '900',
    fontFamily: Platform.OS === 'android' ? 'satoshi' : 'System',
    marginLeft: rh(0.5),
  },
  preview_vaccination_generated: {
    color: '#00000099',
    fontSize: rf(1.5),
    fontWeight: '500',
    fontFamily: Platform.OS === 'android' ? 'satoshi' : 'System',
  },
  preview_vaccination_generated_date: {
    color: '#151515',
    fontSize: rf(1.5),
    fontWeight: '900',
    textAlign: 'left',
    fontFamily: Platform.OS === 'android' ? 'satoshi' : 'System',
  },
  vaccination_tablecontainer: {
    borderWidth: 1,
    borderColor: '#D9D9D9',
    overflow: 'hidden',
    margin: rh(0.5),
  },
  vaccination_tableRowHeader: {
    flexDirection: 'row',
    backgroundColor: '#4789FC',
    paddingVertical: rh(1),
  },
  vaccination_tablerow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomColor: '#D9D9D9',
    borderBottomWidth: 1,
  },
  headerCell: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: rf(1.3),
    fontWeight: '700',
    fontFamily: Platform.OS === 'android' ? 'satoshi' : 'System',
    textAlign: 'center',
    paddingVertical: rh(0.5),
  },
  cell: {
    flex: 1,
    color: '#151515',
    fontSize: rf(1.3),
    fontWeight: '500',
    fontFamily: Platform.OS === 'android' ? 'satoshi' : 'System',
    textAlign: 'center',
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderRightWidth: 1,
    borderColor: '#D1D1D1',
  },
  cell_hw: {
    flex: 1,
    color: '#151515',
    fontSize: rf(1.5),
    fontWeight: '500',
    fontFamily: Platform.OS === 'android' ? 'satoshi' : 'System',
    textAlign: 'center',
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  preview_not_vaccination: {
    flexDirection: 'column',
    paddingVertical: rh(2),
    paddingHorizontal: rw(1),
  },
  preview_not_vaccination_heading: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },

  preview_not_vaccination_icon: {
    width: rh(2),
    height: rh(2),
  },
  preview_not_vaccination_Status: {
    color: '#151515',
    fontSize: rf(1.5),
    fontWeight: '900',
    fontFamily: Platform.OS === 'android' ? 'satoshi' : 'System',
    marginLeft: rh(0.5),
  },

  not_vaccination_tablecontainer: {
    borderWidth: 1,
    borderColor: '#D9D9D9',
    overflow: 'hidden',
    margin: rh(0.5),
  },
  not_vaccination_tableRowHeader: {
    flexDirection: 'row',
    backgroundColor: '#4789FC',
    paddingVertical: rh(1),
  },
  not_vaccination_tablerow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomColor: '#D9D9D9',
    borderBottomWidth: 1,
  },
  preview_skipped: {
    flexDirection: 'column',
    paddingVertical: rh(2),
    paddingHorizontal: rw(1),
  },
  preview_skipped_heading: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },

  preview_skipped_icon: {
    width: rh(2),
    height: rh(2),
  },
  preview_skipped_Status: {
    color: '#151515',
    fontSize: rf(1.5),
    fontWeight: '900',
    fontFamily: Platform.OS === 'android' ? 'satoshi' : 'System',
    marginLeft: rh(0.5),
  },

  skipped_tablecontainer: {
    borderWidth: 1,
    borderColor: '#D9D9D9',
    overflow: 'hidden',
    margin: rh(0.5),
  },
  skipped_tableRowHeader: {
    flexDirection: 'row',
    backgroundColor: '#4789FC',
    paddingVertical: rh(1),
  },
  skipped_tablerow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomColor: '#D9D9D9',
    borderBottomWidth: 1,
  },
  preview_footer: {
    backgroundColor: '#4789FC26',
    marginTop: rh(6),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: rw(4),
    paddingVertical: rh(2),
  },
  footer_logo: {
    width: rh(8),
    height: rh(8),
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer_logo_icon: {
    width: rh(6),
    height: rh(6),
    resizeMode: 'contain',
  },
  footer_contents: {
    flex: 1,
    flexDirection: 'column',
    paddingHorizontal: rw(2),
  },
  footer_contents_1: {
    color: '#151515',
    fontSize: rf(0.8),
    fontWeight: '500',
    textAlign: 'left',
    width: '100%',
    fontFamily: Platform.OS === 'android' ? 'satoshi' : 'System',
  },
  footer_contents_2: {
    color: '#151515',
    fontSize: rf(1),
    fontWeight: '900',
    marginTop: rh(1),
    fontFamily: Platform.OS === 'android' ? 'satoshi' : 'System',
  },
  footer_qr_icon: {
    width: rh(6),
    height: rh(6),
    resizeMode: 'contain',
  },
});