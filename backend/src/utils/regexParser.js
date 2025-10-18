// Test regex in multiple languages
function testRegex(pattern, flags, testString, language = 'javascript') {
    const startTime = Date.now();
    
    try {
        let regex;
        let matches = [];
        
        switch (language.toLowerCase()) {
            case 'javascript':
                regex = new RegExp(pattern, flags || '');
                matches = [...testString.matchAll(new RegExp(pattern, flags?.includes('g') ? flags : (flags || '') + 'g'))];
                break;
                
            case 'python':
                // For Python, we'd need to translate some syntax differences
                // This is a simplified version
                regex = new RegExp(pattern.replace(/\(\?P<(\w+)>/g, '(?<$1>'), flags || '');
                matches = [...testString.matchAll(regex)];
                break;
                
            default:
                regex = new RegExp(pattern, flags || '');
                matches = [...testString.matchAll(new RegExp(pattern, (flags || '') + 'g'))];
        }
        
        const executionTime = Date.now() - startTime;
        
        return {
            success: true,
            matches: matches.map(m => ({
                match: m[0],
                index: m.index,
                groups: m.groups || {}
            })),
            matchCount: matches.length,
            executionTime,
            isValid: true
        };
    } catch (error) {
        return {
            success: false,
            error: error.message,
            isValid: false
        };
    }
}

// Explain regex pattern
function explainRegex(pattern) {
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
    
    return explanations;
}

module.exports = {
    testRegex,
    explainRegex
};
