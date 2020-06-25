export function OptionToggleAspect(setOptionSelectedAspect){
    return {
        toggle: (wrap) => setOptionSelectedAspect.setOptionSelected(wrap, !wrap.isOptionSelected)
    }
}
