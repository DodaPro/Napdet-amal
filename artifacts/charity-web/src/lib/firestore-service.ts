import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  onSnapshot,
  type Query,
  type DocumentData,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";

export type NotificationStatus = "pending" | "reviewed";
export type DonationVerificationStatus = "pending" | "approved" | "rejected";

export interface FirestoreNotification {
  id: string;
  type: "case_submission" | "donation_pending";
  title: string;
  description: string;
  caseId?: number;
  submitterName?: string;
  submitterPhone?: string;
  submitterAddress?: string;
  donorName?: string;
  donorPhone?: string;
  shares?: number;
  amount?: number;
  screenshotUrl?: string;
  status: NotificationStatus;
  createdAt: Timestamp;
}

export interface FirestoreMessage {
  id: string;
  caseId: number;
  authorName: string;
  authorUid: string;
  text: string;
  createdAt: Timestamp;
}

export interface PendingDonation {
  id: string;
  caseId: number;
  caseTitle: string;
  donorName: string;
  donorPhone: string;
  shares: number;
  amount: number;
  screenshotUrl: string;
  status: DonationVerificationStatus;
  createdAt: Timestamp;
}

export interface FirestoreUser {
  uid: string;
  email: string;
  name: string;
  role: "super_admin" | "admin" | "moderator" | "donor";
  createdAt: Timestamp;
}

export interface PendingCase {
  id: string;
  title: string;
  description: string;
  patientName: string;
  patientAge: number;
  hospital: string;
  targetAmount: number;
  sharePrice: number;
  urgencyLevel: "critical" | "high" | "medium";
  submitterName: string;
  submitterPhone: string;
  submitterAddress: string;
  status: "pending" | "approved" | "rejected";
  createdAt: Timestamp;
}

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  createdAt: Timestamp;
  authorName: string;
}

export const notificationsRef = collection(db, "notifications");
export const pendingDonationsRef = collection(db, "pending_donations");
export const messagesRef = collection(db, "messages");
export const usersRef = collection(db, "users");
export const pendingCasesRef = collection(db, "pending_cases");
export const newsRef = collection(db, "news");

export async function submitCaseRequest(data: {
  title: string;
  description: string;
  patientName: string;
  patientAge: number;
  hospital: string;
  targetAmount: number;
  sharePrice: number;
  urgencyLevel: "critical" | "high" | "medium";
  submitterName: string;
  submitterPhone: string;
  submitterAddress: string;
}): Promise<string> {
  const caseRef = await addDoc(pendingCasesRef, {
    ...data,
    status: "pending",
    createdAt: serverTimestamp(),
  });

  await addDoc(notificationsRef, {
    type: "case_submission",
    title: `طلب حالة جديدة: ${data.title}`,
    description: `مقدم الطلب: ${data.submitterName} - ${data.submitterPhone}`,
    submitterName: data.submitterName,
    submitterPhone: data.submitterPhone,
    submitterAddress: data.submitterAddress,
    pendingCaseId: caseRef.id,
    status: "pending",
    createdAt: serverTimestamp(),
  });

  return caseRef.id;
}

export async function uploadDonationScreenshot(
  file: File,
  donationId: string
): Promise<string> {
  const storageRef = ref(storage, `donation-screenshots/${donationId}-${file.name}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export async function submitPendingDonation(data: {
  caseId: number;
  caseTitle: string;
  donorName: string;
  donorPhone: string;
  shares: number;
  amount: number;
  screenshotUrl: string;
}): Promise<string> {
  const donationRef = await addDoc(pendingDonationsRef, {
    ...data,
    status: "pending",
    createdAt: serverTimestamp(),
  });

  await addDoc(notificationsRef, {
    type: "donation_pending",
    title: `تبرع بانتظار التحقق من ${data.donorName}`,
    description: `${data.shares} سهم بقيمة ${data.amount} جنيه - الحالة: ${data.caseTitle}`,
    donorName: data.donorName,
    donorPhone: data.donorPhone,
    caseId: data.caseId,
    shares: data.shares,
    amount: data.amount,
    screenshotUrl: data.screenshotUrl,
    pendingDonationId: donationRef.id,
    status: "pending",
    createdAt: serverTimestamp(),
  });

  return donationRef.id;
}

export async function getNotifications(): Promise<FirestoreNotification[]> {
  const q = query(notificationsRef, orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as FirestoreNotification));
}

export async function markNotificationReviewed(id: string): Promise<void> {
  await updateDoc(doc(db, "notifications", id), { status: "reviewed" });
}

export async function getPendingDonations(): Promise<PendingDonation[]> {
  const q = query(pendingDonationsRef, orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as PendingDonation));
}

export async function approvePendingDonation(id: string): Promise<void> {
  await updateDoc(doc(db, "pending_donations", id), { status: "approved" });
}

export async function rejectPendingDonation(id: string): Promise<void> {
  await updateDoc(doc(db, "pending_donations", id), { status: "rejected" });
}

export async function getPendingCases(): Promise<PendingCase[]> {
  const q = query(pendingCasesRef, orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as PendingCase));
}

export async function approvePendingCase(id: string): Promise<void> {
  await updateDoc(doc(db, "pending_cases", id), { status: "approved" });
}

export async function rejectPendingCase(id: string): Promise<void> {
  await updateDoc(doc(db, "pending_cases", id), { status: "rejected" });
}

export async function getCaseMessages(caseId: number): Promise<FirestoreMessage[]> {
  const q = query(messagesRef, where("caseId", "==", caseId), orderBy("createdAt", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as FirestoreMessage));
}

export function subscribeToCaseMessages(
  caseId: number,
  callback: (messages: FirestoreMessage[]) => void
) {
  const q = query(messagesRef, where("caseId", "==", caseId), orderBy("createdAt", "asc"));
  return onSnapshot(q, (snap) => {
    const messages = snap.docs.map(d => ({ id: d.id, ...d.data() } as FirestoreMessage));
    callback(messages);
  });
}

export async function sendCaseMessage(data: {
  caseId: number;
  authorName: string;
  authorUid: string;
  text: string;
}): Promise<void> {
  await addDoc(messagesRef, {
    ...data,
    createdAt: serverTimestamp(),
  });

  await addDoc(notificationsRef, {
    type: "case_submission",
    title: `رسالة جديدة في لوحة المجتمع`,
    description: `${data.authorName}: ${data.text.slice(0, 60)}`,
    caseId: data.caseId,
    status: "pending",
    createdAt: serverTimestamp(),
  });
}

export async function getAllUsers(): Promise<FirestoreUser[]> {
  const snap = await getDocs(usersRef);
  return snap.docs.map(d => ({ ...d.data() } as FirestoreUser));
}

export async function updateUserRole(
  uid: string,
  role: "super_admin" | "admin" | "moderator" | "donor"
): Promise<void> {
  await updateDoc(doc(db, "users", uid), { role });
}

export async function getNews(): Promise<NewsItem[]> {
  const q = query(newsRef, orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as NewsItem));
}

export async function addNewsItem(data: {
  title: string;
  content: string;
  authorName: string;
}): Promise<void> {
  await addDoc(newsRef, {
    ...data,
    createdAt: serverTimestamp(),
  });
}
