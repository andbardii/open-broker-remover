import { DataBroker, Request, EmailConfig } from './types';
import { encryptionService } from '../server/encryption';
import { logger } from '../server/logger';
import path from 'path';
import fs from 'fs';
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import { config } from '../server/config';

class DatabaseService {
  private db: Database | null = null;
  private readonly MAX_BATCH_SIZE = 1000;
  private readonly MAX_RESULTS = 10000;
  private readonly MAX_PAGE_SIZE = 100;

  constructor() {
    this.initializeDatabase();
  }

  private validateNumericInput(value: number, max: number): number {
    const parsed = parseInt(String(value), 10);
    if (!Number.isFinite(parsed) || parsed < 0 || parsed > max) {
      throw new Error(`Invalid numeric input: must be an integer between 0 and ${max}`);
    }
    return parsed;
  }

  private validateArrayInput<T>(arr: T[]): T[] {
    if (!Array.isArray(arr) || arr.length > this.MAX_BATCH_SIZE) {
      throw new Error(`Invalid array input: must be an array with length <= ${this.MAX_BATCH_SIZE}`);
    }
    return arr;
  }

  private async initializeDatabase() {
    try {
      const dbPath = path.join(config.storage.dataDir, 'open-broker-remover.db');
      
      // Ensure data directory exists
      if (!fs.existsSync(config.storage.dataDir)) {
        fs.mkdirSync(config.storage.dataDir, { recursive: true });
      }

      this.db = await open({
        filename: dbPath,
        driver: sqlite3.Database
      });

      // Enable WAL mode for better concurrency
      await this.db.run('PRAGMA journal_mode = WAL');
      
      // Enable foreign keys
      await this.db.run('PRAGMA foreign_keys = ON');

      // Create tables if they don't exist
      await this.createTables();

      logger.info('Database initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize database:', error);
      throw error;
    }
  }

