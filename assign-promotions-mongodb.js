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

// Update promotion by specific ID
const updatePromotionById = (promotionId, updateData) => {
  console.log(`\n🔧 Updating promotion ${promotionId}...`);
  
  const updateResult = db.promotions.updateOne(
    { _id: ObjectId(promotionId) },
    {
      $set: {
        ...updateData,
        updatedAt: new Date()
      }
    }
  );
  
  console.log(`📊 Matched: ${updateResult.matchedCount} documents`);
  console.log(`🔄 Modified: ${updateResult.modifiedCount} documents`);
  
  if (updateResult.modifiedCount > 0) {
    console.log("✅ Promotion updated successfully!");
    // Show updated promotion
    const updatedPromotion = db.promotions.findOne({ _id: ObjectId(promotionId) });
    console.log("Updated promotion:", updatedPromotion);
  } else {
    console.log("❌ No promotion was updated");
  }
  
  return updateResult;
};

// Example usage:
// updatePromotionById("PROMOTION_ID_HERE", { storeId: merchantStoreId, title: "New Title" });

// Update multiple promotions by IDs
const updatePromotionsByIds = (promotionIds, updateData) => {
  console.log(`\n🔧 Updating ${promotionIds.length} promotions...`);
  
  const objectIds = promotionIds.map(id => ObjectId(id));
  
  const updateResult = db.promotions.updateMany(
    { _id: { $in: objectIds } },
    {
      $set: {
        ...updateData,
        updatedAt: new Date()
      }
    }
  );
  
  console.log(`📊 Matched: ${updateResult.matchedCount} documents`);
  console.log(`🔄 Modified: ${updateResult.modifiedCount} documents`);
  
  return updateResult;
};

// Example usage:
// updatePromotionsByIds(["ID1", "ID2", "ID3"], { storeId: merchantStoreId });

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
📝 MongoDB Update Queries by ID Examples:

1. Update single promotion by ID:
db.promotions.updateOne(
  { _id: ObjectId("PROMOTION_ID_HERE") },
  { 
    $set: { 
      storeId: ObjectId("STORE_ID_HERE"),
      title: "Updated Title",
      updatedAt: new Date()
    }
  }
);

2. Update multiple promotions by IDs:
db.promotions.updateMany(
  { _id: { $in: [ObjectId("ID1"), ObjectId("ID2"), ObjectId("ID3")] } },
  { 
    $set: { 
      storeId: ObjectId("STORE_ID_HERE"),
      updatedAt: new Date()
    }
  }
);

3. CORRECTED QUERY - Your specific case:
db.promotions.updateOne(
  {_id: ObjectId("68bfe049aa1d219b80edd293")},
  {$set: {storeId: ObjectId("68bf9a36f7b98e7aaa251a14")}}
);

4. Update promotion with nested fields:
db.promotions.updateOne(
  { _id: ObjectId("PROMOTION_ID_HERE") },
  { 
    $set: { 
      "metadata.lastModified": new Date(),
      "pricing.discountPercent": 20,
      "status": "active"
    }
  }
);

4. Update and add to array field:
db.promotions.updateOne(
  { _id: ObjectId("PROMOTION_ID_HERE") },
  { 
    $push: { 
      "applicableItems": { productId: ObjectId("PRODUCT_ID"), discount: 15 }
    },
    $set: { updatedAt: new Date() }
  }
)

5. Update with conditional logic:
db.promotions.updateMany(
  { 
    _id: { $in: [ObjectId("ID1"), ObjectId("ID2")] },
    status: "draft"
  },
  { 
    $set: { 
      status: "active",
      startDate: new Date(),
      updatedAt: new Date()
    }
  }
)
*/

/*
Usage instructions:
1. Connect to your MongoDB instance
2. Use the correct database: use your_database_name
3. Run this script: load('assign-promotions-mongodb.js')
4. Or copy-paste sections into mongo shell
*/
