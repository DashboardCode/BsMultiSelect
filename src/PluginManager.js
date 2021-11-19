import {extendIfUndefined} from './ToolsJs';

export function ComposePluginManagerFactory(plugins, defaults){
    let buildAspectsList = [];

    for(let i = 0; i<plugins.length; i++){
        let buildAspects =  plugins[i].value(defaults);
        if (buildAspects){
            buildAspectsList.push({key:plugins[i].key, value:buildAspects});
        }
    }
    
    return (configuration, settings)=>{
        let eventHandlers = [];
        let aspects = {};
        for(let i = 0; i<buildAspectsList.length; i++){
            let events = buildAspectsList[i].value.buildAspects(aspects, configuration, settings)
            if (events){
                eventHandlers.push({key:buildAspectsList[i].key, value:events});
            }
        }
        return PluginManager(aspects, eventHandlers);
    };
}

export function PluginManager(aspects, eventHandlers){
    let instances = [];
    let disposes = [];
    
    return {
        aspects, // TODO: hide
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
        layout(newAspects){
            extendIfUndefined(aspects, newAspects)
            if (eventHandlers){
                // TODO: complete to full bus event system
                for(let i = 0; i<eventHandlers.length; i++){
                    let a = eventHandlers[i].value;
                    if (a.plugStaticDomBus){
                        if (eventHandlers.some(c => c.key===a.plugStaticDomBus.after))
                            a.plugStaticDomBus.plugStaticDom?.(aspects);
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