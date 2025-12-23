const mongoose = require("mongoose");

async function migrate() {
    const sourceUri = "mongodb://localhost:27017/talentdb";
    const targetUri = "mongodb://localhost:27017/mern-auth";

    try {
        const sourceConn = await mongoose.createConnection(sourceUri).asPromise();
        const targetConn = await mongoose.createConnection(targetUri).asPromise();

        const apps = await sourceConn.collection("applications").find().toArray();
        console.log(`Found ${apps.length} applications in talentdb.`);

        if (apps.length > 0) {
            // Clear target applications first to avoid duplicates or mess
            // await targetConn.collection("applications").deleteMany({});

            // Insert into target
            await targetConn.collection("applications").insertMany(apps);
            console.log(`Migrated ${apps.length} applications to mern-auth.`);
        }

        await sourceConn.close();
        await targetConn.close();
        console.log("Migration complete.");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

migrate();
