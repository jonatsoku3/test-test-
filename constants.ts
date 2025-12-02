
import { ContactNumber, EmergencyType, Place } from './types';

export const EMERGENCY_CONTACTS: ContactNumber[] = [
  { name: 'ตำรวจ', number: '191', icon: 'Shield', color: 'bg-blue-600' },
  { name: 'รถพยาบาล', number: '1669', icon: 'Ambulance', color: 'bg-red-600' },
  { name: 'ดับเพลิง', number: '199', icon: 'Flame', color: 'bg-orange-600' },
  { name: 'ตำรวจท่องเที่ยว', number: '1155', icon: 'Map', color: 'bg-teal-600' },
  { name: 'ทางหลวง', number: '1193', icon: 'Car', color: 'bg-yellow-600' },
  { name: 'จส.100', number: '1137', icon: 'Radio', color: 'bg-green-600' },
];

export const MOCK_ALERTS_NEARBY = [
  {
    id: '1',
    type: EmergencyType.CAR,
    priority: 'MEDIUM',
    description: 'ยางแตก เปลี่ยนยางไม่เป็นครับ',
    location: { lat: 13.7563, lng: 100.5018 }, // Bangkok center approx
    timestamp: Date.now() - 1000 * 60 * 15, // 15 mins ago
    reporterName: 'สมชาย ใจดี',
    status: 'PENDING'
  },
  {
    id: '2',
    type: EmergencyType.MEDICAL,
    priority: 'HIGH',
    description: 'คนเป็นลม หน้ามืด',
    location: { lat: 13.7600, lng: 100.5100 },
    timestamp: Date.now() - 1000 * 60 * 5, // 5 mins ago
    reporterName: 'วิภาวี มีสุข',
    status: 'ACCEPTED'
  },
  {
    id: '3',
    type: EmergencyType.FIRE,
    priority: 'CRITICAL',
    description: 'กลุ่มควันสีดำหลังตลาด',
    location: { lat: 13.7500, lng: 100.5050 },
    timestamp: Date.now() - 1000 * 60 * 2, // 2 mins ago
    reporterName: 'ลุงพล ตลาดสด',
    status: 'PENDING'
  },
  {
    id: '4',
    type: EmergencyType.POLICE,
    priority: 'HIGH',
    description: 'พบคนเมาอาละวาด ขว้างปาขวด',
    location: { lat: 13.7580, lng: 100.4950 },
    timestamp: Date.now() - 1000 * 60 * 30, // 30 mins ago
    reporterName: 'ป้าน้อย ปากซอย 5',
    status: 'PENDING'
  }
];


// Helper to calculate distance
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180)
}
