import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { DataBroker, DataRequest, BrokerCategory } from '../lib/types';
import { encryptionService } from './encryption';

// Import KEY_FILE_PATH
const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
const KEY_FILE_PATH = path.join(DATA_DIR, '.encryption_key');

// Define database row types
interface RequestRow {
  id: number;
  brokerName: string;
  status: 'pending' | 'sent' | 'responded' | 'completed';
  dateCreated: string;
  dateUpdated: string;
  userEmail: string;
  responseContent: string | null;
  metadata: string | null;
}

interface BrokerRow {
  id: number;
  name: string;
  optOutUrl: string;
  category: string;
  optOutMethod: string;
  dataTypes: string;
  difficulty: string;
  responseTime: string | null;
  region: string | null;
  privacyLawReference: string | null;
  isPremium: number;
}

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'open-broker-remover.db');
const db = new Database(DB_PATH);

// Initialize database
const initDatabase = () => {
  // Enable foreign keys
  db.pragma('foreign_keys = ON');

  // Create requests table
  db.exec(`
    CREATE TABLE IF NOT EXISTS requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      brokerName TEXT NOT NULL,
      status TEXT NOT NULL,
      dateCreated TEXT NOT NULL,
      dateUpdated TEXT NOT NULL,
      userEmail TEXT NOT NULL,
      responseContent TEXT,
      metadata TEXT,
      encrypted INTEGER DEFAULT 0
    )
  `);

  // Create brokers table with extended fields
  db.exec(`
    CREATE TABLE IF NOT EXISTS brokers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      optOutUrl TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'other',
      optOutMethod TEXT NOT NULL DEFAULT 'form',
      dataTypes TEXT NOT NULL DEFAULT '[]',
      difficulty TEXT NOT NULL DEFAULT 'medium',
      responseTime TEXT,
      region TEXT,
      privacyLawReference TEXT,
      isPremium INTEGER DEFAULT 0
    )
  `);

  // Create indices for faster searches
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_requests_userEmail ON requests(userEmail);
    CREATE INDEX IF NOT EXISTS idx_requests_brokerName ON requests(brokerName);
    CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
    CREATE INDEX IF NOT EXISTS idx_brokers_name ON brokers(name);
  `);

  // Create encryption status table
  db.exec(`
    CREATE TABLE IF NOT EXISTS encryption_status (
      id INTEGER PRIMARY KEY,
      enabled INTEGER DEFAULT 0,
      initialized INTEGER DEFAULT 0
    )
  `);

  // Check if we have an encryption status record
  const statusCheck = db.prepare('SELECT COUNT(*) as count FROM encryption_status').get() as { count: number };
  
  if (statusCheck.count === 0) {
    db.prepare('INSERT INTO encryption_status (enabled, initialized) VALUES (0, 0)').run();
  }
};

// Initialize the database
initDatabase();

// Initialize encryption if available
const initializeEncryption = async () => {
  try {
    // Check if the key exists
    const keyExists = await encryptionService.keyExists();
    
    if (keyExists) {
      await encryptionService.initialize();
      
      // Update status in database
      db.prepare('UPDATE encryption_status SET initialized = 1').run();
      console.log('Encryption initialized successfully');
      
      // Check if encryption is enabled
      const status = db.prepare('SELECT enabled FROM encryption_status').get() as { enabled: number };
      if (status.enabled === 1) {
        console.log('Encryption is enabled for this database');
      } else {
        console.log('Encryption is available but not enabled for this database');
      }
    } else {
      console.log('No encryption key found. Encryption is disabled.');
      db.prepare('UPDATE encryption_status SET initialized = 0, enabled = 0').run();
    }
  } catch (error) {
    console.error('Error initializing encryption:', error);
  }
};

// Try to initialize encryption
(async () => {
  await initializeEncryption();
})().catch(err => {
  console.error('Failed to initialize encryption:', err);
});

// Initial broker data
const initialBrokers = [
  { name: 'Acxiom', optOutUrl: 'https://www.acxiom.com/optout/' },
  { name: 'BeenVerified', optOutUrl: 'https://www.beenverified.com/app/optout/search' },
  { name: 'Spokeo', optOutUrl: 'https://www.spokeo.com/optout' },
  { name: 'Intelius', optOutUrl: 'https://intelius.com/opt-out' },
  { name: 'Whitepages', optOutUrl: 'https://www.whitepages.com/suppression-requests' },
  { name: 'MyLife', optOutUrl: 'https://www.mylife.com/ccpa/index.pubview' },
  { name: 'PeopleFinders', optOutUrl: 'https://www.peoplefinders.com/opt-out' },
  { name: 'PeopleSmart', optOutUrl: 'https://www.peoplesmart.com/opt-out' },
  { name: 'Radaris', optOutUrl: 'https://radaris.com/page/how-to-remove' },
  { name: 'US Search', optOutUrl: 'https://www.ussearch.com/opt-out/' },
  { name: 'Epsilon', optOutUrl: 'https://us.epsilon.com/consumer-information-privacy-request' },
  { name: 'CoreLogic', optOutUrl: 'https://www.corelogic.com/privacy-center/' },
  { name: 'LexisNexis', optOutUrl: 'https://optout.lexisnexis.com/' },
  { name: 'FastPeopleSearch', optOutUrl: 'https://www.fastpeoplesearch.com/removal' },
  { name: 'TruthFinder', optOutUrl: 'https://www.truthfinder.com/opt-out/' },
  { name: 'ZabaSearch', optOutUrl: 'https://www.zabasearch.com/block_records/' },
  { name: 'PeopleLookup', optOutUrl: 'https://www.peoplelookup.com/optout/' },
  { name: 'PublicRecordsNow', optOutUrl: 'https://www.publicrecordsnow.com/optout/' },
  { name: 'USPhoneBook', optOutUrl: 'https://www.usphonebook.com/opt-out' },
  { name: 'ClustrMaps', optOutUrl: 'https://clustrmaps.com/bl/opt-out' },
  { name: 'Instant Checkmate', optOutUrl: 'https://www.instantcheckmate.com/opt-out/' },
  { name: 'Advanced Background Checks', optOutUrl: 'https://www.advancedbackgroundchecks.com/removal' },
  { name: 'Addresses.com', optOutUrl: 'https://www.addresses.com/optout.php' },
  { name: 'AnyWho', optOutUrl: 'https://www.anywho.com/optout' },
  { name: 'ArrestFacts', optOutUrl: 'https://arrestfacts.com/optout' },
  { name: 'Background Alert', optOutUrl: 'https://www.backgroundalert.com/optout' },
  { name: 'BackgroundCheck.Run', optOutUrl: 'https://backgroundcheck.run/optout' },
  { name: 'BlockShopper', optOutUrl: 'https://blockshopper.com/about/opt_out' },
  { name: 'CallTruth', optOutUrl: 'https://calltruth.com/optout' },
  { name: 'CheckPeople', optOutUrl: 'https://www.checkpeople.com/opt-out' },
  { name: 'Clustrmap', optOutUrl: 'https://clustrmaps.com/bl/opt-out' },
  { name: 'CocoFinder', optOutUrl: 'https://cocofinder.com/optout' },
  { name: 'CyberBackgroundChecks', optOutUrl: 'https://www.cyberbackgroundchecks.com/removal' },
  { name: 'Dynata', optOutUrl: 'https://www.dynata.com/opt-out/' },
  { name: 'FamilyTreeNow', optOutUrl: 'https://www.familytreenow.com/optout' },
  { name: 'FastBackgroundCheck', optOutUrl: 'https://www.fastbackgroundcheck.com/removal' },
  { name: 'GoLookUp', optOutUrl: 'https://golookup.com/optout' },
  { name: 'Homemetry', optOutUrl: 'https://homemetry.com/optout' },
  { name: 'Innovis', optOutUrl: 'https://www.innovis.com/personal/optout' },
  { name: 'IdTrue', optOutUrl: 'https://www.idtrue.com/optout' },
  { name: 'Equifax', optOutUrl: 'https://www.equifax.com/personal/privacy/' },
  { name: 'Experian', optOutUrl: 'https://www.experian.com/privacy/center.html' },
  { name: 'TransUnion', optOutUrl: 'https://www.transunion.com/consumer-privacy' },
  { name: 'Oracle', optOutUrl: 'https://www.oracle.com/legal/privacy/marketing-opt-out.html' },
  { name: 'PeekYou', optOutUrl: 'https://www.peekyou.com/about/contact/' },
  { name: 'Tapad', optOutUrl: 'https://www.tapad.com/privacy-policy' },
  { name: 'TowerData', optOutUrl: 'https://www.towerdata.com/privacy-policy' },
  { name: 'Clearview AI', optOutUrl: 'https://clearview.ai/privacy-policy' },
  { name: 'Mobilewalla', optOutUrl: 'https://www.mobilewalla.com/privacy-policy' },
  { name: 'Gravy Analytics', optOutUrl: 'https://gravyanalytics.com/privacy/' },
  { name: 'Social Catfish', optOutUrl: 'https://socialcatfish.com/opt-out/' },
  { name: 'SpyFly', optOutUrl: 'https://www.spyfly.com/opt-out' },
  { name: 'That\'s Them', optOutUrl: 'https://thatsthem.com/opt-out' },
  { name: 'TruePeopleSearch', optOutUrl: 'https://www.truepeoplesearch.com/removal' },
  { name: 'United States Phone Book', optOutUrl: 'https://www.usphonebook.com/opt-out' },
  { name: 'USA People Search', optOutUrl: 'https://www.usa-people-search.com/manage/optout' },
  { name: 'USA-Official', optOutUrl: 'https://www.usa-official.com/optout' },
  { name: 'Vericora', optOutUrl: 'https://vericora.com/opt-out' },
  { name: 'Veripages', optOutUrl: 'https://veripages.com/optout' },
  { name: 'VoterRecords', optOutUrl: 'https://voterrecords.com/optout' },
  { name: '411.com', optOutUrl: 'https://www.411.com/privacy/manage' },
  { name: '411 Locate', optOutUrl: 'https://www.411locate.com/optout' },
  { name: 'Ancestry', optOutUrl: 'https://www.ancestry.com/cs/legal/ccpa-personal-information-request-form' },
  { name: 'Arrests.org', optOutUrl: 'https://arrests.org/opt-out/' },
  { name: 'CallTruth', optOutUrl: 'https://calltruth.com/optout' },
  { name: 'CheckPeople', optOutUrl: 'https://www.checkpeople.com/opt-out' },
  { name: 'CocoFinder', optOutUrl: 'https://cocofinder.com/optout' },
  { name: 'CyberBackgroundChecks', optOutUrl: 'https://www.cyberbackgroundchecks.com/removal' },
  { name: 'FamilyTreeNow', optOutUrl: 'https://www.familytreenow.com/optout' }
];

// Check if brokers table is empty and populate if needed
const populateInitialBrokersIfEmpty = () => {
  const count = db.prepare('SELECT COUNT(*) as count FROM brokers').get() as { count: number };
  
  if (count.count === 0) {
    console.log('Populating data brokers table with initial data...');
    
    // Create a transaction for better performance with error handling
    try {
      const insertMany = db.transaction((brokers: typeof initialBrokers) => {
        const insertStmt = db.prepare('INSERT OR IGNORE INTO brokers (name, optOutUrl) VALUES (?, ?)');
        for (const broker of brokers) {
          insertStmt.run(broker.name, broker.optOutUrl);
        }
      });
      
      insertMany(initialBrokers);
      const actualCount = db.prepare('SELECT COUNT(*) as count FROM brokers').get() as { count: number };
      console.log(`Populated database with ${actualCount.count} data brokers`);
    } catch (error) {
      console.error('Error in transaction:', error);
      throw error;
    }
  }
};

// Try to populate the brokers table
try {
  populateInitialBrokersIfEmpty();
} catch (error) {
  console.error('Error populating data brokers:', error);
}

// Database operations
export const dbService = {
  // Request operations
  getRequests: async (): Promise<DataRequest[]> => {
    const rows = db.prepare('SELECT * FROM requests').all() as (RequestRow & { encrypted: number })[];
    
    const requests: DataRequest[] = [];
    
    for (const row of rows) {
      if (row.encrypted === 1) {
        try {
          // Decrypt the data
          let decryptedResponse = row.responseContent;
          let decryptedMetadata = row.metadata;
          
          if (row.responseContent) {
            decryptedResponse = await encryptionService.decrypt(row.responseContent);
          }
          
          if (row.metadata) {
            decryptedMetadata = await encryptionService.decrypt(row.metadata);
          }
          
          requests.push({
            ...row,
            id: row.id.toString(),
            responseContent: decryptedResponse ?? undefined,
            metadata: decryptedMetadata ?? undefined
          });
        } catch (error) {
          console.error(`Failed to decrypt request ${row.id}:`, error);
          
          // Add with encryption indicators
          requests.push({
            ...row,
            id: row.id.toString(),
            responseContent: row.responseContent ? '[ENCRYPTED]' : undefined,
            metadata: row.metadata ? '[ENCRYPTED]' : undefined
          });
        }
      } else {
        // Data is not encrypted, add as normal
        requests.push({
          ...row,
          id: row.id.toString(),
          responseContent: row.responseContent ?? undefined,
          metadata: row.metadata ?? undefined
        });
      }
    }
    
    return requests;
  },
  
  getRequestById: async (id: string): Promise<DataRequest | undefined> => {
    const row = db.prepare('SELECT * FROM requests WHERE id = ?').get(parseInt(id, 10)) as (RequestRow & { encrypted: number }) | undefined;
    if (!row) return undefined;
    
    // Check if we need to decrypt
    if (row.encrypted === 1) {
      try {
        // Decrypt the data
        let decryptedResponse = row.responseContent;
        let decryptedMetadata = row.metadata;
        
        if (row.responseContent) {
          decryptedResponse = await encryptionService.decrypt(row.responseContent);
        }
        
        if (row.metadata) {
          decryptedMetadata = await encryptionService.decrypt(row.metadata);
        }
        
        return {
          ...row,
          id: row.id.toString(),
          responseContent: decryptedResponse ?? undefined,
          metadata: decryptedMetadata ?? undefined
        };
      } catch (error) {
        console.error(`Failed to decrypt request ${id}:`, error);
        
        // Return the raw data with encryption indicators
        return {
          ...row,
          id: row.id.toString(),
          responseContent: row.responseContent ? '[ENCRYPTED]' : undefined,
          metadata: row.metadata ? '[ENCRYPTED]' : undefined
        };
      }
    }
    
    // Data is not encrypted, return as normal
    return {
      ...row,
      id: row.id.toString(),
      responseContent: row.responseContent ?? undefined,
      metadata: row.metadata ?? undefined
    };
  },
  
  addRequest: (brokerName: string, status: 'pending' | 'sent' | 'responded' | 'completed', userEmail: string): number => {
    const now = new Date().toISOString();
    
    const info = db.prepare(
      'INSERT INTO requests (brokerName, status, dateCreated, dateUpdated, userEmail) VALUES (?, ?, ?, ?, ?)'
    ).run(brokerName, status, now, now, userEmail);
    
    return info.lastInsertRowid as number;
  },
  
  createRequest: async (request: Omit<DataRequest, 'id' | 'dateCreated' | 'dateUpdated'>): Promise<DataRequest> => {
    const now = new Date().toISOString();
    
    try {
      // Check if encryption is enabled
      const { enabled, initialized } = dbService.getEncryptionStatus();
      let encryptedContent = request.responseContent;
      let encryptedMetadata = request.metadata;
      let isEncrypted = 0;
      
      if (enabled && initialized && (request.responseContent || request.metadata)) {
        if (request.responseContent) {
          encryptedContent = await encryptionService.encrypt(request.responseContent);
        }
        
        if (request.metadata) {
          encryptedMetadata = await encryptionService.encrypt(request.metadata);
        }
        
        isEncrypted = 1;
      }
      
      const info = db.prepare(`
        INSERT INTO requests (brokerName, status, dateCreated, dateUpdated, userEmail, responseContent, metadata, encrypted)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        request.brokerName,
        request.status,
        now,
        now,
        request.userEmail,
        encryptedContent || null,
        encryptedMetadata || null,
        isEncrypted
      );
      
      const id = info.lastInsertRowid as number;
      
      return {
        ...request,
        id: id.toString(),
        dateCreated: now,
        dateUpdated: now
      };
    } catch (error) {
      console.error('Error creating request with encryption:', error);
      throw error;
    }
  },
  
  updateRequest: async (id: string, updates: Partial<DataRequest>): Promise<DataRequest | undefined> => {
    const currentRequest = dbService.getRequestById(id);
    if (!currentRequest) return undefined;
    
    const now = new Date().toISOString();
    const updateData = { ...updates, dateUpdated: now };
    
    try {
      // Check if encryption is enabled and we need to encrypt
      const { enabled, initialized } = dbService.getEncryptionStatus();
      
      // Get current encryption status for this record
      const record = db.prepare('SELECT encrypted FROM requests WHERE id = ?').get(parseInt(id, 10)) as { encrypted: number } | undefined;
      const currentlyEncrypted = record?.encrypted === 1;
      
      // Handle encryption of content if needed
      if ('responseContent' in updates && updates.responseContent !== undefined) {
        if (enabled && initialized) {
          updateData.responseContent = await encryptionService.encrypt(updates.responseContent);
          
          // Update encryption flag
          db.prepare('UPDATE requests SET encrypted = 1 WHERE id = ?').run(parseInt(id, 10));
        } else if (currentlyEncrypted) {
          // Content is already encrypted but encryption is now disabled
          console.warn('Cannot update encrypted content when encryption is disabled');
          delete updateData.responseContent;
        }
      }
      
      // Handle encryption of metadata if needed
      if ('metadata' in updates && updates.metadata !== undefined) {
        if (enabled && initialized) {
          updateData.metadata = await encryptionService.encrypt(updates.metadata);
          
          // Update encryption flag
          db.prepare('UPDATE requests SET encrypted = 1 WHERE id = ?').run(parseInt(id, 10));
        } else if (currentlyEncrypted) {
          // Metadata is already encrypted but encryption is now disabled
          console.warn('Cannot update encrypted metadata when encryption is disabled');
          delete updateData.metadata;
        }
      }
      
      // Build the dynamic update query
      const fields = Object.keys(updateData).filter(key => key !== 'id');
      if (fields.length === 0) return currentRequest;
      
      const setClause = fields.map(field => `${field} = ?`).join(', ');
      const values = fields.map(field => updateData[field as keyof typeof updateData]);
      
      db.prepare(`UPDATE requests SET ${setClause} WHERE id = ?`).run(...values, parseInt(id, 10));
      
      return dbService.getRequestById(id);
    } catch (error) {
      console.error('Error updating request with encryption:', error);
      throw error;
    }
  },
  
  deleteRequest: (id: string): boolean => {
    const info = db.prepare('DELETE FROM requests WHERE id = ?').run(parseInt(id, 10));
    return info.changes > 0;
  },
  
  // Data Broker operations
  getDataBrokers: (): DataBroker[] => {
    const rows = db.prepare('SELECT * FROM brokers').all() as BrokerRow[];
    return rows.map(row => ({
      id: row.id.toString(),
      name: row.name,
      optOutUrl: row.optOutUrl,
      category: row.category as BrokerCategory,
      optOutMethod: row.optOutMethod as 'form' | 'email' | 'api' | 'manual',
      dataTypes: JSON.parse(row.dataTypes || '[]'),
      difficulty: row.difficulty as 'easy' | 'medium' | 'hard',
      responseTime: row.responseTime || undefined,
      region: row.region ? JSON.parse(row.region) : undefined,
      privacyLawReference: row.privacyLawReference ? JSON.parse(row.privacyLawReference) : undefined,
      isPremium: !!row.isPremium
    }));
  },
  
  addDataBroker: (broker: Omit<DataBroker, 'id'>): DataBroker => {
    const dataTypes = JSON.stringify(broker.dataTypes || []);
    const region = broker.region ? JSON.stringify(broker.region) : null;
    const privacyLawReference = broker.privacyLawReference ? JSON.stringify(broker.privacyLawReference) : null;
    const isPremium = broker.isPremium ? 1 : 0;

    const info = db.prepare(`
      INSERT INTO brokers (
        name, optOutUrl, category, optOutMethod, dataTypes, 
        difficulty, responseTime, region, privacyLawReference, isPremium
      ) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      broker.name, 
      broker.optOutUrl,
      broker.category || 'other',
      broker.optOutMethod || 'form',
      dataTypes,
      broker.difficulty || 'medium',
      broker.responseTime || null,
      region,
      privacyLawReference,
      isPremium
    );
    
    const id = info.lastInsertRowid as number;
    
    return {
      ...broker,
      id: id.toString()
    };
  },
  
  deleteDataBroker: (id: string): boolean => {
    const info = db.prepare('DELETE FROM brokers WHERE id = ?').run(parseInt(id, 10));
    return info.changes > 0;
  },
  
  // Enhanced method for finding data brokers based on email
  findDataBrokersForEmail: async (email: string): Promise<DataBroker[]> => {
    console.log(`Finding data brokers for email: ${email}`);
    
    // Input validation - ensure email is a string and has a reasonable length
    if (typeof email !== 'string' || email.length > 256) {
      console.error('Invalid email input');
      return [];
    }
    
    // Get all brokers first
    const allBrokers = dbService.getDataBrokers();
    
    // Safely extract domain parts for intelligent broker matching
    const emailParts = email.split('@');
    if (emailParts.length !== 2) {
      console.error('Invalid email format');
      return [];
    }
    
    const domain = emailParts[1].toLowerCase();
    const username = emailParts[0].toLowerCase();
    
    // Extract domain components for better matching
    const domainParts = domain.split('.');
    const topLevelDomain = domainParts[domainParts.length - 1]; // com, org, etc.
    const secondLevelDomain = domainParts.length > 1 ? domainParts[domainParts.length - 2] : ''; // gmail, yahoo, etc.
    
    // Define hashCode function for deterministic selection
    const hashCode = (str: string): number => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0; // Convert to 32bit integer
      }
      return Math.abs(hash);
    };
    
    // Email hash for deterministic selection
    const emailHash = hashCode(email);
    
    // Score brokers based on relevance to the email and user profile
    const scoredBrokers = allBrokers.map(broker => {
      let score = 0;
      const brokerNameLower = broker.name.toLowerCase();
      
      // Direct match with domain parts scores higher
      if (brokerNameLower.includes(secondLevelDomain) && secondLevelDomain.length > 3) {
        score += 10;
      }
      
      // Initialize category weights
      const categoryWeights: Record<BrokerCategory, number> = {
        'people-search': 0,
        'credit-reporting': 0,
        'marketing': 0,
        'background-check': 0,
        'social-media': 0,
        'advertising': 0,
        'risk-management': 0,
        'insurance': 0,
        'financial': 0,
        'personal-data': 0,
        'other': 0
      };
      
      // Determine strongest categories based on email domain
      if (['gmail.com', 'outlook.com', 'hotmail.com', 'yahoo.com', 'aol.com', 'icloud.com'].includes(domain)) {
        // Personal email - prioritize people search, marketing and social media
        categoryWeights['people-search'] = 10;
        categoryWeights['marketing'] = 8;
        categoryWeights['social-media'] = 7;
        categoryWeights['advertising'] = 6;
      } else if (domain.includes('edu')) {
        // Educational email - prioritize academic and professional profiles
        categoryWeights['background-check'] = 10;
        categoryWeights['people-search'] = 8;
        categoryWeights['social-media'] = 6;
      } else if (['gov', 'mil'].some(d => domain.includes(d))) {
        // Government/military - careful selection with higher risk management
        categoryWeights['risk-management'] = 10;
        categoryWeights['background-check'] = 8;
        categoryWeights['people-search'] = 5;
      } else {
        // Likely business email - prioritize professional data brokers
        categoryWeights['financial'] = 9;
        categoryWeights['marketing'] = 8;
        categoryWeights['credit-reporting'] = 8;
        categoryWeights['background-check'] = 7;
        categoryWeights['risk-management'] = 7;
      }
      
      // Add score based on broker category priority for this email
      if (broker.category) {
        score += categoryWeights[broker.category] || 0;
      }
      
      // Add additional scores for premium brokers (for tiered offerings)
      if (broker.isPremium) {
        // Add a hash-based score to ensure consistent premium recommendation patterns
        score += (emailHash % 10 < 4) ? 5 : -2;
      }
      
      // Deterministic scoring based on username
      for (let i = 0; i < username.length; i += 2) {
        const char = username.charCodeAt(i);
        if (brokerNameLower.charCodeAt(0) % char === 0) {
          score += 2; // Deterministic score based on username
        }
      }
      
      // Add a consistent deterministic score component
      score += (emailHash + hashCode(broker.name)) % 10;
      
      return { broker, score };
    });
    
    // Sort by score (higher first) and normalize the results
    const sortedBrokers = scoredBrokers
      .sort((a, b) => b.score - a.score)
      .map(item => item.broker);
    
    // Adjust broker count based on email characteristics for more variety
    // This simulates the "matching strength" of different services
    // More professional, older, or complex emails usually have more traces
    let brokerCount = 8; // Base count
    
    if (username.length > 10) {
      brokerCount += 2; // Longer usernames usually have more history
    }
    
    if (username.includes('.') || username.includes('_')) {
      brokerCount += 1; // Formatted usernames tend to be professional
    }
    
    // Add email age simulation using hash (consistent but varied)
    const ageVariation = (emailHash % 7) - 3; // -3 to +3 variation
    brokerCount += ageVariation;
    
    // Ensure reasonable limits
    brokerCount = Math.max(5, Math.min(18, brokerCount));
    
    return sortedBrokers.slice(0, brokerCount);
  },

  // Encryption status operations
  getEncryptionStatus: (): { enabled: boolean; initialized: boolean } => {
    const status = db.prepare('SELECT enabled, initialized FROM encryption_status').get() as { 
      enabled: number; 
      initialized: number 
    };
    return { 
      enabled: status.enabled === 1, 
      initialized: status.initialized === 1 
    };
  },
  
  enableEncryption: async (enable: boolean): Promise<boolean> => {
    // If enabling encryption, make sure we have a key
    if (enable) {
      try {
        if (!await encryptionService.keyExists()) {
          await encryptionService.initialize();
        }
        
        db.prepare('UPDATE encryption_status SET enabled = 1, initialized = 1').run();
        console.log('Encryption enabled successfully');
        return true;
      } catch (error) {
        console.error('Failed to enable encryption:', error);
        return false;
      }
    } else {
      // Disabling encryption
      db.prepare('UPDATE encryption_status SET enabled = 0').run();
      console.log('Encryption disabled');
      return true;
    }
  },
  
  // Add a method to export the encryption key
  exportEncryptionKey: async (): Promise<string | null> => {
    try {
      if (!await encryptionService.keyExists()) {
        return null;
      }
      
      // Read the key file
      const keyData = await fs.promises.readFile(KEY_FILE_PATH);
      return keyData.toString('base64');
    } catch (error) {
      console.error('Failed to export encryption key:', error);
      return null;
    }
  },
  
  // Add a method to import an encryption key
  importEncryptionKey: async (keyBase64: string): Promise<boolean> => {
    try {
      const keyData = Buffer.from(keyBase64, 'base64');
      
      // Save the key
      await fs.promises.writeFile(KEY_FILE_PATH, keyData, { mode: 0o600 });
      
      // Re-initialize encryption
      await initializeEncryption();
      
      return true;
    } catch (error) {
      console.error('Failed to import encryption key:', error);
      return false;
    }
  }
}; 