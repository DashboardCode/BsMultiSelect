export function PopupAspect(choicesElement, filterInputElement, createPopper) { 
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
        init(){ 
            if (!!createPopper.prototype && !!createPopper.prototype.constructor.name) { // it is a constructor
                popper = new createPopper(filterInputElement, choicesElement, popperConfiguration); 
            }else{
                popper = createPopper(filterInputElement, choicesElement, popperConfiguration); 
                //throw new Error("BsMultiSelect: popper paramater is not a constructor")
            }
        },        
        isChoicesVisible(){ return choicesElement.style.display != 'none'},
        setChoicesVisible(visible){
            choicesElement.style.display = visible ? 'block' : 'none';
        },
        popperConfiguration,
        updatePopupLocation(){
            popper.update();  // become async in poppoer 2; use forceUpdate if sync is needed? 
        },
        dispose(){
            popper.destroy();
        }
    }
}