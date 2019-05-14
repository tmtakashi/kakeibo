$(function () {
    // 追加
    $('#add').on('click', function () {
        var form = document.getElementById('form');
        if (!form.checkValidity()) {
            return
        }
        var data = {
            date: $('#date').val(),
            inout: $('#inout').val(),
            itemName: $('#item-name').val(),
            amount: $('#amount').val()
        };
        $.ajax({
            url: 'main/add_item/',
            type: 'POST',
            data: data,
            dataType: 'json'
        });
    });

    // 削除
    $('.delete').on('click', function () {
        var self = $(this);
        $.ajax({
            url: 'main/delete_item/',
            type: 'POST',
            data: {
                pk: self.data('number')
            },
            dataType: 'json'
        }).done(response => {
            self.parent().parent().remove();
        });
    })
});