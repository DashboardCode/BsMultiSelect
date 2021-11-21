import {composeSync} from '../ToolsJs';

export function FormRestoreOnBackwardPlugin(){
    return {
        plug
    }
}

export function plug(){
    return (aspects) => {
        return {
            layout: () => {
                let {staticDom, environment, loadAspect, updateOptionsSelectedAspect} = aspects;
                let window = environment.window;
            
                if (staticDom.selectElement && updateOptionsSelectedAspect){
                    loadAspect.load = composeSync(loadAspect.load,
                        function(){
                            // support browser's "step backward" and form's values restore
                            if (window.document.readyState !="complete"){
                                window.setTimeout(function(){
                                    updateOptionsSelectedAspect.updateOptionsSelected();
                                // there are no need to add more updates as api.updateWasValidated() because backward never trigger .was-validate
                                // also backward never set the state to invalid
                                });
                            }
                        })
                }
            }
        }
    }
}