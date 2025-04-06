import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { DataBroker, DataRequest } from '../lib/types';

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
}

// Ensure data directory exists
const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
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
      metadata TEXT
    )
  `);

  // Create brokers table
  db.exec(`
    CREATE TABLE IF NOT EXISTS brokers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      optOutUrl TEXT NOT NULL
    )
  `);

  // Create indices for faster searches
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_requests_userEmail ON requests(userEmail);
    CREATE INDEX IF NOT EXISTS idx_requests_brokerName ON requests(brokerName);
    CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
    CREATE INDEX IF NOT EXISTS idx_brokers_name ON brokers(name);
  `);
};

// Initialize the database
initDatabase();

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
  getRequests: (): DataRequest[] => {
    const rows = db.prepare('SELECT * FROM requests').all() as RequestRow[];
    return rows.map(row => ({
      ...row,
      id: row.id.toString()
    }));
  },
  
  getRequestById: (id: string): DataRequest | undefined => {
    const row = db.prepare('SELECT * FROM requests WHERE id = ?').get(parseInt(id, 10)) as RequestRow | undefined;
    if (!row) return undefined;
    
    return {
      ...row,
      id: row.id.toString()
    };
  },
  
  addRequest: (brokerName: string, status: 'pending' | 'sent' | 'responded' | 'completed', userEmail: string): number => {
    const now = new Date().toISOString();
    
    const info = db.prepare(
      'INSERT INTO requests (brokerName, status, dateCreated, dateUpdated, userEmail) VALUES (?, ?, ?, ?, ?)'
    ).run(brokerName, status, now, now, userEmail);
    
    return info.lastInsertRowid as number;
  },
  
  createRequest: (request: Omit<DataRequest, 'id' | 'dateCreated' | 'dateUpdated'>): DataRequest => {
    const now = new Date().toISOString();
    
    const info = db.prepare(`
      INSERT INTO requests (brokerName, status, dateCreated, dateUpdated, userEmail, responseContent, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      request.brokerName,
      request.status,
      now,
      now,
      request.userEmail,
      request.responseContent || null,
      request.metadata || null
    );
    
    const id = info.lastInsertRowid as number;
    
    return {
      ...request,
      id: id.toString(),
      dateCreated: now,
      dateUpdated: now
    };
  },
  
  updateRequest: (id: string, updates: Partial<DataRequest>): DataRequest | undefined => {
    const currentRequest = dbService.getRequestById(id);
    if (!currentRequest) return undefined;
    
    const now = new Date().toISOString();
    const updateData = { ...updates, dateUpdated: now };
    
    // Build the dynamic update query
    const fields = Object.keys(updateData).filter(key => key !== 'id');
    if (fields.length === 0) return currentRequest;
    
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const values = fields.map(field => updateData[field as keyof typeof updateData]);
    
    db.prepare(`UPDATE requests SET ${setClause} WHERE id = ?`).run(...values, parseInt(id, 10));
    
    return dbService.getRequestById(id);
  },
  
  deleteRequest: (id: string): boolean => {
    const info = db.prepare('DELETE FROM requests WHERE id = ?').run(parseInt(id, 10));
    return info.changes > 0;
  },
  
  // Data Broker operations
  getDataBrokers: (): DataBroker[] => {
    const rows = db.prepare('SELECT * FROM brokers').all() as BrokerRow[];
    return rows.map(row => ({
      ...row,
      id: row.id.toString()
    }));
  },
  
  addDataBroker: (broker: Omit<DataBroker, 'id'>): DataBroker => {
    const info = db.prepare('INSERT INTO brokers (name, optOutUrl) VALUES (?, ?)')
      .run(broker.name, broker.optOutUrl);
    
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
  
  findDataBrokersForEmail: (email: string): DataBroker[] => {
    console.log(`Finding data brokers for email: ${email}`);
    
    // Input validation - ensure email is a string and has a reasonable length
    if (typeof email !== 'string' || email.length > 256) {
      console.error('Invalid email input');
      return [];
    }
    
    // Get all brokers first
    const allBrokers = dbService.getDataBrokers();
    
    // Safely extract domain parts for filtering
    const emailParts = email.split('@');
    if (emailParts.length !== 2) {
      console.error('Invalid email format');
      return [];
    }
    
    const domain = emailParts[1];
    // Limit the number of parts to prevent excessive processing
    const domainParts = domain.split('.').slice(0, 3);
    
    // Create a deterministic selection algorithm based on the email hash
    // This ensures same email always returns same brokers
    
    // Deterministic hash function using a fixed algorithm
    const generateHash = (input: string): number => {
      let hash = 0;
      const MAX_CHARS = Math.min(input.length, 100); // Limit to prevent excessive looping
      
      for (let i = 0; i < MAX_CHARS; i++) {
        const char = input.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
      }
      
      return Math.abs(hash);
    };
    
    // Compute hash once
    const emailHash = generateHash(email);
    
    // Filter brokers deterministically
    const filteredBrokers = allBrokers.filter((broker, index) => {
      // Match broker if name contains part of domain
      const domainMatch = domainParts.some(part => 
        part.length > 2 && broker.name.toLowerCase().includes(part.toLowerCase())
      );
      
      // Use hash + index for deterministic but seemingly random selection
      // Different from previous Math.random approach which was non-deterministic
      const hashMatch = (emailHash + index) % 5 === 0;
      
      return domainMatch || hashMatch;
    });
    
    // Deterministic selection - take first 5-10 results based on hash
    const count = (emailHash % 6) + 5; // Returns 5-10 deterministically
    return filteredBrokers.slice(0, Math.min(count, filteredBrokers.length));
  }
}; 