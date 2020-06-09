export function OptionsAspect(options){
    return {
        getOptions : () => options
    }
}

export function OptionPropertiesAspect(getText, getSelected, setSelected, getDisabled){
    if (!getText){
        getText = (option) => option.text;
    }
    if (!getSelected){
        getSelected = (option) => option.selected;
    }
    if (!setSelected){
        setSelected = (option, value) => {option.selected = value};
        // TODO: move to sql
        // NOTE: adding this (setAttribute) break Chrome's html form reset functionality:
        // if (value) option.setAttribute('selected','');
        // else option.removeAttribute('selected');
    }
    if (!getDisabled)
        getDisabled = option => (option.disabled===undefined) ? false : option.disabled;
    return {
        getText,
        getSelected,
        setSelected,
        getDisabled
    }
}
