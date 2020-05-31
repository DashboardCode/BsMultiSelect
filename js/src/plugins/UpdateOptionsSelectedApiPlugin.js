export function UpdateOptionsSelectedApiPlugin(pluginData){
    let {choices, dataSourceAspect} = pluginData;
    return {
        buildApi(api){
            // used in FormRestoreOnBackwardPlugin
            api.updateOptionsSelected = () => {
                choices.forLoop(
                    choice => {
                        let newIsSelected = dataSourceAspect.getSelected(choice.option);
                        if (newIsSelected != choice.isOptionSelected)
                        {
                            choice.isOptionSelected = newIsSelected;
                            choice.updateSelected();
                        }
                    }
                );
            }
        }
    }
}