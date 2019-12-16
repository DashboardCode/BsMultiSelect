export default function PlaceholderAsInputAspect(placeholderText, picksIsEmpty, filterIsEmpty, picksElement, inputElement, setLengthInput ){
    inputElement.placeholder = placeholderText?placeholderText:"";
    picksElement.style.display= "block";
    inputElement.style.width="100%";
    function showPlacehodler(isVisible){
        if (isVisible)
        {
            let compStyles = window.getComputedStyle(picksElement);
            var padding = compStyles.getPropertyValue("padding");
            inputElement.placeholder = placeholderText?placeholderText:"";
            picksElement.style.padding="0px";
            picksElement.style.display= "block";
            inputElement.style.width="100%";
            picksElement.style.padding=padding;
        }
        else
        {
            inputElement.placeholder = "";
            picksElement.style.padding=null;
            picksElement.style.display= "flex";
        }
        setLengthInput();
    }
    return {
        updatePlacehodlerVisibility(){
            showPlacehodler(picksIsEmpty() && filterIsEmpty());
        },
        showPlacehodler,
        init(){
        },
        placeholderItemElement:null,
        adjustForDisabled(isDisabled)
        { 
            inputElement.disabled = isDisabled;
        },
        setEmptyLength(){
            if(picksIsEmpty() && filterIsEmpty())
                inputElement.style.width="100%"
            else
                inputElement.style.width="2ch";
        }
    }
}