// External modules
import fetch from "node-fetch";
import cheerio from "cheerio";
import cron from "node-cron";

// Internal modules
const now = () => {
  const a = new Date();
  const time = a.getHours() + ":" + a.getMinutes();
  const date = a.getDate() + "." + a.getMonth();
  return { time, date };
};

// Constants
const url = "https://www.pararius.com/apartments/enschede";

// Memmory cell
let globalFirstListing;

// Auxiliar functions
function updateGlobalListing(newListing) {
  globalFirstListing = newListing;
}

function doIfNew() {
  console.log("\x1b[36m%s\x1b[0m", "Yaaay, new listing found.");
  while (1) {
    process.stderr.write("\x07");
  }
}

function doIfOld() {
  console.log("No new listings.");
}

// Key functions
async function getFirstListing() {
  const response = await fetch(url);
  const text = await response.text();

  const $ = cheerio.load(text);

  const listings = $(".listing-search-item__link", ".search-list__item");

  if (listings == "Undefined") {
    console.log("An error occured; listings=undefined");
    return;
  }
  if (listings.length == 0) {
    console.log("An error occured; listings.length=0");
    return;
  }

  const firstListing = $(listings[0]).attr("href");

  return firstListing;
}

async function checkIfTheListingIsNew() {
  const actualListing = await getFirstListing();
  const isNew = actualListing != globalFirstListing;

  const timestamp = now();

  console.log(`Request on ${timestamp.date} at ${timestamp.time}`);

  if (isNew) {
    updateGlobalListing(actualListing);
    doIfNew();
  }
  doIfOld();
}

// Main function
async function main() {
  globalFirstListing = await getFirstListing();

  cron.schedule("* * * * *", () => {
    checkIfTheListingIsNew();
  });
}

// Main function call
main();
