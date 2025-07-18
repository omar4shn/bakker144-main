// src/models/Disease.ts
import { db, auth } from "../firebase/config";
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  getDoc, 
  Timestamp,
  DocumentData
} from "firebase/firestore";

export interface DiseaseData {
  id?: string;
  patientId: string;
  diseaseName: string;
  diagnosisDate: Date | Timestamp;
  status: 'active' | 'cured' | 'chronic' | 'in_treatment';
  severity: 'mild' | 'moderate' | 'severe';
  symptoms: string[];
  treatments?: string[];
}

export default class Disease {
  id?: string;
  patientId: string;
  diseaseName: string;
  diagnosisDate: Date | Timestamp;
  status: 'active' | 'cured' | 'chronic' | 'in_treatment';
  severity: 'mild' | 'moderate' | 'severe';
  symptoms: string[];
  treatments?: string[];

  constructor(data: DiseaseData) {
    this.id = data.id;
    this.patientId = data.patientId;
    this.diseaseName = data.diseaseName;
    this.diagnosisDate = data.diagnosisDate;
    this.status = data.status;
    this.severity = data.severity;
    this.symptoms = data.symptoms;
    this.treatments = data.treatments;
  }

  // تحويل بيانات الكلاس إلى كائن يمكن تخزينه في Firestore
  toFirestore(): DocumentData {
    return {
      patientId: this.patientId,
      diseaseName: this.diseaseName,
      diagnosisDate: this.diagnosisDate instanceof Date ? Timestamp.fromDate(this.diagnosisDate) : this.diagnosisDate,
      status: this.status,
      severity: this.severity,
      symptoms: this.symptoms,
      treatments: this.treatments || [],
      updatedAt: Timestamp.now()
    };
  }

  // إنشاء كائن Disease من وثيقة Firestore
  static fromFirestore(data: DocumentData, id: string): Disease {
    return new Disease({
      id,
      patientId: data.patientId,
      diseaseName: data.diseaseName,
      diagnosisDate: data.diagnosisDate,
      status: data.status,
      severity: data.severity,
      symptoms: data.symptoms,
      treatments: data.treatments
    });
  }

  // إضافة مرض جديد
  async save(): Promise<string> {
    try {
      if (!auth.currentUser) {
        throw new Error("المستخدم غير مسجل الدخول");
      }

      if (!this.id) {
        // إضافة مرض جديد
        const diseaseRef = await addDoc(collection(db, "diseases"), this.toFirestore());
        this.id = diseaseRef.id;
        return diseaseRef.id;
      } else {
        // تحديث مرض موجود
        await updateDoc(doc(db, "diseases", this.id), this.toFirestore());
        return this.id;
      }
    } catch (error) {
      console.error("خطأ في حفظ بيانات المرض:", error);
      throw error;
    }
  }

  // حذف مرض
  async delete(): Promise<void> {
    try {
      if (!this.id) {
        throw new Error("المرض غير موجود في قاعدة البيانات");
      }
      await deleteDoc(doc(db, "diseases", this.id));
    } catch (error) {
      console.error("خطأ في حذف المرض:", error);
      throw error;
    }
  }

  // تحديث حالة المرض
  async updateStatus(newStatus: 'active' | 'cured' | 'chronic' | 'in_treatment'): Promise<void> {
    try {
      if (!this.id) {
        throw new Error("المرض غير موجود في قاعدة البيانات");
      }
      this.status = newStatus;
      await updateDoc(doc(db, "diseases", this.id), { 
        status: newStatus,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error("خطأ في تحديث حالة المرض:", error);
      throw error;
    }
  }

  // إضافة علاج للمرض
  async addTreatment(treatment: string): Promise<void> {
    try {
      if (!this.id) {
        throw new Error("المرض غير موجود في قاعدة البيانات");
      }
      
      if (!this.treatments) {
        this.treatments = [];
      }
      
      this.treatments.push(treatment);
      await updateDoc(doc(db, "diseases", this.id), { 
        treatments: this.treatments,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error("خطأ في إضافة علاج:", error);
      throw error;
    }
  }

  // الحصول على جميع أمراض المريض
  static async getPatientDiseases(patientId: string): Promise<Disease[]> {
    try {
      const diseasesQuery = query(
        collection(db, "diseases"),
        where("patientId", "==", patientId)
      );
      
      const diseasesSnapshot = await getDocs(diseasesQuery);
      const diseases: Disease[] = [];
      
      diseasesSnapshot.forEach((doc) => {
        diseases.push(Disease.fromFirestore(doc.data(), doc.id));
      });
      
      return diseases;
    } catch (error) {
      console.error("خطأ في استرجاع الأمراض:", error);
      throw error;
    }
  }

  // الحصول على مرض محدد بواسطة ID
  static async getById(diseaseId: string): Promise<Disease | null> {
    try {
      const diseaseDoc = await getDoc(doc(db, "diseases", diseaseId));
      
      if (diseaseDoc.exists()) {
        return Disease.fromFirestore(diseaseDoc.data(), diseaseDoc.id);
      }
      
      return null;
    } catch (error) {
      console.error("خطأ في استرجاع المرض:", error);
      throw error;
    }
  }

  // الحصول على الأمراض النشطة للمريض
  static async getActiveDiseases(patientId: string): Promise<Disease[]> {
    try {
      const diseasesQuery = query(
        collection(db, "diseases"),
        where("patientId", "==", patientId),
        where("status", "==", "active")
      );
      
      const diseasesSnapshot = await getDocs(diseasesQuery);
      const diseases: Disease[] = [];
      
      diseasesSnapshot.forEach((doc) => {
        diseases.push(Disease.fromFirestore(doc.data(), doc.id));
      });
      
      return diseases;
    } catch (error) {
      console.error("خطأ في استرجاع الأمراض النشطة:", error);
      throw error;
    }
  }
}