 import axios from 'axios';
import properties from '../../../../targetenv.json';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import Share from 'react-native-share';
import RNFS from 'react-native-fs';

const api = axios.create({
  baseURL: properties.API_BASE_URL,
});

export const reportService = {
  // Fetch baby data and vaccination details
  async fetchBabyAndVaccinationData(
    babyId: string,
    babyRegion: string,
    selectedAgeGroups: string[],
    selectedCategories: string[],
    token: string
  ) {
    const headers = {Authorization: `Bearer ${token}`};

    // Fetch baby data
    const response_baby = await api.get(`/babies/${babyId}`, {headers});
    const babyData = response_baby.data;

    // Fetch vaccination data
    const response_vaccine = await api.get(
      `/babies/${babyId}/vaccinations`,
      {headers},
    );
    const allVaccinations = response_vaccine.data;

    if (!allVaccinations.categories) {
      console.log("Invalid API response: Missing 'categories' key");
      return {babyData, vaccinationDetails: []};
    }

    // Filter categories and vaccinations
    const filteredCategories = allVaccinations.categories
      .map(category => {
        const matchingVaccinations = category.vaccinations.filter(
          vaccine =>
            vaccine.Region?.toLowerCase() === babyRegion &&
            selectedCategories.includes(vaccine.Status),
        );
        if (
          matchingVaccinations.length > 0 &&
          selectedAgeGroups.includes(category.Vaccination_Category_Name)
        ) {
          return {
            ...category,
            vaccinations: matchingVaccinations,
          };
        }
        return null;
      })
      .filter(category => category !== null);

    let filteredVaccinations = [];
    filteredCategories.forEach(category => {
      category.vaccinations.forEach(vaccine => {
        if (selectedCategories.includes(vaccine.Status)) {
          filteredVaccinations.push({
            ...vaccine,
            Age_Group: category.Vaccination_Category_Name,
          });
        }
      });
    });

    const vaccinationListIDs = filteredVaccinations.map(
      vaccine => vaccine.Vaccination_List_ID,
    );

    // Fetch detailed vaccination status for each ID
    let fetchedData = [];
    for (const listID of vaccinationListIDs) {
      const response = await api.get(
        `/babies/${babyId}/vaccination-status/${listID}`,
        {headers},
      );
      const vaccinationDetail = response.data;

      const matchingVaccination = filteredVaccinations.find(
        v => v.Vaccination_List_ID === listID,
      );
      fetchedData.push({
        ...vaccinationDetail,
        Age_Group: matchingVaccination
          ? matchingVaccination.Age_Group
          : 'Unknown',
        Vaccine_Name: matchingVaccination
          ? matchingVaccination.Vaccine_Name
          : 'Unknown',
      });
    }

    return {babyData, vaccinationDetails: fetchedData};
  },

  // Calculate age from date of birth
  calculateAge(dob: string) {
    if (!dob) return '';
    
    const birthDate = new Date(dob);
    const today = new Date();

    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();

    if (days < 0) {
      months -= 1;
      const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += lastMonth.getDate();
    }

    if (months < 0) {
      years -= 1;
      months += 12;
    }

    const diffTime = Math.abs(today - birthDate);
    const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(totalDays / 7);

    if (years > 0) {
      return `${years} year${years > 1 ? 's' : ''} ${
        months > 0 ? months + ' month' + (months > 1 ? 's' : '') : ''
      }`.trim();
    } else if (months > 0) {
      return `${months} month${months > 1 ? 's' : ''} ${
        days > 0 ? days + ' day' + (days > 1 ? 's' : '') : ''
      }`.trim();
    } else if (totalDays >= 21) {
      return `${weeks} week${weeks > 1 ? 's' : ''}`;
    } else {
      return `${totalDays} day${totalDays > 1 ? 's' : ''}`;
    }
  },

  // Calculate due date for vaccination
  calculateDueDate(vaccineCategoryName: string, dob: string) {
    if (!dob) return '-';

    const dobDate = new Date(dob);
    let dueDate = new Date(dobDate);

    const match = vaccineCategoryName.match(/(\d+)\s*(weeks|months|years)/i);
    if (match) {
      const value = parseInt(match[1], 10);
      const unit = match[2].toLowerCase();

      if (unit === 'weeks') {
        dueDate.setDate(dobDate.getDate() + value * 7);
      } else if (unit === 'months') {
        dueDate.setMonth(dobDate.getMonth() + value);
      } else if (unit === 'years') {
        dueDate.setFullYear(dobDate.getFullYear() + value);
      }
      return this.formatDate(dueDate);
    }

    if (vaccineCategoryName.toLowerCase() === 'birth') {
      return this.formatDate(dobDate);
    }

    return '';
  },

  // Format date to readable string
  formatDate(date: Date) {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  },

  // Format time from 24-hour to 12-hour format
  formatTime(time24: string) {
    if (!time24) return null;

    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;

    return `${hours12}:${String(minutes).padStart(2, '0')} ${period}`;
  },

  // Get current formatted date
  getCurrentFormattedDate() {
    const currentDate = new Date();
    return `${currentDate.getDate()}.${
      currentDate.getMonth() + 1
    }.${currentDate.getFullYear().toString().slice(-2)}`;
  },

  // Generate HTML content for PDF (you'll need to implement this based on your existing htmlContent variable)
  generateHTMLContent(data: {
    babyData: any;
    vaccinatedList: any[];
    notVaccinatedList: any[];
    skippedList: any[];
    calculateAge: (dob: string) => string;
    calculateDueDate: (categoryName: string) => string;
    formatTime: (time: string) => string | null;
    formattedDate: string;
  }) {
    // This is a placeholder - you'll need to move your existing htmlContent generation logic here
    // For now, returning a basic HTML structure
    const {
      babyData,
      vaccinatedList,
      notVaccinatedList,
      skippedList,
      formattedDate
    } = data;

    return `
      <html>
  <head>
    <style>
      .vaccine_report_preview {
        border-width: 1px;
        border-color: #4789fc;
        margin: 3vh 4vw;
        overflow: hidden;
        border-style: solid;
      }

      .preview_header {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #4789fc;
      }

      .preview_header_left {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        flex: 1; 
      }

      .preview_logo {
        width: 50px !important; 
        height: 50px !important;
        object-fit: contain;
      }


      .preview_logo_text {
        color: #151515;
        font-size: 1.7rem;
        font-weight: 900;
        margin-left: 1vh;
        font-family: "Arial", sans-serif;
      }

      .preview_header_right {
        display: flex;
        flex-direction: column;
        border-left: 1px solid rgba(71, 137, 252, 0.3);
      }

      .baby_personal {
        display: flex;
        flex-direction: row;
        align-items: center;
        border-bottom: 1px solid rgba(71, 137, 252, 0.3);
        padding: 0vh 1vw;
      }

      .baby_personal_last {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-around;
        padding: 0vh 1vw;
      }

      .personal_title {
        color: #605c5c;
        font-size: 1.5rem;
        font-weight: 500;
        width: 25vw;
        text-align: left;
        flex-shrink: 1;
        font-family: "Arial", sans-serif;
      }

      .personal_value {
        color: #000000;
        font-size: 1.5rem;
        font-weight: 700;
        width: 20vw;
        text-align: left;
        flex-wrap: wrap;
        font-family: "Arial", sans-serif;
      }

      .personal_colon {
        color: #605c5c;
        font-size: 1.5rem;
        font-weight: 500;
        width: 5vw;
        text-align: center;
        font-family: "Arial", sans-serif;
      }

      .baby_personal_last {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-around;
        padding: 0vh 1vw;
      }

      .vaccine_report_preview_Content {
        padding-top: 3vh;
      }

      .vaccine_report_preview_heading {
        color: #151515;
        font-size: 1.7rem;
        font-weight: 900;
        text-align: center;
        text-decoration: underline;
        font-family: "Satoshi", sans-serif;
      }

      .preview_vaccination {
        display: flex;
        flex-direction: column;
        padding: 3vh 1vw;
      }

      .preview_vaccination_heading {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .preview_vaccination_heading_left {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1vh;
      }

      .preview_vaccination_heading_right {
        display: flex;
        align-items: center;
        gap: 1vw;
      }

      .preview_vaccination_icon {
        width: 2vh;
        height: 2vh;
      }

      .preview_vaccination_Status {
        color: #151515;
        font-size: 1.5rem;
        font-weight: 900;
        margin-left: 0.5vh;
        font-family: "Satoshi", sans-serif;
      }

      .preview_vaccination_generated {
        color: #00000099;
        font-size: 1.5rem;
        font-weight: 500;
        font-family: "Satoshi", sans-serif;
      }

      .preview_vaccination_generated_date {
        color: #151515;
        font-size: 1.5rem;
        font-weight: 900;
        text-align: left;
        font-family: "Satoshi", sans-serif;
      }

      .vaccination_tablecontainer {
        border: 1px solid #d9d9d9;
        overflow: hidden;
        margin: 0.5vh;
      }

      .vaccination_tableRowHeader {
        display: flex;
        background-color: #4789fc;
        padding: 1vh;
      }

      .vaccination_tablerow {
        display: flex;
        background-color: #ffffff;
        border-bottom: 1px solid #d9d9d9;
      }

      .headerCell {
        flex: 1;
        color: #ffffff;
        font-size: 1.3rem;
        font-weight: 700;
        text-align: center;
        padding: 0.5vh;
        font-family: "Satoshi", sans-serif;
      }

      .cell {
        flex: 1;
        color: #151515;
        font-size: 1.3rem;
        font-weight: 500;
        text-align: center;
        padding: 10px 5px;
        border-right: 1px solid #d1d1d1;
        font-family: "Satoshi", sans-serif;
      }

      .cell_hw {
        flex: 1;
        color: #151515;
        font-size: 1.5rem;
        font-weight: 500;
        text-align: center;
        padding: 10px 5px;
        font-family: "Satoshi", sans-serif;
      }

      .preview_not_vaccination {
        display: flex;
        flex-direction: column;
        padding: 2vh 1vw;
      }

      .preview_not_vaccination_heading {
        display: flex;
        justify-content: flex-start;
        align-items: center;
      }

      .preview_not_vaccination_icon {
        width: 2vh;
        height: 2vh;
      }

      .preview_not_vaccination_Status {
        color: #151515;
        font-size: 1.5rem;
        font-weight: 900;
        margin-left: 0.5vh;
        font-family: "Satoshi", sans-serif;
      }

      .not_vaccination_tablecontainer {
        border: 1px solid #d9d9d9;
        overflow: hidden;
        margin: 0.5vh;
      }

      .not_vaccination_tableRowHeader {
        display: flex;
        background-color: #4789fc;
        padding: 1vh;
      }

      .not_vaccination_tablerow {
        display: flex;
        background-color: #ffffff;
        border-bottom: 1px solid #d9d9d9;
      }

      .preview_skipped {
        display: flex;
        flex-direction: column;
        padding: 2vh 1vw;
      }

      .preview_skipped_heading {
        display: flex;
        justify-content: flex-start;
        align-items: center;
      }

      .preview_skipped_icon {
        width: 2vh;
        height: 2vh;
      }

      .preview_skipped_Status {
        color: #151515;
        font-size: 1.5rem;
        font-weight: 900;
        margin-left: 0.5vh;
        font-family: "Satoshi", sans-serif;
      }

      .skipped_tablecontainer {
        border: 1px solid #d9d9d9;
        overflow: hidden;
        margin: 0.5vh;
      }

      .skipped_tableRowHeader {
        display: flex;
        background-color: #4789fc;
        padding: 1vh;
      }

      .skipped_tablerow {
        display: flex;
        background-color: #ffffff;
        border-bottom: 1px solid #d9d9d9;
      }

      .preview_footer {
        background-color: rgba(71, 137, 252, 0.15); 
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        padding: 2vh 4vw;
      }

      .footer_logo {
        width: 8vh;
        height: 8vh;
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .footer_logo_icon {
        width: 6vh;
        height: 6vh;
        object-fit: contain;
      }

      .footer_contents {
        flex: 1;
        display: flex;
        flex-direction: column;
        padding: 0 2vw;
      }

      .footer_contents_1 {
        color: #151515;
        font-size: 0.8rem;
        font-weight: 500;
        text-align: left;
        width: 100%;
        font-family: "Satoshi", sans-serif;
      }

      .footer_contents_2 {
        color: #151515;
        font-size: 1rem;
        font-weight: 900;
        margin-top: 1vh;
        font-family: "Satoshi", sans-serif;
      }

      .footer_qr_icon {
        width: 6vh;
        height: 6vh;
        object-fit: contain;
      }
      .preview_logo {
        width: 6rem;
        height: 6rem;
      }

      .preview_vaccination_icon {
        width: 2rem;
        height: 2rem;
      }

      .preview_skipped_icon {
        width: 2rem;
        height: 2rem;
      }
      .footer_logo_icon,
      .footer_qr_icon {
        width: 6rem;
        height: 6rem;
        object-fit: contain;
      }
    </style>
  </head>
  <body>
    <div class="vaccine_report_preview">
      <div class="preview_header">
        <div class="preview_header_left">
          <img
            alt=""
            src="data:image/png;base64,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"
            class="preview_logo"
          />
          <p class="preview_logo_text">AroCord</p>
        </div>
        <div class="preview_header_right">
          <div class="baby_personal">
            <p class="personal_title">Name</p>
            <p class="personal_colon">:</p>
            <p class="personal_value">${babyData?.Baby_Name}</p>
          </div>
          <div class="baby_personal">
            <p class="personal_title">Date of Birth</p>
            <p class="personal_colon">:</p>
            <p class="personal_value">${babyData?.DOB}</p>
          </div>
          <div class="baby_personal">
            <p class="personal_title">Birth Time</p>
            <p class="personal_colon">:</p>
            <p class="personal_value">${babyData?.Birth_Time}</p>
          </div>
          <div class="baby_personal">
            <p class="personal_title">Gender</p>
            <p class="personal_colon">:</p>
            <p class="personal_value">${babyData?.Gender}</p>
          </div>
          <div class="baby_personal_last">
            <p class="personal_title">Age</p>
            <p class="personal_colon">:</p>
            <p class="personal_value">${age}</p>
          </div>
        </div>
      </div>
      <div class="vaccine_report_preview_Content">
        <h2 class="vaccine_report_preview_heading">
          Vaccination Report (Only Recommended In India)
        </h2>
      ${
        vaccinatedList.length > 0
          ? `<div class="preview_vaccination">
          <div class="preview_vaccination_heading">
            <div class="preview_vaccination_heading_left">
              <img
                alt=""
                src="data:image/png;base64,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"
                class="preview_vaccination_icon"
              />
              <span class="preview_vaccination_Status"
                >Completed Vaccination</span
              >
            </div>
            <div class="preview_vaccination_heading_right">
              <span class="preview_vaccination_generated">Generated on:</span>
              <span class="preview_vaccination_generated_date"
                >${formattedDate}</span
              >
            </div>
          </div>
          <div class="vaccination_tablecontainer">
            <div class="vaccination_tableRowHeader">
              <span class="headerCell">Age Group</span>
              <span class="headerCell">Vaccine Name</span>
              <span class="headerCell">Date Given</span>
              <span class="headerCell">Reactions</span>
              <span class="headerCell">Height & Weight</span>
            </div>
            ${vaccinatedList
              .map(
                item => `
            <div class="vaccination_tablerow">
              <span class="cell">${item.Age_Group}</span>
              <span class="cell">${item.Vaccine_Name}</span>
              <span class="cell">${item.Date}</span>
              <span class="cell">${
                item.Post_Vaccination_Response
                  ? item.Post_Vaccination_Response
                  : '-'
              }</span>
              <div class="cell">
                <span class="cell_hw">${item.Height} cm</span>
                <span class="cell_hw">${item.Weight} Kg</span>
              </div>
            </div>`,
              )
              .join('')}
          </div>
        </div>`
          : ''
      }
        
      ${
        notVaccinatedList.length > 0
          ? `<div class="preview_not_vaccination">
          <div class="preview_not_vaccination_heading">
            <img
              alt=""
              src="data:image/png;base64,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"
              class="preview_vaccination_icon"
            />
            <span class="preview_vaccination_Status">Not Vaccinated</span>
          </div>
           
          <div class="not_vaccination_tablecontainer">
            <div class="not_vaccination_tableRowHeader">
              <span class="headerCell">Age Group</span>
              <span class="headerCell">Vaccine Name</span>
              <span class="headerCell">Due Date</span>
            </div>
${notVaccinatedList
  .map(
    item => `
            <div class="not_vaccination_tablerow">
              <span class="cell">${item.Age_Group}</span>
              <span class="cell">${item.Vaccine_Name}</span>
              <span class="cell_hw">${calculateDueDate(item.Age_Group)}</span>
            </div>`,
  )
  .join('')}
          </div>
        </div>`
          : ''
      }
        
      ${
        skippedList.length > 0
          ? `<div class="preview_skipped">
          <div class="preview_skipped_heading">
            <img
              alt=""
              class="preview_skipped_icon"
              src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAAACXBIWXMAACxLAAAsSwGlPZapAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAA3lSURBVHgB7V1rbBzVFT535s6+/dgk2EmIk/j9oAmxHTsJFJSgAg2UElIVqb8KVSWoVCooRbS0lVBbVS0FiYZ/rYoqflRCtKKEkEIojxBo3iZAYjt2cCzn4SR2vF6vvbvzuHN77+yug4PtmX3M7JrsJy1E67szd853zrnnnnPvHYAiiiiiiCKKKKKIIooo4loDgsID7xPl/9gMqz3VgdGaVndZ50osbWx2eZqDolDlF8Ry9mc/+0jJ36jsMxXVSShE9KFuVe4+qcSOnJlU97+rXB7oBlCgQFEoBAjso7MP+t2iik33eBc9Uu/z3ukVcVAnBDSqAWGU6JSadpgzJyDEmEEgiCIIggiyTi4NRiff2h2P7Pjp6PCRZNNpovOJfBKQujf9TXnFjQ8EK56pcnu+QYguKLoKTNYUctc/yknBIkaYETKoxN5+MTTy+G9DFz+DBPkU8kRGPgiYFvyeylU/3BKseFbQSVlMU3WU+JvdfTIE7ZYkJAAa2xkaeWzbpaGXIE9EOEkAvxd/SHJkRf1P2kuCz8VVWdQI4dopQB7ArIxgURQZGfDZxNhDa899/hf2tcj7CA7BKQIw+2gvL1215bvllW/E1biH6HreBH81OBEiGyw8kif+6uXh27ePDH0IyT6DzbCbAEPrW5hW/a++9SALW9bFiaYJiYcrOLAoQPNgFw7pZH/FqWM3QaKf3Bpsc0t2aiA3ZbqvombLiZaNsqCpaxWi0UIVPgfvm6Ip1ENIJ23eRP+zdPXXISF8EWyCXRbA43P1fE3rPyox+l5UVYmA7HsIO8DUXgtILnxeUV9acfrT74NNLskOAoyOxps6B4kSW5lQIFSIEz4r0BGDiF197pNHmsCGATrXLghvZv+hLZviihxbkfhqwQqfQ6CUIllTamnLxhgkJos5daG5JABvZRryXssGNRybxGLC5Sxk4U9DpBRH4lOYNneS9sQz5YyEXAnI0Hwu/Il4VMMFPNBmAw2oVur2CajnEH8+/lEhS+SCAMPn05YNSjgWFaQFNtimCzYKa6Uen4K6D6aSgVmRkK0L4sLW5KaO05PxKPqqC5+DW3ckHnPLTev7ISH8rJ45GwK49ZBztW0va0p8VSHH97mGCFQkqlI7XLPmRUhERRl7kmwIEA8sr769EsP9BZDVdRwsOqIVkvvBN5ZV3wpZyDHTH+KnWUi2obxyT0xVtQUeamYKIarK6l3lS/duziIyylhwI3VtR9xEXSdeA35/PugUER0LXWX9xzohgyJPJhYg7ry+9rYygbYz4RdENjOfEBAV/ILQ8bfrVvK8UdrySNcCjNIhberUJpVYQSfWnITG0tmlHq/M5gc8NE3LCtJm7GhVw2O8kFIU/hVg5oZZ7sV7bHX9w5Am0rGAhPY3d1IW8+uFUkwpFDCVJ363lzArcEMaVpCWEN+paHyYVbOgKPwvg0lcVFRFenXp6gfS/J110MaOMPP9gQVIAOUFf1aEZ7MmmsvVFjOgA9W92DOB+44Erf7GqiDRM0uWtRFKSu0SPs+x+FweIAgNhIH2Gv+m2efeeZnR5/bCgKbu+kSOvuJzufk1bSkzCpxj0Mt/HaxcAxZla1kThmrW7A1SegsjIOfaw6MIVn1SnxoZWPrHUCjMv3uaPcATda0DSCfXU6AZDviIUCwOBfo+rvnit+GaGz8QQL9ZsKEky1ilIzraUz346TettLcsTNrUQaNK3Bbz9UluuO/iqeC/x8cjcKXiZGQapxra+5Gmrk6fBD5BwoMlfV11MDNraWRvSdP6KR65QO6fhzLr1VHvYX5PUyuzogHouUXLb9J0oxxqi+8c0bWTTPjjMLPcxwUm+fuO1hMsDSJAadRjmfBFfHoW4XMY1zk4EXpNRLakUNjNifinRRUbwYK8rBBA7w6UPqpqmi0ZN95DXVPmyqkbJJSkRYKh+adL+rvqYZ58fbmEvdSmHKJMNNjqC/4YcmQBUO313WZXvpNft9Id+Fp7QlizuZlpEqgpCYiQhNuZT/jGPZq9Jdt0sIcCliiF+kBgq5W2pgRsAvC6kLgYbKzvRpQ42Vu37gQk3MOcJHB3pEv49OwkJDS/dHa3k4Lh/8P163qnFJlfw5Zn4hd1AQquBvCYtTUloN1fWUd0e1fo8QKHoOs14/Wt3ZAgQZqlmUFC4GRXw5fd0fSAO5/m8++1cEPbCYnodQjszeLqRIfbA4tqzdqZEtDoFTbxNfp2g0U5oouQhiQJXIDzuiMybQnzDrgpGN+HG1qPS5rWyO7Fn9vWGgYPWpq80gazdqYE1EueDo06U/G6ioR53VEJswQ2JgypXPP7TX0+E347Ez5pckL4HHwzSYPg7TRrZ24BkqdRB+eQIiFsgQQ2JtSWWXE79cztaKpjwufgMmtxe5vN2pkSUCIKK52uN3ISpAQJZgMzlyaF+dxOPdN84ozbuRolCKrM2pgS4EFCOeQBSRIaTQbmuWAIP8Q1nzir+V+ET5RMk3KmBLBe+yBPsDgwX42k5rced+dJ81NALCth1sbKRCyvla8UCZfr2zgJVsIxJvy2XmY9TfkUfhKmVmspFwR5BnfybgResJZCZtEpwsm2Bb9cxgoBWS9AzQ6JGW6gr6sarI0DuKzvaN3cM2YHgcxlZ2UMmIK8wdIM92rMM2N2GBSiZk1MCYgCnYC8wNIMdy5Mz5jzaQkxnYbN2pgSMK5pZ8BxWEop8+9TPn7OyVq+LIEPQOOUmMrOlIBuTe51diRjKWXRUmJNHWNxPsvvnASztEUeLIFn+nqVeI9ZO1MCzsWUw4Jja2+TKeV+C4k1NsP1EK2B5XdqreSOuCXoLudIEAQBTqvxI6btzBp0U/UAFp1Yf2s5pTxjhjtLAm/uVHYvc0cuZ9yRiEQYIPp+s3amBJwev9QvInvnYnzpCIjCGUsp5VlmuCkSxqyksnt5ZQ0P6TYfQyAyCzgQunjKrJ0pAbtYICRTPWxnQjrg8mB//zG+dGT+lLKh+bPPcDkJHoupbH9fV23A5TZ28oMNSGYHx5j6x8zaWqoJn5Kn3rFzFBhW4jzrOV9WM5FSNsntXEllt5mRAMeikZ2CTRtLWAfpYDzyrsW2pkC7w+M73KJ9bsg39wzX0PxQg7nwU0hkUTWzVDawEmjUrthCEjF6ayLyvJW2lpal7B6/8JEoYtsOMypzeRp+sGRJCcys0yYL6G0n3GmWEVOp7DmKOsY91vrK7iM2VfowxvBI6PxHkKN1QfA+e4hzcnwv2LSMI6LEtL8uXnXhDqicXkWwmX0m61r7Mi2mpIo64/XremHmgEvGq9v3RLW4C2wAG9zp2Vh833Q3TGD1odCzi6vWP7p4ySFZsyd4MHaZuN3iBVXuYUGiUun13BiR4yS5DSpzZ4GQ5pNc+EQ08s8xok3dFAh+J6bKfsGmQ0RcWII/jw2v/9nocBfkkAADWlPHRIwvT7dxV+T0gXKQU9DUomKd2rc8nVmd7nd5p1Dv4VKwuEkjndXBaO/46FN8gmEnbBpoEF+loCc8qG3Kg5GI3hu/9HO4cgCgecfAOlIb9MiUwgOIa3Jv8Jzgx5r6jYM8DqZOfsz5FiXjYNWuaOgXQnF36pfAV1ofnxx7AtLQfo7Mtqm2dMQnY3G80I4hswt8J0+JxwvJY2xSpwBbQrqqzC8svBa6cK8HS0XhJ8Fl8fbE6J2QmGOktY4tEz9u+LcIm52CpjZc6/uFufZrGH+2qP/jVkjD96eQiTPnN8CP9I21Bzx+rFPnTpktNDBBaCVev7i9v6wDEoqYdgCX6Wiq/R0GlQ/Dl+7xSpJtWcUCB3VjCX88NnLX+/A+f/6MZqjZhJLGYHOxZu2/AgDbIJEuuHaAQA+D6/Xlnx/dBhm4niuXyQ7GOZpyc8d5WY5fJ14j4wE/1NXr8lyUeg/zozmzOtA1d4f23bBJDUcjICH0lSaBFRO0Mo8foe4D/Dnzfmgfh5Huvf/Efn+Z149VSvO7Gs1GqECZ8H14vVflyyRFKJBjK1PA34JlrtdbVk6FY1PaV80SEprvw/eEhvy7hof5O2lyomi5HDi1Xay4+FD3QVeZtwQRm4veToIX8Jl1w/0QcedS+Bx2JNSMgVlt7jyryrFl1JnXktgFIzmL3Z6L7p7DyyHLAXc22BE68omZJPUcWjGOhJ2sQIEW4mSNa70bu9Ak0NeSwjcWB0COYVfsbqzNWf75J/f1RCfvZjNmUVtAJBint7BZ/uHJ8LcrB45vhxwNuLPBkVeYbGb/f7WhrctH6RpF0wr2ZQ7cUj0YizKCngejI+2vnD0rg201ogQcfYnPO1V1d9wWCL4ZU2SjNIigMAoLvJTIahzI6/YpO0cvbLt3ZPBNcOhtSnl5jdWnKxufXOMv+4OiylTVCSMiX6+xYoIXmOBdXuiaDP2q/Uzf78Hh94nlIzpJCVvftbTmR3cHlzyjES0Q11SeTHKiP/wlfSyR5hKQgKf2hS/9csvw4I7k34zTc8BB5DM8nCbihSXL1m8vXfT8cpfvZpWooBJjyVTOis7JZRDUxV9liCW4IEc/eCk8+sSTly8cgithsqOCT6EQ4vMZK1F2BKtu2VoWeLza7btVREJQJxoQnb/QkyaK0hYvaLzQUxBBEDEouh4ZUKL/3T0ZeuH10aZ9LH3Mw0lHXc18fS0kzEjr3lFZ6W+Uad0NWNq00uXubJZcjSVIqvIItIzVwL2sJTZ+Y+xGRNEY0SYilJ7pUeXeM2q864SiHBjwST1s9hqd6x5FFFFEEUUUUUQRRRRRRBFO4//Lkx1KreJLIwAAAABJRU5ErkJggg=="
            />
            <span class="preview_skipped_Status">Skipped</span>
          </div>
          <div class="skipped_tablecontainer">
            <div class="skipped_tableRowHeader">
              <span class="headerCell">Age Group</span>
              <span class="headerCell">Vaccine Name</span>
              <span class="headerCell">Due Date</span>
            </div>
            ${skippedList
              .map(
                item => `
            <div class="skipped_tablerow">
              <span class="cell">${item.Age_Group}</span>
              <span class="cell">${item.Vaccine_Name}</span>
              <span class="cell_hw">${calculateDueDate(item.Age_Group)}</span>
            </div>`,
              )
              .join('')}
          </div>
        </div>`
          : ''
      }
        
      </div>
      <div class="preview_footer">
        <div class="footer_logo">
          <img
            alt=""
            src="data:image/png;base64,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"
            class="footer_logo_icon"
          />
        </div>
        <div class="footer_contents">
          <p class="footer_contents_1">
            This report is generated by AroCord based on user-provided data. It
            is for reference purposes only & does not replace medical advice.
            Please consult your doctor for guidance & stay on track for a happy,
            healthy journey!
          </p>
          <p class="footer_contents_2">
            Visit:
            <a href="https://www.arocord.com" target="_blank"
              >www.arocord.com</a
            >
          </p>
        </div>
        <div class="footer_qr">
          <!-- <img src="qr.png" alt="QR Code" > -->
          <img
            alt=""
            class="footer_qr_icon"
            src="data:image/png;base64,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"
          />
        </div>
      </div>
    </div>
  </body>
</html> 
      `;
  },

  // Generate PDF from HTML content
  async generatePDF(htmlContent: string) {
    try {
      const options = {
        html: htmlContent,
        fileName: 'Vaccination_Details',
        directory: 'Documents',
      };

      const file = await RNHTMLtoPDF.convert(options);
      return file.filePath;
    } catch (error) {
      console.log('Error generating PDF:', error);
      return null;
    }
  },

  // Generate and share PDF
  async generateAndSharePDF(htmlContent: string) {
    const filePath = await this.generatePDF(htmlContent);
    if (!filePath) {
      console.log('Failed to generate PDF');
      return;
    }

    await Share.open({
      url: `file://${filePath}`,
      type: 'application/pdf',
      failOnCancel: false,
    });

    // Delete the file after sharing
    await RNFS.unlink(filePath);
    console.log('Temporary file deleted after sharing.');
  },

  // Download PDF to device
  async downloadPDF(htmlContent: string) {
    try {
      const timestamp = new Date().getTime();
      const uniqueFileName = `Vaccination_Report_${timestamp}.pdf`;
      const downloadPath = `${RNFS.DownloadDirectoryPath}/${uniqueFileName}`;

      const fileExists = await RNFS.exists(downloadPath);
      if (fileExists) {
        return {
          title: 'File Already Exists!',
          message: 'The report is already downloaded in the Downloads folder. Please check there.',
        };
      }

      const filePath = await this.generatePDF(htmlContent);
      if (!filePath) {
        throw new Error('Failed to generate PDF');
      }

      await RNFS.moveFile(filePath, downloadPath);
      console.log('PDF saved to:', downloadPath);

      return {
        title: 'Download Complete!',
        message: 'PDF downloaded successfully! Check your Downloads folder.',
      };
    } catch (error) {
      console.log('Error downloading PDF:', error);
      throw error;
    }
  },
};