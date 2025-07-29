import {
  StyleSheet,
  Text,
  View,
  ImageSourcePropType,
  Image,
  TouchableOpacity,
  Modal,
  Platform,
  Dimensions,
} from 'react-native';
import React from 'react';
import {
  responsiveHeight as rh,
  responsiveWidth as rw,
  responsiveFontSize as rf,
} from 'react-native-responsive-dimensions';
import DeviceInfo from 'react-native-device-info';

const {width, height} = Dimensions.get('window');

const isTablet = DeviceInfo.isTablet();
const isPortrait = height > width;
const isTabletPortrait = isTablet && isPortrait; 

const Vaccination_Status_Modal = ({
  visible,
  onClose,
  title,
  message,
  icon,
  navigation,
  babyId,
}) => {
  const handleContinue = () => {
    onClose();
    navigation.navigate('Vaccination_Listpage', {babyId: babyId});
  };
  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}>
      <View style={styles.modal_overlay}>
        <View style={styles.vaccinated_status_modal}>
          <Image source={icon} style={styles.vaccinated_status_image} />
          <Text style={styles.vaccinated_status_title}>{title}</Text>
          <Text style={styles.vaccinated_status_para}>{message}</Text>
          <TouchableOpacity
            style={styles.vaccinated_status_button}
            onPress={handleContinue}>
            <Text style={styles.vaccinated_status_button_text}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default Vaccination_Status_Modal;

const styles = StyleSheet.create({
  modal_overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  vaccinated_status_modal: {
    backgroundColor: 'white',
    borderRadius: rh(2),
    margin: rh(2),
    padding: rh(2),
    width: undefined,
  },
  vaccinated_status_image: {
    width: rh(11),
    height: rh(11),
    alignSelf: 'center',
  },
  vaccinated_status_title: {
    color: '#000000',
    fontSize: rf(2.1),
    textAlign: 'center',
    fontWeight: '900',
    fontFamily: Platform.OS === 'android' ? 'satoshi' : 'System',
    marginTop: rh(2),
  },
  vaccinated_status_para: {
    color: '#000000',
    fontSize :rf(1.7),
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: rh(3),
    marginTop: rh(2),
    fontFamily: Platform.OS === 'android' ? 'satoshi' : 'System',
  },
  vaccinated_status_button: {
    backgroundColor: '#4789FC',
    borderRadius: rh(1.5),
    padding: rh(1.5),
    alignItems: 'center',
    marginTop: rh(2),
  },
  vaccinated_status_button_text: {
    color: '#FFFFFF',
    fontSize: rf(2),
    fontWeight: '500',
    fontFamily: Platform.OS === 'android' ? 'satoshi' : 'System',
  },
});