-- CreateTable
CREATE TABLE `dsp_data` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `brandsId` INTEGER NOT NULL,
    `viewabilityRate` DOUBLE NULL,
    `checkoutValueSum` INTEGER NULL,
    `checkoutViews` INTEGER NULL,
    `orderBudget` INTEGER NULL,
    `unitsSold` INTEGER NULL,
    `otherClicks` INTEGER NULL,
    `paidSubscriptionSignupViews` INTEGER NULL,
    `skillInvocationRate` INTEGER NULL,
    `totalNewToBrandPurchasesClicks` INTEGER NULL,
    `mobileAppFirstStarts` INTEGER NULL,
    `paidSubscriptionSignupClicks` INTEGER NULL,
    `newToBrandDetailPageViewClicks` INTEGER NULL,
    `mobileAppFirstStartCVR` INTEGER NULL,
    `skillInvocationClicks` INTEGER NULL,
    `mobileAppFirstStartClicks` INTEGER NULL,
    `pageViewValueAverage` DOUBLE NULL,
    `threePFeeComScoreAbsorbed` INTEGER NULL,
    `offAmazonERPM` DOUBLE NULL,
    `grossImpressions` INTEGER NULL,
    `invalidImpressions` INTEGER NULL,
    `newToBrandDetailPageViewRate` DOUBLE NULL,
    `totalECPDetailPageView` DOUBLE NULL,
    `offAmazonCPA` DOUBLE NULL,
    `playTrailersClicks` INTEGER NULL,
    `clickThroughRate` DOUBLE NULL,
    `contactValueAverage` DOUBLE NULL,
    `offAmazonROAS` DOUBLE NULL,
    `totalECPAddToList` DOUBLE NULL,
    `omnichannelMetricsFee` INTEGER NULL,
    `eCPPaidSubscriptionSignup` DOUBLE NULL,
    `checkoutValueAverage` DOUBLE NULL,
    `totalPurchaseRate` DOUBLE NULL,
    `totalUnitsSold` INTEGER NULL,
    `totalNewToBrandECPDetailPageView` DOUBLE NULL,
    `totalAddToListViews` INTEGER NULL,
    `videoDownloadsClicks` INTEGER NULL,
    `totalProductReviewPageVisits` INTEGER NULL,
    `rentalRate` INTEGER NULL,
    `audioAdMidpoint` INTEGER NULL,
    `threePFees` INTEGER NULL,
    `appStoreOpens` INTEGER NULL,
    `totalProductReviewPageVisitsClicks` INTEGER NULL,
    `newToBrandECPDetailPageView` DOUBLE NULL,
    `checkoutClicks` INTEGER NULL,
    `downloadedVideoPlays` INTEGER NULL,
    `contactCVR` INTEGER NULL,
    `audioAdUnmute` INTEGER NULL,
    `subscribeClicks` INTEGER NULL,
    `proposalId` DOUBLE NULL,
    `audioAdFirstQuartile` INTEGER NULL,
    `measurableImpressions` INTEGER NULL,
    `search` INTEGER NULL,
    `notificationOpens` INTEGER NULL,
    `otherCPA` DOUBLE NULL,
    `subscriptionSignupRate` INTEGER NULL,
    `threePPreBidFee` INTEGER NULL,
    `totalNewToBrandPurchasesPercentage` DOUBLE NULL,
    `threePFeeAutomotiveAbsorbed` INTEGER NULL,
    `videoAdThirdQuartile` INTEGER NULL,
    `threePFeeCPM1Absorbed` INTEGER NULL,
    `orderName` VARCHAR(191) NULL,
    `totalPurchasesClicks` INTEGER NULL,
    `freeTrialSubscriptionSignupRate` INTEGER NULL,
    `impressionFrequencyAverage` DOUBLE NULL,
    `subscribeCPA` DOUBLE NULL,
    `applicationValueAverage` DOUBLE NULL,
    `leadCPA` DOUBLE NULL,
    `pageViewCVR` INTEGER NULL,
    `householdFrequencyAverage` DOUBLE NULL,
    `searchCVR` INTEGER NULL,
    `addToShoppingCartClicks` INTEGER NULL,
    `eCPAppStoreFirstOpens` DOUBLE NULL,
    `appStoreFirstOpensViews` INTEGER NULL,
    `applicationClicks` INTEGER NULL,
    `signUpCPA` DOUBLE NULL,
    `videoAdMidpoint` INTEGER NULL,
    `audioAdRewind` INTEGER NULL,
    `addToWatchlistRate` INTEGER NULL,
    `intervalEnd` VARCHAR(191) NULL,
    `eCPAddToCart` DOUBLE NULL,
    `videoAdUnmute` INTEGER NULL,
    `newToBrandDetailPageViews` INTEGER NULL,
    `videoAdCompletionRate` DOUBLE NULL,
    `skillInvocationViews` INTEGER NULL,
    `addToListClicks` INTEGER NULL,
    `audioAdCompanionBannerViews` INTEGER NULL,
    `audioAdCompletionRate` DOUBLE NULL,
    `newToBrandERPM` DOUBLE NULL,
    `eCPAddToList` DOUBLE NULL,
    `combinedPurchasesViews` INTEGER NULL,
    `totalPurchasesViews` INTEGER NULL,
    `threePFeeComScore` INTEGER NULL,
    `productReviewPageVisitsViews` INTEGER NULL,
    `videoDownloadsViews` INTEGER NULL,
    `invalidClickThroughs` INTEGER NULL,
    `detailPageViewRate` DOUBLE NULL,
    `detailPageViewClicks` INTEGER NULL,
    `contact` INTEGER NULL,
    `searchValueSum` INTEGER NULL,
    `totalAddToList` INTEGER NULL,
    `offAmazonPurchases` INTEGER NULL,
    `checkoutCVR` INTEGER NULL,
    `audioAdThirdQuartile` INTEGER NULL,
    `addToListViews` INTEGER NULL,
    `threePFeeDoubleVerifyAbsorbed` INTEGER NULL,
    `totalNewToBrandDPVs` INTEGER NULL,
    `purchases` INTEGER NULL,
    `threePFeeCPM2Absorbed` INTEGER NULL,
    `addToWatchlistViews` INTEGER NULL,
    `appStoreFirstOpensClicks` INTEGER NULL,
    `eCPVideoDownload` DOUBLE NULL,
    `pageViewCPA` DOUBLE NULL,
    `paidSubscriptionSignups` INTEGER NULL,
    `orderExternalId` DOUBLE NULL,
    `eCPAudioAdCompletion` DOUBLE NULL,
    `totalProductReviewPageVisitsViews` INTEGER NULL,
    `videoAdReplays` INTEGER NULL,
    `totalPurchases` INTEGER NULL,
    `offAmazonClicks` INTEGER NULL,
    `productReviewPageVisits` INTEGER NULL,
    `playTrailers` INTEGER NULL,
    `totalCost` DOUBLE NULL,
    `offAmazonProductSales` INTEGER NULL,
    `frequencyAverage` DOUBLE NULL,
    `videoStreamsViews` INTEGER NULL,
    `eCPSkillInvocation` DOUBLE NULL,
    `newToBrandROAS` DOUBLE NULL,
    `orderEndDate` VARCHAR(191) NULL,
    `playTrailersViews` INTEGER NULL,
    `eCPAddToWatchlist` DOUBLE NULL,
    `totalNewToBrandUnitsSold` INTEGER NULL,
    `addToList` INTEGER NULL,
    `eCPP` DOUBLE NULL,
    `mobileAppFirstStartViews` INTEGER NULL,
    `leadClicks` INTEGER NULL,
    `eCPProductReviewPageVisit` DOUBLE NULL,
    `totalProductReviewPageVisitRate` DOUBLE NULL,
    `eCPM` DOUBLE NULL,
    `addToCartClicks` INTEGER NULL,
    `searchClicks` INTEGER NULL,
    `videoAdSkipForwards` INTEGER NULL,
    `appStoreUsageHoursViews` INTEGER NULL,
    `checkout` INTEGER NULL,
    `appStoreUsageHoursClicks` INTEGER NULL,
    `eCPC` DOUBLE NULL,
    `audioAdMute` INTEGER NULL,
    `videoAdFirstQuartile` INTEGER NULL,
    `audioAdResume` INTEGER NULL,
    `offAmazonConversions` INTEGER NULL,
    `combinedPurchases` INTEGER NULL,
    `videoAdStart` INTEGER NULL,
    `brandSearchesClicks` INTEGER NULL,
    `amazonDSPAudienceFee` DOUBLE NULL,
    `entityId` VARCHAR(191) NULL,
    `eCPBrandSearch` DOUBLE NULL,
    `newToBrandUnitsSold` INTEGER NULL,
    `offAmazonViews` INTEGER NULL,
    `rentals` INTEGER NULL,
    `measurableRate` DOUBLE NULL,
    `videoAdCreativeViews` INTEGER NULL,
    `threePPreBidFeeOracleDataCloud` INTEGER NULL,
    `paidSubscriptionSignupRate` INTEGER NULL,
    `advertiserTimezone` VARCHAR(191) NULL,
    `videoStreamsRate` INTEGER NULL,
    `combinedProductSales` DOUBLE NULL,
    `totalFee` DOUBLE NULL,
    `videoStreams` INTEGER NULL,
    `contactValueSum` INTEGER NULL,
    `threePFeeCPM1` INTEGER NULL,
    `threePFeeCPM2` INTEGER NULL,
    `clicks` INTEGER NULL,
    `brandSearchesViews` INTEGER NULL,
    `pageViewValueSum` INTEGER NULL,
    `agencyFee` INTEGER NULL,
    `threePFeeCPM3` INTEGER NULL,
    `searchViews` INTEGER NULL,
    `contactCPA` DOUBLE NULL,
    `totalNewToBrandPurchaseRate` DOUBLE NULL,
    `appStoreFirstSessionHours` INTEGER NULL,
    `brandSearchRate` DOUBLE NULL,
    `orderId` INTEGER NULL,
    `subscriptionSignupClicks` INTEGER NULL,
    `reach` DOUBLE NULL,
    `appStoreOpensClicks` INTEGER NULL,
    `ROAS` DOUBLE NULL,
    `totalAddToCartClicks` INTEGER NULL,
    `grossClickThroughs` INTEGER NULL,
    `eCPVideoStream` DOUBLE NULL,
    `totalECPSubscribeAndSave` DOUBLE NULL,
    `signUp` INTEGER NULL,
    `audioAdSkip` INTEGER NULL,
    `addToWatchlist` INTEGER NULL,
    `videoAdEndStateClicks` INTEGER NULL,
    `totalAddToCart` INTEGER NULL,
    `eCPSubscriptionSignup` DOUBLE NULL,
    `totalSubscribeAndSaveRate` DOUBLE NULL,
    `audioAdViews` INTEGER NULL,
    `freeTrialSubscriptionSignupViews` INTEGER NULL,
    `totalNewToBrandDPVViews` INTEGER NULL,
    `totalNewToBrandROAS` DOUBLE NULL,
    `videoStreamsClicks` INTEGER NULL,
    `leadValueSum` INTEGER NULL,
    `otherCVR` INTEGER NULL,
    `contactClicks` INTEGER NULL,
    `addToShoppingCartCPA` DOUBLE NULL,
    `skillInvocation` INTEGER NULL,
    `downloadedVideoPlaysClicks` INTEGER NULL,
    `alexaSkillEnable` INTEGER NULL,
    `threePPreBidFeePixalate` INTEGER NULL,
    `totalDetailPageViewRate` DOUBLE NULL,
    `newToBrandPurchasesViews` INTEGER NULL,
    `videoAdPause` INTEGER NULL,
    `combinedROAS` DOUBLE NULL,
    `downloadedVideoPlaysViews` INTEGER NULL,
    `searchCPA` DOUBLE NULL,
    `pageViewViews` INTEGER NULL,
    `pageViews` INTEGER NULL,
    `threePFeeIntegralAdScience` INTEGER NULL,
    `audioAdPause` INTEGER NULL,
    `videoAdImpressions` INTEGER NULL,
    `combinedECPP` DOUBLE NULL,
    `subscribeCVR` INTEGER NULL,
    `otherValueSum` INTEGER NULL,
    `totalERPM` DOUBLE NULL,
    `other` INTEGER NULL,
    `offAmazonPurchaseRate` DOUBLE NULL,
    `interactiveImpressions` INTEGER NULL,
    `signUpValueSum` INTEGER NULL,
    `audioAdStart` INTEGER NULL,
    `freeTrialSubscriptionSignups` INTEGER NULL,
    `totalECPAddToCart` DOUBLE NULL,
    `rentalsClicks` INTEGER NULL,
    `signUpCVR` INTEGER NULL,
    `totalDetailPageViewViews` INTEGER NULL,
    `addToCart` INTEGER NULL,
    `videoAdClicks` INTEGER NULL,
    `offAmazonPurchasesClicks` INTEGER NULL,
    `rentalsViews` INTEGER NULL,
    `mobileAppFirstStartCPA` DOUBLE NULL,
    `totalAddToCartViews` INTEGER NULL,
    `otherValueAverage` DOUBLE NULL,
    `videoAdComplete` INTEGER NULL,
    `addToCartRate` DOUBLE NULL,
    `appStoreOpensViews` INTEGER NULL,
    `offAmazonUnitsSold` INTEGER NULL,
    `applicationCPA` DOUBLE NULL,
    `totalAddToListClicks` INTEGER NULL,
    `eRPM` DOUBLE NULL,
    `combinedPurchaseRate` DOUBLE NULL,
    `subscribeValueAverage` DOUBLE NULL,
    `offAmazonCVR` DOUBLE NULL,
    `newSubscribeAndSaveViews` INTEGER NULL,
    `totalSales` DOUBLE NULL,
    `appStoreFirstOpensRate` INTEGER NULL,
    `freeTrialSubscriptionSignupClicks` INTEGER NULL,
    `impressions` INTEGER NULL,
    `householdReach` DOUBLE NULL,
    `lead` INTEGER NULL,
    `advertiserId` INTEGER NULL,
    `viewableImpressions` INTEGER NULL,
    `appStoreFirstOpens` INTEGER NULL,
    `NewToBrandECPP` DOUBLE NULL,
    `applicationValueSum` INTEGER NULL,
    `combinedERPM` DOUBLE NULL,
    `applicationViews` INTEGER NULL,
    `threePFeeIntegralAdScienceAbsorbed` INTEGER NULL,
    `appStoreOpensRate` INTEGER NULL,
    `totalNewToBrandDPVRate` DOUBLE NULL,
    `detailPageViewViews` INTEGER NULL,
    `totalSubscribeAndSaveClicks` INTEGER NULL,
    `date` INTEGER NULL,
    `threePFeeAutomotive` INTEGER NULL,
    `purchasesClicks` INTEGER NULL,
    `audioAdCompanionBannerClicks` INTEGER NULL,
    `appStoreUsageHours` INTEGER NULL,
    `detailPageViews` INTEGER NULL,
    `subscriptionSignupViews` INTEGER NULL,
    `totalNewToBrandSales` DOUBLE NULL,
    `addToListRate` DOUBLE NULL,
    `contactViews` INTEGER NULL,
    `addToCartViews` INTEGER NULL,
    `sales` DOUBLE NULL,
    `productReviewPageVisitsClicks` INTEGER NULL,
    `videoDownloads` INTEGER NULL,
    `purchaseRate` DOUBLE NULL,
    `subscribeValueSum` INTEGER NULL,
    `invalidClickThroughRate` DOUBLE NULL,
    `addToShoppingCart` INTEGER NULL,
    `leadCVR` INTEGER NULL,
    `purchasesViews` INTEGER NULL,
    `newSubscribeAndSave` INTEGER NULL,
    `newSubscribeAndSaveRate` DOUBLE NULL,
    `audioAdCompletions` INTEGER NULL,
    `otherViews` INTEGER NULL,
    `subscribeViews` INTEGER NULL,
    `eCPAppStoreOpens` DOUBLE NULL,
    `alexaSkillEnableViews` INTEGER NULL,
    `newToBrandDetailPageViewViews` INTEGER NULL,
    `marketplace` INTEGER NULL,
    `totalNewToBrandPurchasesViews` INTEGER NULL,
    `orderCurrency` VARCHAR(191) NULL,
    `totalNewToBrandERPM` DOUBLE NULL,
    `combinedPurchasesClicks` INTEGER NULL,
    `applicationCVR` INTEGER NULL,
    `newToBrandPurchasesPercentage` DOUBLE NULL,
    `videoDownloadRate` INTEGER NULL,
    `newToBrandProductSales` DOUBLE NULL,
    `pageViewClicks` INTEGER NULL,
    `invalidImpressionRate` DOUBLE NULL,
    `totalDetailPageView` INTEGER NULL,
    `threePPreBidFeeDoubleVerify` INTEGER NULL,
    `signUpViews` INTEGER NULL,
    `eCPAlexaSkillEnable` DOUBLE NULL,
    `threePPreBidFeeIntegralAdScience` INTEGER NULL,
    `videoAdMute` INTEGER NULL,
    `downloadedVideoPlayRate` INTEGER NULL,
    `totalAddToListRate` DOUBLE NULL,
    `totalSubscribeAndSaveViews` INTEGER NULL,
    `threePFeeDoubleVerify` INTEGER NULL,
    `leadValueAverage` DOUBLE NULL,
    `searchValueAverage` DOUBLE NULL,
    `videoAdResume` INTEGER NULL,
    `newToBrandPurchaseRate` DOUBLE NULL,
    `addToShoppingCartValueSum` INTEGER NULL,
    `newSubscribeAndSaveClicks` INTEGER NULL,
    `playTrailerRate` INTEGER NULL,
    `addToShoppingCartValueAverage` DOUBLE NULL,
    `signUpClicks` INTEGER NULL,
    `eCPRental` DOUBLE NULL,
    `checkoutCPA` DOUBLE NULL,
    `subscriptionSignups` INTEGER NULL,
    `appStoreFirstSessionHoursClicks` INTEGER NULL,
    `newToBrandPurchases` INTEGER NULL,
    `combinedUnitsSold` INTEGER NULL,
    `supplyCost` DOUBLE NULL,
    `eCPnewSubscribeAndSave` DOUBLE NULL,
    `videoAdSkipBacks` INTEGER NULL,
    `advertiserName` VARCHAR(191) NULL,
    `offAmazonECPP` DOUBLE NULL,
    `eCPFreeTrialSubscriptionSignup` DOUBLE NULL,
    `amazonDSPConsoleFee` DOUBLE NULL,
    `orderStartDate` VARCHAR(191) NULL,
    `totalSubscribeAndSave` INTEGER NULL,
    `newToBrandPurchasesClicks` INTEGER NULL,
    `totalAddToCartRate` DOUBLE NULL,
    `eCPPlayTrailer` DOUBLE NULL,
    `advertiserCountry` VARCHAR(191) NULL,
    `eCPDownloadedVideoPlays` DOUBLE NULL,
    `intervalStart` VARCHAR(191) NULL,
    `alexaSkillEnableRate` INTEGER NULL,
    `signUpValueAverage` DOUBLE NULL,
    `addToShoppingCartViews` INTEGER NULL,
    `subscribe` INTEGER NULL,
    `totalROAS` DOUBLE NULL,
    `offAmazonPurchasesViews` INTEGER NULL,
    `totalECPProductReviewPageVisit` DOUBLE NULL,
    `addToShoppingCartCVR` INTEGER NULL,
    `totalECPP` DOUBLE NULL,
    `threePFeeCPM3Absorbed` INTEGER NULL,
    `totalNewToBrandPurchases` INTEGER NULL,
    `eCPDetailPageView` DOUBLE NULL,
    `addToWatchlistClicks` INTEGER NULL,
    `productReviewPageVisitRate` DOUBLE NULL,
    `threePFeeDoubleclickCampaignManagerAbsorbed` INTEGER NULL,
    `leadViews` INTEGER NULL,
    `appStoreFirstSessionHoursViews` INTEGER NULL,
    `notificationClicks` INTEGER NULL,
    `totalNewToBrandECPP` DOUBLE NULL,
    `audioAdProgression` INTEGER NULL,
    `application` INTEGER NULL,
    `threePFeeDoubleclickCampaignManager` INTEGER NULL,
    `alexaSkillEnableClicks` INTEGER NULL,
    `totalNewToBrandDPVClicks` INTEGER NULL,
    `eCPVideoAdCompletion` DOUBLE NULL,
    `brandSearches` INTEGER NULL,
    `totalDetailPageViewClicks` INTEGER NULL,
    `yearweekYear` INTEGER NULL,
    `yearWeekWeek` INTEGER NULL,

    INDEX `dsp_data_yearweek_index`(`yearWeekWeek`, `yearweekYear`),
    INDEX `dsp_data_date_index`(`date`),
    INDEX `dsp_data_advertiser_id`(`advertiserId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `dsp_data` ADD CONSTRAINT `dsp_data_brandsId_fkey` FOREIGN KEY (`brandsId`) REFERENCES `Brands`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
