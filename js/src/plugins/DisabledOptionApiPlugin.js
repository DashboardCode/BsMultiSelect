export function DisabledOptionApiPlugin(pluginData){
    let {choices, optionPropertiesAspect} = pluginData;
    return {
        buildApi(api){
            api.updateOptionsDisabled = () => updateOptionsDisabled(choices, optionPropertiesAspect)
        }
    };
}

function updateOptionsDisabled(choices, optionPropertiesAspect){
    choices.forLoop(
        choice => {
            let newIsDisabled = optionPropertiesAspect.getDisabled(choice.option);
            if (newIsDisabled != choice.isOptionDisabled)
            {
                choice.isOptionDisabled= newIsDisabled;
                choice.updateDisabled();
            }
        }
    );
}