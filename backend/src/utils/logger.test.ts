import { describe, it, expect, beforeEach, vi } from 'vitest';
import { logger } from './logger.js';

describe('Logger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should export a logger instance', () => {
    expect(logger).toBeDefined();
    expect(typeof logger).toBe('object');
  });

  it('should have info method', () => {
    expect(typeof logger.info).toBe('function');
  });

  it('should have error method', () => {
    expect(typeof logger.error).toBe('function');
  });

  it('should have warn method', () => {
    expect(typeof logger.warn).toBe('function');
  });

  it('should have debug method', () => {
    expect(typeof logger.debug).toBe('function');
  });

  it('should be able to log info messages', () => {
    expect(() => logger.info('Test message')).not.toThrow();
  });

  it('should be able to log error messages', () => {
    expect(() => logger.error('Test error')).not.toThrow();
  });

  it('should be able to log with context', () => {
    expect(() => logger.info({ key: 'value' }, 'Test message')).not.toThrow();
  });
});
