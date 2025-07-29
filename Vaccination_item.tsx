import {
  StyleSheet,
  Text,
  View,
  Image,
  ImageSourcePropType,
  TouchableOpacity,
  Platform,
  Dimensions,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {
  responsiveHeight as rh,
  responsiveWidth as rw,
  responsiveFontSize as rf,
} from 'react-native-responsive-dimensions';
import {useNavigation} from '@react-navigation/native';
import { useVaccination } from '../../../../features/Babycare/vaccination/hooks/useVaccination';
import { formatDate } from 'date-fns';

const {width, height} = Dimensions.get('window');

const isTablet = false; // Simplified for now
const isPortrait = height > width;
const isTabletPortrait = isTablet && isPortrait;

const Vaccination_item = ({
  vaccines,
  vaccineCategoryName,
  babyId,
  babyRegion,
}) => {
  const naviagte_icon: ImageSourcePropType = require('../../../../assets/vaccine_item_navigate_icon.png');
  const vaccinated_tick: ImageSourcePropType = require('../../../../assets/vaccinated_tick_icon.png');
  const not_vaccinated: ImageSourcePropType = require('../../../../assets/notvaccinated_icon.png');
  const skipped: ImageSourcePropType = require('../../../../assets/skipped_icon.png');

  const navigation = useNavigation();
  const alertShownRef = useRef(false);

  // Use the new hook
  const { babyDOB, calculateDueDate } = useVaccination(navigation, alertShownRef, babyId, vaccineCategoryName);

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

  return (
    <>
      {vaccines.map((vaccine, index) => (
        <TouchableOpacity
          key={vaccine.Vaccination_List_ID}
          style={styles.vaccine_item}
          onPress={() =>
            navigation.navigate('Vaccination_Editpage', {
              vaccine: vaccine,
              babyId: babyId,
              babyDOB: babyDOB,
              vaccineCategoryName: vaccineCategoryName,
              babyRegion: babyRegion,
            })
          }>
          <View style={styles.vaccine_item_details}>
            <Text style={styles.vaccine_item_name}>
              {vaccine.Vaccine_Name} {getVaccineSuffix(vaccine.Vaccine_Name)}
            </Text>
            {vaccine.is_updated ? (
              <Text style={styles.vaccine_item_update}>
                Updated on:{' '}
                <Text style={styles.vaccine_item_date}>
                  {formatDate(new Date(vaccine.updated_on))}
                </Text>
              </Text>
            ) : (
              calculateDueDate() && (
                <Text style={styles.vaccine_item_update}>
                  Due on:{' '}
                  <Text style={styles.vaccine_item_date}>
                    {calculateDueDate()}
                  </Text>
                </Text>
              )
            )}
          </View>
          {vaccine.Status === 'Vaccinated' && (
            <View style={styles.vaccinated_item_tick_container}>
              <Image
                source={vaccinated_tick}
                style={styles.vaccinated_tick_icon}
              />
            </View>
          )}
          {vaccine.Status === 'Not Vaccinated' && (
            <View style={styles.vaccinated_item_tick_container}>
              <Image
                source={not_vaccinated}
                style={styles.not_vaccinated_tick_icon}
              />
            </View>
          )}
          {vaccine.Status === 'Skipped' && (
            <View style={styles.vaccinated_item_tick_container}>
              <Image source={skipped} style={styles.skipped_tick_icon} />
            </View>
          )}

          <View>
            <Image
              source={naviagte_icon}
              style={styles.vaccine_item_navigation_icon}
            />
          </View>
        </TouchableOpacity>
      ))}
    </>
  );
};

export default Vaccination_item;

const styles = StyleSheet.create({
  vaccine_item: {
    borderColor: '#00000026',
    borderWidth: 1,
    marginVertical: isTabletPortrait ? rh(1.5) : rh(2),
    marginHorizontal: rw(4),
    borderRadius: rh(1.7),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: rh(2),
  },
  vaccine_item_details: {
    flexDirection: 'column',
    flex: 1,
  },
  vaccine_item_name: {
    color: '#000000',
    fontSize: isTabletPortrait ? rh(1.9) : rh(2),
    fontWeight: '700',
    fontFamily: Platform.OS === 'android' ? 'satoshi' : 'System',
    flexWrap: 'wrap',
    maxWidth: '90%',
    lineHeight: rh(3),
  },
  vaccine_item_update: {
    color: '#00000080',
    fontSize: rh(1.8),
    fontWeight: '500',
    fontFamily: Platform.OS === 'android' ? 'satoshi' : 'System',
    marginTop: rh(1),
  },
  vaccine_item_date: {
    color: '#000000',
    fontSize: rh(1.8),
    fontWeight: isTabletPortrait ? '600' : '600',
    fontFamily: Platform.OS === 'android' ? 'satoshi' : 'System',
  },
  vaccine_item_navigation_icon: {
    width: rh(2.5),
    height: rh(2.5),
  },
  vaccinated_item_tick_container: {
    marginRight: rh(1),
  },
  vaccinated_tick_icon: {
    width: rh(3.5),
    height: rh(3.5),
  },
  not_vaccinated_tick_icon: {
    width: rh(3.5),
    height: rh(3.5),
  },
  skipped_tick_icon: {
    width: rh(3.1),
    height: rh(3.1),
  },
});