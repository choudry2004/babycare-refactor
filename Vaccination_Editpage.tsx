import {
  Image,
  ImageSourcePropType,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Pressable,
  Linking,
  Keyboard,
  Dimensions,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {
  responsiveHeight as rh,
  responsiveWidth as rw,
  responsiveFontSize as rf,
} from 'react-native-responsive-dimensions';
import DatePicker from 'react-native-date-picker';
import {ScrollView} from 'react-native-gesture-handler';
import {useNavigation} from '@react-navigation/native';
import Vaccination_Status_Modal from './Vaccination_Status_Modal';
import {getAccessToken_Auth} from '../../../Authentications/Auth/authService';
import {ActivityIndicator} from 'react-native-paper';
import NetInfo from '@react-native-community/netinfo';
import Custom_Alert from '../../../Home/Alarm/Custom_Alert';
import DeviceInfo from 'react-native-device-info';
import { useVaccinationEdit } from '../../../../features/Babycare/vaccination/hooks/useVaccinationEdit';


const {width, height} = Dimensions.get('window');

const isTablet = DeviceInfo.isTablet();
const isPortrait = height > width;
const isTabletPortrait = isTablet && isPortrait;

const Vaccination_Editpage = ({route}) => {
  const back: ImageSourcePropType = require('../../../../assets/back.png');
  const vaccine_icon: ImageSourcePropType = require('../../../../assets/vaccine.png');
  const tick: ImageSourcePropType = require('../../../../assets/tick.png');
  const calendar: ImageSourcePropType = require('../../../../assets/calendar.png');
  const clock: ImageSourcePropType = require('../../../../assets/clock.png');
  const height_icon: ImageSourcePropType = require('../../../../assets/height.png');
  const weight_icon: ImageSourcePropType = require('../../../../assets/weight.png');
  const dropdown: ImageSourcePropType = require('../../../../assets/dropdown_disease.png');
  const dropup: ImageSourcePropType = require('../../../../assets/dropup_disease.png');

  const navigation = useNavigation();
  const {vaccine, babyId, babyDOB, vaccineCategoryName, babyRegion} =
    route.params;

  console.log('DOB', babyDOB, 'CatgoryName', vaccineCategoryName);
  const alertShownRef = useRef(false);

  // Use the new hook
  const vaccinationEdit = useVaccinationEdit(navigation, alertShownRef, babyId, vaccine);

  // Replace all state and logic with values from the hook
  // Example usage:
  // vaccinationEdit.vaccinationStatus, vaccinationEdit.setVaccinationStatus, etc.
  // vaccinationEdit.fetchVaccinationStatus(), vaccinationEdit.submitVaccinationStatus(payload)

  const [expandDiseaseInfo, setExpandDiseaseInfo] = useState<{
    [key: number]: boolean;
  }>({});

  const [expandSpreadInfo, setExpandSpreadInfo] = useState(false);


  const [fetchLoading, setFetchLoading] = useState(false);

  const initialValuesRef = useRef({});

  const handleVaccinationStatus = status => {
    vaccinationEdit.setVaccinationStatus(vaccinationEdit.vaccinationStatus === status ? null : status);
    vaccinationEdit.setVaccineSymptomError('');
    vaccinationEdit.setVaccineSymptom('');
    vaccinationEdit.setStoreDate('');
    vaccinationEdit.setDisplayeDate('');
    vaccinationEdit.setSelectedDate(new Date());
    vaccinationEdit.setStoreTime('');
    vaccinationEdit.setDisplayTime('');
    vaccinationEdit.setSelectedTime(new Date());
    vaccinationEdit.setHeight('');
    vaccinationEdit.setWeight('');
    vaccinationEdit.setHeightError('');
    vaccinationEdit.setWeightError('');
  };

  const handlePostReactionStatus = status => {
    vaccinationEdit.setPostVaccineReaction(vaccinationEdit.postVaccineReaction === 'Yes' ? 'No' : 'Yes');
    vaccinationEdit.setVaccineSymptomError('');
    vaccinationEdit.setVaccineSymptom('');
  };

  const formatDisplayDate = selectedDate => {
    const options = {year: 'numeric', month: 'long', day: 'numeric'};
    return selectedDate.toLocaleDateString('en-US', options);
  };

  const formatStoredDate = selectedDate => {
    return selectedDate.toISOString().split('T')[0];
  };

  const formatDisplayTime = selectedTime => {
    return selectedTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatStoredTime = selectedTime => {
    return selectedTime.toISOString().split('T')[1].split('Z')[0];
  };

  // const isToday = selectedDate.toDateString() === new Date().toDateString();
  const isToday = vaccinationEdit.selectedDate.toDateString() === new Date().toDateString();

  const maxTime = isToday ? new Date() : undefined;

  const validateVaccineSymptom = text => {
    if (!text.trim()) {
      vaccinationEdit.setVaccineSymptomError('Kindly fill this field.');
      vaccinationEdit.setVaccineSymptom(text);
      return;
    }

    if (!/^[a-zA-Z0-9]/.test(text)) {
      vaccinationEdit.setVaccineSymptomError('Must start with a letter or number.');
      vaccinationEdit.setVaccineSymptom(text);
      return;
    }

    if (text.length > 50) {
      vaccinationEdit.setVaccineSymptomError('Maximum length is 50 characters.');
      vaccinationEdit.setVaccineSymptom(text);
      return;
    }

    vaccinationEdit.setVaccineSymptomError(''); // No error, input is valid
    vaccinationEdit.setVaccineSymptom(text);
  };

  const validateHeight = text => {
    if (/^\d{0,4}(\.\d{0,2})?$/.test(text)) {
      const value = parseFloat(text);
      if (isNaN(value) || value < 1) {
        vaccinationEdit.setHeightError('Please enter a valid height.');
      } else if (value > 180) {
        vaccinationEdit.setHeightError('Height must be 180 cm or less.');
      } else {
        vaccinationEdit.setHeightError('');
      }
      vaccinationEdit.setHeight(text);
    }
    // else {
    //   setHeightError('Invalid input. Max 2 decimal places.');
    // }
  };

  const validateWeight = text => {
    if (/^\d{0,3}(\.\d{0,2})?$/.test(text)) {
      const value = parseFloat(text);
      if (isNaN(value) || value < 1) {
        vaccinationEdit.setWeightError('Please enter a valid weight.');
      } else if (value > 70) {
        vaccinationEdit.setWeightError('Weight must be 70 kg or less.');
      } else {
        vaccinationEdit.setWeightError('');
      }
      vaccinationEdit.setWeight(text);
    }
    // else {
    //   setWeightError('Invalid input. Max 2 decimal places.');
    // }
  };

  useEffect(() => {
    const keyboardListener = Keyboard.addListener('keyboardDidHide', () => {
      vaccinationEdit.heightInputRef.current?.blur();
      vaccinationEdit.weightInputRef.current?.blur();
    });

    return () => {
      keyboardListener.remove();
    };
  }, []);

  const getVaccineSuffix = vaccineName => {
    let suffix = '';
    if (
      vaccineName.includes('Pneumococcal Conjugate Vaccine (PCV-1)') ||
      vaccineName.includes('PCV-2') ||
      vaccineName.includes('PCV-Booster')
    ) {
      suffix = ' *';
    }
    if (vaccineName.includes('JE-1') || vaccineName.includes('JE-2')) {
      suffix = ' **';
    }
    if (vaccineName.includes('(Td)-Booster')) {
      suffix = ' ***';
    }
    return suffix ? (
      <Text style={{color: '#01895B', fontWeight: 'bold'}}> {suffix}</Text>
    ) : null;
  };

  const getVaccineRiskInfo = vaccineName => {
    let risks = null;
    if (
      vaccineName.includes('Pneumococcal Conjugate Vaccine (PCV-1)') ||
      vaccineName.includes('PCV-2') ||
      vaccineName.includes('PCV-Booster')
    ) {
      risks = (
        <Text>
          <Text style={{color: '#01895B', fontWeight: 'bold'}}>*</Text> PCV in
          selected states/districts: Bihar, Himachal Pradesh, Madhya Pradesh,
          Uttar Pradesh (selected districts) and Rajasthan; in Haryana as state
          initiative
        </Text>
      );
    }
    if (vaccineName.includes('JE-1') || vaccineName.includes('JE-2')) {
      risks = (
        <Text>
          <Text style={{color: '#01895B', fontWeight: 'bold'}}>**</Text> JE in
          Endemic districts refer to specific areas where a particular disease,
          such as Japanese Encephalitis (JE), is consistently present and poses
          a higher risk to the population. These districts have a history of
          reported cases, making vaccination especially important to prevent
          outbreaks.
        </Text>
      );
    }

    return risks;
  };

  const validateVaccineCategory = (babyDOB, vaccineCategoryName) => {
    const dob = new Date(babyDOB);
    const today = new Date();

    const diffInTime = today - dob;
    const ageInDays = diffInTime / (1000 * 60 * 60 * 24);
    const ageInWeeks = Math.floor(ageInDays / 7);
    const ageInMonths = Math.floor(ageInDays / 30.44);

    if (vaccineCategoryName.toLowerCase() === 'birth') {
      return true;
    }

    const matchWeeks = vaccineCategoryName.match(/(\d+)\s*weeks?/i);
    if (matchWeeks) {
      const requiredWeeks = parseInt(matchWeeks[1], 10);
      return ageInWeeks >= requiredWeeks;
    }

    const matchMonths = vaccineCategoryName.match(
      /(\d+)\s*-\s*(\d+)\s*months?/i,
    );
    if (matchMonths) {
      const requiredMonths = parseInt(matchMonths[1], 10);
      return ageInMonths >= requiredMonths;
    }

    const singleMonthMatch = vaccineCategoryName.match(/(\d+)\s*months?/i);
    if (singleMonthMatch) {
      const requiredMonths = parseInt(singleMonthMatch[1], 10);
      return ageInMonths >= requiredMonths;
    }

    const matchYears = vaccineCategoryName.match(/(\d+)\s*-\s*(\d+)\s*years?/i);
    if (matchYears) {
      const requiredYears = parseInt(matchYears[1], 10);
      return ageInMonths >= requiredYears * 12;
    }

    const singleYearMatch = vaccineCategoryName.match(/(\d+)\s*years?/i);
    if (singleYearMatch) {
      const requiredYears = parseInt(singleYearMatch[1], 10);
      return ageInMonths >= requiredYears * 12;
    }

    return false;
  };

  console.log(validateVaccineCategory(babyDOB, vaccineCategoryName));

  const isVaccineValid = validateVaccineCategory(babyDOB, vaccineCategoryName);

  return (
    <View style={styles.vaccine_update_container}>
      {fetchLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color="#fff" />
        </View>
      )}
      <View style={styles.vaccine_update_header} pointerEvents="box-none">
        <TouchableOpacity
          style={styles.back_icon_container}
          onPress={() => navigation.goBack()}
          accessible={true}>
          <Image source={back} style={styles.back_icon} />
        </TouchableOpacity>
        <Text style={styles.vaccine_update_heading}>Update Vaccination</Text>
      </View>
      <ScrollView contentContainerStyle={{flexGrow: 1}}>
        <View style={styles.vaccine_update_details}>
          <View style={styles.vaccine_update_name}>
            <Image source={vaccine_icon} style={styles.vaccine_icon} />
            <Text style={styles.vaccine_name} numberOfLines={2}>
              {vaccine.Vaccine_Name}
              {getVaccineSuffix(vaccine.Vaccine_Name)}
            </Text>
          </View>
          <View style={styles.vaccine_update_importance}>
            <Text style={styles.importance_title}>
              {vaccine.Vaccination_Importance}
            </Text>
            <Text style={styles.importance_para}>
              {vaccine.Vaccination_Benefits}
            </Text>
          </View>

          {getVaccineSuffix(vaccine.Vaccine_Name) && (
            <View style={styles.vaccine_update_risk}>
              <Text style={styles.risk_title}>
                Vaccination Priorities Based on Region & Risk
              </Text>
              <Text style={styles.risk_para}>
                {getVaccineRiskInfo(vaccine.Vaccine_Name)}
              </Text>
            </View>
          )}

          {isVaccineValid && (
            <View style={styles.vaccine_status}>
              <Text style={styles.status_heading}>Status</Text>
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => handleVaccinationStatus('Vaccinated')}>
                <View
                  style={[
                    styles.checkbox_square,
                    vaccinationEdit.vaccinationStatus === 'Vaccinated' && styles.checked_square,
                  ]}>
                  {vaccinationEdit.vaccinationStatus === 'Vaccinated' && (
                    <Image source={tick} style={styles.tick_icon} />
                  )}
                </View>
                <Text style={styles.checkbox_text}>Vaccinated</Text>
              </TouchableOpacity>
              {vaccinationEdit.vaccinationStatus === 'Vaccinated' && (
                <View style={styles.post_vaccine_reactions}>
                  <Text style={styles.post_vaccine_reactions_head}>
                    Any Post-Vaccine Reactions?
                  </Text>
                  <View style={styles.radio_options}>
                    <TouchableOpacity
                      onPress={() => handlePostReactionStatus('Yes')}
                      style={styles.radiobox}>
                      <View
                        style={[
                          styles.checkbox_circle,
                          vaccinationEdit.postVaccineReaction === 'Yes' &&
                            styles.checked_circle,
                        ]}>
                        {vaccinationEdit.postVaccineReaction === 'Yes' && (
                          <View style={styles.inner_checked_circle} />
                        )}
                      </View>
                      <Text style={styles.checkbox_text}>Yes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handlePostReactionStatus('No')}
                      style={styles.radiobox}>
                      <View
                        style={[
                          styles.checkbox_circle,
                          vaccinationEdit.postVaccineReaction === 'No' && styles.checked_circle,
                        ]}>
                        {vaccinationEdit.postVaccineReaction === 'No' && (
                          <View style={styles.inner_checked_circle} />
                        )}
                      </View>
                      <Text style={styles.checkbox_text}>No</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              {vaccinationEdit.vaccinationStatus === 'Vaccinated' &&
                vaccinationEdit.postVaccineReaction === 'Yes' && (
                  <View style={styles.post_vaccine_symptom}>
                    <Text style={styles.post_vaccine_symptom_title}>
                      Enter Post-Vaccine Reactions
                    </Text>
                    <View style={styles.post_vaccine_symptom_input_container}>
                      <TextInput
                        value={vaccinationEdit.vaccineSymptom}
                        style={styles.symptomInput}
                        onChangeText={validateVaccineSymptom}
                        placeholder="E.g., Mild Fever"
                        placeholderTextColor="#808080"
                      />
                    </View>
                    {vaccinationEdit.vaccineSymptomError ? (
                      <Text style={styles.errorText}>
                        {vaccinationEdit.vaccineSymptomError}
                      </Text>
                    ) : null}
                  </View>
                )}

              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => handleVaccinationStatus('Not Vaccinated')}>
                <View
                  style={[
                    styles.checkbox_square,
                    vaccinationEdit.vaccinationStatus === 'Not Vaccinated' &&
                      styles.checked_square,
                  ]}>
                  {vaccinationEdit.vaccinationStatus === 'Not Vaccinated' && (
                    <Image source={tick} style={styles.tick_icon} />
                  )}
                </View>
                <Text style={styles.checkbox_text}>Not Vaccinated</Text>
              </TouchableOpacity>
              {getVaccineSuffix(vaccine.Vaccine_Name) && (
                <TouchableOpacity
                  style={styles.checkbox}
                  onPress={() => handleVaccinationStatus('Skipped')}>
                  <View
                    style={[
                      styles.checkbox_square,
                      vaccinationEdit.vaccinationStatus === 'Skipped' && styles.checked_square,
                    ]}>
                    {vaccinationEdit.vaccinationStatus === 'Skipped' && (
                      <Image source={tick} style={styles.tick_icon} />
                    )}
                  </View>
                  <Text style={styles.checkbox_text}>Skipped</Text>
                </TouchableOpacity>
              )}
              {vaccinationEdit.vaccinationStatus === 'Skipped' && (
                <View style={styles.skipped_disclaimer_info}>
                  <Text>
                    <Text style={styles.skipped_disclaimer_text}>
                      ⓘ Disclaimer:
                    </Text>
                    <Text style={styles.skipped_disclaimer_info_text}>
                      Consult a doctor before making any decisions about
                      skipping.
                    </Text>
                  </Text>
                </View>
              )}
            </View>
          )}
          {vaccinationEdit.vaccinationStatus === 'Vaccinated' && (
            <>
              <View style={styles.vaccine_date_time}>
                <Text style={styles.date_time_title}>Date & Time</Text>
                <TouchableOpacity onPress={() => vaccinationEdit.setShowDatePicker(true)}>
                  <View style={styles.dateInputContainer}>
                    <TextInput
                      value={vaccinationEdit.displayDate}
                      style={styles.textInput}
                      placeholder="MMM DD, YYYY"
                      editable={false}
                      placeholderTextColor="#808080"
                    />

                    <Image source={calendar} style={styles.calendarIcon} />
                  </View>
                </TouchableOpacity>
                {vaccinationEdit.showDatePicker && (
                  <DatePicker
                    modal
                    mode="date"
                    open={vaccinationEdit.showDatePicker}
                    date={vaccinationEdit.selectedDate}
                    maximumDate={new Date()}
                    onConfirm={selectedDate => {
                      vaccinationEdit.setShowDatePicker(false);
                      vaccinationEdit.setDisplayeDate(formatDisplayDate(selectedDate));
                      vaccinationEdit.setStoreDate(formatStoredDate(selectedDate));
                      vaccinationEdit.setSelectedDate(selectedDate);
                      console.log(
                        'Stored Date:',
                        formatStoredDate(selectedDate),
                      );
                    }}
                    onCancel={() => vaccinationEdit.setShowDatePicker(false)}
                  />
                )}
                <TouchableOpacity onPress={() => vaccinationEdit.setShowTimePicker(true)}>
                  <View style={styles.timeInputContainer}>
                    <TextInput
                      value={vaccinationEdit.displayTime}
                      style={styles.textInput}
                      placeholder="HH:MM AM/PM"
                      editable={false}
                      placeholderTextColor="#808080"
                    />

                    <Image source={clock} style={styles.calendarIcon} />
                  </View>
                </TouchableOpacity>

                {vaccinationEdit.showTimePicker && (
                  <DatePicker
                    modal
                    mode="time"
                    open={vaccinationEdit.showTimePicker}
                    date={vaccinationEdit.selectedTime}
                    maximumDate={maxTime}
                    onConfirm={selectedTime => {
                      vaccinationEdit.setShowTimePicker(false);
                      vaccinationEdit.setSelectedTime(selectedTime);
                      vaccinationEdit.setDisplayTime(formatDisplayTime(selectedTime));
                      vaccinationEdit.setStoreTime(formatStoredTime(selectedTime));
                      console.log(
                        'Stored Time (UTC):',
                        formatStoredTime(selectedTime),
                      );
                    }}
                    onCancel={() => vaccinationEdit.setShowTimePicker(false)}
                  />
                )}
              </View>
              <View style={styles.vaccine_height_weight}>
                <Text style={styles.height_weight_title}>Height & Weight</Text>
                <Pressable
                  style={styles.height_field}
                  onPress={() => vaccinationEdit.heightInputRef.current?.focus()}>
                  <TextInput
                    ref={vaccinationEdit.heightInputRef}
                    value={vaccinationEdit.height}
                    style={styles.height_input}
                    placeholder="Height (cm)"
                    placeholderTextColor="#808080"
                    keyboardType="numeric"
                    onChangeText={validateHeight}
                  />
                  {vaccinationEdit.height.length > 0 && (
                    <Text style={styles.height_unit}>cm</Text>
                  )}
                  <Image style={styles.height_icon} source={height_icon} />
                </Pressable>
                {vaccinationEdit.heightError ? (
                  <Text style={styles.errorText}>{vaccinationEdit.heightError}</Text>
                ) : null}
                <Pressable
                  style={styles.weight_field}
                  onPress={() => vaccinationEdit.weightInputRef.current?.focus()}>
                  <TextInput
                    ref={vaccinationEdit.weightInputRef}
                    value={vaccinationEdit.weight}
                    style={styles.weight_input}
                    placeholder="Weight (kg)"
                    placeholderTextColor="#808080"
                    keyboardType="numeric"
                    onChangeText={validateWeight}
                  />
                  {vaccinationEdit.weight.length > 0 && (
                    <Text style={styles.weight_unit}>Kg</Text>
                  )}
                  <Image style={styles.weight_icon} source={weight_icon} />
                </Pressable>
                {vaccinationEdit.weightError ? (
                  <Text style={styles.errorText}>{vaccinationEdit.weightError}</Text>
                ) : null}
              </View>
            </>
          )}

          {(Array.isArray(vaccine.Disease_Info)
            ? vaccine.Disease_Info
            : [vaccine.Disease_Info]
          ).map((disease, index, arr) => {
            const isLastItem = index === arr.length - 1;
            return (
              <View
                key={index}
                style={[
                  styles.disease_info,
                  arr.length > 1 && !isLastItem ? {marginBottom: rh(2)} : {},
                  !isVaccineValid ? {marginTop: rh(2)} : {},
                ]}>
                <TouchableOpacity
                  onPress={() =>
                    setExpandDiseaseInfo(prev => ({
                      ...prev,
                      [index]: !prev[index],
                    }))
                  }>
                  <View style={styles.disease_info_header}>
                    <Text style={styles.disease_info_title}>
                      {disease.name}
                    </Text>
                    <Image
                      source={expandDiseaseInfo[index] ? dropup : dropdown}
                      style={styles.dropdown_icon}
                    />
                  </View>
                  {expandDiseaseInfo[index] && (
                    <Text style={styles.disease_info_description}>
                      {disease.definition}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            );
          })}

          <View style={styles.spread_info}>
            <TouchableOpacity
              onPress={() => setExpandSpreadInfo(!expandSpreadInfo)}>
              <View style={styles.spread_info_header}>
                <Text style={styles.spread_info_title}>
                  {vaccine.Disease_Spreading_Title}
                </Text>
                <Image
                  source={expandSpreadInfo ? dropup : dropdown}
                  style={styles.dropdown_icon}
                />
              </View>
              {expandSpreadInfo && (
                <>
                  {vaccine.Disease_Spreading_Description.split('\n').map(
                    (line, index) => (
                      <Text
                        key={index}
                        style={[
                          styles.spread_info_description,
                          line.trim().startsWith('•') && styles.bullet_point, // Apply marginLeft for bullet points
                        ]}>
                        {line}
                      </Text>
                    ),
                  )}
                </>
              )}
            </TouchableOpacity>
          </View>
          {babyRegion === 'india' ? (
            <View style={styles.disclaimer_info}>
              <Text>
                <Text style={styles.disclaimer_text}>ⓘ Disclaimer: </Text>
                <Text style={styles.disclaimer_info_text}>
                  This vaccination schedule follows Indian guidelines and is for
                  use in India only. Refer to{' '}
                </Text>
                <Text
                  style={styles.link_text}
                  onPress={() => Linking.openURL('https://mohfw.gov.in')}>
                  mohfw.gov.in
                </Text>
                <Text style={styles.disclaimer_info_text}>
                  , or consult your doctor.
                </Text>
              </Text>
            </View>
          ) : (
            <View style={styles.disclaimer_info}>
              <Text>
                <Text style={styles.disclaimer_text}>ⓘ Disclaimer: </Text>
                <Text style={styles.disclaimer_info_text}>
                  This vaccination schedule follows USA guidelines and is for
                  use in USA only. Refer to{' '}
                </Text>
                <Text
                  style={styles.link_text}
                  onPress={() =>
                    Linking.openURL(
                      'https://www.cdc.gov/vaccines-children/schedules/index.html',
                    )
                  }>
                  Vaccine Schedules | Childhood Vaccines | CDC
                </Text>
                <Text style={styles.disclaimer_info_text}>
                  , or consult your doctor.
                </Text>
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
      {vaccinationEdit.vaccinationStatus !== null && (
        <View style={styles.vaccine_update_confirm_container}>
          <TouchableOpacity
            style={styles.vaccine_update_confirm}
            onPress={() => {
              const payload = {
                Vaccination_List_ID: vaccine.Vaccination_List_ID,
                Status: vaccinationEdit.vaccinationStatus,
                Vaccine_Reaction: vaccinationEdit.postVaccineReaction,
                Post_Vaccination_Response: vaccinationEdit.vaccineSymptom,
                // Add other fields as needed (date, time, etc.)
              };
              vaccinationEdit.submitVaccinationStatus(payload);
            }}
            disabled={vaccinationEdit.updateLoading}>
            {vaccinationEdit.updateLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.vaccine_update_confirm_text}>Submit</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
      <Vaccination_Status_Modal
        visible={vaccinationEdit.statusmodalVisible}
        onClose={() => vaccinationEdit.setStatusModalVisible(false)}
        title={vaccinationEdit.statusModalTitle}
        message={vaccinationEdit.statusModalMessage}
        icon={vaccinationEdit.statusModalIcon}
        navigation={navigation}
        babyId={babyId}
      />
      <Custom_Alert
        visible={vaccinationEdit.alertModalVisible}
        onClose={() => {
          vaccinationEdit.setAlertModalVisible(false);
          if (!vaccinationEdit.isValidationModal) {
            navigation.navigate('Vaccination_Listpage', {babyId: babyId});
          }
        }}
        title={vaccinationEdit.alertModalTitle}
        message={vaccinationEdit.alertModalMessage}
      />
    </View>
  );
};

export default Vaccination_Editpage;

const styles = StyleSheet.create({
  vaccine_update_container: {
    backgroundColor: '#FBFBFB',
    flex: 1,
  },
  vaccine_update_header: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginVertical: rh(3),
    marginHorizontal: rw(4),
  },
  back_icon_container: {
    position: 'absolute',
    left: 0,
  },
  back_icon: {
    width: rh(4),
    height: rh(4),
  },
  vaccine_update_heading: {
    textAlign: 'center',
    color: '#151515',
    fontSize: isTabletPortrait ? rh(2.6) : rh(2.3),
    fontWeight: '700',
    fontFamily: Platform.OS === 'android' ? 'satoshi' : 'System',
  },
  vaccine_update_details: {
    backgroundColor: '#4789FC21',
    flex: 1,
  },
  vaccine_update_name: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: rh(1.5),
    padding: rh(2),
    marginVertical: rh(2),
    marginHorizontal: rw(3.5),
  },
  vaccine_icon: {
    width: rh(7),
    height: rh(7),
  },
  vaccine_name: {
    color: '#151515',
    fontSize: isTabletPortrait ? rf(1.7) : rf(2.1),
    fontWeight: '700',
    fontFamily: Platform.OS === 'android' ? 'satoshi' : 'System',
    flex: 1,
    flexWrap: 'wrap',
    flexShrink: 1,
    width: '100%',
    marginLeft: rh(1),
    lineHeight: rh(3),
  },
  vaccine_update_importance: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: rw(4),
    borderRadius: rh(1.5),
    padding: rh(2),
  },
  importance_title: {
    color: '#000000',
    fontSize: isTabletPortrait ? rf(1.7) : rf(2.1),
    fontWeight: '700',
    fontFamily: Platform.OS === 'android' ? 'satoshi' : 'System',
    lineHeight: rh(3),
  },
  importance_para: {
    color: '#4F4F4F',
    fontSize: isTabletPortrait ? rf(1.5) : rf(1.7),
    fontWeight: '500',
    fontFamily: Platform.OS === 'android' ? 'satoshi' : 'System',
    marginTop: isTabletPortrait ? rh(1) : rh(1),
    lineHeight: rh(2.7),
  },
  vaccine_update_risk: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: rw(4),
    borderRadius: rh(1.5),
    padding: rh(2),
    marginTop: rh(2),
  },
  risk_title: {
    color: '#000000',
    fontSize: isTabletPortrait ? rf(2) : rf(2.1),
    fontWeight: '900',
    fontFamily: Platform.OS === 'android' ? 'satoshi' : 'System',
    lineHeight: rh(3),
  },
  risk_para: {
    color: '#4F4F4F',
    fontSize: isTabletPortrait ? rf(1.6) : rf(1.7),
    fontWeight: '500',
    fontFamily: Platform.OS === 'android' ? 'satoshi' : 'System',
    marginTop: isTabletPortrait ? rh(1) : rh(1),
    lineHeight: rh(3),
  },
  vaccine_status: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: rw(4),
    borderRadius: rh(1.5),
    padding: rh(2),
    marginVertical: rh(2),
  },
  status_heading: {
    color: '#000000',
    fontSize: isTabletPortrait ? rf(1.7) : rf(2.1),
    fontWeight: '900',
    fontFamily: Platform.OS === 'android' ? 'satoshi' : 'System',
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: rh(2),
  },
  checkbox_square: {
    width: rh(2.5),
    height: rh(2.5),
    borderWidth: rh(0.1),
    borderColor: '#00000040',
    borderRadius: rh(0.5),
    alignItems: 'center',
    justifyContent: 'center',
  },
  checked_square: {
    backgroundColor: '#4789FC',
  },
  tick_icon: {
    width: rh(2),
    height: rh(2),
    tintColor: '#FFFFFF',
  },
  checkbox_text: {
    color: '#000000',
    fontSize: rf(1.6),
    fontWeight: '500',
    fontFamily: Platform.OS === 'android' ? 'satoshi' : 'System',
    marginLeft: rh(2),
  },
  post_vaccine_reactions: {
    flexDirection: 'column',
    padding: rh(2),
  },
  post_vaccine_reactions_head: {
    color: '#000000',
    fontSize: isTabletPortrait ? rf(1.7) : rf(2),
    fontWeight: '500',
    fontFamily: Platform.OS === 'android' ? 'satoshi' : 'System',
  },
  radio_options: {
    flexDirection: 'row',
  },
  radiobox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: rh(2),
    paddingBottom: rh(0),
    paddingLeft: rh(0),
  },
  checkbox_circle: {
    width: rh(2.5),
    height: rh(2.5),
    borderWidth: rh(0.1),
    borderColor: '#00000040',
    borderRadius: rh(2),
    alignItems: 'center',
    justifyContent: 'center',
  },
  checked_circle: {
    borderColor: '#4789FC',
  },
  inner_checked_circle: {
    width: rh(1.5),
    height: rh(1.5),
    backgroundColor: '#4789FC',
    borderRadius: rh(2),
  },
  vaccine_date_time: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: rw(4),
    borderRadius: rh(1.5),
    padding: rh(2),
  },
  date_time_title: {
    color: '#000000',
    fontSize: isTabletPortrait ? rf(1.7) : rf(2.1),
    fontWeight: '900',
    fontFamily: Platform.OS === 'android' ? 'satoshi' : 'System',
  },
  dateInputContainer: {
    marginTop: rh(2),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: rh(0.1),
    borderColor: '#00000040',
    borderRadius: rh(1.5),
    padding: rh(0.8),
  },
  timeInputContainer: {
    marginTop: rh(2),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: rh(0.1),
    borderColor: '#00000040',
    borderRadius: rh(1.5),
    padding: rh(0.8),
  },
  calendarIcon: {
    width: rh(3),
    height: rh(3),
  },
  textInput: {
    color: '#000000',
    fontSize: isTabletPortrait ? rf(1.4) : rf(2),
    fontWeight: '600',
    fontFamily: Platform.OS === 'android' ? 'satoshi' : 'System',
  },
  vaccine_height_weight: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: rw(4),
    borderRadius: rh(1.5),
    padding: rh(2),
    marginVertical: rh(2),
  },
  height_weight_title: {
    color: '#000000',
    fontSize: isTabletPortrait ? rf(1.7) : rf(2.1),
    fontWeight: '900',
    fontFamily: Platform.OS === 'android' ? 'satoshi' : 'System',
  },
  height_field: {
    marginTop: rh(2),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: rh(0.1),
    borderColor: '#00000040',
    borderRadius: rh(1.5),
    padding: rh(0.8),
  },
  height_input: {
    color: '#000000',
    fontSize: isTabletPortrait ? rf(1.5) : rf(2),
    fontWeight: '600',
    fontFamily: Platform.OS === 'android' ? 'satoshi' : 'System',
  },
  height_unit: {
    color: '#000000',
    fontSize: isTabletPortrait ? rf(1.5) : rf(2),
    fontWeight: '600',
    fontFamily: Platform.OS === 'android' ? 'satoshi' : 'System',
    flex: 1,
    marginLeft: rh(-3),
  },
  height_icon: {
    width: rh(3),
    height: rh(3),
  },
  weight_field: {
    marginTop: rh(2),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: rh(0.1),
    borderColor: '#00000040',
    borderRadius: rh(1.5),
    padding: rh(0.8),
  },
  weight_input: {
    color: '#000000',
    fontSize: isTabletPortrait ? rf(1.5) : rf(2),
    fontWeight: '600',
    fontFamily: Platform.OS === 'android' ? 'satoshi' : 'System',
  },
  weight_unit: {
    color: '#000000',
    fontSize: isTabletPortrait ? rf(1.5) : rf(2),
    fontWeight: '600',
    fontFamily: Platform.OS === 'android' ? 'satoshi' : 'System',
    flex: 1,
    marginLeft: rh(-3),
  },
  weight_icon: {
    width: rh(3),
    height: rh(3),
  },
  post_vaccine_symptom: {
    flexDirection: 'column',
    // alignItems: 'center',
    padding: rh(2),
  },
  post_vaccine_symptom_title: {
    color: '#000000',
    fontSize: isTabletPortrait ? rf(1.6) : rf(2),
    fontWeight: '500',
    fontFamily: Platform.OS === 'android' ? 'satoshi' : 'System',
  },
  post_vaccine_symptom_input_container: {
    marginTop: rh(2),
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: rh(0.1),
    borderColor: '#00000040',
    borderRadius: rh(1.5),
    padding: rh(0.8),
  },
  symptomInput: {
    color: '#000000',
    fontSize: isTabletPortrait ? rf(1.7) : rf(2),
    fontWeight: '600',
    fontFamily: Platform.OS === 'android' ? 'satoshi' : 'System',
    width: '100%',
  },
  errorText: {
    color: 'red',
    marginTop: 5,
  },
  disease_info: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: rw(4),
    borderRadius: rh(1.5),
    padding: rh(2),
  },
  disease_info_header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  disease_info_title: {
    color: '#000000',
    fontSize: isTabletPortrait ? rf(1.7) : rf(2.1),
    fontWeight: '900',
    fontFamily: Platform.OS === 'android' ? 'satoshi' : 'System',
    flexWrap: 'wrap',
    maxWidth: '90%',
    lineHeight: rh(3),
  },
  dropdown_icon: {
    width: rh(2.5),
    height: rh(2.5),
  },
  disease_info_description: {
    color: '#4F4F4F',
    fontSize: isTabletPortrait ? rf(1.5) : rf(1.7),
    fontWeight: '500',
    fontFamily: Platform.OS === 'android' ? 'satoshi' : 'System',
    marginTop: isTabletPortrait ? rh(1) : rh(1),
    lineHeight: rh(3),
  },
  spread_info: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: rw(4),
    borderRadius: rh(1.5),
    padding: rh(2),
    marginVertical: rh(2),
  },
  spread_info_header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  spread_info_title: {
    color: '#000000',
    fontSize: isTabletPortrait ? rf(1.7) : rf(2.1),
    fontWeight: '900',
    fontFamily: Platform.OS === 'android' ? 'satoshi' : 'System',
    flexWrap: 'wrap',
    maxWidth: '90%',
    lineHeight: rh(3),
  },
  spread_info_description: {
    color: '#4F4F4F',
    fontSize: isTabletPortrait ? rf(1.5) : rf(1.7),
    fontWeight: '500',
    fontFamily: Platform.OS === 'android' ? 'satoshi' : 'System',
    marginTop: isTabletPortrait ? rh(1) : rh(1),
    lineHeight: rh(3),
  },
  disclaimer_info: {
    marginHorizontal: rw(4),
    borderRadius: rh(1.5),
    padding: rh(2),
  },
  disclaimer_info_text: {
    color: '#4F4F4F',
    fontSize: isTabletPortrait ? rf(1.4) : rf(2),
    fontWeight: '400',
    fontFamily: Platform.OS === 'android' ? 'satoshi' : 'System',
    lineHeight: rh(2),
  },
  disclaimer_text: {
    color: '#4789FC',
    fontSize: isTabletPortrait ? rf(1.7) : rf(1.6),
    fontWeight: '500',
    fontFamily: Platform.OS === 'android' ? 'satoshi' : 'System',
    lineHeight: isTabletPortrait ? rh(2.7) : rh(2),
  },
  link_text: {
    textDecorationLine: 'underline',
    color: '#4F4F4F',
    fontSize: rf(1.5),
    fontWeight: '600',
    fontFamily: Platform.OS === 'android' ? 'satoshi' : 'System',
    lineHeight: rh(2),
  },
  vaccine_update_confirm_container: {
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    padding: rh(3),
    borderTopWidth: 1,
    borderTopColor: '#00000026',
  },
  vaccine_update_confirm: {
    backgroundColor: '#4789FC',
    borderRadius: rh(1.5),
    padding: rh(1.5),
    alignItems: 'center',
  },
  vaccine_update_confirm_text: {
    color: '#FFFFFF',
    fontSize: rf(2),
    fontWeight: '500',
    fontFamily: Platform.OS === 'android' ? 'satoshi' : 'System',
  },
  bullet_point: {
    marginLeft: rw(4),
  },
  loadingOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent overlay
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  skipped_disclaimer_info: {
    marginHorizontal: rw(4),
    marginVertical: rh(1),
    marginRight: rh(4),
  },
  skipped_disclaimer_info_text: {
    color: '#4F4F4F',
    fontSize: rf(1.5),
    fontWeight: '700',
    fontFamily: Platform.OS === 'android' ? 'satoshi' : 'System',
    lineHeight: rh(3),
  },
  skipped_disclaimer_text: {
    color: '#4789FC',
    fontSize: rf(1.5),
    fontWeight: '700',
    fontFamily: Platform.OS === 'android' ? 'satoshi' : 'System',
    lineHeight: rh(3),
  },
});