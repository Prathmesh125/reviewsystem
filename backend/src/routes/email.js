const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { verifyFirebaseToken } = require('../middleware/firebaseAuth');
const nodemailer = require('nodemailer');

const router = express.Router();
const prisma = new PrismaClient();

// Configure nodemailer (you'll need to set up your email service)
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail', // or your email service
    auth: {
      user: process.env.EMAIL_USER, // your email
      pass: process.env.EMAIL_PASSWORD // your email password or app password
    }
  });
};

// Send email campaign
router.post('/send-campaign', verifyFirebaseToken, async (req, res) => {
  try {
    const { businessId, recipients, subject, message, campaignType, couponData } = req.body;

    // Find the user in local database
    let user = await prisma.user.findUnique({
      where: { email: req.user.email }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify business ownership
    const business = await prisma.business.findFirst({
      where: {
        id: businessId,
        userId: user.id
      }
    });

    if (!business) {
      return res.status(403).json({ error: 'Access denied to this business' });
    }

    // Validate input
    if (!recipients || recipients.length === 0) {
      return res.status(400).json({ error: 'No recipients provided' });
    }

    if (!subject || !message) {
      return res.status(400).json({ error: 'Subject and message are required' });
    }

    // For demo purposes, we'll simulate sending emails
    // In production, you would integrate with a real email service
    const simulateEmailSending = process.env.NODE_ENV === 'development';

    let successCount = 0;
    let failedEmails = [];

    if (simulateEmailSending) {
      // Simulate email sending for development
      console.log('=== EMAIL CAMPAIGN SIMULATION ===');
      console.log(`Business: ${business.name}`);
      console.log(`Campaign Type: ${campaignType}`);
      console.log(`Subject: ${subject}`);
      console.log(`Recipients: ${recipients.length}`);
      console.log(`Message Preview: ${message.substring(0, 100)}...`);
      
      if (couponData) {
        console.log(`Coupon Code: ${couponData.code}`);
        console.log(`Discount: ${couponData.discount}%`);
        console.log(`Valid Until: ${couponData.validUntil}`);
      }
      
      // Simulate some processing time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      successCount = recipients.length;
      console.log(`✅ Successfully "sent" ${successCount} emails`);
      console.log('================================');
    } else {
      // Real email sending (requires email configuration)
      const transporter = createTransporter();
      
      for (const email of recipients) {
        try {
          let emailBody = message;
          
          // Replace business name placeholder
          emailBody = emailBody.replace(/\[Your Business Name\]/g, business.name);
          emailBody = emailBody.replace(/\[Business Name\]/g, business.name);
          
          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: subject.replace(/\[Business Name\]/g, business.name),
            text: emailBody,
            html: emailBody.replace(/\n/g, '<br>')
          };

          await transporter.sendMail(mailOptions);
          successCount++;
        } catch (error) {
          console.error(`Failed to send email to ${email}:`, error);
          failedEmails.push(email);
        }
      }
    }

    // Log the campaign in database (optional)
    try {
      await prisma.emailCampaign.create({
        data: {
          businessId: businessId,
          subject: subject,
          message: message,
          campaignType: campaignType,
          recipientCount: recipients.length,
          successCount: successCount,
          failedCount: failedEmails.length,
          couponData: couponData ? JSON.stringify(couponData) : null,
          sentAt: new Date()
        }
      });
    } catch (dbError) {
      console.error('Failed to log campaign in database:', dbError);
      // Continue anyway, don't fail the email sending
    }

    res.json({
      success: true,
      message: `Email campaign sent successfully`,
      stats: {
        totalRecipients: recipients.length,
        successCount: successCount,
        failedCount: failedEmails.length,
        failedEmails: failedEmails
      }
    });

  } catch (error) {
    console.error('Error sending email campaign:', error);
    res.status(500).json({ error: 'Failed to send email campaign' });
  }
});

// Get email campaign history
router.get('/campaigns/business/:businessId', verifyFirebaseToken, async (req, res) => {
  try {
    const { businessId } = req.params;

    // Find the user in local database
    let user = await prisma.user.findUnique({
      where: { email: req.user.email }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify business ownership
    const business = await prisma.business.findFirst({
      where: {
        id: businessId,
        userId: user.id
      }
    });

    if (!business) {
      return res.status(403).json({ error: 'Access denied to this business' });
    }

    // Get campaigns (if table exists)
    try {
      const campaigns = await prisma.emailCampaign.findMany({
        where: { businessId: businessId },
        orderBy: { sentAt: 'desc' },
        take: 50 // Limit to last 50 campaigns
      });

      res.json({
        success: true,
        data: campaigns
      });
    } catch (dbError) {
      // If table doesn't exist, return empty array
      res.json({
        success: true,
        data: []
      });
    }

  } catch (error) {
    console.error('Error fetching email campaigns:', error);
    res.status(500).json({ error: 'Failed to fetch email campaigns' });
  }
});

module.exports = router;