/**
 * Tests for ModelStorage module
 * Tests data persistence layer and sample configuration
 */

/* eslint-env jest, node */

'use strict';

// Mock the ModelStorage data (extracted from ModelStorage.js)
const modelStorage = [
    {
        "windowTitle": "Client Recognition",
        "samples": [
            {
                "title": "Image on Target",
                "path": "1_ClientRecognition_1_ImageOnTarget/index.html",
                "requiredFeatures": ["2d_tracking"],
                "startupConfiguration": { "camera_position": "back" }
            },
            {
                "title": "Multiple Targets",
                "path": "1_ClientRecognition_2_MultipleTargets/index.html",
                "requiredFeatures": ["2d_tracking"],
                "startupConfiguration": { "camera_position": "back" }
            },
            {
                "title": "Extended Tracking",
                "path": "1_ClientRecognition_3_ExtendedTracking/index.html",
                "requiredFeatures": ["2d_tracking"],
                "startupConfiguration": { "camera_position": "back" }
            },
            {
                "title": "Interactivity",
                "path": "1_ClientRecognition_4_Interactivity/index.html",
                "requiredFeatures": ["2d_tracking"],
                "startupConfiguration": { "camera_position": "back" }
            },
            {
                "title": "Html Drawable",
                "path": "1_ClientRecognition_5_HtmlDrawable/index.html",
                "requiredFeatures": ["2d_tracking"],
                "startupConfiguration": { "camera_position": "back" }
            },
            {
                "title": "Bonus: Sparkles",
                "path": "1_ClientRecognition_6_Bonus-Sparkles/index.html",
                "requiredFeatures": ["2d_tracking"],
                "startupConfiguration": { "camera_position": "back" }
            },
            {
                "title": "Bonus: Distance To Target",
                "path": "1_ClientRecognition_7_Bonus-DistanceToTarget/index.html",
                "requiredFeatures": ["2d_tracking"],
                "startupConfiguration": { "camera_position": "back" }
            }
        ]
    },
    {
        "windowTitle": "Cloud Recognition",
        "samples": [
            {
                "title": "Basic Recognition On: Click",
                "path": "2_CloudRecognition_1_BasicRecognitionOn-Click/index.html",
                "requiredFeatures": ["2d_tracking"],
                "startupConfiguration": { "camera_position": "back" }
            },
            {
                "title": "Continuous Recognition Vs On: Click",
                "path": "2_CloudRecognition_2_ContinuousRecognitionVsOn-Click/index.html",
                "requiredFeatures": ["2d_tracking"],
                "startupConfiguration": { "camera_position": "back" }
            },
            {
                "title": "Using Response Metainformation",
                "path": "2_CloudRecognition_3_UsingMetainformationInTheResponse/index.html",
                "requiredFeatures": ["2d_tracking"],
                "startupConfiguration": { "camera_position": "back" }
            }
        ]
    },
    {
        "windowTitle": "3D Models",
        "samples": [
            {
                "title": "3D Model on Target",
                "path": "3_3dModels_1_3dModelOnTarget/index.html",
                "requiredFeatures": ["2d_tracking"],
                "startupConfiguration": { "camera_position": "back" }
            },
            {
                "title": "Appearing Animation",
                "path": "3_3dModels_2_AppearingAnimation/index.html",
                "requiredFeatures": ["2d_tracking"],
                "startupConfiguration": { "camera_position": "back" }
            },
            {
                "title": "Interactivity",
                "path": "3_3dModels_3_Interactivity/index.html",
                "requiredFeatures": ["2d_tracking"],
                "startupConfiguration": { "camera_position": "back" }
            },
            {
                "title": "Snap To Screen",
                "path": "3_3dModels_4_SnapToScreen/index.html",
                "requiredFeatures": ["2d_tracking"],
                "startupConfiguration": { "camera_position": "back" }
            },
            {
                "title": "Animated Model Parts",
                "path": "3_3dModels_5_AnimatedModelParts/index.html",
                "requiredFeatures": ["2d_tracking"],
                "startupConfiguration": { "camera_position": "back" }
            },
            {
                "title": "3d Model At Geo Location",
                "path": "3_3dModels_6_3dModelAtGeoLocation/index.html",
                "requiredFeatures": ["geo"],
                "startupConfiguration": { "camera_position": "back" }
            }
        ]
    },
    {
        "windowTitle": "Point of Interest",
        "samples": [
            {
                "title": "Poi At Location",
                "path": "4_PointOfInterest_1_PoiAtLocation/index.html",
                "requiredFeatures": ["geo"],
                "startupConfiguration": { "camera_position": "back" }
            },
            {
                "title": "Poi With Label",
                "path": "4_PointOfInterest_2_PoiWithLabel/index.html",
                "requiredFeatures": ["geo"],
                "startupConfiguration": { "camera_position": "back" }
            },
            {
                "title": "Multiple Pois",
                "path": "4_PointOfInterest_3_MultiplePois/index.html",
                "requiredFeatures": ["geo"],
                "startupConfiguration": { "camera_position": "back" }
            },
            {
                "title": "Selecting Pois",
                "path": "4_PointOfInterest_4_SelectingPois/index.html",
                "requiredFeatures": ["geo"],
                "startupConfiguration": { "camera_position": "back" }
            }
        ]
    },
    {
        "windowTitle": "Obtain Poi Data",
        "samples": [
            {
                "title": "From Application Model",
                "path": "5_ObtainPoiData_1_FromApplicationModel/index.html",
                "requiredFeatures": ["geo"],
                "startupConfiguration": { "camera_position": "back" },
                "requiredExtension": "ObtainPoiDataFromApplicationModel"
            },
            {
                "title": "From Local Resource",
                "path": "5_ObtainPoiData_2_FromLocalResource/index.html",
                "requiredFeatures": ["geo"],
                "startupConfiguration": { "camera_position": "back" }
            },
            {
                "title": "From Webservice",
                "path": "5_ObtainPoiData_3_FromWebservice/index.html",
                "requiredFeatures": ["geo"],
                "startupConfiguration": { "camera_position": "back" }
            }
        ]
    },
    {
        "windowTitle": "Browsing Pois",
        "samples": [
            {
                "title": "Presenting Details",
                "path": "6_BrowsingPois_1_PresentingDetails/index.html",
                "requiredFeatures": ["geo"],
                "startupConfiguration": { "camera_position": "back" }
            },
            {
                "title": "Adding Radar",
                "path": "6_BrowsingPois_2_AddingRadar/index.html",
                "requiredFeatures": ["geo"],
                "startupConfiguration": { "camera_position": "back" }
            },
            {
                "title": "Limiting Range",
                "path": "6_BrowsingPois_3_LimitingRange/index.html",
                "requiredFeatures": ["geo"],
                "startupConfiguration": { "camera_position": "back" }
            },
            {
                "title": "Reloading Content",
                "path": "6_BrowsingPois_4_ReloadingContent/index.html",
                "requiredFeatures": ["geo"],
                "startupConfiguration": { "camera_position": "back" }
            },
            {
                "title": "Bonus: Capture Screen",
                "path": "6_BrowsingPois_6_Bonus-CaptureScreen/index.html",
                "requiredFeatures": ["geo"],
                "startupConfiguration": { "camera_position": "back" }
            }
        ]
    },
    {
        "windowTitle": "Video",
        "samples": [
            {
                "title": "Simple Video",
                "path": "7_Video_1_SimpleVideo/index.html",
                "requiredFeatures": ["2d_tracking"],
                "startupConfiguration": { "camera_position": "back" }
            },
            {
                "title": "Playback States",
                "path": "7_Video_2_PlaybackStates/index.html",
                "requiredFeatures": ["2d_tracking"],
                "startupConfiguration": { "camera_position": "back" }
            },
            {
                "title": "Snapping Video",
                "path": "7_Video_3_SnappingVideo/index.html",
                "requiredFeatures": ["2d_tracking"],
                "startupConfiguration": { "camera_position": "back" }
            },
            {
                "title": "Bonus: Transparent Video",
                "path": "7_Video_4_Bonus-TransparentVideo/index.html",
                "requiredFeatures": ["2d_tracking"],
                "startupConfiguration": { "camera_position": "back" }
            }
        ]
    },
    {
        "windowTitle": "Hardware Control",
        "samples": [
            {
                "title": "Front Camera",
                "path": "8_HardwareControl_1_FrontCamera/index.html",
                "requiredFeatures": ["geo"],
                "startupConfiguration": { "camera_position": "front" }
            },
            {
                "title": "Camera Switching",
                "path": "8_HardwareControl_2_CameraSwitching/index.html",
                "requiredFeatures": ["geo"],
                "startupConfiguration": { "camera_position": "back" }
            },
            {
                "title": "Camera Control",
                "path": "8_HardwareControl_3_AdvancedFeatures/index.html",
                "requiredFeatures": ["geo"],
                "startupConfiguration": { "camera_position": "back" }
            }
        ]
    },
    {
        "windowTitle": "Demos",
        "samples": [
            {
                "title": "2D Tracking And Geo",
                "path": "x_Demo_1_2dTrackingAndGeo/index.html",
                "requiredFeatures": ["2d_tracking", "geo"],
                "startupConfiguration": { "camera_position": "back" }
            },
            {
                "title": "Solar System (Geo)",
                "path": "x_Demo_2_SolarSystem(Geo)/index.html",
                "requiredFeatures": ["geo"],
                "startupConfiguration": { "camera_position": "back" }
            },
            {
                "title": "Solar System (2D Tracking)",
                "path": "x_Demo_3_SolarSystem(2dTracking)/index.html",
                "requiredFeatures": ["2d_tracking"],
                "startupConfiguration": { "camera_position": "back" }
            }
        ]
    }
];

