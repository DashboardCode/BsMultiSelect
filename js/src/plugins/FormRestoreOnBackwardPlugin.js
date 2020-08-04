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
                let origLoad = loadAspect.load;
                loadAspect.load = ()=>{
                    origLoad();
                    // support browser's "step backward" and form's values restore
                    if (staticDom.selectElement && window.document.readyState !="complete"){
                        window.setTimeout(function(){api.updateOptionsSelected()});
                    }
                }
            }
        }
    }
}