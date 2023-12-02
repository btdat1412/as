const fs = require("fs");

// Read input.json
const rawdata = fs.readFileSync("input.json");
const data = JSON.parse(rawdata);

// Accept check-in date as a command line argument
const checkinDate = process.argv[2];

// Validate the check-in date format
if (!isValidDateFormat(checkinDate)) {
  console.error("Invalid date format. Please use YYYY-MM-DD.");
  process.exit(1);
}

function isValidDateFormat(dateString) {
  // Basic validation for YYYY-MM-DD format
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  return regex.test(dateString);
}

// Filter offers 
const filteredOffers = data.offers
  .filter((offer) => {
    //filter days
    const validToDate = new Date(offer.valid_to);
    const checkinDatePlus5Days = new Date(checkinDate);
    checkinDatePlus5Days.setDate(checkinDatePlus5Days.getDate() + 5);

    return (
      (offer.category === 1 || offer.category === 2 || offer.category === 4) &&
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

// Limit the result to 2 offers
const finalResult = filteredOffers.slice(0, 2);

// Save the filtered offers to output.json
const outputData = { offers: finalResult };
const outputJson = JSON.stringify(outputData, null, 2);
fs.writeFileSync("output.json", outputJson);

console.log("Filtered offers saved to output.json");
