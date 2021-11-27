import {composeSync} from '../ToolsJs';

export function UpdateAppearancePlugin(){
    return {
        plug
    }
}

export function plug(){
    var updateAppearanceAspect = UpdateAppearanceAspect();
    return (aspects) => {
        aspects.updateAppearanceAspect = updateAppearanceAspect;
        return {
            layout: () => {
                var {updateAspect, loadAspect} = aspects;

                updateAspect.update = composeSync(updateAspect.update, ()=>updateAppearanceAspect.updateAppearance())
                loadAspect.load = composeSync(loadAspect.load, ()=>updateAppearanceAspect.updateAppearance())

                return{
                    buildApi(api){
                        api.updateAppearance = ()=>updateAppearanceAspect.updateAppearance();
                    }
                }
            }
            
        }
    }
}

function UpdateAppearanceAspect(){
    return {
        updateAppearance(){}
    }
}