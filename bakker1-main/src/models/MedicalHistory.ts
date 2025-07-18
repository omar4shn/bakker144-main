// src/models/MedicalHistory.ts
import { auth } from "../firebase/config";
import Disease from "./Disease";
import TravelHistory from "./TravelHistory";
import Allergy from "./Allergy";
import Medication from "./Medication";

export default class MedicalHistory {
  getDiseaseStatistics() {
    throw new Error("Method not implemented.");
  }
  patientId: string;
  
  constructor(patientId: string) {
    this.patientId = patientId;
  }
  
  // الحصول على التاريخ المرضي الكامل للمريض
  async getFullMedicalHistory() {
    try {
      if (!auth.currentUser) {
        throw new Error("المستخدم غير مسجل الدخول");
      }
      
      // استرجاع البيانات من مختلف الكلاسات
      const [diseases, allergies, medications, travelHistory] = await Promise.all([
        Disease.getPatientDiseases(this.patientId),
        Allergy.getPatientAllergies(this.patientId),
        Medication.getPatientMedications(this.patientId),
        TravelHistory.getPatientTravelHistory(this.patientId)
      ]);
      
      return {
        diseases,
        allergies,
        medications,
        travelHistory
      };
    } catch (error) {
      console.error("خطأ في استرجاع التاريخ المرضي الكامل:", error);
      throw error;
    }
  }
  
  // الحصول على ملخص للتاريخ المرضي (للعرض في لوحة التحكم)
  async getMedicalSummary() {
    try {
      if (!auth.currentUser) {
        throw new Error("المستخدم غير مسجل الدخول");
      }
      
      // استرجاع البيانات الأساسية فقط
      const [activeDiseases, allergies, activeMedications, recentTravel] = await Promise.all([
        Disease.getActiveDiseases(this.patientId),
        Allergy.getPatientAllergies(this.patientId),
        Medication.getActiveMedications(this.patientId),
        TravelHistory.getRecentTravelHistory(this.patientId, 1)
      ]);
      
      return {
        activeDiseases,
        allergies,
        activeMedications,
        recentTravel
      };
    } catch (error) {
      console.error("خطأ في استرجاع ملخص التاريخ المرضي:", error);
      throw error;
    }
  }
  
  // الحصول على التاريخ المرضي المتعلق بأعراض معينة (للتحليل بالذكاء الاصطناعي)
  async getHistoryForSymptoms(symptoms: string[]) {
    try {
      if (!auth.currentUser) {
        throw new Error("المستخدم غير مسجل الدخول");
      }
      
      // استرجاع جميع الأمراض للمريض
      const diseases = await Disease.getPatientDiseases(this.patientId);
      
      // تصفية الأمراض المرتبطة بالأعراض المدخلة
      const relatedDiseases = diseases.filter(disease => {
        // التحقق من وجود أي من الأعراض المدخلة في قائمة أعراض المرض
        return disease.symptoms.some(symptom => 
          symptoms.some(inputSymptom => 
            symptom.toLowerCase().includes(inputSymptom.toLowerCase())
          )
        );
      });
      
      // استرجاع الحساسيات النشطة
      const allergies = await Allergy.getPatientAllergies(this.patientId);
      
      // استرجاع الأدوية النشطة
      const medications = await Medication.getActiveMedications(this.patientId);
      
      return {
        relatedDiseases,
        allergies,
        medications
      };
    } catch (error) {
      console.error("خطأ في استرجاع التاريخ المرضي المرتبط بالأعراض:", error);
      throw error;
    }
  }
  
  // التحقق من وجود تفاعلات محتملة بين الأدوية
  async checkMedicationInteractions(medicationName: string) {
    try {
      if (!auth.currentUser) {
        throw new Error("المستخدم غير مسجل الدخول");
      }
      
      // استرجاع الأدوية النشطة
      const activeMedications = await Medication.getActiveMedications(this.patientId);
      
      // التحقق من وجود حساسية للدواء
      const allergyCheck = await Allergy.checkMedicationAllergy(this.patientId, medicationName);
      
      return {
        currentMedications: activeMedications,
        hasAllergy: allergyCheck !== null,
        allergyDetails: allergyCheck
      };
    } catch (error) {
      console.error("خطأ في التحقق من التفاعلات الدوائية:", error);
      throw error;
    }
  }
}