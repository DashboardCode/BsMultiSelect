
export function LoadAspect(optionsLoopAspect){
    return{
        load(){  // redriven in AppearancePlugin, FormRestoreOnBackwardPlugin
            optionsLoopAspect.loop();
        }
    }
}