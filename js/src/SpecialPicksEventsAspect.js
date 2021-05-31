export function SpecialPicksEventsAspect(){
    return {
        backSpace(pick){ 
            pick.setSelectedFalse(); 
            //popupAspect.updatePopupLocation();
        }
    }
}