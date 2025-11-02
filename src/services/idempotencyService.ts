/**
 * IDEMPOTENCY SERVICE
 * Prevents duplicate operations and handles race conditions
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '../utils/logger';

const IDEMPOTENCY_KEY_PREFIX = '@idempotency:';
const OPERATION_TTL_MS = 60 * 1000; // 60 seconds TTL for operations

interface IdempotencyRecord {
  operationId: string;
  timestamp: number;
  result?: any;
  status: 'pending' | 'completed' | 'failed';
}

class IdempotencyService {
  private pendingOperations: Map<string, Promise<any>> = new Map();
  
  /**
   * Generate a unique idempotency key for an operation
   */
  generateKey(
    userId: string,
    operation: string,
    ...params: any[]
  ): string {
    const paramString = params.map(p => String(p)).join(':');
    return `${IDEMPOTENCY_KEY_PREFIX}${userId}:${operation}:${paramString}`;
  }
  
  /**
   * Check if an operation is already in progress or recently completed
   */
  async checkOperation(key: string): Promise<IdempotencyRecord | null> {
    try {
      const stored = await AsyncStorage.getItem(key);
      if (!stored) return null;
      
      const record: IdempotencyRecord = JSON.parse(stored);
      
      // Check if operation has expired
      if (Date.now() - record.timestamp > OPERATION_TTL_MS) {
        await AsyncStorage.removeItem(key);
        return null;
      }
      
      return record;
    } catch (error) {
      logger.error('Failed to check idempotency record', { key, error });
      return null;
    }
  }
  
  /**
   * Start a new operation with idempotency protection
   */
  async startOperation(key: string, operationId: string): Promise<boolean> {
    // Check if already in progress
    const existing = await this.checkOperation(key);
    if (existing && existing.status === 'pending') {
      logger.warn('Operation already in progress', { key, operationId });
      return false;
    }
    
    // Mark as pending
    const record: IdempotencyRecord = {
      operationId,
      timestamp: Date.now(),
      status: 'pending'
    };
    
    try {
      await AsyncStorage.setItem(key, JSON.stringify(record));
      return true;
    } catch (error) {
      logger.error('Failed to start operation', { key, error });
      return false;
    }
  }
  
  /**
   * Complete an operation and store the result
   */
  async completeOperation(key: string, result?: any): Promise<void> {
    try {
      const record: IdempotencyRecord = {
        operationId: key,
        timestamp: Date.now(),
        result,
        status: 'completed'
      };
      
      await AsyncStorage.setItem(key, JSON.stringify(record));
    } catch (error) {
      logger.error('Failed to complete operation', { key, error });
    }
  }
  
  /**
   * Mark an operation as failed
   */
  async failOperation(key: string): Promise<void> {
    try {
      const record: IdempotencyRecord = {
        operationId: key,
        timestamp: Date.now(),
        status: 'failed'
      };
      
      await AsyncStorage.setItem(key, JSON.stringify(record));
    } catch (error) {
      logger.error('Failed to mark operation as failed', { key, error });
    }
  }
  
  /**
   * Execute an operation with idempotency protection
   */
  async executeWithIdempotency<T>(
    key: string,
    operation: () => Promise<T>
  ): Promise<T> {
    // Check if there's already a pending operation for this key
    if (this.pendingOperations.has(key)) {
      logger.debug('Waiting for pending operation', { key });
      return this.pendingOperations.get(key)!;
    }
    
    // Check if operation was recently completed
    const existing = await this.checkOperation(key);
    if (existing) {
      if (existing.status === 'completed' && existing.result !== undefined) {
        logger.debug('Returning cached result', { key });
        return existing.result;
      }
      
      if (existing.status === 'pending') {
        // Wait a bit and retry
        await new Promise(resolve => setTimeout(resolve, 100));
        return this.executeWithIdempotency(key, operation);
      }
    }
    
    // Start new operation
    const operationId = `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const canStart = await this.startOperation(key, operationId);
    
    if (!canStart) {
      // Another operation started before us, retry
      await new Promise(resolve => setTimeout(resolve, 100));
      return this.executeWithIdempotency(key, operation);
    }
    
    // Execute the operation
    const promise = operation()
      .then(async result => {
        await this.completeOperation(key, result);
        this.pendingOperations.delete(key);
        return result;
      })
      .catch(async error => {
        await this.failOperation(key);
        this.pendingOperations.delete(key);
        throw error;
      });
    
    this.pendingOperations.set(key, promise);
    return promise;
  }
  
  /**
   * Clean up expired idempotency records
   */
  async cleanup(): Promise<void> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const idempotencyKeys = allKeys.filter(k => k.startsWith(IDEMPOTENCY_KEY_PREFIX));
      
      for (const key of idempotencyKeys) {
        const record = await this.checkOperation(key);
        if (!record) {
          // Already expired and removed
          continue;
        }
      }
      
      logger.info('Idempotency cleanup completed', { keysChecked: idempotencyKeys.length });
    } catch (error) {
      logger.error('Failed to cleanup idempotency records', { error });
    }
  }
}

export const idempotencyService = new IdempotencyService();

/**
 * Decorator for adding idempotency to async functions
 */
export function withIdempotency(keyGenerator: (...args: any[]) => string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const key = keyGenerator.apply(this, args);
      return idempotencyService.executeWithIdempotency(
        key,
        () => originalMethod.apply(this, args)
      );
    };
    
    return descriptor;
  };
}