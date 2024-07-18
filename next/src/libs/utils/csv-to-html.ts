/**
 * Convert CSV string to HTML table. This assumes that the CSV string is
 * formatted in a specific way, with metadata rows separated by two newlines
 * and data rows separated by one newline.
 */
export const csvToHtml = (csv: string) => {
  // Convert CSV string to HTML table and open in a new window
  const [metadata, csvData] = csv.split('\n\n');
  const metadataRows = metadata.split('\n');
  const dataRows = csvData.split('\n');

  let html = `
    <style>
        table {
        width: 100%;
        border-collapse: collapse;
        margin: 15px 0;
        font-size: 14px;
        text-align: left;
        }
        th, td {
        padding: 8px;
        border: 1px solid #ddd;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        }
        tr:nth-child(even) {
        background-color: #f9f9f9;
        }
        th {
        background-color: #f2f2f2;
        font-weight: bold;
        }
    </style>
    `;

  html += '<table>';
  metadataRows.forEach((row) => {
    const [key, value] = row.split(': ');
    html += `<tr><th>${key}</th><td>${value}</td></tr>`;
  });
  html += '</table>';

  html += '<table>';
  dataRows.forEach((row, rowIndex) => {
    html += '<tr>';
    const cols = row.split(',');
    cols.forEach((col) => {
      html += rowIndex === 0 ? `<th>${col}</th>` : `<td>${col}</td>`;
    });
    html += '</tr>';
  });
  html += '</table>';

  return html;
};