  private async createTables() {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS data_brokers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        url TEXT NOT NULL,
        optOutUrl TEXT,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS requests (
        id TEXT PRIMARY KEY,
        brokerId TEXT NOT NULL,
        status TEXT NOT NULL,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL,
        FOREIGN KEY (brokerId) REFERENCES data_brokers(id)
      );

      CREATE INDEX IF NOT EXISTS idx_requests_broker ON requests(brokerId);
      CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
    `);
  }

  public async getDataBrokers(page = 0, pageSize = 50): Promise<DataBroker[]> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      // Validate pagination parameters
      const validatedPage = this.validateNumericInput(page, Number.MAX_SAFE_INTEGER);
      const validatedPageSize = this.validateNumericInput(pageSize, this.MAX_PAGE_SIZE);

      const offset = validatedPage * validatedPageSize;
      
      const brokers = await this.db.all<DataBroker[]>(
        'SELECT * FROM data_brokers ORDER BY createdAt DESC LIMIT ? OFFSET ?',
        [validatedPageSize, offset]
      );

      return brokers || [];
    } catch (error) {
      logger.error('Error getting data brokers:', error);
      throw error;
    }
  }

  public async addDataBroker(broker: Partial<DataBroker>): Promise<DataBroker> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const now = Date.now();
      const newBroker: DataBroker = {
        id: crypto.randomUUID(),
        name: broker.name || '',
        url: broker.url || '',
        optOutUrl: broker.optOutUrl || '',
        createdAt: now,
        updatedAt: now
      };

      await this.db.run(
        'INSERT INTO data_brokers (id, name, url, optOutUrl, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
        [newBroker.id, newBroker.name, newBroker.url, newBroker.optOutUrl, newBroker.createdAt, newBroker.updatedAt]
      );

      return newBroker;
    } catch (error) {
      logger.error('Error adding data broker:', error);
      throw error;
    }
  }

  public async addDataBrokers(brokers: Partial<DataBroker>[]): Promise<DataBroker[]> {
    // Validate input array
    const validatedBrokers = this.validateArrayInput(brokers);
    
    const results: DataBroker[] = [];
    
    // Process in chunks to prevent memory issues
    const chunkSize = 100;
    for (let i = 0; i < validatedBrokers.length; i += chunkSize) {
      const chunk = validatedBrokers.slice(i, i + chunkSize);
      const promises = chunk.map(broker => this.addDataBroker(broker));
      const chunkResults = await Promise.all(promises);
      results.push(...chunkResults);
    }

    return results;
  }

  public async updateDataBroker(id: string, updates: Partial<DataBroker>): Promise<boolean> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const result = await this.db.run(
        'UPDATE data_brokers SET name = ?, url = ?, optOutUrl = ?, updatedAt = ? WHERE id = ?',
        [updates.name, updates.url, updates.optOutUrl, Date.now(), id]
      );

      return result.changes > 0;
    } catch (error) {
      logger.error('Error updating data broker:', error);
      throw error;
    }
  }

  public async deleteDataBroker(id: string): Promise<boolean> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const result = await this.db.run('DELETE FROM data_brokers WHERE id = ?', [id]);
      return result.changes > 0;
    } catch (error) {
      logger.error('Error deleting data broker:', error);
      throw error;
    }
  }

  public async getRequests(page = 0, pageSize = 50): Promise<Request[]> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      // Validate pagination parameters
      const validatedPage = this.validateNumericInput(page, Number.MAX_SAFE_INTEGER);
      const validatedPageSize = this.validateNumericInput(pageSize, this.MAX_PAGE_SIZE);

      const offset = validatedPage * validatedPageSize;

      const requests = await this.db.all<Request[]>(
        'SELECT * FROM requests ORDER BY createdAt DESC LIMIT ? OFFSET ?',
        [validatedPageSize, offset]
      );

      return requests || [];
    } catch (error) {
      logger.error('Error getting requests:', error);
      throw error;
    }
  }

  public async createRequest(request: Partial<Request>): Promise<Request> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const now = Date.now();
      const newRequest: Request = {
        id: crypto.randomUUID(),
        brokerId: request.brokerId || '',
        status: request.status || 'pending',
        createdAt: now,
        updatedAt: now
      };

      await this.db.run(
        'INSERT INTO requests (id, brokerId, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)',
        [newRequest.id, newRequest.brokerId, newRequest.status, newRequest.createdAt, newRequest.updatedAt]
      );

      return newRequest;
    } catch (error) {
      logger.error('Error creating request:', error);
      throw error;
    }
  }

  public async createRequests(requests: Partial<Request>[]): Promise<Request[]> {
    // Validate input array
    const validatedRequests = this.validateArrayInput(requests);
    
    const results: Request[] = [];
    
    // Process in chunks to prevent memory issues
    const chunkSize = 100;
    for (let i = 0; i < validatedRequests.length; i += chunkSize) {
      const chunk = validatedRequests.slice(i, i + chunkSize);
      const promises = chunk.map(request => this.createRequest(request));
      const chunkResults = await Promise.all(promises);
      results.push(...chunkResults);
    }

    return results;
  }

  public async updateRequest(id: string, updates: Partial<Request>): Promise<boolean> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const result = await this.db.run(
        'UPDATE requests SET status = ?, updatedAt = ? WHERE id = ?',
        [updates.status, Date.now(), id]
      );

      return result.changes > 0;
    } catch (error) {
      logger.error('Error updating request:', error);
      throw error;
    }
  }

  public async deleteRequest(id: string): Promise<boolean> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const result = await this.db.run('DELETE FROM requests WHERE id = ?', [id]);
      return result.changes > 0;
    } catch (error) {
      logger.error('Error deleting request:', error);
      throw error;
    }
  }

  public async close(): Promise<void> {
    if (this.db) {
      await this.db.close();
      this.db = null;
    }
  }
}

export const dbService = new DatabaseService();
