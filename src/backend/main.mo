import Time "mo:core/Time";
import List "mo:core/List";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Order "mo:core/Order";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";


import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Runtime "mo:core/Runtime";


actor {
  include MixinStorage();

  // Initialize the access control system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Type
  public type UserProfile = {
    name : Text;
  };

  // File Metadata Type
  public type FileMetadata = {
    id : Text;
    fileName : Text;
    uploadTime : Time.Time;
    blob : Storage.ExternalBlob;
  };

  module FileMetadata {
    public func compare(meta1 : FileMetadata, meta2 : FileMetadata) : Order.Order {
      Text.compare(meta1.fileName, meta2.fileName);
    };
  };

  // Updated AdSense Configuration Type (no blog setting)
  public type AdSenseConfig = {
    publisherId : Text;
    enableHeaderBanner : Bool;
    enableToolSectionAds : Bool;
    enableFooterBanner : Bool;
  };

  // Default AdSense Config (no blog setting)
  var adSenseConfig : AdSenseConfig = {
    publisherId = "";
    enableHeaderBanner = true;
    enableToolSectionAds = true;
    enableFooterBanner = true;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let fileMetadatas = Map.empty<Principal, List.List<FileMetadata>>();

  // User Profile Functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // File Management Functions - User only
  public shared ({ caller }) func uploadFile(fileName : Text, blob : Storage.ExternalBlob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can upload files");
    };

    let metadata : FileMetadata = {
      id = fileName;
      fileName;
      uploadTime = Time.now();
      blob;
    };

    let userFiles = switch (fileMetadatas.get(caller)) {
      case (null) { List.empty<FileMetadata>() };
      case (?files) { files };
    };

    userFiles.add(metadata);
    fileMetadatas.add(caller, userFiles);
  };

  public query ({ caller }) func getCallerFiles() : async [FileMetadata] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access files");
    };
    switch (fileMetadatas.get(caller)) {
      case (null) { [] };
      case (?files) { files.toArray() };
    };
  };

  public shared ({ caller }) func deleteFile(fileId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete files");
    };
    let userFiles = switch (fileMetadatas.get(caller)) {
      case (null) { List.empty<FileMetadata>() };
      case (?files) {
        files.filter(func(file) { file.id != fileId });
      };
    };
    fileMetadatas.add(caller, userFiles);
  };

  public query ({ caller }) func getFileMetadata(fileId : Text) : async FileMetadata {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access file metadata");
    };
    switch (fileMetadatas.get(caller)) {
      case (null) { Runtime.trap("File not found") };
      case (?files) {
        let fileArray = files.toArray();
        let meta = fileArray.find(func(file) { file.id == fileId });
        switch (meta) {
          case (null) { Runtime.trap("File not found") };
          case (?metadata) { metadata };
        };
      };
    };
  };

  // Monetization/AdSense Functions - Admin only (no blog setting)
  public shared ({ caller }) func updateAdSenseConfig(newConfig : AdSenseConfig) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update AdSense config");
    };
    adSenseConfig := newConfig;
  };

  public query ({ caller }) func getAdSenseConfig() : async AdSenseConfig {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can access AdSense config");
    };
    adSenseConfig;
  };
};
