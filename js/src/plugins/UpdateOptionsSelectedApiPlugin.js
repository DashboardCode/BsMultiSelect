export function UpdateOptionsSelectedApiPlugin(pluginData){
    let {choicesCollection, optionPropertiesAspect} = pluginData;
    return {
        buildApi(api){
            // used in FormRestoreOnBackwardPlugin
            api.updateOptionsSelected = () => {
                choicesCollection.forLoop(
                    choice => {
                        let newIsSelected = optionPropertiesAspect.getSelected(choice.option);
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