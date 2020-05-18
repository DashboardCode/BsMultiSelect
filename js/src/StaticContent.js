export function StaticContent(filterInputElement, choicesElement, Popper) { 
    choicesElement.style.display = 'none';
    let popper = null;
    let popperConfiguration = {
        placement: 'bottom-start',
        modifiers: {
            preventOverflow: {enabled:true},
            hide: {enabled:false},
            flip: {enabled:false}
        }
    };

    return {
        attachContainer(){ 
            //if (!!Popper.prototype && !!Popper.prototype.constructor.name) {
            popper = new Popper(filterInputElement, choicesElement, popperConfiguration);
            /*}else{
                popper=Popper.createPopper(
                    filterInputElement,
                    choicesElement,
                    //  https://github.com/popperjs/popper.js/blob/next/docs/src/pages/docs/modifiers/prevent-overflow.mdx#mainaxis
                    // {
                    //     placement: isRtl?'bottom-end':'bottom-start',
                    //     modifiers: { preventOverflow: {enabled:false}, hide: {enabled:false}, flip: {enabled:false} }
                    // }
                );
            }*/
        },        
        isChoicesVisible(){ return choicesElement.style.display != 'none'},
        setChoicesVisible(visible){
            choicesElement.style.display = visible ? 'block' : 'none';
        },
        popperConfiguration,
        updatePopupLocation(){
            popper.update(); 
        },
        dispose(){
            popper.destroy();
        }
    }
}