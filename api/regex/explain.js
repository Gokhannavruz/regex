// Vercel API Route: /api/regex/explain
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { pattern } = req.body;
    
    // Simple regex explanation
    const explanations = [];
    const tokens = [
      { regex: /\^/, explanation: 'Start of line/string' },
      { regex: /\$/, explanation: 'End of line/string' },
      { regex: /\\d/, explanation: 'Any digit (0-9)' },
      { regex: /\\D/, explanation: 'Any non-digit' },
      { regex: /\\w/, explanation: 'Any word character (a-z, A-Z, 0-9, _)' },
      { regex: /\\W/, explanation: 'Any non-word character' },
      { regex: /\\s/, explanation: 'Any whitespace character' },
      { regex: /\\S/, explanation: 'Any non-whitespace character' },
      { regex: /\./, explanation: 'Any character except newline' },
      { regex: /\+/, explanation: 'One or more of the preceding token' },
      { regex: /\*/, explanation: 'Zero or more of the preceding token' },
      { regex: /\?/, explanation: 'Zero or one of the preceding token' },
      { regex: /\{(\d+)\}/, explanation: 'Exactly $1 of the preceding token' },
      { regex: /\{(\d+),\}/, explanation: 'At least $1 of the preceding token' },
      { regex: /\{(\d+),(\d+)\}/, explanation: 'Between $1 and $2 of the preceding token' },
      { regex: /\[([^\]]+)\]/, explanation: 'Any character in the set: $1' },
      { regex: /\(([^)]+)\)/, explanation: 'Capturing group: $1' },
      { regex: /\(\?:([^)]+)\)/, explanation: 'Non-capturing group: $1' },
      { regex: /\|/, explanation: 'OR - matches either left or right side' }
    ];
    
    let position = 0;
    while (position < pattern.length) {
      let matched = false;
      
      for (const token of tokens) {
        const match = pattern.substring(position).match(token.regex);
        if (match && match.index === 0) {
          explanations.push({
            token: match[0],
            explanation: token.explanation.replace(/\$(\d+)/g, (_, i) => match[i])
          });
          position += match[0].length;
          matched = true;
          break;
        }
      }
      
      if (!matched) {
        if (pattern[position] !== '\\') {
          explanations.push({
            token: pattern[position],
            explanation: `Literal character: "${pattern[position]}"`
          });
        }
        position++;
      }
    }
    
    res.json({ explanation: explanations });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}
