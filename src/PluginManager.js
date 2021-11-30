import {extendIfUndefined} from './ToolsJs';

function parseEventHandler(key, eventHandler, doms, plugStaticDoms, preLayouts, layouts, appends, buildApis, disposes){
    if (eventHandler) {
        if (eventHandler.dom)
            doms.push({key, value:eventHandler.dom});
        if (eventHandler.plugStaticDom)
            plugStaticDoms.push({key, value:eventHandler.plugStaticDom});
        if (eventHandler.preLayout)
            preLayouts.push({key, value:eventHandler.preLayout});
        if (eventHandler.layout)
            layouts.push({key, value:eventHandler.layout});
        if (eventHandler.append)
            appends.push({key, value:eventHandler.append});
        if (eventHandler.buildApi)
            buildApis.push({key, value:eventHandler.buildApi});
        if (eventHandler.dispose)
            disposes.push({key, value:eventHandler.dispose});
    }
}

export function ComposePluginManagerFactory(plugins, defaults, environment){ 
    let plugedList = [];
    let mergeList = [];
    for(let i = 0; i<plugins.length; i++){
        let pluged =  plugins[i].value(defaults, environment);
        if (pluged){
            if (pluged.plug)
                plugedList.push({key:plugins[i].key, value:pluged.plug})
            if (pluged.merge)
                mergeList.push({key:plugins[i].key, value:pluged.merge})
        }
    }
    
    return (configuration, settings, inlineBuildAspects) => {
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
            }
        }
        if (inlineBuildAspects)
            buildAspectsList.push({key:"", value:inlineBuildAspects})
        return PluginManager(environment, buildAspectsList);
    };
}

export function PluginManager(environment, buildAspectsList){
    let aspects = {environment};
    let createHandlers = (newAspects)=> {
        extendIfUndefined(aspects, newAspects)

        var doms = [];
        var plugStaticDoms = [];
        var preLayouts = [];
        var layouts = [];
        var appends = [];
        var buildApis = [];
        let disposes = [];
        for(let k = 0; k<buildAspectsList.length; k++){
            let eventHandler = buildAspectsList[k].value(aspects);
            parseEventHandler(buildAspectsList[k].key, eventHandler, doms, plugStaticDoms, preLayouts, layouts, appends, buildApis, disposes);
        }

        return  {
            dom(newAspects){
                extendIfUndefined(aspects, newAspects);
                for(let i = 0; i<doms.length; i++){
                    var eventHandler = doms[i].value?.();
                    parseEventHandler(doms[i].key, eventHandler, doms, plugStaticDoms, preLayouts, layouts, appends, buildApis, disposes);
                }
            },
            plugStaticDom(newAspects){
                extendIfUndefined(aspects, newAspects);
                for(let i = 0; i<plugStaticDoms.length; i++){
                    var eventHandler = plugStaticDoms[i].value?.();
                    parseEventHandler(plugStaticDoms[i].key, eventHandler, doms, plugStaticDoms, preLayouts, layouts, appends, buildApis, disposes);
                }
            },
            layout(newAspects){
                extendIfUndefined(aspects, newAspects);
                for(let i = 0; i<preLayouts.length; i++){
                    let eventHandler = preLayouts[i].value?.();
                    parseEventHandler(preLayouts[i].key, eventHandler, doms, plugStaticDoms, preLayouts, layouts, appends, buildApis, disposes);
                }
                for(let j = 0; j<layouts.length; j++){
                    let eventHandler = layouts[j].value?.();
                    parseEventHandler(layouts[j].key, eventHandler, doms, plugStaticDoms, preLayouts, layouts, appends, buildApis, disposes);
                }
            },
            append(){
                for(let i = 0; i<appends.length; i++){
                    var eventHandler = appends[i].value?.();
                    parseEventHandler(appends[i].key, eventHandler, doms, plugStaticDoms, preLayouts, layouts, appends, buildApis, disposes);
                }
            },
            buildApi(api){
                for(let i = 0; i<buildApis.length; i++){
                    var eventHandler = buildApis[i].value?.(api);
                    parseEventHandler(buildApis[i].key, eventHandler, doms, plugStaticDoms, preLayouts, layouts, appends, buildApis, disposes);
                }
            },
            dispose(){
                for(let i = 0; i<disposes.length; i++){
                    disposes[i].value?.();
                }
            }
        }
    }
    return {
        aspects,
        createHandlers
    };
}