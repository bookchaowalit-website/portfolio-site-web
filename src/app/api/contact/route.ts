import { after, NextRequest, NextResponse } from 'next/server';
import { trackServer } from '@/lib/server-analytics';
import { Resend } from 'resend';

// Initialize Resend only if API key is available
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const contactDeliveryReady = Boolean(resend) && (
    process.env.NODE_ENV !== 'production' || Boolean(process.env.RESEND_FROM)
);

const MAX_LENGTHS = {
    name: 120,
    email: 254,
    subject: 200,
    message: 5000,
} as const;

function escapeHtml(value: string): string {
    const entities: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
    };

    return value.replace(/[&<>"']/g, (character) => entities[character]);
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json().catch(() => null);

        if (!body || typeof body !== 'object' || Array.isArray(body)) {
            return NextResponse.json(
                { error: 'Invalid request body', code: 'VALIDATION_ERROR' },
                { status: 400 }
            );
        }

        const { name, email, subject, message, locale } = body;

        // Validate type, presence, and size on the server. Client validation is
        // helpful UX, but it cannot protect the email endpoint by itself.
        if (
            typeof name !== 'string' ||
            typeof email !== 'string' ||
            typeof subject !== 'string' ||
            typeof message !== 'string' ||
            !name.trim() ||
            !email.trim() ||
            !subject.trim() ||
            !message.trim()
        ) {
            return NextResponse.json(
                { error: 'All fields are required', code: 'VALIDATION_ERROR' },
                { status: 400 }
            );
        }

        if (
            name.length > MAX_LENGTHS.name ||
            email.length > MAX_LENGTHS.email ||
            subject.length > MAX_LENGTHS.subject ||
            message.length > MAX_LENGTHS.message
        ) {
            return NextResponse.json(
                { error: 'One or more fields are too long', code: 'VALIDATION_ERROR' },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            return NextResponse.json(
                { error: 'Invalid email format', code: 'VALIDATION_ERROR' },
                { status: 400 }
            );
        }

        // Check if Resend is available
        if (!contactDeliveryReady || !resend) {
            console.error('Contact email delivery is not configured for this environment.');

            return NextResponse.json({
                error: 'Contact service unavailable',
                code: 'CONTACT_SERVICE_UNAVAILABLE',
            }, { status: 503 });
        }

        const safeName = escapeHtml(name.trim());
        const safeEmail = escapeHtml(email.trim());
        const safeSubject = subject.trim().replace(/[\r\n]+/g, ' ');
        const safeMessage = escapeHtml(message.trim());

        // Prefer a verified domain (RESEND_FROM). The sandbox sender is only
        // available in development; production is gated above.
        // Dashboard steps: verify bookchaowalit.com in Resend, then set
        // RESEND_FROM="Contact Form <contact@bookchaowalit.com>" on Vercel.
        const fromAddress =
            process.env.RESEND_FROM ||
            'Contact Form <onboarding@resend.dev>';

        // Send email using Resend
        const { data, error } = await resend.emails.send({
            from: fromAddress,
            to: process.env.CONTACT_EMAIL || 'contact@bookchaowalit.com',
            subject: `New Contact: ${safeSubject}`,
            html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>New Contact Form Message</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
                New Contact Form Message
              </h2>

              <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Name:</strong> ${safeName}</p>
                <p><strong>Email:</strong> <a href="mailto:${safeEmail}" style="color: #2563eb;">${safeEmail}</a></p>
                <p><strong>Subject:</strong> ${escapeHtml(safeSubject)}</p>
              </div>

              <div style="background: #ffffff; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                <h3 style="margin-top: 0; color: #374151;">Message:</h3>
                <div style="white-space: pre-wrap; color: #4b5563;">${safeMessage}</div>
              </div>

              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">

              <p style="color: #6b7280; font-size: 14px;">
                This message was sent from your portfolio contact form on ${new Date().toLocaleString()}.
              </p>
            </div>
          </body>
        </html>
      `,
            replyTo: email.trim(), // Allow replying directly to the sender
        });

        if (error) {
            console.error('Resend API Error:', error);
            return NextResponse.json(
                { error: 'Failed to send message. Please try again later.' },
                { status: 500 }
            );
        }

        console.log('Email sent successfully:', data);

        // KPI-O-01: count the delivered message after the response is sent.
        // Locale only, a fresh random id, no IP; off unless analytics is enabled.
        after(() => trackServer('contact_sent', { locale }));

        return NextResponse.json({
            success: true,
            message: 'Message sent successfully! I\'ll get back to you within 24-48 hours.'
        });

    } catch (error) {
        console.error('Contact form error:', error);
        return NextResponse.json(
            { error: 'Internal server error. Please try again later.' },
            { status: 500 }
        );
    }
}
