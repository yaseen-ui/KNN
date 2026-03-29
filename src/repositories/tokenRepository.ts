import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Token } from '../types/index.js';
import config from '../config/config.js';
import { Logger } from '../middleware/index.js';

/**
 * Repository layer for token persistence using JSON files
 */
class TokenRepository {
  private tokensFilePath: string;

  constructor() {
    this.tokensFilePath = path.join(
      config.dataDir,
      config.tokensFile
    );
  }

  /**
   * Ensure data directory and files exist
   */
  private async ensureDir(): Promise<void> {
    try {
      await fs.mkdir(config.dataDir, { recursive: true });
    } catch (error) {
      Logger.error('Failed to create data directory', error);
      throw error;
    }
  }

  /**
   * Load all tokens from file
   */
  async loadAll(): Promise<Token[]> {
    try {
      await this.ensureDir();

      try {
        const data = await fs.readFile(this.tokensFilePath, 'utf-8');
        return JSON.parse(data);
      } catch (error: any) {
        // File doesn't exist yet, return empty array
        if (error.code === 'ENOENT') {
          Logger.info('Tokens file does not exist, starting with empty data');
          return [];
        }
        throw error;
      }
    } catch (error) {
      Logger.error('Failed to load tokens', error);
      throw new Error('Failed to load tokens from storage');
    }
  }

  /**
   * Save a single token
   */
  async save(value: string, metadata?: Record<string, unknown>): Promise<Token> {
    try {
      await this.ensureDir();

      const token: Token = {
        id: uuidv4(),
        value,
        metadata,
        createdAt: new Date().toISOString(),
      };

      const allTokens = await this.loadAll();
      allTokens.push(token);

      await fs.writeFile(
        this.tokensFilePath,
        JSON.stringify(allTokens, null, 2),
        'utf-8'
      );

      Logger.info('Token saved', { tokenId: token.id, value });
      return token;
    } catch (error) {
      Logger.error('Failed to save token', error);
      throw new Error('Failed to save token to storage');
    }
  }

  /**
   * Get token by ID
   */
  async getById(id: string): Promise<Token | null> {
    try {
      const allTokens = await this.loadAll();
      return allTokens.find((token) => token.id === id) || null;
    } catch (error) {
      Logger.error('Failed to get token by ID', error);
      throw new Error('Failed to retrieve token');
    }
  }

  /**
   * Get all tokens (optimized for search)
   */
  async getAll(): Promise<Token[]> {
    return this.loadAll();
  }

  /**
   * Update token metadata
   */
  async update(
    id: string,
    updates: Partial<Token>
  ): Promise<Token | null> {
    try {
      await this.ensureDir();

      const allTokens = await this.loadAll();
      const index = allTokens.findIndex((token) => token.id === id);

      if (index === -1) return null;

      const updatedToken = { ...allTokens[index], ...updates };
      allTokens[index] = updatedToken;

      await fs.writeFile(
        this.tokensFilePath,
        JSON.stringify(allTokens, null, 2),
        'utf-8'
      );

      Logger.info('Token updated', { tokenId: id });
      return updatedToken;
    } catch (error) {
      Logger.error('Failed to update token', error);
      throw new Error('Failed to update token');
    }
  }

  /**
   * Delete token by ID
   */
  async delete(id: string): Promise<boolean> {
    try {
      await this.ensureDir();

      const allTokens = await this.loadAll();
      const initialLength = allTokens.length;
      const filtered = allTokens.filter((token) => token.id !== id);

      if (filtered.length === initialLength) return false;

      await fs.writeFile(
        this.tokensFilePath,
        JSON.stringify(filtered, null, 2),
        'utf-8'
      );

      Logger.info('Token deleted', { tokenId: id });
      return true;
    } catch (error) {
      Logger.error('Failed to delete token', error);
      throw new Error('Failed to delete token');
    }
  }

  /**
   * Get count of all tokens
   */
  async count(): Promise<number> {
    try {
      const allTokens = await this.loadAll();
      return allTokens.length;
    } catch (error) {
      Logger.error('Failed to count tokens', error);
      throw new Error('Failed to count tokens');
    }
  }
}
// Export singleton instance
export const tokenRepository = new TokenRepository();
