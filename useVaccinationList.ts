// @ts-ignore
import { getAccessToken_Auth } from '../../../../screens/Authentications/Auth/authService';
import { useState, useCallback } from 'react';
import { getVaccinations } from '../services/vaccinationService';
import { getBabyDetails } from '../services/babyService';

export const useVaccinationList = (navigation: any, alertShownRef: any, babyId: string) => {
  const [vaccinationData, setVaccinationData] = useState<any>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [ageDropdownOptions, setAgeDropdownOptions] = useState<string[]>([]);
  const [babyRegion, setBabyRegion] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('Birth');

  const fetchVaccinationData = useCallback(async () => {
    if (!babyId) return;
    setLoading(true);
    try {
      const token = await getAccessToken_Auth(navigation, alertShownRef);
      const baby = await getBabyDetails(String(babyId), token);
      const region = baby.Region?.toLowerCase() || '';
      setBabyRegion(region);
      const data = await getVaccinations(String(babyId), token);
      console.log('[DEBUG] API /vaccinations response:', data);
      console.log('[DEBUG] Baby region:', region);
      data.categories.forEach((category: any) => {
        category.vaccinations.forEach((vaccine: any) => {
          console.log('[DEBUG] Vaccine region:', vaccine.Region);
        });
      });
      // Filter categories to include only those with vaccinations matching the baby's region
      let filteredCategories = data.categories
        .map((category: any) => {
          const matchingVaccinations = category.vaccinations.filter(
            (vaccine: any) => vaccine.Region?.toLowerCase() === region,
          );
          if (matchingVaccinations.length > 0) {
            return {
              ...category,
              vaccinations: matchingVaccinations,
            };
          }
          return null;
        })
        .filter((category: any) => category !== null);
      // Fallback: if no categories after region filtering, show all
      if (filteredCategories.length === 0) {
        console.log('[DEBUG] No categories after region filtering, using all categories');
        filteredCategories = data.categories;
      }
      console.log('[DEBUG] Filtered categories:', filteredCategories);
      setVaccinationData({ ...data, categories: filteredCategories });
      const categoryNames = filteredCategories.map(
        (category: any) => category.Vaccination_Category_Name,
      );
      setCategories(categoryNames);
      setAgeDropdownOptions(['All', ...categoryNames]);
    } catch (error) {
      console.log('[DEBUG] Error fetching vaccination data:', error);
    } finally {
      setLoading(false);
    }
  }, [navigation, alertShownRef, babyId]);

  return {
    vaccinationData,
    categories,
    ageDropdownOptions,
    babyRegion,
    loading,
    fetchVaccinationData,
    selectedCategory,
    setSelectedCategory,
  };
};
