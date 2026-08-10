/**
 * MOCKED EMAIL SENDER SERVICE
 * Disables real Nodemailer SMTP authentication requirement.
 * All submissions & replies are saved to database and logged to backend console.
 */

async function sendNotificationEmail({ subject, title, fields }) {
  const adminEmail = process.env.ADMIN_EMAIL || 'info@thebccargo.com';
  console.log('\n=======================================================');
  console.log(`✉️ [MOCK EMAIL SENDER] Faking email send to: ${adminEmail}`);
  console.log(`📋 Title: ${title}`);
  console.log(`📌 Subject: ${subject}`);
  console.log('📝 Fields:', JSON.stringify(fields, null, 2));
  console.log('=======================================================\n');
  return true;
}

async function sendReplyEmail({ toEmail, recipientName, subject, messageBody }) {
  console.log('\n=======================================================');
  console.log(`✉️ [MOCK EMAIL SENDER] Faking reply email send to: ${toEmail}`);
  console.log(`👤 Recipient: ${recipientName}`);
  console.log(`📌 Subject: ${subject}`);
  console.log(`📝 Message: ${messageBody}`);
  console.log('=======================================================\n');
  
  return {
    success: true,
    simulated: true,
    message: `Reply email sent successfully to ${toEmail} (Mock Mode).`
  };
}

module.exports = { sendNotificationEmail, sendReplyEmail };
