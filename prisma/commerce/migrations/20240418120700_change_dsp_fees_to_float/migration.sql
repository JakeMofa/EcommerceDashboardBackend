/*
  Warnings:

  - You are about to alter the column `threePFeeComScoreAbsorbed` on the `dsp_data` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.
  - You are about to alter the column `omnichannelMetricsFee` on the `dsp_data` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.
  - You are about to alter the column `threePPreBidFee` on the `dsp_data` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.
  - You are about to alter the column `threePFeeAutomotiveAbsorbed` on the `dsp_data` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.
  - You are about to alter the column `threePFeeCPM1Absorbed` on the `dsp_data` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.
  - You are about to alter the column `threePFeeComScore` on the `dsp_data` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.
  - You are about to alter the column `threePFeeDoubleVerifyAbsorbed` on the `dsp_data` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.
  - You are about to alter the column `threePFeeCPM2Absorbed` on the `dsp_data` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.
  - You are about to alter the column `threePPreBidFeeOracleDataCloud` on the `dsp_data` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.
  - You are about to alter the column `threePFeeCPM1` on the `dsp_data` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.
  - You are about to alter the column `threePFeeCPM2` on the `dsp_data` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.
  - You are about to alter the column `agencyFee` on the `dsp_data` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.
  - You are about to alter the column `threePFeeCPM3` on the `dsp_data` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.
  - You are about to alter the column `threePPreBidFeePixalate` on the `dsp_data` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.
  - You are about to alter the column `threePFeeIntegralAdScience` on the `dsp_data` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.
  - You are about to alter the column `threePFeeIntegralAdScienceAbsorbed` on the `dsp_data` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.
  - You are about to alter the column `threePFeeAutomotive` on the `dsp_data` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.
  - You are about to alter the column `threePPreBidFeeDoubleVerify` on the `dsp_data` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.
  - You are about to alter the column `threePPreBidFeeIntegralAdScience` on the `dsp_data` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.
  - You are about to alter the column `threePFeeDoubleVerify` on the `dsp_data` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.
  - You are about to alter the column `threePFeeCPM3Absorbed` on the `dsp_data` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.
  - You are about to alter the column `threePFeeDoubleclickCampaignManagerAbsorbed` on the `dsp_data` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.
  - You are about to alter the column `threePFeeDoubleclickCampaignManager` on the `dsp_data` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.

*/
-- AlterTable
ALTER TABLE `dsp_data` MODIFY `threePFeeComScoreAbsorbed` DOUBLE NULL,
    MODIFY `omnichannelMetricsFee` DOUBLE NULL,
    MODIFY `threePPreBidFee` DOUBLE NULL,
    MODIFY `threePFeeAutomotiveAbsorbed` DOUBLE NULL,
    MODIFY `threePFeeCPM1Absorbed` DOUBLE NULL,
    MODIFY `threePFeeComScore` DOUBLE NULL,
    MODIFY `threePFeeDoubleVerifyAbsorbed` DOUBLE NULL,
    MODIFY `threePFeeCPM2Absorbed` DOUBLE NULL,
    MODIFY `threePPreBidFeeOracleDataCloud` DOUBLE NULL,
    MODIFY `threePFeeCPM1` DOUBLE NULL,
    MODIFY `threePFeeCPM2` DOUBLE NULL,
    MODIFY `agencyFee` DOUBLE NULL,
    MODIFY `threePFeeCPM3` DOUBLE NULL,
    MODIFY `threePPreBidFeePixalate` DOUBLE NULL,
    MODIFY `threePFeeIntegralAdScience` DOUBLE NULL,
    MODIFY `threePFeeIntegralAdScienceAbsorbed` DOUBLE NULL,
    MODIFY `threePFeeAutomotive` DOUBLE NULL,
    MODIFY `threePPreBidFeeDoubleVerify` DOUBLE NULL,
    MODIFY `threePPreBidFeeIntegralAdScience` DOUBLE NULL,
    MODIFY `threePFeeDoubleVerify` DOUBLE NULL,
    MODIFY `threePFeeCPM3Absorbed` DOUBLE NULL,
    MODIFY `threePFeeDoubleclickCampaignManagerAbsorbed` DOUBLE NULL,
    MODIFY `threePFeeDoubleclickCampaignManager` DOUBLE NULL;
