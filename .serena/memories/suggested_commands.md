# NurtureAI — Suggested Commands

## Development
```bash
# Start dev server
npm start
# OR
npx expo start

# Platform-specific
npm run android
npm run ios
npm run web
```

## Type Checking
```bash
npm run typecheck
# OR
npx tsc --noEmit
```

## Install Dependencies (use expo for version compatibility)
```bash
# Add new Expo-compatible package
npx expo install <package-name>

# Add non-Expo package
npm install <package-name> --legacy-peer-deps
```

## System Utilities (Windows / Git Bash)
```bash
ls          # List directory
cat         # View file
grep -r     # Search files
find . -name "*.ts"  # Find files
cp -r       # Copy recursively
rm -rf      # Remove recursively
mkdir -p    # Create nested dirs
```

## Git
```bash
git init
git add .
git commit -m "message"
git status
git log -n 5
```

## Project Architecture Commands
```bash
# Generate Supabase types (when project is set up)
npx supabase gen types typescript --project-id <id> > src/types/database.ts
```
