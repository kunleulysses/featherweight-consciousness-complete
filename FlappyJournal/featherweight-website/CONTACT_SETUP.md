# Contact Form Setup Guide

## Overview
The contact form is configured with multiple submission methods for maximum reliability:

### 1. Netlify Forms (Recommended for Netlify deployment)
- **No additional setup required** when deployed to Netlify
- Automatically captures form submissions
- View submissions in Netlify dashboard
- Built-in spam protection

### 2. EmailJS (Client-side email service)
To enable EmailJS:
1. Sign up at [EmailJS.com](https://www.emailjs.com/)
2. Create an email service (Gmail, Outlook, etc.)
3. Create an email template
4. Update ContactPage.js with your credentials:
   ```javascript
   const result = await emailjs.send(
     'YOUR_SERVICE_ID',     // From EmailJS dashboard
     'YOUR_TEMPLATE_ID',    // From EmailJS dashboard
     {
       from_name: formData.name,
       from_email: formData.email,
       category: formData.category,
       subject: formData.subject,
       message: formData.message,
       to_email: 'hello@featherweight.world',
     },
     'YOUR_PUBLIC_KEY'      // From EmailJS dashboard
   );
   ```

### 3. Custom Backend API
For self-hosted solutions, use the `/api/contact.js` endpoint:

#### With SendGrid:
```bash
npm install @sendgrid/mail
```

```javascript
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const msg = {
  to: 'hello@featherweight.world',
  from: 'noreply@featherweight.world',
  subject: `New Contact: ${subject}`,
  html: `
    <h2>New Contact Form Submission</h2>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Category:</strong> ${category}</p>
    <p><strong>Subject:</strong> ${subject}</p>
    <p><strong>Message:</strong></p>
    <p>${message}</p>
  `,
};

await sgMail.send(msg);
```

#### With Resend:
```bash
npm install resend
```

```javascript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'noreply@featherweight.world',
  to: 'hello@featherweight.world',
  subject: `New Contact: ${subject}`,
  html: `<h2>New Contact Form Submission</h2>...`,
});
```

## Environment Variables
Create a `.env.local` file for sensitive data:
```env
SENDGRID_API_KEY=your_sendgrid_key
RESEND_API_KEY=your_resend_key
EMAILJS_SERVICE_ID=your_emailjs_service_id
EMAILJS_TEMPLATE_ID=your_emailjs_template_id
EMAILJS_PUBLIC_KEY=your_emailjs_public_key
```

## Form Data Structure
The form captures:
- `name`: Full name
- `email`: Email address
- `category`: research|commercial|press|careers|technical|general
- `subject`: Brief subject line
- `message`: Detailed message

## Email Categories & Routing
- **Research**: research@featherweight.world
- **Commercial**: partnerships@featherweight.world
- **Press**: press@featherweight.world
- **General**: hello@featherweight.world

## Security Features
- Input validation
- Email format validation
- CSRF protection (via Netlify)
- Rate limiting (configurable)
- Honeypot field for spam protection

## Monitoring & Analytics
- Form submission tracking
- Success/error rate monitoring
- Response time analytics
- User engagement metrics

## Testing
Test the form with:
1. Valid submissions
2. Invalid email formats
3. Missing required fields
4. Large message content
5. Special characters

## Deployment Notes
- For Netlify: Forms work automatically
- For Vercel: Use serverless functions
- For custom hosting: Set up Express.js server
- For static hosting: Use EmailJS client-side
