import nodemailer from 'nodemailer';

// Create transporter (will use environment variables)
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
};

/**
 * Send grade notification email to student
 */
export const sendGradeNotification = async (
    studentEmail: string,
    studentName: string,
    assignmentTitle: string,
    marksObtained: number,
    maxMarks: number,
    feedback: string,
    teacherName: string
) => {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn('Email service not configured. Skipping email notification.');
        return { success: false, message: 'Email service not configured' };
    }

    const transporter = createTransporter();
    const percentage = ((marksObtained / maxMarks) * 100).toFixed(2);

    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {
                    font-family: 'Inter', Arial, sans-serif;
                    background-color: #f5f7fb;
                    margin: 0;
                    padding: 20px;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    background: white;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                }
                .header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 30px;
                    text-align: center;
                }
                .header h1 {
                    margin: 0;
                    font-size: 24px;
                }
                .content {
                    padding: 30px;
                }
                .score-box {
                    background: #f0f4ff;
                    border-left: 4px solid #6366f1;
                    padding: 20px;
                    margin: 20px 0;
                    border-radius: 8px;
                }
                .score {
                    font-size: 32px;
                    font-weight: bold;
                    color: #6366f1;
                    margin: 10px 0;
                }
                .feedback-box {
                    background: #f8fafc;
                    padding: 15px;
                    border-radius: 8px;
                    margin: 20px 0;
                }
                .footer {
                    background: #f8fafc;
                    padding: 20px;
                    text-align: center;
                    font-size: 12px;
                    color: #64748b;
                }
                .button {
                    display: inline-block;
                    background: #6366f1;
                    color: white;
                    padding: 12px 24px;
                    text-decoration: none;
                    border-radius: 6px;
                    margin-top: 20px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>📝 Assignment Graded</h1>
                </div>
                <div class="content">
                    <p>Dear <strong>${studentName}</strong>,</p>
                    <p>Your assignment <strong>"${assignmentTitle}"</strong> has been graded by ${teacherName}.</p>
                    
                    <div class="score-box">
                        <div style="color: #64748b; font-size: 14px; margin-bottom: 5px;">Your Score</div>
                        <div class="score">${marksObtained} / ${maxMarks}</div>
                        <div style="color: #6366f1; font-weight: 600; font-size: 18px;">Percentage: ${percentage}%</div>
                    </div>

                    ${feedback ? `
                        <div class="feedback-box">
                            <strong style="color: #334155;">Teacher's Feedback:</strong>
                            <p style="margin: 10px 0 0; color: #475569; line-height: 1.6;">${feedback}</p>
                        </div>
                    ` : ''}

                    <p style="margin-top: 30px;">You can view the full details in your Vi-SlideS dashboard.</p>
                    
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/assignments" class="button">View Dashboard</a>
                </div>
                <div class="footer">
                    <p>This is an automated email from Vi-SlideS Learning Platform</p>
                    <p>© ${new Date().getFullYear()} Vi-SlideS. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    try {
        await transporter.sendMail({
            from: `"Vi-SlideS" <${process.env.SMTP_USER}>`,
            to: studentEmail,
            subject: `Assignment Graded - ${assignmentTitle}`,
            html: htmlContent
        });

        return { success: true, message: 'Email sent successfully' };
    } catch (error) {
        console.error('Email sending failed:', error);
        return { success: false, message: 'Failed to send email', error };
    }
};
