import { Metadata } from 'next';
import ProjectsClient from './ProjectsClient';
import { auth } from '@/lib/auth/auth';
import { getProjectsByUser } from '@/services/project.service';
import { getFoldersByUser } from '@/services/folder.service';

export const metadata: Metadata = {
  title: 'My Projects',
  description: 'Manage your pixel art creations, organize them into folders, and start new designs in a premium dark-themed environment.',
  openGraph: {
    title: 'My Projects | Pixel Art Editor',
    description: 'Manage and organize your pixel art creations.',
  }
};

export default async function ProjectsPage() {
  const session = await auth();
  const userId = session?.user?.id;
  
  let initialProjects = [];
  let initialFolders = [];
  
  if (userId) {
    try {
      // Fetch data on the server to eliminate loading spinners and waterfalls
      [initialProjects, initialFolders] = await Promise.all([
        getProjectsByUser(userId),
        getFoldersByUser(userId)
      ]);
    } catch (error) {
      console.error('Failed to fetch initial projects/folders on server:', error);
    }
  }
  
  return <ProjectsClient initialProjects={initialProjects} initialFolders={initialFolders} />;
}
