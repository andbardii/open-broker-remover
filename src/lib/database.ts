
import { DataRequest, DataBroker } from './types';
import { browserDb } from './browserDatabase';

class DatabaseService {
  async addRequest(brokerName: string, status: string, userEmail: string): Promise<number> {
    return browserDb.addRequest(brokerName, status, userEmail);
  }

  async getRequests(): Promise<DataRequest[]> {
    return browserDb.getRequests();
  }

  async getRequestById(id: string): Promise<DataRequest | undefined> {
    return browserDb.getRequestById(id);
  }

  async createRequest(request: Omit<DataRequest, 'id' | 'dateCreated' | 'dateUpdated'>): Promise<DataRequest> {
    return browserDb.createRequest(request);
  }

  async updateRequest(id: string, updates: Partial<DataRequest>): Promise<DataRequest | undefined> {
    return browserDb.updateRequest(id, updates);
  }

  async deleteRequest(id: string): Promise<boolean> {
    return browserDb.deleteRequest(id);
  }

  async getDataBrokers(): Promise<DataBroker[]> {
    return browserDb.getDataBrokers();
  }

  async findDataBrokersForEmail(email: string): Promise<DataBroker[]> {
    return browserDb.findDataBrokersForEmail(email);
  }
}

export const db = new DatabaseService();
