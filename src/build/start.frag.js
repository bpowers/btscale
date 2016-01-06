(function (global, factory) {
    if (typeof define === 'function' && define.amd) {
        define(factory);
    } else {
        global.btscale = factory();
    }
}(typeof window !== "undefined" ? window : this, function () {
