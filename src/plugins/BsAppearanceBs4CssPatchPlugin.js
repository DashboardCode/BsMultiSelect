export function BsAppearanceBs4CssPatchPlugin(defaults){
    let cssPatch = defaults.cssPatch;
    cssPatch.picks_def = {minHeight: 'calc(2.25rem + 2px)'};
    cssPatch.picks_lg = {minHeight: 'calc(2.875rem + 2px)'};
    cssPatch.picks_sm = {minHeight: 'calc(1.8125rem + 2px)'};

    cssPatch.picks_focus_valid = {borderColor: '', boxShadow: '0 0 0 0.2rem rgba(40, 167, 69, 0.25)'};
    cssPatch.picks_focus_invalid = {borderColor: '', boxShadow: '0 0 0 0.2rem rgba(220, 53, 69, 0.25)'};           
}