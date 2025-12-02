
export enum EmergencyType {
  MEDICAL = 'MEDICAL', // เจ็บป่วย/อุบัติเหตุ
  POLICE = 'POLICE', // เหตุด่วนเหตุร้าย
  FIRE = 'FIRE', // ไฟไหม้
  CAR = 'CAR', // รถเสีย
  CCTV = 'CCTV', // กล้องวงจรปิด
  GENERAL = 'GENERAL' // ขอความช่วยเหลือทั่วไป
}

export type EmergencyPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Location {
  lat: number;
  lng: number;
}

export interface Alert {
  id: string;
  type: EmergencyType;
  priority: EmergencyPriority;
  description: string;
  location: Location;
  timestamp: number;
  reporterName: string;
  status: 'PENDING' | 'ACCEPTED' | 'RESOLVED';
  distance?: number; // Distance from current user in km
}

export interface Place {
  id: string;
  name: string;
  type: EmergencyType;
  location: Location;
  address?: string;
  phone?: string;
}

export interface ContactNumber {
  name: string;
  number: string;
  icon: string;
  color: string;
}

export interface AiAnalysisResult {
  category: EmergencyType;
  severity: EmergencyPriority;
  advice: string;
  summary: string;
}
