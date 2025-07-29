import {
  ImageSourcePropType,
  StyleSheet,
  Text,
  View,
  Image,
  Platform,
  TouchableOpacity,
  ScrollView,
  Modal,
  FlatList,
  TouchableWithoutFeedback,
  BackHandler,
  Dimensions,
} from 'react-native';
import { Animated } from 'react-native';
import {InteractionManager} from 'react-native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  responsiveHeight as rh,
  responsiveWidth as rw,
  responsiveFontSize as rf,
} from 'react-native-responsive-dimensions';
import Vaccination_item from './Vaccination_item';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {ActivityIndicator} from 'react-native-paper';
import Custom_Alert from '../../../Home/Alarm/Custom_Alert';
import { useVaccinationList } from '../../../../features/Babycare/vaccination/hooks/useVaccinationList';

const {width, height} = Dimensions.get('window');

const isTablet = false; // Simplified for now
const isPortrait = height > width;
const isTabletPortrait = isTablet && isPortrait;

const Vaccination_ListPage = ({route}: any) => {
  const back: ImageSourcePropType = require('../../../../assets/back.png');
  const vaccine: ImageSourcePropType = require('../../../../assets/vaccine.png');
  const download: ImageSourcePropType = require('../../../../assets/vaccine_report_share.png');
  const menu: ImageSourcePropType = require('../../../../assets/threeDots.png');
  const removeIcon: ImageSourcePropType = require('../../../../assets/removeIcon.png');
  const tick: ImageSourcePropType = require('../../../../assets/tick.png');
  const dropdown: ImageSourcePropType = require('../../../../assets/vaccine_dropdown.png');
  const dropup: ImageSourcePropType = require('../../../../assets/vaccine_dropup.png');
  const norecord: ImageSourcePropType = require('../../../../assets/vaccine_norecord.png');

  const scrollRef = useRef<any>(null);
  const categoryRefs = useRef<{[key: string]: any}>({});

  const navigation = useNavigation();
  useEffect(() => {
    const backAction = () => {
      // navigation.replace('Settings'); // Navigate to "Record" page
      navigation.goBack();
      return true; // Prevent default back behavior
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove(); // Cleanup the event listener
  }, [navigation]);

  const alertShownRef = useRef(false);
  const {babyId} = route.params;

  // Use the new hook
  const vaccinationList = useVaccinationList(navigation, alertShownRef, babyId);

  useEffect(() => {
    vaccinationList.fetchVaccinationData();
  }, [babyId]);

  // Replace all state and logic with values from the hook
  // Example usage:
  // vaccinationList.vaccinationData, vaccinationList.categories, etc.
  // vaccinationList.fetchVaccinationData()

  const [filteredVaccines, setFilteredVaccines] = useState([]);

  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  // Ensure status filter is set to 'All' by default
  const [filterVaccineStatus, setFilterVaccineStatus] = useState<
    'All' | 'Vaccinated' | 'Not Vaccinated' | 'Skipped'
  >('All');

  const [reportModalVisible, setReportModalVisible] = useState(false);

  // Remove unused state variables
  // (Removed unused vaccinationData, isCategoryAutoSelected)
  const [scrollToCategory, setScrollToCategory] = useState<string | null>(null);

  const [isAgeDropdownVisible, setIsAgeDropdownVisible] = useState(false);
  const [multiSelectedAgeGroups, setMultiSelectedAgeGroups] = useState<
    string[]
  >([]);
  const [ageDropdownOptions, setAgeDropdownOptions] = useState<string[]>([]);
  const [ageContainerHeight, setAgeContainerHeight] = useState(0);

  const [isCategoryDropdownVisible, setIsCategoryDropdownVisible] =
    useState(false);
  const [multiSelectedCategory, setMultiSelectedCategory] = useState<string[]>(
    [],
  );

  const categoryDropdownOptions = [
    'All',
    'Vaccinated',
    'Not Vaccinated',
    'Skipped',
  ];
  const [categoryContainerHeight, setCategoryContainerHeight] = useState(0);

  const [alertModalVisible, setAlertModalVisible] = useState(false);
  const [alertModalTitle, setAlertModalTitle] = useState('');
  const [alertModalMessage, setAlertModalMessage] = useState('');

  const [reportLoading, setReportLoading] = useState(false);

  const [babyRegion, setBabyRegion] = useState<string>('');

  // Restore hasUserSelectedCategory state for category selection/scroll logic
  const [hasUserSelectedCategory, setHasUserSelectedCategory] = useState(false);

  // useFocusEffect(
  //   useCallback(() => {
  //     const fetchVaccinationData = async () => {
  //       try {
  //         const token = await getAccessToken_Auth(navigation, alertShownRef);
  //         const headers = {Authorization: `Bearer ${token}`};

  //         const babyResponse = await api.get(`/babies/${babyId}`, {headers});
  //         const babyRegion = babyResponse.data.Region?.toLowerCase();

  //         const response = await api.get(`/babies/${babyId}/vaccinations`, {
  //           headers,
  //         });
  //         if (
  //           response.data.categories.some((category: any) =>
  //             category.vaccinations.some(
  //               (vaccine: any) => vaccine.Region?.toLowerCase() === babyRegion,
  //             ),
  //           )
  //         ) {
  //           setVaccinationData(response.data);

  //           const categoryNames = response.data.categories.map(
  //             (category: any) => category.Vaccination_Category_Name,
  //           );
  //           setCategories(categoryNames);
  //           setAgeDropdownOptions(['All', ...categoryNames]);
  //         } else {
  //           setVaccinationData(null);
  //         }

  //         // setSelectedCategory(categoryNames[0]);
  //       } catch (error) {
  //         console.log('Error fetching vaccination data:', error);
  //       } finally {
  //         setLoading(false);
  //       }
  //     };

  //     fetchVaccinationData();
  //   }, []),
  // );
  useEffect(() => {
    setHasUserSelectedCategory(false);
  }, [babyId, babyRegion]);

  useFocusEffect(
    useCallback(() => {
      // The hook handles fetching and state updates
      // We just need to set the initial scrollToCategory if the hook's data is ready
      if (vaccinationList.vaccinationData) {
        const finalCategory = vaccinationList.categories.includes(
          vaccinationList.selectedCategory,
        )
          ? vaccinationList.selectedCategory
          : vaccinationList.categories[0];

        if (!hasUserSelectedCategory) {
          vaccinationList.setSelectedCategory(finalCategory);
          setScrollToCategory(finalCategory);
          console.log('[DEBUG] Will scroll to:', finalCategory);
        }

        InteractionManager.runAfterInteractions(() => {
          requestAnimationFrame(() => {
            const node = categoryRefs.current[finalCategory];
            const scrollNode = scrollRef.current;

            console.log(
              '[DEBUG] Trying to scroll to category:',
              finalCategory,
            );
            console.log(
              '[DEBUG] node:',
              !!node,
              'scrollRef:',
              !!scrollNode,
            );

            if (node && scrollNode) {
              node.measureLayout(
                (scrollNode as any).getInnerViewNode(),
                (x: number, y: number) => {
                  console.log('[DEBUG] Scroll position x:', x);
                  (scrollNode as any).scrollTo({
                    x: Math.max(x - 50, 0),
                    animated: true,
                  });
                },
                (error: any) => {
                  console.log('[DEBUG] measureLayout error:', error);
                },
              );
            } else {
              console.log('[DEBUG] Category ref or scrollRef not ready.');
            }
          });
        });
      }
    }, [
      vaccinationList.vaccinationData,
      vaccinationList.categories,
      vaccinationList.selectedCategory,
      hasUserSelectedCategory,
      route?.params?.regionUpdated,
    ]),
  );

  useEffect(() => {
    if (!vaccinationList.vaccinationData) {
      setFilteredVaccines([]);
      return;
    }

    const selectedCategoryData = (vaccinationList.vaccinationData.categories as Array<any>).find(
      (category: any) =>
        category.Vaccination_Category_Name === vaccinationList.selectedCategory,
    );

    if (!selectedCategoryData) {
      setFilteredVaccines([]);
      return;
    }

    let vaccines = (selectedCategoryData && selectedCategoryData.vaccinations) ? selectedCategoryData.vaccinations : [];
    // Enable status filtering logic
    if (filterVaccineStatus !== 'All') {
      vaccines = vaccines.filter(
        (vaccine: any) => (vaccine.Status || '').toLowerCase() === filterVaccineStatus.toLowerCase()
      );
    }
    console.log('Filtered vaccines for display:', vaccines);
    setFilteredVaccines(vaccines);
  }, [vaccinationList.vaccinationData, filterVaccineStatus, vaccinationList.selectedCategory]);

  // Improve error handling for API errors and empty data
  useEffect(() => {
    if (vaccinationList.vaccinationData && vaccinationList.vaccinationData.categories.length === 0) {
      setAlertModalTitle('No Vaccination Data');
      setAlertModalMessage('No vaccination data available for this baby or region.');
      setAlertModalVisible(true);
    }
  }, [vaccinationList.vaccinationData]);

  const toggleAgeSelection = (option: string) => {
    let updatedSelection = [...multiSelectedAgeGroups];

    if (option === 'All') {
      if (updatedSelection.includes('All')) {
        setMultiSelectedAgeGroups([]);
      } else {
        setMultiSelectedAgeGroups([...ageDropdownOptions]);
      }
    } else {
      if (updatedSelection.includes(option)) {
        updatedSelection = updatedSelection.filter(item => item !== option);
      } else {
        updatedSelection.push(option);
      }

      const allOptionsExceptAll = ageDropdownOptions.filter(
        item => item !== 'All',
      );
      const allSelected = allOptionsExceptAll.every(item =>
        updatedSelection.includes(item),
      );

      if (allSelected) {
        updatedSelection.push('All');
      } else {
        updatedSelection = updatedSelection.filter(item => item !== 'All');
      }

      setMultiSelectedAgeGroups(updatedSelection);
    }
  };
  useEffect(() => {
    if (!scrollToCategory) return;

    // Delay scroll to ensure refs are ready
    const timeout = setTimeout(() => {
      const node = categoryRefs.current[scrollToCategory];
      const scrollNode = scrollRef.current;

      console.log('[SCROLL DEBUG] Retrying scroll to:', scrollToCategory);

      if (node && scrollNode) {
        node.measureLayout(
          (scrollNode as any).getInnerViewNode(),
          (x: number, y: number) => {
            console.log('[SCROLL DEBUG] Scrolling to x:', x);
            (scrollNode as any).scrollTo({x: Math.max(x - 30, 0), animated: true});
            setScrollToCategory(null);
          },
          (error: any) => {
            console.log('[SCROLL DEBUG] measureLayout error:', error);
            setScrollToCategory(null);
          },
        );
      } else {
        console.log('[SCROLL DEBUG] Still not ready:', {
          node: !!node,
          scrollNode: !!scrollNode,
        });
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [scrollToCategory]);

  const toggleCAtegorySelection = (option: string) => {
    let updatedSelection = [...multiSelectedCategory];

    if (option === 'All') {
      if (updatedSelection.includes('All')) {
        setMultiSelectedCategory([]);
      } else {
        setMultiSelectedCategory([...categoryDropdownOptions]);
      }
    } else {
      if (updatedSelection.includes(option)) {
        updatedSelection = updatedSelection.filter(item => item !== option);
      } else {
        updatedSelection.push(option);
      }

      const allOptionsExceptAll = categoryDropdownOptions.filter(
        item => item !== 'All',
      );
      const allSelected = allOptionsExceptAll.every(item =>
        updatedSelection.includes(item),
      );

      if (allSelected) {
        updatedSelection.push('All');
      } else {
        updatedSelection = updatedSelection.filter(item => item !== 'All');
      }

      setMultiSelectedCategory(updatedSelection);
    }
  };

  const fetchFilteredVaccinationData = async () => {
    if (
      multiSelectedAgeGroups.length === 0 ||
      multiSelectedCategory.length === 0
    ) {
      setAlertModalTitle('Please Check!');
      setAlertModalMessage('Kindly select both age group and category. ');
      setAlertModalVisible(true);
      return;
    }
    setReportLoading(true);
    try {
      // Use the data from the hook instead of making a new API call
      const data = vaccinationList.vaccinationData;
      if (!data || !data.categories) {
        console.log("Invalid API response: Missing 'categories' key");
        setReportLoading(false);
        return;
      }

      data.categories.forEach((category: { vaccinations: { Region: string }[] }) => {
        (category.vaccinations as Array<{ Region: string }>).
          forEach((vaccine: { Region: string }) => {
            console.log('[DEBUG] Vaccine region:', vaccine.Region);
          });
      });

      let filteredCategories = data.categories
        .map((category: any) => {
          const matchingVaccinations = (category.vaccinations as Array<{ Region: string }>).filter(
            (vaccine: { Region: string }) => vaccine.Region?.toLowerCase() === vaccinationList.babyRegion,
          );
          if (
            matchingVaccinations.length > 0 &&
            multiSelectedAgeGroups.includes(category.Vaccination_Category_Name)
          ) {
            return {
              ...category,
              vaccinations: matchingVaccinations,
            };
          }
          return null;
        })
        .filter((category: unknown) => category !== null);

      // Extract Vaccination_List_IDs from filtered categories
      const vaccinationListIDs = filteredCategories
        .flatMap((category: any) => category.vaccinations)
        .map((vaccine: any) => vaccine.Vaccination_List_ID);

      console.log('Filtered Vaccination List IDs:', vaccinationListIDs);

      // If no data found, show alert modal
      if (vaccinationListIDs.length === 0) {
        setAlertModalTitle('No Data Found');
        setAlertModalMessage(
          'There are no records for the selected age group and category.',
        );
        setAlertModalVisible(true);
        setReportLoading(false);
        return;
      }

      // If data exists, navigate
      setReportModalVisible(false);
      (navigation as any).navigate(
        'Vaccination_Reportpage',
        {
           selectedAgeGroups: multiSelectedAgeGroups,
           selectedCategories: multiSelectedCategory,
           babyId: babyId,
           babyRegion: vaccinationList.babyRegion,
        }
      );

      // Reset selections
      setMultiSelectedAgeGroups([]);
      setMultiSelectedCategory([]);
    } catch (error) {
      console.log('Error fetching vaccination data:', error);
    } finally {
      setReportLoading(false);
    }
  };

  return (
    <View style={styles.vaccine_list_container}>
      <View style={styles.vaccine_list_header}>
        <View style={styles.header_leftsection}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image
              source={back}
              style={styles.back_icon}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <Image
            source={vaccine}
            style={styles.vaccine_icon}
            resizeMode="contain"
          />
          <Text style={styles.vaccine_list_heading}>Vaccination</Text>
        </View>
        {vaccinationList.vaccinationData != null && (
          <View style={styles.header_rightsection}>
            <TouchableOpacity onPress={() => setReportModalVisible(true)}>
              <Image
                source={download}
                style={styles.vaccine_list_download}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setFilterMenuVisible(true)}>
              <Image
                source={menu}
                style={styles.vaccine_list_menu}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
        )}
      </View>
      {vaccinationList.loading ? (
        <View style={styles.loading_container}>
          <ActivityIndicator size="small" color="#4789FC" />
        </View>
      ) : (
        <>
          <View style={styles.fixed_vaccine_duration_container}>
            <Animated.ScrollView
              ref={scrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.vaccine_duration_container}>
              {vaccinationList.categories.map((category: any) => (
                <View
                  key={category}
                  ref={(ref: any) => {
                    if (ref) categoryRefs.current[category] = ref;
                  }}>
                  <TouchableOpacity
                    style={[
                      styles.vaccine_duration,
                      vaccinationList.selectedCategory === category &&
                        styles.selected_vaccine_duration,
                    ]}
                    onPress={() => {
                      console.log('User selected category:', category);
                      vaccinationList.setSelectedCategory(category);
                      setHasUserSelectedCategory(true);
                    }}>
                    <Text
                      style={[
                        styles.vaccine_duration_text,
                        vaccinationList.selectedCategory === category &&
                          styles.selected_vaccine_duration_text,
                      ]}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </Animated.ScrollView>

            {/* <ScrollView
              ref={scrollRef}
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.vaccine_duration_container}>
              {categories.map(category => (
                <TouchableOpacity
                  key={category}
                  ref={ref => {
                    if (ref) categoryRefs.current[category] = ref;
                  }}
                  style={[
                    styles.vaccine_duration,
                    selectedCategory === category &&
                      styles.selected_vaccine_duration,
                  ]}
                  onPress={() => vaccinationList.setSelectedCategory(category)}>
                  <Text
                    style={[
                      styles.vaccine_duration_text,
                      selectedCategory === category &&
                        styles.selected_vaccine_duration_text,
                    ]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView> */}
          </View>
          {filteredVaccines.length > 0 ? (
            <ScrollView showsVerticalScrollIndicator={false}>
              <Vaccination_item
                vaccines={filteredVaccines}
                vaccineCategoryName={vaccinationList.selectedCategory}
                babyId={babyId}
                babyRegion={babyRegion}
              />
            </ScrollView>
          ) : (
            <View style={styles.vaccine_empty}>
              <Image style={styles.vaccine_empty_image} source={norecord} />
              <Text style={styles.vaccine_empty_title}>No Records</Text>
              <Text style={styles.vaccine_empty_description}>
                {vaccinationList.vaccinationData === null
                  ? 'No vaccination data available for your region.'
                  : filteredVaccines.length === 0 && filterVaccineStatus !== 'All'
                    ? `No vaccines found for status: ${filterVaccineStatus}`
                    : 'There are no records to show you right now.'}
              </Text>
            </View>
          )}
        </>
      )}
      <Modal
        transparent={true}
        visible={filterMenuVisible}
        animationType="none"
        onRequestClose={() => setFilterMenuVisible(!filterMenuVisible)}>
        {filterMenuVisible && (
          <TouchableOpacity
            activeOpacity={1}
            style={styles.modalContainer}
            onPress={() => setFilterMenuVisible(!filterMenuVisible)}>
            <View style={styles.modalContent}>
              <TouchableOpacity
                style={[
                  styles.menuItem,
                  filterVaccineStatus === 'All' && {
                    backgroundColor: '#4789FC33',
                    borderTopLeftRadius: 8,
                    borderTopRightRadius: 8,
                  },
                ]}
                onPress={() => {
                  setFilterVaccineStatus('All');
                  setFilterMenuVisible(false);
                }}>
                <Text style={styles.menuText}>All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.menuItem,
                  filterVaccineStatus === 'Vaccinated' && {
                    backgroundColor: '#4789FC33',
                  },
                ]}
                onPress={() => {
                  setFilterVaccineStatus('Vaccinated');
                  setFilterMenuVisible(false);
                }}>
                <Text style={styles.menuText}>Vaccinated</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.menuItem,
                  filterVaccineStatus === 'Not Vaccinated' && {
                    backgroundColor: '#4789FC33',
                  },
                ]}
                onPress={() => {
                  setFilterVaccineStatus('Not Vaccinated');
                  setFilterMenuVisible(false);
                }}>
                <Text style={styles.menuText}>Not Vaccinated</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.menuItem,
                  filterVaccineStatus === 'Skipped' && {
                    backgroundColor: '#4789FC33',
                    borderBottomLeftRadius: 8,
                    borderBottomRightRadius: 8,
                  },
                ]}
                onPress={() => {
                  setFilterVaccineStatus('Skipped');
                  setFilterMenuVisible(false);
                }}>
                <Text style={styles.menuText}>Skipped</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      </Modal>
      <Modal
        transparent={true}
        visible={reportModalVisible}
        animationType="fade"
        onRequestClose={() => {
          if (isAgeDropdownVisible || isCategoryDropdownVisible) {
            setIsAgeDropdownVisible(false);
            setIsCategoryDropdownVisible(false);
          } else {
            setReportModalVisible(false);
            setMultiSelectedAgeGroups([]);
            setMultiSelectedCategory([]);
          }
        }}>
        <TouchableWithoutFeedback
          onPress={() => {
            if (isAgeDropdownVisible || isCategoryDropdownVisible) {
              setIsAgeDropdownVisible(false);
              setIsCategoryDropdownVisible(false);
            } else {
              setReportModalVisible(false);
              setMultiSelectedAgeGroups([]);
              setMultiSelectedCategory([]);
            }
          }}
          accessible={false}>
          <View style={styles.report_modal_container}>
            <TouchableWithoutFeedback>
              <View style={styles.report_modal_content}>
                <View style={styles.report_modal_header}>
                  <Image
                    source={vaccine}
                    style={styles.report_modal_vaccine_icon}
                  />
                  <Text style={styles.report_modal_heading}>
                    Vaccination Report
                  </Text>
                </View>
                <View style={styles.report_modal_fields}>
                  <Text style={styles.report_modal_age_title}>
                    Select Age Group
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.report_modal_age_container,
                      {
                        backgroundColor:
                          multiSelectedAgeGroups.length > 0
                            ? 'white'
                            : '#00000014',
                      },
                    ]}
                    onPress={() => {
                      setIsAgeDropdownVisible(!isAgeDropdownVisible);
                      setIsCategoryDropdownVisible(false);
                    }}
                    onLayout={event => {
                      setAgeContainerHeight(event.nativeEvent.layout.height);
                    }}>
                    <View style={styles.report_modal_age_input}>
                      {multiSelectedAgeGroups.includes('All') ? (
                        <View style={styles.selected_age_groups_container}>
                          <View style={styles.selected_age_group}>
                            <Text style={styles.selected_age_text}>All</Text>
                            <TouchableOpacity
                              onPress={() => setMultiSelectedAgeGroups([])}>
                              <Image
                                source={removeIcon}
                                style={styles.remove_icon}
                              />
                            </TouchableOpacity>
                          </View>
                        </View>
                      ) : multiSelectedAgeGroups.length > 0 ? (
                        <View style={styles.selected_age_groups_container}>
                          {multiSelectedAgeGroups.map((age, index) => (
                            <View key={index} style={styles.selected_age_group}>
                              <Text style={styles.selected_age_text}>
                                {age}
                              </Text>
                              <TouchableOpacity
                                onPress={() => toggleAgeSelection(age)}>
                                <Image
                                  source={removeIcon}
                                  style={styles.remove_icon}
                                />
                              </TouchableOpacity>
                            </View>
                          ))}
                        </View>
                      ) : (
                        <Text style={styles.report_modal_age_input_placeholder}>
                          Select Age Group
                        </Text>
                      )}
                    </View>
                    {isAgeDropdownVisible ? (
                      <Image
                        source={dropup}
                        style={styles.report_modal_age_dropdown}
                      />
                    ) : (
                      <Image
                        source={dropdown}
                        style={styles.report_modal_age_dropdown}
                      />
                    )}
                  </TouchableOpacity>

                  {isAgeDropdownVisible && (
                    <View
                      style={[
                        styles.age_dropdown_container,
                        {
                          top: ageContainerHeight + rh(5),
                        },
                      ]}>
                      <ScrollView
                        style={styles.age_dropdown_scrollview}
                        nestedScrollEnabled={true}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={true}>
                        {ageDropdownOptions.map(option => {
                          const isSelected =
                            multiSelectedAgeGroups.includes(option);
                          //choudry
                          return (
                            <TouchableOpacity
                              key={option}
                              style={[styles.age_dropdown_option]}
                              onPress={() => toggleAgeSelection(option)}
                              testID={`age-checkbox-${option}`}
                              accessibilityLabel={`Age ${option} Checkbox`}>
                              <View
                                style={[
                                  styles.checkbox,
                                  isSelected && styles.checked_checkbox,
                                ]}>
                                {isSelected && (
                                  <Image
                                    source={tick}
                                    style={styles.tickMark}
                                  />
                                )}
                              </View>
                              <Text style={styles.age_dropdown_text}>
                                {option}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </ScrollView>
                    </View>
                  )}
                  <Text style={styles.report_modal_category_title}>
                    Select Category
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.report_modal_category_container,
                      {
                        backgroundColor:
                          multiSelectedCategory.length > 0
                            ? 'white'
                            : '#00000014',
                      },
                    ]}
                    onPress={() => {
                      setIsCategoryDropdownVisible(!isCategoryDropdownVisible);
                      setIsAgeDropdownVisible(false);
                    }}
                    onLayout={event => {
                      setCategoryContainerHeight(
                        event.nativeEvent.layout.height,
                      );
                    }}>
                    <View style={styles.report_modal_category_input}>
                      {multiSelectedCategory.includes('All') ? (
                        <View style={styles.selected_category_groups_container}>
                          <View style={styles.selected_category_group}>
                            <Text style={styles.selected_category_text}>
                              All
                            </Text>
                            <TouchableOpacity
                              onPress={() => setMultiSelectedCategory([])}>
                              <Image
                                source={removeIcon}
                                style={styles.remove_icon}
                              />
                            </TouchableOpacity>
                          </View>
                        </View>
                      ) : multiSelectedCategory.length > 0 ? (
                        <View style={styles.selected_category_groups_container}>
                          {multiSelectedCategory.map((category, index) => (
                            <View
                              key={index}
                              style={styles.selected_category_group}>
                              <Text style={styles.selected_category_text}>
                                {category}
                              </Text>
                              <TouchableOpacity
                                onPress={() =>
                                  toggleCAtegorySelection(category)
                                }>
                                <Image
                                  source={removeIcon}
                                  style={styles.remove_icon}
                                />
                              </TouchableOpacity>
                            </View>
                          ))}
                        </View>
                      ) : (
                        <Text
                          style={
                            styles.report_modal_category_input_placeholder
                          }>
                          Select Category
                        </Text>
                      )}
                    </View>
                    {isCategoryDropdownVisible ? (
                      <Image
                        source={dropup}
                        style={styles.report_modal_category_dropdown}
                      />
                    ) : (
                      <Image
                        source={dropdown}
                        style={styles.report_modal_category_dropdown}
                      />
                    )}
                  </TouchableOpacity>

                  {isCategoryDropdownVisible && (
                    <View
                      style={[
                        styles.category_dropdown_container,
                        {
                          top:
                            ageContainerHeight +
                            categoryContainerHeight +
                            rh(11),
                        },
                      ]}>
                      <ScrollView
                        style={styles.category_dropdown_scrollview}
                        nestedScrollEnabled={true}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={true}>
                        {categoryDropdownOptions.map(option => {
                          const isSelected =
                            multiSelectedCategory.includes(option);

                          return (
                            <TouchableOpacity
                              key={option}
                              style={[styles.category_dropdown_option]}
                              onPress={() => toggleCAtegorySelection(option)}
                              testID={`category-checkbox-${option}`}
                              accessibilityLabel={`Category ${option} Checkbox`}>
                              <View
                                style={[
                                  styles.checkbox,
                                  isSelected && styles.checked_checkbox,
                                ]}>
                                {isSelected && (
                                  <Image
                                    source={tick}
                                    style={styles.tickMark}
                                  />
                                )}
                              </View>
                              <Text style={styles.category_dropdown_text}>
                                {option}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </ScrollView>
                    </View>
                  )}
                </View>
                <View style={styles.report_modal_button_container}>
                  <TouchableOpacity
                    style={styles.report_modal_button}
                    onPress={fetchFilteredVaccinationData}
                    disabled={reportLoading}>
                    {reportLoading ? (
                      <ActivityIndicator size="small" color="white" /> // Show loading spinner
                    ) : (
                      <Text style={styles.report_modal_button_text}>
                        Export
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
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

export default Vaccination_ListPage;

const styles = StyleSheet.create({
  vaccine_list_container: {
    backgroundColor: '#FBFBFB',
    flex: 1,
  },
  vaccine_list_header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    marginVertical: rh(3),
    marginHorizontal: rw(4),
  },
  header_leftsection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rw(3),
  },
  header_rightsection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rw(4),
  },
  back_icon: {
    width: rh(4),
    height: rh(4),
  },
  vaccine_icon: {
    width: rh(6),
    height: rh(6),
  },
  vaccine_list_heading: {
    color: '#151515',
    fontSize: isTabletPortrait ? rf(2.1) : rf(2.3),
    fontWeight: '900',
    fontFamily: Platform.OS === 'android' ? 'satoshi' : 'System',
  },
  vaccine_list_download: {
    width: rh(3.5),
    height: rh(3.5),
  },
  vaccine_list_menu: {
    width: rh(3.5),
    height: rh(3.5),
  },
  vaccine_duration_container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: rh(1.2),
    paddingHorizontal: rw(4),
  },
  vaccine_duration: {
    borderColor: '#00000026',
    borderWidth: 1,
    borderRadius: rh(3),
    alignItems: 'center',
    marginHorizontal: rw(2),
  },
  selected_vaccine_duration: {
    borderWidth: 0,
    backgroundColor: '#4789FC',
  },
  vaccine_duration_text: {
    color: '#4F4F4F',
    fontSize: rf(1.7),
    fontWeight: '500',
    fontFamily: Platform.OS === 'android' ? 'satoshi' : 'System',
    paddingHorizontal: rh(5),
    paddingVertical: rh(1.2),
  },
  selected_vaccine_duration_text: {
    color: '#FFFFFF',
    fontSize: rf(1.7),
    fontWeight: '500',
    fontFamily: Platform.OS === 'android' ? 'satoshi' : 'System',
    paddingHorizontal: rh(5),
    paddingVertical: rh(1.2),
  },
  fixed_vaccine_duration_container: {
    backgroundColor: '#FBFBFB',
    zIndex: 1,
  },
  modalContent: {
    position: 'absolute',
    top: isTabletPortrait ? 110 : 80,
    right: isTabletPortrait ? 50 : 25,
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 5,
    width: isTabletPortrait ? rw(40) : rw(38),
  },
  menuItem: {
    paddingVertical: isTabletPortrait ? rw(3) : 10,
    paddingHorizontal: 15,
    alignSelf: 'stretch',
  },
  menuText: {
    fontSize: isTabletPortrait ? rf(1.2) : rf(1.7),
    fontWeight: '500',
    color: 'black',
    fontFamily: Platform.OS === 'android' ? 'satoshi' : 'System',
  },
  modalContainer: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 40,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  loading_container: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  report_modal_container: {
    flex: 1,
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  report_modal_content: {
    width: '90%',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: rh(2),
    elevation: 5,
  },
  report_modal_header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: rh(3),
    marginHorizontal: rw(4),
    alignSelf: 'center',
  },
  report_modal_heading: {
    color: '#151515',
    fontSize: rf(2),
    fontWeight: '900',
    fontFamily: Platform.OS === 'android' ? 'satoshi' : 'System',
    marginLeft: rh(2),
  },
  report_modal_vaccine_icon: {
    width: rh(6),
    height: rh(6),
  },
  report_modal_fields: {
    alignSelf: 'flex-start',
    marginVertical: rh(3),
    position: 'relative',
    marginHorizontal: rw(5),
  },
  report_modal_age_title: {
    color: '#151515',
    fontSize: rf(1.7),
    fontWeight: '700',
    fontFamily: Platform.OS === 'android' ? 'satoshi' : 'System',
  },
  report_modal_category_title: {
    color: '#151515',
    fontSize: rf(1.7),
    fontWeight: '700',
    fontFamily: Platform.OS === 'android' ? 'satoshi' : 'System',
    marginTop: 15,
  },

  checkbox: {
    width: rh(3),
    height: rh(3),
    borderWidth: 1,
    borderColor: '#4F4F4F',
    marginRight: rh(1.5),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: rh(0.5),
  },

  checked_checkbox: {
    backgroundColor: '#4789FC',
    borderColor: '#4789FC',
  },

  tickMark: {
    width: rh(1.5),
    height: rh(1.5),
    tintColor: 'white',
  },
  report_modal_age_container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: rh(3),
    paddingVertical: rh(2),
    marginTop: 15,
    fontSize: rf(1.7),
    fontFamily: Platform.OS === 'android' ? 'satoshi' : 'System',
    borderRadius: rh(1),
    borderColor: '#D9D9D9',
    borderWidth: 1,
  },
  report_modal_age_input: {
    width: '93%',
  },

  report_modal_age_input_placeholder: {
    color: '#808080',
    fontSize: rf(1.7),
    fontWeight: '500',
    fontFamily: Platform.OS === 'android' ? 'satoshi' : 'System',
  },
  report_modal_age_dropdown: {
    width: rh(2),
    height: rh(2),
  },
  age_dropdown_container: {
    width: '98%',
    position: 'absolute',
    left: 0,
    borderWidth: 1,
    borderColor: '#D9D9D9',
    borderRadius: rh(1),
    backgroundColor: '#fff',
    padding: rh(3),
    zIndex: 100,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    maxHeight: rh(30),
    minHeight: rh(30),
  },
  age_dropdown_scrollview: {
    flexGrow: 1,
  },
  age_dropdown_option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  age_dropdown_text: {
    fontSize: rf(1.8),
    color: '#151515',
    fontFamily: Platform.OS === 'android' ? 'satoshi' : 'System',
  },
  selected_age_groups_container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    maxWidth: '100%',
  },

  selected_age_group: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4789FC40',
    borderRadius: rh(1),
    paddingHorizontal: rh(1.5),
    paddingVertical: rh(0.8),
    marginRight: rh(1),
    marginBottom: rh(1),
  },

  selected_age_text: {
    color: '#151515',
    fontSize: rf(1.6),
    fontFamily: Platform.OS === 'android' ? 'satoshi' : 'System',
    fontWeight: '500',
  },

  remove_icon: {
    width: rh(2),
    height: rh(2),
    marginLeft: rh(1),
    marginTop: rh(0.3),
  },

  report_modal_category_container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: rh(3),
    paddingVertical: rh(2),
    marginTop: 15,
    fontSize: rf(1.7),
    fontFamily: Platform.OS === 'android' ? 'satoshi' : 'System',
    borderRadius: rh(1),
    backgroundColor: '#00000014',
    borderColor: '#D9D9D9',
    borderWidth: 1,
  },
  report_modal_category_input: {
    width: '90%',
  },

  report_modal_category_input_placeholder: {
    color: '#808080',
    fontSize: rf(1.7),
    fontWeight: '500',
    fontFamily: Platform.OS === 'android' ? 'satoshi' : 'System',
  },
  report_modal_category_dropdown: {
    width: rh(2),
    height: rh(2),
  },
  category_dropdown_container: {
    width: '98%',
    position: 'absolute',
    left: 0,
    borderWidth: 1,
    borderColor: '#D9D9D9',
    borderRadius: rh(1),
    backgroundColor: '#fff',
    padding: rh(3),
    zIndex: 100,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    maxHeight: rh(25),
    minHeight: rh(25),
  },
  category_dropdown_scrollview: {
    flexGrow: 1,
  },
  category_dropdown_option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  category_dropdown_text: {
    fontSize: rf(1.8),
    color: '#151515',
    fontFamily: Platform.OS === 'android' ? 'satoshi' : 'System',
  },
  selected_category_groups_container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    maxWidth: '100%',
  },

  selected_category_group: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4789FC40',
    borderRadius: rh(1),
    paddingHorizontal: rh(1.5),
    paddingVertical: rh(0.8),
    marginRight: rh(1),
    marginBottom: rh(1),
  },

  selected_category_text: {
    color: '#151515',
    fontSize: rf(1.6),
    fontWeight: '500',
    fontFamily: Platform.OS === 'android' ? 'satoshi' : 'System',
  },
  report_modal_button_container: {
    backgroundColor: '#FFFFFF',
    padding: rh(2),
    alignItems: undefined,
    borderBottomLeftRadius: rh(2),
    borderBottomRightRadius: rh(2),
  },
  report_modal_button: {
    backgroundColor: '#4789FC',
    borderRadius: rh(1.4),
    padding: rh(1.5),
    alignItems: 'center',
    minWidth: null,
  },
  report_modal_button_text: {
    color: '#FFFFFF',
    fontSize: rf(2),
    fontWeight: '500',
    fontFamily: Platform.OS === 'android' ? 'satoshi' : 'System',
  },
  vaccine_empty: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginTop: rh(-15),
  },
  vaccine_empty_title: {
    color: '#939090',
    fontSize: rf(2),
    fontWeight: '700',
    fontFamily: Platform.OS === 'android' ? 'satoshi' : 'System',
    lineHeight: rh(6),
  },
  vaccine_empty_description: {
    color: '#A0A0A0',
    fontSize: rf(1.7),
    fontWeight: '500',
    fontFamily: Platform.OS === 'android' ? 'satoshi' : 'System',
  },
  vaccine_empty_image: {
    width: rh(25),
    height: rh(25),
    resizeMode: 'contain',
  },
});