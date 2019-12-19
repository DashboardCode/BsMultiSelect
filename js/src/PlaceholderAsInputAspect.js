export default function PlaceholderAsInputAspect(placeholderText, picksIsEmpty, filterIsEmpty, picksElement, inputElement ){
    inputElement.placeholder = placeholderText?placeholderText:"";
    picksElement.style.display= "block";
    inputElement.style.width="100%";
    
    function setEmptyInputWidth(isVisible){
        if(isVisible)
            inputElement.style.width="100%"
        else
            inputElement.style.width="2ch";
    }

    // function setPadding(isVisible){
    //     // if (isVisible){
    //     //     let compStyles = window.getComputedStyle(picksElement);
    //     //     var padding = compStyles.getPropertyValue("padding");
    //     //     picksElement.style.padding=padding;
    //     // }
    //     // else {
    //     //     picksElement.style.padding=null;
    //     // }
    //     console.log(picksElement.style.padding);
    // }

    function showPlacehodler(isVisible){
        if (isVisible)
        {
            inputElement.placeholder = placeholderText?placeholderText:"";
            picksElement.style.display= "block";
            //inputElement.style.width="100%";
        }
        else
        {
            inputElement.placeholder = "";
            picksElement.style.display= "flex";
        }
        //setPadding(isVisible);
        setEmptyInputWidth(isVisible);
    }

    return {
        updatePlacehodlerVisibility(){
            showPlacehodler(picksIsEmpty() && filterIsEmpty());
        },
        init(){
        },
        placeholderItemElement:null,
        adjustForDisabled(isDisabled)
        { 
            inputElement.disabled = isDisabled;
        },
        updateEmptyInputWidth(){
            setEmptyInputWidth(picksIsEmpty() && filterIsEmpty())
        }//,
        // updatePadding(){
        //     setPadding(picksIsEmpty() && filterIsEmpty())
        // }
    }
}