$(document).ready(function()
{
    $.Class.extend("Default.FormSubmitLoader",
    {
    },
    {
        init: function(formId)
        {
            this.formId = formId;

            $(this.formId).submit(this.callback('onClickSubmit'));
        },
        onClickSubmit: function(event)
        {
            var submit = $(this.formId).find('input:submit');

            var width = submit.width();
            if (width < 32) {
                width = 32;
            }

            $('<span class="darkBlueButton loader">&nbsp;</span>')
                .width(width)
                .height(submit.height())
                .insertAfter('#' + submit.hide().prop('id'));
        }
    });
});
