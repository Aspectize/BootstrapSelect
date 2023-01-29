/* Bootstrap select extension */
/* Build with https://developer.snapappointments.com/bootstrap-select/ */

Global.BootstrapSelectBuilder = {

    aasService: 'BootstrapSelectBuilder',
    aasPublished: false,


    Build: function (controlInfo) {

        var savedChangeHandler = null;
        var control = null;

        var initCalled = false;

        var isMultiValuedList = false;

        function updateSelectedValues(sender, arg) {

            if (savedChangeHandler) {

                var selectedValues = {};
                for (var n = 0; n < control.options.length; n++) {
                    var option = control.options[n];

                    if (option.selected) {

                        selectedValues[option.value] = { Selected: true, Data: option.aasData };
                    }
                }

                savedChangeHandler(control, { IsEventArg: true, Value: selectedValues });
            }

            updateCurrentProperties();
        }

        function updateCurrentProperties() {

            if (initCalled) {

                var currentDisplay = isMultiValuedList ? [] : null;
                var currentValue = isMultiValuedList ? [] : null;
                var currentData = isMultiValuedList ? [] : null;;

                for (var n = 0; n < control.options.length; n++) {
                    var option = control.options[n];

                    if (option.selected) {

                        if (isMultiValuedList) {

                            currentDisplay.push(option.text);
                            currentValue.push(option.value);
                            currentData.push(option.aasData);

                        } else {

                            currentDisplay = option.text;
                            currentValue = option.value;
                            currentData = option.aasData;
                            break;
                        }
                    }
                }
                
                Aspectize.UiExtensions.ChangeProperty(control, 'CurrentValue', currentValue);
                Aspectize.UiExtensions.ChangeProperty(control, 'CurrentData', currentData);
                Aspectize.UiExtensions.ChangeProperty(control, 'CurrentDisplay', isMultiValuedList ? currentDisplay.join(',') : currentDisplay);
            }
        }

        controlInfo.CreateInstance = function (ownerWindow, id) {

            control = Aspectize.createElement('select', ownerWindow);

            control.classname = 'selectpicker';

            return control;
        };

        controlInfo.AddOption = function (data, control, value, display, styleClass) {

            isMultiValuedList = Aspectize.UiExtensions.GetProperty(control, 'Multiple');
            if (isMultiValuedList) control.aasIsMultiSelector = true;

            var selectedMember = isMultiValuedList ? Aspectize.UiExtensions.GetProperty(control, 'SelectedMember') : false;
            var isSelected = selectedMember && data && data[selectedMember] ? true : false;

            var option = new Option(display, value, false, isSelected);
            option.id = control.id + '-' + value;

            $(control).append(option);

            return option;
        };

        controlInfo.InitList = function (control) {

            if (initCalled) return;
            initCalled = true;

            var options = {};

            //#region multiple
            isMultiValuedList = Aspectize.UiExtensions.GetProperty(control, 'Multiple');
            if (isMultiValuedList) {
                control.aasIsMultiSelector = true;

                control.setAttribute('multiple', '');

                var selectedTextFormat = Aspectize.UiExtensions.GetProperty(control, 'SelectedTextFormat');
                if (selectedTextFormat.startsWith('count')) {
                    options.selectedTextFormat = selectedTextFormat;

                    var countSelectedText = Aspectize.UiExtensions.GetProperty(control, 'CountSelectedText');
                    if (countSelectedText) options.countSelectedText = countSelectedText;
                }

                var noneSelectedText = Aspectize.UiExtensions.GetProperty(control, 'NoneSelectedText'); // un peu comme le NullValueDisplay mais quand rien n'est selectionné
                if (noneSelectedText) options.noneSelectedText = noneSelectedText;

                //#region actionsBox : selectAll deselectAll buttons
                if (isMultiValuedList) {
                    var actionsBox = Aspectize.UiExtensions.GetProperty(control, 'ActionsBox');
                    if (actionsBox) options.actionsBox = true;
                    if (actionsBox) {
                        var selectAllText = Aspectize.UiExtensions.GetProperty(control, 'SelectAllText');
                        if (selectAllText) options.selectAllText = selectAllText;
                        var deselectAllText = Aspectize.UiExtensions.GetProperty(control, 'DeselectAllText');
                        if (deselectAllText) options.deselectAllText = deselectAllText;
                    }
                }
                //#endregion

                //#region maxOptions
                var maxOptions = Aspectize.UiExtensions.GetProperty(control, 'MaxOptions');
                if (maxOptions) {
                    options.maxOptions = maxOptions;
                    var maxOptionsText = Aspectize.UiExtensions.GetProperty(control, 'MaxOptionsText'); // Max {0}/{1}
                    if (maxOptionsText) options.maxOptionsText = maxOptionsText;
                }
                //#endregion
            }
            //#endregion

            //#region liveSearch
            var liveSearch = Aspectize.UiExtensions.GetProperty(control, 'LiveSearch');
            if (liveSearch) { options.liveSearch = true; options.liveSearchNormalize = true; }

            var liveSearchStyle = Aspectize.UiExtensions.GetProperty(control, 'LiveSearchStyle');
            if (liveSearchStyle) options.liveSearchStyle = liveSearchStyle;  // 'contains' or 'startsWith'

            var liveSearchPlaceholder = Aspectize.UiExtensions.GetProperty(control, 'LiveSearchPlaceholder');
            if (liveSearchPlaceholder) options.liveSearchPlaceholder = liveSearchPlaceholder;

            var noneResultsText = Aspectize.UiExtensions.GetProperty(control, 'NoneResultsText');
            if (noneResultsText) options.noneResultsText = noneResultsText;
            //#endregion

            var header = Aspectize.UiExtensions.GetProperty(control, 'Header');
            if (header) options.header = header;

            var size = Aspectize.UiExtensions.GetProperty(control, 'Size');
            if (size) options.size = size;

            updateCurrentProperties();

            $(control).selectpicker(options);

            $(control).on('changed.bs.select', function (e, clickedIndex, isSelected, previousValue) {

                var option = control.options[clickedIndex];
                if (option && option.aasData) {
                    var selectedMember = Aspectize.UiExtensions.GetProperty(control, 'SelectedMember');

                    if (selectedMember) option.aasData.SetField(selectedMember, isSelected);
                }

                updateSelectedValues();

                var currentData = controlInfo.PropertyBag.CurrentData;
                var currentValue = controlInfo.PropertyBag.CurrentValue;
                var currentDisplay = controlInfo.PropertyBag.CurrentDisplay;

                Aspectize.UiExtensions.Notify(control, 'SelectedValueChanged', { CurrentValue: currentValue, CurrentDisplay: currentDisplay, CurrentData: currentData });
                
            });

        };

        controlInfo.RemoveOptions = function (control) {
            initCalled = false;

            currentValue = null;
            currentDisplay = null;
            currentData = null;

            $(control).selectpicker('destroy');
        };

        controlInfo.AddChangeHandler = function (control, changeHandler) {

            savedChangeHandler = changeHandler;
        };

        controlInfo.SetValue = function (control, value) {

            var options = control.options;

            if (!initCalled || (options.length === 0)) return;

            var selectedDataValues = value;

            var isObject = typeof (value) === 'object';
            var isBitField = !!value.IsBitField;

            for (var n = 0; n < options.length; n++) {

                var option = options[n];
                var isSelected = isBitField || isObject ? option.value in selectedDataValues : option.value === '' + value;
                option.selected = isSelected;
            }      

            updateCurrentProperties();
            $(control).selectpicker('refresh');            
        };

        controlInfo.GetCurrentData = function () {

            var selectedData = [];

            var options = control.options;

            for (var n = 0; n < options.length; n++) {

                var option = options[n];
                if (options.selected && option.aasData) {

                    selectedData.push(option.aasData);
                }
            }

            return selectedData; 
        };

        controlInfo.ChangeOption = function (control, value, newDisplay, newDisplayClass) {

            var option = control.options.namedItem(control.id + '-' + value);

            var needsRefresh = false;

            if (option.text !== newDisplay) {

                option.text = newDisplay;
                needsRefresh = true;
            }

            if (option.className !== newDisplayClass) {
                option.className = newDisplayClass;
                needsRefresh = true;
            }

            if (option && option.aasData) {
                isMultiValuedList = Aspectize.UiExtensions.GetProperty(control, 'Multiple');
                var selectedMember = isMultiValuedList ? Aspectize.UiExtensions.GetProperty(control, 'SelectedMember') : false;
                var isSelected = selectedMember && option.aasData[selectedMember] ? true : false;

                if (option.selected !== isSelected) {

                    option.selected = isSelected;
                    needsRefresh = true;
                }
            }

            if (needsRefresh) $(control).selectpicker('refresh');
        };

    }
}