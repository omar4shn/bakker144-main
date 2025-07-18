// src/models/Patient.ts

import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  User,
  UserCredential
} from "firebase/auth";
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  getDocs,
  DocumentData,
  QuerySnapshot,
  DocumentSnapshot,
  Timestamp
} from "firebase/firestore";
import { auth, db } from "../firebase/config"; // مسار محدث للاستيراد

interface PatientData {
  patientId: string;
  patientName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string | Date;
  gender: string;
  createdAt?: Date | Timestamp;
}

interface DiagnosisData extends DocumentData {
  id: string;
  patientId: string;
  [key: string]: unknown;
}

class Patient {
  patientId: string | null;
  patientName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string | Date | null;
  gender: string;

  constructor(
    patientId: string | null = null, 
    patientName: string = "", 
    email: string = "", 
    phoneNumber: string = "", 
    dateOfBirth: string | Date | null = null, 
    gender: string = ""
  ) {
    this.patientId = patientId;
    this.patientName = patientName;
    this.email = email;
    this.phoneNumber = phoneNumber;
    this.dateOfBirth = dateOfBirth;
    this.gender = gender;
  }

  // إنشاء حساب جديد للمريض
  static async register(
    patientName: string, 
    email: string, 
    password: string, 
    phoneNumber: string, 
    dateOfBirth: string | Date, 
    gender: string
  ): Promise<Patient> {
    try {
      // التحقق من تاريخ الميلاد (ألا يكون في المستقبل)
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      
      if (birthDate > today) {
        throw new Error("تاريخ الميلاد لا يمكن أن يكون في المستقبل");
      }
      
      // إنشاء حساب المستخدم في Firebase Authentication
      const userCredential: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user: User = userCredential.user;
      
      // تحديث الملف الشخصي مع اسم المريض
      await updateProfile(user, {
        displayName: patientName
      });
      
      // إنشاء وثيقة المريض في Firestore
      const patientData: PatientData = {
        patientId: user.uid,
        patientName: patientName,
        email: email,
        phoneNumber: phoneNumber,
        dateOfBirth: dateOfBirth,
        gender: gender,
        createdAt: new Date()
      };
      
      await setDoc(doc(db, "patients", user.uid), patientData);
      
      return new Patient(
        user.uid,
        patientName,
        email,
        phoneNumber,
        dateOfBirth,
        gender
      );
    } catch (error) {
      console.error("Error registering patient:", error);
      throw error;
    }
  }

  // تسجيل الدخول للمريض
  static async login(email: string, password: string): Promise<Patient> {
    try {
      const userCredential: UserCredential = await signInWithEmailAndPassword(auth, email, password);
      const user: User = userCredential.user;
      
      // استرجاع بيانات المريض من Firestore
      const patientDoc: DocumentSnapshot = await getDoc(doc(db, "patients", user.uid));
      
      if (patientDoc.exists()) {
        const patientData = patientDoc.data() as PatientData;
        return new Patient(
          patientData.patientId,
          patientData.patientName,
          patientData.email,
          patientData.phoneNumber,
          patientData.dateOfBirth,
          patientData.gender
        );
      } else {
        throw new Error("بيانات المريض غير موجودة");
      }
    } catch (error) {
      console.error("Error logging in:", error);
      throw error;
    }
  }

  // إعادة تعيين كلمة المرور
  static async resetPassword(email: string): Promise<boolean> {
    try {
      await sendPasswordResetEmail(auth, email);
      return true;
    } catch (error) {
      console.error("Error resetting password:", error);
      throw error;
    }
  }

  // تسجيل الخروج
  static async logout(): Promise<boolean> {
    try {
      await signOut(auth);
      return true;
    } catch (error) {
      console.error("Error logging out:", error);
      throw error;
    }
  }

  // إنشاء أعراض جديدة
  async createSymptom(symName: string): Promise<string> {
    try {
      if (!this.patientId) {
        throw new Error("يجب تسجيل الدخول أولا");
      }
      
      const symptomData = {
        patientId: this.patientId,
        name: symName,
        createdAt: new Date()
      };
      
      const docRef = await addDoc(collection(db, "symptoms"), symptomData);
      return docRef.id;
    } catch (error) {
      console.error("Error creating symptom:", error);
      throw error;
    }
  }

  // تعديل الأعراض
  async modifySymptom(symId: string, newData: string): Promise<boolean> {
    try {
      if (!this.patientId) {
        throw new Error("يجب تسجيل الدخول أولا");
      }
      
      const symptomRef = doc(db, "symptoms", symId);
      
      // التحقق من أن العرض ينتمي للمريض
      const symptomDoc = await getDoc(symptomRef);
      if (!symptomDoc.exists() || symptomDoc.data()?.patientId !== this.patientId) {
        throw new Error("لا يمكن تعديل هذا العرض");
      }
      
      await updateDoc(symptomRef, {
        name: newData,
        updatedAt: new Date()
      });
      
      return true;
    } catch (error) {
      console.error("Error modifying symptom:", error);
      throw error;
    }
  }

  // حذف الأعراض
  async deleteSymptom(symId: string): Promise<boolean> {
    try {
      if (!this.patientId) {
        throw new Error("يجب تسجيل الدخول أولا");
      }
      
      const symptomRef = doc(db, "symptoms", symId);
      
      // التحقق من أن العرض ينتمي للمريض
      const symptomDoc = await getDoc(symptomRef);
      if (!symptomDoc.exists() || symptomDoc.data()?.patientId !== this.patientId) {
        throw new Error("لا يمكن حذف هذا العرض");
      }
      
      await deleteDoc(symptomRef);
      return true;
    } catch (error) {
      console.error("Error deleting symptom:", error);
      throw error;
    }
  }

  // عرض التشخيص
  async viewDiagnosis(): Promise<DiagnosisData[]> {
    try {
      if (!this.patientId) {
        throw new Error("يجب تسجيل الدخول أولا");
      }
      
      const diagnosisQuery = query(
        collection(db, "diagnoses"),
        where("patientId", "==", this.patientId)
      );
      
      const querySnapshot: QuerySnapshot = await getDocs(diagnosisQuery);
      const diagnoses: DiagnosisData[] = [];
      
      querySnapshot.forEach((doc) => {
        diagnoses.push({
          id: doc.id,
          ...doc.data()
        } as DiagnosisData);
      });
      
      return diagnoses;
    } catch (error) {
      console.error("Error viewing diagnoses:", error);
      throw error;
    }
  }

  // إنشاء تقييم
  async createFeedback(content: string): Promise<string> {
    try {
      if (!this.patientId) {
        throw new Error("يجب تسجيل الدخول أولا");
      }
      
      const feedbackData = {
        patientId: this.patientId,
        patientName: this.patientName,
        content: content,
        createdAt: new Date()
      };
      
      const docRef = await addDoc(collection(db, "feedback"), feedbackData);
      return docRef.id;
    } catch (error) {
      console.error("Error creating feedback:", error);
      throw error;
    }
  }
}

export default Patient;