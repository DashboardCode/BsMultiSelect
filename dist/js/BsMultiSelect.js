/*!
  * DashboardCode BsMultiSelect v0.4.5 (https://dashboardcode.github.io/BsMultiSelect/)
  * Copyright 2017-2019 Roman Pokrovskij (github user rpokrovskij)
  * Licensed under APACHE 2 (https://github.com/DashboardCode/BsMultiSelect/blob/master/LICENSE)
  */
(function (global, factory) {
   typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('jquery'), require('popper.js')) :
   typeof define === 'function' && define.amd ? define(['jquery', 'popper.js'], factory) :
   (global = global || self, factory(global.jQuery, global.Popper));
}(this, (function ($, Popper) { 'use strict';

   $ = $ && $.hasOwnProperty('default') ? $['default'] : $;
   Popper = Popper && Popper.hasOwnProperty('default') ? Popper['default'] : Popper;

   function defFilterInputStyleSys(s) {
     s.width = '2ch';
     s.border = '0';
     s.padding = '0';
     s.outline = 'none';
     s.backgroundColor = 'transparent';
   }

   function FilterPanel(insertIntoDom, onFilterInputFocusIn, // show dropdown
   onFilterInputFocusOut, // hide dropdown
   keyDownArrowUp, keyDownArrowDown, hideDropDown, removeSelectedTail, // backspace alike
   resetDropDownMenuHover, toggleHovered, // "compleate alike"
   resetFilterAndHideDropDown, // "esc" alike
   input // filter
   ) {
     var filterInput = document.createElement('INPUT');
     filterInput.setAttribute("type", "search");
     filterInput.setAttribute("autocomplete", "off");
     defFilterInputStyleSys(filterInput.style);
     insertIntoDom(filterInput);

     var onfilterInputKeyDown = function onfilterInputKeyDown(event) {
       if ([38, 40, 13].indexOf(event.which) >= 0 || event.which == 9 && filterInput.value) {
         event.preventDefault(); // for 9 it enables keyup
       }

       if (event.which == 38) {
         keyDownArrowUp();
       } else if (event.which == 40) {
         keyDownArrowDown();
       } else if (event.which == 9
       /*tab*/
       ) {
           // no keydown for this
           if (!filterInput.value) {
             hideDropDown(); // filter is empty, nothing to reset
           }
         } else if (event.which == 8
       /*backspace*/
       ) {
           // NOTE: this will process backspace only if there are no text in the input field
           // If user will find this inconvinient, we will need to calculate something like this
           // this.isBackspaceAtStartPoint = (this.filterInput.selectionStart == 0 && this.filterInput.selectionEnd == 0);
           if (!filterInput.value) {
             removeSelectedTail();
           }
         }

       if ([38, 40, 13, 9].indexOf(event.which) == -1) resetDropDownMenuHover();
     };

     var onFilterInputKeyUp = function onFilterInputKeyUp(event) {
       if (event.which == 13 || event.which == 9) {
         toggleHovered();
       } else if (event.which == 27) {
         // escape
         resetFilterAndHideDropDown();
       }
     };

     var onFilterInputInput = function onFilterInputInput() {
       var filterInputValue = filterInput.value;
       input(filterInputValue, function () {
         return filterInput.style.width = filterInputValue.length * 1.3 + 2 + "ch";
       });
     };

     var setEmptyLength = function setEmptyLength() {
       filterInput.style.width = "2ch";
     };

     var setEmpty = function setEmpty() {
       filterInput.value = '';
       setEmptyLength();
     };

     filterInput.addEventListener('focusin', onFilterInputFocusIn);
     filterInput.addEventListener('focusout', onFilterInputFocusOut);
     filterInput.addEventListener('keydown', onfilterInputKeyDown);
     filterInput.addEventListener('keyup', onFilterInputKeyUp);
     filterInput.addEventListener('input', onFilterInputInput);
     var filterPanel = {
       input: filterInput,
       isEmpty: function isEmpty() {
         return filterInput.value ? false : true;
       },
       setEmpty: setEmpty,
       setEmptyLength: setEmptyLength,
       setFocus: function setFocus() {
         filterInput.focus();
       },
       isEventTarget: function isEventTarget(event) {
         return event.target == filterInput;
       },
       dispose: function dispose() {
         filterInput.removeEventListener('focusin', onFilterInputFocusIn);
         filterInput.removeEventListener('focusout', onFilterInputFocusOut);
         filterInput.removeEventListener('keydown', onfilterInputKeyDown);
         filterInput.removeEventListener('keyup', onFilterInputKeyUp);
         filterInput.removeEventListener('input', onFilterInputInput);
       }
     };
     return filterPanel;
   }

   function defSelectedPanelStyleSys(s) {
     s.display = 'flex';
     s.flexWrap = 'wrap';
     s.listStyleType = 'none';
   }

   function defDropDownMenuStyleSys(s) {
     s.listStyleType = 'none';
   }

   function removeElement(e) {
     e.parentNode.removeChild(e);
   }

   function filterMultiSelectData(MultiSelectData, isFiltered, visibleIndex) {
     MultiSelectData.visible = isFiltered;
     MultiSelectData.visibleIndex = visibleIndex;
     MultiSelectData.dropDownMenuItemElement.style.display = isFiltered ? 'block' : 'none';
   }

   function resetFilterDropDownMenu(MultiSelectDataList) {
     for (var i = 0; i < MultiSelectDataList.length; i++) {
       var multiSelectData = MultiSelectDataList[i];

       if (!multiSelectData.isHidden) {
         filterMultiSelectData(multiSelectData, true, i);
       }
     }
   }

   function filterDropDownMenu(MultiSelectDataList, text) {
     var list = [];
     var j = 0;

     for (var i = 0; i < MultiSelectDataList.length; i++) {
       var multiSelectData = MultiSelectDataList[i];

       if (!multiSelectData.isHidden) {
         if (multiSelectData.excludedFromSearch || multiSelectData.searchText.indexOf(text) < 0) {
           filterMultiSelectData(multiSelectData, false);
         } else {
           filterMultiSelectData(multiSelectData, true, j++);
           list.push(multiSelectData);
         }
       }
     }

     return list;
   }

   var MultiSelect =
   /*#__PURE__*/
   function () {
     function MultiSelect(optionsAdapter, styling, selectedItemContent, dropDownItemContent, labelAdapter, createStylingComposite, configuration, onDispose, window) {
       if (typeof Popper === 'undefined') {
         throw new TypeError('DashboardCode BsMultiSelect require Popper.js (https://popper.js.org)');
       } // readonly


       this.optionsAdapter = optionsAdapter;
       this.container = optionsAdapter.container; // part of published api

       this.styling = styling;
       this.selectedItemContent = selectedItemContent;
       this.dropDownItemContent = dropDownItemContent;
       this.labelAdapter = labelAdapter;
       this.createStylingComposite = createStylingComposite;
       this.configuration = configuration;
       this.onDispose = onDispose;
       this.isDisposed = false;
       this.window = window;
       this.document = window.document;
       this.popper = null;
       this.visibleCount = 10;
       this.selectedPanel = null;
       this.filterInputItem = null;
       this.dropDownMenu = null;
       this.stylingComposite = null; // removable handlers

       this.selectedPanelClick = null;
       this.documentMouseup = null;
       this.containerMousedown = null;
       this.documentMouseup2 = null; // state

       this.isComponentDisabled = null;
       this.filterInputItemOffsetLeft = null; // used to detect changes in input field position (by comparision with current value)

       this.resetMultiSelectDataList();
       this.skipFocusout = false;
       this.hoveredMultiSelectData = null;
       this.hoveredMultiSelectDataIndex = null;
     }

     var _proto = MultiSelect.prototype;

     _proto.resetMultiSelectDataList = function resetMultiSelectDataList() {
       this.MultiSelectDataList = [];
       this.MultiSelectDataSelectedTail = null;
       this.visibleMultiSelectDataList = null;
     };

     _proto.getVisibleMultiSelectDataList = function getVisibleMultiSelectDataList() {
       if (this.visibleMultiSelectDataList) return this.visibleMultiSelectDataList;else return this.MultiSelectDataList;
     };

     _proto.removeSelectedTail = function removeSelectedTail() {
       if (this.MultiSelectDataSelectedTail) {
         this.MultiSelectDataSelectedTail.toggle(); // always remove in this case
       }

       this.updateDropDownLocation(false);
     };

     _proto.updateDropDownLocation = function updateDropDownLocation(force) {
       var offsetLeft = this.filterInputItem.offsetLeft;

       if (force || this.filterInputItemOffsetLeft != offsetLeft) {
         this.popper.update();
         this.filterInputItemOffsetLeft = offsetLeft;
       }
     };

     _proto.hideDropDown = function hideDropDown() {
       if (this.candidateToHoveredMultiSelectData) {
         this.resetCandidateToHoveredMultiSelectData();
       }

       if (this.dropDownMenu.style.display != 'none') {
         this.dropDownMenu.style.display = 'none'; // remove listeners that manages close dropdown on input's focusout and click outside container

         this.container.removeEventListener("mousedown", this.containerMousedown);
         this.document.removeEventListener("mouseup", this.documentMouseup);
         this.document.removeEventListener("mouseup", this.documentMouseup2);
       }
     };

     _proto.setInShowDropDown = function setInShowDropDown() {
       var _this = this;

       this.inShowDropDown = true;
       setTimeout(function () {
         _this.inShowDropDown = null;
       }, 0);
     };

     _proto.showDropDown = function showDropDown() {
       if (this.dropDownMenu.style.display != 'block') {
         this.setInShowDropDown();
         this.dropDownMenu.style.display = 'block'; // add listeners that manages close dropdown on input's focusout and click outside container

         this.container.addEventListener("mousedown", this.containerMousedown);
         this.document.addEventListener("mouseup", this.documentMouseup);
         this.document.addEventListener("mouseup", this.documentMouseup2);
       }
     };

     _proto.hoverInInternal = function hoverInInternal(index) {
       this.hoveredMultiSelectDataIndex = index;
       this.hoveredMultiSelectData = this.getVisibleMultiSelectDataList()[index];
       this.styling.HoverIn(this.hoveredMultiSelectData.dropDownMenuItemElement);
     };

     _proto.resetDropDownMenuHover = function resetDropDownMenuHover() {
       if (this.hoveredMultiSelectData) {
         this.styling.HoverOut(this.hoveredMultiSelectData.dropDownMenuItemElement);
         this.hoveredMultiSelectData = null;
         this.hoveredMultiSelectDataIndex = null;
       }
     };

     _proto.resetFilter = function resetFilter() {
       if (!this.filterPanel.isEmpty()) {
         this.filterPanel.setEmpty();
         this.processEmptyInput();
       }
     };

     _proto.resetFilterAndHideDropDown = function resetFilterAndHideDropDown() {
       this.resetFilter();
       this.hideDropDown();
     };

     _proto.removeSelectedFromList = function removeSelectedFromList(MultiSelectData) {
       if (MultiSelectData.selectedPrev) {
         MultiSelectData.selectedPrev.selectedNext = MultiSelectData.selectedNext;
       }

       if (MultiSelectData.selectedNext) {
         MultiSelectData.selectedNext.selectedPrev = MultiSelectData.selectedPrev;
       }

       if (this.MultiSelectDataSelectedTail == MultiSelectData) {
         this.MultiSelectDataSelectedTail = MultiSelectData.selectedPrev;
       }

       MultiSelectData.selectedNext = null;
       MultiSelectData.selectedPrev = null;
     };

     _proto.insertDropDownItem = function insertDropDownItem(MultiSelectData, insertToDropDownMenu, isSelected, isOptionDisabled) {
       var _this2 = this;

       var dropDownMenuItemElement = this.document.createElement('LI'); // in chrome it happens on "become visible" so we need to skip it, 
       // for IE11 and edge it doesn't happens, but for IE11 and Edge it doesn't happens on small 
       // mouse moves inside the item. 
       // https://stackoverflow.com/questions/59022563/browser-events-mouseover-doesnt-happen-when-you-make-element-visible-and-mous

       var onDropDownMenuItemElementMouseover = function onDropDownMenuItemElementMouseover() {
         if (!_this2.inShowDropDown) {
           if (_this2.hoveredMultiSelectData != MultiSelectData) {
             // mouseleave is not enough to guarantee remove hover styles in situations
             // when style was setuped without mouse (keyboard arrows)
             // therefore force reset manually
             _this2.resetDropDownMenuHover();

             _this2.hoverInInternal(MultiSelectData.visibleIndex);
           }
         } else {
           _this2.candidateToHoveredMultiSelectData = MultiSelectData;
           dropDownMenuItemElement.addEventListener('mousemove', _this2.processCandidateToHovered);
           dropDownMenuItemElement.addEventListener('mousedown', _this2.processCandidateToHovered);
         }
       };

       dropDownMenuItemElement.addEventListener('mouseover', onDropDownMenuItemElementMouseover); // note 1: mouseleave preferred to mouseout - which fires on each descendant
       // note 2: since I want add aditional info panels to the dropdown put mouseleave on dropdwon would not work

       var onDropDownMenuItemElementMouseleave = function onDropDownMenuItemElementMouseleave() {
         return _this2.resetDropDownMenuHover();
       };

       dropDownMenuItemElement.addEventListener('mouseleave', onDropDownMenuItemElementMouseleave);
       insertToDropDownMenu(dropDownMenuItemElement);
       var dropDownItemContent = this.dropDownItemContent(dropDownMenuItemElement, MultiSelectData.option);
       MultiSelectData.dropDownMenuItemElement = dropDownMenuItemElement;
       MultiSelectData.DropDownItemContent = dropDownItemContent;

       MultiSelectData.DisposeDropDownMenuItemElement = function () {
         dropDownMenuItemElement.removeEventListener('mouseover', onDropDownMenuItemElementMouseover);
         dropDownMenuItemElement.removeEventListener('mouseleave', onDropDownMenuItemElementMouseleave);
       };

       var setDropDownItemContentDisabled = function setDropDownItemContentDisabled(dropDownItemContent, isSelected) {
         dropDownItemContent.disabledStyle(true); // do not desable if selected! there should be possibility to unselect "disabled"

         dropDownItemContent.disable(!isSelected);
       };

       if (isOptionDisabled) setDropDownItemContentDisabled(dropDownItemContent, isSelected);
       dropDownItemContent.onSelected(function () {
         MultiSelectData.toggle();

         _this2.filterPanel.setFocus();
       }); // ------------------------------------------------------------------------------

       var setPreventDefaultMultiSelectEvent = function setPreventDefaultMultiSelectEvent(event) {
         _this2.preventDefaultMultiSelectEvent = event;
       };

       var createSelectedItem = function createSelectedItem() {
         var selectedItemElement = _this2.document.createElement('LI');

         MultiSelectData.selectedItemElement = selectedItemElement;

         if (_this2.MultiSelectDataSelectedTail) {
           _this2.MultiSelectDataSelectedTail.selectedNext = MultiSelectData;
           MultiSelectData.selectedPrev = _this2.MultiSelectDataSelectedTail;
         }

         _this2.MultiSelectDataSelectedTail = MultiSelectData;

         var removeSelectedItem = function removeSelectedItem() {
           MultiSelectData.option.selected = false;
           MultiSelectData.excludedFromSearch = isOptionDisabled;

           if (isOptionDisabled) {
             setDropDownItemContentDisabled(dropDownItemContent, false);

             MultiSelectData.toggle = function () {};
           } else {
             MultiSelectData.toggle = function () {
               createSelectedItem();

               _this2.optionsAdapter.triggerChange();
             };
           }

           dropDownItemContent.select(false);
           removeElement(selectedItemElement);
           MultiSelectData.SelectedItemContent.dispose();
           MultiSelectData.SelectedItemContent = null;
           MultiSelectData.selectedItemElement = null;

           _this2.removeSelectedFromList(MultiSelectData);

           _this2.optionsAdapter.triggerChange();
         }; // what is a problem with calling removeSelectedItem directly (not using  setTimeout(removeSelectedItem, 0)):
         // consider situation "MultiSelect" on DROPDOWN (that should be closed on the click outside dropdown)
         // therefore we aslo have document's click's handler where we decide to close or leave the DROPDOWN open.
         // because of the event's bubling process removeSelectedItem runs first. 
         // that means the event's target element on which we click (the x button) will be removed from the DOM together with badge 
         // before we could analize is it belong to our dropdown or not.
         // important 1: we can't just the stop propogation using stopPropogate because click outside dropdown on the similar 
         // component that use stopPropogation will not close dropdown (error, dropdown should be closed)
         // important 2: we can't change the dropdown's event handler to leave dropdown open if event's target is null because of
         // the situation described above: click outside dropdown on the same component.
         // Alternatively it could be possible to use stopPropogate but together create custom click event setting new target that belomgs to DOM (e.g. panel)


         var removeSelectedItemAndCloseDropDown = function removeSelectedItemAndCloseDropDown() {
           removeSelectedItem();

           _this2.resetFilterAndHideDropDown();
         };

         var onRemoveSelectedItemEvent = function onRemoveSelectedItemEvent() {
           setTimeout(function () {
             removeSelectedItemAndCloseDropDown();
           }, 0);
         };

         MultiSelectData.SelectedItemContent = _this2.selectedItemContent(selectedItemElement, MultiSelectData.option, onRemoveSelectedItemEvent, setPreventDefaultMultiSelectEvent);

         var disable = function disable(isDisabled) {
           return MultiSelectData.SelectedItemContent.disable(isDisabled);
         };

         disable(_this2.isComponentDisabled);
         MultiSelectData.option.selected = true;
         MultiSelectData.excludedFromSearch = true; // all selected excluded from search
         //MultiSelectData.remove  = removeSelectedItemAndCloseDropDown;

         MultiSelectData.disable = disable;

         _this2.selectedPanel.insertBefore(selectedItemElement, _this2.filterInputItem);

         MultiSelectData.toggle = function () {
           return removeSelectedItem();
         };

         dropDownItemContent.select(true);
       };

       if (isSelected) {
         createSelectedItem();
       } else {
         MultiSelectData.excludedFromSearch = isOptionDisabled;
         if (isOptionDisabled) MultiSelectData.toggle = function () {};else MultiSelectData.toggle = function () {
           createSelectedItem();

           _this2.optionsAdapter.triggerChange();
         };
       }

       MultiSelectData.removeDropDownMenuItemElement = function () {
         removeElement(dropDownMenuItemElement);
         if (MultiSelectData.selectedItemElement != null) removeElement(MultiSelectData.selectedItemElement);
       };
     };

     _proto.keyDownArrowDown = function keyDownArrowDown() {
       this.keyDownArrow(true);
     };

     _proto.keyDownArrowUp = function keyDownArrowUp() {
       this.keyDownArrow(false);
     };

     _proto.keyDownArrow = function keyDownArrow(down) {
       var visibleMultiSelectDataList = this.getVisibleMultiSelectDataList();
       var length = visibleMultiSelectDataList.length;
       var newIndex = null;

       if (length > 0) {
         if (down) {
           var i = this.hoveredMultiSelectDataIndex == null ? 0 : this.hoveredMultiSelectDataIndex + 1;

           while (i < length) {
             if (visibleMultiSelectDataList[i].visible) {
               newIndex = i;
               break;
             }

             i++;
           }
         } else {
           var _i = this.hoveredMultiSelectDataIndex == null ? length - 1 : this.hoveredMultiSelectDataIndex - 1;

           while (_i >= 0) {
             if (visibleMultiSelectDataList[_i].visible) {
               newIndex = _i;
               break;
             }

             _i--;
           }
         }
       }

       if (newIndex != null) {
         if (this.hoveredMultiSelectData) this.styling.HoverOut(this.hoveredMultiSelectData.dropDownMenuItemElement);
         this.updateDropDownLocation(true);
         this.showDropDown();
         this.hoverInInternal(newIndex);
       }
     };

     _proto.processEmptyInput = function processEmptyInput() {
       this.filterPanel.setEmptyLength();
       resetFilterDropDownMenu(this.MultiSelectDataList);
       this.visibleMultiSelectDataList = null;
     };

     _proto.Update = function Update() {
       this.styling.UpdateIsValid(this.stylingComposite, this.optionsAdapter.getIsValid(), this.optionsAdapter.getIsInvalid());
       this.UpdateSize();
       this.UpdateDisabled();
     };

     _proto.UpdateOption = function UpdateOption(index) {
       var _this3 = this;

       var multiSelectData = this.MultiSelectDataList[index];
       var option = multiSelectData.option;
       multiSelectData.searchText = option.text.toLowerCase().trim();

       if (multiSelectData.isHidden != option.isHidden) {
         multiSelectData.isHidden = option.isHidden;
         if (multiSelectData.isHidden) this.insertDropDownItem(multiSelectData, function (e) {
           return _this3.dropDownMenu.appendChild(e);
         }, option.isSelected, option.isDisabled);else multiSelectData.removeDropDownMenuItemElement();
       } else {
         if (multiSelectData.isSelected != option.isSelected) {
           multiSelectData.isSelected = option.isSelected;

           if (multiSelectData.isSelected) ;
         }

         if (multiSelectData.isDisabled != option.isDisabled) {
           multiSelectData.isDisabled = option.isDisabled;

           if (multiSelectData.isDisabled) ;
         }
       } //multiSelectData.updateOption();

     };

     _proto.UpdateData = function UpdateData() {
       // close drop down , remove filter and listeners
       this.resetFilterAndHideDropDown();

       for (var i = 0; i < this.MultiSelectDataList.length; i++) {
         var multiSelectData = this.MultiSelectDataList[i];
         if (multiSelectData.removeDropDownMenuItemElement) multiSelectData.removeDropDownMenuItemElement();
       }

       this.resetMultiSelectDataList(); // reinitiate

       this.updateDataImpl();
     };

     _proto.updateDataImpl = function updateDataImpl() {
       var _this4 = this;

       var createDropDownItems = function createDropDownItems() {
         var options = _this4.optionsAdapter.getOptions();

         for (var i = 0; i < options.length; i++) {
           var option = options[i];
           var isDisabled = option.disabled;
           var isHidden = option.hidden;
           var isSelected = option.selected;
           var MultiSelectData = {
             searchText: option.text.toLowerCase().trim(),
             excludedFromSearch: isSelected || isDisabled || isHidden,
             option: option,
             isHidden: isHidden,
             dropDownMenuItemElement: null,
             dropDownItemContent: null,
             selectedPrev: null,
             selectedNext: null,
             visible: false,
             toggle: null,
             selectedItemElement: null,
             remove: null,
             disable: null,
             removeDropDownMenuItemElement: null
           };

           _this4.MultiSelectDataList.push(MultiSelectData);

           if (!isHidden) {
             MultiSelectData.visible = true;
             MultiSelectData.visibleIndex = i;

             _this4.insertDropDownItem(MultiSelectData, function (e) {
               return _this4.dropDownMenu.appendChild(e);
             }, isSelected, isDisabled);
           }
         }

         _this4.updateDropDownLocation(false);
       }; // some browsers (IE11) can change select value (as part of "autocomplete") after page is loaded but before "ready" event


       if (document.readyState != 'loading') {
         createDropDownItems();
       } else {
         var createDropDownItemsHandler = function createDropDownItemsHandler() {
           createDropDownItems();
           document.removeEventListener("DOMContentLoaded", createDropDownItemsHandler);
         };

         document.addEventListener('DOMContentLoaded', createDropDownItemsHandler); // IE9+
       }
     };

     _proto.Dispose = function Dispose() {
       this.isDisposed = true;
       if (this.onDispose) this.onDispose(); // primary used to remove from jQuery tables
       // remove event listeners
       // TODO check if open

       this.hideDropDown();
       this.selectedPanel.removeEventListener("click", this.selectedPanelClick); // OPEN dropdown

       this.filterPanel.dispose();
       this.labelAdapter.dispose();

       if (this.popper) {
         this.popper.destroy();
       }

       if (this.optionsAdapter.dispose) {
         this.optionsAdapter.dispose();
       }

       for (var i = 0; i < this.MultiSelectDataList.length; i++) {
         var multiSelectData = this.MultiSelectDataList[i];
         if (multiSelectData.DisposeDropDownMenuItemElement) multiSelectData.DisposeDropDownMenuItemElement();
         if (multiSelectData.SelectedItemContent) multiSelectData.SelectedItemContent.dispose();
         if (multiSelectData.DropDownItemContent) multiSelectData.DropDownItemContent.dispose();
       } // this.resetMultiSelectDataList();
       // this.onFilterInputInput = null;
       // this.onFilterInputKeyUp = null;
       // this.onfilterInputKeyDown = null;
       // this.onFilterInputFocusOut = null;
       // this.onFilterInputFocusIn = null;
       // this.selectedPanelClick = null;
       // this.containerMousedown = null;
       // this.documentMouseup = null;
       // this.documentMouseup2 = null;
       // this.processCandidateToHovered = null;

     };

     _proto.UpdateSize = function UpdateSize() {
       if (this.styling.UpdateSize) this.styling.UpdateSize(this.stylingComposite);
     };

     _proto.UpdateDisabled = function UpdateDisabled() {
       var _this5 = this;

       var isComponentDisabled = this.optionsAdapter.getDisabled();

       var iterateAll = function iterateAll(isDisabled) {
         var i = _this5.MultiSelectDataSelectedTail;

         while (i) {
           i.disable(isDisabled);
           i = i.selectedPrev;
         }
       };

       if (this.isComponentDisabled !== isComponentDisabled) {
         if (isComponentDisabled) {
           //this.filterInput.style.display = "none";
           this.filterInputItem.style.display = "none";
           this.styling.Disable(this.stylingComposite);
           iterateAll(true);
           this.selectedPanel.removeEventListener("click", this.selectedPanelClick);
         } else {
           //this.filterInput.style.display = "inline-block";
           this.filterInputItem.style.display = "list-item";
           this.styling.Enable(this.stylingComposite);
           iterateAll(false);
           this.selectedPanel.addEventListener("click", this.selectedPanelClick);
         }

         this.isComponentDisabled = isComponentDisabled;
       }
     };

     _proto.resetCandidateToHoveredMultiSelectData = function resetCandidateToHoveredMultiSelectData() {
       this.candidateToHoveredMultiSelectData.dropDownMenuItemElement.removeEventListener('mousemove', this.processCandidateToHovered);
       this.candidateToHoveredMultiSelectData.dropDownMenuItemElement.removeEventListener('mousedown', this.processCandidateToHovered);
       this.candidateToHoveredMultiSelectData = null;
     };

     _proto.toggleHovered = function toggleHovered() {
       if (this.hoveredMultiSelectData) {
         this.hoveredMultiSelectData.toggle();
         this.resetDropDownMenuHover();
         this.resetFilterAndHideDropDown();
       }
     };

     _proto.input = function input(filterInputValue, resetLength) {
       var text = filterInputValue.trim().toLowerCase();
       var isEmpty = false;
       if (text == '') isEmpty = true;else {
         // check if exact match, otherwise new search
         this.visibleMultiSelectDataList = filterDropDownMenu(this.MultiSelectDataList, text);

         if (this.visibleMultiSelectDataList.length == 1) {
           var fullMatchMultiSelectData = this.visibleMultiSelectDataList[0];

           if (fullMatchMultiSelectData.searchText == text) {
             fullMatchMultiSelectData.toggle();
             this.filterPanel.setEmpty(); // clear

             isEmpty = true;
           }
         }
       }
       if (isEmpty) this.processEmptyInput();else resetLength();
       this.setInShowDropDown();
       this.resetDropDownMenuHover();

       if (this.getVisibleMultiSelectDataList().length == 1) {
         this.hoverInInternal(0);
       }

       if (this.getVisibleMultiSelectDataList().length > 0) {
         this.updateDropDownLocation(true); // we need it to support case when textbox changes its place because of line break (texbox grow with each key press)

         this.showDropDown();
       } else {
         this.hideDropDown();
       }
     };

     _proto.init = function init() {
       var _this6 = this;

       var document = this.document;
       var container = this.optionsAdapter.container;
       this.selectedPanel = document.createElement('UL');
       defSelectedPanelStyleSys(this.selectedPanel.style);
       container.appendChild(this.selectedPanel);
       this.filterInputItem = document.createElement('LI');
       this.selectedPanel.appendChild(this.filterInputItem);
       this.filterPanel = FilterPanel(function (input) {
         _this6.filterInputItem.appendChild(input);

         _this6.labelAdapter.init(input);
       }, function () {
         return _this6.styling.FocusIn(_this6.stylingComposite);
       }, // show dropdown
       function () {
         if (!_this6.skipFocusout) {
           _this6.resetFilter(); // if do not do this we will return to filtered list without text filter in input


           _this6.resetDropDownMenuHover(); // if do not do this tab will select "only one hovered"


           _this6.styling.FocusOut(_this6.stylingComposite);
         }
       }, // hide dropdown
       function () {
         return _this6.keyDownArrowUp();
       }, function () {
         return _this6.keyDownArrowDown();
       }, function () {
         return _this6.hideDropDown();
       }, function () {
         return _this6.removeSelectedTail();
       }, // backspace alike
       function () {
         return _this6.resetDropDownMenuHover();
       }, function () {
         return _this6.toggleHovered();
       }, // "compleate alike"
       function () {
         return _this6.resetFilterAndHideDropDown();
       }, // "esc" alike
       function (filterInputValue, resetLength) {
         return _this6.input(filterInputValue, resetLength);
       } // filter
       ); //defFilterInputStyleSys(this.filterInput.style);

       this.dropDownMenu = document.createElement('UL');
       this.dropDownMenu.style.display = "none";
       container.appendChild(this.dropDownMenu); // prevent heavy understandable styling error

       defDropDownMenuStyleSys(this.dropDownMenu.style); // we want to escape the closing of the menu on a user's click inside the container

       this.containerMousedown = function () {
         _this6.skipFocusout = true;
         _this6.skipContainerMousedownEvent = event;
       };

       this.processCandidateToHovered = function () {
         if (_this6.hoveredMultiSelectData != _this6.candidateToHoveredMultiSelectData) {
           _this6.resetDropDownMenuHover();

           _this6.hoverInInternal(_this6.candidateToHoveredMultiSelectData.visibleIndex);
         }

         _this6.resetCandidateToHoveredMultiSelectData();
       }; // document.Mouseup used for better realiability
       // TODO : this.containerMousedown , this.documentMouseup and filterInput.focusOut are actual only when menu is open


       this.documentMouseup = function () {
         _this6.skipFocusout = false;
       };

       this.documentMouseup2 = function (event) {
         if (!(container === event.target || container.contains(event.target))) {
           _this6.resetFilterAndHideDropDown();
         }
       };

       this.selectedPanelClick = function (event) {
         if (!_this6.filterPanel.isEventTarget(event)) {
           //this.filterPanel.setEmpty();
           _this6.filterPanel.setFocus();
         }

         if (_this6.getVisibleMultiSelectDataList().length > 0 && _this6.preventDefaultMultiSelectEvent != event) {
           _this6.updateDropDownLocation(true);

           _this6.showDropDown();
         }

         _this6.preventDefaultMultiSelectEvent = null;
       };

       this.stylingComposite = this.createStylingComposite(container, this.selectedPanel, this.filterInputItem, this.filterPanel.input, this.dropDownMenu);
       this.styling.Init(this.stylingComposite);
       if (this.optionsAdapter.afterContainerFilled) this.optionsAdapter.afterContainerFilled();
       this.popper = new Popper(this.filterInputItem, this.dropDownMenu, {
         placement: 'bottom-start',
         modifiers: {
           preventOverflow: {
             enabled: false
           },
           hide: {
             enabled: false
           },
           flip: {
             enabled: false
           }
         }
       });
       this.styling.UpdateIsValid(this.stylingComposite, this.optionsAdapter.getIsValid(), this.optionsAdapter.getIsInvalid());
       this.UpdateSize();
       this.UpdateDisabled();
       this.updateDataImpl();
     };

     return MultiSelect;
   }();

   function LabelAdapter(label, createInputId) {
     var backupedFor = null; // state saved between init and dispose

     return {
       init: function init(filterInput) {
         if (label) {
           backupedFor = label.getAttribute('for');
           var newId = createInputId();
           filterInput.setAttribute('id', newId);
           label.setAttribute('for', newId);
         }
       },
       dispose: function dispose() {
         if (backupedFor) label.setAttribute('for', backupedFor);
       }
     };
   }

   function OptionsAdapterJson(container, options, _getDisabled, _getIsValid, _getIsInvalid, trigger) {
     return {
       container: container,
       getOptions: function getOptions() {
         return options;
       },
       dispose: function dispose() {
         while (container.firstChild) {
           container.removeChild(container.firstChild);
         }
       },
       triggerChange: function triggerChange() {
         trigger('multiselect:change');
       },
       getDisabled: function getDisabled() {
         return _getDisabled ? _getDisabled() : false;
       },
       getIsValid: function getIsValid() {
         return _getIsValid ? _getIsValid() : false;
       },
       getIsInvalid: function getIsInvalid() {
         return _getIsInvalid ? _getIsInvalid() : false;
       }
     };
   }

   function OptionsAdapterElement(selectElement, trigger) {
     selectElement.style.display = 'none';
     var container = document.createElement('div');
     return {
       container: container,
       getOptions: function getOptions() {
         return selectElement.getElementsByTagName('OPTION');
       },
       dispose: function dispose() {
         container.parentNode.removeChild(container);
       },
       afterContainerFilled: function afterContainerFilled() {
         selectElement.parentNode.insertBefore(container, selectElement.nextSibling);
       },
       triggerChange: function triggerChange() {
         trigger('change');
         trigger('multiselect:change');
       },
       getDisabled: function getDisabled() {
         return selectElement.disabled;
       },
       getIsValid: function getIsValid() {
         return selectElement.classList.contains('is-valid');
       },
       getIsInvalid: function getIsInvalid() {
         return selectElement.classList.contains('is-invalid');
       }
     };
   }

   function ExtendIfUndefined(destination, source) {
     for (var property in source) {
       if (destination[property] === undefined) destination[property] = source[property];
     }
   }

   var bs4StylingMethodCssDefaults = {
     selectedPanelFocusClass: 'focus',
     selectedPanelDisabledClass: 'disabled',
     dropDownItemDisabledClass: 'disabled'
   };

   function Bs4StylingMethodCss(configuration) {
     ExtendIfUndefined(configuration, bs4StylingMethodCssDefaults);
     return {
       Enable: function Enable($selectedPanel) {
         $selectedPanel.removeClass(configuration.selectedPanelDisabledClass);
       },
       Disable: function Disable($selectedPanel) {
         $selectedPanel.addClass(configuration.selectedPanelDisabledClass);
       },
       FocusIn: function FocusIn($selectedPanel) {
         $selectedPanel.addClass(configuration.selectedPanelFocusClass);
       },
       FocusOut: function FocusOut($selectedPanel) {
         $selectedPanel.removeClass(configuration.selectedPanelFocusClass);
       }
     };
   }

   var defSelectedPanelStyle = {
     'margin-bottom': '0',
     'height': 'auto'
   };
   var bs4StylingMethodJsDefaults = {
     selectedPanelDefMinHeight: 'calc(2.25rem + 2px)',
     selectedPanelLgMinHeight: 'calc(2.875rem + 2px)',
     selectedPanelSmMinHeight: 'calc(1.8125rem + 2px)',
     selectedPanelDisabledBackgroundColor: '#e9ecef',
     selectedPanelFocusBorderColor: '#80bdff',
     selectedPanelFocusBoxShadow: '0 0 0 0.2rem rgba(0, 123, 255, 0.25)',
     selectedPanelFocusValidBoxShadow: '0 0 0 0.2rem rgba(40, 167, 69, 0.25)',
     selectedPanelFocusInvalidBoxShadow: '0 0 0 0.2rem rgba(220, 53, 69, 0.25)',
     filterInputColor: '#495057' //selectedItemContentDisabledOpacity: '.65'

   };

   function Bs4StylingMethodJs(configuration) {
     ExtendIfUndefined(configuration, bs4StylingMethodJsDefaults);
     return {
       OnInit: function OnInit(composite) {
         composite.$selectedPanel.css(defSelectedPanelStyle);
         composite.$filterInput.css("color", configuration.filterInputColor);
       },
       UpdateSize: function UpdateSize($selectedPanel) {
         if ($selectedPanel.hasClass("form-control-lg")) {
           $selectedPanel.css("min-height", configuration.selectedPanelLgMinHeight);
         } else if ($selectedPanel.hasClass("form-control-sm")) {
           $selectedPanel.css("min-height", configuration.selectedPanelSmMinHeight);
         } else {
           $selectedPanel.css("min-height", configuration.selectedPanelDefMinHeight);
         }
       },
       Enable: function Enable($selectedPanel) {
         $selectedPanel.css("background-color", "");
       },
       Disable: function Disable($selectedPanel) {
         $selectedPanel.css("background-color", configuration.selectedPanelDisabledBackgroundColor);
       },
       FocusIn: function FocusIn($selectedPanel) {
         if ($selectedPanel.hasClass("is-valid")) {
           $selectedPanel.css("box-shadow", configuration.selectedPanelFocusValidBoxShadow);
         } else if ($selectedPanel.hasClass("is-invalid")) {
           $selectedPanel.css("box-shadow", configuration.selectedPanelFocusInvalidBoxShadow);
         } else {
           $selectedPanel.css("box-shadow", configuration.selectedPanelFocusBoxShadow).css("border-color", configuration.selectedPanelFocusBorderColor);
         }
       },
       FocusOut: function FocusOut($selectedPanel) {
         $selectedPanel.css("box-shadow", "").css("border-color", "");
       }
     };
   }

   var bs4StylingDefaults = {
     containerClass: 'dashboardcode-bsmultiselect',
     dropDownMenuClass: 'dropdown-menu',
     dropDownItemClass: 'px-2',
     dropDownItemHoverClass: 'text-primary bg-light',
     selectedPanelClass: 'form-control',
     selectedItemClass: 'badge',
     removeSelectedItemButtonClass: 'close',
     filterInputItemClass: '',
     filterInputClass: ''
   };

   function Bs4Styling(stylingMethod, configuration, $) {
     ExtendIfUndefined(configuration, bs4StylingDefaults);
     return {
       Init: function Init(composite) {
         composite.$container.addClass(configuration.containerClass);
         composite.$selectedPanel.addClass(configuration.selectedPanelClass);
         composite.$dropDownMenu.addClass(configuration.dropDownMenuClass);
         composite.$filterInputItem.addClass(configuration.filterInputItemClass);
         composite.$filterInput.addClass(configuration.filterInputClass);
         if (stylingMethod.OnInit) stylingMethod.OnInit(composite);
       },
       UpdateIsValid: function UpdateIsValid(composite, isValid, isInvalid) {
         if (isValid) composite.$selectedPanel.addClass('is-valid');
         if (isInvalid) composite.$selectedPanel.addClass('is-invalid');
       },
       UpdateSize: function UpdateSize(composite) {
         if (stylingMethod.UpdateSize) stylingMethod.UpdateSize(composite.$selectedPanel);
       },
       Enable: function Enable(composite) {
         stylingMethod.Enable(composite.$selectedPanel);
       },
       Disable: function Disable(composite) {
         stylingMethod.Disable(composite.$selectedPanel);
       },
       FocusIn: function FocusIn(composite) {
         stylingMethod.FocusIn(composite.$selectedPanel);
       },
       FocusOut: function FocusOut(composite) {
         stylingMethod.FocusOut(composite.$selectedPanel);
       },
       HoverIn: function HoverIn(dropDownItem) {
         $(dropDownItem).addClass(configuration.dropDownItemHoverClass);
       },
       HoverOut: function HoverOut(dropDownItem) {
         $(dropDownItem).removeClass(configuration.dropDownItemHoverClass);
       }
     };
   }

   function AddToJQueryPrototype(pluginName, createPlugin, $) {
     var firstChar = pluginName.charAt(0);
     var firstCharLower = firstChar.toLowerCase();

     if (firstCharLower == firstChar) {
       throw new TypeError("Plugin name '" + pluginName + "' should be started from upper case char");
     }

     var prototypableName = firstCharLower + pluginName.slice(1);
     var noConflictPrototypable = $.fn[prototypableName];
     var dataKey = "DashboardCode." + pluginName;

     function prototypable(options) {
       return this.each(function () {
         var $e = $(this);
         var instance = $e.data(dataKey);
         var isMethodName = typeof options === 'string';

         if (!instance) {
           if (isMethodName && /Dispose/.test(options)) {
             return;
           }

           var optionsObject = typeof options === 'object' ? options : null;
           instance = createPlugin(this, optionsObject, function () {
             $e.removeData(dataKey);
           });
           $e.data(dataKey, instance);
         }

         if (isMethodName) {
           var methodName = options;

           if (typeof instance[methodName] === 'undefined') {
             throw new TypeError("No method named '" + methodName + "'");
           }

           instance[methodName]();
         }
       });
     }

     $.fn[prototypableName] = prototypable; // pluginName with first capitalized letter - return plugin instance for 1st $selected item

     $.fn[pluginName] = function () {
       return $(this).data(dataKey);
     };

     $.fn[prototypableName].noConflict = function () {
       $.fn[prototypableName] = noConflictPrototypable;
       return prototypable;
     };
   }

   var bs4StylingMethodCssdefaults = {
     selectedItemContentDisabledClass: 'disabled'
   };

   function Bs4SelectedItemContentStylingMethodCss(configuration) {
     ExtendIfUndefined(configuration, bs4StylingMethodCssdefaults);
     return {
       disableSelectedItemContent: function disableSelectedItemContent($content) {
         $content.addClass(configuration.selectedItemContentDisabledClass);
       }
     };
   }

   var defSelectedItemStyle = {
     'padding-left': '0px',
     'line-height': '1.5em'
   };
   var defRemoveSelectedItemButtonStyle = {
     'font-size': '1.5em',
     'line-height': '.9em'
   };
   var bs4StylingMethodJsDefaults$1 = {
     selectedItemContentDisabledOpacity: '.65'
   };

   function Bs4SelectedItemContentStylingMethodJs(configuration) {
     ExtendIfUndefined(configuration, bs4StylingMethodJsDefaults$1);
     return {
       disableSelectedItemContent: function disableSelectedItemContent($content) {
         $content.css("opacity", configuration.selectedItemContentDisabledOpacity);
       },
       createSelectedItemContent: function createSelectedItemContent($selectedItem, $button) {
         $selectedItem.css(defSelectedItemStyle);
         if ($button) $button.css(defRemoveSelectedItemButtonStyle);
       }
     };
   }

   var bs4SelectedItemContentDefaults = {
     selectedItemClass: 'badge',
     removeSelectedItemButtonClass: 'close'
   };

   function Bs4SelectedItemContent(stylingMethod, configuration, $) {
     ExtendIfUndefined(configuration, bs4SelectedItemContentDefaults);
     return function (selectedItem, optionItem, removeSelectedItem, preventDefaultMultiSelect) {
       var $selectedItem = $(selectedItem);
       $selectedItem.addClass(configuration.selectedItemClass);
       var $content = $("<span/>").text(optionItem.text);
       $content.appendTo($selectedItem);
       if (optionItem.disabled) stylingMethod.disableSelectedItemContent($content);
       var $button = $('<button aria-label="Close" tabIndex="-1" type="button"><span aria-hidden="true">&times;</span></button>') // bs 'close' class that will be added to button set the float:right, therefore it impossible to configure no-warp policy 
       // with .css("white-space", "nowrap") or  .css("display", "inline-block"); TODO: migrate to flex? 
       .css("float", "none").appendTo($selectedItem).addClass(configuration.removeSelectedItemButtonClass) // bs close class set the float:right
       .on("click", function (jqEvent) {
         removeSelectedItem();
         preventDefaultMultiSelect(jqEvent.originalEvent);
       });
       if (stylingMethod.createSelectedItemContent) stylingMethod.createSelectedItemContent($selectedItem, $button);
       return {
         disable: function disable(isDisabled) {
           $button.prop('disabled', isDisabled);
         },
         dispose: function dispose() {
           $button.unbind();
         }
       };
     };
   }

   var bs4StylingMethodCssDefaults$1 = {
     selectedItemContentDisabledClass: 'disabled'
   };

   function Bs4DropDownItemContentStylingMethodCss(configuration) {
     ExtendIfUndefined(configuration, bs4StylingMethodCssDefaults$1);
     return {
       disabledStyle: function disabledStyle($checkBox, $checkBoxLabel, isDisbaled) {
         if (isDisbaled) $checkBox.addClass(configuration.dropDownItemDisabledClass);else $checkBox.removeClass(configuration.dropDownItemDisabledClass);
       }
     };
   }

   var bs4StylingMethodJsDefaults$2 = {
     selectedItemContentDisabledOpacity: '.65',
     dropdDownLabelDisabledColor: '#6c757d'
   };

   function Bs4DropDownItemContentStylingMethodJs(configuration) {
     ExtendIfUndefined(configuration, bs4StylingMethodJsDefaults$2);
     return {
       disabledStyle: function disabledStyle($checkBox, $checkBoxLabel, isDisbaled) {
         $checkBoxLabel.css('color', isDisbaled ? configuration.dropdDownLabelDisabledColor : '');
       }
     };
   }

   var bs4DropDownItemContentDefaults = {
     dropDownItemClass: 'px-2'
   };

   function Bs4DropDownItemContent(stylingMethod, configuration, $) {
     ExtendIfUndefined(configuration, bs4DropDownItemContentDefaults);
     return function (dropDownItem, option) {
       var $dropDownItem = $(dropDownItem);
       $dropDownItem.addClass(configuration.dropDownItemClass);
       var $dropDownItemContent = $("<div class=\"custom-control custom-checkbox\">\n            <input type=\"checkbox\" class=\"custom-control-input\">\n            <label class=\"custom-control-label\"></label>\n        </div>");
       $dropDownItemContent.appendTo(dropDownItem);
       var $checkBox = $dropDownItemContent.find("INPUT[type=\"checkbox\"]");
       var $checkBoxLabel = $dropDownItemContent.find("label");
       $checkBoxLabel.text(option.text);
       var tmp = {
         select: function select(isSelected) {
           $checkBox.prop('checked', isSelected);
         },
         // --- distinct disable and disabledStyle to provide a possibility to unselect disabled option
         disable: function disable(isDisabled) {
           $checkBox.prop('disabled', isDisabled);
         },
         disabledStyle: function disabledStyle(isDisbaled) {
           stylingMethod.disabledStyle($checkBox, $checkBoxLabel, isDisbaled);
         },
         onSelected: function onSelected(toggle) {
           $checkBox.on("change", toggle);
           $dropDownItem.on("click", function (event) {
             if (dropDownItem === event.target || $.contains(dropDownItem, event.target)) {
               toggle();
             }
           });
         },
         dispose: function dispose() {
           $checkBox.unbind();
           $dropDownItem.unbind();
         }
       };
       return tmp;
     };
   }

   (function (window, $) {
     AddToJQueryPrototype('BsMultiSelect', function (element, settings, onDispose) {
       var configuration = $.extend({}, settings); // settings used per jQuery intialization, configuration per element

       if (configuration.preBuildConfiguration) configuration.preBuildConfiguration(element, configuration);
       var $element = $(element);
       var optionsAdapter = null;
       if (configuration.optionsAdapter) optionsAdapter = configuration.optionsAdapter;else {
         var trigger = function trigger(eventName) {
           $element.trigger(eventName);
         };

         if (configuration.options) {
           optionsAdapter = OptionsAdapterJson(element, configuration.options, configuration.getDisabled, configuration.getIsValid, configuration.getIsInvalid, trigger);
           if (!configuration.createInputId) configuration.createInputId = function () {
             return configuration.containerClass + "-generated-filter-" + element.id;
           };
         } else {
           if (!configuration.label) {
             var $formGroup = $(element).closest('.form-group');

             if ($formGroup.length == 1) {
               var $label = $formGroup.find("label[for=\"" + element.id + "\"]");

               if ($label.length > 0) {
                 var label = $label.get(0);
                 var forId = label.getAttribute('for');

                 if (forId == element.id) {
                   configuration.label = label;
                 }
               }
             }
           }

           optionsAdapter = OptionsAdapterElement(element, trigger);
           if (!configuration.createInputId) configuration.createInputId = function () {
             return configuration.containerClass + "-generated-input-" + (element.id ? element.id : element.name).toLowerCase() + "-id";
           };
         }
       }
       var labelAdapter = LabelAdapter(configuration.label, configuration.createInputId);
       var useCss = configuration.useCss;
       var styling = configuration.styling;

       if (!configuration.adapter) {
         var stylingMethod = configuration.stylingMethod;

         if (!stylingMethod) {
           if (useCss) stylingMethod = Bs4StylingMethodCss(configuration);else stylingMethod = Bs4StylingMethodJs(configuration);
         }

         styling = Bs4Styling(stylingMethod, configuration, $);
       }

       var selectedItemContent = configuration.selectedItemContent;

       if (!selectedItemContent) {
         var selectedItemContentStylingMethod = configuration.selectedItemContentStylingMethod;

         if (!selectedItemContentStylingMethod) {
           if (useCss) selectedItemContentStylingMethod = Bs4SelectedItemContentStylingMethodCss(configuration);else selectedItemContentStylingMethod = Bs4SelectedItemContentStylingMethodJs(configuration);
         }

         selectedItemContent = Bs4SelectedItemContent(selectedItemContentStylingMethod, configuration, $);
       }

       var dropDownItemContent = configuration.bs4DropDownItemContent;

       if (!dropDownItemContent) {
         var dropDownItemContentStylingMethod = configuration.dropDownItemContentStylingMethod;
         if (useCss) dropDownItemContentStylingMethod = Bs4DropDownItemContentStylingMethodCss(configuration);else dropDownItemContentStylingMethod = Bs4DropDownItemContentStylingMethodJs(configuration);
         dropDownItemContent = Bs4DropDownItemContent(dropDownItemContentStylingMethod, configuration, $);
       }

       var createStylingComposite = function createStylingComposite(container, selectedPanel, filterInputItem, filterInput, dropDownMenu) {
         return {
           $container: $(container),
           $selectedPanel: $(selectedPanel),
           $filterInputItem: $(filterInputItem),
           $filterInput: $(filterInput),
           $dropDownMenu: $(dropDownMenu)
         };
       };

       var multiSelect = new MultiSelect(optionsAdapter, styling, selectedItemContent, dropDownItemContent, labelAdapter, createStylingComposite, configuration, onDispose, window);
       if (configuration.postBuildConfiguration) configuration.postBuildConfiguration(element, multiSelect);
       multiSelect.init();
       return multiSelect;
     }, $);
   })(window, $);

})));
//# sourceMappingURL=BsMultiSelect.js.map
