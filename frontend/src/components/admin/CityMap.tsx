import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polygon, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Zap, Droplets, Activity, AlertTriangle, ShieldCheck, Layers } from 'lucide-react';
import { riskPredictionEngine, type SectorRisk } from '../../services/predictionEngine';

// Fix Leaflet default icon issue (Moved to component logic/useEffect if needed, or keep safe)
// Safe initialization
try {
    import('leaflet').then(L => {
        if (L.default.Icon.Default.prototype && (L.default.Icon.Default.prototype as any)._getIconUrl) {
            delete (L.default.Icon.Default.prototype as any)._getIconUrl;
            L.default.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
                iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            });
        }
    });
} catch (e) {
    console.warn("Leaflet icon fix failed", e);
}

// Dark Matter Map Tiles
const DARK_MAP_STYLE = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

function MapEffect() {
    const map = useMap();
    useEffect(() => {
        map.invalidateSize();
    }, [map]);
    return null;
}

export const CityMap: React.FC = () => {
    const [sectors, setSectors] = useState<SectorRisk[]>([]);
    const [selectedSector, setSelectedSector] = useState<SectorRisk | null>(null);
    const center: [number, number] = [12.9716, 77.5946]; // Bangalore

    useEffect(() => {
        riskPredictionEngine.startSimulation();
        const unsubscribe = riskPredictionEngine.subscribe((data) => {
            setSectors([...data]);
        });
        return () => {
            unsubscribe();
            riskPredictionEngine.stopSimulation();
        };
    }, []);

    const getSectorColor = (score: number) => {
        if (score > 80) return '#ef4444'; // Red-500
        if (score > 50) return '#f59e0b'; // Amber-500
        return '#10b981'; // Emerald-500
    };

    return (
        <div className="h-screen w-full relative bg-slate-950 overflow-hidden group">

            {/* HUD Overlay - Top Left */}
            <div className="absolute top-6 left-6 z-[1000] space-y-4 pointer-events-none">
                <div className="glass-panel bg-black/80 backdrop-blur-md border border-slate-700/50 p-6 rounded-2xl w-[320px] pointer-events-auto shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                    <div className="flex items-center gap-3 mb-4 border-b border-slate-800 pb-4">
                        <div className="bg-blue-500/20 p-2 rounded-lg border border-blue-500/30 animate-pulse">
                            <Activity className="text-blue-400" size={24} />
                        </div>
                        <div>
                            <h2 className="text-white font-black text-xl tracking-wide uppercase">City OS <span className="text-blue-500">AI</span></h2>
                            <p className="text-xs text-blue-400 font-mono tracking-widest">REAL-TIME PREDICTION ENGINE</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-400">Total Sectors</span>
                            <span className="text-white font-mono font-bold">{sectors.length} Active</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-400">Avg Risk (City-wide)</span>
                            <span className="text-emerald-400 font-mono font-bold">
                                {Math.floor(sectors.reduce((acc, s) => acc + s.riskScore, 0) / (sectors.length || 1))}%
                            </span>
                        </div>

                        <div className="h-px bg-slate-800 my-2" />

                        <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wider mb-2 font-bold">Layer Control</p>
                            <div className="flex gap-2">
                                <button className="flex-1 py-2 bg-slate-800/50 hover:bg-blue-900/40 border border-slate-700 hover:border-blue-500/50 rounded-lg text-xs text-slate-300 transition-all flex flex-col items-center gap-1">
                                    <Zap size={14} className="text-yellow-400" /> Power
                                </button>
                                <button className="flex-1 py-2 bg-slate-800/50 hover:bg-blue-900/40 border border-slate-700 hover:border-blue-500/50 rounded-lg text-xs text-slate-300 transition-all flex flex-col items-center gap-1">
                                    <Droplets size={14} className="text-sky-400" /> Water
                                </button>
                                <button className="flex-1 py-2 bg-blue-600 border border-blue-400 rounded-lg text-xs text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] flex flex-col items-center gap-1">
                                    <Layers size={14} /> AI Heatmap
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Selected Sector Details */}
                {selectedSector && (
                    <div className="glass-panel bg-black/90 backdrop-blur-xl border border-slate-700/50 p-6 rounded-2xl w-[320px] pointer-events-auto animate-in slide-in-from-left duration-300">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-2xl font-bold text-white">{selectedSector.name}</h3>
                            <button onClick={() => setSelectedSector(null)} className="text-slate-500 hover:text-white">×</button>
                        </div>

                        <div className="mb-6">
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-slate-400 text-sm">Predictive Risk Score</span>
                                <span className={`text-2xl font-black ${selectedSector.riskScore > 50 ? 'text-red-500' : 'text-emerald-400'}`}>
                                    {selectedSector.riskScore}/100
                                </span>
                            </div>
                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-1000 ${selectedSector.riskScore > 50 ? 'bg-red-500' : 'bg-emerald-500'}`}
                                    style={{ width: `${selectedSector.riskScore}%` }}
                                />
                            </div>
                        </div>

                        {selectedSector.predictedIssues.length > 0 ? (
                            <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 mb-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertTriangle className="text-red-500" size={16} />
                                    <h4 className="text-red-400 font-bold text-sm uppercase">AI Forecast: High Probability</h4>
                                </div>
                                <ul className="space-y-2">
                                    {selectedSector.predictedIssues.map((issue, i) => (
                                        <li key={i} className="text-white text-sm bg-red-500/10 px-2 py-1 rounded border-l-2 border-red-500">
                                            {issue}
                                        </li>
                                    ))}
                                </ul>
                                <button className="w-full mt-3 bg-red-600 hover:bg-red-500 text-white py-2 rounded-lg text-sm font-bold shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all">
                                    Dispatch Response Team
                                </button>
                            </div>
                        ) : (
                            <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-xl p-4 flex items-center gap-3">
                                <ShieldCheck className="text-emerald-500" size={24} />
                                <div>
                                    <h4 className="text-emerald-400 font-bold text-sm">System Normal</h4>
                                    <p className="text-emerald-200/60 text-xs">No anomalies detected by AI.</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Map Container */}
            <MapContainer
                center={center}
                zoom={12}
                style={{ height: '100%', width: '100%', background: '#020617' }}
                zoomControl={false}
            >
                <MapEffect />
                <TileLayer
                    attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url={DARK_MAP_STYLE}
                />

                {sectors.map((sector) => (
                    <Polygon
                        key={sector.id}
                        positions={sector.coordinates as any}
                        pathOptions={{
                            color: getSectorColor(sector.riskScore),
                            fillColor: getSectorColor(sector.riskScore),
                            fillOpacity: sector.riskScore > 50 ? 0.4 : 0.1, // Bright for risk, dim for safe
                            weight: 2,
                            opacity: 0.8,
                        }}
                        eventHandlers={{
                            click: () => {
                                setSelectedSector(sector);
                            },
                        }}
                    >
                        {/* Hover Tooltip */}
                        <Tooltip sticky direction="top" opacity={0.9}>
                            <div className="text-center">
                                <span className="font-bold block text-sm">{sector.name}</span>
                                <span className={`text-xs font-mono font-bold ${sector.riskScore > 50 ? 'text-red-600' : 'text-green-600'}`}>
                                    Risk: {sector.riskScore}%
                                </span>
                            </div>
                        </Tooltip>
                    </Polygon>
                ))}
            </MapContainer>
        </div>
    );
};
