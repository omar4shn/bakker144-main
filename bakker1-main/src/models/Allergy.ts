// src/models/Allergy.ts
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

export interface AllergyData {
  id?: string;
  patientId: string;
  allergyName: string;
  allergyType: 'food' | 'medication' | 'environmental' | 'insect' | 'other';
  severity: 'mild' | 'moderate' | 'severe' | 'life_threatening';
  symptoms: string[];
  diagnosisDate?: Date | Timestamp;
  treatment?: string;
  notes?: string;
}

export default class Allergy {
  id?: string;
  patientId: string;
  allergyName: string;
  allergyType: 'food' | 'medication' | 'environmental' | 'insect' | 'other';
  severity: 'mild' | 'moderate' | 'severe' | 'life_threatening';
  symptoms: string[];
  diagnosisDate?: Date | Timestamp;
  treatment?: string;
  notes?: string;

  constructor(data: AllergyData) {
    this.id = data.id;
    this.patientId = data.patientId;
    this.allergyName = data.allergyName;
    this.allergyType = data.allergyType;
    this.severity = data.severity;
    this.symptoms = data.symptoms;
    this.diagnosisDate = data.diagnosisDate;
    this.treatment = data.treatment;
    this.notes = data.notes;
  }

  // تحويل بيانات الكلاس إلى كائن يمكن تخزينه في Firestore
  toFirestore(): DocumentData {
    return {
      patientId: this.patientId,
      allergyName: this.allergyName,
      allergyType: this.allergyType,
      severity: this.severity,
      symptoms: this.symptoms,
      diagnosisDate: this.diagnosisDate instanceof Date && this.diagnosisDate 
        ? Timestamp.fromDate(this.diagnosisDate) 
        : this.diagnosisDate || null,
      treatment: this.treatment || '',
      notes: this.notes || '',
      updatedAt: Timestamp.now()
    };
  }

  // إنشاء كائن Allergy من وثيقة Firestore
  static fromFirestore(data: DocumentData, id: string): Allergy {
    return new Allergy({
      id,
      patientId: data.patientId,
      allergyName: data.allergyName,
      allergyType: data.allergyType,
      severity: data.severity,
      symptoms: data.symptoms,
      diagnosisDate: data.diagnosisDate,
      treatment: data.treatment,
      notes: data.notes
    });
  }

  // حفظ أو تحديث الحساسية
  async save(): Promise<string> {
    try {
      if (!auth.currentUser) {
        throw new Error("المستخدم غير مسجل الدخول");
      }

      if (!this.id) {
        // إضافة حساسية جديدة
        const allergyRef = await addDoc(collection(db, "allergies"), this.toFirestore());
        this.id = allergyRef.id;
        return allergyRef.id;
      } else {
        // تحديث حساسية موجودة
        await updateDoc(doc(db, "allergies", this.id), this.toFirestore());
        return this.id;
      }
    } catch (error) {
      console.error("خطأ في حفظ الحساسية:", error);
      throw error;
    }
  }

  // حذف حساسية
  async delete(): Promise<void> {
    try {
      if (!this.id) {
        throw new Error("الحساسية غير موجودة في قاعدة البيانات");
      }
      await deleteDoc(doc(db, "allergies", this.id));
    } catch (error) {
      console.error("خطأ في حذف الحساسية:", error);
      throw error;
    }
  }

  // تحديث شدة الحساسية
  async updateSeverity(newSeverity: 'mild' | 'moderate' | 'severe' | 'life_threatening'): Promise<void> {
    try {
      if (!this.id) {
        throw new Error("الحساسية غير موجودة في قاعدة البيانات");
      }
      
      this.severity = newSeverity;
      await updateDoc(doc(db, "allergies", this.id), { 
        severity: newSeverity,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error("خطأ في تحديث شدة الحساسية:", error);
      throw error;
    }
  }

  // الحصول على جميع الحساسيات للمريض
  static async getPatientAllergies(patientId: string): Promise<Allergy[]> {
    try {
      const allergiesQuery = query(
        collection(db, "allergies"),
        where("patientId", "==", patientId)
      );
      
      const allergiesSnapshot = await getDocs(allergiesQuery);
      const allergies: Allergy[] = [];
      
      allergiesSnapshot.forEach((doc) => {
        allergies.push(Allergy.fromFirestore(doc.data(), doc.id));
      });
      
      return allergies;
    } catch (error) {
      console.error("خطأ في استرجاع الحساسيات:", error);
      throw error;
    }
  }

  // الحصول على حساسية محددة بواسطة ID
  static async getById(allergyId: string): Promise<Allergy | null> {
    try {
      const allergyDoc = await getDoc(doc(db, "allergies", allergyId));
      
      if (allergyDoc.exists()) {
        return Allergy.fromFirestore(allergyDoc.data(), allergyDoc.id);
      }
      
      return null;
    } catch (error) {
      console.error("خطأ في استرجاع الحساسية:", error);
      throw error;
    }
  }

  // التحقق من وجود حساسية من دواء معين للمريض
  static async checkMedicationAllergy(patientId: string, medicationName: string): Promise<Allergy | null> {
    try {
      const allergiesQuery = query(
        collection(db, "allergies"),
        where("patientId", "==", patientId),
        where("allergyType", "==", "medication"),
        where("allergyName", "==", medicationName)
      );
      
      const allergiesSnapshot = await getDocs(allergiesQuery);
      
      if (!allergiesSnapshot.empty) {
        const doc = allergiesSnapshot.docs[0];
        return Allergy.fromFirestore(doc.data(), doc.id);
      }
      
      return null;
    } catch (error) {
      console.error("خطأ في التحقق من حساسية الدواء:", error);
      throw error;
    }
  }
}