function defPlaceholderStyleSys(s) {s.position='relative'; s.overflow='hidden'; s.whiteSpace='nowrap'; };

export default function PlaceholderAsElementAspect(placeholderText, picksIsEmpty, filterIsEmpty, picksElement, inputElement, createElement,  getIsComponentDisabled, inputItemElement){
    
    var placeholderItemElement = createElement('LI');
    placeholderItemElement.textContent = placeholderText;
    defPlaceholderStyleSys(placeholderItemElement.style); 
    
    function showPlacehodler(isVisible){
        placeholderItemElement.style.display= isVisible?"block":"none";
        placeholderItemElement.style.left=getIsComponentDisabled()?"auto":"-1rem";
        picksElement.style.flexWrap= isVisible?"nowrap":"wrap";
    }
    return {
        updatePlacehodlerVisibility(){
            showPlacehodler(picksIsEmpty() && filterIsEmpty());
        },
        showPlacehodler,
        init(){
            picksElement.appendChild(placeholderItemElement); // placeholder should be last this is used in css
        },
        placeholderItemElement,
        adjustForDisabled(isDisabled)
        { 
            inputItemElement.style.display = isDisabled?"none":"block";                    
        },
        setEmptyLength(){
            inputElement.style.width="1rem";
        }

    }
}