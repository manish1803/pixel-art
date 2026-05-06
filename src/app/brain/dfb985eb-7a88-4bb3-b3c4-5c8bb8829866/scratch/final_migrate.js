import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

const ProjectSchema = new mongoose.Schema({
  userId: String,
}, { timestamps: true });

const Project = mongoose.models.Project || mongoose.model('Project', ProjectSchema);

// The actual ID from the user's debug page
const TARGET_ID = '8b13fd5f-5c94-4b43-aab1-ca28af3ee293';

async function migrate() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Final migration to stable ID:', TARGET_ID);

    // Update ALL projects currently in the DB to this ID
    // Since it's a dev environment and only one user is testing.
    const result = await Project.updateMany(
      {}, 
      { $set: { userId: TARGET_ID } }
    );

    console.log(`Successfully migrated ${result.modifiedCount} projects.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

migrate();
