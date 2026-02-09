
// Simulated AI Prediction Engine for Smart City
// Uses simulated cellular automata logic to predict infrastructure risks

export interface SectorRisk {
    id: string;
    name: string;
    coordinates: number[][]; // Polygon coords
    riskScore: number; // 0-100
    predictedIssues: string[]; // "Power Surge", "Water Leak"
    lastUpdated: Date;
}

// Mock sectors (Bangalore central areas)
const SECTORS = [
    { id: 'SEC-001', name: 'Indiranagar', lat: 12.9719, lng: 77.6412 },
    { id: 'SEC-002', name: 'Koramangala', lat: 12.9352, lng: 77.6245 },
    { id: 'SEC-003', name: 'Whitefield', lat: 12.9698, lng: 77.7500 },
    { id: 'SEC-004', name: 'Jayanagar', lat: 12.9308, lng: 77.5838 },
    { id: 'SEC-005', name: 'MG Road', lat: 12.9750, lng: 77.6095 },
    { id: 'SEC-006', name: 'HSR Layout', lat: 12.9121, lng: 77.6446 },
];

export class PredictionEngine {
    private listeners: ((data: SectorRisk[]) => void)[] = [];
    private intervalParams: any = null;
    private sectors: SectorRisk[] = [];

    constructor() {
        this.initializeSectors();
    }

    private initializeSectors() {
        this.sectors = SECTORS.map(sec => ({
            id: sec.id,
            name: sec.name,
            coordinates: this.generateHexagon(sec.lat, sec.lng, 0.015),
            riskScore: Math.floor(Math.random() * 30), // Initial low risk
            predictedIssues: [],
            lastUpdated: new Date()
        }));
    }

    // Helper to make hexagon polygons for cool visuals
    private generateHexagon(lat: number, lng: number, radius: number): number[][] {
        const coords = [];
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            // Simple flat earth approx for visuals
            const dLat = radius * Math.cos(angle);
            const dLng = radius * Math.sin(angle);
            coords.push([lat + dLat, lng + dLng]);
        }
        return coords;
    }

    public startSimulation() {
        if (this.intervalParams) return;

        this.intervalParams = setInterval(() => {
            this.updateRisks();
            this.notifyListeners();
        }, 3000); // Update every 3 seconds for "Live AI" feel
    }

    public stopSimulation() {
        if (this.intervalParams) {
            clearInterval(this.intervalParams);
            this.intervalParams = null;
        }
    }

    public subscribe(callback: (data: SectorRisk[]) => void) {
        this.listeners.push(callback);
        callback(this.sectors); // Immediate update
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        };
    }

    private updateRisks() {
        this.sectors = this.sectors.map(sector => {
            // Random fluctuation
            let change = (Math.random() * 10) - 4; // Tend towards slight increase
            let newScore = Math.min(100, Math.max(0, sector.riskScore + change));

            // "AI events"
            let issues = [];
            if (newScore > 80) issues.push("CRITICAL: Pipe Failure Imminent");
            else if (newScore > 60) issues.push("WARNING: Load Surge Detected");

            // Randomly clear high risks (simulation of auto-fix)
            if (newScore > 90 && Math.random() > 0.8) {
                newScore = 20;
                issues = ["SYSTEM: Auto-Rerouted Traffic"];
            }

            return {
                ...sector,
                riskScore: Math.floor(newScore),
                predictedIssues: issues,
                lastUpdated: new Date()
            };
        });
    }

    private notifyListeners() {
        this.listeners.forEach(l => l(this.sectors));
    }
}

export const riskPredictionEngine = new PredictionEngine();
