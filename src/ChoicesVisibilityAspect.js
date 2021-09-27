export function ChoicesVisibilityAspect(choicesElement) {

    return {
        isChoicesVisible(){ 
            return choicesElement.style.display != 'none'},
        setChoicesVisible(visible){
            choicesElement.style.display = visible ? 'block' : 'none';
        },
        updatePopupLocation(){

        }
    }
}
