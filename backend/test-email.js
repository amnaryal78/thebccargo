const nodemailer = require('nodemailer');
require('dotenv').config({ path: __dirname + '/.env' });

console.log('═══════════════════════════════════════════════════════════');
console.log('📧 THE BC CARGO - NODEMAILER SMTP TEST DIAGNOSTIC TOOL');
console.log('═══════════════════════════════════════════════════════════\n');

const host = process.env.SMTP_HOST || 'smtp.gmail.com';
const port = parseInt(process.env.SMTP_PORT, 10) || 587;
const user = process.env.SMTP_USER || '';
const pass = process.env.SMTP_PASS || '';
const adminEmail = process.env.ADMIN_EMAIL || user || 'info@thebccargo.com';

console.log(`📋 Configured Settings:`);
console.log(`   - SMTP Host: ${host}`);
console.log(`   - SMTP Port: ${port}`);
console.log(`   - SMTP User: ${user || '(NOT SET)'}`);
console.log(`   - SMTP Pass: ${pass ? '******** (SET)' : '(NOT SET)'}`);
console.log(`   - Admin Target Email: ${adminEmail}\n`);

if (!user || !pass || pass === 'your_16_digit_app_password_here') {
  console.error('❌ ERROR: SMTP_USER or SMTP_PASS is not configured in backend/.env!');
  console.log('\n💡 TO FIX THIS:');
  console.log('1. Open backend/.env in your code editor.');
  console.log('2. Set SMTP_USER to your sending email address (e.g. info@thebccargo.com or your-email@gmail.com).');
  console.log('3. Set SMTP_PASS to your 16-character Google App Password (if using Gmail / Google Workspace).');
  console.log('   - Create App Password at: https://myaccount.google.com/apppasswords');
  console.log('4. Re-run node backend/test-email.js\n');
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host,
  port,
  secure: port === 465,
  auth: { user, pass },
  tls: { rejectUnauthorized: false }
});

async function runTest() {
  console.log('🔍 Step 1: Testing SMTP Server Connection & Authentication...');
  try {
    await transporter.verify();
    console.log('✅ SMTP Connection & Authentication Successful!\n');

    console.log(`📤 Step 2: Dispatching Test Email to ${adminEmail}...`);
    const info = await transporter.sendMail({
      from: `"BC Cargo Test Gateway" <${user}>`,
      to: adminEmail,
      subject: '🧪 [BC Cargo Test] SMTP Email Verification Success',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #e2e8f0;border-radius:12px;background:#ffffff;">
          <div style="background:linear-gradient(135deg,#1a56db,#06b6d4);padding:20px;text-align:center;color:#ffffff;border-radius:8px;">
            <h2 style="margin:0;">THE BC CARGO &amp; COURIER</h2>
            <p style="margin:5px 0 0;font-size:14px;">SMTP Gateway Connection Test</p>
          </div>
          <div style="padding:20px;">
            <p style="color:#10b981;font-weight:bold;font-size:16px;">✅ Email Delivery Test Passed!</p>
            <p style="color:#334155;line-height:1.6;">Your Nodemailer email server configuration is working perfectly. When users submit inquiries, career applications, or partner requests on the site, notifications will be delivered cleanly to your inbox.</p>
            <p style="color:#64748b;font-size:12px;margin-top:20px;border-top:1px solid #e2e8f0;padding-top:10px;">Sent at: ${new Date().toLocaleString()}</p>
          </div>
        </div>
      `
    });

    console.log(`✅ Test Email Sent Successfully! Message ID: ${info.messageId}`);
    console.log(`📩 Please check the inbox of ${adminEmail} (and check Spam / Junk folder if needed).\n`);
  } catch (err) {
    console.error('\n❌ SMTP TEST FAILED with error:');
    console.error(`   Message: ${err.message}`);
    if (err.code === 'EAUTH') {
      console.error('\n💡 AUTHENTICATION ERROR: Your email or password/app-password was rejected by the mail server.');
      console.error('   - For Gmail / Google Workspace: Ensure 2-Step Verification is ON, then generate a 16-character App Password at https://myaccount.google.com/apppasswords');
    } else if (err.code === 'ESOCKET' || err.code === 'ETIMEDOUT') {
      console.error('\n💡 CONNECTION ERROR: Unable to reach SMTP host port. Try changing SMTP_PORT to 465 or 587 in backend/.env');
    }
  }
}

runTest();
