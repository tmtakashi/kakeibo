$(function () {
    $.ajax({
        url: 'main/data_for_graph/',
        type: 'GET',
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
})
