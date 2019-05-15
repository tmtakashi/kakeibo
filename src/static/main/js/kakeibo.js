$(function () {
    // 月の初期値を現在に設定
    var date = new Date()
    var y = date.getFullYear();
    var m = ("00" + (date.getMonth()+1)).slice(-2);
    $('#select-month').val(y + '-' + m);
    // 合計算出
    updateSum();


    // 月変更
    $('#select-month').on('change', function () {
        var self = $(this);
        $.ajax({
            url: 'main/change_month/',
            data: {
                month: self.val()
            },
            type: 'POST',
            dataType: 'JSON'
        }).done(data => {
            var inTable = $('#inTable');
            var outTable = $('#outTable');
            updateTable(data.inItems, inTable);
            updateTable(data.outItems, outTable);
        });
    });

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
        }).done(data => {
            updateSum();
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
            updateSum();
        });
    })

});
function updateTable(items, table) {
    var tbody = $(table).find('tbody').empty()
    items.each(function (_, item) {
        $(tbody).append(
            '<td>' +
                '< tr >' +
                    `<td>${item.date}</td>` +
                    `<td>${item.name}</td>` +
                    `<td class='in-amount'>${item.amount}</td>` +
                    `<td><button class="uk-button uk-button-danger delete" data-number="${item.pk}">削除</button></td>` +
                '</tr>' +
            '</td>')
    })
};
        
function updateSum() {
    var outSum = $('#out-sum');
    var inSum = $('#in-sum');

    var inTot = 0;
    $('.in-amount').each(function (_, amount) {
        inTot += Number($(amount).text())
    });
    var outTot = 0;
    $('.out-amount').each(function (_, amount) {
        outTot += Number($(amount).text())
    });
    console.log(inTot);
    $(inSum).text(inTot);
    $(outSum).text(outTot);
};