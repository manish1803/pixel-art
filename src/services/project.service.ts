import { connectToDatabase } from '@/lib/mongodb';
import { Project, IProject } from '@/models/Project';
import type { UpdateProjectInput, CreateProjectInput } from '@/lib/validations/project';

// Serialize a Mongoose document to a plain JS object with `id` string
function serialize(doc: IProject) {
  const obj = doc.toObject({ flattenMaps: true });
  return {
    ...obj,
    id: (obj._id as { toString(): string }).toString(),
    _id: undefined,
    __v: undefined,
  };
}

export async function getProjectsByUser(userId: string) {
  await connectToDatabase();
  const docs = await Project.find({ userId }).sort({ createdAt: -1 });
  return docs.map(serialize);
}

export async function getProjectById(userId: string, id: string) {
  await connectToDatabase();
  const doc = await Project.findOne({ _id: id, userId });
  return doc ? serialize(doc) : null;
}

export async function getProject(id: string) {
  await connectToDatabase();
  try {
    const doc = await Project.findOne({ _id: id });
    return doc ? serialize(doc) : null;
  } catch (e) {
    return null;
  }
}

export async function createProject(userId: string, data: CreateProjectInput & { folderId?: string | null }) {
  await connectToDatabase();
  const doc = await Project.create({
    userId,
    ...data,
    date: data.date ?? new Date().toLocaleDateString(),
  });
  return serialize(doc);
}

export async function updateProject(userId: string, id: string, data: UpdateProjectInput & { folderId?: string | null }) {
  await connectToDatabase();
  const doc = await Project.findOneAndUpdate(
    { _id: id, userId },
    { $set: data },
    { returnDocument: 'after' }
  );
  return doc ? serialize(doc) : null;
}

export async function moveProjectToFolder(userId: string, projectId: string, folderId: string | null) {
  await connectToDatabase();
  const doc = await Project.findOneAndUpdate(
    { _id: projectId, userId },
    { $set: { folderId } },
    { returnDocument: 'after' }
  );
  return doc ? serialize(doc) : null;
}

export async function deleteProject(userId: string, id: string) {
  await connectToDatabase();
  const doc = await Project.findOneAndDelete({ _id: id, userId });
  return doc ? serialize(doc) : null;
}

export async function toggleProjectField(
  userId: string,
  id: string,
  field: 'isFavourite' | 'isDraft'
) {
  await connectToDatabase();
  const doc = await Project.findOne({ _id: id, userId });
  if (!doc) return null;
  doc[field] = !doc[field];
  await doc.save();
  return serialize(doc);
}
