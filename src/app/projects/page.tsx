import { Metadata } from 'next';
import ProjectsClient from './ProjectsClient';

export const metadata: Metadata = {
  title: 'My Projects',
  description: 'Manage your pixel art creations, organize them into folders, and start new designs in a premium dark-themed environment.',
  openGraph: {
    title: 'My Projects | Pixel Art Editor',
    description: 'Manage and organize your pixel art creations.',
  }
};

export default function ProjectsPage() {
  return <ProjectsClient />;
}
