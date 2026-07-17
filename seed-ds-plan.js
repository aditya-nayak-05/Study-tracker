// Data Science Roadmap Plan Seed Script
// Run this in the browser console on localhost:5173 to inject the plan

(function() {
  const uid = () => 'id_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
  const now = new Date().toISOString();

  function makeTask(title, priority = 'medium') {
    return { id: uid(), title, status: 'not-started', priority, notes: '', createdAt: now };
  }

  function makeDay(name, tasks = [], date = '') {
    return { id: uid(), name, date, tasks: tasks.map(t => typeof t === 'string' ? makeTask(t) : makeTask(t.title, t.priority)) };
  }

  function makeWeek(name, days = []) {
    return { id: uid(), name, days };
  }

  function makeMonth(name, weeks = []) {
    return { id: uid(), name, weeks };
  }

  const plan = {
    id: uid(),
    name: 'Data Science Roadmap — 6-8 LPA',
    description: '3.5 Months | 4 hours/day | BCA + MCA background | Python/SQL → ML → Deployment → Interview Prep',
    category: 'data-science',
    color: '#6366f1',
    icon: 'BookOpen',
    startDate: now,
    targetEndDate: '',
    pinned: true,
    archived: false,
    notes: 'Data Science Roadmap for fresher targeting 6-8 LPA. Duration: 3.5 months. Daily commitment: 4 hours.',
    studyHours: [],
    activities: [{ id: uid(), type: 'create', message: 'Plan "Data Science Roadmap — 6-8 LPA" created', timestamp: now }],
    createdAt: now,
    updatedAt: now,
    months: [
      // ═══════════════════════════════════════════
      // MONTH 1 — Foundations
      // ═══════════════════════════════════════════
      makeMonth('Month 1 — Foundations (Python, SQL, Statistics)', [
        makeWeek('Week 1 — Python for Data Science', [
          makeDay('Python Core Revision', [
            'Data types, loops, functions, list/dict comprehensions (revision)',
            'File handling (CSV, JSON reading/writing)',
            'Exception handling',
          ]),
          makeDay('NumPy Fundamentals', [
            'NumPy arrays, indexing/slicing, broadcasting',
            'Vectorized operations',
            'Array reshaping',
            'Aggregate functions (sum, mean, std)',
          ]),
          makeDay('Practice Day', [
            'Practice: 15-20 small problems on array manipulation',
          ]),
        ]),

        makeWeek('Week 2 — Pandas (Deep Dive)', [
          makeDay('Pandas Basics', [
            'Series & DataFrame creation, indexing (loc/iloc)',
            'Reading/writing CSV, Excel, JSON',
          ]),
          makeDay('Data Cleaning', [
            'Handling missing values (dropna, fillna), duplicates',
            'Apply/lambda functions, vectorized string operations',
            'Date-time handling',
          ]),
          makeDay('Advanced Pandas', [
            'GroupBy, aggregation, pivot tables',
            'Merging, joining, concatenating DataFrames',
          ]),
          makeDay('Practice Day', [
            'Practice: Clean a messy real-world dataset (Kaggle) end-to-end',
          ]),
        ]),

        makeWeek('Week 3 — SQL (Intermediate to Advanced)', [
          makeDay('SQL Revision', [
            'Revision: SELECT, WHERE, GROUP BY, HAVING, ORDER BY',
            'Joins: INNER, LEFT, RIGHT, FULL, SELF JOIN',
          ]),
          makeDay('Advanced SQL', [
            'Subqueries (correlated & non-correlated)',
            'CTEs (WITH clause)',
            'Window functions: ROW_NUMBER, RANK, DENSE_RANK, LAG, LEAD, PARTITION BY',
          ]),
          makeDay('Complex Queries', [
            'Aggregate functions with complex conditions (CASE WHEN inside aggregates)',
            'Query optimization basics (indexes, EXPLAIN)',
          ]),
          makeDay('Practice Day', [
            'Practice: 20-30 problems daily on StrataScratch / LeetCode SQL / HackerRank',
          ]),
        ]),

        makeWeek('Week 4 — Statistics & Probability', [
          makeDay('Descriptive Statistics', [
            'Mean, median, mode, variance, standard deviation',
            'Correlation vs causation, covariance',
          ]),
          makeDay('Probability & Distributions', [
            'Probability basics: conditional probability, Bayes\' theorem',
            'Probability distributions: Normal, Binomial, Poisson',
            'Central Limit Theorem',
          ]),
          makeDay('Hypothesis Testing', [
            'Null/alternate hypothesis, p-value, significance level',
            't-test, chi-square test, ANOVA (conceptual + when to use)',
            'A/B testing fundamentals',
          ]),
          makeDay('Practice Day', [
            'Apply each concept in Python using scipy.stats',
          ]),
          makeDay('✅ Month 1 Checkpoint', [
            { title: 'Can clean any dataset in Pandas confidently', priority: 'high' },
            { title: 'Can write complex SQL queries (window functions, CTEs)', priority: 'high' },
            { title: 'Can explain basic statistical concepts out loud', priority: 'high' },
          ]),
        ]),
      ]),

      // ═══════════════════════════════════════════
      // MONTH 2 — Machine Learning + Project 1
      // ═══════════════════════════════════════════
      makeMonth('Month 2 — Machine Learning + Project 1', [
        makeWeek('Week 5 — Data Visualization + EDA', [
          makeDay('Matplotlib', [
            'Line plots, bar charts, histograms, scatter plots, subplots',
          ]),
          makeDay('Seaborn', [
            'Distribution plots, box plots, pair plots',
            'Heatmaps (correlation matrix)',
          ]),
          makeDay('Exploratory Data Analysis (EDA)', [
            'Univariate, bivariate, multivariate analysis',
            'Outlier detection (IQR method, z-score)',
            'Identifying data quality issues, skewness, kurtosis',
          ]),
          makeDay('Practice Day', [
            'Full EDA report on Kaggle dataset #1',
            'Full EDA report on Kaggle dataset #2',
          ]),
        ]),

        makeWeek('Week 6 — Feature Engineering + Preprocessing', [
          makeDay('Data Preprocessing', [
            'Handling missing data (imputation strategies)',
            'Encoding categorical variables: Label Encoding, One-Hot Encoding',
            'Feature scaling: StandardScaler, MinMaxScaler, Normalization',
          ]),
          makeDay('Advanced Feature Engineering', [
            'Handling outliers, feature transformation (log, box-cox)',
            'Feature selection basics (correlation-based, variance threshold)',
            'Handling imbalanced datasets (SMOTE, class weights)',
          ]),
        ]),

        makeWeek('Week 7 — Core ML Algorithms (Part 1)', [
          makeDay('ML Fundamentals', [
            'Train-test split, cross-validation (k-fold)',
          ]),
          makeDay('Regression Models', [
            'Linear Regression',
            'Polynomial Regression',
          ]),
          makeDay('Classification Models', [
            'Logistic Regression',
            'Decision Trees',
            'K-Nearest Neighbors (KNN)',
          ]),
          makeDay('Model Evaluation', [
            'Regression: MAE, MSE, RMSE, R²',
            'Classification: Accuracy, Precision, Recall, F1, Confusion Matrix, ROC-AUC',
          ]),
        ]),

        makeWeek('Week 8 — Ensemble Methods + Project 1', [
          makeDay('Ensemble Methods', [
            'Random Forest',
            'Gradient Boosting basics',
            'XGBoost, LightGBM (hands-on implementation)',
            'Hyperparameter tuning: GridSearchCV, RandomizedSearchCV',
          ]),
          makeDay('Project 1 — EDA & Feature Engineering', [
            { title: 'Pick a real dataset (loan default / house price / customer churn)', priority: 'high' },
            { title: 'Perform complete EDA', priority: 'high' },
            { title: 'Feature Engineering & preprocessing pipeline', priority: 'high' },
          ]),
          makeDay('Project 1 — Model Building', [
            { title: 'Build & compare multiple models', priority: 'high' },
            { title: 'Evaluate models with proper metrics', priority: 'high' },
            { title: 'Write conclusion & learnings', priority: 'high' },
          ]),
          makeDay('Project 1 — Documentation', [
            { title: 'Push to GitHub with clean README', priority: 'high' },
            { title: 'README: problem statement, approach, results, learnings', priority: 'high' },
          ]),
          makeDay('✅ Month 2 Checkpoint', [
            { title: 'One complete, well-documented ML project on GitHub', priority: 'high' },
            { title: 'Can explain project end-to-end in interview', priority: 'high' },
          ]),
        ]),
      ]),

      // ═══════════════════════════════════════════
      // MONTH 3 — Project 2 + Deployment
      // ═══════════════════════════════════════════
      makeMonth('Month 3 — Project 2 + Deployment + Specialization', [
        makeWeek('Week 9 — Second Project (Different Domain)', [
          makeDay('Unsupervised Learning (if clustering)', [
            'KMeans, Hierarchical Clustering, DBSCAN basics',
            'Elbow method, Silhouette score',
          ]),
          makeDay('Basic NLP (if text-based)', [
            'Text preprocessing: tokenization, stopwords, stemming/lemmatization',
            'Bag of Words, TF-IDF',
            'Basic sentiment classification using scikit-learn',
          ]),
          makeDay('Project 2 — Start', [
            { title: 'Choose problem type different from Project 1', priority: 'high' },
            { title: 'Options: Customer segmentation / Sentiment analysis / Time series', priority: 'medium' },
            { title: 'EDA & data understanding', priority: 'high' },
          ]),
        ]),

        makeWeek('Week 10 — Complete Project 2', [
          makeDay('Model Building', [
            { title: 'Build models for Project 2', priority: 'high' },
            { title: 'Model evaluation & comparison', priority: 'high' },
          ]),
          makeDay('Documentation', [
            { title: 'Add visualizations and business impact/insights', priority: 'high' },
            { title: 'GitHub documentation with clean README', priority: 'high' },
          ]),
        ]),

        makeWeek('Week 11 — Deployment Basics', [
          makeDay('API Development', [
            'Flask or FastAPI: build API around trained model',
          ]),
          makeDay('Interactive Demo', [
            'Streamlit: build an interactive demo app',
          ]),
          makeDay('Docker & Deploy', [
            'Basic Docker concepts: containers, writing a Dockerfile',
            'Deploy to: Streamlit Cloud / Render / Hugging Face Spaces',
          ]),
          makeDay('Update Projects', [
            { title: 'Update both projects with live demo links in README', priority: 'high' },
          ]),
        ]),

        makeWeek('Week 12 — Power BI / Tableau', [
          makeDay('BI Tool Basics', [
            'Power BI or Tableau basics: connecting data, building dashboards',
          ]),
          makeDay('Create Dashboard', [
            { title: 'Create 1 dashboard from one of your project datasets', priority: 'high' },
          ]),
          makeDay('✅ Month 3 Checkpoint', [
            { title: '2 solid projects with deployed demos', priority: 'high' },
            { title: 'One dashboard ready', priority: 'high' },
            { title: 'Resume-ready portfolio complete', priority: 'high' },
          ]),
        ]),
      ]),

      // ═══════════════════════════════════════════
      // MONTH 3.5 — Interview Prep + Applications
      // ═══════════════════════════════════════════
      makeMonth('Month 3.5 — Interview Prep + Applications', [
        makeWeek('Week 13 — Technical Interview Prep', [
          makeDay('DSA — Priority Topics', [
            'Arrays & Strings problems',
            'Hashmaps/Dictionaries problems',
            'Sorting & Searching problems',
          ]),
          makeDay('DSA — Medium Priority', [
            'Basic Recursion problems',
            'Two-pointer / Sliding window problems',
          ]),
          makeDay('DSA — Light Touch', [
            'Linked Lists (light touch only)',
            'Note: Skip Trees, Graphs, DP — rarely asked in DS/ML fresher interviews',
          ]),
          makeDay('LeetCode Practice', [
            { title: 'Target: 30-40 easy-medium problems total', priority: 'high' },
            'LeetCode (filter Easy + some Medium)',
            'GeeksforGeeks "Must Do" fresher lists',
          ]),
          makeDay('ML Theory Revision', [
            { title: 'Bias-variance tradeoff, overfitting/underfitting', priority: 'high' },
            { title: 'Regularization (L1/L2)', priority: 'high' },
            { title: 'Explain each project: problem → approach → challenges → results', priority: 'high' },
          ]),
          makeDay('SQL Revision', [
            'Daily 5-10 SQL problems to stay sharp',
          ]),
        ]),

        makeWeek('Week 14 — Resume, LinkedIn + Start Applying', [
          makeDay('Resume Building', [
            { title: 'Tailor resume: highlight projects with metrics', priority: 'high' },
            { title: 'Example: "Improved model accuracy from X% to Y%"', priority: 'medium' },
          ]),
          makeDay('LinkedIn Optimization', [
            { title: 'Optimize LinkedIn headline & skills section', priority: 'high' },
            { title: 'Write project posts on LinkedIn', priority: 'medium' },
          ]),
          makeDay('Start Applying', [
            { title: 'Apply on: Naukri, LinkedIn, Internshala, AngelList/Wellfound', priority: 'high' },
            { title: 'Apply to company career pages directly', priority: 'high' },
            { title: 'Target: Data Analyst, Junior Data Scientist, ML Engineer (Fresher)', priority: 'high' },
          ]),
          makeDay('⚡ Important Reminder', [
            { title: 'Don\'t wait until Week 14 — start applying from Month 3 onward!', priority: 'high' },
            { title: 'The interview process itself takes weeks', priority: 'medium' },
          ]),
        ]),
      ]),
    ],
  };

  // Read existing plans from localStorage
  const existingRaw = localStorage.getItem('studyflow_plans');
  let existing = [];
  try { existing = existingRaw ? JSON.parse(existingRaw) : []; } catch(e) { existing = []; }

  // Add new plan
  existing.push(plan);
  localStorage.setItem('studyflow_plans', JSON.stringify(existing));

  // Set as active plan
  const uiRaw = localStorage.getItem('studyflow_ui');
  let ui = {};
  try { ui = uiRaw ? JSON.parse(uiRaw) : {}; } catch(e) { ui = {}; }
  ui.activePlanId = plan.id;
  localStorage.setItem('studyflow_ui', JSON.stringify(ui));

  console.log('%c✅ Data Science Roadmap added successfully!', 'color: #34d399; font-size: 16px; font-weight: bold;');
  console.log('%c📊 Plan has 4 months, 14 weeks, and 80+ tasks', 'color: #818cf8; font-size: 12px;');
  console.log('%c🔄 Refreshing page...', 'color: #fbbf24; font-size: 12px;');

  setTimeout(() => window.location.reload(), 500);
})();
