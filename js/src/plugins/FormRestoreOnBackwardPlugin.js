export function FormRestoreOnBackwardPlugin(pluginData){
    let {staticDom, environment, loadAspect, configuration} = pluginData;
    let window = environment.window;
    return {
        buildApi(api){
            if (!api.updateOptionsSelected){
                if (options && configuration.setSelected)
                    throw new Error("BsMultisilect: FormRestoreOnBackwardPlugin requires SelectedOptionPlugin defined first");
            }
            else{
                let origLoadAspectLoad = loadAspect.load;
                loadAspect.load = ()=>{
                    origLoadAspectLoad();
                    // support browser's "step backward" and form's values restore
                    if (staticDom.selectElement && window.document.readyState !="complete"){
                        window.setTimeout(function(){
                            //TODO : from do not use api, migrate to aspects
                            //console.log("FormRestoreOnBackwardPlugin");
                            api.updateOptionsSelected();
                            // there are no need to add more updates as api.updateWasValidated() because backward never trigger .was-validate
                            // also backward never set the state to invalid
                        });
                    }
                }
            }
        }
    }
}