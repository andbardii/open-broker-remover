import { DataBroker, DataRequest } from './types';

// API base URL - will use environment variable or default to localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Helper to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `API error: ${response.status}`);
  }
  return response.json();
};

// API Client
export const apiClient = {
  // Data Brokers
  getDataBrokers: async (): Promise<DataBroker[]> => {
    const response = await fetch(`${API_BASE_URL}/brokers`);
    return handleResponse(response);
  },

  addDataBroker: async (broker: Omit<DataBroker, 'id'>): Promise<DataBroker> => {
    const response = await fetch(`${API_BASE_URL}/brokers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(broker),
    });
    return handleResponse(response);
  },

  deleteDataBroker: async (id: string): Promise<boolean> => {
    const response = await fetch(`${API_BASE_URL}/brokers/${id}`, {
      method: 'DELETE',
    });
    const result = await handleResponse(response);
    return result.success;
  },

  findDataBrokersForEmail: async (email: string): Promise<DataBroker[]> => {
    const response = await fetch(`${API_BASE_URL}/brokers/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    return handleResponse(response);
  },

  // Requests
  getRequests: async (): Promise<DataRequest[]> => {
    const response = await fetch(`${API_BASE_URL}/requests`);
    return handleResponse(response);
  },

  getRequestById: async (id: string): Promise<DataRequest | undefined> => {
    const response = await fetch(`${API_BASE_URL}/requests/${id}`);
    if (response.status === 404) return undefined;
    return handleResponse(response);
  },

  createRequest: async (request: Omit<DataRequest, 'id' | 'dateCreated' | 'dateUpdated'>): Promise<DataRequest> => {
    const response = await fetch(`${API_BASE_URL}/requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return handleResponse(response);
  },

  updateRequest: async (id: string, updates: Partial<DataRequest>): Promise<DataRequest | undefined> => {
    const response = await fetch(`${API_BASE_URL}/requests/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    if (response.status === 404) return undefined;
    return handleResponse(response);
  },

  deleteRequest: async (id: string): Promise<boolean> => {
    const response = await fetch(`${API_BASE_URL}/requests/${id}`, {
      method: 'DELETE',
    });
    const result = await handleResponse(response);
    return result.success;
  },

  // Health check
  checkHealth: async (): Promise<{ status: string; timestamp: string }> => {
    const response = await fetch(`${API_BASE_URL}/health`);
    return handleResponse(response);
  }
}; 