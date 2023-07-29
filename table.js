var tabulate = function (data, columns) {
  var table = d3.select('#tableContainer').append('table'); // Append the table inside the tableContainer div
  var thead = table.append('thead');
  var tbody = table.append('tbody');

  // Append the header row
  thead
    .append('tr')
    .selectAll('th')
    .data(['Rank'].concat(columns)) // Add 'Rank' to the beginning of the columns array
    .enter()
    .append('th')
    .text(function (d) {
      return d;
    });

  var rows = tbody
    .selectAll('tr')
    .data(data)
    .enter()
    .append('tr');

  var cells = rows
    .selectAll('td')
    .data(function (row, i) { // Modify the data mapping function to include the count
      return [{ column: '#', value: i + 1 }].concat(columns.map(function (column) {
        return { column: column, value: row[column] };
      }));
    })
    .enter()
    .append('td')
    .text(function (d) {
      return d.value;
    });

  return table;
};

d3.dsv(';', 'fifa21.csv').then(function (data) {
  var filteredData = data.filter(function (d) {
    return +d.overall >= 89; // Filter data for overall >= 89
  });
  var columns = ['name']; // Select columns to display in the table
  tabulate(filteredData, columns);
});
