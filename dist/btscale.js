(function (global, factory) {
    if (typeof define === 'function' && define.amd) {
        define(factory);
    } else {
        global.btscale = factory();
    }
}(typeof window !== "undefined" ? window : this, function () {
/**
 * @license almond 0.3.0 Copyright (c) 2011-2014, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */
//Going sloppy to avoid 'use strict' string cost, but strict practices should
//be followed.
/*jslint sloppy: true */
/*global setTimeout: false */

var requirejs, require, define;
(function (undef) {
    var main, req, makeMap, handlers,
        defined = {},
        waiting = {},
        config = {},
        defining = {},
        hasOwn = Object.prototype.hasOwnProperty,
        aps = [].slice,
        jsSuffixRegExp = /\.js$/;

    function hasProp(obj, prop) {
        return hasOwn.call(obj, prop);
    }

    /**
     * Given a relative module name, like ./something, normalize it to
     * a real name that can be mapped to a path.
     * @param {String} name the relative name
     * @param {String} baseName a real name that the name arg is relative
     * to.
     * @returns {String} normalized name
     */
    function normalize(name, baseName) {
        var nameParts, nameSegment, mapValue, foundMap, lastIndex,
            foundI, foundStarMap, starI, i, j, part,
            baseParts = baseName && baseName.split("/"),
            map = config.map,
            starMap = (map && map['*']) || {};

        //Adjust any relative paths.
        if (name && name.charAt(0) === ".") {
            //If have a base name, try to normalize against it,
            //otherwise, assume it is a top-level require that will
            //be relative to baseUrl in the end.
            if (baseName) {
                //Convert baseName to array, and lop off the last part,
                //so that . matches that "directory" and not name of the baseName's
                //module. For instance, baseName of "one/two/three", maps to
                //"one/two/three.js", but we want the directory, "one/two" for
                //this normalization.
                baseParts = baseParts.slice(0, baseParts.length - 1);
                name = name.split('/');
                lastIndex = name.length - 1;

                // Node .js allowance:
                if (config.nodeIdCompat && jsSuffixRegExp.test(name[lastIndex])) {
                    name[lastIndex] = name[lastIndex].replace(jsSuffixRegExp, '');
                }

                name = baseParts.concat(name);

                //start trimDots
                for (i = 0; i < name.length; i += 1) {
                    part = name[i];
                    if (part === ".") {
                        name.splice(i, 1);
                        i -= 1;
                    } else if (part === "..") {
                        if (i === 1 && (name[2] === '..' || name[0] === '..')) {
                            //End of the line. Keep at least one non-dot
                            //path segment at the front so it can be mapped
                            //correctly to disk. Otherwise, there is likely
                            //no path mapping for a path starting with '..'.
                            //This can still fail, but catches the most reasonable
                            //uses of ..
                            break;
                        } else if (i > 0) {
                            name.splice(i - 1, 2);
                            i -= 2;
                        }
                    }
                }
                //end trimDots

                name = name.join("/");
            } else if (name.indexOf('./') === 0) {
                // No baseName, so this is ID is resolved relative
                // to baseUrl, pull off the leading dot.
                name = name.substring(2);
            }
        }

        //Apply map config if available.
        if ((baseParts || starMap) && map) {
            nameParts = name.split('/');

            for (i = nameParts.length; i > 0; i -= 1) {
                nameSegment = nameParts.slice(0, i).join("/");

                if (baseParts) {
                    //Find the longest baseName segment match in the config.
                    //So, do joins on the biggest to smallest lengths of baseParts.
                    for (j = baseParts.length; j > 0; j -= 1) {
                        mapValue = map[baseParts.slice(0, j).join('/')];

                        //baseName segment has  config, find if it has one for
                        //this name.
                        if (mapValue) {
                            mapValue = mapValue[nameSegment];
                            if (mapValue) {
                                //Match, update name to the new value.
                                foundMap = mapValue;
                                foundI = i;
                                break;
                            }
                        }
                    }
                }

                if (foundMap) {
                    break;
                }

                //Check for a star map match, but just hold on to it,
                //if there is a shorter segment match later in a matching
                //config, then favor over this star map.
                if (!foundStarMap && starMap && starMap[nameSegment]) {
                    foundStarMap = starMap[nameSegment];
                    starI = i;
                }
            }

            if (!foundMap && foundStarMap) {
                foundMap = foundStarMap;
                foundI = starI;
            }

            if (foundMap) {
                nameParts.splice(0, foundI, foundMap);
                name = nameParts.join('/');
            }
        }

        return name;
    }

    function makeRequire(relName, forceSync) {
        return function () {
            //A version of a require function that passes a moduleName
            //value for items that may need to
            //look up paths relative to the moduleName
            var args = aps.call(arguments, 0);

            //If first arg is not require('string'), and there is only
            //one arg, it is the array form without a callback. Insert
            //a null so that the following concat is correct.
            if (typeof args[0] !== 'string' && args.length === 1) {
                args.push(null);
            }
            return req.apply(undef, args.concat([relName, forceSync]));
        };
    }

    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(depName) {
        return function (value) {
            defined[depName] = value;
        };
    }

    function callDep(name) {
        if (hasProp(waiting, name)) {
            var args = waiting[name];
            delete waiting[name];
            defining[name] = true;
            main.apply(undef, args);
        }

        if (!hasProp(defined, name) && !hasProp(defining, name)) {
            throw new Error('No ' + name);
        }
        return defined[name];
    }

    //Turns a plugin!resource to [plugin, resource]
    //with the plugin being undefined if the name
    //did not have a plugin prefix.
    function splitPrefix(name) {
        var prefix,
            index = name ? name.indexOf('!') : -1;
        if (index > -1) {
            prefix = name.substring(0, index);
            name = name.substring(index + 1, name.length);
        }
        return [prefix, name];
    }

    /**
     * Makes a name map, normalizing the name, and using a plugin
     * for normalization if necessary. Grabs a ref to plugin
     * too, as an optimization.
     */
    makeMap = function (name, relName) {
        var plugin,
            parts = splitPrefix(name),
            prefix = parts[0];

        name = parts[1];

        if (prefix) {
            prefix = normalize(prefix, relName);
            plugin = callDep(prefix);
        }

        //Normalize according
        if (prefix) {
            if (plugin && plugin.normalize) {
                name = plugin.normalize(name, makeNormalize(relName));
            } else {
                name = normalize(name, relName);
            }
        } else {
            name = normalize(name, relName);
            parts = splitPrefix(name);
            prefix = parts[0];
            name = parts[1];
            if (prefix) {
                plugin = callDep(prefix);
            }
        }

        //Using ridiculous property names for space reasons
        return {
            f: prefix ? prefix + '!' + name : name, //fullName
            n: name,
            pr: prefix,
            p: plugin
        };
    };

    function makeConfig(name) {
        return function () {
            return (config && config.config && config.config[name]) || {};
        };
    }

    handlers = {
        require: function (name) {
            return makeRequire(name);
        },
        exports: function (name) {
            var e = defined[name];
            if (typeof e !== 'undefined') {
                return e;
            } else {
                return (defined[name] = {});
            }
        },
        module: function (name) {
            return {
                id: name,
                uri: '',
                exports: defined[name],
                config: makeConfig(name)
            };
        }
    };

    main = function (name, deps, callback, relName) {
        var cjsModule, depName, ret, map, i,
            args = [],
            callbackType = typeof callback,
            usingExports;

        //Use name if no relName
        relName = relName || name;

        //Call the callback to define the module, if necessary.
        if (callbackType === 'undefined' || callbackType === 'function') {
            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
            //Default to [require, exports, module] if no deps
            deps = !deps.length && callback.length ? ['require', 'exports', 'module'] : deps;
            for (i = 0; i < deps.length; i += 1) {
                map = makeMap(deps[i], relName);
                depName = map.f;

                //Fast path CommonJS standard dependencies.
                if (depName === "require") {
                    args[i] = handlers.require(name);
                } else if (depName === "exports") {
                    //CommonJS module spec 1.1
                    args[i] = handlers.exports(name);
                    usingExports = true;
                } else if (depName === "module") {
                    //CommonJS module spec 1.1
                    cjsModule = args[i] = handlers.module(name);
                } else if (hasProp(defined, depName) ||
                           hasProp(waiting, depName) ||
                           hasProp(defining, depName)) {
                    args[i] = callDep(depName);
                } else if (map.p) {
                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                    args[i] = defined[depName];
                } else {
                    throw new Error(name + ' missing ' + depName);
                }
            }

            ret = callback ? callback.apply(defined[name], args) : undefined;

            if (name) {
                //If setting exports via "module" is in play,
                //favor that over return value and exports. After that,
                //favor a non-undefined return value over exports use.
                if (cjsModule && cjsModule.exports !== undef &&
                        cjsModule.exports !== defined[name]) {
                    defined[name] = cjsModule.exports;
                } else if (ret !== undef || !usingExports) {
                    //Use the return value from the function.
                    defined[name] = ret;
                }
            }
        } else if (name) {
            //May just be an object definition for the module. Only
            //worry about defining if have a module name.
            defined[name] = callback;
        }
    };

    requirejs = require = req = function (deps, callback, relName, forceSync, alt) {
        if (typeof deps === "string") {
            if (handlers[deps]) {
                //callback in this case is really relName
                return handlers[deps](callback);
            }
            //Just return the module wanted. In this scenario, the
            //deps arg is the module name, and second arg (if passed)
            //is just the relName.
            //Normalize module name, if it contains . or ..
            return callDep(makeMap(deps, callback).f);
        } else if (!deps.splice) {
            //deps is a config object, not an array.
            config = deps;
            if (config.deps) {
                req(config.deps, config.callback);
            }
            if (!callback) {
                return;
            }

            if (callback.splice) {
                //callback is an array, which means it is a dependency list.
                //Adjust args if there are dependencies
                deps = callback;
                callback = relName;
                relName = null;
            } else {
                deps = undef;
            }
        }

        //Support require(['a'])
        callback = callback || function () {};

        //If relName is a function, it is an errback handler,
        //so remove it.
        if (typeof relName === 'function') {
            relName = forceSync;
            forceSync = alt;
        }

        //Simulate async callback;
        if (forceSync) {
            main(undef, deps, callback, relName);
        } else {
            //Using a non-zero value because of concern for what old browsers
            //do, and latest browsers "upgrade" to 4 if lower value is used:
            //http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html#dom-windowtimers-settimeout:
            //If want a value immediately, use require('id') instead -- something
            //that works in almond on the global level, but not guaranteed and
            //unlikely to work in other AMD implementations.
            setTimeout(function () {
                main(undef, deps, callback, relName);
            }, 4);
        }

        return req;
    };

    /**
     * Just drops the config on the floor, but returns req in case
     * the config return value is used.
     */
    req.config = function (cfg) {
        return req(cfg);
    };

    /**
     * Expose module registry for debugging and tooling
     */
    requirejs._defined = defined;

    define = function (name, deps, callback) {

        //This module may not have dependencies
        if (!deps.splice) {
            //deps is not an array, so probably means
            //an object literal or factory function for
            //the value. Adjust args.
            callback = deps;
            deps = [];
        }

        if (!hasProp(defined, name) && !hasProp(waiting, name)) {
            waiting[name] = [name, deps, callback];
        }
    };

    define.amd = {
        jQuery: true
    };
}());

define("vendor/almond", function(){});

// Copyright 2015 Bobby Powers. All rights reserved.
// Use of this source code is governed by the MIT
// license that can be found in the LICENSE file.

define('constants',[], function() {
    

    var constants = {};

    constants.MessageType = {
        NONE: 0,
        STR: 1,
        BATTERY: 2,
        BATTERY_RESPONSE: 3,
        WEIGHT: 4,
        WEIGHT_RESPONSE: 5,
        WEIGHT_RESPONSE2: 6,
        TARE: 7,
        SOUND: 8,
        SOUND_ON: 9,
        LIGHT_ON: 10,
        FILE: 11,
        CUSTOM: 12,
        SIZE: 13,
    };

    constants.SCALE_SERVICE_UUID = '00001820-0000-1000-8000-00805f9b34fb';
    constants.SCALE_CHARACTERISTIC_UUID = '00002a80-0000-1000-8000-00805f9b34fb';

    constants.MAGIC1 = 0xdf;
    constants.MAGIC2 = 0x78;

    // used for encoding packets going to the scale
    constants.TABLE1 = [
        0x00, 0x76, 0x84, 0x50, 0xDB, 0xE4, 0x6F, 0xB2,
        0xFA, 0xFB, 0x4D, 0x4F, 0x8E, 0x57, 0x8C, 0x5F,
        0x9E, 0xAE, 0xB0, 0xB5, 0x5D, 0x96, 0x15, 0xB9,
        0x0F, 0xFC, 0xFD, 0x70, 0x1B, 0x80, 0xBB, 0xF4,
        0x93, 0xFE, 0xFF, 0x69, 0x68, 0x83, 0xCF, 0xA7,
        0xD2, 0xEB, 0x3C, 0x64, 0x41, 0x77, 0xC6, 0x86,
        0xCB, 0xD3, 0xDD, 0x48, 0xEE, 0xF0, 0x1E, 0x58,
        0x4C, 0x8A, 0x8F, 0xA4, 0x02, 0x4B, 0x06, 0x24,
        0x8D, 0xB7, 0xBF, 0x28, 0x63, 0xAD, 0xB8, 0x56,
        0x89, 0xA0, 0xC4, 0x51, 0xC5, 0x52, 0x27, 0x3D,
        0xC9, 0xD6, 0xDC, 0x42, 0x2C, 0xD7, 0xE6, 0xEF,
        0xF9, 0x35, 0xD9, 0xBC, 0x7A, 0x1F, 0x43, 0x6C,
        0x36, 0x38, 0x07, 0x94, 0x98, 0xD8, 0xE3, 0xB6,
        0x53, 0x3F, 0x0C, 0x92, 0x9A, 0xC2, 0xD1, 0xD5,
        0x34, 0x1D, 0x62, 0xA9, 0x20, 0x7E, 0xAC, 0x09,
        0x5E, 0x59, 0x31, 0x9C, 0xA3, 0x97, 0xB3, 0x74,
        0xC1, 0xED, 0xF2, 0x10, 0x2E, 0x4A, 0xE1, 0x23,
        0x2B, 0x81, 0xF7, 0x61, 0x19, 0x08, 0x1A, 0x39,
        0x65, 0x3E, 0x73, 0x3B, 0x7B, 0x0B, 0x67, 0x04,
        0x6A, 0x22, 0x46, 0x0E, 0x55, 0x66, 0x54, 0x01,
        0x45, 0x6B, 0x32, 0x8B, 0xAB, 0x18, 0xBA, 0xCC,
        0xD4, 0x26, 0xE2, 0xE7, 0x1C, 0x44, 0x14, 0x95,
        0x99, 0x85, 0xDA, 0x4E, 0x6E, 0xE0, 0xE8, 0x37,
        0xBE, 0xF3, 0x7F, 0xDF, 0xF6, 0xF8, 0x2D, 0x30,
        0x21, 0x13, 0x17, 0x0D, 0x16, 0x25, 0x5B, 0x33,
        0x11, 0x5C, 0x7C, 0x87, 0xA1, 0xBD, 0x05, 0x90,
        0x9F, 0xA6, 0x6D, 0xB4, 0xC7, 0xCA, 0xC3, 0x12,
        0x03, 0xE5, 0xDE, 0xE9, 0x9B, 0x88, 0x2F, 0xEA,
        0xEC, 0xC8, 0x29, 0x71, 0x49, 0x5A, 0x72, 0x47,
        0x7D, 0xA2, 0xA5, 0x91, 0xAF, 0xB1, 0x0A, 0xCD,
        0x60, 0xC0, 0x9D, 0x78, 0xCE, 0xD0, 0x79, 0x3A,
        0xAA, 0xA8, 0x2A, 0x40, 0xF1, 0x75, 0xF5, 0x82,
    ];

    // used for decoding packets coming from the scale
    constants.TABLE2 = [
        0x00, 0x9F, 0x3C, 0xD8, 0x97, 0xCE, 0x3E, 0x62,
        0x8D, 0x77, 0xEE, 0x95, 0x6A, 0xC3, 0x9B, 0x18,
        0x83, 0xC8, 0xD7, 0xC1, 0xAE, 0x16, 0xC4, 0xC2,
        0xA5, 0x8C, 0x8E, 0x1C, 0xAC, 0x71, 0x36, 0x5D,
        0x74, 0xC0, 0x99, 0x87, 0x3F, 0xC5, 0xA9, 0x4E,
        0x43, 0xE2, 0xFA, 0x88, 0x54, 0xBE, 0x84, 0xDE,
        0xBF, 0x7A, 0xA2, 0xC7, 0x70, 0x59, 0x60, 0xB7,
        0x61, 0x8F, 0xF7, 0x93, 0x2A, 0x4F, 0x91, 0x69,
        0xFB, 0x2C, 0x53, 0x5E, 0xAD, 0xA0, 0x9A, 0xE7,
        0x33, 0xE4, 0x85, 0x3D, 0x38, 0x0A, 0xB3, 0x0B,
        0x03, 0x4B, 0x4D, 0x68, 0x9E, 0x9C, 0x47, 0x0D,
        0x37, 0x79, 0xE5, 0xC6, 0xC9, 0x14, 0x78, 0x0F,
        0xF0, 0x8B, 0x72, 0x44, 0x2B, 0x90, 0x9D, 0x96,
        0x24, 0x23, 0x98, 0xA1, 0x5F, 0xD2, 0xB4, 0x06,
        0x1B, 0xE3, 0xE6, 0x92, 0x7F, 0xFD, 0x01, 0x2D,
        0xF3, 0xF6, 0x5C, 0x94, 0xCA, 0xE8, 0x75, 0xBA,
        0x1D, 0x89, 0xFF, 0x25, 0x02, 0xB1, 0x2F, 0xCB,
        0xDD, 0x48, 0x39, 0xA3, 0x0E, 0x40, 0x0C, 0x3A,
        0xCF, 0xEB, 0x6B, 0x20, 0x63, 0xAF, 0x15, 0x7D,
        0x64, 0xB0, 0x6C, 0xDC, 0x7B, 0xF2, 0x10, 0xD0,
        0x49, 0xCC, 0xE9, 0x7C, 0x3B, 0xEA, 0xD1, 0x27,
        0xF9, 0x73, 0xF8, 0xA4, 0x76, 0x45, 0x11, 0xEC,
        0x12, 0xED, 0x07, 0x7E, 0xD3, 0x13, 0x67, 0x41,
        0x46, 0x17, 0xA6, 0x1E, 0x5B, 0xCD, 0xB8, 0x42,
        0xF1, 0x80, 0x6D, 0xD6, 0x4A, 0x4C, 0x2E, 0xD4,
        0xE1, 0x50, 0xD5, 0x30, 0xA7, 0xEF, 0xF4, 0x26,
        0xF5, 0x6E, 0x28, 0x31, 0xA8, 0x6F, 0x51, 0x55,
        0x65, 0x5A, 0xB2, 0x04, 0x52, 0x32, 0xDA, 0xBB,
        0xB5, 0x86, 0xAA, 0x66, 0x05, 0xD9, 0x56, 0xAB,
        0xB6, 0xDB, 0xDF, 0x29, 0xE0, 0x81, 0x34, 0x57,
        0x35, 0xFC, 0x82, 0xB9, 0x1F, 0xFE, 0xBC, 0x8A,
        0xBD, 0x58, 0x08, 0x09, 0x19, 0x1A, 0x21, 0x22,
    ];

    return constants;
});

// Copyright (c) 2010 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in {Chromium's} LICENSE file.

/**
 * @fileoverview This contains an implementation of the EventTarget interface
 * as defined by DOM Level 2 Events.
 */

define('event_target',[], function() {
    

    /**
     * Creates a new EventTarget. This class implements the DOM level 2
     * EventTarget interface and can be used wherever those are used.
     * @constructor
     * @implements {EventTarget}
     *
     * BSD-licensed, taken from Chromium: src/ui/webui/resources/js/cr/event_target.js
     */
    function EventTarget() {
    }

    EventTarget.prototype = {
        /**
         * Adds an event listener to the target.
         * @param {string} type The name of the event.
         * @param {EventListenerType} handler The handler for the event. This is
         *     called when the event is dispatched.
         */
        addEventListener: function(type, handler) {
            if (!this.listeners_)
                this.listeners_ = Object.create(null);
            if (!(type in this.listeners_)) {
                this.listeners_[type] = [handler];
            } else {
                var handlers = this.listeners_[type];
                if (handlers.indexOf(handler) < 0)
                    handlers.push(handler);
            }
        },

        /**
         * Removes an event listener from the target.
         * @param {string} type The name of the event.
         * @param {EventListenerType} handler The handler for the event.
         */
        removeEventListener: function(type, handler) {
            if (!this.listeners_)
                return;
            if (type in this.listeners_) {
                var handlers = this.listeners_[type];
                var index = handlers.indexOf(handler);
                if (index >= 0) {
                    // Clean up if this was the last listener.
                    if (handlers.length == 1)
                        delete this.listeners_[type];
                    else
                        handlers.splice(index, 1);
                }
            }
        },

        /**
         * Dispatches an event and calls all the listeners that are listening to
         * the type of the event.
         * @param {!Event} event The event to dispatch.
         * @return {boolean} Whether the default action was prevented. If someone
         *     calls preventDefault on the event object then this returns false.
         */
        dispatchEvent: function(event) {
            if (!this.listeners_)
                return true;

            // Since we are using DOM Event objects we need to override some of the
            // properties and methods so that we can emulate this correctly.
            var self = this;
            event.__defineGetter__('target', function() {
                return self;
            });

            var type = event.type;
            var prevented = 0;
            if (type in this.listeners_) {
                // Clone to prevent removal during dispatch
                var handlers = this.listeners_[type].concat();
                for (var i = 0, handler; (handler = handlers[i]); i++) {
                    if (handler.handleEvent)
                        prevented |= handler.handleEvent.call(handler, event) === false;
                    else
                        prevented |= handler.call(this, event) === false;
                }
            }

            return !prevented && !event.defaultPrevented;
        }
    };

    return {
        EventTarget: EventTarget,
    };
});

// Copyright 2015 Bobby Powers. All rights reserved.
// Use of this source code is governed by the MIT
// license that can be found in the LICENSE file.

define('packet',['./constants'], function(constants) {
    

    // TODO(bp) this is a guess
    var MAX_PAYLOAD_LENGTH = 10;

    var MessageType = constants.MessageType;
    var MAGIC1 = constants.MAGIC1;
    var MAGIC2 = constants.MAGIC2;

    // packet sequence id in the range of 0-255 (unsigned char)
    var sequenceId = 0;
    
    var nextSequenceId = function() {
        var next = sequenceId++;
        sequenceId &= 0xff;

        return next;
    };

    var setSequenceId = function(id) {
        sequenceId = id & 0xff;
    };

    var getSequenceId = function() {
        return sequenceId;
    };

    function Message(type, id, payload) {
        this.type = type;
        this.id = id;
        this.payload = payload;
        this.value = null;
        if (this.type === MessageType.WEIGHT_RESPONSE) {
            var value = ((payload[1] & 0xff) << 8) + (payload[0] & 0xff);
            for (var i = 0; i < payload[4]; i++)
                value /= 10;
            if ((payload[6] & 0x02) == 0x02)
                value *= -1;
            this.value = value;
        }
    }

    var encipher = function(out, input, sequenceId) {
        for (var i = 0; i < out.byteLength; i++) {
            var offset = (input[i] + sequenceId) & 0xff;
            out[i] = constants.TABLE1[offset];
        }
    };

    var decipher = function(input, sequenceId) {
        var result = new Array(input.byteLength);

        for (var i = 0; i < input.byteLength; i++) {
            var offset = input[i] & 0xff;
            result[i] = (constants.TABLE2[offset] - sequenceId) & 0xff;
        }

        return result;
    };

    var checksum = function(data) {
        var sum = 0;

        for (var i = 0; i < data.length; i++)
            sum += data[i];

        return sum & 0xff;
    };

    var encode = function(msgType, id, payload) {
        if (payload.length > MAX_PAYLOAD_LENGTH)
            throw 'payload too long: ' + payload.length;

        var buf = new ArrayBuffer(8 + payload.length);
        var bytes = new Uint8Array(buf);

        var sequenceId = nextSequenceId();

        bytes[0] = MAGIC1;
        bytes[1] = MAGIC2;
        bytes[2] = 5 + payload.length;
        bytes[3] = msgType;
        bytes[4] = sequenceId;
        bytes[5] = id;
        bytes[6] = payload.length & 0xff;

        var payloadOut = new Uint8Array(buf, 7, payload.length);

        encipher(payloadOut, payload, sequenceId);

        var contentsToChecksum = new Uint8Array(buf, 3, payload.length + 4);

        bytes[7 + payload.length] = checksum(contentsToChecksum);

        return buf;
    };

    var decode = function(data) {
        var len = data.length;
        if (!len)
            len = data.byteLength;
        if (!len)
            return;

        var bytes = new Uint8Array(data);

        if (len < 8)
            throw 'data too short: ' + len;

        if (bytes[0] !== MAGIC1 && bytes[1] !== MAGIC2)
            throw "don't have the magic";

        var len1 = bytes[2];

        var contentsToChecksum = new Uint8Array(data.slice(3, len - 1));

        var cs = checksum(contentsToChecksum);
        if (bytes[len - 1] !== cs)
            throw 'checksum mismatch ' + bytes[len - 1] + ' !== ' + cs;

        var msgType = bytes[3];
        var sequenceId = bytes[4];
        var id = bytes[5];
        var len2 = bytes[6];

        if (len1 !== len - 3)
            throw 'length mismatch 1 ' + len1 + ' !== ' + (len - 3);
        if (len2 !== len - 8)
            throw 'length mismatch 2';

        var payloadIn = new Uint8Array(data.slice(7, len - 1));
        var payload = decipher(payloadIn, sequenceId);

        return new Message(msgType, id, payload);
    };

    var encodeWeight = function(period, time, type) {
        if (!period)
            period = 1;
        if (!time)
            time = 100;
        if (!type)
            type = 1;

        var payload = [period & 0xff, time & 0xff, type & 0xff];

        return encode(MessageType.WEIGHT, 0, payload);
    };

    var encodeTare = function() {
        var payload = [0x0, 0x0];

        return encode(MessageType.CUSTOM, 0, payload);
    };

    var encodeStartTimer = function() {
        var payload = [0x5];

        return encode(MessageType.CUSTOM, 0, payload);
    };

    var encodePauseTimer = function() {
        var payload = [0x6];

        return encode(MessageType.CUSTOM, 0, payload);
    };

    var encodeStopTimer = function() {
        var payload = [0x7];

        return encode(MessageType.CUSTOM, 0, payload);
    };

    var encodeGetTimer = function(count) {
        if (!count)
            count = 20;
        var payload = [0x8, count & 0xff];

        return encode(MessageType.CUSTOM, 0, payload);
    };

    var encodeGetBattery = function() {
        return encode(MessageType.BATTERY, 0, []);
    };

    return {
        encodeTare: encodeTare,
        encodeWeight: encodeWeight,
        encodeStartTimer: encodeStartTimer,
        encodePauseTimer: encodePauseTimer,
        encodeStopTimer: encodeStopTimer,
        encodeGetTimer: encodeGetTimer,
        encodeGetBattery: encodeGetBattery,
        decode: decode,
        setSequenceId: setSequenceId,
        getSequenceId: getSequenceId,
    };
});

// Copyright 2015 Bobby Powers. All rights reserved.
// Use of this source code is governed by the MIT
// license that can be found in the LICENSE file.

define('recorder',[], function() {
    

    function Recorder(scale) {
        this.start = Date.now()/1000;
        this.series = [];
        this.scale = scale;
        // for purposes of removing event listener later
        this.recordCb = this.record.bind(this);

        this.record();

        scale.addEventListener('weightMeasured', this.recordCb);
    }

    Recorder.prototype.stop = function() {
        this.record();
        this.scale.removeEventListener('weightMeasured', this.recordCb);
        this.scale = null;
        this.recordCb = null;

        return this.series;
    };

    Recorder.prototype.record = function() {
        var time = Date.now()/1000 - this.start;
        this.series.push([time, this.scale.weight]);
    };

    return {
        Recorder: Recorder,
    };
});

// Copyright 2015 Bobby Powers. All rights reserved.
// Use of this source code is governed by the MIT
// license that can be found in the LICENSE file.

define('scale',['./constants', './event_target', './packet', './recorder'], function(constants, event_target, packet, recorder) {
    

    var SCALE_CHARACTERISTIC_UUID = constants.SCALE_CHARACTERISTIC_UUID;
    var SCALE_SERVICE_UUID = constants.SCALE_SERVICE_UUID;
    var MessageType = constants.MessageType;

    function Scale(device) {
        this.connected = false;
        this.name = device.name;
        this.device = device;
        this.service = null;
        this.characteristic = null;
        this.weight = null;
        this.recorder = null;

        console.log('created scale for ' + this.device.address + ' (' + this.device.name + ')');
    }

    Scale.prototype = new event_target.EventTarget();

    Scale.prototype.connect = function() {
        if (this.connected)
            return;

        chrome.bluetoothLowEnergy.onServiceAdded.addListener(
            this.serviceAdded.bind(this));
        chrome.bluetoothLowEnergy.onCharacteristicValueChanged.addListener(
            this.characteristicValueChanged.bind(this));

        chrome.bluetoothLowEnergy.connect(
            this.device.address,
            {'persistent': true},
            this.deviceConnected.bind(this));
    };

    Scale.prototype.deviceConnected = function() {
        if (chrome.runtime.lastError) {
            console.log('connect failed: ' + chrome.runtime.lastError.message);
            return;
        }
        chrome.bluetoothLowEnergy.getServices(this.device.address,
                                              this.servicesAdded.bind(this));
    };

    Scale.prototype.serviceAdded = function(service) {
        if (service.uuid !== SCALE_SERVICE_UUID)
            return;
        if (this.service)
            return;

        this.service = service;

        chrome.bluetoothLowEnergy.getCharacteristics(
            this.service.instanceId,
            this.allCharacteristics.bind(this));
    };

    Scale.prototype.servicesAdded = function(services) {
        for (var i in services) {
            var service = services[i];
            this.serviceAdded(service);
        }
    };

    Scale.prototype.characteristicValueChanged = function(event) {
        var msg = packet.decode(event.value);
        if (!msg) {
            console.log('characteristic value update, but no message');
            return;
        }

        if (msg.type === MessageType.WEIGHT_RESPONSE) {
            var prevWeight = this.weight;
            var shouldDispatchChanged = this.weight !== msg.value;
            this.weight = msg.value;

            var detail = {'detail': {'value': msg.value, 'previous': prevWeight}};

            // always dispatch a measured event, useful for data
            // logging, but also issue a less-noisy weightChanged
            // event for UI updates.
            this.dispatchEvent(new CustomEvent('weightMeasured', detail));
            if (shouldDispatchChanged)
                this.dispatchEvent(new CustomEvent('weightChanged', detail));
        } else if (msg.type === MessageType.BATTERY_RESPONSE) {
            var cb = this.batteryCb;
            this.batteryCb = null;
            if (cb)
                cb(msg.payload/100);
        } else {
            console.log('non-weight response');
            console.log(msg);
        }
    };

    Scale.prototype.disconnect = function() {
        this.connected = false;
        chrome.bluetoothLowEnergy.disconnect(this.device.address);
    };

    Scale.prototype.allCharacteristics = function(characteristics) {
        if (chrome.runtime.lastError) {
            console.log('failed listing characteristics: ' +
                        chrome.runtime.lastError.message);
            return;
        }

        var found = false;
        for (var i = 0; i < characteristics.length; i++) {
            if (characteristics[i].uuid == SCALE_CHARACTERISTIC_UUID) {
                this.characteristic = characteristics[i];
                found = true;
                break;
            }
        }

        if (found) {
            chrome.bluetoothLowEnergy.startCharacteristicNotifications(
                this.characteristic.instanceId,
                this.notificationsReady.bind(this));
        } else {
            console.log('scale doesnt have required characteristic');
            console.log(characteristics);
        }
    };

    Scale.prototype.notificationsReady = function() {
        if (chrome.runtime.lastError) {
            console.log('failed enabling characteristic notifications: ' +
                        chrome.runtime.lastError.message);
            // FIXME(bp) exit early once this call succeeds on android.
            //return;
        }

        console.log('scale ready');

        this.connected = true;

        this.poll();
        setInterval(this.poll.bind(this), 1000);

        this.dispatchEvent(new CustomEvent('ready', {'detail': {'scale': this}}));
    };

    Scale.prototype.logError = function() {
        if (chrome.runtime.lastError)
            console.log('bluetooth call failed: ' + chrome.runtime.lastError.message);
    };

    Scale.prototype.tare = function() {
        if (!this.connected)
            return false;

        var msg = packet.encodeTare();

        chrome.bluetoothLowEnergy.writeCharacteristicValue(
            this.characteristic.instanceId, msg, this.logError.bind(this));

        return true;
    };

    Scale.prototype.startTimer = function() {
        if (!this.connected)
            return false;

        var msg = packet.encodeStartTimer();

        chrome.bluetoothLowEnergy.writeCharacteristicValue(
            this.characteristic.instanceId, msg, this.logError.bind(this));

        return true;
    };

    Scale.prototype.pauseTimer = function() {
        if (!this.connected)
            return false;

        var msg = packet.encodePauseTimer();

        chrome.bluetoothLowEnergy.writeCharacteristicValue(
            this.characteristic.instanceId, msg, this.logError.bind(this));

        return true;
    };

    Scale.prototype.stopTimer = function() {
        if (!this.connected)
            return false;

        var msg = packet.encodeStopTimer();

        chrome.bluetoothLowEnergy.writeCharacteristicValue(
            this.characteristic.instanceId, msg, this.logError.bind(this));

        return true;
    };

    Scale.prototype.getTimer = function(count) {
        if (!this.connected)
            return false;

        if (!count)
            count = 1;

        var msg = packet.encodeGetTimer(count);

        chrome.bluetoothLowEnergy.writeCharacteristicValue(
            this.characteristic.instanceId, msg, this.logError.bind(this));

        return true;
    };

    Scale.prototype.getBattery = function(cb) {
        if (!this.connected)
            return false;

        this.batteryCb = cb;

        var msg = packet.encodeGetBattery();

        chrome.bluetoothLowEnergy.writeCharacteristicValue(
            this.characteristic.instanceId, msg, this.logError.bind(this));

        return true;
    };

    Scale.prototype.poll = function() {
        if (!this.connected)
            return false;

        var msg = packet.encodeWeight();

        chrome.bluetoothLowEnergy.writeCharacteristicValue(
            this.characteristic.instanceId, msg, this.logError.bind(this));

        return true;
    };

    Scale.prototype.startRecording = function() {
        if (this.recorder)
            return;

        this.recorder = new recorder.Recorder(this);
    };

    Scale.prototype.stopRecording = function() {
        this.series = this.recorder.stop();
        this.recorder = null;

        return this.series;
    };

    return {
        Scale: Scale,
    };
});

// Copyright 2015 Bobby Powers. All rights reserved.
// Use of this source code is governed by the MIT
// license that can be found in the LICENSE file.

define('scale_finder',['./constants', './event_target', './scale'], function(constants, event_target, scale) {
    

    var Scale = scale.Scale;

    function ScaleFinder() {
        this.ready = false;
        this.devices = {};
        this.scales = [];
        this.adapterState = null;
        this.failed = false;

        if (typeof chrome !== 'undefined' && chrome.bluetooth && chrome.bluetoothLowEnergy) {
            chrome.bluetooth.onAdapterStateChanged.addListener(this.adapterStateChanged.bind(this));
            chrome.bluetooth.onDeviceAdded.addListener(this.deviceAdded.bind(this));

            chrome.bluetooth.getAdapterState(this.adapterStateChanged.bind(this));
        } else {
            console.log("couldn't find chrome.bluetooth APIs");
            this.failed = true;
        }
    }

    ScaleFinder.prototype = new event_target.EventTarget();

    ScaleFinder.prototype.adapterStateChanged = function(adapterState) {
        if (chrome.runtime.lastError) {
            console.log('adapter state changed: ' + chrome.runtime.lastError.message);
            return;
        }
        console.log('adapter state changed');
        console.log(adapterState);

        var shouldDispatchReady = !this.adapterState;
        var shouldDispatchDiscovery = this.adapterState && this.adapterState.discovering !== adapterState.discovering;

        this.adapterState = adapterState;

        if (shouldDispatchReady)
            this.dispatchEvent(new Event('ready'));
        if (shouldDispatchDiscovery) {
            var event = new CustomEvent(
                'discoveryStateChanged',
                {'detail': {'discovering': adapterState.discovering}});
            this.dispatchEvent(event);
        }
    };

    ScaleFinder.prototype.deviceAdded = function(device) {
        if (!device.uuids || device.uuids.indexOf(constants.SCALE_SERVICE_UUID) < 0)
            return;

        if (device.address in this.devices) {
            console.log('WARN: device added that is already known ' + device.address);
            return;
        }
        var scale = new Scale(device);
        this.devices[device.address] = scale;
        this.scales.push(scale);
    };

    ScaleFinder.prototype.logDiscovery = function() {
        if (chrome.runtime.lastError)
            console.log('Failed to frob discovery: ' +
                        chrome.runtime.lastError.message);
    };

    ScaleFinder.prototype.startDiscovery = function() {
        if (this.failed)
            return;
        chrome.bluetooth.startDiscovery(this.logDiscovery);
    };

    ScaleFinder.prototype.stopDiscovery = function() {
        if (this.failed)
            return;
        chrome.bluetooth.stopDiscovery(this.logDiscovery);
    };

    return {
        ScaleFinder: ScaleFinder,
    };
});

// Copyright 2015 Bobby Powers. All rights reserved.
// Use of this source code is governed by the MIT
// license that can be found in the LICENSE file.

define('btscale',['./scale_finder'], function(scale_finder) {
    

    return {
        ScaleFinder: scale_finder.ScaleFinder,
    };
});


    return require('btscale');
}));
