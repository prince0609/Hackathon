const nodemailer = require("nodemailer");

// Create transporter
const transporter = nodemailer.createTransport({
    service: "gmail", // you can use "Outlook", "Yahoo", "SMTP" config too
    auth: {
        user: process.env.EMAIL_USER,  // your email
        pass: process.env.EMAIL_PASS   // your app password (not normal password!)
    }
});

/**
 * Send email function
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - Email body (HTML format)
 */
async function sendMail(to, subject, html) {
    try {
        const mailOptions = {
            from: `"Expense System" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("✅ Email sent:", info.messageId);
        return { success: true, info };
    } catch (error) {
        console.error("❌ Error sending email:", error);
        return { success: false, error };
    }
}

async function main() {
    try {
        await sendMail(
            "princepatel692005@gmail.com",   // recipient
            "Welcome to Expense System",  // subject
            `<h2>Hello 👋</h2>
             <p>Welcome to the <b>Expense Management System</b>.</p>
             <p>Your account is ready, you can now submit expenses.</p>`
        );
        console.log("Mail sent successfully!");
    } catch (err) {
        console.error("Mail failed:", err);
    }
}


module.exports = sendMail;
