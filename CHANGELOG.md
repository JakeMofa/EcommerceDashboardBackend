# Changelog

## v1.2.0

### Added

- Implemented process for Bravo ads data
- Introduced process for Lokai data
- Added logger for debugging purposes
- Incorporated advertising data to sales API for week and month

### Changed

- Enhanced ads data performance
- Enhanced Amazon shipment data performance
- Enhanced manual import shipment
- Debugged shipment manual import
- Debugged report resolution
- Changed keys to read from environment and updated to newer one
- Updated migration for newer brand procedure
- Decreased the number of days on fetching reports from 14 to 7
- Reset the token on role change
- Made some sales data nullable
- Organic sale change percentage fix
- Fixed zero percentages on total revenue

### Removed

- Debug log has been removed to clean up the codebase
- Removed duplicates to optimize data handling

### Fixed

- Fixed the issue with new params not working as expected
- Debugged Prisma error on cron
- Fixed Category Report Cache Issue
