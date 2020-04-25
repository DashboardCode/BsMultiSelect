export function PluginManager(plugins){
    return {
        afterConstructor(multiSelect){
            for(let i = 0; i<plugins.length; i++){
                plugins[i].afterConstructor?.(multiSelect)
            }
        },
        afterInit(multiSelect){
            for(let i = 0; i<plugins.length; i++){
                plugins[i].afterInit?.(multiSelect)
            }
        },
        afterLoad(multiSelect){
            for(let i = 0; i<plugins.length; i++){
                plugins[i].afterLoad?.(multiSelect)
            }
        }
    }
}