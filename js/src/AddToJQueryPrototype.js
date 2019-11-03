function AddToJQueryPrototype(pluginName, createPlugin, $){
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
                if (isMethodName && /Dispose/.test(options)) {
                    return;
                }
                const optionsObject = (typeof options === 'object')?options:null;

                instance = createPlugin(this, optionsObject,
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

    // pluginName with first capitalized letter - return plugin instance for 1st $selected item
    $.fn[pluginName] = function () {
        return $(this).data(dataKey);
    };

    $.fn[prototypableName].noConflict = function () {
        $.fn[prototypableName] = noConflictPrototypable
        return prototypable;
    }
}

export default AddToJQueryPrototype;