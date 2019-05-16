$(function () {
    // 月の初期値を現在に設定
    var date = new Date()
    var y = date.getFullYear();
    var m = ("00" + (date.getMonth() + 1)).slice(-2);
    var ym = y + '-' + m
    $('#select-month').val(ym);
    // 今月のデータ表示
    updateTable(ym);
    updateGraph(ym);

    // 月変更
    $('#select-month').on('change', function () {
        var self = $(this);
        updateTable(self.val());
        updateGraph(self.val());
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

function updateTable(month) {
    $.ajax({
        url: 'main/change_month/',
        data: {
            month: month
        },
        type: 'POST',
        dataType: 'JSON'
    }).done(data => {
        var inTable = $('#inTable');
        var outTable = $('#outTable');
        _updateTable(data.inItems, inTable);
        _updateTable(data.outItems, outTable);
        updateSum();
    });
}

function _updateTable(items, table) {
    var tbody = $(table).find('tbody').empty()
    var amountAttr;
    if ($(table).attr('id') == 'inTable') {
        amountAttr = 'in-amount';
    } else if ($(table).attr('id') == 'outTable') {
        amountAttr = 'out-amount'
    };
    $(items).each(function (_, item) {
        $(tbody).append(
            '<tr>' +
            `<td>${item.date}</td>` +
            `<td>${item.name}</td>` +
            `<td class='${amountAttr}'>${item.amount}</td>` +
            `<td><button class="uk-button uk-button-danger delete" data-number="${item.pk}">削除</button></td>` +
            '</tr>');
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
    $(inSum).text(inTot);
    $(outSum).text(outTot);
};

function updateGraph(month) {
    $.ajax({
        url: 'main/data_for_graph/',
        type: 'POST',
        data: {
          month: month  
        },
        dataType: 'json'
    }).done(data => {
        var ctx = document.getElementById("chart").getContext('2d');
        options = {
            scales: {
                xAxes: [{
                    barPercentage: 0.5,
                    barThickness: 6,
                    maxBarThickness: 8,
                    minBarLength: 2,
                    gridLines: {
                        offsetGridLines: true
                    }
                }],
                yAxes: [
                    {
                      ticks: {
                        beginAtZero: true,
                        min: 0,
                      }
                    }
                  ]
            }
        };
        var myChart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: data.labels,
            datasets: [{
                label: '収入',
                backgroundColor: 'rgba(66, 212, 244, 0.5)',
                data: data.inDataSum
            },
            {
                label: '支出',
                backgroundColor: 'rgba(239, 38, 71, 0.5)',
                data: data.outDataSum
            }]
            },
            options: options
        });
    });
}