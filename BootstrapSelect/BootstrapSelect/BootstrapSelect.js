/* Bootstrap select extension */
/* Build with https://developer.snapappointments.com/bootstrap-select/ */


Aspectize.Extend("BootstrapSelect", {
    Binding: 'ListBinding',
    TemplateBuilder: '',
    Properties: { title: '', className: '', style: '', disabled: '', selectedIndex: '', size: '', hidden: '', SelectedValue: '', CurrentData: '', CurrentValue: '', CurrentDisplay: '', DefaultIndex: '', NullValueDisplay: '', CurrentSyncDisabled: '', DisplayMemberClass: '' },
    Events: ['SelectionChanged', 'SelectedValueChanged'],
    Init: function (elem) {

        $(elem).selectpicker({
            liveSearch: true,
            maxOptions: 1
        });


    }
});