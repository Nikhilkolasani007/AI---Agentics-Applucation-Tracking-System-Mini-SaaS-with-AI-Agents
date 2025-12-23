const mongoose = require("mongoose");
const fs = require("fs");

async function diagnoseTypes() {
    try {
        const uri = "mongodb://localhost:27017/mern-auth";
        const conn = await mongoose.createConnection(uri).asPromise();

        let output = "";

        const jobs = await conn.collection("jobs").find().toArray();
        output += "JOBS:\n";
        jobs.forEach(j => {
            output += `Job _id: ${j._id} | publicFormId: ${j.publicFormId} (Type: ${typeof j.publicFormId})\n`;
        });

        output += "\nAPPLICATIONS:\n";
        const apps = await conn.collection("applications").find().toArray();
        apps.forEach(a => {
            output += `App jobId: ${a.jobId} (Type: ${typeof a.jobId}, Constructor: ${a.jobId?.constructor?.name})\n`;
        });

        fs.writeFileSync("diagnose_types.txt", output);
        console.log("Written to diagnose_types.txt");

        await conn.close();
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

diagnoseTypes();
