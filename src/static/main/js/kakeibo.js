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
        var table = document.getElementById('table');
        var row = table.insertRow(0)
        var cell1 = row.insertCell(-1);
        var cell2 = row.insertCell(-1);
        var cell3 = row.insertCell(-1);
        var cell4 = row.insertCell(-1);
        cell1.innerHTML = data.date;
        cell2.innerHTML = data.inout;
        cell3.innerHTML = data.itemName;
        cell4.innerHTML = data.amount;
    });
});