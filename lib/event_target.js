'use strict';
var BTSEventTarget = (function () {
    function BTSEventTarget() {
    }
    BTSEventTarget.prototype.addEventListener = function (type, handler) {
        if (!this.listeners_)
            this.listeners_ = Object.create(null);
        if (!(type in this.listeners_)) {
            this.listeners_[type] = [handler];
        }
        else {
            var handlers = this.listeners_[type];
            if (handlers.indexOf(handler) < 0)
                handlers.push(handler);
        }
    };
    BTSEventTarget.prototype.removeEventListener = function (type, handler) {
        if (!this.listeners_)
            return;
        if (type in this.listeners_) {
            var handlers = this.listeners_[type];
            var index = handlers.indexOf(handler);
            if (index >= 0) {
                if (handlers.length === 1)
                    delete this.listeners_[type];
                else
                    handlers.splice(index, 1);
            }
        }
    };
    BTSEventTarget.prototype.dispatchEvent = function (event) {
        if (!this.listeners_)
            return true;
        var self = this;
        event.__defineGetter__('target', function () {
            return self;
        });
        var type = event.type;
        var prevented = 0;
        if (type in this.listeners_) {
            var handlers = this.listeners_[type].concat();
            for (var i = 0, handler = void 0; (handler = handlers[i]); i++) {
                if (handler.handleEvent)
                    prevented |= (handler.handleEvent.call(handler, event) === false);
                else
                    prevented |= (handler.call(this, event) === false);
            }
        }
        return !prevented && !event.defaultPrevented;
    };
    return BTSEventTarget;
})();
exports.BTSEventTarget = BTSEventTarget;
