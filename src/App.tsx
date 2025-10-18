import { useState, useMemo, useEffect } from 'react';
import { AlertCircle, CheckCircle, Copy, Save, User, LogOut, Brain, BookOpen, Star, Trash2, Plus, Settings } from 'lucide-react';
import * as api from './services/api';

interface User {
  id: number;
  email: string;
  username?: string;
}

interface SavedRegex {
  id: number;
  title: string;
  pattern: string;
  flags?: string;
  description?: string;
  test_string?: string;
  language: string;
  is_public: boolean;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

interface Example {
  name: string;
  pattern: string;
  testString: string;
  flags: { g: boolean; i: boolean; m: boolean };
}

const EXAMPLES: Example[] = [
  {
    name: 'Email Validation',
    pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
    testString: 'user@example.com\ninvalid.email@\ntest123@domain.co.uk\n@invalid.com\nvalid.name+tag@example.org',
    flags: { g: false, i: false, m: true }
  },
  {
    name: 'US Phone Number',
    pattern: '\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}',
    testString: '(555) 123-4567\n555-123-4568\n5551234569\n123-45-6789\n(555)123-4570',
    flags: { g: true, i: false, m: false }
  },
  {
    name: 'URL Matching',
    pattern: 'https?://[\\w\\-]+(\\.[\\w\\-]+)+[/#?]?.*$',
    testString: 'https://example.com\nhttp://test.co.uk/path\nhttps://site.com/page?query=1\nftp://invalid.com\nhttps://valid-site.org',
    flags: { g: true, i: false, m: true }
  },
  {
    name: 'Date Format (YYYY-MM-DD)',
    pattern: '\\d{4}-\\d{2}-\\d{2}',
    testString: '2024-01-15\n2023-12-31\n24-01-15\n2024/01/15\n2024-13-45',
    flags: { g: true, i: false, m: false }
  }
];

function App() {
  const [pattern, setPattern] = useState('');
  const [testString, setTestString] = useState('');
  const [flags, setFlags] = useState({ g: true, i: false, m: false });
  const [language, setLanguage] = useState('javascript');
  const [user, setUser] = useState<User | null>(null);
  const [savedRegexes, setSavedRegexes] = useState<SavedRegex[]>([]);
  const [showAuth, setShowAuth] = useState(false);
  const [showSave, setShowSave] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [aiDescription, setAiDescription] = useState('');
  const [aiResult, setAiResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'test' | 'saved' | 'library' | 'ai'>('test');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Check for existing auth token on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // In a real app, you'd validate the token with the backend
      setUser({ id: 1, email: 'user@example.com', username: 'User' });
    }
  }, []);

  const regexResult = useMemo(() => {
    if (!pattern) {
      return { isValid: true, matches: [], error: null };
    }

    try {
      const flagString = `${flags.g ? 'g' : ''}${flags.i ? 'i' : ''}${flags.m ? 'm' : ''}`;
      const regex = new RegExp(pattern, flagString);
      const matches: Array<{ text: string; index: number; length: number }> = [];

      if (testString) {
        let match;
        if (flags.g) {
          while ((match = regex.exec(testString)) !== null) {
            matches.push({
              text: match[0],
              index: match.index,
              length: match[0].length
            });
          }
        } else {
          match = regex.exec(testString);
          if (match) {
            matches.push({
              text: match[0],
              index: match.index,
              length: match[0].length
            });
          }
        }
      }

      return { isValid: true, matches, error: null };
    } catch (error) {
      return { isValid: false, matches: [], error: (error as Error).message };
    }
  }, [pattern, testString, flags]);

  const highlightedText = useMemo(() => {
    if (!testString || regexResult.matches.length === 0) {
      return [{ text: testString, isMatch: false }];
    }

    const segments: Array<{ text: string; isMatch: boolean }> = [];
    let lastIndex = 0;

    regexResult.matches.forEach(match => {
      if (match.index > lastIndex) {
        segments.push({
          text: testString.slice(lastIndex, match.index),
          isMatch: false
        });
      }
      segments.push({
        text: match.text,
        isMatch: true
      });
      lastIndex = match.index + match.length;
    });

    if (lastIndex < testString.length) {
      segments.push({
        text: testString.slice(lastIndex),
        isMatch: false
      });
    }

    return segments;
  }, [testString, regexResult.matches]);

  const handleExampleSelect = (exampleName: string) => {
    if (!exampleName) return;

    const example = EXAMPLES.find(ex => ex.name === exampleName);
    if (example) {
      setPattern(example.pattern);
      setTestString(example.testString);
      setFlags(example.flags);
    }
  };

  const handleClear = () => {
    setPattern('');
    setTestString('');
    setFlags({ g: true, i: false, m: false });
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await api.login({ email, password });
      localStorage.setItem('token', response.token);
      setUser(response.user);
      setShowAuth(false);
      setError('');
    } catch (err) {
      setError('Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (email: string, password: string, username: string) => {
    try {
      setIsLoading(true);
      const response = await api.register({ email, password, username });
      localStorage.setItem('token', response.token);
      setUser(response.user);
      setShowAuth(false);
      setError('');
    } catch (err) {
      setError('Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setSavedRegexes([]);
  };

  const handleSaveRegex = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const response = await api.saveRegex({
        title: `Pattern ${Date.now()}`,
        pattern,
        flags: `${flags.g ? 'g' : ''}${flags.i ? 'i' : ''}${flags.m ? 'm' : ''}`,
        description: 'Saved from regex tester',
        testString,
        language
      });
      setSavedRegexes([response.saved, ...savedRegexes]);
      setShowSave(false);
    } catch (err) {
      setError('Failed to save regex');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateAI = async () => {
    if (!user || !aiDescription) return;
    
    try {
      setIsLoading(true);
      const response = await api.generateRegex({
        description: aiDescription,
        language
      });
      setAiResult(response);
      setPattern(response.pattern);
      setFlags({
        g: response.flags?.includes('g') || false,
        i: response.flags?.includes('i') || false,
        m: response.flags?.includes('m') || false
      });
      setShowAI(false);
    } catch (err) {
      setError('AI generation failed');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSavedRegexes = async () => {
    if (!user) return;
    
    try {
      const response = await api.getSavedRegex();
      setSavedRegexes(response.patterns);
    } catch (err) {
      setError('Failed to load saved regexes');
    }
  };

  useEffect(() => {
    if (user && activeTab === 'saved') {
      loadSavedRegexes();
    }
  }, [user, activeTab]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Regex Tester Pro</h1>
                <p className="text-blue-100 mt-2">Advanced regex testing with AI assistance</p>
              </div>
              <div className="flex items-center gap-4">
                {user ? (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-blue-500 px-3 py-1 rounded-full">
                      <User className="w-4 h-4" />
                      <span className="text-sm">{user.username || user.email}</span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-3 py-1 rounded-full text-sm transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAuth(true)}
                    className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-full text-sm transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Login
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-gray-50 border-b">
            <div className="flex">
              {[
                { id: 'test', label: 'Test Regex', icon: CheckCircle },
                { id: 'saved', label: 'Saved Patterns', icon: Save },
                { id: 'library', label: 'Community', icon: BookOpen },
                { id: 'ai', label: 'AI Assistant', icon: Brain }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
                    activeTab === id
                      ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {activeTab === 'test' && (
            <div className="p-6 space-y-6">
              {/* Quick Examples */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quick Examples
                </label>
                <select
                  onChange={(e) => handleExampleSelect(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  defaultValue=""
                >
                  <option value="">Select an example...</option>
                  {EXAMPLES.map((example) => (
                    <option key={example.name} value={example.name}>
                      {example.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Regex Pattern */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Regex Pattern
                  </label>
                  <div className="flex items-center gap-2">
                    {pattern && (
                      <div className="flex items-center gap-2">
                        {regexResult.isValid ? (
                          <span className="flex items-center gap-1 text-green-600 text-sm">
                            <CheckCircle className="w-4 h-4" />
                            Valid
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-600 text-sm">
                            <AlertCircle className="w-4 h-4" />
                            Invalid
                          </span>
                        )}
                      </div>
                    )}
                    {user && pattern && (
                      <button
                        onClick={() => setShowSave(true)}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm"
                      >
                        <Save className="w-4 h-4" />
                        Save
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={pattern}
                    onChange={(e) => setPattern(e.target.value)}
                    placeholder="Enter your regex pattern (e.g., ^\d{3}-\d{2}-\d{4}$)"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleClear}
                    className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    Clear
                  </button>
                </div>
                {regexResult.error && (
                  <p className="mt-2 text-sm text-red-600">{regexResult.error}</p>
                )}

                <div className="flex gap-4 mt-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={flags.g}
                      onChange={(e) => setFlags({ ...flags, g: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      <span className="font-mono font-semibold">g</span> (global)
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={flags.i}
                      onChange={(e) => setFlags({ ...flags, i: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      <span className="font-mono font-semibold">i</span> (case insensitive)
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={flags.m}
                      onChange={(e) => setFlags({ ...flags, m: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      <span className="font-mono font-semibold">m</span> (multiline)
                    </span>
                  </label>
                </div>
              </div>

              {/* Test String */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Test String
                  </label>
                  <span className="text-xs text-gray-500">
                    {testString.length} characters
                  </span>
                </div>
                <textarea
                  value={testString}
                  onChange={(e) => setTestString(e.target.value)}
                  placeholder="Enter or paste text to test against your regex pattern..."
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                />
              </div>

              {/* Results */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-gray-800">Results</h2>
                  <span className={`text-sm font-medium ${
                    regexResult.matches.length > 0 ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {regexResult.matches.length} {regexResult.matches.length === 1 ? 'match' : 'matches'} found
                  </span>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 min-h-[120px] border border-gray-200">
                  {testString ? (
                    <div className="font-mono text-sm whitespace-pre-wrap break-words">
                      {highlightedText.map((segment, index) => (
                        <span
                          key={index}
                          className={segment.isMatch ? 'bg-green-200 text-green-900 font-semibold' : 'text-gray-700'}
                        >
                          {segment.text}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm">Enter a test string to see matches highlighted here...</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'saved' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Saved Patterns</h2>
                {user && (
                  <button
                    onClick={loadSavedRegexes}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Refresh
                  </button>
                )}
              </div>
              
              {!user ? (
                <div className="text-center py-12">
                  <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Please login to view your saved patterns</p>
                  <button
                    onClick={() => setShowAuth(true)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Login
                  </button>
                </div>
              ) : savedRegexes.length === 0 ? (
                <div className="text-center py-12">
                  <Save className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No saved patterns yet</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {savedRegexes.map((regex) => (
                    <div key={regex.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800">{regex.title}</h3>
                          <p className="text-sm text-gray-600 mt-1 font-mono">{regex.pattern}</p>
                          {regex.description && (
                            <p className="text-sm text-gray-500 mt-2">{regex.description}</p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span>Language: {regex.language}</span>
                            <span>Used {regex.usage_count} times</span>
                            <span>{new Date(regex.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <button
                            onClick={() => {
                              setPattern(regex.pattern);
                              setTestString(regex.test_string || '');
                              setActiveTab('test');
                            }}
                            className="text-blue-600 hover:text-blue-700 text-sm"
                          >
                            Use
                          </button>
                          <button
                            onClick={() => {
                              // Handle delete
                            }}
                            className="text-red-600 hover:text-red-700 text-sm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800">AI Regex Generator</h2>
                {user && (
                  <button
                    onClick={() => setShowAI(true)}
                    className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Brain className="w-4 h-4" />
                    Generate New
                  </button>
                )}
              </div>
              
              {!user ? (
                <div className="text-center py-12">
                  <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Please login to use AI features</p>
                  <button
                    onClick={() => setShowAuth(true)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Login
                  </button>
                </div>
              ) : aiResult ? (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                  <h3 className="font-semibold text-purple-800 mb-4">Generated Pattern</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pattern</label>
                      <div className="bg-white border border-gray-300 rounded-lg p-3 font-mono text-sm">
                        {aiResult.pattern}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Explanation</label>
                      <p className="text-sm text-gray-600">{aiResult.explanation}</p>
                    </div>
                    {aiResult.examples && aiResult.examples.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Examples</label>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {aiResult.examples.map((example: string, index: number) => (
                            <li key={index} className="font-mono">• {example}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <button
                      onClick={() => {
                        setPattern(aiResult.pattern);
                        setActiveTab('test');
                      }}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Use This Pattern
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Generate regex patterns using AI</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg">
            {error}
          </div>
        )}

        {/* Auth Modal */}
        {showAuth && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Authentication</h3>
              <AuthForm
                onLogin={handleLogin}
                onRegister={handleRegister}
                onClose={() => setShowAuth(false)}
                isLoading={isLoading}
              />
            </div>
          </div>
        )}

        {/* Save Modal */}
        {showSave && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Save Pattern</h3>
              <SaveForm
                onSave={handleSaveRegex}
                onClose={() => setShowSave(false)}
                isLoading={isLoading}
              />
            </div>
          </div>
        )}

        {/* AI Modal */}
        {showAI && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Generate Regex with AI</h3>
              <AIForm
                description={aiDescription}
                setDescription={setAiDescription}
                onGenerate={handleGenerateAI}
                onClose={() => setShowAI(false)}
                isLoading={isLoading}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Auth Form Component
function AuthForm({ onLogin, onRegister, onClose, isLoading }: {
  onLogin: (email: string, password: string) => void;
  onRegister: (email: string, password: string, username: string) => void;
  onClose: () => void;
  isLoading: boolean;
}) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      onLogin(email, password);
    } else {
      onRegister(email, password, username);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!isLogin && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Loading...' : (isLogin ? 'Login' : 'Register')}
        </button>
        <button
          type="button"
          onClick={() => setIsLogin(!isLogin)}
          className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
        >
          {isLogin ? 'Register' : 'Login'}
        </button>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="w-full text-gray-600 py-2 hover:text-gray-800"
      >
        Cancel
      </button>
    </form>
  );
}

// Save Form Component
function SaveForm({ onSave, onClose, isLoading }: {
  onSave: () => void;
  onClose: () => void;
  isLoading: boolean;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="My Regex Pattern"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          rows={3}
          placeholder="What does this pattern do?"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : 'Save'}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// AI Form Component
function AIForm({ description, setDescription, onGenerate, onClose, isLoading }: {
  description: string;
  setDescription: (desc: string) => void;
  onGenerate: () => void;
  onClose: () => void;
  isLoading: boolean;
}) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Describe what you want to match</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          rows={4}
          placeholder="e.g., Match email addresses, phone numbers, or any specific pattern..."
          required
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isLoading || !description.trim()}
          className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
        >
          {isLoading ? 'Generating...' : 'Generate'}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default App;