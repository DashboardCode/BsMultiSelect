function OptionsAdapter(getOptions, getDisabled, getSize, getValidity, onChange){
    if (!getValidity)
        getValidity=()=>null
    if (!getDisabled)
        getDisabled=()=>false;
    if (!getSize)
        getSize=()=>null;
    return {
        getOptions,
        getDisabled,
        getSize,
        getValidity,
        onChange
    }
}

export {OptionsAdapter}