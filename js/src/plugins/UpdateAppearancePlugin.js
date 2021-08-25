import {composeSync} from '../ToolsJs';

export function UpdateAppearancePlugin(aspects){
    var {updateAppearanceAspect, updateAspect, loadAspect} = aspects;
    
    updateAspect.update = composeSync(updateAspect.update, ()=>updateAppearanceAspect.updateAppearance())
    loadAspect.load = composeSync(loadAspect.load, ()=>updateAppearanceAspect.updateAppearance())

    return{
        buildApi(api){
            api.updateAppearance = ()=>updateAppearanceAspect.updateAppearance();
        }
    }
}

UpdateAppearancePlugin.plugStaticDom = (aspects) => {
    aspects.updateAppearanceAspect = UpdateAppearanceAspect();
}

function UpdateAppearanceAspect(){
    return {
        updateAppearance(){}
    }
}