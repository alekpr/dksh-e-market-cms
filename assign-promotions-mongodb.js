/**
 * 🗃️ MongoDB Script: Assign All Promotions to Merchant Store
 * Run this directly in MongoDB if you have database access
 */

// First, find the merchant's store ID
const merchant = db.users.findOne({ email: "merchant@dksh.com" });
console.log("Merchant found:", merchant.email);
console.log("Store ID:", merchant.merchantInfo.storeId);

const merchantStoreId = merchant.merchantInfo.storeId;

// Get current promotion distribution
console.log("\n📊 Current promotion distribution:");
const distributionPipeline = [
  {
    $group: {
      _id: "$storeId",
      count: { $sum: 1 },
      promotions: { $push: { id: "$_id", title: "$title" } }
    }
  },
  {
    $sort: { count: -1 }
  }
];

const currentDistribution = db.promotions.aggregate(distributionPipeline).toArray();
currentDistribution.forEach(store => {
  console.log(`Store ${store._id || 'No Store'}: ${store.count} promotions`);
});

// Show promotions that will be moved
console.log("\n📝 Promotions that will be assigned to merchant:");
const promotionsToUpdate = db.promotions.find({ 
  $or: [
    { storeId: { $ne: merchantStoreId } },
    { storeId: { $exists: false } }
  ]
}).toArray();

promotionsToUpdate.forEach((promo, index) => {
  console.log(`${index + 1}. ${promo.title} (${promo._id}) - Current store: ${promo.storeId || 'None'}`);
});

console.log(`\n⚠️ Total promotions to update: ${promotionsToUpdate.length}`);

// Uncomment the following lines to actually perform the update:
/*
console.log("\n🔧 Updating promotions...");

const updateResult = db.promotions.updateMany(
  {
    $or: [
      { storeId: { $ne: merchantStoreId } },
      { storeId: { $exists: false } }
    ]
  },
  {
    $set: { 
      storeId: merchantStoreId,
      updatedAt: new Date()
    }
  }
);

console.log("✅ Update completed!");
console.log(`📊 Matched: ${updateResult.matchedCount} documents`);
console.log(`🔄 Modified: ${updateResult.modifiedCount} documents`);

// Verify the update
console.log("\n🔍 Verification - New promotion distribution:");
const newDistribution = db.promotions.aggregate(distributionPipeline).toArray();
newDistribution.forEach(store => {
  console.log(`Store ${store._id || 'No Store'}: ${store.count} promotions`);
});
*/

console.log("\n💡 To execute the update, uncomment the update section in this script");
console.log("💡 Or run this command in MongoDB shell:");
console.log(`db.promotions.updateMany({storeId: {$ne: ObjectId("${merchantStoreId}")}}, {$set: {storeId: ObjectId("${merchantStoreId}"), updatedAt: new Date()}})`);

/*
Usage instructions:
1. Connect to your MongoDB instance
2. Use the correct database: use your_database_name
3. Run this script: load('assign-promotions-mongodb.js')
4. Or copy-paste sections into mongo shell
*/
