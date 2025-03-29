
import { DataRequest } from './types';

// This is a mock implementation of SQLite for the frontend
// In a real implementation, this would use Electron's IPC to communicate with the backend
class DatabaseService {
  private requests: DataRequest[] = [];

  constructor() {
    // Initialize with some example data
    this.requests = [
      {
        id: '1',
        brokerName: 'DataCorp Inc.',
        status: 'sent',
        dateCreated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        dateUpdated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        userEmail: 'user@example.com',
      },
      {
        id: '2',
        brokerName: 'InfoTrack',
        status: 'responded',
        dateCreated: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        dateUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        userEmail: 'user@example.com',
        responseContent: 'Your request has been received and is being processed.'
      },
      {
        id: '3',
        brokerName: 'DataMiners',
        status: 'completed',
        dateCreated: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        dateUpdated: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        userEmail: 'user@example.com',
        responseContent: 'We have removed your data as requested.'
      },
      {
        id: '4',
        brokerName: 'ProfileTrack',
        status: 'pending',
        dateCreated: new Date().toISOString(),
        dateUpdated: new Date().toISOString(),
        userEmail: 'user@example.com',
      }
    ];
  }

  async getRequests(): Promise<DataRequest[]> {
    return this.requests;
  }

  async getRequestById(id: string): Promise<DataRequest | undefined> {
    return this.requests.find(request => request.id === id);
  }

  async createRequest(request: Omit<DataRequest, 'id' | 'dateCreated' | 'dateUpdated'>): Promise<DataRequest> {
    const newRequest: DataRequest = {
      ...request,
      id: (this.requests.length + 1).toString(),
      dateCreated: new Date().toISOString(),
      dateUpdated: new Date().toISOString(),
    };
    
    this.requests.push(newRequest);
    return newRequest;
  }

  async updateRequest(id: string, updates: Partial<DataRequest>): Promise<DataRequest | undefined> {
    const index = this.requests.findIndex(request => request.id === id);
    if (index === -1) return undefined;
    
    this.requests[index] = {
      ...this.requests[index],
      ...updates,
      dateUpdated: new Date().toISOString(),
    };
    
    return this.requests[index];
  }

  async deleteRequest(id: string): Promise<boolean> {
    const index = this.requests.findIndex(request => request.id === id);
    if (index === -1) return false;
    
    this.requests.splice(index, 1);
    return true;
  }
}

export const db = new DatabaseService();
