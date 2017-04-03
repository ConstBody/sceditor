$(document).ready(function()
{
    $.Class.extend("Default.BBCodeForm.UploadImage",
    {
        deleteButton: '.defaultBBCodeFormUploadImageDeleteButton',
        fileInput: '.defaultBBCodeFormUploadImageFileInput',
        list: '.defaultBBCodeFormUploadImageList',
        typeFile: '.defaultBBCodeFormUploadImageTypeFile',
        typeFileLabel: '.defaultBBCodeFormUploadImageTypeFileLabel',
        typeUrl: '.defaultBBCodeFormUploadImageTypeUrl',
        typeUrlLabel: '.defaultBBCodeFormUploadImageTypeUrlLabel',
        uploadButton: '.defaultBBCodeFormUploadImageUploadButton',
        uploadLoader: '.defaultBBCodeFormUploadImageUploadLoader',
        urlInput: '.defaultBBCodeFormUploadImageUrlInput'
    },
    {
        addImage: function(image)
        {
            var maxCnt = 0;
            $(this.form.instance).find('.defaultBBCodeFormUploadImageImageName').each(function() {
                var imageCnt = parseInt($(this).prop('name').substr(6));
                if (maxCnt < imageCnt) {
                    maxCnt = imageCnt;
                }
            });

            maxCnt = maxCnt + 1;

            var row = 
                '<tr>' +
                '<td width="130">' +
                '<img src="' + APP_URL + '/files/messages/' + image + '" width="120" height="80" style="border: 1px solid  #666;"/>' +
                '<input class="defaultBBCodeFormUploadImageImageName" type="hidden" name="image_' + maxCnt + '" value="' + image + '" />' +
                '<input class="defaultBBCodeFormUploadImageImageId" type="hidden" name="image_' + maxCnt + '_id" value="0" />' +
                '</td>' +
                '<td width="30">URL:<br /><span class="helpText">&nbsp;</span></td>' +
                '<td width="600"><input class="defaultBBCodeFormUploadImageBBCode" type="text" value="' + APP_URL + '/files/messages/' + image + '" style="width:100%;"/><br /><span class="helpText">Скопируйте url изображения и вставьте его в сообщении.</span></td>' +
                '<td width="80"><a class="defaultBBCodeFormUploadImageDeleteButton blueButton" href="" onclick="return false;" style="width: 60px;">Удалить</a><span class="helpText">&nbsp;</span></td>' +
                '<td>&nbsp;</td>' +
                '</tr>';

            $(this.form.instance).find(this.Class.list).append(row).show();
            this.images.push(image);
        },
        init: function(form)
        {
            this.form = form;

            $(document).on('click', this.form.instance + ' ' + this.Class.deleteButton, this.callback('onClickDeleteButton'));
            $(this.form.instance).find(this.Class.typeFile).click(this.callback('onClickTypeFileLabel'));
            $(this.form.instance).find(this.Class.typeFileLabel).click(this.callback('onClickTypeFileLabel'));
            $(this.form.instance).find(this.Class.typeUrl).click(this.callback('onClickTypeUrlLabel'));
            $(this.form.instance).find(this.Class.typeUrlLabel).click(this.callback('onClickTypeUrlLabel'));
            $(this.form.instance).find(this.Class.uploadButton).click(this.callback('onClickUploadButton'));

            var widget = this;
            $(this.form.instance).find(this.Class.urlInput).bind('keypress', function(event) {
                if (event.keyCode == '13') {
                    event.preventDefault();
                    widget.onClickUploadButton();
                }
            });
            this.images = [];
            this.addImg = function(img){
                widget.addImage(img);
            };
            this.onClickTypeUrlLabel();
        },
        onClickDeleteButton: function(event)
        {
            if (!confirm('Вы уверены что хотите удалить это изображение?')) {
                return false;
            }

            var row = $(event.target).parent().parent();
            var bbcode = '[img]' + row.find('.defaultBBCodeFormUploadImageBBCode').val() + '[/img]';
            var image = row.find('.defaultBBCodeFormUploadImageImageName').val();
            var imageId = row.find('.defaultBBCodeFormUploadImageImageId').val();

            var widget = this;
            $.post(APP_URL + '/forum/message/deleteimage/', {'image': image, 'imageId': imageId}, function(result) {
                if (result.status) {
                    var html = widget.form.content.val();
                    html = html.replace(bbcode, '');
                    widget.form.content.val(html);
                    row.remove();
                    if ($(widget.form.instance).find(widget.Class.list).find("tr").length < 1) {
                        $(widget.form.instance).find(widget.Class.list).hide();
                    }
                } else {
                    alert(result.errors[0]);
                }
            }, 'json');
        },
        onClickTypeFileLabel: function(event)
        {
            $(this.form.instance).find(this.Class.typeFile).prop('checked', true);
            $(this.form.instance).find(this.Class.typeUrl).prop('checked', false);
            $(this.form.instance).find(this.Class.fileInput).parent().show();
            $(this.form.instance).find(this.Class.urlInput).parent().hide();
        },
        onClickTypeUrlLabel: function(event)
        {
            $(this.form.instance).find(this.Class.typeUrl).prop('checked', true);
            $(this.form.instance).find(this.Class.typeFile).prop('checked', false);
            $(this.form.instance).find(this.Class.urlInput).parent().show();
            $(this.form.instance).find(this.Class.fileInput).parent().hide();
        },
        onClickUploadButton: function()
        {
            $(this.form.instance).find(this.Class.uploadButton).hide();
            $(this.form.instance).find(this.Class.uploadLoader).show();

            var type = 0;
            if ($(this.form.instance).find(this.Class.typeUrl).prop('checked')) {
                type = 1;
            } else if ($(this.form.instance).find(this.Class.typeFile).prop('checked')) {
                type = 2;
            }

            var widget = this;

            switch (type) {
            case 1:
                var url = $(this.form.instance).find(this.Class.urlInput).val();
                if ('' == url) {
                    $(this.form.instance).find(this.Class.uploadLoader).hide();
                    $(this.form.instance).find(this.Class.uploadButton).show();
                    return false;
                }

                $.post(APP_URL + '/forum/message/uploadimage/source/url/', {'url': url}, function (result) {
                    if (result.status) {
                        $(widget.form.instance).find(widget.Class.urlInput).val('');
                        widget.addImage(result.image);
                    } else {
                        alert(result.errors[0]);
                    }
                    $(widget.form.instance).find(widget.Class.uploadLoader).hide();
                    $(widget.form.instance).find(widget.Class.uploadButton).show();
                }, 'json');
                break;
            case 2:
                $.ajaxUpload({
                    url: APP_URL + '/forum/message/uploadimage/source/file/',
                    data: $(this.form.instance).find(this.Class.fileInput),
                    success: function(result) {
                        if(result.status) {
                            $(widget.form.instance).find(widget.Class.fileInput).val('');
                            widget.addImage(result.image);
                        } else {
                            alert(result.errors[0]);
                        }
                        $(widget.form.instance).find(widget.Class.uploadLoader).hide();
                        $(widget.form.instance).find(widget.Class.uploadButton).show();
                    },
                    dataType: 'json'});
                break;
            }
        }
    });
});