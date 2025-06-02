// Netlify Function to proxy requests to local Upwork server
exports.handler = async (event, context) => {
  try {
    const response = await fetch('http://192.168.1.107:5001/api/proposals');
    const data = await response.json();
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(data)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch proposals' })
    };
  }
}; 