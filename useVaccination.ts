// @ts-ignore
import { getAccessToken_Auth } from '../../../../screens/Authentications/Auth/authService';
import { useState, useEffect } from 'react';
import { getBabyDetails } from '../services/babyService';

export const useVaccination = (navigation: any, alertShownRef: any, babyId: string, vaccineCategoryName: string) => {
  const [babyDOB, setBabyDOB] = useState<string | null>(null);

  useEffect(() => {
    if (!babyId) return;
    const fetchBabyDetails = async () => {
      try {
        const token = await getAccessToken_Auth(navigation, alertShownRef);
        const data = await getBabyDetails(String(babyId), token);
        setBabyDOB(data.DOB);
      } catch (error) {
        // handle error
      }
    };
    fetchBabyDetails();
  }, [navigation, alertShownRef, babyId]);

  const calculateDueDate = () => {
    if (!babyDOB) return '-';
    const dobDate = new Date(babyDOB);
    let dueDate = new Date(dobDate);
    const match = vaccineCategoryName.match(/(\d+)\s*(week|weeks|month|months|year|years)/i);
    if (match) {
      const value = parseInt(match[1], 10);
      const unit = match[2].toLowerCase();
      if (unit === 'week' || unit === 'weeks') {
        dueDate.setDate(dobDate.getDate() + value * 7);
      } else if (unit === 'month' || unit === 'months') {
        dueDate.setMonth(dobDate.getMonth() + value);
      } else if (unit === 'year' || unit === 'years') {
        dueDate.setFullYear(dobDate.getFullYear() + value);
      }
      return formatDate(dueDate);
    }
    if (vaccineCategoryName.toLowerCase() === 'birth') {
      return formatDate(dobDate);
    }
    return '';
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return {
    babyDOB,
    calculateDueDate,
  };
};
