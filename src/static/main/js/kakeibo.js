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
    $('#select-month').on('change', function (e) {
        e.preventDefault();
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
            category: $('#category').val(),
            itemName: $('#item-name').val(),
            amount: $('#amount').val()
        };
        $.ajax({
            url: $('#add_item_url').text(),
            type: 'POST',
            data: data,
            dataType: 'json'
        }).done(data => {
            updateSum();
        });
    });

    // 削除
    $(document).on('click', '.delete', function () {
        if (!confirm('本当に削除しますか？')) {
            return false;
        };
        var self = $(this);
        $.ajax({
            url: $('#delete_item_url').text(),
            type: 'POST',
            data: {
                pk: self.data('number')
            },
            dataType: 'json'
        }).done(response => {
            var month =  $('#select-month').val()
            self.parent().parent().remove();
            updateSum();
            updateGraph(month);
        });
    })

    // 変更
    $(document).on('click', '.edit', function (e) {
        // e.preventDefault();
        var row = $(this).closest('tr');
        row.find('.save').show();
        row.find('.cancel').show();
        row.find('.edit').hide();
        row.find('.delete').hide();
        
        row.find('.row_data')
            .attr('contenteditable', 'true')
            .addClass('uk-background-muted')
        
        //--->add the original entry > start
        row.find('.row_data').each(function (index, val) {
            //this will help in case user decided to click on cancel button
            $(this).attr('original_entry', $(this).html());
        });

        var dateCell = row.find('.row_data[col_name^=date]');
        var date = $(dateCell).text();
        $(dateCell).html(`<input class='uk-input' type='date' value='${date}'>`);

        var categoryCell = row.find('.row_data[col_name^=category]');
        var category = $(categoryCell).text();
        $(categoryCell).html(`<select class="uk-select">` +
        '<option>食費</option>' +
        '<option>日用雑貨</option>' +
        '<option>交通</option>' +
        '<option>通信</option>' +
        '<option>水道・光熱</option>' +
        '<option>住まい</option>' +
        '<option>交際費</option>' +
        '<option>エンタメ</option>' +
        '<option>教育・教養</option>' +
        '<option>税金</option>' +
        '<option>その他</option>' +
            '</select>')
        $(categoryCell).find('select').prop('selectedIndex', category2Index[category]);

        // 改行させない
        $('td.row_data').keypress(function(e){ return e.which != 13; });
        
    });

    // Cancel
    $(document).on('click', '.cancel', function(e) {
        e.preventDefault();

        var row = $(this).closest('tr');

        //hide save and cacel buttons
        row.find('.save').hide();
        row.find('.cancel').hide();

        //show edit button
        row.find('.edit').show();
        row.find('.delete').show();

        //make the whole row editable
        row.find('.row_data')
        .attr('contenteditable', 'false')
        .removeClass('uk-background-muted')

        row.find('.row_data').each(function(index, val) 
        {   
            $(this).html( $(this).attr('original_entry') ); 
        });  
    });

    // Save
    $(document).on('click', '.save', function(e) {
        e.preventDefault();
        var row = $(this).closest('tr');
        
        // get row data
        var data = {};
        var rowData = row.find('.row_data');
        for (i = 0; i < rowData.length; i++) {
            var col_name = $(rowData[i]).attr('col_name');  
            var col_val = $(rowData[i]).html();
            if (!col_val) {
                alert('空白にすることは出来ません。');
                return false;
            };
            if ($(rowData[i]).attr('col_name') == 'amount' && !$.isNumeric(col_val)) {
                alert('金額の欄に数字を入力してください');
                return false;
            }
            data[col_name] = col_val;
        };

        var pk = $(this).data('number')
        
        //hide save and cacel buttons
        row.find('.save').hide();
        row.find('.cancel').hide();

        //show edit button
        row.find('.edit').show();
        row.find('.delete').show();

        row.find('.row_data')
        .attr('contenteditable', 'false')
        .removeClass('uk-background-muted')
        
        var dateCell = row.find('.row_data[col_name^=date]');
        var date = $(dateCell).find('input').val();
        data.date = date;
        $(dateCell).text(date);

        var categoryCell = row.find('.row_data[col_name^=category]');
        var category = $(categoryCell).find('select').val();
        data.category = category;
        $(categoryCell).text(category);
        
        var inout = $(row).attr('inout');
        $.extend(data, {
            pk: pk,
            inout: inout
        });

        $.ajax({
            url: $('#edit_item').text(),
            data: data,
            type: 'POST',
            dataType: 'JSON'
        }).done(() => {
            var month =  $('#select-month').val()
            updateSum();
            updateTable(month);
            updateGraph(month);
        })
    });

    $('#download_csv').on('click', function () {
        var month =  $('#select-month').val()
        downloadCSV(month);
    });
});


