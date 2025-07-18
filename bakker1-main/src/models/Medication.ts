// src/models/Medication.ts
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

export interface MedicationData {
  id?: string;
  patientId: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  startDate: Date | Timestamp;
  endDate?: Date | Timestamp;
  isActive: boolean;
  prescribedBy?: string;
  reasonForTaking: string;
  sideEffects?: string[];
  notes?: string;
}

export default class Medication {
  id?: string;
  patientId: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  startDate: Date | Timestamp;
  endDate?: Date | Timestamp;
  isActive: boolean;
  prescribedBy?: string;
  reasonForTaking: string;
  sideEffects?: string[];
  notes?: string;

  constructor(data: MedicationData) {
    this.id = data.id;
    this.patientId = data.patientId;
    this.medicationName = data.medicationName;
    this.dosage = data.dosage;
    this.frequency = data.frequency;
    this.startDate = data.startDate;
    this.endDate = data.endDate;
    this.isActive = data.isActive;
    this.prescribedBy = data.prescribedBy;
    this.reasonForTaking = data.reasonForTaking;
    this.sideEffects = data.sideEffects;
    this.notes = data.notes;
  }

  // تحويل بيانات الكلاس إلى كائن يمكن تخزينه في Firestore
  toFirestore(): DocumentData {
    return {
      patientId: this.patientId,
      medicationName: this.medicationName,
      dosage: this.dosage,
      frequency: this.frequency,
      startDate: this.startDate instanceof Date ? Timestamp.fromDate(this.startDate) : this.startDate,
      endDate: this.endDate instanceof Date && this.endDate ? Timestamp.fromDate(this.endDate) : this.endDate || null,
      isActive: this.isActive,
      prescribedBy: this.prescribedBy || '',
      reasonForTaking: this.reasonForTaking,
      sideEffects: this.sideEffects || [],
      notes: this.notes || '',
      updatedAt: Timestamp.now()
    };
  }

  // إنشاء كائن Medication من وثيقة Firestore
  static fromFirestore(data: DocumentData, id: string): Medication {
    return new Medication({
      id,
      patientId: data.patientId,
      medicationName: data.medicationName,
      dosage: data.dosage,
      frequency: data.frequency,
      startDate: data.startDate,
      endDate: data.endDate,
      isActive: data.isActive,
      prescribedBy: data.prescribedBy,
      reasonForTaking: data.reasonForTaking,
      sideEffects: data.sideEffects,
      notes: data.notes
    });
  }

  // حفظ أو تحديث الدواء
  async save(): Promise<string> {
    try {
      if (!auth.currentUser) {
        throw new Error("المستخدم غير مسجل الدخول");
      }

      if (!this.id) {
        // إضافة دواء جديد
        const medicationRef = await addDoc(collection(db, "medications"), this.toFirestore());
        this.id = medicationRef.id;
        return medicationRef.id;
      } else {
        // تحديث دواء موجود
        await updateDoc(doc(db, "medications", this.id), this.toFirestore());
        return this.id;
      }
    } catch (error) {
      console.error("خطأ في حفظ الدواء:", error);
      throw error;
    }
  }

  // حذف دواء
  async delete(): Promise<void> {
    try {
      if (!this.id) {
        throw new Error("الدواء غير موجود في قاعدة البيانات");
      }
      await deleteDoc(doc(db, "medications", this.id));
    } catch (error) {
      console.error("خطأ في حذف الدواء:", error);
      throw error;
    }
  }

  // إيقاف الدواء
  async stopMedication(endDate: Date = new Date()): Promise<void> {
    try {
      if (!this.id) {
        throw new Error("الدواء غير موجود في قاعدة البيانات");
      }
      
      this.isActive = false;
      this.endDate = endDate;
      
      await updateDoc(doc(db, "medications", this.id), { 
        isActive: false,
        endDate: Timestamp.fromDate(endDate),
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error("خطأ في إيقاف الدواء:", error);
      throw error;
    }
  }

  // إضافة آثار جانبية
  async addSideEffect(sideEffect: string): Promise<void> {
    try {
      if (!this.id) {
        throw new Error("الدواء غير موجود في قاعدة البيانات");
      }
      
      if (!this.sideEffects) {
        this.sideEffects = [];
      }
      
      this.sideEffects.push(sideEffect);
      await updateDoc(doc(db, "medications", this.id), { 
        sideEffects: this.sideEffects,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error("خطأ في إضافة آثار جانبية:", error);
      throw error;
    }
  }

  // الحصول على جميع الأدوية للمريض
  static async getPatientMedications(patientId: string): Promise<Medication[]> {
    try {
      const medicationsQuery = query(
        collection(db, "medications"),
        where("patientId", "==", patientId)
      );
      
      const medicationsSnapshot = await getDocs(medicationsQuery);
      const medications: Medication[] = [];
      
      medicationsSnapshot.forEach((doc) => {
        medications.push(Medication.fromFirestore(doc.data(), doc.id));
      });
      
      return medications;
    } catch (error) {
      console.error("خطأ في استرجاع الأدوية:", error);
      throw error;
    }
  }

  // الحصول على الأدوية النشطة للمريض
  static async getActiveMedications(patientId: string): Promise<Medication[]> {
    try {
      const medicationsQuery = query(
        collection(db, "medications"),
        where("patientId", "==", patientId),
        where("isActive", "==", true)
      );
      
      const medicationsSnapshot = await getDocs(medicationsQuery);
      const medications: Medication[] = [];
      
      medicationsSnapshot.forEach((doc) => {
        medications.push(Medication.fromFirestore(doc.data(), doc.id));
      });
      
      return medications;
    } catch (error) {
      console.error("خطأ في استرجاع الأدوية النشطة:", error);
      throw error;
    }
  }

  // الحصول على دواء محدد بواسطة ID
  static async getById(medicationId: string): Promise<Medication | null> {
    try {
      const medicationDoc = await getDoc(doc(db, "medications", medicationId));
      
      if (medicationDoc.exists()) {
        return Medication.fromFirestore(medicationDoc.data(), medicationDoc.id);
      }
      
      return null;
    } catch (error) {
      console.error("خطأ في استرجاع الدواء:", error);
      throw error;
    }
  }
}