import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Map Style: Dark Matter (Enterprise Grade)
const MAP_STYLE = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

interface SectorData {
    id: string;
    name: string;
    risk_score: number;
    geojson: any;
}

export const MapAnalytics: React.FC = () => {
    const [sectors, setSectors] = useState<SectorData[]>([]);

    useEffect(() => {
        // Mock initial data - In real integration this would fetch from Supabase
        setSectors([
            {
                id: '1', name: 'Indiranagar', risk_score: 85,
                geojson: { type: 'Polygon', coordinates: [[[77.63, 12.97], [77.64, 12.97], [77.64, 12.96], [77.63, 12.96], [77.63, 12.97]]] }
            },
            {
                id: '2', name: 'Koramangala', risk_score: 45,
                geojson: { type: 'Polygon', coordinates: [[[77.61, 12.93], [77.62, 12.93], [77.62, 12.92], [77.61, 12.92], [77.61, 12.93]]] }
            }
        ]);
    }, []);

    const getStyle = (feature: any) => {
        const sector = sectors.find(s => s.id === (feature.properties ? feature.properties.id : '1')); // Mock fallback
        const score = sector?.risk_score || 85;

        return {
            fillColor: score > 80 ? '#ef4444' : score > 50 ? '#f59e0b' : '#10b981',
            weight: 2,
            opacity: 1,
            color: 'white',
            fillOpacity: 0.4
        };
    };

    return (
        <div className="h-full w-full relative min-h-[500px] rounded-2xl overflow-hidden border border-slate-700">
            <div className="absolute top-4 left-4 z-[999] bg-black/80 backdrop-blur border border-slate-700 p-4 rounded-xl w-64 pointer-events-auto">
                <h3 className="text-white font-bold uppercase tracking-widest mb-2 border-b border-slate-700 pb-2">
                    City Pulse <span className="text-emerald-500">• LIVE</span>
                </h3>
                <div className="space-y-2">
                    <div className="flex justify-between text-xs animate-pulse">
                        <span className="text-slate-300">POWER GRID</span>
                        <span className="text-red-400">CRITICAL</span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-slate-300">WATER LEVELS</span>
                        <span className="text-emerald-400">NORMAL</span>
                    </div>
                </div>
            </div>

            <MapContainer center={[12.9716, 77.5946]} zoom={12} style={{ height: '100%', minHeight: '500px', background: '#000' }}>
                <TileLayer url={MAP_STYLE} attribution="&copy; CARTO" />
                {sectors.map(sector => (
                    <GeoJSON key={sector.id} data={sector.geojson} style={getStyle as any}>
                        <Tooltip>{sector.name}: Risk {sector.risk_score}%</Tooltip>
                    </GeoJSON>
                ))}
            </MapContainer>
        </div>
    );
};
