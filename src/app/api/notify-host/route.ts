import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { rideId, passengerId, seats, landmark, message } = body;

    if (!rideId || !passengerId) {
      return NextResponse.json({ error: 'Missing rideId or passengerId' }, { status: 400 });
    }

    // 1. Fetch Ride Details
    const { data: ride, error: rideError } = await supabase
      .from('commute_rides')
      .select('host_id, origin, destination, departure_date, departure_time, transport_mode')
      .eq('id', rideId)
      .single();

    if (rideError || !ride) {
      return NextResponse.json({ error: 'Ride not found' }, { status: 404 });
    }

    // 2. Fetch Host Profile & Passenger Profile
    const [{ data: hostProfile }, { data: passengerProfile }] = await Promise.all([
      supabase.from('commute_profiles').select('full_name, user_net_id').eq('id', ride.host_id).single(),
      supabase.from('commute_profiles').select('full_name, user_net_id, department, year_of_study').eq('id', passengerId).single(),
    ]);

    if (!hostProfile?.user_net_id) {
      return NextResponse.json({ error: 'Host profile netId not found' }, { status: 404 });
    }

    const hostEmail = `${hostProfile.user_net_id.toLowerCase().trim()}@srmist.edu.in`;
    const passengerName = passengerProfile?.full_name || passengerProfile?.user_net_id || 'A fellow student';
    const passengerDept = passengerProfile?.department ? `${passengerProfile.department}` : 'SRMIST';

    // 3. Email Subject & HTML Template (Unfugly Dark Aesthetic)
    const emailSubject = `🚗 Convoy: ${passengerName} requested to join your ride to ${ride.destination}`;
    const activityUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://convoy.unfugly.app';

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New Convoy Ride Request</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0d0f12; color: #f1f5f9; margin: 0; padding: 0; }
    .container { max-width: 560px; margin: 30px auto; background-color: #16181d; border: 1px solid #292d35; border-radius: 16px; overflow: hidden; }
    .header { background-color: #121418; padding: 24px; text-align: center; border-bottom: 2px solid #1e88e5; }
    .content { padding: 28px 24px; }
    .card { background-color: #101216; border: 1px solid #242832; border-radius: 12px; padding: 18px; margin: 20px 0; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 600; background-color: #1e88e520; color: #60a5fa; border: 1px solid #1e88e540; }
    .btn { display: inline-block; background-color: #1e88e5; color: #ffffff !important; font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 9999px; text-decoration: none; text-align: center; margin: 10px 0; }
    .footer { padding: 20px; text-align: center; font-size: 11px; color: #6b7280; border-top: 1px solid #20242e; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 800; letter-spacing: -0.5px;">Convoy</h2>
      <p style="margin: 4px 0 0 0; color: #8a919e; font-size: 12px;">SRMIST Campus & Exam Transit Hub</p>
    </div>
    <div class="content">
      <div class="badge">New Ride Request</div>
      <h3 style="color: #ffffff; font-size: 18px; margin: 14px 0 8px 0;">Hey ${hostProfile.full_name || 'Host'},</h3>
      <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">
        <strong>${passengerName}</strong> (${passengerDept}) just sent a request to join your Convoy ride.
      </p>

      <div class="card">
        <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #8a919e; margin-bottom: 6px;">Ride Route</div>
        <div style="font-size: 15px; font-weight: 700; color: #ffffff;">${ride.origin} ➔ ${ride.destination}</div>
        <div style="font-size: 12px; color: #94a3b8; margin-top: 4px;">📅 ${ride.departure_date} at ${ride.departure_time}</div>
        
        <hr style="border: 0; border-top: 1px solid #242832; margin: 14px 0;">

        <div style="font-size: 13px; color: #cbd5e1; margin-bottom: 4px;">
          <strong>Seats Requested:</strong> ${seats} ${seats === 1 ? 'seat' : 'seats'}
        </div>
        ${landmark ? `<div style="font-size: 13px; color: #cbd5e1; margin-bottom: 4px;"><strong>Pickup Spot:</strong> ${landmark}</div>` : ''}
        ${message ? `<div style="font-size: 13px; color: #cbd5e1; font-style: italic; margin-top: 6px;">&ldquo;${message}&rdquo;</div>` : ''}
      </div>

      <div style="text-align: center; margin: 24px 0 16px 0;">
        <a href="${activityUrl}" class="btn">Open Activity to Accept / Decline</a>
      </div>

      <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin-top: 20px;">
        🔒 <strong>Zero-PII Protection:</strong> Your phone number and 1-tap WhatsApp chat will only be revealed to the passenger if you tap <strong>Accept</strong> in your Activity tab.
      </p>
    </div>
    <div class="footer">
      Convoy by Unfugly · Strictly for @srmist.edu.in students<br>
      Automated transit notification · Do not reply to this email
    </div>
  </div>
</body>
</html>
`;

    // 4. Send Email via SMTP if configured
    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpPort = Number(process.env.SMTP_PORT || 587);
    const smtpFrom = process.env.SMTP_FROM || `"Convoy" <${smtpUser || 'no-reply@unfugly.app'}>`;

    if (smtpHost && smtpUser && smtpPass) {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      await transporter.sendMail({
        from: smtpFrom,
        to: hostEmail,
        subject: emailSubject,
        html: emailHtml,
      });

      return NextResponse.json({ success: true, method: 'smtp', recipient: hostEmail });
    }

    // 5. Alternatively send via Resend API if RESEND_API_KEY is present
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM || 'Convoy <onboarding@resend.dev>',
          to: [hostEmail],
          subject: emailSubject,
          html: emailHtml,
        }),
      });

      if (!resendRes.ok) {
        const errorText = await resendRes.text();
        return NextResponse.json({ error: 'Resend API failed: ' + errorText }, { status: 500 });
      }

      return NextResponse.json({ success: true, method: 'resend', recipient: hostEmail });
    }

    // 6. If SMTP is not yet added in environment, return diagnostic notice
    console.log(`[Convoy Notification Draft] To: ${hostEmail} | Subject: ${emailSubject}`);
    return NextResponse.json({
      success: false,
      message: 'SMTP credentials (SMTP_HOST, SMTP_USER, SMTP_PASS) not yet added to .env.local',
      recipient: hostEmail,
    });
  } catch (err: any) {
    console.error('Error in notify-host route:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
