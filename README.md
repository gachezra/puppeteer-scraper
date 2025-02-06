# Cheerio Table Scraper

This is a simple Node.js script that uses Cheerio to scrape all tables from a given website, extract their data, and sort them based on the first column.

## Features

- Scrapes all `<table>` elements from a webpage.
- Extracts data from table headers (`<th>`) and cells (`<td>`).
- Sorts table rows alphabetically based on the first column.
- Displays the extracted and sorted data in the console.

## Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or higher recommended)
- npm (comes with Node.js)

## Installation

1. Clone this repository or create a new directory and initialize a Node.js project:
   ```sh
   git clone https://github.com/yourusername/cheerio-scraper.git
   cd cheerio-scraper
   npm init -y
   ```
2. Install Cheerio:
   ```sh
   npm install cheerio
   ```

## Usage

1. Open `index.js` and update the `websiteURL` variable with the target website.
2. Run the script:
   ```sh
   node index.js
   ```
3. The extracted and sorted table data will be displayed in the console.

## Example Output

```
Extracted Table Data:
[
  [ ['Name', 'Age'], ['Alice', '25'], ['Bob', '22'], ['Charlie', '30'] ]
]

Sorted Table Data:
[
  [ ['Name', 'Age'], ['Alice', '25'], ['Bob', '22'], ['Charlie', '30'] ]
]
```

## Notes

- Ensure the target website allows web scraping and complies with its `robots.txt` file.
- Modify the sorting logic in `index.js` if you want to sort by a different column.
- If the target site has dynamically loaded content, consider using `waitForSelector()` or `page.waitForTimeout()`.

## License

This project is licensed under the MIT License.

## Author

[Gachezra](https://github.com/gachezra)
