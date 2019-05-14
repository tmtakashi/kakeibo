$(function () {
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
        })
    });
});