export default function EventSkipper(window) {
    var isSkippable = false;
    return {
        isSkippable(){
            return isSkippable;
        },
        setSkippable(){
            isSkippable = true;
            window.setTimeout( 
                () => {  
                    isSkippable = false;
                }, 0)
        }
    }
}