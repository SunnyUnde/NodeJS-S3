const fs = require("fs");
const path = require("path");
const { getS3Path } = require("../utils/s3-utils");
const S3path = getS3Path();

class BucketController {
  // Create a new bucket
  async createBucket(req, res) {
    const bucketName = req.body.bucketName;
    const organization = req.organization;
    const bucketPath = path.join(S3path, organization, bucketName);

    // Ensure that the bucket name is not empty
    if (!bucketName) {
      return res.status(400).send("Bucket name is required");
    }

    // Ensure that the bucket does not already exist
    if (fs.existsSync(bucketPath)) {
      return res.status(409).send("Bucket already exists");
    }

    // Create the bucket directory
    fs.mkdirSync(bucketPath, { recursive: true });

    return res.status(201).send("Bucket created successfully");
  }

  // Add object to bucket
  async addObjectToBucket(req, res) {
    console.log("==== inside add object to bucket ===");
    const bucketName = req.params.bucketName;
    const objectKey = req.params[0];
    const organization = req.organization;
    const objectPath = path.join(
      S3path,
      organization,
      bucketName,
      `${objectKey}.gz`
    );

    // Ensure that the bucketName and objectKey parameters are not empty
    if (!bucketName || !objectKey) {
      return res.status(400).send("Bucket name and object key are required");
    }

    // Ensure that the request body is not empty
    if (!req.body) {
      return res.status(400).send("Request body is required");
    }

    const fs = require("fs");
    const zlib = require("zlib");

    if (!fs.existsSync(path.dirname(objectPath))) {
      fs.mkdirSync(path.dirname(objectPath), { recursive: true });
    }

    const stream = fs.createWriteStream(objectPath);
    const gzip = zlib.createGzip();
    const buffer = [];

    // Pipe the request body to the gzip compressor
    req
      .on("data", (chunk) => {
        buffer.push(chunk);
      })
      .on("end", () => {
        // Compress the request body using gzip
        const compressed = gzip.write(Buffer.concat(buffer));
        gzip.end();

        // Write the compressed data to the file system
        stream.on("finish", () => {
          return res.status(200).send("Object stored successfully");
        });

        stream.on("error", (err) => {
          console.error(err);
          return res.status(500).send("Error writing object to file system");
        });

        gzip.pipe(stream);
      });

    gzip.on("error", (err) => {
      console.error(err);
      return res.status(500).send("Error compressing object");
    });
  }

  // Delete object from bucket
  async deleteObjectFromBucket(req, res) {
    console.log("===Inside delete object from bucket===");
    const bucketName = req.params.bucketName;
    const objectKey = req.params[0];
    const organization = req.organization;
    const objectPath = path.join(
      S3path,
      organization,
      bucketName,
      `${objectKey}.gz`
    );

    // Ensure that the bucketName and objectKey parameters are not empty
    if (!bucketName || !objectKey) {
      return res.status(400).send("Bucket name and object key are required");
    }

    // Check if file exists
    if (!fs.existsSync(objectPath)) {
      return res.status(404).send("Object not found");
    }
    try {
      fs.unlinkSync(objectPath);
      return res.status(200).send("Object deleted successfully");
    } catch (err) {
      console.error(err);
      return res.status(500).send("Error deleting object");
    }
  }

  // Get object from bucket
  async getObjectFromBucket(req, res) {
    console.log("=== listBuckets ===");
    const bucketName = req.params.bucketName;
    const objectKey = req.params[0];
    const organization = req.organization;
    const objectPath = path.join(
      S3path,
      organization,
      bucketName,
      `${objectKey}.gz`
    );

    // Ensure that the bucketName and objectKey parameters are not empty
    if (!bucketName || !objectKey) {
      return res.status(400).send("Bucket name and object key are required");
    }

    // Check if file exists
    if (!fs.existsSync(objectPath)) {
      return res.status(404).send("Object not found");
    }

    const zlib = require("zlib");
    const readStream = fs.createReadStream(objectPath);
    const gunzip = zlib.createGunzip();
    const mime = require("mime");
    const contentType = mime.getType(objectKey);

    // Set the response headers to indicate that the response is a file with the original extension
    res.set("Content-Disposition", `attachment; filename="${objectKey}"`);
    res.set("Content-Type", contentType);

    readStream
      .pipe(gunzip)
      .on("error", (err) => {
        console.error(err);
        return res.status(500).send("Error decompressing object");
      })
      .pipe(res);
  }

