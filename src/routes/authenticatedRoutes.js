const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const { BucketController } = require("../controllers");
const { checkPermission } = require("../middleware/checkPermission");
const bucketController = new BucketController();

// GET object
router.get(
  "/bucket/:bucketName/*",
  checkPermission("read"),
  async (req, res) => {
    // logic to get object from local storage
    await bucketController.getObjectFromBucket(req, res);
  }
);

// PUT object
router.put(
  "/bucket/:bucketName/*",
  checkPermission("write"),
  upload.single("file"),
  async (req, res) => {
    await bucketController.addObjectToBucket(req, res);
  }
);

// DELETE object
router.delete(
  "/bucket/:bucketName/*",
  checkPermission("delete"),
  async (req, res) => {
    // logic to delete object from local storage
    await bucketController.deleteObjectFromBucket(req, res);
  }
);

// List objects
router.get("/bucket/:bucketName", checkPermission("read"), async (req, res) => {
  // logic to list objects in the specified bucket
  await bucketController.listObjectsInBucket(req, res);
});

// GET buckets
router.get("/", checkPermission("read"), async (req, res) => {
  // logic to list all the buckets
  await bucketController.listBuckets(req, res);
});

// POST bucket
router.post("/bucket", checkPermission("write"), async (req, res) => {
  await bucketController.createBucket(req, res);
});

// DELETE bucket
router.delete(
  "/bucket/:bucketName",
  checkPermission("delete"),
  async (req, res) => {
    await bucketController.deleteBucket(req, res);
  }
);

module.exports = router;
