# Troubleshooting Guide

## Vite/esbuild "spawn EPERM" Build Failure

### Root Cause
The build failure was caused by multiple CSS layer conflicts and incorrect Tailwind CSS configuration:

1. **Duplicate @layer base blocks**: The `client/src/index.css` file contained two separate `@layer base` blocks which caused PostCSS/Tailwind processing errors
2. **Conflicting Tailwind CSS plugins**: The `@tailwindcss/vite` plugin was conflicting with traditional PostCSS processing
3. **Incompatible Tailwind config format**: The `defineConfig` function usage was incompatible with the current Tailwind CSS version

### Fix Applied
**Date**: 2025-07-02  
**Issue**: Vite build failing with CSS layer conflicts and esbuild permissions

**Steps Taken**:

1. **Cleaned esbuild binaries and cache**:
   ```bash
   rm -f node_modules/.bin/esbuild*
   find . -name ".esbuild*" -exec rm -rf {} \;
   ```

2. **Fixed esbuild permissions**:
   ```bash
   chmod +x node_modules/esbuild/bin/esbuild
   ln -sf ../esbuild/bin/esbuild node_modules/.bin/esbuild
   ```

3. **Added memory optimization**:
   ```bash
   echo 'NODE_OPTIONS="--max_old_space_size=4096"' >> .env
   ```

4. **Fixed CSS layer conflicts**:
   - Consolidated duplicate `@layer base` blocks in `client/src/index.css`
   - Moved all base styles into a single `@layer base` block

5. **Updated Vite configuration**:
   - Removed `@tailwindcss/vite` plugin that was causing conflicts
   - Reverted to traditional PostCSS + Tailwind CSS processing

6. **Fixed Tailwind config**:
   - Changed from `defineConfig()` function to plain object export
   - Maintained all existing theme configurations and plugins

### Package Versions (Already Compatible)
- vite: "^5.4.19" ✓
- esbuild: "^0.25.5" ✓  

### Build Result
✅ **SUCCESS**: Build completed successfully
- Vite build: ✓ 3002 modules transformed
- esbuild server bundle: ✓ 577.5kb output
- No spawn EPERM errors

### Prevention
1. Avoid duplicate CSS layer declarations
2. Use either `@tailwindcss/vite` OR traditional PostCSS, not both
3. Keep Tailwind config format consistent with version
4. Regularly clean build artifacts: `rm -rf dist public/assets .vite node_modules/.cache`

### Related Files Modified
- `client/src/index.css` - Consolidated CSS layers
- `vite.config.js` - Removed conflicting Tailwind plugin  
- `tailwind.config.js` - Fixed config format
- `.env` - Added NODE_OPTIONS for memory optimization

