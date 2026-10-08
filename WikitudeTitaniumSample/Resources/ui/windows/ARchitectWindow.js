/**
 * ARchitectWindow - Main AR View Controller for Wikitude SDK
 * 
 * Manages the AR view lifecycle, device capabilities, permissions,
 * and JavaScript bridge between native Titanium and ARchitect worlds.
 * 
 * @module ARchitectWindow
 * @requires util
 * @requires com.wikitude.ti
 * @exports ARchitectWindow
 */

/* eslint-env browser, es2021 */
/* globals Ti, Titanium, module, require */

'use strict';

var util = require('util');
var wikitude = require('com.wikitude.ti');

/**
 * Logger utility - replaces alert() with structured logging
 * @namespace Logger
 */
var Logger = {
    /**
     * Log levels
     * @readonly
     * @enum {number}
     */
    LEVEL: {
        DEBUG: 0,
        INFO: 1,
        WARN: 2,
        ERROR: 3
    },

    /**
     * Current log level (configurable via environment)
     * @type {number}
     */
    currentLevel: 1, // INFO default

    /**
     * Format log message with timestamp and level
     * @param {string} level - Log level name
     * @param {string} message - Log message
     * @param {Object} [meta] - Additional metadata
     * @returns {string} Formatted log entry
     */
    format: function(level, message, meta) {
        var timestamp = new Date().toISOString();
        var metaStr = meta ? ' ' + JSON.stringify(meta) : '';
        return '[' + timestamp + '] [' + level + '] ' + message + metaStr;
    },

    /**
     * Log debug message
     * @param {string} message - Message
     * @param {Object} [meta] - Metadata
     */
    debug: function(message, meta) {
        if (Logger.currentLevel <= Logger.LEVEL.DEBUG) {
            Ti.API.debug(Logger.format('DEBUG', message, meta));
        }
    },

    /**
     * Log info message
     * @param {string} message - Message
     * @param {Object} [meta] - Metadata
     */
    info: function(message, meta) {
        if (Logger.currentLevel <= Logger.LEVEL.INFO) {
            Ti.API.info(Logger.format('INFO', message, meta));
        }
    },

    /**
     * Log warning message
     * @param {string} message - Message
     * @param {Object} [meta] - Metadata
     */
    warn: function(message, meta) {
        if (Logger.currentLevel <= Logger.LEVEL.WARN) {
            Ti.API.warn(Logger.format('WARN', message, meta));
        }
    },

    /**
     * Log error message
     * @param {string} message - Message
     * @param {Object} [meta] - Metadata
     */
    error: function(message, meta) {
        if (Logger.currentLevel <= Logger.LEVEL.ERROR) {
            Ti.API.error(Logger.format('ERROR', message, meta));
        }
    }
};

/**
 * Input validation utilities
 * @namespace Validator
 */
