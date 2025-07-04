// Serverless function for Netlify/Vercel deployment
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { name, email, category, subject, message } = req.body;

    // Basic validation
    if (!name || !email || !category || !subject || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Here you can integrate with your preferred email service:
    // 1. SendGrid
    // 2. AWS SES
    // 3. Nodemailer with SMTP
    // 4. Resend
    // 5. Save to database

    // Example with console logging (replace with actual email service)
    console.log('New contact form submission:', {
      name,
      email,
      category,
      subject,
      message,
      timestamp: new Date().toISOString()
    });

    // For now, we'll just return success
    // In production, integrate with your email service here
    
    res.status(200).json({ 
      message: 'Message sent successfully',
      id: Date.now().toString() // Simple ID for tracking
    });

  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
