import {extendIfUndefined} from './ToolsJs';

export function ComposePluginManagerFactory(plugins, defaults){ 
    let plugedList = [];
    let mergeList = [];
    for(let i = 0; i<plugins.length; i++){
        let pluged =  plugins[i].value(defaults);
        if (pluged){
            if (pluged.plug)
                plugedList.push({key:plugins[i].key, value:pluged.plug})
            if (pluged.merge)
                mergeList.push({key:plugins[i].key, value:pluged.merge})
        }
    }
    
    return (configuration, settings) => {
        let buildAspectsList = [];
        for(let i = 0; i<mergeList.length; i++){
            let merge = mergeList[i].value
            if (merge){
                merge(configuration, settings)
            }
        }
        for(let j = 0; j<plugedList.length; j++){
            let buildAspects = plugedList[j].value(configuration);
            if (buildAspects) {
                buildAspectsList.push({key:plugedList[j].key, value:buildAspects})
                // let events = tmp(aspects)
                // if (events)
                //     eventHandlers.push({key:buildAspectsList[j].key, value:events})
            }
        }
        return PluginManager(buildAspectsList);
    };
}

export function PluginManager(buildAspectsList){
    let aspects = {};
    let createHandlers = (newAspects)=> {
        extendIfUndefined(aspects, newAspects)
        let instances = [];
        let disposes = [];
    
        var eventHandlers = [];
        for(let j = 0; j<buildAspectsList.length; j++){
            let eh = buildAspectsList[j].value(aspects);
            if (eh) {
                eventHandlers.push({key:buildAspectsList[j].key, value:eh})
            }
        }

        return  {
            buildApi(api){
                for(let i = 0; i<instances.length; i++){
                    let dispose = instances[i].buildApi?.(api)
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
            },
            plugStaticDomFactories(newAspects){
                extendIfUndefined(aspects, newAspects)
                for(let i = 0; i<eventHandlers.length; i++){
                    eventHandlers[i].value.plugStaticDomFactories?.(aspects);
                }
            },
            plugStaticDom(newAspects){
                extendIfUndefined(aspects, newAspects)
                for(let i = 0; i<eventHandlers.length; i++){
                    eventHandlers[i].value.plugStaticDom?.(aspects);
                }
            },
            // 
            layout(newAspects){
                extendIfUndefined(aspects, newAspects)
                if (eventHandlers){
                    // TODO: complete to full bus event system
                    for(let i = 0; i<eventHandlers.length; i++){
                        let a = eventHandlers[i].value;
                        if (a.preLayoutBus){
                            if (eventHandlers.some(c => c.key===a.preLayoutBus.after)) // only check, not order
                                a.preLayoutBus.preLayout?.(aspects);
                        }
                    }
                
                    for(let i = 0; i<eventHandlers.length; i++){
                        let instance = eventHandlers[i].value.layout?.(aspects)
                        if (instance)
                            instances.push(instance);

                    }
                
                }
            },
            attach(){
                if (eventHandlers)
                    for(let i = 0; i<eventHandlers.length; i++){
                        eventHandlers[i].value.attach?.(aspects)
                    }
            }
        }
    }
    return {
        aspects,
        createHandlers
    };
}