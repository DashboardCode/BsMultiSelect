export function FloatingLabelCssPatchBs5Plugin(defaults){
    let cssPatch = defaults.cssPatch;
    cssPatch.label_floating_lifted = {opacity: '.65', transform : 'scale(.85) translateY(-.5rem) translateX(.15rem)'};
    cssPatch.picks_floating_lifted = {paddingTop: '1.625rem', paddingLeft:'0.8rem', paddingBottom : '0'};
}