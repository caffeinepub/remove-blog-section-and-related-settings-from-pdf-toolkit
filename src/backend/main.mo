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

  // Persistent traffic counter for total page views
  var trafficCounter : Nat = 0;

  // Increment and get traffic counter (accessible to everyone including guests)
  public func incrementAndGetTrafficCounter() : async Nat {
    trafficCounter += 1;
    trafficCounter;
  };

  // Get current traffic counter value (accessible to everyone)
  public query func getTrafficCounter() : async Nat {
    trafficCounter;
  };

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

  // Updated AdSense Configuration Type (with separate ad unit IDs)
  public type AdSenseConfig = {
    publisherId : Text;
    headerAdUnitId : Text;
    sidebarAdUnitId : Text;
    footerAdUnitId : Text;
    inContentAdUnitId : Text;
    enableHeaderBanner : Bool;
    enableSidebarAds : Bool;
    enableFooterBanner : Bool;
    enableInContentAds : Bool;
  };

  // Ad Revenue Metrics (new type for tracking)
  public type AdRevenueMetrics = {
    date : Text;
    impressions : Nat;
    clicks : Nat;
    revenue : Float;
  };

  // AdSense Analytics Record (to store daily metrics)
  type AdSenseAnalytics = {
    impressions : Nat;
    clicks : Nat;
    revenue : Float;
  };

  // Default AdSense Config (with separate ad unit IDs)
  var adSenseConfig : AdSenseConfig = {
    publisherId = "";
    headerAdUnitId = "";
    sidebarAdUnitId = "";
    footerAdUnitId = "";
    inContentAdUnitId = "";
    enableHeaderBanner = true;
    enableSidebarAds = true;
    enableFooterBanner = true;
    enableInContentAds = true;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let fileMetadatas = Map.empty<Principal, List.List<FileMetadata>>();
  let adRevenueMetrics = Map.empty<Text, AdSenseAnalytics>();

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

  // Monetization/AdSense Functions
  // Admin only - update configuration
  public shared ({ caller }) func updateAdSenseConfig(newConfig : AdSenseConfig) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update AdSense config");
    };
    adSenseConfig := newConfig;
  };

  // Public - anyone can read ad configuration to display ads
  public query func getAdSenseConfig() : async AdSenseConfig {
    adSenseConfig;
  };

  // New Ad Revenue Tracking Functions (Admin only)
  public shared ({ caller }) func recordAdMetrics(date : Text, impressions : Nat, clicks : Nat, revenue : Float) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can record ad metrics");
    };
    let analytics : AdSenseAnalytics = {
      impressions;
      clicks;
      revenue;
    };
    adRevenueMetrics.add(date, analytics);
  };

  public query ({ caller }) func getRevenueMetrics(date : Text) : async AdRevenueMetrics {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can access revenue metrics");
    };
    switch (adRevenueMetrics.get(date)) {
      case (null) {
        {
          date;
          impressions = 0;
          clicks = 0;
          revenue = 0.0;
        };
      };
      case (?metrics) {
        {
          date;
          impressions = metrics.impressions;
          clicks = metrics.clicks;
          revenue = metrics.revenue;
        };
      };
    };
  };

  public query ({ caller }) func getAllRevenueMetrics() : async [AdRevenueMetrics] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can access revenue metrics");
    };
    let metricsList = List.empty<AdRevenueMetrics>();

    for ((date, metrics) in adRevenueMetrics.entries()) {
      let revenueMetrics : AdRevenueMetrics = {
        date;
        impressions = metrics.impressions;
        clicks = metrics.clicks;
        revenue = metrics.revenue;
      };
      metricsList.add(revenueMetrics);
    };

    metricsList.reverse().toArray();
  };

  public query ({ caller }) func getRevenueByRange(startDate : Text, endDate : Text) : async [AdRevenueMetrics] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can access revenue metrics");
    };
    let metricsList = List.empty<AdRevenueMetrics>();

    for ((date, metrics) in adRevenueMetrics.entries()) {
      if (date >= startDate and date <= endDate) {
        let revenueMetrics : AdRevenueMetrics = {
          date;
          impressions = metrics.impressions;
          clicks = metrics.clicks;
          revenue = metrics.revenue;
        };
        metricsList.add(revenueMetrics);
      };
    };

    metricsList.reverse().toArray();
  };

  // Aggregate revenue for a date range
  public query ({ caller }) func getAggregateRevenue(startDate : Text, endDate : Text) : async AdRevenueMetrics {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can access revenue metrics");
    };
    var totalImpressions = 0;
    var totalClicks = 0;
    var totalRevenue = 0.0;

    for ((date, metrics) in adRevenueMetrics.entries()) {
      if (date >= startDate and date <= endDate) {
        totalImpressions += metrics.impressions;
        totalClicks += metrics.clicks;
        totalRevenue += metrics.revenue;
      };
    };

    {
      date = startDate # " - " # endDate;
      impressions = totalImpressions;
      clicks = totalClicks;
      revenue = totalRevenue;
    };
  };
};
