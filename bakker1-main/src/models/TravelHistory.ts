// src/models/TravelHistory.ts
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

export interface TravelHistoryData {
  id?: string;
  patientId: string;
  destination: string;
  departureDate: Date | Timestamp;
  returnDate: Date | Timestamp;
  purpose: 'tourism' | 'business' | 'medical' | 'education' | 'other';
  healthIssuesDuringTravel?: string[];
  vaccinationsTaken?: string[];
  countriesVisited?: string[];
  notes?: string;
}

export default class TravelHistory {
  id?: string;
  patientId: string;
  destination: string;
  departureDate: Date | Timestamp;
  returnDate: Date | Timestamp;
  purpose: 'tourism' | 'business' | 'medical' | 'education' | 'other';
  healthIssuesDuringTravel?: string[];
  vaccinationsTaken?: string[];
  countriesVisited?: string[];
  notes?: string;

  constructor(data: TravelHistoryData) {
    this.id = data.id;
    this.patientId = data.patientId;
    this.destination = data.destination;
    this.departureDate = data.departureDate;
    this.returnDate = data.returnDate;
    this.purpose = data.purpose;
    this.healthIssuesDuringTravel = data.healthIssuesDuringTravel;
    this.vaccinationsTaken = data.vaccinationsTaken;
    this.countriesVisited = data.countriesVisited;
    this.notes = data.notes;
  }

  // تحويل بيانات الكلاس إلى كائن يمكن تخزينه في Firestore
  toFirestore(): DocumentData {
    return {
      patientId: this.patientId,
      destination: this.destination,
      departureDate: this.departureDate instanceof Date ? Timestamp.fromDate(this.departureDate) : this.departureDate,
      returnDate: this.returnDate instanceof Date ? Timestamp.fromDate(this.returnDate) : this.returnDate,
      purpose: this.purpose,
      healthIssuesDuringTravel: this.healthIssuesDuringTravel || [],
      vaccinationsTaken: this.vaccinationsTaken || [],
      countriesVisited: this.countriesVisited || [],
      notes: this.notes || '',
      updatedAt: Timestamp.now()
    };
  }

  // إنشاء كائن TravelHistory من وثيقة Firestore
  static fromFirestore(data: DocumentData, id: string): TravelHistory {
    return new TravelHistory({
      id,
      patientId: data.patientId,
      destination: data.destination,
      departureDate: data.departureDate,
      returnDate: data.returnDate,
      purpose: data.purpose,
      healthIssuesDuringTravel: data.healthIssuesDuringTravel,
      vaccinationsTaken: data.vaccinationsTaken,
      countriesVisited: data.countriesVisited,
      notes: data.notes
    });
  }

  // حفظ أو تحديث تاريخ السفر
  async save(): Promise<string> {
    try {
      if (!auth.currentUser) {
        throw new Error("المستخدم غير مسجل الدخول");
      }

      if (!this.id) {
        // إضافة تاريخ سفر جديد
        const travelRef = await addDoc(collection(db, "travelHistory"), this.toFirestore());
        this.id = travelRef.id;
        return travelRef.id;
      } else {
        // تحديث تاريخ سفر موجود
        await updateDoc(doc(db, "travelHistory", this.id), this.toFirestore());
        return this.id;
      }
    } catch (error) {
      console.error("خطأ في حفظ تاريخ السفر:", error);
      throw error;
    }
  }

  // حذف تاريخ سفر
  async delete(): Promise<void> {
    try {
      if (!this.id) {
        throw new Error("تاريخ السفر غير موجود في قاعدة البيانات");
      }
      await deleteDoc(doc(db, "travelHistory", this.id));
    } catch (error) {
      console.error("خطأ في حذف تاريخ السفر:", error);
      throw error;
    }
  }

  // إضافة مشكلة صحية حدثت خلال السفر
  async addHealthIssue(healthIssue: string): Promise<void> {
    try {
      if (!this.id) {
        throw new Error("تاريخ السفر غير موجود في قاعدة البيانات");
      }
      
      if (!this.healthIssuesDuringTravel) {
        this.healthIssuesDuringTravel = [];
      }
      
      this.healthIssuesDuringTravel.push(healthIssue);
      await updateDoc(doc(db, "travelHistory", this.id), { 
        healthIssuesDuringTravel: this.healthIssuesDuringTravel,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error("خطأ في إضافة مشكلة صحية:", error);
      throw error;
    }
  }

  // الحصول على جميع سجلات السفر للمريض
  static async getPatientTravelHistory(patientId: string): Promise<TravelHistory[]> {
    try {
      const travelQuery = query(
        collection(db, "travelHistory"),
        where("patientId", "==", patientId)
      );
      
      const travelSnapshot = await getDocs(travelQuery);
      const travelRecords: TravelHistory[] = [];
      
      travelSnapshot.forEach((doc) => {
        travelRecords.push(TravelHistory.fromFirestore(doc.data(), doc.id));
      });
      
      // ترتيب السجلات حسب تاريخ المغادرة بترتيب تنازلي (الأحدث أولاً)
      return travelRecords.sort((a, b) => {
        const dateA = a.departureDate instanceof Date ? a.departureDate.getTime() : (a.departureDate as Timestamp).toDate().getTime();
        const dateB = b.departureDate instanceof Date ? b.departureDate.getTime() : (b.departureDate as Timestamp).toDate().getTime();
        return dateB - dateA;
      });
    } catch (error) {
      console.error("خطأ في استرجاع تاريخ السفر:", error);
      throw error;
    }
  }

  // الحصول على سجل سفر محدد بواسطة ID
  static async getById(travelId: string): Promise<TravelHistory | null> {
    try {
      const travelDoc = await getDoc(doc(db, "travelHistory", travelId));
      
      if (travelDoc.exists()) {
        return TravelHistory.fromFirestore(travelDoc.data(), travelDoc.id);
      }
      
      return null;
    } catch (error) {
      console.error("خطأ في استرجاع سجل السفر:", error);
      throw error;
    }
  }

  // الحصول على رحلات السفر الأخيرة
  static async getRecentTravelHistory(patientId: string, limit: number = 5): Promise<TravelHistory[]> {
    try {
      const travelHistory = await this.getPatientTravelHistory(patientId);
      return travelHistory.slice(0, limit);
    } catch (error) {
      console.error("خطأ في استرجاع تاريخ السفر الأخير:", error);
      throw error;
    }
  }
}