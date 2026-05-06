import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

const ProjectSchema = new mongoose.Schema({
  userId: String,
}, { timestamps: true });

const Project = mongoose.models.Project || mongoose.model('Project', ProjectSchema);

const OLD_IDS = [
  '0a480aec-07d2-4b98-a07b-bbc6020609bb',
  '86dcad26-5f50-4b14-99f5-59cda6942e06',
  'cb140e3a-d842-4d73-ad92-37982b8bbea8',
  'cecf6b91-d740-488e-985a-6a78e153c304'
];

const TARGET_ID = '4e45b100-c6b9-4cb3-ae78-ab3107a9000c';

async function migrate() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Migrating projects to stable ID:', TARGET_ID);

    const result = await Project.updateMany(
      { userId: { $in: OLD_IDS } },
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
