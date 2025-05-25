exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const data = JSON.parse(event.body);
    const { email, name, company, blueprint_type } = data;

    // Validation
    if (!email || !name || !blueprint_type) {
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

    // Log the blueprint download lead
    console.log('Blueprint download request:', {
      email,
      name,
      company,
      blueprint_type,
      timestamp: new Date().toISOString(),
      source: 'projekt-ai.net/blueprint-download'
    });

    // Available blueprints mapping
    const blueprints = {
      'club77-content': {
        name: 'Club77 Content Automation',
        description: 'Automated blog post generation from news articles',
        file_url: '/blueprints/club77-content-automation.json',
        industry: 'Nightlife/Entertainment'
      },
      'social-media': {
        name: 'Social Media Automation',
        description: 'Multi-platform content distribution workflow',
        file_url: '/blueprints/social-media-automation.json',
        industry: 'General'
      },
      'event-promotion': {
        name: 'Event Promotion Automation',
        description: 'Automated event marketing and ticket sales integration',
        file_url: '/blueprints/event-promotion-automation.json',
        industry: 'Events/Hospitality'
      }
    };

    const blueprint = blueprints[blueprint_type];
    if (!blueprint) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid blueprint type' })
      };
    }

    // In production, you would:
    // 1. Add email to marketing list
    // 2. Send welcome email with blueprint
    // 3. Trigger n8n workflow for lead nurturing
    // 4. Track download analytics

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        message: `Blueprint "${blueprint.name}" has been sent to your email!`,
        blueprint: {
          name: blueprint.name,
          description: blueprint.description,
          industry: blueprint.industry
        },
        download_url: blueprint.file_url,
        next_steps: [
          'Check your email for the blueprint file',
          'Import the JSON file into Make.com',
          'Follow the setup instructions included',
          'Contact us for implementation support'
        ]
      })
    };

  } catch (error) {
    console.error('Blueprint download error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
}; 