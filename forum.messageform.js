$(document).ready(function()
{
    $.Class.extend("Forum.MessageForm",
    {
        form: '#forumMessageForm'
    },
    {
        init: function()
        {
            new Default.BBCodeForm('#messageBBCodeForm');
        }
    });
});
