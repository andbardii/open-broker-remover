import { DataRequest, DataBroker } from './types';

class BrowserDatabaseService {
  private dataBrokers: DataBroker[] = [];
  private dbName = 'open_broker_remover_db';
  private requestsStoreName = 'requests';
  private brokersStoreName = 'brokers';
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  constructor() {
    // Initial data broker information
    this.dataBrokers = [
      { id: '1', name: 'Acxiom', optOutUrl: 'https://www.acxiom.com/optout/' },
      { id: '2', name: 'BeenVerified', optOutUrl: 'https://www.beenverified.com/app/optout/search' },
      { id: '3', name: 'Spokeo', optOutUrl: 'https://www.spokeo.com/optout' },
      { id: '4', name: 'Intelius', optOutUrl: 'https://intelius.com/opt-out' },
      { id: '5', name: 'Whitepages', optOutUrl: 'https://www.whitepages.com/suppression-requests' },
      { id: '6', name: 'MyLife', optOutUrl: 'https://www.mylife.com/ccpa/index.pubview' },
      { id: '7', name: 'PeopleFinders', optOutUrl: 'https://www.peoplefinders.com/opt-out' },
      { id: '8', name: 'PeopleSmart', optOutUrl: 'https://www.peoplesmart.com/opt-out' },
      { id: '9', name: 'Radaris', optOutUrl: 'https://radaris.com/page/how-to-remove' },
      { id: '10', name: 'US Search', optOutUrl: 'https://www.ussearch.com/opt-out/' },
      { id: '11', name: 'Epsilon', optOutUrl: 'https://us.epsilon.com/consumer-information-privacy-request' },
      { id: '12', name: 'CoreLogic', optOutUrl: 'https://www.corelogic.com/privacy-center/' },
      { id: '13', name: 'LexisNexis', optOutUrl: 'https://optout.lexisnexis.com/' },
      { id: '14', name: 'FastPeopleSearch', optOutUrl: 'https://www.fastpeoplesearch.com/removal' },
      { id: '15', name: 'TruthFinder', optOutUrl: 'https://www.truthfinder.com/opt-out/' },
      { id: '16', name: 'ZabaSearch', optOutUrl: 'https://www.zabasearch.com/block_records/' },
      { id: '17', name: 'PeopleLookup', optOutUrl: 'https://www.peoplelookup.com/optout/' },
      { id: '18', name: 'PublicRecordsNow', optOutUrl: 'https://www.publicrecordsnow.com/optout/' },
      { id: '19', name: 'USPhoneBook', optOutUrl: 'https://www.usphonebook.com/opt-out' },
      { id: '20', name: 'ClustrMaps', optOutUrl: 'https://clustrmaps.com/bl/opt-out' },
      { id: '21', name: 'Instant Checkmate', optOutUrl: 'https://www.instantcheckmate.com/opt-out/' },
      { id: '22', name: 'Advanced Background Checks', optOutUrl: 'https://www.advancedbackgroundchecks.com/removal' },
      { id: '23', name: 'Addresses.com', optOutUrl: 'https://www.addresses.com/optout.php' },
      { id: '24', name: 'AnyWho', optOutUrl: 'https://www.anywho.com/optout' },
      { id: '25', name: 'ArrestFacts', optOutUrl: 'https://arrestfacts.com/optout' },
      { id: '26', name: 'Background Alert', optOutUrl: 'https://www.backgroundalert.com/optout' },
      { id: '27', name: 'BackgroundCheck.Run', optOutUrl: 'https://backgroundcheck.run/optout' },
      { id: '28', name: 'BlockShopper', optOutUrl: 'https://blockshopper.com/about/opt_out' },
      { id: '29', name: 'CallTruth', optOutUrl: 'https://calltruth.com/optout' },
      { id: '30', name: 'CheckPeople', optOutUrl: 'https://www.checkpeople.com/opt-out' },
      { id: '31', name: 'Clustrmap', optOutUrl: 'https://clustrmaps.com/bl/opt-out' },
      { id: '32', name: 'CocoFinder', optOutUrl: 'https://cocofinder.com/optout' },
      { id: '33', name: 'CyberBackgroundChecks', optOutUrl: 'https://www.cyberbackgroundchecks.com/removal' },
      { id: '34', name: 'Dynata', optOutUrl: 'https://www.dynata.com/opt-out/' },
      { id: '35', name: 'FamilyTreeNow', optOutUrl: 'https://www.familytreenow.com/optout' },
      { id: '36', name: 'FastBackgroundCheck', optOutUrl: 'https://www.fastbackgroundcheck.com/removal' },
      { id: '37', name: 'GoLookUp', optOutUrl: 'https://golookup.com/optout' },
      { id: '38', name: 'Homemetry', optOutUrl: 'https://homemetry.com/optout' },
      { id: '39', name: 'Innovis', optOutUrl: 'https://www.innovis.com/personal/optout' },
      { id: '40', name: 'IdTrue', optOutUrl: 'https://www.idtrue.com/optout' },
      { id: '41', name: 'Equifax', optOutUrl: 'https://www.equifax.com/personal/privacy/' },
      { id: '42', name: 'Experian', optOutUrl: 'https://www.experian.com/privacy/center.html' },
      { id: '43', name: 'TransUnion', optOutUrl: 'https://www.transunion.com/consumer-privacy' },
      { id: '44', name: 'Oracle', optOutUrl: 'https://www.oracle.com/legal/privacy/marketing-opt-out.html' },
      { id: '45', name: 'PeekYou', optOutUrl: 'https://www.peekyou.com/about/contact/' },
      { id: '46', name: 'Tapad', optOutUrl: 'https://www.tapad.com/privacy-policy' },
      { id: '47', name: 'TowerData', optOutUrl: 'https://www.towerdata.com/privacy-policy' },
      { id: '48', name: 'Clearview AI', optOutUrl: 'https://clearview.ai/privacy-policy' },
      { id: '49', name: 'Mobilewalla', optOutUrl: 'https://www.mobilewalla.com/privacy-policy' },
      { id: '50', name: 'Gravy Analytics', optOutUrl: 'https://gravyanalytics.com/privacy/' },
      { id: '51', name: 'Social Catfish', optOutUrl: 'https://socialcatfish.com/opt-out/' },
      { id: '52', name: 'SpyFly', optOutUrl: 'https://www.spyfly.com/opt-out' },
      { id: '53', name: 'That\'s Them', optOutUrl: 'https://thatsthem.com/opt-out' },
      { id: '54', name: 'TruePeopleSearch', optOutUrl: 'https://www.truepeoplesearch.com/removal' },
      { id: '55', name: 'United States Phone Book', optOutUrl: 'https://www.usphonebook.com/opt-out' },
      { id: '56', name: 'USA People Search', optOutUrl: 'https://www.usa-people-search.com/manage/optout' },
      { id: '57', name: 'USA-Official', optOutUrl: 'https://www.usa-official.com/optout' },
      { id: '58', name: 'Vericora', optOutUrl: 'https://vericora.com/opt-out' },
      { id: '59', name: 'Veripages', optOutUrl: 'https://veripages.com/optout' },
      { id: '60', name: 'VoterRecords', optOutUrl: 'https://voterrecords.com/optout' },
      { id: '61', name: '411.com', optOutUrl: 'https://www.411.com/privacy/manage' },
      { id: '62', name: '411 Locate', optOutUrl: 'https://www.411locate.com/optout' },
      { id: '63', name: 'Ancestry', optOutUrl: 'https://www.ancestry.com/cs/legal/ccpa-personal-information-request-form' },
      { id: '64', name: 'AnyWho', optOutUrl: 'https://www.anywho.com/optout' },
      { id: '65', name: 'Arrests.org', optOutUrl: 'https://arrests.org/opt-out/' },
      { id: '66', name: 'CallTruth', optOutUrl: 'https://calltruth.com/optout' },
      { id: '67', name: 'CheckPeople', optOutUrl: 'https://www.checkpeople.com/opt-out' },
      { id: '68', name: 'CocoFinder', optOutUrl: 'https://cocofinder.com/optout' },
      { id: '69', name: 'CyberBackgroundChecks', optOutUrl: 'https://www.cyberbackgroundchecks.com/removal' },
      { id: '70', name: 'FamilyTreeNow', optOutUrl: 'https://www.familytreenow.com/optout' }
    ];

    this.initPromise = this.initDatabase();
  }

