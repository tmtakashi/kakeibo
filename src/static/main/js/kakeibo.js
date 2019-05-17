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
    $(document).on('click', '.delete', function () {
        if (!confirm('本当に削除しますか？')) {
            return false;
        };
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
        $(dateCell).text(date);

        // get row data
        var data = {}; 
        row.find('.row_data').each(function(index, val) 
        {   
            var col_name = $(this).attr('col_name');  
            var col_val  =  $(this).html();
            data[col_name] = col_val;
        });
        var inout = $(row).attr('inout');
        $.extend(data, {
            pk: pk,
            inout: inout
        });

        $.ajax({
            url: 'main/edit_item/',
            data: data,
            type: 'POST',
            dataType: 'JSON'
        }).done(data => {
            var month =  $('#select-month').val()
            updateSum();
            updateTable(month);
            updateGraph(month);
        })
    });
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
            `<tr inout='${item.inout}'>` +
            `<td class="row_data" col_name="date">${item.date}</td>` +
            `<td class="row_data" col_name="name">${item.name}</td>` +
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