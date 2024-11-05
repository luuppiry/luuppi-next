/**
 * Parse a CSV row, handling quoted fields correctly
 */
const parseCSVRow = (row: string): string[] => {
  const fields: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    const nextChar = row[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Handle escaped quotes
        field += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote mode
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      fields.push(field);
      field = '';
    } else {
      field += char;
    }
  }
  fields.push(field); // Add the last field
  return fields;
};

/**
 * Convert CSV string to HTML table. This assumes that the CSV string is
 * formatted in a specific way, with metadata rows separated by two newlines
 * and data rows separated by one newline.
 */
export const csvToHtml = (csv: string) => {
  const [metadata, csvData] = csv.split('\n\n');
  const metadataRows = metadata.split('\n');
  const dataRows = csvData.split('\n');

  let html = `
    <style>
      body {
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        margin: 2rem;
        background: #f8fafc;
        color: #334155;
      }

      .container {
        max-width: 1800px;
        padding: 0 1rem;
      }

      .metadata-table {
        background: white;
        border-radius: 12px;
        box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
        overflow: hidden;
        margin-bottom: 2rem;
        width: 100%;
        border-collapse: separate;
        border-spacing: 0;
      }

      .metadata-table th {
        background: #f1f5f9;
        padding: 1rem;
        text-align: left;
        font-weight: 600;
        width: 400px;
      }

      .metadata-table td {
        padding: 1rem;
      }

      .data-table {
        width: 100%;
        border-collapse: separate;
        border-spacing: 0;
        background: white;
        border-radius: 12px;
        box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
        overflow: hidden;
      }

      .data-table th,
      .data-table td {
        padding: 0.75rem 1rem;
        text-align: left;
        border-bottom: 1px solid #e2e8f0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 400px;
      }

      .data-table th {
        background: #f8fafc;
        font-weight: 600;
        color: #0f172a;
        position: sticky;
        top: 0;
      }

      .data-table tr:hover td {
        background: #f1f5f9;
      }

      .data-table tr:last-child td {
        border-bottom: none;
      }

      @media (max-width: 768px) {
        body {
          margin: 1rem;
        }
        
        .data-table {
          display: block;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
      }
    </style>
    <div class="container">
    `;

  html += '<table class="metadata-table">';
  metadataRows.forEach((row) => {
    const [key, value] = row.split(': ');
    html += `<tr><th>${key}</th><td>${value}</td></tr>`;
  });
  html += '</table>';

  html += '<table class="data-table">';
  dataRows.forEach((row, rowIndex) => {
    html += '<tr>';
    const cols = parseCSVRow(row);
    cols.forEach((col) => {
      const sanitizedCol = col
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
      html +=
        rowIndex === 0
          ? `<th>${sanitizedCol}</th>`
          : `<td>${sanitizedCol}</td>`;
    });
    html += '</tr>';
  });
  html += '</table></div>';

  return html;
};
