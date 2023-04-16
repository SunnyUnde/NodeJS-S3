This is a project for demonstrating the use of REST APIs for a file storage system.

## Project Description

The project provides REST APIs for performing the following operations:

- Create a bucket
- Delete a bucket
- List all buckets
- Add an object to a bucket
- Delete an object from a bucket
- Get an object from a bucket
- List all objects in a bucket

The data is being compressed before storing it in the local disk, thus reducing the memory storage. The data is also being compressed before sending it on network.
Some level of role based access has been added, which can be further improved.

## Getting Started

To get started with the project, follow these steps:

1. Clone the repository.
2. Install the dependencies using the following command:

   ```
   npm install
   ```

3. Start the server using the following command:

   ```
   npm start
   ```

4. The server will start listening on port 3000.

## API Documentation

The API documentation is as follows:

### Create a bucket

Endpoint: `POST /bucket`

Request Body:

```
{
"name": "bucket-name"
}
```

Response Body:

```
{
    "message": "Bucket created successfully"
}

```

### Delete a bucket

Endpoint: `DELETE /bucket/:bucketName`

Response Body:

```
{
    "message": "Bucket deleted successfully"
}
```

### List all buckets

Endpoint: `GET /`

Response Body:

```
{
"buckets",
"bucket1",
"bucket2",
"bucket3"
}
```

### Add an object to a bucket

Endpoint: `PUT /bucket/:bucketName`

Request Body:

```
multipart/form-data
{
"file": "<file-data>"
}
```

Response Body:

```
{
    "message": "Object added successfully"
}

```

### Delete an object from a bucket

Endpoint: `DELETE /bucket/:bucketName/*`

Response Body:

```
{
    "message": "Object deleted successfully"
}
```

### Get an object from a bucket

Endpoint: `GET /bucket/:bucketName/*`

Response Body:

```
<file-data>
```

List all objects in a bucket

Endpoint: GET /bucket/:bucketName

Response Body:

```
{
  "objects": [
    "object1",
    "object2",
    "object3"
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}

```

## Further Improvements

1. Adding support of Redis for faster API response.
2. Currently the users and roles are hard coded which can moved to database.
3. Adding encryption algorithm to encrypt the data for secure storing.
4. Improving the roles and permission access.
5. Adding data in config files for better handling.