//////////////////////
// HELPER FUNCTIONS///
//////////////////////


function updateTable(month) {
    $.ajax({
        url: $('#change_month').text(),
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
            `<tr inout='${item.inout}'>` +
            `<td class="row_data" col_name="date">${item.date}</td>` +
            `<td class="row_data" col_name="name">${item.name}</td>` +
            `<td class="row_data" col_name="category">${item.category}</td>` +
            `<td class='${amountAttr} row_data' col_name="amount">${item.amount}</td>` +
            `<td><button class="uk-button uk-button-default uk-margin-right edit" data-number="${item.pk}">変更</button>` +
            `<button class="uk-button uk-button-default uk-margin-right cancel">キャンセル</button>` +
            `<button class="uk-button uk-button-primary uk-margin-right save" data-number="${item.pk}">保存</button>` +
            `<button class="uk-button uk-button-danger delete" data-number="${item.pk}">削除</button></td>` +
            '</tr>');
        $(document).find('.save').hide();
        $(document).find('.cancel').hide(); 
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
    // bar graph
    $.ajax({
        url: $('#data_for_bar_graph').text(),
        type: 'POST',
        data: {
          month: month  
        },
        dataType: 'json'
    }).done(data => {
        if (Object.keys(data).length == 0) {
            window.pie.destroy(); 
            return false;
        }
        var barCtx = document.getElementById("bar-chart").getContext('2d');
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
        if (window.bar != undefined) {
            window.bar.destroy(); 
        }
        window.bar = new Chart(barCtx, {
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

        // Pie chart
        $.ajax({
            url: $('#data_for_pie_graph').text(),
            type: 'POST',
            data: {
                month: month
            },
            dataType: 'JSON'
        }).done(response => {
            if (window.pie && Object.keys(response).length == 0) {
                window.pie.destroy(); 
                return false;
            }
            var dataKeyVal = {
                keys: Object.keys(response),
                values: Object.values(response)
            }
            var pieCtx = document.getElementById("pie-chart").getContext('2d');
            if (window.pie != undefined) {
                window.pie.destroy(); 
            };
            window.pie = new Chart(pieCtx, {
                type: 'pie',
                data: {
                    labels: dataKeyVal.keys,
                    datasets: [{
                    backgroundColor: [
                        "#2ecc71",
                        "#3498db",
                        "#95a5a6",
                        "#9b59b6",
                        "#f1c40f",
                        "#e74c3c",
                        "#34495e",
                        "#fbffc2",
                        "#ffe1f8",
                        "#090116",
                        "#64792b"
                    ],
                    data: dataKeyVal.values
                    }]
                },
        });
        })
    });
}

function downloadCSV(month) {
    $.ajax({
        url: $('#get_csv').text(),
        type: 'POST',
        data: {
            month: month
        },
        dataType: 'JSON'
    }).done(data => {
        var table = data.table;
        // BOM の用意（文字化け対策）
        var bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
        // CSV データの用意
        var csv_data = table.map(function(l){return l.join(',')}).join('\r\n');

        var blob = new Blob([bom, csv_data], { type: 'text/csv' });

        var url = (window.URL || window.webkitURL).createObjectURL(blob);

        var a = document.getElementById('downloader');
        a.download = 'data.csv';
        a.href = url;

        $('#downloader')[0].click();
    })
};

const category2Index = {
    "食費": 0,
    "日用雑貨": 1,
    "交通": 2,
    "通信": 3,
    "水道・光熱": 4,
    "住まい": 5,
    "交際費": 6,
    "エンタメ": 7,
    "教育・教養": 8,
    "税金": 9,
    "その他": 10
}