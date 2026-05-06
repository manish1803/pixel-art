import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../auth';
import { updateFolder, deleteFolder } from '../../../../lib/services/folder.service';

function unauthorized() {
  return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
}

type Params = { params: { id: string } };

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  try {
    const { name } = await req.json();
    const updated = await updateFolder(session.user.id, params.id, name);
    if (!updated) return NextResponse.json({ success: false, error: 'Not Found' }, { status: 404 });
    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Internal Error' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  try {
    const deleted = await deleteFolder(session.user.id, params.id);
    if (!deleted) return NextResponse.json({ success: false, error: 'Not Found' }, { status: 404 });
    return NextResponse.json({ success: true, data: null });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Internal Error' }, { status: 500 });
  }
}