  private initDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      // If database is already initialized, resolve immediately
      if (this.db) {
        resolve();
        return;
      }

      const request = indexedDB.open(this.dbName, 2); // Keep version 2
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create requests store with auto-incrementing id
        if (!db.objectStoreNames.contains(this.requestsStoreName)) {
          const store = db.createObjectStore(this.requestsStoreName, { keyPath: 'id', autoIncrement: true });
          store.createIndex('userEmail', 'userEmail', { unique: false });
          store.createIndex('brokerName', 'brokerName', { unique: false });
          store.createIndex('status', 'status', { unique: false });
        }
        
        // Create brokers store with auto-incrementing id
        if (!db.objectStoreNames.contains(this.brokersStoreName)) {
          const store = db.createObjectStore(this.brokersStoreName, { keyPath: 'id', autoIncrement: true });
          store.createIndex('name', 'name', { unique: true });
        }
      };
      
      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        console.log('IndexedDB initialized successfully');
        
        // Check if brokers store is empty and populate if needed
        this.populateInitialBrokersIfEmpty().then(resolve).catch(reject);
      };
      
      request.onerror = (event) => {
        console.error('Error opening IndexedDB:', (event.target as IDBOpenDBRequest).error);
        reject((event.target as IDBOpenDBRequest).error);
      };
    });
  }

  // New method to check if brokers store is empty and populate if needed
  private async populateInitialBrokersIfEmpty(): Promise<void> {
    if (!this.db) return;

    try {
      const brokers = await this.getDataBrokers();
      
      // If no brokers found, populate with initial data
      if (brokers.length === 0 && this.dataBrokers.length > 0) {
        console.log('No data brokers found in database, populating with initial data...');
        
        // Use a Promise.all to add all brokers
        const promises = this.dataBrokers.map(broker => {
          // Remove the id so it auto-increments
          const { id, ...brokerData } = broker;
          return this.addDataBroker(brokerData);
        });
        
        await Promise.all(promises);
        console.log(`Populated database with ${this.dataBrokers.length} data brokers`);
      }
    } catch (error) {
      console.error('Error checking/populating data brokers:', error);
      throw error;
    }
  }

  private getDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (this.db) {
        resolve(this.db);
        return;
      }
      
      // If initialization is in progress, wait for it
      if (this.initPromise) {
        this.initPromise
          .then(() => {
            if (this.db) {
              resolve(this.db);
            } else {
              reject(new Error('Database not initialized after init promise resolved'));
            }
          })
          .catch(reject);
        return;
      }
      
      // If no init promise, start initialization
      this.initPromise = this.initDatabase();
      this.initPromise
        .then(() => {
          if (this.db) {
            resolve(this.db);
          } else {
            reject(new Error('Failed to initialize database'));
          }
        })
        .catch(reject);
    });
  }

  async addRequest(brokerName: string, status: string, userEmail: string): Promise<number> {
    const db = await this.getDatabase();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.requestsStoreName], 'readwrite');
      const store = transaction.objectStore(this.requestsStoreName);
      
      const now = new Date().toISOString();
      const request = store.add({
        brokerName,
        status,
        dateCreated: now,
        dateUpdated: now,
        userEmail
      });
      
      request.onsuccess = () => {
        resolve(request.result as number);
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async getRequests(): Promise<DataRequest[]> {
    const db = await this.getDatabase();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.requestsStoreName], 'readonly');
      const store = transaction.objectStore(this.requestsStoreName);
      const request = store.getAll();
      
      request.onsuccess = () => {
        // Convert numeric IDs to strings to match the expected interface
        const requests = request.result.map(req => ({
          ...req,
          id: req.id.toString()
        }));
        resolve(requests);
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async getRequestById(id: string): Promise<DataRequest | undefined> {
    const db = await this.getDatabase();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.requestsStoreName], 'readonly');
      const store = transaction.objectStore(this.requestsStoreName);
      const request = store.get(parseInt(id, 10));
      
      request.onsuccess = () => {
        if (request.result) {
          const result = request.result;
          resolve({
            ...result,
            id: result.id.toString()
          });
        } else {
          resolve(undefined);
        }
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async createRequest(request: Omit<DataRequest, 'id' | 'dateCreated' | 'dateUpdated'>): Promise<DataRequest> {
    const id = await this.addRequest(request.brokerName, request.status, request.userEmail);
    return { 
      ...request, 
      id: id.toString(), 
      dateCreated: new Date().toISOString(), 
      dateUpdated: new Date().toISOString() 
    };
  }

  async updateRequest(id: string, updates: Partial<DataRequest>): Promise<DataRequest | undefined> {
    const db = await this.getDatabase();
    const numericId = parseInt(id, 10);
    
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      const transaction = db.transaction([this.requestsStoreName], 'readwrite');
      const store = transaction.objectStore(this.requestsStoreName);
      
      // First get the existing record
      const getRequest = store.get(numericId);
      
      getRequest.onsuccess = () => {
        if (!getRequest.result) {
          resolve(undefined);
          return;
        }
        
        const existingData = getRequest.result;
        const updatedData = {
          ...existingData,
          ...updates,
          dateUpdated: new Date().toISOString(),
          id: numericId // Ensure ID is preserved
        };
        
        const updateRequest = store.put(updatedData);
        
        updateRequest.onsuccess = async () => {
          const updated = await this.getRequestById(id);
          resolve(updated);
        };
        
        updateRequest.onerror = () => {
          reject(updateRequest.error);
        };
      };
      
      getRequest.onerror = () => {
        reject(getRequest.error);
      };
    });
  }

  async deleteRequest(id: string): Promise<boolean> {
    const db = await this.getDatabase();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.requestsStoreName], 'readwrite');
      const store = transaction.objectStore(this.requestsStoreName);
      const request = store.delete(parseInt(id, 10));
      
      request.onsuccess = () => {
        resolve(true);
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async getDataBrokers(): Promise<DataBroker[]> {
    try {
      const db = await this.getDatabase();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.brokersStoreName], 'readonly');
        const store = transaction.objectStore(this.brokersStoreName);
        const request = store.getAll();
        
        request.onsuccess = () => {
          // Convert numeric IDs to strings to match the expected interface
          const brokers = request.result.map(broker => ({
            ...broker,
            id: broker.id.toString()
          }));
          resolve(brokers);
        };
        
        request.onerror = () => {
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Error fetching data brokers:', error);
      return []; // Return empty array on error to prevent cascading failures
    }
  }
  
  async addDataBroker(broker: Omit<DataBroker, 'id'>): Promise<DataBroker> {
    const db = await this.getDatabase();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.brokersStoreName], 'readwrite');
      const store = transaction.objectStore(this.brokersStoreName);
      
      const request = store.add(broker);
      
      request.onsuccess = () => {
        const newId = request.result as number;
        resolve({
          ...broker,
          id: newId.toString()
        });
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  }
  
  async deleteDataBroker(id: string): Promise<boolean> {
    const db = await this.getDatabase();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.brokersStoreName], 'readwrite');
      const store = transaction.objectStore(this.brokersStoreName);
      const request = store.delete(parseInt(id, 10));
      
      request.onsuccess = () => {
        resolve(true);
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async findDataBrokersForEmail(email: string): Promise<DataBroker[]> {
    console.log(`Finding data brokers for email: ${email}`);
    const numBrokers = Math.floor(Math.random() * 10) + 5;
    const brokers = await this.getDataBrokers();
    const shuffled = [...brokers].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, numBrokers);
  }
}

export const browserDb = new BrowserDatabaseService();
