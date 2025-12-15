// CORS Proxy for Vercel
// Deploy: Đặt file này vào folder /api/ trong project Vercel

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Get target URL from query
    const targetUrl = req.query.url;
    
    if (!targetUrl) {
      return res.status(400).json({ 
        error: 'Missing url parameter',
        usage: '/api/proxy?url=http://example.com/api/endpoint'
      });
    }

    console.log('Proxying to:', targetUrl);

    // Prepare headers
    const headers = {
      'Content-Type': req.headers['content-type'] || 'application/json',
    };

    // Add Authorization if present
    if (req.headers.authorization) {
      headers['Authorization'] = req.headers.authorization;
    }

    // Forward request
    const fetchOptions = {
      method: req.method,
      headers: headers,
    };

    // Add body for POST/PUT/PATCH
    if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
      fetchOptions.body = JSON.stringify(req.body);
    }

    const response = await fetch(targetUrl, fetchOptions);
    const data = await response.text();

    // Try to parse as JSON
    let jsonData;
    try {
      jsonData = JSON.parse(data);
    } catch {
      jsonData = data; // Return as text if not JSON
    }

    return res.status(response.status).json(jsonData);

  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({ 
      error: 'Proxy request failed',
      message: error.message 
    });
  }
}
