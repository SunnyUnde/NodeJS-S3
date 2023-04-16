const Users = require("../models/users.json");
const Roles = require("../models/roles.json");
const ld = require("lodash");

const validatePermission = ({
  currentPermission,
  getPermissionFrom,
  permission,
  res,
  next,
}) => {
  if (!currentPermission) {
    return res.status(403).json({ error: "Insufficient permissions" });
  }
  if (currentPermission?.[getPermissionFrom]?.[permission]) {
    return next();
  }
  return res.status(403).json({ error: "Insufficient permissions" });
};

const checkPermission = (permission) => {
  return (req, res, next) => {
    const username = req.user;
    if (!req.user) {
      return res.status(401).send("Unauthorized");
    }
    const user = Users.find((user) => user.username === username);
    req.organization = user?.organization;
    if (!user?.organization) {
      return res.status(403).send("No associated organization found");
    }
    const permissions = user?.permissions;
    const role = user?.role;
    if (!user || !role) {
      return res.status(403).json({ error: "Access denied" });
    }

    if (role == "admin") {
      return next();
    }

    const bucketName = req.params.bucketName;
    const objectKey = req.params[0];

    if (!bucketName && !objectKey) {
      const currentPermission = Roles[role]?.permissions;
      return validatePermission({
        currentPermission: currentPermission,
        getPermissionFrom: "buckets",
        permission,
        res,
        next,
      });
    }
    const bucketPermission = permissions[bucketName];
    if (!bucketPermission) {
      return res.status(403).json({ error: "Access denied" });
    }

    if (typeof bucketPermission === "string") {
      if (bucketPermission == "admin") {
        return next();
      }

      const currentPermission = Roles[bucketPermission]?.permissions;
      return validatePermission({
        currentPermission: currentPermission,
        getPermissionFrom: "buckets",
        permission,
        res,
        next,
      });
    }

    const pathArr = objectKey.split("/");
    let path = pathArr.join(".");
    const permissionOfObject = ld.get(bucketPermission, path, null);
    if (!permissionOfObject) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    if (permissionOfObject == "admin") {
      return next();
    }

    const currentPermission = Roles[permissionOfObject]?.permissions;
    return validatePermission({
      currentPermission: currentPermission,
      getPermissionFrom: "objects",
      permission,
      res,
      next,
    });
  };
};

module.exports = { checkPermission };
