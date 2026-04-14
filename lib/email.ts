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

export async function sendLiveAuditionScheduledEmail(email: string, name: string, song: string, time: string, liveRoomUrl: string) {
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
            from: `"The Gospel Icon" <${process.env.SMTP_USER}>`,
            to: email,
            subject: '🎙️ Your Live Audition is Scheduled!',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #050505; color: #ffffff; border-radius: 12px; border: 1px solid #dfb14b;">
                    <h1 style="color: #dfb14b; font-size: 24px; margin-bottom: 10px;">Live Audition Scheduled 🎉</h1>
                    <p style="font-size: 16px; line-height: 1.6;">Hello <strong>${name}</strong>,</p>
                    <p style="font-size: 16px; line-height: 1.6;">Congratulations! Your live audition has been scheduled. You are advancing to <strong>Stage 3</strong>.</p>
                    <div style="background-color: #111; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #333;">
                        <h2 style="color: #dfb14b; font-size: 18px; margin-top: 0;">Audition Details</h2>
                        <ul style="list-style: none; padding: 0; color: #ccc;">
                            <li style="margin-bottom: 10px;"><strong>Assigned Song:</strong> <span style="color: #fff;">${song}</span></li>
                            <li style="margin-bottom: 10px;"><strong>Scheduled Time:</strong> <span style="color: #fff;">${formattedDate}</span></li>
                        </ul>
                    </div>
                    <p style="font-size: 14px; color: #ccc;">Please be ready at least <strong>10 minutes</strong> before your scheduled time. Click the button below to join your live audition room:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${liveRoomUrl}" style="display: inline-block; background: linear-gradient(to right, #dfb14b, #f5d681); color: #000; font-weight: bold; font-size: 16px; padding: 14px 32px; border-radius: 50px; text-decoration: none;">🎙️ Join Live Audition Room</a>
                    </div>
                    <p style="font-size: 12px; color: #666;">Or copy this link: <a href="${liveRoomUrl}" style="color: #dfb14b;">${liveRoomUrl}</a></p>
                    <p style="font-size: 16px; line-height: 1.6; margin-top: 30px;">Best regards,<br/>The Gospel Icon Team</p>
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

export async function sendSecondVideoConfirmationEmail(email: string, name: string) {
    try {
        const mailOptions = {
            from: `"Talent Foundation" <${process.env.SMTP_USER}>`,
            to: email,
            subject: 'Second Audition Video Received! - The Gospel Icon Season 2',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #050505; color: #ffffff; border-radius: 12px; border: 1px solid #dfb14b;">
                    <h1 style="color: #dfb14b; font-size: 24px; margin-bottom: 20px;">Video Successfully Submitted!</h1>
                    <p style="font-size: 16px; line-height: 1.6;">Hello <strong>${name}</strong>,</p>
                    <p style="font-size: 16px; line-height: 1.6;">Your second audition video (performance with instrumentals) has been successfully uploaded and received by our system!</p>
                    
                    <div style="background-color: #111; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #333;">
                        <h2 style="color: #dfb14b; font-size: 18px; margin-top: 0;">What Happens Next?</h2>
                        <ul style="list-style: none; padding: 0; color: #ccc;">
                            <li style="margin-bottom: 10px;">• Our panel of judges will review your performance.</li>
                            <li style="margin-bottom: 10px;">• Once the review process is complete, you will be notified regarding the <strong>Live Audition</strong> stage.</li>
                        </ul>
                    </div>
                    
                    <p style="font-size: 14px; color: #888;">Thank you for your patience and good luck!</p>
                    <p style="font-size: 16px; line-height: 1.6; margin-top: 30px;">Best regards,<br/>The Talent Foundation Team</p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        return { success: true, data: info };
    } catch (error) {
        console.error("Second Video Email Failed:", error);
        return { success: false, error };
    }
}

export async function sendTicketRequestConfirmationEmail(email: string, name: string) {
    try {
        const mailOptions = {
            from: `"Talent Foundation" <${process.env.SMTP_USER}>`,
            to: email,
            subject: 'Ticket Purchase Request Received - The Gospel Icon Season 2',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #050505; color: #ffffff; border-radius: 12px; border: 1px solid #dfb14b;">
                    <h1 style="color: #dfb14b; font-size: 24px; margin-bottom: 20px;">Receipt Uploaded Successfully</h1>
                    <p style="font-size: 16px; line-height: 1.6;">Hello <strong>${name}</strong>,</p>
                    <p style="font-size: 16px; line-height: 1.6;">Your ticket purchase request has been submitted and the payment receipt safely received.</p>
                    
                    <div style="background-color: #111; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #333;">
                        <ul style="list-style: none; padding: 0; color: #ccc;">
                            <li style="margin-bottom: 10px;">• Our team is currently verifying the transfer.</li>
                            <li style="margin-bottom: 10px;">• Once verified, you will instantly receive your official digital ticket and entry pass to your email!</li>
                        </ul>
                    </div>
                    
                    <p style="font-size: 16px; line-height: 1.6; margin-top: 30px;">Best regards,<br/>The Talent Foundation Team</p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        return { success: true, data: info };
    } catch (error) {
        console.error("Ticket Request Email Failed:", error);
        return { success: false, error };
    }
}

export async function sendTicketVerifiedEmail(email: string, name: string, ticketType: string, ticketId: string) {
    try {
        const mailOptions = {
            from: `"Talent Foundation" <${process.env.SMTP_USER}>`,
            to: email,
            subject: 'Your Official Event Ticket - The Gospel Icon Season 2',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #050505; color: #ffffff; border-radius: 12px; border: 2px solid #dfb14b;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #dfb14b; font-size: 28px; margin-bottom: 5px; text-transform: uppercase;">Official Ticket</h1>
                        <p style="color: #888; font-size: 14px; letter-spacing: 2px;">THE GOSPEL ICON SEASON 2</p>
                    </div>

                    <p style="font-size: 16px; line-height: 1.6;">Hello <strong>${name}</strong>,</p>
                    <p style="font-size: 16px; line-height: 1.6;">Your payment has been successfully verified! Below is your digital admission ticket.</p>
                    
                    <div style="background: linear-gradient(135deg, #dfb14b 0%, #a67c00 100%); padding: 3px; border-radius: 12px; margin: 30px 0;">
                        <div style="background-color: #111; padding: 25px; border-radius: 10px; text-align: center;">
                            <h2 style="color: #dfb14b; font-size: 24px; margin-top: 0; text-transform: uppercase; letter-spacing: 3px;">${ticketType} PASS</h2>
                            <div style="margin: 20px 0; padding: 15px; border-top: 1px dashed #444; border-bottom: 1px dashed #444;">
                                <p style="font-size: 12px; color: #888; text-transform: uppercase; margin-bottom: 5px;">Ticket ID</p>
                                <p style="font-size: 20px; color: #fff; font-family: monospace; letter-spacing: 2px; margin: 0;">${ticketId.split('-')[0].toUpperCase()}</p>
                            </div>
                            <p style="font-size: 13px; color: #aaa; margin: 0;">Please present this email (or the unique Ticket ID) at the entrance.</p>
                        </div>
                    </div>
                    
                    <p style="font-size: 14px; color: #888; text-align: center;">We look forward to seeing you at the event!</p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        return { success: true, data: info };
    } catch (error) {
        console.error("Ticket Verified Email Failed:", error);
        return { success: false, error };
    }
}

export async function sendLiveAuditionCompletedEmail(email: string, name: string) {
    try {
        const mailOptions = {
            from: `"The Gospel Icon" <${process.env.SMTP_USER}>`,
            to: email,
            subject: '🌟 Live Audition Completed - What\'s Next?',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #050505; color: #ffffff; border-radius: 12px; border: 1px solid #dfb14b;">
                    <h1 style="color: #dfb14b; font-size: 24px; margin-bottom: 10px;">Audition Completely Reviewed 🎉</h1>
                    <p style="font-size: 16px; line-height: 1.6;">Hello <strong>${name}</strong>,</p>
                    <p style="font-size: 16px; line-height: 1.6;">Thank you for your performance! The judges have officially submitted your scores for the Live Audition phase of The Gospel Icon Season 2.</p>
                    
                    <div style="background-color: #111; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #333;">
                        <h2 style="color: #dfb14b; font-size: 18px; margin-top: 0;">What happens now?</h2>
                        <ul style="list-style: none; padding: 0; color: #ccc;">
                            <li style="margin-bottom: 10px;">• The administrative team will compile and average all scores.</li>
                            <li style="margin-bottom: 10px;">• Finalists advancing to the next stage will be notified securely via this email address.</li>
                            <li style="margin-bottom: 10px;">• Please keep an eye on your inbox over the coming days!</li>
                        </ul>
                    </div>
                    
                    <p style="font-size: 16px; line-height: 1.6; margin-top: 30px;">Best regards,<br/>The Gospel Icon Team</p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        return { success: true, data: info };
    } catch (error) {
        console.error("Live Audition Completed Email Failed:", error);
        return { success: false, error };
    }
}
