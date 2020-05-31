export function FormRestoreOnBackwardPlugin(pluginData){
    let {staticDom, environment, loadAspect} = pluginData;
    let window = environment.window;
    return {
        afterConstructor(multiSelect){
            let origLoad = loadAspect.load;
            loadAspect.load = ()=>{
                origLoad();
                // support browser's "step backward" and form's values restore
                if (staticDom.selectElement && window.document.readyState !="complete"){
                    window.setTimeout(function(){multiSelect.updateOptionsSelected()});
                }
            }
        }
    }
}