const fs = require("fs");
//read Input file
function readInputFile(filePath) {
  const rawdata = fs.readFileSync(filePath);
  return JSON.parse(rawdata);
}

// Check if the date is in YYYY-MM-DD format
function isValidDateFormat(dateString) {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  return regex.test(dateString);
}

function calculateValidDateRange(checkinDate) {
  const checkinDatePlus5Days = new Date(checkinDate);
  checkinDatePlus5Days.setDate(checkinDatePlus5Days.getDate() + 5);

  return {
    checkinDatePlus5Days,
  };
}

// Filter offers and save to output file function
function filterAndSaveOffers(checkinDate, inputFilePath, outputFilePath) {
  const data = readInputFile(inputFilePath);

  if (!isValidDateFormat(checkinDate)) {
    console.error("Invalid date format. Please use YYYY-MM-DD.");
    process.exit(1);
  }

  const filteredOffers = data.offers
    .filter((offer) => {
      //filter days
      const { checkinDatePlus5Days } = calculateValidDateRange(checkinDate);

      const validCategories = [1, 2, 4];

      return (
        validCategories.includes(offer.category) &&
        validToDate.getTime() >= checkinDatePlus5Days.getTime()
      );
    })
    .reduce((acc, offer) => {
      const existingOffer = acc.find((o) => o.category === offer.category);

      if (!existingOffer) {
        // Add the offer if there's no existing offer in the category
        return [...acc, offer];
      }

      // Check if the current offer's merchant is closer
      if (offer.merchants[0].distance < existingOffer.merchants[0].distance) {
        // Replace the existing offer with the current offer
        return [offer];
        
      } else if (
        offer.merchants[0].distance === existingOffer.merchants[0].distance
      ) {
        // If distances are equal, keep both offers
        return [...acc, offer];
      }

      return acc;
    }, []);

  const finalResult = filteredOffers.slice(0, 2);

  const outputData = { offers: finalResult };
  const outputJson = JSON.stringify(outputData, null, 2);
  fs.writeFileSync(outputFilePath, outputJson);

  console.log("Filtered offers saved to", outputFilePath);
}

// Accept check-in date as a command line argument
const checkinDate = process.argv[2];

// Specify input and output file paths
const inputFilePath = "input.json";
const outputFilePath = "output.json";

// Call the main function
filterAndSaveOffers(checkinDate, inputFilePath, outputFilePath);
