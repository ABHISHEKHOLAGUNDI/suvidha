// DATABASE RESET UTILITY
// Run this in browser console to clean reset: resetDatabase()

export function resetDatabase() {
    console.log('🗑️ Clearing all LocalDB data...');

    // Clear all SUVIDHA keys
    const keys = [
        'suvidha_init',
        'suvidha_session',
        'suvidha_users',
        'suvidha_bills',
        'suvidha_grievances',
        'suvidha_wallet',
        'suvidha_waste',
        'accessibility_contrast',
        'accessibility_fontSize'
    ];

    keys.forEach(key => {
        localStorage.removeItem(key);
        console.log(`✅ Cleared: ${key}`);
    });

    console.log('✨ Database reset complete! Reload the page to re-seed.');
    console.log('👉 User: abhishekH / admin');
    console.log('👉 Admin: admin / admin123');
}

// Auto-expose to window for console access
if (typeof window !== 'undefined') {
    (window as any).resetDatabase = resetDatabase;
    console.log('💡 Database reset utility loaded. Type: resetDatabase()');
}
