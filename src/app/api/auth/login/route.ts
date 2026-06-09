import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { username, password } = await request.json();

  if (username === 'Admin' && password === 'Admin123') {
    const response = NextResponse.json({ success: true });
    response.cookies.set('admin-session', 'authenticated', {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    return response;
  }

  return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
}
