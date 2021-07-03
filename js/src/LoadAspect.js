
export function LoadAspect(optionsLoopAspect, appearanceAspect){
    return {
        load(){  // redriven in FormRestoreOnBackwardPlugin
            optionsLoopAspect.loop();
            appearanceAspect.updateAppearance(); 
        }
    }
}