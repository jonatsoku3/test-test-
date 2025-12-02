
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, Polyline, useMapEvents, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import { Alert, Location, EmergencyType, EmergencyPriority } from '../types';
import { AlertTriangle, Car, Flame, Shield, Navigation, ExternalLink, LocateFixed, MapPin, Heart, Hospital, User, Clock } from 'lucide-react';
import { calculateDistance } from '../constants';

// --- Icons Configuration ---
const createCustomIcon = (colorUrl: string) => new L.Icon({
  iconUrl: colorUrl,
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const redIcon = createCustomIcon('https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png');
const greenIcon = createCustomIcon('https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png'); 
const violetIcon = createCustomIcon('https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png'); 
const orangeIcon = createCustomIcon('https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png'); 
const greyIcon = createCustomIcon('https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png'); 
const blueIcon = createCustomIcon('https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png'); 
const goldIcon = createCustomIcon('https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png');

const getIconByType = (type: EmergencyType) => {
    switch (type) {
        case EmergencyType.MEDICAL: return greenIcon;
        case EmergencyType.POLICE: return violetIcon;
        case EmergencyType.FIRE: return orangeIcon;
        case EmergencyType.CAR: return greyIcon;
        default: return redIcon;
    }
};

const getPriorityColor = (priority: EmergencyPriority) => {
    switch (priority) {
        case 'CRITICAL': return 'bg-red-600 text-white border-red-700';
        case 'HIGH': return 'bg-orange-500 text-white border-orange-600';
        case 'MEDIUM': return 'bg-yellow-500 text-white border-yellow-600';
        case 'LOW': return 'bg-slate-400 text-white border-slate-500';
        default: return 'bg-slate-400 text-white';
    }
};

interface MapProps {
  userLocation: Location | null;
  alerts: Alert[];
  destination: Location | null;
  onMarkerClick?: (alert: Alert) => void;
  onNavigate: (location: Location) => void;
  onCancelNavigation: () => void;
}

const MapController = ({ 
  location, 
  destination, 
  isTracking, 
  setIsTracking 
}: { 
  location: Location | null, 
  destination: Location | null,
  isTracking: boolean,
  setIsTracking: (v: boolean) => void
}) => {
  const map = useMap();
  useMapEvents({ dragstart: () => setIsTracking(false) });
  
  useEffect(() => {
    if (destination && location) {
      const bounds = L.latLngBounds([
        [location.lat, location.lng],
        [destination.lat, destination.lng]
      ]);
      map.fitBounds(bounds, { padding: [80, 80] });
    } else if (isTracking && location) {
       map.setView([location.lat, location.lng], map.getZoom(), { animate: true });
    }
  }, [location, destination, map, isTracking]);

  return null;
};

const MapClickHandler = ({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) => {
    useMapEvents({
        click(e) {
            onMapClick(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
};

const MapComponent: React.FC<MapProps> = ({ 
  userLocation, 
  alerts, 
  destination,
  onMarkerClick,
  onNavigate,
  onCancelNavigation
}) => {
  const defaultCenter: [number, number] = [13.7563, 100.5018]; 
  const [isTracking, setIsTracking] = useState(true);
  const [tempMarker, setTempMarker] = useState<Location | null>(null);

  const handleOpenGoogleMaps = () => {
    if (!userLocation || !destination) return;
    const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${destination.lat},${destination.lng}&travelmode=driving`;
    window.open(url, '_blank');
  };

  const handleMapClick = (lat: number, lng: number) => {
      setTempMarker({ lat, lng });
      setIsTracking(false);
  };

  const distanceToDest = (userLocation && destination) 
    ? calculateDistance(userLocation.lat, userLocation.lng, destination.lat, destination.lng).toFixed(1)
    : '0';

  return (
    <div className="h-full w-full relative group font-['Prompt']">
      <MapContainer
        center={userLocation ? [userLocation.lat, userLocation.lng] : defaultCenter}
        zoom={15}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController 
            location={userLocation} 
            destination={destination} 
            isTracking={isTracking}
            setIsTracking={setIsTracking}
        />

        <MapClickHandler onMapClick={handleMapClick} />

        {userLocation && (
          <>
            <CircleMarker 
                center={[userLocation.lat, userLocation.lng]} 
                radius={8}
                pathOptions={{ color: 'white', weight: 3, fillColor: '#2563eb', fillOpacity: 1 }}
            >
               <Popup className="font-['Prompt']">คุณอยู่ที่นี่</Popup>
            </CircleMarker>
            <Circle 
                center={[userLocation.lat, userLocation.lng]} 
                radius={200} 
                pathOptions={{ fillColor: '#2563eb', fillOpacity: 0.05, color: '#2563eb', weight: 0 }} 
                className="animate-ping opacity-20"
            />
          </>
        )}

        {tempMarker && (
            <Marker position={[tempMarker.lat, tempMarker.lng]} icon={goldIcon}>
                <Popup autoClose={false} closeOnClick={false} autoPan={true}>
                    <div className="text-center p-2 font-['Prompt']">
                        <p className="text-xs mb-2 text-slate-500 font-medium">จุดที่เลือก</p>
                        <button 
                            onClick={() => {
                                onNavigate(tempMarker);
                                setTempMarker(null);
                            }}
                            className="bg-slate-800 text-white text-xs px-4 py-2 rounded-full flex items-center gap-1 mx-auto font-bold shadow-md active:scale-95 transition-transform"
                        >
                            <Navigation size={12} /> นำทาง
                        </button>
                    </div>
                </Popup>
            </Marker>
        )}

        {userLocation && destination && (
            <Polyline 
                positions={[
                    [userLocation.lat, userLocation.lng],
                    [destination.lat, destination.lng]
                ]}
                pathOptions={{ color: '#2563eb', weight: 5, dashArray: '10, 10', opacity: 0.7 }}
            />
        )}

        {destination && (
             <Marker position={[destination.lat, destination.lng]} icon={blueIcon}>
             </Marker>
        )}

        {alerts.map((alert) => (
          <Marker
            key={alert.id}
            position={[alert.location.lat, alert.location.lng]}
            icon={getIconByType(alert.type)}
            eventHandlers={{
                click: () => onMarkerClick && onMarkerClick(alert)
            }}
          >
            <Popup className="font-['Prompt']">
              <div className="p-1 min-w-[200px]">
                <div className="flex items-center justify-between gap-2 mb-2 border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2">
                        <div className="bg-slate-50 p-1.5 rounded-full text-slate-500">
                            <User size={14} />
                        </div>
                        <div>
                            <div className="text-[10px] text-slate-400">แจ้งโดย</div>
                            <div className="text-sm font-bold text-slate-700 leading-none">{alert.reporterName}</div>
                        </div>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${getPriorityColor(alert.priority)}`}>
                        {alert.priority}
                    </span>
                </div>

                <strong className={`block mb-1 flex items-center gap-1 text-sm font-bold
                    ${alert.type === EmergencyType.MEDICAL ? 'text-green-600' : 
                      alert.type === EmergencyType.POLICE ? 'text-indigo-600' : 
                      'text-red-600'}`}>
                    {alert.type === EmergencyType.MEDICAL && <Heart size={14} />}
                    {alert.type === EmergencyType.POLICE && <Shield size={14} />}
                    {alert.type === EmergencyType.FIRE && <Flame size={14} />}
                    {alert.type === EmergencyType.CAR && <Car size={14} />}
                    {alert.type === EmergencyType.GENERAL && <AlertTriangle size={14} />}
                    {alert.type}
                </strong>
                <p className="text-sm text-slate-600 m-0 mb-3 bg-slate-50 p-2 rounded-lg border border-slate-100">"{alert.description}"</p>
                
                <div className="flex justify-between items-center mt-1">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock size={10} />
                        {new Date(alert.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                    </span>
                    <button 
                        onClick={() => onNavigate(alert.location)}
                        className="bg-slate-800 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm font-bold transition-transform active:scale-95"
                    >
                        <Navigation size={12} /> ช่วยเหลือ
                    </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* GPS Lock / Re-center Button - Positioned to clear header and safe area */}
      <div className="absolute top-[calc(6rem+env(safe-area-inset-top))] right-4 z-[999]">
        <button 
            onClick={() => setIsTracking(!isTracking)}
            className={`p-3 rounded-2xl shadow-lg border transition-all active:scale-95 ${isTracking ? 'bg-blue-600 text-white border-blue-500' : 'bg-white text-slate-600 border-white active:bg-slate-50'}`}
        >
            <LocateFixed size={20} className={isTracking ? '' : 'opacity-70'} />
        </button>
      </div>

      {/* Navigation Panel - Positioned above bottom nav and safe area */}
      {destination && (
          <div className="absolute bottom-[calc(7rem+env(safe-area-inset-bottom))] left-4 right-4 bg-white/95 backdrop-blur-md p-5 rounded-3xl shadow-2xl z-[1000] animate-in slide-in-from-bottom-5 border border-white/20">
             <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Navigation className="text-blue-600 animate-pulse" size={20} /> 
                        กำลังนำทาง
                    </h3>
                    <p className="text-xs text-slate-500">ระบบนำทางอัตโนมัติ</p>
                </div>
                <div className="text-right">
                    <div className="text-3xl font-bold text-slate-800 leading-none">{distanceToDest} <span className="text-sm font-normal text-slate-500">กม.</span></div>
                    <div className="text-xs text-slate-400 mt-1">{(parseFloat(distanceToDest) * 2).toFixed(0)} นาที</div>
                </div>
             </div>
             
             <div className="flex gap-3 mt-4">
                 <button 
                    onClick={handleOpenGoogleMaps}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-200 active:scale-95 transition-transform"
                 >
                    <ExternalLink size={16} /> Google Maps
                 </button>
                 <button 
                    onClick={onCancelNavigation}
                    className="bg-slate-100 text-slate-600 px-5 py-3 rounded-xl font-bold text-sm active:bg-slate-200"
                 >
                    สิ้นสุด
                 </button>
             </div>
          </div>
      )}
    </div>
  );
};

export default MapComponent;
