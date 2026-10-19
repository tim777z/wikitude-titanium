/**
 * Tests for LocationUpdater module
 * Tests GPS location management and POI data generation
 */

/* eslint-env jest, node */

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
    }
};

global.Titanium = global.Ti;

// Re-implement LocationUpdater for testing (extracted from LocationUpdater.js)
const LocationUpdater = {
    architectWindow: null,
    poiData: [],

    setArchitectWindow(architectWindow) {
        LocationUpdater.architectWindow = architectWindow;
        if (architectWindow && typeof architectWindow.addEventListener === 'function') {
            architectWindow.addEventListener('WORLD_IS_LOADED', LocationUpdater.injectGeneratedPoiJsonData);
        }
    },

    onLocationUpdated(position) {
        if (!position || !position.coords) {
            return;
        }

        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        const altitude = position.coords.altitudeAccuracy !== null ? position.coords.altitude : -32768.0;
        const placesAmount = 10;
        LocationUpdater.poiData = [];

        // creates dummy poi-data around given lat/lon
        for (let i = 0; i < placesAmount; i++) {
            LocationUpdater.poiData.push({
                id: (i + 1),
                longitude: longitude + 0.001 * (5 - LocationUpdater.getRandomInt(1, 10)),
                latitude: latitude + 0.001 * (5 - LocationUpdater.getRandomInt(1, 10)),
                description: `This is the description of POI#${i + 1}`,
                altitude,
                name: `POI#${i + 1}`
            });
        }
    },

    injectGeneratedPoiJsonData() {
        if (LocationUpdater.poiData.length > 0 && LocationUpdater.architectWindow) {
            const jsSource = `World.loadPoisFromJsonData(${JSON.stringify(LocationUpdater.poiData)});`;
            if (typeof LocationUpdater.architectWindow.callJavaScript === 'function') {
                LocationUpdater.architectWindow.callJavaScript(jsSource);
            }
        }
    },

    getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
};

