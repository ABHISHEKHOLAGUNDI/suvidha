const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

(async () => {
    try {
        const db = await open({
            filename: './database.sqlite',
            driver: sqlite3.Database
        });
        const users = await db.all("SELECT email, role FROM users");
        console.log("Found users:");
        console.log(users);
    } catch (err) {
        console.error("Error:", err);
    }
})();
