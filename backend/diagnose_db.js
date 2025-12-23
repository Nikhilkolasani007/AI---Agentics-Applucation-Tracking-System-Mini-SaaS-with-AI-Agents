const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const User = require("./models/User");
const Job = require("./models/Job");
const Candidate = require("./models/Candidate");

const fs = require("fs");

async function diagnose() {
    try {
        const dbs = ["mern-auth", "talentdb"];
        let finalOutput = "";

        for (const dbName of dbs) {
            const uri = `mongodb://localhost:27017/${dbName}`;
            console.log(`Checking ${dbName}...`);
            const conn = await mongoose.createConnection(uri).asPromise();

            const userCount = await conn.collection("users").countDocuments();
            const jobCount = await conn.collection("jobs").countDocuments();
            const appCount = await conn.collection("applications").countDocuments();
            const candCount = await conn.collection("candidates").countDocuments();

            finalOutput += `--- Database: ${dbName} ---\n`;
            finalOutput += `Users: ${userCount}\n`;
            finalOutput += `Jobs: ${jobCount}\n`;
            finalOutput += `Applications: ${appCount}\n`;
            finalOutput += `Candidates: ${candCount}\n\n`;

            if (userCount > 0) {
                const users = await conn.collection("users").find().toArray();
                users.forEach(u => finalOutput += `User: ${u.email} (ID: ${u._id})\n`);
            }

            finalOutput += "\n";
            await conn.close();
        }

        fs.writeFileSync("diagnose_output.txt", finalOutput);
        console.log("Output written to diagnose_output.txt");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

diagnose();