describe('LocationUpdater', () => {
    let mockArchitectWindow;

    beforeEach(() => {
        jest.clearAllMocks();
        LocationUpdater.poiData = [];
        LocationUpdater.architectWindow = null;

        mockArchitectWindow = {
            addEventListener: jest.fn(),
            callJavaScript: jest.fn()
        };
    });

    describe('setArchitectWindow', () => {
        test('stores architectWindow reference', () => {
            LocationUpdater.setArchitectWindow(mockArchitectWindow);
            expect(LocationUpdater.architectWindow).toBe(mockArchitectWindow);
        });

        test('registers WORLD_IS_LOADED event listener', () => {
            LocationUpdater.setArchitectWindow(mockArchitectWindow);
            expect(mockArchitectWindow.addEventListener).toHaveBeenCalledWith(
                'WORLD_IS_LOADED',
                LocationUpdater.injectGeneratedPoiJsonData
            );
        });

        test('handles null architectWindow gracefully', () => {
            expect(() => LocationUpdater.setArchitectWindow(null)).not.toThrow();
            expect(LocationUpdater.architectWindow).toBeNull();
        });

        test('handles architectWindow without addEventListener', () => {
            const invalidWindow = {};
            expect(() => LocationUpdater.setArchitectWindow(invalidWindow)).not.toThrow();
        });
    });

    describe('onLocationUpdated', () => {
        test('generates POI data for valid position', () => {
            const position = {
                coords: {
                    latitude: 47.123456,
                    longitude: 11.123456,
                    altitude: 500,
                    altitudeAccuracy: 10
                }
            };

            LocationUpdater.onLocationUpdated(position);

            expect(LocationUpdater.poiData).toHaveLength(10);
            expect(LocationUpdater.poiData[0]).toHaveProperty('id', 1);
            expect(LocationUpdater.poiData[0]).toHaveProperty('name', 'POI#1');
            expect(LocationUpdater.poiData[0]).toHaveProperty('description');
            expect(LocationUpdater.poiData[0]).toHaveProperty('latitude');
            expect(LocationUpdater.poiData[0]).toHaveProperty('longitude');
            expect(LocationUpdater.poiData[0]).toHaveProperty('altitude', 500);
        });

        test('uses default altitude when altitudeAccuracy is null', () => {
            const position = {
                coords: {
                    latitude: 47.123456,
                    longitude: 11.123456,
                    altitude: 500,
                    altitudeAccuracy: null
                }
            };

            LocationUpdater.onLocationUpdated(position);

            expect(LocationUpdater.poiData[0].altitude).toBe(-32768.0);
        });

        test('handles missing position gracefully', () => {
            expect(() => LocationUpdater.onLocationUpdated(null)).not.toThrow();
            expect(LocationUpdater.poiData).toHaveLength(0);
        });

        test('handles position without coords gracefully', () => {
            expect(() => LocationUpdater.onLocationUpdated({})).not.toThrow();
            expect(LocationUpdater.poiData).toHaveLength(0);
        });

        test('generates POIs around the given coordinates', () => {
            const position = {
                coords: {
                    latitude: 47.0,
                    longitude: 11.0,
                    altitudeAccuracy: 10
                }
            };

            LocationUpdater.onLocationUpdated(position);

            // All POIs should be within ~0.005 degrees of the center
            LocationUpdater.poiData.forEach(poi => {
                expect(poi.latitude).toBeGreaterThanOrEqual(46.995);
                expect(poi.latitude).toBeLessThanOrEqual(47.005);
                expect(poi.longitude).toBeGreaterThanOrEqual(10.995);
                expect(poi.longitude).toBeLessThanOrEqual(11.005);
            });
        });

        test('generates unique IDs for each POI', () => {
            const position = {
                coords: {
                    latitude: 47.0,
                    longitude: 11.0,
                    altitudeAccuracy: 10
                }
            };

            LocationUpdater.onLocationUpdated(position);

            const ids = LocationUpdater.poiData.map(poi => poi.id);
            expect(new Set(ids).size).toBe(10);
        });
    });

    describe('injectGeneratedPoiJsonData', () => {
        test('calls callJavaScript with POI data when available', () => {
            LocationUpdater.architectWindow = mockArchitectWindow;
            LocationUpdater.poiData = [{ id: 1, name: 'Test POI' }];

            LocationUpdater.injectGeneratedPoiJsonData();

            expect(mockArchitectWindow.callJavaScript).toHaveBeenCalledWith(
                'World.loadPoisFromJsonData([{"id":1,"name":"Test POI"}]);'
            );
        });

        test('does nothing when no POI data', () => {
            LocationUpdater.architectWindow = mockArchitectWindow;
            LocationUpdater.poiData = [];

            LocationUpdater.injectGeneratedPoiJsonData();

            expect(mockArchitectWindow.callJavaScript).not.toHaveBeenCalled();
        });

        test('does nothing when no architectWindow', () => {
            LocationUpdater.architectWindow = null;
            LocationUpdater.poiData = [{ id: 1 }];

            LocationUpdater.injectGeneratedPoiJsonData();

            expect(mockArchitectWindow.callJavaScript).not.toHaveBeenCalled();
        });

        test('does nothing when architectWindow lacks callJavaScript', () => {
            LocationUpdater.architectWindow = {};
            LocationUpdater.poiData = [{ id: 1 }];

            expect(() => LocationUpdater.injectGeneratedPoiJsonData()).not.toThrow();
        });
    });

    describe('getRandomInt', () => {
        test('returns integer within range', () => {
            for (let i = 0; i < 100; i++) {
                const result = LocationUpdater.getRandomInt(1, 10);
                expect(result).toBeGreaterThanOrEqual(1);
                expect(result).toBeLessThanOrEqual(10);
                expect(Number.isInteger(result)).toBe(true);
            }
        });

        test('handles min equals max', () => {
            expect(LocationUpdater.getRandomInt(5, 5)).toBe(5);
        });

        test('handles negative ranges', () => {
            for (let i = 0; i < 100; i++) {
                const result = LocationUpdater.getRandomInt(-10, -1);
                expect(result).toBeGreaterThanOrEqual(-10);
                expect(result).toBeLessThanOrEqual(-1);
            }
        });
    });
});