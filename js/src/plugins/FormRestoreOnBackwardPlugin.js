export function FormRestoreOnBackwardPlugin(pluginData){
    let {staticDom, environment, loadAspect} = pluginData;
    let window = environment.window;
    return {
        buildApi(api){
            if (!api.updateOptionsSelected)
                throw new Error("BsMultisilect: FormRestoreOnBackwardPlugin requires SelectedOptionPlugin defined first");
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