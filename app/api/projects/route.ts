import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../auth';
import { getProjectsByUser, createProject } from '../../../lib/services/project.service';
import { CreateProjectSchema } from '../../../lib/validations/project';
import { ZodError } from 'zod';

function unauthorized() {
  return NextResponse.json(
    { success: false, error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } },
    { status: 401 }
  );
}

// GET /api/projects — list all projects for the authenticated user
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  try {
    const projects = await getProjectsByUser(session.user.id);
    return NextResponse.json({ success: true, data: projects });
  } catch (err) {
    console.error('[GET /api/projects]', err);
    return NextResponse.json(
      { success: false, error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}

// POST /api/projects — create a new project
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  try {
    const body = await req.json();
    const validated = CreateProjectSchema.parse(body);
    const project = await createProject(session.user.id, validated);
    return NextResponse.json({ success: true, data: project }, { status: 201 });
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: { message: 'Validation failed', details: err.issues } },
        { status: 400 }
      );
    }
    console.error('[POST /api/projects]', err);
    return NextResponse.json(
      { success: false, error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
