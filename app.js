const fs = require("fs");
//read Input file
function readInputFile(filePath) {
  const rawdata = fs.readFileSync(filePath);
  return JSON.parse(rawdata);
}

// Check if the date is in YYYY-MM-DD format
function isValidDateFormat(dateString) {
  const regex = /^\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12][0-9]|3[01])$/;
  return regex.test(dateString);
}

function calculateValidDateRange(checkinDate) {
  const checkinDatePlus5Days = new Date(checkinDate);
  checkinDatePlus5Days.setDate(checkinDatePlus5Days.getDate() + 5);

  return {
    checkinDatePlus5Days,
  };
}
//find closest merchant in each offer
function findClosestMerchant(merchants) {
  return merchants.reduce((minMerchant, currentMerchant) =>
    currentMerchant.distance < minMerchant.distance
      ? currentMerchant
      : minMerchant
  );
}

//handle filter valid offers
function filterValidOffers(checkinDate, offers) {
  const { checkinDatePlus5Days } = calculateValidDateRange(checkinDate);
  const validCategories = [1, 2, 4];

  return (
    offers
      //get each offer with only one closest merchant
      .map((offer) => ({
        ...offer,
        merchants: [findClosestMerchant(offer.merchants)],
      }))
      //filter the offers with valid categories and valid date range
      .filter(
        (offer) =>
          validCategories.includes(offer.category) &&
          new Date(offer.valid_to).getTime() >= checkinDatePlus5Days.getTime()
      )
      //sort the offers by distance
      .sort((a, b) => a.merchants[0].distance - b.merchants[0].distance)
      //get only two offers with different categories
      .reduce((result, offer) => {
        const isSameCategory = result.some(
          (selectedOffer) => selectedOffer.category === offer.category
        );

        if (!isSameCategory && result.length < 2) {
          result.push(offer);
        }

        return result;
      }, [])
  );
}

// Save filtered offers to output file
function saveFilteredOffers(outputFilePath, finalResult) {
  const outputData = { offers: finalResult };
  const outputJson = JSON.stringify(outputData, null, 2);
  fs.writeFileSync(outputFilePath, outputJson);
}

// excecution function
function filterAndSaveOffers(checkinDate, inputFilePath, outputFilePath) {
  const data = readInputFile(inputFilePath);

  if (!isValidDateFormat(checkinDate)) {
    console.error("Invalid date format. Please use YYYY-MM-DD.");
    process.exit(1);
  }

  const filteredOffers = filterValidOffers(checkinDate, data.offers);
  const finalResult = filteredOffers.slice(0, 2);

  saveFilteredOffers(outputFilePath, finalResult);
  console.log("Filtered offers saved to", outputFilePath);
}

// Accept check-in date as a command line argument
const checkinDate = process.argv[2];

// Specify input and output file paths
const inputFilePath = "input.json";
const outputFilePath = "output.json";

// Call the main function
filterAndSaveOffers(checkinDate, inputFilePath, outputFilePath);
