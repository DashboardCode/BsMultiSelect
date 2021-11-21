import {composeSync} from '../ToolsJs';

export function UpdateAppearancePlugin(){
    return {
        plug
    }
}

export function plug(){
    return (aspects) => {
        return {
            layout: () => {
                var {updateAppearanceAspect, updateAspect, loadAspect} = aspects;

                updateAspect.update = composeSync(updateAspect.update, ()=>updateAppearanceAspect.updateAppearance())
                loadAspect.load = composeSync(loadAspect.load, ()=>updateAppearanceAspect.updateAppearance())

                return{
                    buildApi(api){
                        api.updateAppearance = ()=>updateAppearanceAspect.updateAppearance();
                    }
                }
            },
            plugStaticDom: ()=> {
                aspects.updateAppearanceAspect = UpdateAppearanceAspect();
            }
        }
    }
}

function UpdateAppearanceAspect(){
    return {
        updateAppearance(){}
    }
}