const uid = () => 'id_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
const now = new Date().toISOString();

function makeTask(title, priority = 'medium') {
  return { id: uid(), title, status: 'not-started', priority, notes: '', createdAt: now };
}

function makeDay(name, tasks = [], date = '') {
  return { id: uid(), name, date, tasks: tasks.map(t => typeof t === 'string' ? makeTask(t) : makeTask(t.title, t.priority)) };
}

// Assign sequential dates starting from today to all days across all months/weeks
function assignDates(months) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  let dayOffset = 0;

  months.forEach((month) => {
    (month.weeks || []).forEach((week) => {
      (week.days || []).forEach((day) => {
        const d = new Date(start);
        d.setDate(d.getDate() + dayOffset);
        // Skip weekends
        while (d.getDay() === 0 || d.getDay() === 6) {
          d.setDate(d.getDate() + 1);
          dayOffset++;
        }
        day.date = d.toISOString().split('T')[0];
        dayOffset++;
      });
    });
  });
  return months;
}

function makeWeek(name, days = []) {
  return { id: uid(), name, days };
}

function makeMonth(name, weeks = []) {
  return { id: uid(), name, weeks };
}

export const dsRoadmap = {
  id: 'ds-roadmap-plan-id',
  name: 'Data Science Roadmap — 6-8 LPA',
  description: '3.5 Months | Daily Commitment: 4 hours | Background: BCA + MCA (pursuing), basic Python/SQL',
  category: 'data-science',
  color: '#6366f1',
  icon: 'BookOpen',
  startDate: now,
  targetEndDate: '',
  pinned: true,
  archived: false,
  notes: 'Data Science Roadmap — 6-8 LPA Fresher Target. Keep both projects and all code on GitHub with clean commit history. Try to align at least one project with your MCA coursework/mini-project to save time. Track weekly progress against this document.',
  studyHours: [],
  activities: [{ id: uid(), type: 'create', message: 'Plan "Data Science Roadmap — 6-8 LPA" created', timestamp: now }],
  createdAt: now,
  updatedAt: now,
  months: [
    // MONTH 1
    makeMonth('MONTH 1 — Foundations (Python, SQL, Statistics)', [
      makeWeek('Week 1 — Python for Data Science', [
        makeDay('Day 1 — Python Core Revision', [
          'Data types, loops, functions, list/dict comprehensions (revision)',
          'Exception handling'
        ]),
        makeDay('Day 2 — File Handling', [
          'File handling (CSV, JSON reading/writing)'
        ]),
        makeDay('Day 3 — NumPy core', [
          'NumPy arrays, indexing/slicing, broadcasting'
        ]),
        makeDay('Day 4 — NumPy operations', [
          'Vectorized operations, array reshaping, aggregate functions (sum, mean, std)'
        ]),
        makeDay('Day 5 — Practice NumPy', [
          'Practice: 15-20 small problems on array manipulation'
        ])
      ]),
      makeWeek('Week 2 — Pandas (Deep Dive)', [
        makeDay('Day 1 — Pandas DataFrames', [
          'Series & DataFrame creation, indexing (loc/iloc)',
          'Reading/writing CSV, Excel, JSON'
        ]),
        makeDay('Day 2 — Data Cleaning', [
          'Handling missing values (dropna, fillna), duplicates'
        ]),
        makeDay('Day 3 — Pandas Aggregations', [
          'GroupBy, aggregation, pivot tables',
          'Merging, joining, concatenating DataFrames'
        ]),
        makeDay('Day 4 — Advanced Manipulation', [
          'Apply/lambda functions, vectorized string operations',
          'Date-time handling'
        ]),
        makeDay('Day 5 — Clean Dataset', [
          'Practice: Clean a messy real-world dataset (Kaggle) end-to-end'
        ])
      ]),
      makeWeek('Week 3 — SQL (Intermediate to Advanced)', [
        makeDay('Day 1 — SQL Basics Revision', [
          'SELECT, WHERE, GROUP BY, HAVING, ORDER BY',
          'Joins: INNER, LEFT, RIGHT, FULL, SELF JOIN'
        ]),
        makeDay('Day 2 — Subqueries & CTEs', [
          'Subqueries (correlated & non-correlated)',
          'CTEs (WITH clause)'
        ]),
        makeDay('Day 3 — Window Functions', [
          'Window functions: ROW_NUMBER, RANK, DENSE_RANK, LAG, LEAD, PARTITION BY'
        ]),
        makeDay('Day 4 — Optimization', [
          'Aggregate functions with complex conditions (CASE WHEN inside aggregates)',
          'Query optimization basics (indexes, EXPLAIN)'
        ]),
        makeDay('Day 5 — Practice SQL', [
          'Practice: 20-30 problems daily on StrataScratch / LeetCode SQL / HackerRank'
        ])
      ]),
      makeWeek('Week 4 — Statistics & Probability', [
        makeDay('Day 1 — Descriptive Stats', [
          'Mean, median, mode, variance, standard deviation',
          'Correlation vs causation, covariance'
        ]),
        makeDay('Day 2 — Probability & Distributions', [
          'Probability basics: conditional probability, Bayes\' theorem',
          'Probability distributions: Normal, Binomial, Poisson',
          'Central Limit Theorem'
        ]),
        makeDay('Day 3 — Hypothesis Testing', [
          'Null/alternate hypothesis, p-value, significance level',
          't-test, chi-square test, ANOVA (conceptual understanding + when to use)'
        ]),
        makeDay('Day 4 — A/B Testing & Python stats', [
          'A/B testing fundamentals',
          'Apply each concept in Python using scipy.stats'
        ]),
        makeDay('Day 5 — Month 1 Checkpoint', [
          'Verify: Comfortable cleaning any dataset in Pandas',
          'Verify: Can write complex SQL queries',
          'Verify: Explain basic statistical concepts out loud'
        ])
      ])
    ]),
    // MONTH 2
    makeMonth('MONTH 2 — Machine Learning + Project 1', [
      makeWeek('Week 5 — Data Visualization + EDA', [
        makeDay('Day 1 — Matplotlib & Seaborn', [
          'Matplotlib: line plots, bar charts, histograms, scatter plots, subplots',
          'Seaborn: distribution plots, box plots, pair plots, heatmaps'
        ]),
        makeDay('Day 2 — Exploratory Data Analysis (EDA)', [
          'Univariate, bivariate, multivariate analysis',
          'Outlier detection (IQR method, z-score)',
          'Identifying data quality issues, skewness, kurtosis'
        ]),
        makeDay('Day 3 — EDA Practice', [
          'Practice: Full EDA report on 2 different Kaggle datasets'
        ])
      ]),
      makeWeek('Week 6 — Feature Engineering + Preprocessing', [
        makeDay('Day 1 — Missing Data & Encoding', [
          'Handling missing data (imputation strategies)',
          'Encoding categorical variables: Label Encoding, One-Hot Encoding'
        ]),
        makeDay('Day 2 — Scaling & Outliers', [
          'Feature scaling: StandardScaler, MinMaxScaler, Normalization',
          'Handling outliers, feature transformation (log, box-cox)'
        ]),
        makeDay('Day 3 — Advanced Feature Prep', [
          'Feature selection basics (correlation-based, variance threshold)',
          'Handling imbalanced datasets (SMOTE, class weights)'
        ])
      ]),
      makeWeek('Week 7 — Core ML Algorithms (Part 1)', [
        makeDay('Day 1 — Train-Test & Regression', [
          'Train-test split, cross-validation (k-fold)',
          'Linear Regression, Polynomial Regression'
        ]),
        makeDay('Day 2 — Classification Algorithms', [
          'Logistic Regression',
          'Decision Trees',
          'K-Nearest Neighbors (KNN)'
        ]),
        makeDay('Day 3 — Model Evaluation Metrics', [
          'MAE, MSE, RMSE, R² (regression)',
          'Accuracy, Precision, Recall, F1, Confusion Matrix, ROC-AUC (classification)'
        ])
      ]),
      makeWeek('Week 8 — Ensemble Methods + Project 1', [
        makeDay('Day 1 — Random Forest & Boosting', [
          'Random Forest',
          'Gradient Boosting basics',
          'XGBoost, LightGBM (hands-on implementation)'
        ]),
        makeDay('Day 2 — Tuning', [
          'Hyperparameter tuning: GridSearchCV, RandomizedSearchCV'
        ]),
        makeDay('Day 3 — Project 1 Execution', [
          'Project 1: Choose real dataset (loan default/house price/churn)',
          'Steps: EDA → Feature Engineering → Model Building → Evaluation'
        ]),
        makeDay('Day 4 — Project 1 Documentation', [
          'Push project to GitHub with clean README',
          'README: Problem statement, approach, results, learnings'
        ])
      ])
    ]),
    // MONTH 3
    makeMonth('MONTH 3 — Second Project + Deployment', [
      makeWeek('Week 9 — Second Project (Different Domain)', [
        makeDay('Day 1 — Unsupervised Learning', [
          'KMeans, Hierarchical Clustering, DBSCAN basics',
          'Elbow method, Silhouette score'
        ]),
        makeDay('Day 2 — Basic NLP', [
          'Text preprocessing: tokenization, stopwords removal, stemming/lemmatization',
          'Bag of Words, TF-IDF',
          'Basic sentiment classification using scikit-learn'
        ]),
        makeDay('Day 3 — Project 2 Selection', [
          'Choose Project 2: Customer segmentation (clustering) or Sentiment analysis (NLP) or Time Series'
        ])
      ]),
      makeWeek('Week 10 — Complete Project 2 + Documentation', [
        makeDay('Day 1 — Project 2 Model & Viz', [
          'Finish model building, evaluation, and visualizations',
          'Document business impact and insights'
        ]),
        makeDay('Day 2 — GitHub Upload', [
          'Upload Project 2 to GitHub with detailed README'
        ])
      ]),
      makeWeek('Week 11 — Deployment Basics', [
        makeDay('Day 1 — API Building', [
          'Flask or FastAPI: building a simple API around your trained model'
        ]),
        makeDay('Day 2 — Streamlit & Docker', [
          'Streamlit: building an interactive demo app',
          'Basic Docker concepts: writing a simple Dockerfile'
        ]),
        makeDay('Day 3 — Live Deployment', [
          'Deploying to free platform: Streamlit Community Cloud / Render / Hugging Face Spaces',
          'Update GitHub README with live demo links'
        ])
      ]),
      makeWeek('Week 12 — Power BI / Tableau', [
        makeDay('Day 1 — BI Dashboard', [
          'BI Tool basics: connecting data, building dashboards',
          'Create 1 dashboard from one of your project datasets'
        ]),
        makeDay('Day 2 — Month 3 Checkpoint', [
          'Verify: 2 solid projects (with deployed demos) + 1 BI dashboard'
        ])
      ])
    ]),
    // MONTH 3.5
    makeMonth('MONTH 3.5 — Interview Prep + Applications', [
      makeWeek('Week 13 — Technical Interview Prep', [
        makeDay('Day 1 — DSA Arrays & Strings', [
          'Arrays & Strings easy-medium problems on LeetCode'
        ]),
        makeDay('Day 2 — DSA Hashmaps & Sorting', [
          'Hashmaps/Dictionaries, Sorting & Searching'
        ]),
        makeDay('Day 3 — DSA Recursion & Two-Pointer', [
          'Basic Recursion, Two-pointer / Sliding window'
        ]),
        makeDay('Day 4 — ML Theory Revision', [
          'Bias-variance tradeoff, overfitting/underfitting, regularization (L1/L2)',
          'Review project interview talks'
        ]),
        makeDay('Day 5 — SQL Practice', [
          'Solve 5-10 SQL problems on LeetCode/StrataScratch'
        ])
      ]),
      makeWeek('Week 14 — Resume, LinkedIn + Start Applying', [
        makeDay('Day 1 — Resume Building', [
          'Highlight projects with metrics (e.g. Improved model accuracy from X to Y)'
        ]),
        makeDay('Day 2 — LinkedIn Optimization', [
          'Optimize LinkedIn profile (headline, skills section, project posts)'
        ]),
        makeDay('Day 3 — Job Applications', [
          'Start applying on Naukri, LinkedIn, Internshala, AngelList, company sites',
          'Apply to Data Analyst, Junior Data Scientist, ML Engineer (Fresher)'
        ])
      ])
    ])
  ]
};

// Auto-assign weekday dates to all plan days starting from today
assignDates(dsRoadmap.months);
