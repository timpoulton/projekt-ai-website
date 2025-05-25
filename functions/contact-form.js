exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse form data
    const data = JSON.parse(event.body);
    const { name, email, company, message, automation_interest } = data;

    // Basic validation
    if (!name || !email || !message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid email format' })
      };
    }

    // Log the lead (in production, you'd save to a database or CRM)
    console.log('New lead received:', {
      name,
      email,
      company,
      automation_interest,
      timestamp: new Date().toISOString(),
      source: 'projekt-ai.net'
    });

    // Here you would typically:
    // 1. Save to your CRM/database
    // 2. Send notification email
    // 3. Add to email marketing list
    // 4. Trigger n8n workflow for lead processing

    // For now, return success
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        message: 'Thank you for your inquiry! We\'ll be in touch within 24 hours.',
        lead_id: `lead_${Date.now()}`
      })
    };

  } catch (error) {
    console.error('Contact form error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
}; 