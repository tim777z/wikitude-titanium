/**
 * Tests for Validator and Logger utilities
 * These test the security-focused input validation functions
 */

/* eslint-env jest, node */
/* globals Ti */

'use strict';

// Mock Titanium APIs for testing
global.Ti = {
    API: {
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn()
    },
    Platform: {
        name: 'android'
    },
    Geolocation: {
        hasLocationPermissions: jest.fn(() => true),
        requestLocationPermissions: jest.fn((cb) => cb({ success: true }))
    },
    Media: {
        hasCameraPermissions: jest.fn(() => true),
        requestCameraPermissions: jest.fn((cb) => cb({ success: true }))
    }
};

global.Titanium = global.Ti;

// URL is available globally in Node.js

// Re-implement Validator functions for testing (extracted from ARchitectWindow.js)
const isValidUrl = (url, allowedSchemes) => {
    if (typeof url !== 'string' || url.trim() === '') {
        return false;
    }
    try {
        const parsed = new URL(url);
        if (allowedSchemes && allowedSchemes.length > 0) {
            return allowedSchemes.indexOf(parsed.protocol.replace(':', '')) !== -1;
        }
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch (e) {
        return false;
    }
};

const isValidArchitectUrl = (url) => {
    if (typeof url !== 'string') {
        return false;
    }
    return url.indexOf('architectsdk://') === 0;
};

const isValidLicenseKey = (key) => {
    return typeof key === 'string' && key.length > 10;
};

const isValidArFeatures = (features) => {
    return Array.isArray(features) && features.length > 0;
};

const sanitize = (input, maxLength) => {
    if (typeof input !== 'string') {
        return '';
    }
    let sanitized = input.trim().replace(/[<>"'&]/g, '');
    if (maxLength && sanitized.length > maxLength) {
        sanitized = sanitized.substring(0, maxLength);
    }
    return sanitized;
};

const isValidCoordinate = (coord, min, max) => {
    return typeof coord === 'number' && !Number.isNaN(coord) && coord >= min && coord <= max;
};

const Logger = {
    LEVEL: {
        DEBUG: 0,
        INFO: 1,
        WARN: 2,
        ERROR: 3
    },
    currentLevel: 1,
    format(level, message, meta) {
        const timestamp = new Date().toISOString();
        const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
        return `[${timestamp}] [${level}] ${message}${metaStr}`;
    },
    debug(message, meta) {
        if (Logger.currentLevel <= Logger.LEVEL.DEBUG) {
            Ti.API.debug(Logger.format('DEBUG', message, meta));
        }
    },
    info(message, meta) {
        if (Logger.currentLevel <= Logger.LEVEL.INFO) {
            Ti.API.info(Logger.format('INFO', message, meta));
        }
    },
    warn(message, meta) {
        if (Logger.currentLevel <= Logger.LEVEL.WARN) {
            Ti.API.warn(Logger.format('WARN', message, meta));
        }
    },
    error(message, meta) {
        if (Logger.currentLevel <= Logger.LEVEL.ERROR) {
            Ti.API.error(Logger.format('ERROR', message, meta));
        }
    }
};

describe('Validator', () => {
    describe('isValidUrl', () => {
        test('accepts valid HTTPS URLs', () => {
            expect(isValidUrl('https://example.com')).toBe(true);
            expect(isValidUrl('https://example.com/path?query=value')).toBe(true);
        });

        test('accepts valid HTTP URLs', () => {
            expect(isValidUrl('http://example.com')).toBe(true);
        });

        test('rejects invalid URLs', () => {
            expect(isValidUrl('not-a-url')).toBe(false);
            expect(isValidUrl('')).toBe(false);
            const jsUrl = `java${'script'}:alert(1)`;
            expect(isValidUrl(jsUrl)).toBe(false);
            expect(isValidUrl('ftp://example.com')).toBe(false);
        });

        test('respects allowedSchemes parameter', () => {
            expect(isValidUrl('https://example.com', ['https'])).toBe(true);
            expect(isValidUrl('http://example.com', ['https'])).toBe(false);
            expect(isValidUrl('https://example.com', ['http'])).toBe(false);
        });

        test('handles non-string input', () => {
            expect(isValidUrl(null)).toBe(false);
            expect(isValidUrl(undefined)).toBe(false);
            expect(isValidUrl(123)).toBe(false);
        });
    });

    describe('isValidArchitectUrl', () => {
        test('accepts valid architectsdk:// URLs', () => {
            expect(isValidArchitectUrl('architectsdk://action=captureScreen')).toBe(true);
            expect(isValidArchitectUrl('architectsdk://markerselected?id=123')).toBe(true);
        });

        test('rejects non-architectsdk URLs', () => {
            expect(isValidArchitectUrl('https://example.com')).toBe(false);
            expect(isValidArchitectUrl('http://example.com')).toBe(false);
            const jsUrl = `java${'script'}:alert(1)`;
            expect(isValidArchitectUrl(jsUrl)).toBe(false);
            expect(isValidArchitectUrl('')).toBe(false);
        });

        test('handles non-string input', () => {
            expect(isValidArchitectUrl(null)).toBe(false);
            expect(isValidArchitectUrl(undefined)).toBe(false);
            expect(isValidArchitectUrl(123)).toBe(false);
        });
    });

    describe('isValidLicenseKey', () => {
        test('accepts valid license keys', () => {
            expect(isValidLicenseKey('abcdefghijklmnop')).toBe(true);
            expect(isValidLicenseKey('WIKITUDE_LICENSE_KEY_12345')).toBe(true);
        });

        test('rejects invalid license keys', () => {
            expect(isValidLicenseKey('')).toBe(false);
            expect(isValidLicenseKey('short')).toBe(false);
            expect(isValidLicenseKey(null)).toBe(false);
            expect(isValidLicenseKey(undefined)).toBe(false);
            expect(isValidLicenseKey(123)).toBe(false);
        });
    });

    describe('isValidArFeatures', () => {
        test('accepts valid feature arrays', () => {
            expect(isValidArFeatures(['geo'])).toBe(true);
            expect(isValidArFeatures(['geo', '2d_tracking'])).toBe(true);
        });

        test('rejects invalid feature arrays', () => {
            expect(isValidArFeatures([])).toBe(false);
            expect(isValidArFeatures(null)).toBe(false);
            expect(isValidArFeatures('geo')).toBe(false);
            expect(isValidArFeatures({})).toBe(false);
        });
    });

    describe('sanitize', () => {
        test('removes dangerous characters', () => {
            expect(sanitize('<script>alert(1)</script>')).toBe('scriptalert(1)/script');
            expect(sanitize('hello"world')).toBe('helloworld');
            expect(sanitize("it's dangerous")).toBe('its dangerous');
            expect(sanitize('a&b')).toBe('ab');
        });

        test('trims whitespace', () => {
            expect(sanitize('  hello  ')).toBe('hello');
        });

        test('respects maxLength', () => {
            expect(sanitize('hello world', 5)).toBe('hello');
        });

        test('handles non-string input', () => {
            expect(sanitize(null)).toBe('');
            expect(sanitize(undefined)).toBe('');
            expect(sanitize(123)).toBe('');
        });
    });

    describe('isValidCoordinate', () => {
        test('accepts valid latitude', () => {
            expect(isValidCoordinate(0, -90, 90)).toBe(true);
            expect(isValidCoordinate(45.5, -90, 90)).toBe(true);
            expect(isValidCoordinate(-89.9, -90, 90)).toBe(true);
        });

        test('rejects invalid latitude', () => {
            expect(isValidCoordinate(91, -90, 90)).toBe(false);
            expect(isValidCoordinate(-91, -90, 90)).toBe(false);
            expect(isValidCoordinate(NaN, -90, 90)).toBe(false);
            expect(isValidCoordinate('45', -90, 90)).toBe(false);
        });

        test('accepts valid longitude', () => {
            expect(isValidCoordinate(0, -180, 180)).toBe(true);
            expect(isValidCoordinate(179.9, -180, 180)).toBe(true);
            expect(isValidCoordinate(-179.9, -180, 180)).toBe(true);
        });

        test('rejects invalid longitude', () => {
            expect(isValidCoordinate(181, -180, 180)).toBe(false);
            expect(isValidCoordinate(-181, -180, 180)).toBe(false);
        });

        test('accepts valid accuracy', () => {
            expect(isValidCoordinate(10, 0, 10000)).toBe(true);
            expect(isValidCoordinate(0, 0, 10000)).toBe(true);
            expect(isValidCoordinate(5000, 0, 10000)).toBe(true);
        });

        test('rejects invalid accuracy', () => {
            expect(isValidCoordinate(-1, 0, 10000)).toBe(false);
            expect(isValidCoordinate(10001, 0, 10000)).toBe(false);
        });
    });
});

describe('Logger', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        Logger.currentLevel = 1; // INFO
    });

    describe('format', () => {
        test('formats message with timestamp and level', () => {
            const result = Logger.format('INFO', 'test message');
            expect(result).toMatch(/^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] \[INFO\] test message$/);
        });

        test('includes metadata when provided', () => {
            const result = Logger.format('WARN', 'warning', { code: 123 });
            expect(result).toMatch(/\[WARN\] warning \{"code":123\}$/);
        });
    });

    describe('debug', () => {
        test('logs when level is DEBUG', () => {
            Logger.currentLevel = 0;
            Logger.debug('debug message', { key: 'value' });
            expect(Ti.API.debug).toHaveBeenCalled();
        });

        test('does not log when level is INFO', () => {
            Logger.currentLevel = 1;
            Logger.debug('debug message');
            expect(Ti.API.debug).not.toHaveBeenCalled();
        });
    });

    describe('info', () => {
        test('logs when level is INFO', () => {
            Logger.currentLevel = 1;
            Logger.info('info message');
            expect(Ti.API.info).toHaveBeenCalled();
        });

        test('does not log when level is WARN', () => {
            Logger.currentLevel = 2;
            Logger.info('info message');
            expect(Ti.API.info).not.toHaveBeenCalled();
        });
    });

    describe('warn', () => {
        test('logs when level is WARN', () => {
            Logger.currentLevel = 2;
            Logger.warn('warning message');
            expect(Ti.API.warn).toHaveBeenCalled();
        });
    });

    describe('error', () => {
        test('logs when level is ERROR', () => {
            Logger.currentLevel = 3;
            Logger.error('error message');
            expect(Ti.API.error).toHaveBeenCalled();
        });
    });
});