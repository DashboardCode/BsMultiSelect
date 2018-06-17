function AddToJQueryPrototype(pluginName, createPlugin, $){
    const prototypedName = pluginName.charAt(0).toLowerCase() + pluginName.slice(1)
    const noConflictPrototypable = $.fn[prototypedName];
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
                    throw new TypeError(`No method named "${methodName}"`)
                }
                instance[methodName]()
            }
        })
    }

    $.fn[prototypedName] = prototypable;

    // pluginName with first capitalized letter - return plugin instance for 1st $selected item
    $.fn[pluginName] = function () {
        return $(this).data(dataKey);
    };

    $.fn[prototypedName].noConflict = function () {
        $.fn[prototypedName] = noConflictPrototypable
        return prototypable;
    }
}

export default AddToJQueryPrototype
