export function addToJQueryPrototype(pluginName, createPlugin, $){
    const firstChar = pluginName.charAt(0);
    const firstCharLower = firstChar.toLowerCase();
    if (firstCharLower == firstChar) {
        throw new Error(`Plugin name '${pluginName}' should be started from upper case char`)
    }
    const prototypableName = firstCharLower + pluginName.slice(1)
    const noConflictPrototypable = $.fn[prototypableName];
    const noConflictPrototypableForInstance = $.fn[pluginName];
    const dataKey = `DashboardCode.${pluginName}`;

    function createInstance(options, e, $e){
        const optionsRef = (typeof options === 'object') || options instanceof Function ? options:null;
        let instance = createPlugin(e, optionsRef,
            () => {
                $e.removeData(dataKey)
            });
        $e.data(dataKey, instance);
        return instance;
    }

    function prototypable(options){
        let output=[];
        this.each( function (i, e) {
            let $e = $(e);
            let instance = $e.data(dataKey)
            let isMethodName = typeof options === 'string';
            if (!instance) {
                if (isMethodName && /Dispose/.test(options)) 
                    return;
                instance = createInstance(options, e, $e);
            }
            if (isMethodName) {
                let methodName = options;
                if (typeof instance[methodName] === 'undefined') {
                    let lMethodName = methodName.charAt(0).toLowerCase() + methodName.slice(1)
                    if ( typeof instance[lMethodName] === 'undefined') {
                        throw new Error(`No method named '${methodName}'`)
                    } else {
                        methodName = lMethodName;
                    }
                }
                let result = instance[methodName]();
                if (result !== undefined){
                    output.push(result);
                }
            }
        })
        if (output.length==0)
            return this;
        else if (output.length==1)
            return output[0];
        else
            return output;
    }

    function prototypableForInstance(options){
        let instance = this.data(dataKey);
        if (instance)
            return instance;
        else if (this.length === 1){
            return createInstance(options, this.get(0), this);
        } else if (this.length > 1){
            let output=[];
            this.each(function(i, e){
                output.push(createInstance(options, e, $(e)));
            })
            return output;
        }
    }
    
    $.fn[prototypableName] = prototypable;
    $.fn[prototypableName].noConflict = function () {
        $.fn[prototypableName] = noConflictPrototypable
        return prototypable;
    }

    $.fn[pluginName] = prototypableForInstance;
    $.fn[pluginName].noConflict = function () {
        $.fn[pluginName] = noConflictPrototypableForInstance
        return prototypableForInstance;
    }

    return prototypable;
}