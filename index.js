const puppeteer = require("puppeteer");

async function scrapeAndSortTable(url) {
  const browser = await puppeteer.launch({
    executablePath: puppeteer.executablePath(),
  });

  const page = await browser.newPage();

  await page.goto(url, { waitUntil: "domcontentloaded" });

  const tableData = await page.evaluate(() => {
    const tables = document.querySelectorAll("table");
    let data = [];

    tables.forEach((table) => {
      const rows = table.querySelectorAll("tr");
      let tableArray = [];

      rows.forEach((row) => {
        const cols = row.querySelectorAll("td, th");
        let rowData = [];

        cols.forEach((col) => {
          rowData.push(col.innerText.trim());
        });

        tableArray.push(rowData);
      });

      data.push(tableArray);
    });

    return data;
  });

  await browser.close();

  if (tableData.length === 0) {
    console.log("No tables found on the page.");
    return;
  }

  console.log("Extracted Table Data:");
  console.log(tableData);

  // Sorting each table (assuming the first row is a header)
  const sortedTables = tableData.map((table) => {
    if (table.length <= 1) return table; // Skip sorting if only a header row

    let header = table[0];
    let body = table.slice(1);

    // Sort rows based on the first column (you can modify this)
    body.sort((a, b) => a[0].localeCompare(b[0]));

    return [header, ...body];
  });

  console.log("Sorted Table Data:");
  console.log(sortedTables);
}

// Example Usage
const websiteURL = "https://whats-on-mombasa.com/"; // Replace with the actual URL
scrapeAndSortTable(websiteURL);
