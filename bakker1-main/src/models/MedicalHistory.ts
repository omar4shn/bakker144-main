import { auth } from "../firebase/config";
import Disease from "./Disease";

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

      // استرجاع البيانات من كلاس Disease فقط
      const diseases = await Disease.getPatientDiseases(this.patientId);
      
      return {
        diseases
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
      const activeDiseases = await Disease.getActiveDiseases(this.patientId);
      
      return {
        activeDiseases
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
      
      return {
        relatedDiseases
      };
    } catch (error) {
      console.error("خطأ في استرجاع التاريخ المرضي المرتبط بالأعراض:", error);
      throw error;
    }
  }
}