var Validator = {
    /**
     * Validate URL format and scheme
     * @param {string} url - URL to validate
     * @param {string[]} [allowedSchemes] - Allowed URL schemes
     * @returns {boolean} True if valid
     */
    isValidUrl: function(url, allowedSchemes) {
        if (typeof url !== 'string' || url.trim() === '') {
            return false;
        }
        try {
            var parsed = new URL(url);
            if (allowedSchemes && allowedSchemes.length > 0) {
                return allowedSchemes.indexOf(parsed.protocol.replace(':', '')) !== -1;
            }
            return parsed.protocol === 'http:' || parsed.protocol === 'https:';
        } catch (e) {
            return false;
        }
    },

    /**
     * Validate architectsdk:// URL scheme
     * @param {string} url - URL to validate
     * @returns {boolean} True if valid architectsdk URL
     */
    isValidArchitectUrl: function(url) {
        if (typeof url !== 'string') {
            return false;
        }
        return url.indexOf('architectsdk://') === 0;
    },

    /**
     * Validate license key format
     * @param {string} key - License key
     * @returns {boolean} True if valid format
     */
    isValidLicenseKey: function(key) {
        return typeof key === 'string' && key.length > 10;
    },

    /**
     * Validate augmented reality features array
     * @param {Array} features - Features array
     * @returns {boolean} True if valid
     */
    isValidArFeatures: function(features) {
        return Array.isArray(features) && features.length > 0;
    },

    /**
     * Sanitize string input (prevent injection)
     * @param {string} input - Input string
     * @param {number} [maxLength] - Maximum length
     * @returns {string} Sanitized string
     */
    sanitize: function(input, maxLength) {
        if (typeof input !== 'string') {
            return '';
        }
        var sanitized = input.trim().replace(/[<>\"'&]/g, '');
        if (maxLength && sanitized.length > maxLength) {
            sanitized = sanitized.substring(0, maxLength);
        }
        return sanitized;
    },

    /**
     * Validate numeric coordinate
     * @param {number} coord - Coordinate value
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {boolean} True if valid
     */
    isValidCoordinate: function(coord, min, max) {
        return typeof coord === 'number' && !isNaN(coord) && coord >= min && coord <= max;
    }
};

/**
 * Allowed architectsdk:// actions for security
 * @readonly
 * @enum {string}
 */
var ALLOWED_ARCHITECT_ACTIONS = [
    'captureScreen',
    'markerselected'
];

/**
 * ARchitectWindow constructor
 * @constructor
 * @param {string} WikitudeLicenseKey - Wikitude SDK license key
 * @param {string} url - ARchitect world URL (http/https)
 * @returns {Object} Window instance
 * @throws {Error} If license key or URL invalid
 */
function ARchitectWindow(WikitudeLicenseKey, url) {

    // Input validation
    if (!Validator.isValidLicenseKey(WikitudeLicenseKey)) {
        throw new Error('Invalid Wikitude license key: must be a non-empty string');
    }

    if (!Validator.isValidUrl(url, ['http', 'https'])) {
        throw new Error('Invalid ARchitect world URL: must be a valid HTTP/HTTPS URL');
    }

    /* Member Variables */
    var _this = this;

    this.URL = Validator.sanitize(url, 2048);
    this.mainView = null;

    // Platform-specific window configuration
    if (Ti.Platform.name === 'android') {
        this.window = Ti.UI.createWindow({
            backgroundColor: 'transparent',
            navBarHidden: true,
            title: 'ARchitectWindow'
        });
    } else {
        this.window = Ti.UI.createWindow({
            backgroundColor: 'transparent',
            navBarHidden: true,
            title: 'ARchitectWindow',
            top: 20
        });
    }

    /**
     * Check device support for AR features
     * @param {Array} augmentedRealityFeatures - Required AR features
     * @returns {boolean} True if device supports features
     */
    this.window.isDeviceSupported = function(augmentedRealityFeatures) {
        if (!Validator.isValidArFeatures(augmentedRealityFeatures)) {
            Logger.error('Invalid AR features array provided to isDeviceSupported');
            return false;
        }

        var isDeviceSupported = wikitude.isDeviceSupported(augmentedRealityFeatures);

        if (isDeviceSupported) {
            _this.window.arview = wikitude.createWikitudeView({
                licenseKey: WikitudeLicenseKey,
                augmentedRealityFeatures: augmentedRealityFeatures,
                bottom: 0,
                left: 0,
                right: 0,
                top: 35
            });
            Logger.info('Wikitude AR view created', { features: augmentedRealityFeatures });
        } else {
            Logger.warn('Device does not support required AR features', { features: augmentedRealityFeatures });
        }

        return isDeviceSupported;
    };

    /**
     * Get missing feature message for unsupported devices
     * @param {Array} augmentedRealityFeatures - Required AR features
     * @returns {string} Human-readable message
     */
    this.window.getMissingFeatureMessage = function(augmentedRealityFeatures) {
        return wikitude.getMissingFeatureMessage(augmentedRealityFeatures);
    };

    this.window.LOCATION_LISTENER_ADDED = false;
    this.window.util = util;
    this.window.locationListener = this.locationListener;
    this.window.Logger = Logger;
    this.window.Validator = Validator;

    this.configureWindow(this.window);

    /* Lifecycle handling */
    this.window.addEventListener('open', this.onWindowOpen);
    this.window.addEventListener('close', this.onWindowClose);

    /* Android specific lifecycle handling */
    if (util.isAndroid()) {
        this.window.addEventListener('android:back', function() {
            this.close();
        });
    }

    /* ARchitect */
    this.window.loadArchitectWorldFromURL = this.loadArchitectWorldFromURL;

    /* ARchitect World callback handling */
    this.window.onURLWasInvoked = this.onURLWasInvoked;
    this.window.onArchitectWorldLoaded = this.onArchitectWorldLoaded;
    this.window.callJavaScript = this.callJavaScript;

    /* Runtime permission handling */
    this.window.requestLocationPermission = this.requestLocationPermission;
    this.window.requestCameraPermission = this.requestCameraPermission;

    return this.window;
}

/**
 * Execute JavaScript in ARchitect world
 * @param {string} jsSource - JavaScript code to execute
 */
ARchitectWindow.prototype.callJavaScript = function(jsSource) {
    if (typeof jsSource !== 'string' || jsSource.trim() === '') {
        Logger.warn('callJavaScript called with empty or invalid source');
        return;
    }
    // Sanitize to prevent injection
    var sanitized = Validator.sanitize(jsSource, 10000);
    this.arview.callJavaScript(sanitized);
};

/**
 * Configure window UI (header, buttons)
 * @param {Object} window - Titanium window
 */
ARchitectWindow.prototype.configureWindow = function(window) {
    var defaultFontSize = Ti.Platform.name === 'android' ? 8 : 16;

    var mainView = Ti.UI.createView({
        backgroundColor: '#ffffff',
        bottom: 0,
        left: 0,
        right: 0,
        top: 0
    });

    var headView = Ti.UI.createView({
        backgroundColor: '#f2f2f2',
        left: 0,
        right: 0,
        top: 0,
        height: 35
    });

    var backButton = Ti.UI.createButton({
        title: 'Back',
        font: {
            fontFamily: 'Arial',
            fontSize: defaultFontSize
        },
        left: 6,
        height: 30,
        width: 100
    });
    backButton.addEventListener('click', function() {
        window.close();
    });
    headView.add(backButton);

    var captureButton = Ti.UI.createButton({
        title: 'Capture',
        font: {
            fontFamily: 'Arial',
            fontSize: defaultFontSize
        },
        right: 6,
        height: 30,
        width: 100
    });

    captureButton.addEventListener('click', function() {
        var includeWebView = true;
        window.arview.captureScreen(includeWebView, null, {
            onSuccess: function(path) {
                var msg = path ? 'Screen captured to: ' + path : 'Screen captured to device image library';
                Logger.info(msg, { path: path });
            },
            onError: function(errorDescription) {
                Logger.error('Screen capture failed', { error: errorDescription });
            }
        });
    });
    headView.add(captureButton);

    mainView.add(headView);
    window.add(mainView);
};

/**
 * Create location listener for AR view
 * @param {Object} arview - Wikitude AR view
 * @returns {Function} Location callback
 */
ARchitectWindow.prototype.locationListener = function(arview) {
    return function(location) {
        if (!location || !location.coords) {
            Logger.warn('Invalid location object received');
            return;
        }

        // Validate coordinates
        var lat = location.coords.latitude;
        var lon = location.coords.longitude;
        var alt = location.coords.altitude;
        var acc = location.coords.accuracy;

        if (!Validator.isValidCoordinate(lat, -90, 90) ||
            !Validator.isValidCoordinate(lon, -180, 180) ||
            !Validator.isValidCoordinate(acc, 0, 10000)) {
            Logger.warn('Invalid coordinate values in location update', {
                latitude: lat,
                longitude: lon,
                accuracy: acc
            });
            return;
        }

        var locationInformation = {
            latitude: lat,
            longitude: lon,
            accuracy: acc,
            timestamp: location.coords.timestamp,
            altitudeAccuracy: location.coords.altitudeAccuracy
        };

        if (location.coords.altitude !== 0 && Validator.isValidCoordinate(alt, -10000, 10000)) {
            locationInformation.altitude = alt;
        }

        if (arview !== null) {
            arview.injectLocation(locationInformation);
            Logger.debug('Location injected into AR view', { lat: lat, lon: lon });
        }
    };
};

/**
 * Handle ARchitect world load result
 * @param {Object} event - Load event
 */
ARchitectWindow.prototype.onArchitectWorldLoaded = function(event) {
    if (event && event.result === true) {
        Logger.info('ARchitect world loaded successfully');
    } else {
        var errorMsg = (event && event.error) ? event.error : 'Unknown error';
        Logger.error('Failed to load ARchitect world', { error: errorMsg });
    }
};

/**
 * Load ARchitect world from URL with validation
 * @param {string} url - World URL
 * @param {Array} augmentedRealityFeatures - Required AR features
 * @param {Object} [startupConfiguration] - Optional startup config
 */
ARchitectWindow.prototype.loadArchitectWorldFromURL = function(url, augmentedRealityFeatures, startupConfiguration) {
    // Validate URL
    if (!Validator.isValidUrl(url, ['http', 'https'])) {
        Logger.error('Invalid world URL provided to loadArchitectWorldFromURL', { url: url });
        return;
    }

    if (!Validator.isValidArFeatures(augmentedRealityFeatures)) {
        Logger.error('Invalid AR features for world load');
        return;
    }

    var sanitizedUrl = Validator.sanitize(url, 2048);

    this.arview.addEventListener('WORLD_IS_LOADED', this.onArchitectWorldLoaded);
    this.arview.addEventListener('DEVICE_SENSOR_CALIBRATION_NEEDED', function() {
        Logger.info('Device sensor calibration needed');
    });
    this.arview.addEventListener('DEVICE_SENSOR_CALIBRATION_FINISHED', function() {
        Logger.info('Device sensor calibration finished');
    });

    Logger.info('Loading ARchitect world', { url: sanitizedUrl, features: augmentedRealityFeatures });
    this.arview.loadArchitectWorldFromURL(sanitizedUrl, augmentedRealityFeatures, startupConfiguration);
};

/**
 * Handle architectsdk:// URL scheme invocations from ARchitect world
 * @param {Object} event - URL invocation event
 */
ARchitectWindow.prototype.onURLWasInvoked = function(event) {
    if (!event || !event.url) {
        Logger.warn('onURLWasInvoked called with invalid event');
        return;
    }

    var url = event.url;

    // Validate architectsdk:// scheme
    if (!Validator.isValidArchitectUrl(url)) {
        Logger.warn('Non-architectsdk URL invoked, ignoring', { url: url });
        return;
    }

    Logger.debug('Architect URL invoked', { url: url });

    // Parse action from URL
    var actionMatch = url.match(/action=([^&]+)/);
    var action = actionMatch ? actionMatch[1] : null;

    // Check if action is allowed
    if (action && ALLOWED_ARCHITECT_ACTIONS.indexOf(action) === -1) {
        Logger.warn('Unauthorized architectsdk action attempted', { action: action, url: url });
        return;
    }

    // Handle marker selection
    if (url.indexOf('markerselected') !== -1) {
        Logger.info('Marker selected action received (not supported in samples)', { url: url });
        return;
    }

    // Handle screen capture
    if (action === 'captureScreen') {
        var includeWebView = true;
        this.captureScreen(includeWebView, null, {
            onSuccess: function(path) {
                var msg = path ? 'Screen captured to: ' + path : 'Screen captured to device image library';
                Logger.info(msg, { path: path });
            },
            onError: function(errorDescription) {
                Logger.error('Screen capture failed', { error: errorDescription });
            }
        });
    }
};

/**
 * Handle window open event - initialize AR view and permissions
 */
ARchitectWindow.prototype.onWindowOpen = function() {
    var _this = this;

    Logger.info('ARchitectWindow opened');

    if (_this.util.isAndroid()) {
        _this.requestLocationPermission(function() {
            _this.requestCameraPermission(function() {
                var children = _this.getChildren();
                if (children.length > 0 && _this.arview) {
                    children[0].add(_this.arview);
                    Logger.debug('AR view added to window');
                }
            });
        });
    } else {
        var children = _this.getChildren();
        if (children.length > 0 && _this.arview) {
            children[0].add(_this.arview);
            Logger.debug('AR view added to window (iOS)');
        }
    }

    // Register URL invocation handler
    if (_this.arview) {
        _this.arview.addEventListener('URL_WAS_INVOKED', _this.onURLWasInvoked);
    }

    if (_this.util.isAndroid()) {
        Titanium.Geolocation.distanceFilter = 1;
        var listener = _this.locationListener(_this.arview);

        var isOnOpen = true;

        if (isOnOpen) {
            Titanium.Geolocation.addEventListener('location', listener);
            _this.LOCATION_LISTENER_ADDED = true;
            Logger.debug('Location listener registered');
        }

        _this.activity.addEventListener('resume', function() {
            if (!_this.LOCATION_LISTENER_ADDED) {
                Titanium.Geolocation.addEventListener('location', listener);
                _this.LOCATION_LISTENER_ADDED = true;
                isOnOpen = false;
                Logger.debug('Location listener re-registered on resume');
            }
        });

        _this.activity.addEventListener('pause', function() {
            if (_this.LOCATION_LISTENER_ADDED) {
                Titanium.Geolocation.removeEventListener('location', listener);
                _this.LOCATION_LISTENER_ADDED = false;
                isOnOpen = false;
                Logger.debug('Location listener removed on pause');
            }
        });

        _this.activity.addEventListener('destroy', function() {
            if (_this.LOCATION_LISTENER_ADDED) {
                Titanium.Geolocation.removeEventListener('location', listener);
                _this.LOCATION_LISTENER_ADDED = false;
                isOnOpen = false;
                Logger.debug('Location listener removed on destroy');
            }
        });

        _this.activityListenerLoaded = true;
    }
};

/**
 * Handle window close event - cleanup
 */
ARchitectWindow.prototype.onWindowClose = function() {
    Logger.info('ARchitectWindow closing');

    if (this.arview !== null) {
        this.arview.removeEventListener('URL_WAS_INVOKED', this.onURLWasInvoked);

        var children = this.getChildren();
        if (children.length > 0) {
            children[0].remove(this.arview);
        }
        this.arview = null;
        Logger.debug('AR view cleaned up');
    }
};

/**
 * Request location permission with callback
 * @param {Function} callback - Callback on completion
 */
ARchitectWindow.prototype.requestLocationPermission = function(callback) {
    if (typeof callback !== 'function') {
        Logger.error('requestLocationPermission called without valid callback');
        return;
    }

    if (Ti.Geolocation.hasLocationPermissions()) {
        Logger.debug('Location permission already granted');
        callback();
    } else {
        Logger.info('Requesting location permission');
        Ti.Geolocation.requestLocationPermissions(function(e) {
            if (e.success) {
                Logger.info('Location permission granted');
            } else {
                Logger.warn('Location permission denied', { error: e.error });
            }
            callback();
        });
    }
};

/**
 * Request camera permission with callback
 * @param {Function} callback - Callback on completion
 */
ARchitectWindow.prototype.requestCameraPermission = function(callback) {
    if (typeof callback !== 'function') {
        Logger.error('requestCameraPermission called without valid callback');
        return;
    }

    if (Ti.Media.hasCameraPermissions()) {
        Logger.debug('Camera permission already granted');
        callback();
    } else {
        Logger.info('Requesting camera permission');
        Ti.Media.requestCameraPermissions(function(e) {
            if (e.success) {
                Logger.info('Camera permission granted');
            } else {
                Logger.warn('Camera permission denied', { error: e.error });
            }
            callback();
        });
    }
};

module.exports = ARchitectWindow;