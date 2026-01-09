import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { Server } from 'http';
import { logger } from './logger.js';

// Mock logger
vi.mock('./logger.js', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

describe('Shutdown Utils', () => {
  let mockServer: Partial<Server>;
  let mockExit: ReturnType<typeof vi.fn>;
  let gracefulShutdown: (server: Server, signal: string) => void;
  let setupShutdownHandlers: (server: Server) => void;

  beforeEach(async () => {
    // Reset modules to clear module-level state (isShuttingDown flag)
    vi.resetModules();

    // Dynamically import to get fresh module state
    const shutdownModule = await import('./shutdown.js');
    gracefulShutdown = shutdownModule.gracefulShutdown;
    setupShutdownHandlers = shutdownModule.setupShutdownHandlers;

    // Mock process.exit to prevent actual exit during tests
    mockExit = vi.fn();
    process.exit = mockExit as unknown as typeof process.exit;

    // Mock process.on
    process.on = vi.fn() as typeof process.on;

    // Use fake timers
    vi.useFakeTimers();

    // Create mock server - don't call callback to prevent process.exit
    mockServer = {
      close: vi.fn(),
      closeAllConnections: vi.fn(),
    };
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('gracefulShutdown', () => {
    it('should log shutdown message', () => {
      gracefulShutdown(mockServer as Server, 'SIGINT');
      expect(logger.info).toHaveBeenCalledWith('SIGINT received. Shutting down gracefully...');
    });

    it('should call server.close', () => {
      gracefulShutdown(mockServer as Server, 'SIGTERM');
      expect(mockServer.close).toHaveBeenCalled();
    });

    it('should call closeAllConnections if available', () => {
      gracefulShutdown(mockServer as Server, 'SIGTERM');
      expect(mockServer.closeAllConnections).toHaveBeenCalled();
    });

    it('should not call closeAllConnections if not available', () => {
      const serverWithoutCloseAll = {
        close: vi.fn(),
      };
      gracefulShutdown(serverWithoutCloseAll as unknown as Server, 'SIGTERM');
      expect(serverWithoutCloseAll.close).toHaveBeenCalled();
    });
  });

  describe('setupShutdownHandlers', () => {
    it('should register SIGTERM handler', () => {
      setupShutdownHandlers(mockServer as Server);
      expect(process.on).toHaveBeenCalledWith('SIGTERM', expect.any(Function));
    });

    it('should register SIGINT handler', () => {
      setupShutdownHandlers(mockServer as Server);
      expect(process.on).toHaveBeenCalledWith('SIGINT', expect.any(Function));
    });

    it('should register both handlers', () => {
      setupShutdownHandlers(mockServer as Server);
      expect(process.on).toHaveBeenCalledTimes(2);
    });
  });
});
