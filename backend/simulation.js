/**
 * SUVIDHA City OS - Simulation Engine
 * The "Heartbeat" of the Digital Twin
 * Generates realistic utility consumption data every 5 seconds
 */

/**
 * SUVIDHA City OS - Simulation Engine
 * The "Heartbeat" of the Digital Twin
 * Generates realistic utility consumption data every 5 seconds
 */

let simulationActive = false;
let chaosMode = false; // Default: OFF (User requested control)

const startSimulation = (db, io) => {
    console.log('⚡ Starting City Simulation Engine...');

    // Simulation runs every 5 seconds (represents 1 hour in-game)
    const TICK_INTERVAL = 5000;

    simulationActive = true;

    setInterval(async () => {
        if (!simulationActive) return;

        try {
            // Get all meters (active + outage)
            const metersResult = await db.query("SELECT * FROM smart_meters");
            const meters = metersResult.rows;
            const valvesResult = await db.query("SELECT * FROM water_valves");
            const valves = valvesResult.rows;

            // Time-based usage multiplier (simulates day/night patterns)
            const hour = new Date().getHours();
            const isPeakHours = (hour >= 18 && hour <= 22); // 6pm-10pm peak
            const usageMultiplier = isPeakHours ? 1.5 : 1.0;

            // ELECTRICITY SIMULATION
            for (const meter of meters) {
                let status = meter.status;
                let newLoad = meter.current_load_kw;
                let newTotalUnits = meter.total_units;

                if (status === 'ACTIVE') {
                    // Normal Operation
                    const baseLoad = 1.5 + Math.random() * 2.0;
                    newLoad = (baseLoad * usageMultiplier).toFixed(2);

                    const unitsIncrement = (newLoad * 0.083).toFixed(2);
                    newTotalUnits = parseFloat(meter.total_units) + parseFloat(unitsIncrement);

                    // Random outage (Only if CHAOS MODE is ON)
                    if (chaosMode && Math.random() < 0.02) {
                        status = 'OUTAGE';
                        newLoad = 0;
                        console.log(`⚡ OUTAGE simulated for user ${meter.user_id}`);

                        io.emit('emergency-alert', {
                            userId: meter.user_id,
                            type: 'POWER_OUTAGE',
                            message: '⚡ GRID FAILURE DETECTED',
                            timestamp: new Date().toISOString()
                        });
                    }
                } else {
                    // Outage State - Chance to Restore (20% chance per tick)
                    newLoad = 0;
                    if (Math.random() < 0.2) {
                        status = 'ACTIVE';
                        console.log(`✅ POWER RESTORED for user ${meter.user_id}`);

                        io.emit('emergency-alert', {
                            userId: meter.user_id,
                            type: 'POWER_RESTORED',
                            message: '✅ GRID POWER RESTORED',
                            timestamp: new Date().toISOString()
                        });
                    }
                }

                await db.query(
                    `UPDATE smart_meters SET current_load_kw = $1, total_units = $2, status = $3, last_updated = $4 WHERE id = $5`,
                    [newLoad, newTotalUnits, status, new Date().toISOString(), meter.id]
                );
            }

            // WATER SIMULATION
            for (const valve of valves) {
                // Randomize pressure (2.5 - 4.0 bar normal)
                const newPressure = (2.5 + Math.random() * 1.5).toFixed(2);

                // Randomize flow rate (10-20 LPM residential)
                const newFlowRate = (10 + Math.random() * 10).toFixed(2);

                // Random leak detection (Only if CHAOS MODE is ON)
                let leakage = valve.leakage_detected;
                if (!leakage && chaosMode && Math.random() < 0.03) {
                    leakage = 1;
                    console.log(`💧 LEAK detected for user ${valve.user_id}`);

                    io.emit('emergency-alert', {
                        userId: valve.user_id,
                        type: 'WATER_LEAK',
                        message: '💧 LEAK DETECTED - Bill Rising!',
                        timestamp: new Date().toISOString()
                    });
                }

                await db.query(
                    `UPDATE water_valves SET flow_rate_lpm = $1, pressure_level = $2, leakage_detected = $3, last_updated = $4 WHERE id = $5`,
                    [newFlowRate, newPressure, leakage, new Date().toISOString(), valve.id]
                );
            }

            // Emit aggregated metrics for admin dashboard
            const totalLoad = meters
                .filter(m => m.status === 'ACTIVE')
                .reduce((sum, m) => sum + parseFloat(m.current_load_kw), 0);

            const outageCount = meters.filter(m => m.status === 'OUTAGE').length;
            const leakCount = valves.filter(v => v.leakage_detected).length;

            io.emit('city-metrics', {
                totalLoad: totalLoad.toFixed(2),
                activeMeters: meters.filter(m => m.status === 'ACTIVE').length,
                outageCount,
                leakCount,
                timestamp: new Date().toISOString()
            });

            // Emit individual user metrics (for live dashboard updates)
            for (const meter of meters) {
                const valve = valves.find(v => v.user_id === meter.user_id);

                io.emit(`user-metrics-${meter.user_id}`, {
                    electricity: {
                        currentLoad: meter.current_load_kw,
                        totalUnits: meter.total_units,
                        status: meter.status
                    },
                    water: {
                        flowRate: valve?.flow_rate_lpm || 0,
                        pressure: valve?.pressure_level || 0,
                        leakage: !!valve?.leakage_detected
                    },
                    timestamp: new Date().toISOString()
                });
            }

        } catch (error) {
            console.error('❌ Simulation error:', error);
        }
    }, TICK_INTERVAL);

    console.log('✅ City Simulation Engine Active - Tick every 5 seconds');
    console.log('🏙️  Digital Twin is now ALIVE');

    // Graceful shutdown
    process.on('SIGINT', () => {
        simulationActive = false;
        console.log('\n⏹️  Simulation Engine stopped');
        process.exit();
    });
};

module.exports = {
    start: startSimulation,
    setChaosMode: (enabled) => {
        chaosMode = enabled;
        console.log(`⚠️ SIMULATION: Chaos Mode set to ${enabled}`);
    }
};
