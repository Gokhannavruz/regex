const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface TestRegexRequest {
  pattern: string;
  flags?: string;
  testString: string;
  language?: string;
}

export interface TestRegexResponse {
  success: boolean;
  matches: Array<{
    match: string;
    index: number;
    groups: Record<string, string>;
  }>;
  matchCount: number;
  executionTime: number;
  isValid: boolean;
  error?: string;
}

export interface SaveRegexRequest {
  title: string;
  pattern: string;
  flags?: string;
  description?: string;
  testString?: string;
  language?: string;
}

export interface SavedRegex {
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

export interface AuthRequest {
  email: string;
  password: string;
  username?: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    email: string;
    username?: string;
  };
}

export interface AIGenerateRequest {
  description: string;
  language?: string;
}

export interface AIGenerateResponse {
  pattern: string;
  flags?: string;
  explanation: string;
  examples: string[];
}

export interface AIImproveRequest {
  pattern: string;
  issue: string;
}

export interface AIImproveResponse {
  improved_pattern: string;
  changes: string;
  performance: string;
}

// Test regex
export const testRegex = async (data: TestRegexRequest): Promise<TestRegexResponse> => {
  const response = await fetch(`${API_BASE}/regex/test`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return response.json();
};

// Explain regex
export const explainRegex = async (pattern: string) => {
  const response = await fetch(`${API_BASE}/regex/explain`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pattern })
  });
  return response.json();
};

// Authentication
export const register = async (data: AuthRequest): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return response.json();
};

export const login = async (data: Omit<AuthRequest, 'username'>): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return response.json();
};

// Save regex (authenticated)
export const saveRegex = async (data: SaveRegexRequest): Promise<{ saved: SavedRegex }> => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}/regex/save`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  return response.json();
};

// Get saved regex
export const getSavedRegex = async (): Promise<{ patterns: SavedRegex[] }> => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}/regex/saved`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};

// Delete saved regex
export const deleteSavedRegex = async (id: number): Promise<{ success: boolean }> => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}/regex/saved/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};

// Community library
export const getRegexLibrary = async (category?: string, search?: string) => {
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  if (search) params.append('search', search);
  
  const response = await fetch(`${API_BASE}/regex/library?${params}`);
  return response.json();
};

// AI features
export const generateRegex = async (data: AIGenerateRequest): Promise<AIGenerateResponse> => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}/ai/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  return response.json();
};

export const improveRegex = async (data: AIImproveRequest): Promise<AIImproveResponse> => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}/ai/improve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  return response.json();
};
