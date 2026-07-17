# 🚀 Deploying StudyFlow to GitHub Pages

Since StudyFlow is a modern, frontend-only application using `localStorage` for data persistence, deploying it to GitHub Pages is completely free and takes just a few steps.

---

## 🛠️ Option 1: Automatic Deploy via NPM (Recommended)

This method automates the building and publishing process.

### Step 1: Install the `gh-pages` deploy tool
Open your terminal in the `a:\DS` project folder and run:
```bash
npm install dev gh-pages --save-dev
```

### Step 2: Add scripts to `package.json`
Open your `package.json` file and insert these two scripts under the `"scripts"` block:
```json
"predeploy": "npm run build",
"deploy": "gh-pages -d dist"
```

### Step 3: Initialize Git & Create GitHub Repository
If you haven't initialized Git yet:
```bash
# Initialize Git
git init

# Add all files to staging
git add .

# Create initial commit
git commit -m "Initialize StudyFlow Planner"
```

Go to [GitHub](https://github.com/new) and create a new **public** repository named `study-planner`. Then link it and push:
```bash
# Link your local repo to GitHub (replace with your username)
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/study-planner.git
git branch -M main
git push -u origin main
```

### Step 4: Run Deploy Script
Simply run the deploy script:
```bash
npm run deploy
```
*This will automatically build your site and push the output folder (`dist`) directly to a special `gh-pages` branch on GitHub.*

### Step 5: Enable GitHub Pages
1. Go to your repository on GitHub.
2. Navigate to **Settings** ⚙️ → **Pages** (in the left sidebar).
3. Under **Build and deployment** → **Source**, make sure it is set to **Deploy from a branch**.
4. Under **Branch**, select `gh-pages` and `/ (root)`, then click **Save**.
5. Your site will be live at `https://YOUR_GITHUB_USERNAME.github.io/study-planner/` within 1-2 minutes!

---

## ⚙️ Option 2: GitHub Actions (No local install needed)

You can also use GitHub Actions to deploy automatically every time you push code.

1. Create a directory named `.github/workflows` in your project root.
2. Inside that directory, create a file named `deploy.yml` with the following content:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main

permissions:
  contents: write

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout 🛎️
        uses: actions/checkout@v4

      - name: Install and Build 🔧
        run: |
          npm ci
          npm run build

      - name: Deploy 🚀
        uses: JamesIves/github-pages-deploy-action@v4
        with:
          folder: dist
          branch: gh-pages
```

3. Commit and push this file. GitHub will automatically run the build and deploy it!
