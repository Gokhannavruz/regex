// Vercel API Route: /api/regex/test
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { pattern, flags, testString, language } = req.body;

    // Validate input
    if (!pattern || !testString) {
      return res.status(400).json({ error: 'Pattern and test string required' });
    }

    // Test regex
    const startTime = Date.now();
    let matches = [];
    let isValid = true;
    let error = null;

    try {
      const flagString = flags || '';
      const regex = new RegExp(pattern, flagString);
      
      if (flagString.includes('g')) {
        let match;
        while ((match = regex.exec(testString)) !== null) {
          matches.push({
            match: match[0],
            index: match.index,
            groups: match.groups || {}
          });
        }
      } else {
        const match = regex.exec(testString);
        if (match) {
          matches.push({
            match: match[0],
            index: match.index,
            groups: match.groups || {}
          });
        }
      }
    } catch (regexError) {
      isValid = false;
      error = regexError.message;
    }

    const executionTime = Date.now() - startTime;

    res.json({
      success: isValid,
      matches,
      matchCount: matches.length,
      executionTime,
      isValid,
      error
    });
  } catch (error) {
    res.status(400).json({ 
      error: 'Invalid regex pattern',
      message: error.message 
    });
  }
}
