import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

const ProjectSchema = new mongoose.Schema({
  userId: String,
}, { timestamps: true });

const Project = mongoose.models.Project || mongoose.model('Project', ProjectSchema);

// The user's stable email
const TARGET_ID = 'patilmanishp18@gmail.com';

async function migrate() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Migrating ALL projects to stable email:', TARGET_ID);

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
