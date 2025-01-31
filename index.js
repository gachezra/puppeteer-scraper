const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs").promises;
const express = require("express");
require("dotenv").config();

const app = express();

async function scrapeAndSortTable(url) {
  try {
    console.log("Fetching webpage...");
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const tableData = [];
    const dateObjects = [];

    const dateRegex =
      /(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\s+\d+(?:st|nd|rd|th)\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)/i;

    $("table").each((tableIndex, table) => {
      $(table)
        .find("tr")
        .each((rowIndex, row) => {
          $(row)
            .find("td, th")
            .each((cellIndex, cell) => {
              const cellData = {
                text: $(cell).text().trim(),
                links: [],
              };

              $(cell)
                .find("a")
                .each((_, link) => {
                  const href = $(link).attr("href");
                  const linkText = $(link).text().trim();
                  if (href) {
                    cellData.links.push({
                      url: href,
                      text: linkText,
                    });
                  }
                });

              if (dateRegex.test(cellData.text)) {
                let parentText = $(cell).parent().text().trim();
                dateObjects.push({
                  date: cellData.text.match(dateRegex)[0],
                  content: parentText,
                  links: cellData.links,
                });
              }
            });
        });
    });

    if (dateObjects.length > 0) {
      await fs.writeFile(
        "date_objects.txt",
        JSON.stringify(dateObjects, null, 2)
      );
      console.log(
        `Saved ${dateObjects.length} date objects to date_objects.txt`
      );
    }

    let datesWithLinks = dateObjects.filter((obj) => obj.links.length > 0);

    datesWithLinks = Object.values(
      datesWithLinks.reduce((acc, obj) => {
        if (!acc[obj.date]) {
          acc[obj.date] = obj;
        } else {
          acc[obj.date].links.push(...obj.links);
        }
        return acc;
      }, {})
    );

    datesWithLinks.sort((a, b) => {
      const dateOrder =
        new Date(a.date.replace(/(st|nd|rd|th)/g, "")) -
        new Date(b.date.replace(/(st|nd|rd|th)/g, ""));
      return dateOrder;
    });

    if (datesWithLinks.length > 0) {
      await fs.writeFile(
        "dates_with_links.txt",
        JSON.stringify(datesWithLinks, null, 2)
      );
      console.log(
        `Saved ${datesWithLinks.length} unique date entries with links to dates_with_links.txt`
      );
    }
    return datesWithLinks;
  } catch (error) {
    console.error("Error occurred:", error.message);
    await fs.writeFile(
      "error_log.txt",
      JSON.stringify({ error: error.message, stack: error.stack }, null, 2)
    );
  }
}

async function main() {
  const websiteURL = `${process.env.URL}`;
  console.log("Starting scrape of:", websiteURL);
  const events = await scrapeAndSortTable(websiteURL);
  return events;
}

// function cleanDuplicateLinks(events) {
//   return events.map((event) => {
//     // Create a map to track unique URLs and their corresponding texts
//     const uniqueUrls = new Map();

//     // If event has links property and it's an array
//     if (event.links && Array.isArray(event.links)) {
//       // Filter links to keep only unique URLs
//       const cleanedLinks = event.links.filter((link) => {
//         if (!link.url) return false; // Skip entries without URLs

//         if (!uniqueUrls.has(link.url)) {
//           uniqueUrls.set(link.url, link.text);
//           return true;
//         }
//         return false;
//       });

//       // Return new event object with cleaned links
//       return {
//         ...event,
//         links: cleanedLinks,
//       };
//     }

//     // Return original event if no links property or not an array
//     return event;
//   });
// }

function cleanSequentialReverseDuplicateLinks(events) {
  return events.map((event) => {
    if (!event.links || !Array.isArray(event.links)) return event;

    // Set to keep track of URLs already seen in the previous links
    const seenUrls = new Set();

    const cleanedLinks = [];

    event.links.forEach((link, index, linksArr) => {
      if (!link.url) return; // Skip if no URL

      // Normalize URL (in case it's relative)
      const normalizedUrl = link.url.startsWith("http")
        ? link.url
        : "http://whats-on-mombasa.com" + link.url;

      // Extract the filename part from the URL
      const fileName = normalizedUrl.split("/").pop();

      // Check if the file has already been seen in previous links
      if (seenUrls.has(fileName)) {
        return; // Skip this link if its filename is already in a previous link
      }

      // Otherwise, add it to the cleaned links and mark the URL as seen
      seenUrls.add(fileName);
      cleanedLinks.push(link);
    });

    return { ...event, links: cleanedLinks };
  });
}

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).send("niko on");
});

app.get("/events", async (req, res) => {
  const events = await main();

  // Clean the duplicates from the result
  const cleanedResult = cleanSequentialReverseDuplicateLinks(events);

  const filteredResult = cleanedResult.slice(0, 3).map((event) => ({
    date: event.date,
    links: event.links,
  }));

  await fs.writeFile(
    "dates_with_links2.txt",
    JSON.stringify(filteredResult, null, 2)
  );

  res.status(200).json(filteredResult.slice(0, 3));
});

const port = 27684;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
