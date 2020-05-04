export function PluginManager(plugins, pluginData){
    let instances = [];
    if (plugins){
        for(let i = 0; i<plugins.length; i++){
            let instance = plugins[i](pluginData)
            if (instance)
                instances.push(instance);
        }
    }
    
    let disposes = [];
    return {
        afterConstructor(multiSelect){
            for(let i = 0; i<instances.length; i++){
                let dispose = instances[i].afterConstructor?.(multiSelect)
                if (dispose)
                    disposes.push(dispose);
            }
        },
        dispose(){
            for(let i = 0; i<disposes.length; i++){
                disposes[i]()
            }
            disposes=null;
            for(let i = 0; i<instances.length; i++){
                instances[i].dispose?.()
            }
            instances=null;
        }
    }
}

export function initiateDefaults(constructors, defaults){
    for(let i = 0; i<constructors.length; i++){
        constructors[i].setDefaults?.(defaults)
    }
}

export function mergeDefaults(constructors, configuration, defaults, settings){
    for(let i = 0; i<constructors.length; i++){
        constructors[i].mergeDefaults?.(configuration, defaults, settings)
    }
}

export function onConfiguration(constructors, configuration){
    for(let i = 0; i<constructors.length; i++){
        constructors[i].onConfiguration?.(configuration)
    }
}
