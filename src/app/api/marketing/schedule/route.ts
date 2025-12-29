import { NextResponse } from 'next/server';
import { scheduler } from '@/lib/scheduler';

export async function POST(req: Request) {
    try {
        const { action } = await req.json();

        if (action === 'start') {
            scheduler.start();
            return NextResponse.json({ success: true, status: 'active', message: 'Scheduler Started (9 Daily Slots)' });
        } else if (action === 'stop') {
            scheduler.stop();
            return NextResponse.json({ success: true, status: 'stopped', message: 'Scheduler Stopped' });
        } else if (action === 'status') {
            return NextResponse.json({
                success: true,
                status: scheduler.isActive ? 'active' : 'stopped',
                message: scheduler.isActive ? 'Active (Running 9 Daily Slots)' : 'Stopped'
            });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
