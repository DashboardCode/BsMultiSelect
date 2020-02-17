export function addToJQueryPrototype(pluginName, createPlugin, defaults, $){
    const firstChar = pluginName.charAt(0);
    const firstCharLower = firstChar.toLowerCase();
    if (firstCharLower == firstChar) {
        throw new TypeError(`Plugin name '${pluginName}' should be started from upper case char`)
    }
    const prototypableName = firstCharLower + pluginName.slice(1)
    const noConflictPrototypable = $.fn[prototypableName];
    const dataKey = `DashboardCode.${pluginName}`;

    function prototypable(options) {
        return this.each( function () {
            let $e = $(this);
            let instance = $e.data(dataKey)
            let isMethodName = typeof options === 'string';
            if (!instance) {
                if (isMethodName && /Dispose/.test(options)) 
                    return;
                const optionsRef = (typeof options === 'object') || (typeof options === 'function')?options:null;
                instance = createPlugin(this, optionsRef,
                    () => {
                        $e.removeData(dataKey)
                    });
                $e.data(dataKey, instance);
            }
            if (isMethodName) {
                let methodName = options;
                if (typeof instance[methodName] === 'undefined') {
                    throw new TypeError(`No method named '${methodName}'`)
                }
                instance[methodName]()
            }
        })
    }

    $.fn[prototypableName] = prototypable;

    // pluginName with first capitalized letter - return plugin instance (for 1st $selected item)
    $.fn[pluginName] = function () {
        let instance = $(this).data(dataKey);
        return instance;
        // if (instance)
        //     return instance;
        // else
    };

    $.fn[prototypableName].noConflict = function () {
        $.fn[prototypableName] = noConflictPrototypable
        return prototypable;
    }

    $.fn[prototypableName].defaults = defaults;
}