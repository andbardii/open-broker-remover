import { DataBroker, DataRequest, EmailConfig } from './types';
import { encryptionService } from '../server/encryption';
import { logger } from '../server/logger';
import path from 'path';
import fs from 'fs';
import sqlite3 from 'sqlite3';
import { Database, open } from 'sqlite';
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
        driver: Database
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
        optOutUrl TEXT NOT NULL,
        category TEXT NOT NULL,
        optOutMethod TEXT NOT NULL,
        dataTypes TEXT NOT NULL,
        difficulty TEXT NOT NULL,
        responseTime TEXT,
        region TEXT,
        privacyLawReference TEXT,
        isPremium INTEGER DEFAULT 0,
        hasUserData INTEGER DEFAULT 0,
        matchScore INTEGER
      );

      CREATE TABLE IF NOT EXISTS requests (
        id TEXT PRIMARY KEY,
        brokerName TEXT NOT NULL,
        status TEXT NOT NULL,
        userEmail TEXT NOT NULL,
        responseContent TEXT,
        metadata TEXT,
        dateCreated TEXT NOT NULL,
        dateUpdated TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_requests_broker ON requests(brokerName);
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
      const now = new Date().toISOString();
      const newBroker: DataBroker = {
        id: crypto.randomUUID(),
        name: broker.name || '',
        optOutUrl: broker.optOutUrl || '',
        category: broker.category || 'other',
        optOutMethod: broker.optOutMethod || 'form',
        dataTypes: broker.dataTypes || [],
        difficulty: broker.difficulty || 'medium',
        responseTime: broker.responseTime,
        region: broker.region,
        privacyLawReference: broker.privacyLawReference,
        isPremium: broker.isPremium || false,
        hasUserData: broker.hasUserData || false,
        matchScore: broker.matchScore
      };

      await this.db.run(
        'INSERT INTO data_brokers (id, name, optOutUrl, category, optOutMethod, dataTypes, difficulty, responseTime, region, privacyLawReference, isPremium, hasUserData, matchScore) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          newBroker.id,
          newBroker.name,
          newBroker.optOutUrl,
          newBroker.category,
          newBroker.optOutMethod,
          JSON.stringify(newBroker.dataTypes),
          newBroker.difficulty,
          newBroker.responseTime,
          newBroker.region ? JSON.stringify(newBroker.region) : null,
          newBroker.privacyLawReference ? JSON.stringify(newBroker.privacyLawReference) : null,
          Number(newBroker.isPremium),
          Number(newBroker.hasUserData),
          newBroker.matchScore
        ]
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
        'UPDATE data_brokers SET name = ?, optOutUrl = ?, category = ?, optOutMethod = ?, dataTypes = ?, difficulty = ?, responseTime = ?, region = ?, privacyLawReference = ?, isPremium = ?, hasUserData = ?, matchScore = ? WHERE id = ?',
        [
          updates.name,
          updates.optOutUrl,
          updates.category,
          updates.optOutMethod,
          updates.dataTypes ? JSON.stringify(updates.dataTypes) : null,
          updates.difficulty,
          updates.responseTime,
          updates.region ? JSON.stringify(updates.region) : null,
          updates.privacyLawReference ? JSON.stringify(updates.privacyLawReference) : null,
          updates.isPremium !== undefined ? Number(updates.isPremium) : null,
          updates.hasUserData !== undefined ? Number(updates.hasUserData) : null,
          updates.matchScore,
          id
        ]
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

  public async getRequests(page = 0, pageSize = 50): Promise<DataRequest[]> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      // Validate pagination parameters
      const validatedPage = this.validateNumericInput(page, Number.MAX_SAFE_INTEGER);
      const validatedPageSize = this.validateNumericInput(pageSize, this.MAX_PAGE_SIZE);

      const offset = validatedPage * validatedPageSize;

      const requests = await this.db.all<DataRequest[]>(
        'SELECT * FROM requests ORDER BY dateCreated DESC LIMIT ? OFFSET ?',
        [validatedPageSize, offset]
      );

      return requests || [];
    } catch (error) {
      logger.error('Error getting requests:', error);
      throw error;
    }
  }

  public async createRequest(request: Partial<DataRequest>): Promise<DataRequest> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const now = new Date().toISOString();
      const newRequest: DataRequest = {
        id: crypto.randomUUID(),
        brokerName: request.brokerName || '',
        status: request.status || 'pending',
        userEmail: request.userEmail || '',
        dateCreated: now,
        dateUpdated: now,
        responseContent: request.responseContent,
        metadata: request.metadata
      };

      await this.db.run(
        'INSERT INTO requests (id, brokerName, status, userEmail, responseContent, metadata, dateCreated, dateUpdated) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [newRequest.id, newRequest.brokerName, newRequest.status, newRequest.userEmail, newRequest.responseContent, newRequest.metadata, newRequest.dateCreated, newRequest.dateUpdated]
      );

      return newRequest;
    } catch (error) {
      logger.error('Error creating request:', error);
      throw error;
    }
  }

  public async createRequests(requests: Partial<DataRequest>[]): Promise<DataRequest[]> {
    // Validate input array
    const validatedRequests = this.validateArrayInput(requests);
    
    const results: DataRequest[] = [];
    
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

  public async updateRequest(id: string, updates: Partial<DataRequest>): Promise<boolean> {
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
