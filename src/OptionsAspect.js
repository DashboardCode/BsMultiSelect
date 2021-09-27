export function OptionsAspect(options){
    return {
        getOptions : () => options
    }
}

export function OptionPropertiesAspect(getText){
    if (!getText){
        getText = (option) => option.text;
    }
    return {
        getText
    }
}
