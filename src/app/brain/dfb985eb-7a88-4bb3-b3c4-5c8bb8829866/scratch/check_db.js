import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI not found');
  process.exit(1);
}

// Define Schema manually for script
const ProjectSchema = new mongoose.Schema({
  userId: String,
  name: String,
  isDraft: Boolean,
  isFavourite: Boolean,
}, { timestamps: true });

const Project = mongoose.models.Project || mongoose.model('Project', ProjectSchema);

async function checkDb() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected.');

    const total = await Project.countDocuments();
    console.log(`Total projects in DB: ${total}`);

    const projects = await Project.find().limit(10).sort({ createdAt: -1 });
    
    if (projects.length === 0) {
      console.log('No projects found in the database at all.');
    } else {
      console.log('Last 10 projects:');
      projects.forEach(p => {
        console.log(`- Name: ${p.name}, UserID: ${p.userId}, Draft: ${p.isDraft}, Created: ${p.createdAt}`);
      });
    }

    const uniqueUsers = await Project.distinct('userId');
    console.log(`Unique user IDs in DB: ${uniqueUsers.join(', ')}`);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkDb();
