# Container Cleanup & Artifact Management

This directory contains scripts for post-test cleanup and artifact management.

## Scripts

### `/opt/featherweight/post-run-cleanup.sh` (Recommended)
- **Purpose**: Complete cleanup and artifact management after test runs
- **Features**:
  - Prunes dangling Docker images older than 3 days
  - Moves logs, k6 summaries, and Cypress artifacts to timestamped directories
  - Creates organized directory structure
  - Generates run summary report
  - Better error handling and user feedback

### `/opt/featherweight/cleanup-and-archive.sh` (Basic)
- **Purpose**: Basic cleanup functionality
- **Features**: Same core functionality but simpler output

### `/opt/featherweight/add-to-pipeline.sh`
- **Purpose**: Shows integration instructions
- **Usage**: Run this script to see how to integrate cleanup into your pipelines

### `/opt/featherweight/example-test-with-cleanup.sh`
- **Purpose**: Example of how to integrate cleanup into existing test scripts

## Usage

### Manual Execution
```bash
# Run cleanup after your tests
/opt/featherweight/post-run-cleanup.sh
```

### Integration with Test Scripts
Add this line to the end of your test scripts:
```bash
# Container cleanup and artifact management
/opt/featherweight/post-run-cleanup.sh
```

## What Gets Archived

### Logs
- Application logs (*.log files)
- Excludes node_modules and existing archives

### K6 Results
- K6 test result files
- Summary files (JSON/HTML)
- Performance test reports

### Cypress Artifacts
- Videos from test runs
- Screenshots from failed tests
- Test reports and mochawesome reports

## Archive Structure

Archives are stored in `/opt/featherweight/artifacts/YYYY-MM-DD-HH:MM:SS/` with:
```
artifacts/
├── 2025-07-04-03:19:36/
│   ├── logs/           # Application logs
│   ├── k6-results/     # K6 test results
│   ├── cypress/        # Cypress artifacts
│   └── run-summary.txt # Summary of the run
```

## Container Cleanup

- Prunes dangling Docker images older than 3 days
- Uses `docker image prune -f --filter "until=72h"`
- Gracefully handles cases where Docker is not available

## Notes

- All scripts are executable and ready to use
- Scripts handle missing Docker gracefully
- Artifact directories are created automatically
- Files are moved (not copied) to save space
- Existing archives are never modified