  // List all objects in bucket
  async listObjectsInBucket(req, res) {
    console.log("=== inside objects in bucket ===");
    const { bucketName } = req.params;
    const { page, limit } = req.query;
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = pageNum * limitNum;

    // Check if the bucket exists
    const organization = req.organization;
    const bucketPath = path.join(S3path, organization, bucketName);
    if (!fs.existsSync(bucketPath) || !fs.lstatSync(bucketPath).isDirectory()) {
      return res.status(404).json({ message: "Bucket not found" });
    }

    // Get all objects in the bucket recursively
    const objects = await this.getObjectsInBucket(bucketPath);
    const paginatedObjects = objects.slice(startIndex, endIndex);
    const hasNextPage = endIndex < objects.length;
    const hasPreviousPage = startIndex > 0;

    const paginatedResponse = {
      objects: paginatedObjects,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: objects.length,
        hasNextPage,
        hasPreviousPage,
      },
    };

    res.json(paginatedResponse);
  }

  // Helper function to recursively get all objects in a bucket
  async getObjectsInBucket(bucketPath) {
    const files = fs.readdirSync(bucketPath);
    let objects = [];

    for (const file of files) {
      const filePath = path.join(bucketPath, file);
      const fileStats = fs.lstatSync(filePath);

      if (fileStats.isDirectory()) {
        const subObjects = await this.getObjectsInBucket(filePath);
        objects = objects.concat(subObjects);
      } else {
        objects.push(file);
      }
    }

    return objects;
  }

  // Util function to delete directory
  deleteDirectory(directoryPath) {
    if (fs.existsSync(directoryPath)) {
      fs.readdirSync(directoryPath).forEach((file, index) => {
        const curPath = path.join(directoryPath, file);
        if (fs.lstatSync(curPath).isDirectory()) {
          // Recursively delete subdirectories
          this.deleteDirectory(curPath);
        } else {
          // Delete files
          fs.unlinkSync(curPath);
        }
      });
      fs.rmdirSync(directoryPath); // Delete the empty directory
      console.log(`Deleted bucket: ${directoryPath}`);
    }
  }

  // Delete bucket
  async deleteBucket(req, res) {
    const bucketName = req.params.bucketName;
    const organization = req.organization;
    const bucketPath = path.join(S3path, organization, bucketName);

    // Ensure that the bucketName parameter is not empty
    if (!bucketName) {
      return res.status(400).send("Bucket name is required");
    }

    // Check if directory exists
    if (!fs.existsSync(bucketPath)) {
      return res.status(404).send("Bucket not found");
    }

    // const rimraf = require("rimraf");
    // Delete the directory and its contents recursively
    this.deleteDirectory(bucketPath);

    res.send(`Bucket '${bucketName}' deleted successfully`);
  }

  // List all buckets
  async listBuckets(req, res) {
    try {
      console.log("=== List all Buckets called===");
      const page = req?.body?.page ?? 1;
      const limit = req?.body?.limit ?? 30;
      const buckets = fs.readdirSync(S3path);
      const totalBuckets = buckets.length;

      // calculate pagination values
      const totalPages = Math.ceil(totalBuckets / limit);
      const offset = (page - 1) * limit;

      // slice the buckets array based on pagination values
      const paginatedBuckets = buckets.slice(offset, offset + limit);

      // return the paginated buckets and pagination metadata
      res.json({
        totalPages,
        currentPage: page,
        totalBuckets,
        buckets: paginatedBuckets.map((bucketName) => {
          const organization = req.organization;
          const bucketPath = path.join(S3path, organization, bucketName);
          const stats = fs.statSync(bucketPath);
          return {
            name: bucketName,
            createdAt: stats.birthtime,
            size: stats.size,
          };
        }),
      });
    } catch (err) {
      console.error(err);
      return res.status(500).send("Error listing buckets");
    }
  }
}

module.exports = BucketController;
