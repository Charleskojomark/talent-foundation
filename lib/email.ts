import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS?.replace(/\s/g, ''), // Strip spaces from app password
    },
});

export async function sendSecondVideoEmail(email: string, name: string) {
    try {
        const mailOptions = {
            from: `"Talent Foundation" <${process.env.SMTP_USER}>`,
            to: email,
            subject: 'Congratulations! Next Step: Submit Your Second Audition Video',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #050505; color: #ffffff; border-radius: 12px; border: 1px solid #dfb14b;">
                    <h1 style="color: #dfb14b; font-size: 24px; margin-bottom: 20px;">Audition Progress Update</h1>
                    <p style="font-size: 16px; line-height: 1.6;">Hello <strong>${name}</strong>,</p>
                    <p style="font-size: 16px; line-height: 1.6;">We have successfully verified your registration payment! You have been promoted to <strong>Stage 2</strong> of the Talent Foundation Auditions.</p>
                    <div style="background-color: #111; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #333;">
                        <h2 style="color: #dfb14b; font-size: 18px; margin-top: 0;">What's Next?</h2>
                        <p style="font-size: 14px; color: #ccc;">You are now required to submit your <strong>second audition video</strong>. This video should be a performance of your chosen song with <strong>instrumentals only</strong> (no lead vocals in the background).</p>
                        <p style="font-size: 14px; color: #ccc;">Please visit our website homepage and navigate to the <strong>Second Audition Video</strong> button, or click directly <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://talent-foundation-z6p6.vercel.app'}/auditions/second-video" style="color: #dfb14b;">here</a> to upload your file.</p>
                    </div>
                    <p style="font-size: 14px; color: #888;">Keep this email handy as you will need your registered email address to submit the video.</p>
                    <p style="font-size: 16px; line-height: 1.6; margin-top: 30px;">Best regards,<br/>The Talent Foundation Team</p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        return { success: true, data: info };
    } catch (error) {
        console.error("Email Sending Failed:", error);
        return { success: false, error };
    }
}

export async function sendLiveAuditionScheduledEmail(email: string, name: string, song: string, time: string) {
    try {
        const formattedDate = new Date(time).toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZoneName: 'short'
        });

        const mailOptions = {
            from: `"Talent Foundation" <${process.env.SMTP_USER}>`,
            to: email,
            subject: 'Your Live Audition is Scheduled!',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #050505; color: #ffffff; border-radius: 12px; border: 1px solid #dfb14b;">
                    <h1 style="color: #dfb14b; font-size: 24px; margin-bottom: 20px;">Live Audition Schedule</h1>
                    <p style="font-size: 16px; line-height: 1.6;">Hello <strong>${name}</strong>,</p>
                    <p style="font-size: 16px; line-height: 1.6;">Your live audition has been scheduled! You are advancing to <strong>Stage 3</strong>.</p>
                    <div style="background-color: #111; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #333;">
                        <h2 style="color: #dfb14b; font-size: 18px; margin-top: 0;">Audition Details</h2>
                        <ul style="list-style: none; padding: 0; color: #ccc;">
                            <li style="margin-bottom: 10px;"><strong>Assigned Alternative Song:</strong> <span style="color: #fff;">${song}</span></li>
                            <li style="margin-bottom: 10px;"><strong>Scheduled Time:</strong> <span style="color: #fff;">${formattedDate}</span></li>
                        </ul>
                    </div>
                    <p style="font-size: 14px; color: #ccc;">Please be ready at least 10 minutes before your scheduled time. You can join the live room via the link on our website using your registered email.</p>
                    <p style="font-size: 16px; line-height: 1.6; margin-top: 30px;">Best regards,<br/>The Talent Foundation Team</p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        return { success: true, data: info };
    } catch (error) {
        console.error("Email Sending Failed:", error);
        return { success: false, error };
    }
}

export async function sendRegistrationConfirmationEmail(email: string, name: string) {
    try {
        const mailOptions = {
            from: `"Talent Foundation" <${process.env.SMTP_USER}>`,
            to: email,
            subject: 'Registration Successful - The Gospel Icon Season 2',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #050505; color: #ffffff; border-radius: 12px; border: 1px solid #dfb14b;">
                    <h1 style="color: #dfb14b; font-size: 24px; margin-bottom: 20px;">Registration Confirmed!</h1>
                    <p style="font-size: 16px; line-height: 1.6;">Hello <strong>${name}</strong>,</p>
                    <p style="font-size: 16px; line-height: 1.6;">Thank you for registering for <strong>The Gospel Icon Season 2</strong>. We have received your application and your first audition video.</p>
                    
                    <div style="background-color: #111; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #333;">
                        <h2 style="color: #dfb14b; font-size: 18px; margin-top: 0;">Next Steps</h2>
                        <ul style="list-style: none; padding: 0; color: #ccc;">
                            <li style="margin-bottom: 10px;">• Our team will verify your payment receipt.</li>
                            <li style="margin-bottom: 10px;">• Once verified, you will receive another email to submit your <strong>second audition video</strong> (performance with instrumentals).</li>
                            <li style="margin-bottom: 10px;">• Keep your registered email (<strong>${email}</strong>) safe as it's required for all future submissions.</li>
                        </ul>
                    </div>
                    
                    <p style="font-size: 14px; color: #888;">If you have any questions, feel free to reply to this email.</p>
                    <p style="font-size: 16px; line-height: 1.6; margin-top: 30px;">Best regards,<br/>The Talent Foundation Team</p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        return { success: true, data: info };
    } catch (error) {
        console.error("Registration Email Failed:", error);
        return { success: false, error };
    }
}
