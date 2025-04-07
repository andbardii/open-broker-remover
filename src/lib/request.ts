interface RequestConfig {
  includePersonalData: boolean;
  includeContactHistory: boolean;
  includeProfiling: boolean;
}

export interface RequestStatus {
  id: string;
  broker: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  requestType: string;
  submittedDate: string;
  completedDate?: string;
  reference?: string;
  progress: number;
}

class RequestService {
  private config: RequestConfig = {
    includePersonalData: true,
    includeContactHistory: true,
    includeProfiling: false
  };

  constructor() {
    this.loadConfig();
  }

  private loadConfig(): void {
    if (typeof window !== 'undefined') {
      const savedConfig = localStorage.getItem('requestConfig');
      if (savedConfig) {
        try {
          this.config = JSON.parse(savedConfig);
        } catch (e) {
          console.error('Failed to parse request config:', e);
        }
      }
    }
  }

  saveConfig(config: RequestConfig): void {
    this.config = config;
    if (typeof window !== 'undefined') {
      localStorage.setItem('requestConfig', JSON.stringify(config));
    }
  }

  getConfig(): RequestConfig {
    return this.config;
  }

  // In a real app, these methods would interact with an actual API
  async createRequest(broker: string, requestType: string): Promise<RequestStatus> {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const id = Math.random().toString(36).substring(2, 9);
        const request: RequestStatus = {
          id,
          broker,
          requestType: requestType,
          status: 'pending',
          submittedDate: new Date().toISOString().split('T')[0],
          progress: 0,
          reference: `REQ-${id.toUpperCase()}`
        };
        
        // Store in local storage
        this.saveRequest(request);
        
        resolve(request);
      }, 1000);
    });
  }

  private saveRequest(request: RequestStatus): void {
    if (typeof window !== 'undefined') {
      const requests = this.getRequests();
      requests.push(request);
      localStorage.setItem('dataRequests', JSON.stringify(requests));
    }
  }

  getRequests(): RequestStatus[] {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dataRequests');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Failed to parse saved requests:', e);
        }
      }
    }
    return [];
  }

  async updateRequestStatus(id: string, status: RequestStatus['status'], progress?: number): Promise<RequestStatus | null> {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const requests = this.getRequests();
        const requestIndex = requests.findIndex(r => r.id === id);
        
        if (requestIndex === -1) {
          resolve(null);
          return;
        }
        
        const updatedRequest = {
          ...requests[requestIndex],
          status,
          progress: progress !== undefined ? progress : requests[requestIndex].progress
        };
        
        if (status === 'completed' && !updatedRequest.completedDate) {
          updatedRequest.completedDate = new Date().toISOString().split('T')[0];
        }
        
        requests[requestIndex] = updatedRequest;
        localStorage.setItem('dataRequests', JSON.stringify(requests));
        
        resolve(updatedRequest);
      }, 500);
    });
  }

  async deleteRequest(id: string): Promise<boolean> {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const requests = this.getRequests();
        const filteredRequests = requests.filter(r => r.id !== id);
        
        if (filteredRequests.length === requests.length) {
          // Request wasn't found
          resolve(false);
          return;
        }
        
        localStorage.setItem('dataRequests', JSON.stringify(filteredRequests));
        resolve(true);
      }, 500);
    });
  }
}

export const requestService = new RequestService(); 