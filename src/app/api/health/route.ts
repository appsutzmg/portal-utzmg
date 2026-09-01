import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/** Endpoint liviano para monitoreo (UptimeRobot, etc.) y evitar cold starts en Render free. */
export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      service: 'portal-utzmg',
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}
