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

                    selectedValues[option.value] = { Selected: option.selected, Data: option.aasData };
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

            window.setTimeout(function () {

                var bsOptions = {};

                //#region multiple
                isMultiValuedList = Aspectize.UiExtensions.GetProperty(control, 'Multiple');
                if (isMultiValuedList) {
                    control.aasIsMultiSelector = true;

                    control.setAttribute('multiple', '');

                    var selectedTextFormat = Aspectize.UiExtensions.GetProperty(control, 'SelectedTextFormat');
                    bsOptions.selectedTextFormat = selectedTextFormat;
                    if (selectedTextFormat.startsWith('count')) {

                        bsOptions.countSelectedText = Aspectize.UiExtensions.GetProperty(control, 'CountSelectedText');
                    }

                    bsOptions.noneSelectedText = Aspectize.UiExtensions.GetProperty(control, 'NoneSelectedText'); // un peu comme le NullValueDisplay mais quand rien n'est selectionné

                    //#region actionsBox : selectAll deselectAll buttons
                    if (isMultiValuedList) {
                        var actionsBox = Aspectize.UiExtensions.GetProperty(control, 'ActionsBox');
                        bsOptions.actionsBox = !!actionsBox;
                        if (bsOptions.actionsBox) {
                            bsOptions.selectAllText = Aspectize.UiExtensions.GetProperty(control, 'SelectAllText');
                            bsOptions.deselectAllText = Aspectize.UiExtensions.GetProperty(control, 'DeselectAllText');
                        }
                    }
                    //#endregion

                    //#region maxOptions
                    var maxOptions = Aspectize.UiExtensions.GetProperty(control, 'MaxOptions');
                    bsOptions.maxOptions = maxOptions;
                    if (maxOptions !== false) {
                        bsOptions.maxOptionsText = Aspectize.UiExtensions.GetProperty(control, 'MaxOptionsText');  // Max {0}/{1}
                    }
                    //#endregion
                }
                //#endregion

                //#region liveSearch
                bsOptions.liveSearch = Aspectize.UiExtensions.GetProperty(control, 'LiveSearch');
                if (bsOptions.liveSearch) {
                    bsOptions.liveSearchNormalize = true;
                    bsOptions.liveSearchStyle = Aspectize.UiExtensions.GetProperty(control, 'LiveSearchStyle');  // 'contains' or 'startsWith'
                    bsOptions.liveSearchPlaceholder = Aspectize.UiExtensions.GetProperty(control, 'LiveSearchPlaceholder');
                    bsOptions.noneResultsText = Aspectize.UiExtensions.GetProperty(control, 'NoneResultsText');;
                }
                //#endregion

                bsOptions.header = Aspectize.UiExtensions.GetProperty(control, 'Header');
                bsOptions.size = Aspectize.UiExtensions.GetProperty(control, 'Size');

                updateCurrentProperties();

                $(control).selectpicker(bsOptions);

                $(control).on('changed.bs.select', function (e, clickedIndex, isSelected, previousValue) {

                    if (bsOptions.actionsBox) {

                        var selectedMember = Aspectize.UiExtensions.GetProperty(control, 'SelectedMember');
                        var options = control.options;

                        if (selectedMember) {

                            for (var n = 0; n < options.length; n++) {

                                var option = options[n];
                                if (option.aasData) {

                                    option.aasData.SetField(selectedMember, option.selected);
                                }
                            }
                        }

                    } else {

                        var option = control.options[clickedIndex];
                        if (option && option.aasData) {
                            var selectedMember = Aspectize.UiExtensions.GetProperty(control, 'SelectedMember');

                            if (selectedMember) option.aasData.SetField(selectedMember, isSelected);
                        }
                    }

                    updateSelectedValues();

                    var currentData = controlInfo.PropertyBag.CurrentData;
                    var currentValue = controlInfo.PropertyBag.CurrentValue;
                    var currentDisplay = controlInfo.PropertyBag.CurrentDisplay;

                    Aspectize.UiExtensions.Notify(control, 'SelectedValueChanged', { CurrentValue: currentValue, CurrentDisplay: currentDisplay, CurrentData: currentData });

                });

                document.getElementById(control.id).parentNode.classList.add('form-control');
                initCalled = true;

            }, 0);

        };

        controlInfo.RemoveOptions = function (control) {
            var dControl =$(control);
            if (dControl.selectpicker) {
                initCalled = false;

                dControl.selectpicker('destroy');
                dControl.empty();
            }
        };

        controlInfo.AddChangeHandler = function (control, changeHandler) {

            savedChangeHandler = changeHandler;
        };

        controlInfo.SetValue = function (control, value) {

            if (!control.aasDataBindings.SelectedValue) return; // selected values determined by UI and Not Data

            var options = control.options;

            if (!initCalled || (options.length === 0)) return;

            var selectedDataValues = value;

            var isObject = typeof (value) === 'object';
            var isBitField = !!value.IsBitField;

            if (isBitField || isObject) {

                for (var n = 0; n < options.length; n++) {

                    var option = options[n];
                    var isSelected = option.value in selectedDataValues;
                    option.selected = isSelected;
                }

            } else {

                for (var n = 0; n < options.length; n++) {

                    var option = options[n];
                    option.selected = (option.value === value);
                }

            }
            updateCurrentProperties();
            $(control).selectpicker('refresh');
        };

        controlInfo.GetCurrentData = function () {

            var selectedData = [];

            var options = control.options;

            for (var n = 0; n < options.length; n++) {

                var option = options[n];
                if (option.selected && option.aasData) {

                    selectedData.push(option.aasData);
                }
            }

            return selectedData;
        };

        controlInfo.SetAllSelection = function (value) {

            var isMultiValuedList = Aspectize.UiExtensions.GetProperty(control, 'Multiple');
            if (isMultiValuedList) {

                var selectedMember = Aspectize.UiExtensions.GetProperty(control, 'SelectedMember');

                if (selectedMember) {

                    var options = control.options;
                    for (var n = 0; n < options.length; n++) {

                        var option = options[n];
                        if (option.aasData) {

                            option.aasData.SetField(selectedMember, !!value);
                        }
                    }
                    //$(control).selectpicker(value ? 'selectAll' : 'deselectAll');
                }
            }
        }

        controlInfo.ChangeOption = function (control, value, newDisplay, newDisplayClass) {

            var option = control.options.namedItem(control.id + '-' + value);

            if (option) {

                var needsRefresh = false;

                if (option.text !== newDisplay) {

                    option.text = newDisplay;
                    needsRefresh = true;
                }

                if (option.className !== (newDisplayClass || '')) {
                    option.className = newDisplayClass;
                    needsRefresh = true;
                }

                if (option.aasData) {
                    isMultiValuedList = Aspectize.UiExtensions.GetProperty(control, 'Multiple');
                    var selectedMember = isMultiValuedList ? Aspectize.UiExtensions.GetProperty(control, 'SelectedMember') : false;

                    if (selectedMember) {

                        var isSelected = option.aasData[selectedMember];

                        if (option.selected !== isSelected) {

                            option.selected = isSelected;
                            needsRefresh = true;
                        }
                    }
                }

                if (needsRefresh) {
                    $(control).selectpicker('refresh');
                }
            }
        };

    }
}