describe('ModelStorage', () => {
    describe('Structure', () => {
        test('is an array', () => {
            expect(Array.isArray(modelStorage)).toBe(true);
        });

        test('has 9 categories', () => {
            expect(modelStorage).toHaveLength(9);
        });

        test('each category has windowTitle and samples', () => {
            modelStorage.forEach(category => {
                expect(category).toHaveProperty('windowTitle');
                expect(typeof category.windowTitle).toBe('string');
                expect(category.windowTitle.length).toBeGreaterThan(0);

                expect(category).toHaveProperty('samples');
                expect(Array.isArray(category.samples)).toBe(true);
                expect(category.samples.length).toBeGreaterThan(0);
            });
        });
    });

    describe('Categories', () => {
        const expectedCategories = [
            'Client Recognition',
            'Cloud Recognition',
            '3D Models',
            'Point of Interest',
            'Obtain Poi Data',
            'Browsing Pois',
            'Video',
            'Hardware Control',
            'Demos'
        ];

        test('contains all expected categories', () => {
            const actualCategories = modelStorage.map(c => c.windowTitle);
            expect(actualCategories).toEqual(expectedCategories);
        });

        test('Client Recognition has 7 samples', () => {
            const cat = modelStorage.find(c => c.windowTitle === 'Client Recognition');
            expect(cat.samples).toHaveLength(7);
        });

        test('Cloud Recognition has 3 samples', () => {
            const cat = modelStorage.find(c => c.windowTitle === 'Cloud Recognition');
            expect(cat.samples).toHaveLength(3);
        });

        test('3D Models has 6 samples', () => {
            const cat = modelStorage.find(c => c.windowTitle === '3D Models');
            expect(cat.samples).toHaveLength(6);
        });

        test('Point of Interest has 4 samples', () => {
            const cat = modelStorage.find(c => c.windowTitle === 'Point of Interest');
            expect(cat.samples).toHaveLength(4);
        });

        test('Obtain Poi Data has 3 samples', () => {
            const cat = modelStorage.find(c => c.windowTitle === 'Obtain Poi Data');
            expect(cat.samples).toHaveLength(3);
        });

        test('Browsing Pois has 5 samples', () => {
            const cat = modelStorage.find(c => c.windowTitle === 'Browsing Pois');
            expect(cat.samples).toHaveLength(5);
        });

        test('Video has 4 samples', () => {
            const cat = modelStorage.find(c => c.windowTitle === 'Video');
            expect(cat.samples).toHaveLength(4);
        });

        test('Hardware Control has 3 samples', () => {
            const cat = modelStorage.find(c => c.windowTitle === 'Hardware Control');
            expect(cat.samples).toHaveLength(3);
        });

        test('Demos has 3 samples', () => {
            const cat = modelStorage.find(c => c.windowTitle === 'Demos');
            expect(cat.samples).toHaveLength(3);
        });
    });

    describe('Sample Structure', () => {
        test('each sample has required properties', () => {
            modelStorage.forEach(category => {
                category.samples.forEach(sample => {
                    expect(sample).toHaveProperty('title');
                    expect(typeof sample.title).toBe('string');
                    expect(sample.title.length).toBeGreaterThan(0);

                    expect(sample).toHaveProperty('path');
                    expect(typeof sample.path).toBe('string');
                    expect(sample.path).toMatch(/\.html$/);

                    expect(sample).toHaveProperty('requiredFeatures');
                    expect(Array.isArray(sample.requiredFeatures)).toBe(true);
                    expect(sample.requiredFeatures.length).toBeGreaterThan(0);

                    expect(sample).toHaveProperty('startupConfiguration');
                    expect(typeof sample.startupConfiguration).toBe('object');
                    expect(sample.startupConfiguration).toHaveProperty('camera_position');
                    expect(['front', 'back']).toContain(sample.startupConfiguration.camera_position);
                });
            });
        });

        test('requiredFeatures contains valid feature names', () => {
            const validFeatures = ['2d_tracking', 'geo'];
            modelStorage.forEach(category => {
                category.samples.forEach(sample => {
                    sample.requiredFeatures.forEach(feature => {
                        expect(validFeatures).toContain(feature);
                    });
                });
            });
        });

        test('paths follow expected format', () => {
            modelStorage.forEach(category => {
                category.samples.forEach(sample => {
                    expect(sample.path).toMatch(/^[0-9x]_.*\/index\.html$/);
                });
            });
        });
    });

    describe('Specific Samples', () => {
        test('Client Recognition samples all require 2d_tracking', () => {
            const cat = modelStorage.find(c => c.windowTitle === 'Client Recognition');
            cat.samples.forEach(sample => {
                expect(sample.requiredFeatures).toEqual(['2d_tracking']);
                expect(sample.startupConfiguration.camera_position).toBe('back');
            });
        });

        test('Point of Interest samples all require geo', () => {
            const cat = modelStorage.find(c => c.windowTitle === 'Point of Interest');
            cat.samples.forEach(sample => {
                expect(sample.requiredFeatures).toEqual(['geo']);
                expect(sample.startupConfiguration.camera_position).toBe('back');
            });
        });

        test('Hardware Control Front Camera uses front camera', () => {
            const cat = modelStorage.find(c => c.windowTitle === 'Hardware Control');
            const frontCam = cat.samples.find(s => s.title === 'Front Camera');
            expect(frontCam).toBeDefined();
            expect(frontCam.startupConfiguration.camera_position).toBe('front');
            expect(frontCam.requiredFeatures).toEqual(['geo']);
        });

        test('3D Model At Geo Location requires geo feature', () => {
            const cat = modelStorage.find(c => c.windowTitle === '3D Models');
            const geoModel = cat.samples.find(s => s.title === '3d Model At Geo Location');
            expect(geoModel).toBeDefined();
            expect(geoModel.requiredFeatures).toEqual(['geo']);
        });

        test('Obtain Poi Data From Application Model has requiredExtension', () => {
            const cat = modelStorage.find(c => c.windowTitle === 'Obtain Poi Data');
            const appModel = cat.samples.find(s => s.title === 'From Application Model');
            expect(appModel).toBeDefined();
            expect(appModel.requiredExtension).toBe('ObtainPoiDataFromApplicationModel');
        });

        test('Demos 2D Tracking And Geo requires both features', () => {
            const cat = modelStorage.find(c => c.windowTitle === 'Demos');
            const demo = cat.samples.find(s => s.title === '2D Tracking And Geo');
            expect(demo).toBeDefined();
            expect(demo.requiredFeatures).toEqual(['2d_tracking', 'geo']);
        });
    });

    describe('Data Integrity', () => {
        test('no duplicate sample titles within a category', () => {
            modelStorage.forEach(category => {
                const titles = category.samples.map(s => s.title);
                expect(new Set(titles).size).toBe(titles.length);
            });
        });

        test('no duplicate sample paths within a category', () => {
            modelStorage.forEach(category => {
                const paths = category.samples.map(s => s.path);
                expect(new Set(paths).size).toBe(paths.length);
            });
        });

        test('total sample count is 38', () => {
            const totalSamples = modelStorage.reduce((sum, cat) => sum + cat.samples.length, 0);
            expect(totalSamples).toBe(38);
        });

        test('all paths are unique across all categories', () => {
            const allPaths = modelStorage.flatMap(cat => cat.samples.map(s => s.path));
            expect(new Set(allPaths).size).toBe(allPaths.length);
        });
    });
});