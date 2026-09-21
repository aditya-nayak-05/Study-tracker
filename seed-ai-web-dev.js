// ai web dev (main) Seed Script
// Run this script in your browser console on http://localhost:5173 to inject the plan into localStorage!

(function() {
  const uid = () => 'ai_wd_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
  const now = new Date().toISOString();

  function makeTask(title, extraProps = {}) {
    return {
      id: uid(),
      title,
      status: 'not-started',
      priority: extraProps.priority || 'medium',
      notes: extraProps.notes || '',
      createdAt: now,
      ...extraProps
    };
  }

  function makeDay(dayNum, title, tasksList = [], extra = {}) {
    const allTasks = [];
    if (dayNum === 1) {
      allTasks.push(makeTask('ai web dev (main) — Kickstart 336-day AI Web Development journey', { priority: 'high', type: 'milestone' }));
    }
    (tasksList || []).forEach((t, idx) => {
      allTasks.push(makeTask(typeof t === 'string' ? t : t.title, {
        type: idx === 0 ? 'learning' : (idx === tasksList.length - 1 ? 'practice' : 'hands-on'),
        priority: idx === 0 ? 'high' : 'medium'
      }));
    });

    return {
      id: uid(),
      dayNumber: dayNum,
      name: 'Day ' + dayNum + ' — ' + title,
      mainTopic: title,
      status: 'not-started',
      date: '',
      tasks: allTasks,
      ...extra
    };
  }

  function makeWeek(weekNum, name, days = []) {
    return {
      id: uid(),
      weekNumber: weekNum,
      name: 'Week ' + weekNum + ' — ' + name,
      days
    };
  }

  function makeMonth(monthNum, phaseName, name, weeks = []) {
    return {
      id: uid(),
      monthNumber: monthNum,
      phase: phaseName,
      name: 'MONTH ' + monthNum + ' — ' + name,
      weeks
    };
  }

  function assignDates(months) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    let dayOffset = 0;

    months.forEach((month) => {
      (month.weeks || []).forEach((week) => {
        (week.days || []).forEach((day) => {
          const d = new Date(start);
          d.setDate(d.getDate() + dayOffset);
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

  const rawMonths = [
    makeMonth(1, "Phase 1 — JavaScript & Developer Foundations", "JavaScript & Developer Foundations", [
      makeWeek(1, "JavaScript Core", [
        makeDay(1, "Variables & Data Types", ["Understand var, let, and const declarations & temporal dead zone","Primitive types: number, string, boolean, null, undefined, symbol, bigint","Reference types: objects, arrays, functions & memory storage","Practice typeof checks and edge cases (typeof null, NaN)"]),
        makeDay(2, "Operators & Type Conversion", ["Arithmetic, comparison, logical, and bitwise operators","Implicit type coercion vs explicit type conversion (Number, String, Boolean)","Truthy and falsy values in JavaScript","Solve 10 type coercion puzzles and equality comparison exercises (== vs ===)"]),
        makeDay(3, "Conditions", ["if, else if, else branching logic","Ternary operator for concise conditional expressions","switch statements and break/default fall-through rules","Practice writing clean guard clauses to replace nested conditions"]),
        makeDay(4, "Loops", ["for, while, and do-while loops","for...of for iterable collections (Arrays, Strings, Sets)","for...in for object properties and prototype chain considerations","break, continue, and loop performance benchmarking"]),
        makeDay(5, "Functions", ["Function declarations vs function expressions","Arrow functions and lexical this differences","Default parameters, rest parameters (...args), and return values","Pure functions, side effects, and first-class functions in JS"]),
        makeDay(6, "Arrays", ["Array creation, indexing, length, push, pop, shift, unshift, splice, slice","Iteration methods: forEach, map, filter, reduce, find, some, every","Array sorting and comparator functions","Solve 10 algorithmic array transformation exercises"]),
        makeDay(7, "Objects & Review", ["Object literals, property access (bracket vs dot notation)","Object methods: Object.keys, Object.values, Object.entries, Object.assign","Prototype chain basics and Object.create","Weekly Review: Build a mini in-memory Student Grade Tracker CLI"])
      ]),
      makeWeek(2, "Advanced JavaScript", [
        makeDay(8, "Scope & Hoisting", ["Global, module, function, and block scopes","Variable & function hoisting mechanics in execution context","Temporal Dead Zone (TDZ) for let and const","Debug 5 tricky scoping and hoisting code snippets"]),
        makeDay(9, "Closures", ["Lexical environment and closure formation mechanics","Data privacy & encapsulation using closure functions","Common closure traps (loops with var vs let)","Implement custom memoization and counter functions using closures"]),
        makeDay(10, "this & Binding", ["Default binding, implicit binding, and explicit binding","call, apply, and bind methods in practice","new binding and constructor functions","Arrow functions and lexical this retention rules"]),
        makeDay(11, "Destructuring & Spread", ["Array destructuring with default values and skipping items","Object destructuring with nested patterns and alias renaming","Spread operator (...) for shallow cloning and merging","Rest parameters for variable function arguments"]),
        makeDay(12, "Modules", ["ES Modules (import / export, named vs default exports)","CommonJS (require / module.exports) differences","Dynamic imports using import() for code-splitting","Set up a modular multi-file JavaScript project"]),
        makeDay(13, "Error Handling", ["try, catch, finally blocks execution rules","Throwing standard Error and creating custom Error subclasses","Global error handlers (window.onerror, unhandledrejection)","Implement safe error boundary utility for async operations"]),
        makeDay(14, "Review & Practice", ["Comprehensive review of scope, closures, this, and modules","Solve 15 advanced JavaScript interview questions","Refactor procedural code into clean modular ES6+ architecture","Build an event-emitter pattern from scratch"])
      ]),
      makeWeek(3, "Browser & Web APIs", [
        makeDay(15, "DOM", ["DOM tree structure and node types","Selecting elements: querySelector, querySelectorAll, getElementById","Manipulating DOM: textContent, innerHTML, createElement, appendChild, remove","Attributes, classes, and dataset manipulation"]),
        makeDay(16, "Events", ["addEventListener and event lifecycle (capturing, target, bubbling)","Event object properties: e.target, e.currentTarget, e.preventDefault()","Event delegation pattern for efficient child handling","Custom events using Event and CustomEvent constructors"]),
        makeDay(17, "Forms", ["Form input elements and reading values (input, select, textarea, checkbox)","Form submit event handling and validation states","FormData API for assembling form payloads","Build interactive client-side form validation with real-time feedback"]),
        makeDay(18, "Fetch API", ["Fetch API basics, Request and Response objects","HTTP GET, POST, PUT, DELETE requests using fetch","Setting headers, CORS mode, and handling JSON parsing","Handling HTTP errors (checking res.ok before parsing res.json())"]),
        makeDay(19, "Async/Await", ["Promises review: resolve, reject, then, catch, finally","async functions and await operator mechanics","Error handling with try/catch in async functions","Concurrent async operations with Promise.all and Promise.allSettled"]),
        makeDay(20, "LocalStorage & SessionStorage", ["Web Storage API: localStorage vs sessionStorage vs Cookies","JSON serialization (JSON.stringify, JSON.parse)","Storage quotas, security considerations, and storage events","Build a persistent theme and preference switcher"]),
        makeDay(21, "Browser Project", ["Architect Vanilla JS Weather & Task Dashboard project","Integrate public weather API via Fetch API","Persist user tasks and layout settings in localStorage","Deploy project to GitHub Pages or Netlify"])
      ]),
      makeWeek(4, "Git & JavaScript Project", [
        makeDay(22, "Git Basics", ["Version control concepts & setting up git config","git init, status, add, commit, and log","Understanding working directory, staging area, and commit history","Write meaningful commit messages following conventional commits"]),
        makeDay(23, "GitHub", ["Creating remote repositories on GitHub and linking origin","git push, pull, clone, and remote management","Creating comprehensive README.md with markdown badges and documentation","Configuring .gitignore for sensitive files and dependencies"]),
        makeDay(24, "Branching & Merging", ["git branch, checkout, and switch commands","Fast-forward merge vs recursive 3-way merge","Simulating and resolving merge conflicts cleanly","GitHub Pull Requests, code reviews, and branch protection rules"]),
        makeDay(25, "Debugging", ["Chrome DevTools debugging: Breakpoints, Call Stack, Scope, Watch","Console API mastery: console.table, console.time, console.group","Network tab inspection: Headers, Payloads, Timing, Throttling","Debug and fix 5 deliberate bugs in a sample web application"]),
        makeDay(26, "JavaScript Project", ["Project Planning: AI-powered Prompt Manager & Code Snippet Vault","Wireframing UI and defining component architecture","Setting up HTML5 semantic layout and modern responsive CSS/Flexbox/Grid","Initialize Git repository and make initial architectural commits"]),
        makeDay(27, "Project Development", ["Implement CRUD operations for snippets and prompts","Add real-time category filtering, search, and tag management","Integrate copy-to-clipboard API and toast notification feedback","Add local persistence and export/import JSON functionality"]),
        makeDay(28, "Project Completion & Review", ["Audit code quality, accessibility (ARIA), and mobile responsiveness","Push final code to GitHub with detailed README and live demo link","Deploy to production on Vercel / Netlify","Phase 1 Assessment: Complete JavaScript & Developer Foundations quiz"])
      ])
    ]),
    makeMonth(2, "Phase 2 — TypeScript & Advanced React", "TypeScript & Advanced React", [
      makeWeek(5, "TypeScript Fundamentals", [
        makeDay(29, "TypeScript Basics", ["Installing TypeScript and ts-node","Understanding tsconfig.json essential compiler options","Type inference vs explicit type annotations","Compile TypeScript to JavaScript and inspect output"]),
        makeDay(30, "Types", ["Primitive types: string, number, boolean, null, undefined, symbol","Special types: any, unknown, never, void","Type assertions (as) vs non-null assertion (!)","Practice strict type checking on mixed inputs"]),
        makeDay(31, "Functions", ["Typing function parameters and return values","Optional and default parameters in TypeScript","Function type expressions and callable signatures","Function overloading patterns in TypeScript"]),
        makeDay(32, "Objects & Interfaces", ["Object type annotations and optional (?) / readonly modifiers","Interface declarations and extending interfaces (extends)","Interface vs Type aliases: differences and trade-offs","Declaration merging in interfaces"]),
        makeDay(33, "Arrays & Tuples", ["Array type syntax: type[] vs Array<type>","ReadonlyArray and immutable arrays","Tuples: fixed-length arrays with typed positions","Labeled tuple elements and rest elements in tuples"]),
        makeDay(34, "Enums & Unions", ["Numeric enums vs string enums vs const enums","Union types (|) and Discriminated Unions with tag properties","Intersection types (&) for composing models","Pattern matching with discriminated union switch cases"]),
        makeDay(35, "TypeScript Review", ["Review all fundamental TypeScript concepts and idioms","Convert a 100-line vanilla JS script to strict TypeScript","Resolve 10 tricky compiler errors and type mismatches","Build a typed in-memory key-value store module"])
      ]),
      makeWeek(6, "Advanced TypeScript", [
        makeDay(36, "Generics", ["Generic function syntax <T> and type parameter constraints (extends)","Generic interfaces, type aliases, and generic classes","Default type arguments in generics","Build generic utility functions: filterArray, cloneObject, paginate"]),
        makeDay(37, "Utility Types", ["Partial<T>, Required<T>, and Readonly<T>","Pick<T, K> and Omit<T, K> for object shaping","Record<K, T> for dictionary typing","ReturnType<T>, Parameters<T>, and Extract/Exclude"]),
        makeDay(38, "Type Narrowing", ["typeof and instanceof type narrowing","in operator narrowing for object properties","Equality narrowing and truthiness narrowing","Exhaustiveness checking using the never type"]),
        makeDay(39, "Type Guards", ["User-defined type guards with type predicates (value is Type)","Assertion functions (asserts condition / asserts value is Type)","Discriminated union narrowing with custom guards","Build type-safe JSON API response validator using guards"]),
        makeDay(40, "Classes", ["Class constructors, properties, and methods in TypeScript","Access modifiers: public, private, protected, and readonly","Parameter properties shorthand in constructors","Abstract classes and implementing interfaces"]),
        makeDay(41, "Modules", ["ES module syntax in TypeScript (import type vs import)","Ambient declarations and declare keyword","Working with third-party types (@types/* packages)","Creating custom .d.ts type definition files"]),
        makeDay(42, "TypeScript Project", ["Architect a Typed HTTP & Cache Library with Generics","Implement in-memory LRU Cache with generic keys and values","Add typed fetch wrapper returning ApiResponse<T>","Publish and test library with sample TypeScript consumer app"])
      ]),
      makeWeek(7, "React Architecture", [
        makeDay(43, "React + TypeScript", ["Setting up React 18+ with Vite and TypeScript template","Typing React functional components (React.FC vs return JSX.Element)","Typing React children, ReactNode, and ReactElement","Configuring path aliases and ESLint with TypeScript"]),
        makeDay(44, "Components & Props", ["Designing clean reusable component interfaces","Typing optional props, event handlers, and callbacks","Component composition and compound component pattern","Default props handling and prop forwarding with rest"]),
        makeDay(45, "State", ["useState with TypeScript type inference and explicit generics","State updater function pattern for concurrent safety","Managing complex nested state immutably","Derived state vs stored state best practices"]),
        makeDay(46, "Hooks", ["useEffect lifecycle, dependencies, and cleanup functions","useRef for mutable references and DOM node access","useReducer for complex state transitions","Rules of Hooks and ESLint hooks plugin"]),
        makeDay(47, "Context API", ["createContext with TypeScript and type-safe custom provider","Custom hook consumer wrapper (useAuth, useTheme)","Splitting context to prevent unnecessary re-renders","Combining Context API with useReducer for lightweight global state"]),
        makeDay(48, "Forms", ["Controlled vs uncontrolled form inputs in React","Handling form state and validation without third-party bloat","Integrating React Hook Form with Zod schema validation","Handling async form submission and loading / error UI states"]),
        makeDay(49, "React Project", ["Build a feature-packed Task & Habit Tracker app in React + TS","Implement multi-category organization, filters, and priority tags","Add persistent storage with custom hooks and Context API","Polish responsive modern UI with Tailwind CSS or custom styles"])
      ]),
      makeWeek(8, "Advanced React", [
        makeDay(50, "Performance", ["React rendering lifecycle, reconciliation, and Virtual DOM diffing","Diagnosing unnecessary re-renders with React DevTools Profiler","Code splitting with React.lazy and Suspense boundaries","Bundle analysis and tree-shaking optimizations"]),
        makeDay(51, "Memoization", ["React.memo for component memoization and custom comparison functions","useMemo for heavy computational caching","useCallback for referential equality of callbacks","Common memoization anti-patterns and performance trade-offs"]),
        makeDay(52, "Custom Hooks", ["Designing robust custom hooks (useLocalStorage, useDebounce, useFetch)","Encapsulating reusable business logic and side effects","Returning tuples vs objects from custom hooks","Testing custom hooks in isolation"]),
        makeDay(53, "State Management", ["State management paradigms: Local vs Global vs Server cache","Zustand setup: stores, actions, and selectors for fine-grained updates","Zustand middleware: devtools, persist in localStorage","Migrating Context API state to Zustand for performance"]),
        makeDay(54, "Error Boundaries", ["React Error Boundary concept and componentDidCatch","Implementing class-based Error Boundary with fallback UI","Integrating react-error-boundary library","Handling async errors and resetting error boundary state"]),
        makeDay(55, "React Testing", ["Testing setup with Vitest and React Testing Library (RTL)","Writing component unit tests (rendering, props, text assertions)","Simulating user interactions using @testing-library/user-event","Mocking API requests and testing async state transitions"]),
        makeDay(56, "Review & Project", ["Month 2 Project Review: Full-Featured Kanban Board app in React + TS","Add drag-and-drop task reordering, search, and filtering","Cover core components with Vitest tests","Deploy to production on Vercel and write case study README"])
      ])
    ]),
    makeMonth(3, "Phase 3 — Web Engineering & Next.js", "Web Engineering & Next.js", [
      makeWeek(9, "HTTP & Networking", [
        makeDay(57, "HTTP", ["HTTP protocol structure: Request methods, URI, headers, status codes","HTTP versions overview: HTTP/1.1 vs HTTP/2 multiplexing vs HTTP/3 (QUIC)","Inspect HTTP network payloads and request waterfall in Chrome DevTools","Understand safe vs idempotent HTTP methods"]),
        makeDay(58, "HTTPS", ["SSL/TLS encryption: Symmetric vs Asymmetric cryptography","TLS Handshake sequence (Client Hello, Server Hello, Key Exchange)","Digital certificates, Public Key Infrastructure (PKI), and Certificate Authorities","Security benefits: Confidentiality, Integrity, and Authentication"]),
        makeDay(59, "REST", ["REST architectural constraints and resource-based URL naming","Standard HTTP status codes (200, 201, 204, 400, 401, 403, 404, 500)","Idempotency in REST APIs (GET, PUT, DELETE vs POST)","API versioning strategies (/api/v1/) and payload design"]),
        makeDay(60, "APIs", ["REST vs GraphQL vs RPC / gRPC architectural comparison","Designing clean JSON API contracts with pagination and error formats","Public API exploration using Postman / Thunder Client / curl","Rate limits, API keys, and Authorization headers (Bearer tokens)"]),
        makeDay(61, "Cookies", ["HTTP Cookie header, Set-Cookie response header attributes","Security flags: HttpOnly (XSS protection), Secure (HTTPS only), SameSite (Strict/Lax/None)","Session cookies vs persistent cookies with Max-Age / Expires","Session management with cookies vs Authorization header tokens"]),
        makeDay(62, "CORS", ["Same-Origin Policy (SOP) fundamentals in browsers","Cross-Origin Resource Sharing (CORS) headers: Access-Control-Allow-Origin","CORS Preflight requests (OPTIONS method) and cached preflights","Diagnosing and resolving common CORS errors in frontend & backend"]),
        makeDay(63, "Networking Review", ["Comprehensive review: Explain what happens from typing a URL to page render","Review DNS lookup, TCP 3-way handshake, TLS, HTTP request, and DOM rendering","Write a technical summary diagram and blog outline","Network debugging quiz & practical challenges"])
      ]),
      makeWeek(10, "Next.js Fundamentals", [
        makeDay(64, "Next.js Setup", ["Creating a Next.js 14+ project with create-next-app and TypeScript","Understanding Next.js folder structure and next.config.js options","Environment variables in Next.js (.env.local, NEXT_PUBLIC_ prefix)","Styling setup with Tailwind CSS and CSS Modules"]),
        makeDay(65, "App Router", ["App Router directory conventions vs legacy Pages Router","Special file conventions: page.tsx, layout.tsx, loading.tsx, error.tsx","Route groups ((folder)) and organizing complex app sections","Parallel routes (@slot) and Intercepting routes ((.)) basics"]),
        makeDay(66, "Routing", ["File-based nested routing hierarchies","Dynamic route segments ([id], [slug]) and catch-all routes ([...slug])","Client navigation with next/link and useRouter hook","Reading query params with useSearchParams and path params with useParams"]),
        makeDay(67, "Layouts", ["Root layout (app/layout.tsx) with fonts and metadata","Nested layouts for dashboards and sub-routes","template.tsx vs layout.tsx re-rendering behavior","Building persistent sidebar navigation with active route highlighting"]),
        makeDay(68, "Server Components", ["React Server Components (RSC) philosophy and advantages","Direct database and backend access inside server components","Zero client JavaScript bundle size for server components","Passing data from Server Components to Client Components via props"]),
        makeDay(69, "Client Components", ["\"use client\" directive: when and where to place it","Interactivity, state, hooks, and browser APIs inside client components","Optimizing client component boundaries to minimize client bundle","Composing Server and Client components cleanly"]),
        makeDay(70, "Next.js Project", ["Build a Next.js Developer Portfolio & Blog with App Router","Create dynamic blog posts using markdown / local data","Implement responsive layouts with persistent navigation and active states","Deploy to Vercel and verify Fast Refresh & builds"])
      ]),
      makeWeek(11, "Advanced Next.js", [
        makeDay(71, "Data Fetching", ["Server-side data fetching with async/await in Server Components","fetch caching options: force-cache (SSG) vs no-store (SSR)","Incremental Static Regeneration (ISR) with revalidate option","Request memoization across the component tree"]),
        makeDay(72, "Server Actions", ["\"use server\" directive: invoking server functions directly from forms/buttons","Form mutations with useFormStatus and useFormState / useActionState","Optimistic UI updates using useOptimistic hook","Revalidating cache paths with revalidatePath and revalidateTag"]),
        makeDay(73, "API Routes", ["Creating Route Handlers in route.ts files (GET, POST, PUT, DELETE)","NextRequest and NextResponse helpers","Handling query parameters, headers, and request body JSON","Building REST endpoints and webhook receivers in Next.js"]),
        makeDay(74, "Middleware", ["middleware.ts placement, matcher config, and execution lifecycle","Request inspection, header modification, and geolocation","URL redirects (NextResponse.redirect) and rewrites (NextResponse.rewrite)","Protecting dashboard routes and handling auth redirects"]),
        makeDay(75, "Authentication", ["NextAuth.js / Auth.js v5 setup with App Router","Configuring credentials and OAuth providers (GitHub/Google)","Accessing session in Server Components (auth()) and Client Components (useSession())","Protecting routes via middleware and server-side redirects"]),
        makeDay(76, "SEO", ["Static and dynamic Metadata API (generateMetadata function)","Open Graph, Twitter cards, and favicon configuration","Generating dynamic sitemap.xml and robots.txt files","Canonical URLs, structured data (JSON-LD), and search ranking"]),
        makeDay(77, "Optimization", ["next/image: responsive sizing, WebP conversion, and lazy loading","next/font: automatic font self-hosting and zero layout shift","next/script: loading third-party scripts efficiently","Lighthouse audit: achieving 95+ score in Performance and SEO"])
      ]),
      makeWeek(12, "Production SaaS Project", [
        makeDay(78, "Project Planning", ["Plan \"Study & Notes SaaS Platform\" with Next.js 14 App Router","Define technical requirements, feature roadmap, and data entities","Design responsive UI/UX mockups for landing, auth, and dashboard","Initialize project repository with ESLint, Prettier, and Tailwind CSS"]),
        makeDay(79, "Architecture", ["Set up database schema models (Users, Workspaces, Notes, Tags)","Establish modular folder architecture (components, lib, actions, types)","Configure Auth.js authentication and protected route middleware","Set up server action error handling and validation wrappers"]),
        makeDay(80, "UI Development", ["Build polished dashboard shell with collapsable sidebar and navbar","Build rich markdown editor with live preview and formatting toolbar","Implement light / dark theme toggle with persistence","Build responsive mobile drawer navigation"]),
        makeDay(81, "API Integration", ["Implement Server Actions for note creation, editing, tagging, and archiving","Add full-text search with debounced filtering and category filters","Implement optimistic note updates for instant UI responsiveness","Build export note to Markdown / PDF functionality"]),
        makeDay(82, "Authentication", ["Complete user signup, login, session persistence, and logout flow","Add password hashing and email format validation with Zod","Implement protected workspace routes with role-based access checks","Add user profile management and avatar settings"]),
        makeDay(83, "Testing", ["Write unit tests for utility functions and Server Action validators","Test authentication flows and protected route middleware","Perform responsive design testing across mobile, tablet, and desktop","Run Lighthouse performance audits and optimize Core Web Vitals"]),
        makeDay(84, "Deployment", ["Deploy production SaaS application to Vercel with production environment variables","Set up custom domain and verify SSL certificate","Write detailed README.md documentation with screenshots and live demo","Phase 3 Milestone Review: Demo full SaaS application"])
      ])
    ]),
    makeMonth(4, "Phase 4 — Backend Development", "Backend Development", [
      makeWeek(13, "Node.js", [
        makeDay(85, "Node.js Basics", ["Node.js runtime architecture, V8 engine, and libuv thread pool","Node.js event loop phases: timers, I/O callbacks, poll, check, close","Global objects (global, process, __dirname, __filename)","Running Node scripts and CLI arguments processing"]),
        makeDay(86, "Modules", ["CommonJS (require / module.exports) vs ES Modules (import / export) in Node","Built-in modules overview: path, os, url, util","Package.json configuration: type: module, main, exports, scripts","Writing and organizing modular utility libraries"]),
        makeDay(87, "File System", ["fs and fs/promises module for file operations","Reading, writing, appending, and deleting files asynchronously","Working with directories: readdir, mkdir, stat, watch","Build a CLI tool that analyzes directory file sizes and types"]),
        makeDay(88, "Events", ["EventEmitter class and event-driven programming paradigm","Emitting events (emit) and subscribing (on, once, off)","Passing data with events and handling error events safely","Build a custom job event emitter and logger system"]),
        makeDay(89, "Streams", ["Stream types: Readable, Writable, Duplex, and Transform","Streaming large files vs reading entire files into memory","Piping streams using pipeline() and handling backpressure","Build a streaming file compressor CLI using zlib and streams"]),
        makeDay(90, "Environment Variables", ["Understanding process.env and environment configurations","Managing local secrets with dotenv package and .env.example files","Environment-specific configurations (development, staging, production)","Validating environment variables with Zod at startup"]),
        makeDay(91, "Node Project", ["Build a Node.js CLI File Organizer & Backup Automation Tool","Scan folders, categorize files by extension, and organize into subdirectories","Compress archived folders and log operations with timestamps","Publish as an executable CLI script using npm link"])
      ]),
      makeWeek(14, "Express.js", [
        makeDay(92, "Express Basics", ["Setting up an Express application from scratch","Express app instance, listen method, and port binding","Handling basic GET, POST, PUT, DELETE endpoints","Sending JSON responses, text, status codes, and headers"]),
        makeDay(93, "Routing", ["Express Router module (express.Router()) for modular route grouping","Route parameters (req.params) and query strings (req.query)","Route chaining (router.route()) and clean API endpoints organization","Organizing routes into clean controllers and route files"]),
        makeDay(94, "Middleware", ["Middleware function signature (req, res, next) and execution chain","Built-in middleware: express.json(), express.urlencoded(), express.static()","Third-party middleware: morgan logging, cors, helmet security","Writing custom request logging and execution timing middleware"]),
        makeDay(95, "Controllers", ["Separation of concerns: MVC (Model-View-Controller) architecture","Refactoring inline route handlers into standalone controller functions","Async controller patterns and handling async errors without unhandled rejections","Creating reusable response formatting helpers (apiResponse.success, apiResponse.error)"]),
        makeDay(96, "Error Handling", ["Global error handling middleware (err, req, res, next)","Creating custom AppError class with HTTP status codes and operational flags","Handling 404 Not Found routes cleanly","Centralized error logging and safe production error messages"]),
        makeDay(97, "Validation", ["Input validation importance for API security and integrity","Request validation using Zod or express-validator middleware","Validating req.body, req.query, and req.params schema","Returning structured, friendly 422/400 validation error payloads"]),
        makeDay(98, "Express Project", ["Build a Modular REST API Server in Express.js with TypeScript","Implement Books/Articles resource with full CRUD operations","Add input validation, request logging, and global error handling","Test all endpoints thoroughly using Postman collection"])
      ]),
      makeWeek(15, "REST API Development", [
        makeDay(99, "REST Architecture", ["REST constraints review: Statelessness, Client-Server, Cacheable, Uniform Interface","Resource URI naming conventions and hierarchical relationships (/users/:id/posts)","HTTP verbs and semantic meanings (POST vs PUT vs PATCH vs DELETE)","Designing standard response envelopes and error structures"]),
        makeDay(100, "CRUD", ["Implementing complete Create, Read, Update, Delete workflows","Handling partial updates with PATCH vs complete updates with PUT","Appropriate HTTP status codes for each operation (201 Created, 204 No Content)","Handling concurrent updates and idempotency considerations"]),
        makeDay(101, "Authentication APIs", ["Designing auth endpoints: /register, /login, /logout, /me","Password hashing using bcryptjs with high salt rounds","Generating and verifying JSON Web Tokens (JWT)","Writing auth protection middleware (verifyToken) for private routes"]),
        makeDay(102, "Pagination", ["Offset-based pagination (page, limit) and total count calculations","Cursor-based pagination (before, after) for high-performance scale","Including pagination metadata in API responses (page, totalPages, hasNextPage)","Writing reusable pagination utility middleware"]),
        makeDay(103, "Filtering", ["Implementing URL query filtering (?category=tech&status=active)","Sorting support (?sortBy=createdAt&order=desc)","Field selection / projection (?fields=title,price)","Full-text search query handling (?search=keyword)"]),
        makeDay(104, "API Security", ["Preventing brute force with express-rate-limit","Securing HTTP headers with helmet middleware","CORS configuration for allowed origins and credentials","Data sanitization to prevent NoSQL/SQL injection and XSS"]),
        makeDay(105, "API Testing", ["API integration testing setup with Supertest and Vitest/Jest","Writing automated test suites for auth endpoints (register, login, invalid credentials)","Writing tests for CRUD endpoints with status and payload assertions","Testing error scenarios: 400 Bad Request, 401 Unauthorized, 404 Not Found"])
      ]),
      makeWeek(16, "Backend Project", [
        makeDay(106, "Architecture", ["Plan Production E-Commerce Backend API specification","Define database entities: Users, Products, Categories, Orders, Reviews","Design system architecture diagram and module layering","Set up Git repository, TypeScript, and environment configurations"]),
        makeDay(107, "Database Integration", ["Set up database connection pool and environment configs","Implement data access repository layer with separation of concerns","Handle database connection errors, reconnection, and graceful shutdown","Seed database with sample categories and products for testing"]),
        makeDay(108, "Authentication", ["Build user registration with email verification flow","Implement user login, JWT issuance, and refresh token rotation","Implement role-based access control (RBAC): Admin vs Customer","Protect administrative endpoints with adminOnly middleware"]),
        makeDay(109, "API Development", ["Build Product catalog API with filtering, sorting, and pagination","Build Shopping Cart & Order creation API with transaction support","Build User Profile & Order History endpoints","Integrate file upload for product images using multer"]),
        makeDay(110, "Testing", ["Write Supertest integration test suites for all major API routes","Test edge cases: out of stock, unauthorized access, malformed payloads","Achieve 80%+ test coverage on core controller logic","Fix identified bugs and optimize query response times"]),
        makeDay(111, "Documentation", ["Generate interactive API documentation using Swagger / OpenAPI (swagger-ui-express)","Document all endpoints, request bodies, query params, and response codes","Write comprehensive backend README.md with setup instructions and environment guide","Create and export Postman / Insomnia API collection"]),
        makeDay(112, "Deployment", ["Containerize Express backend with Dockerfile or prepare for cloud hosting","Deploy backend API to cloud provider (Render / Railway / AWS)","Configure production environment variables and verify health check endpoint","Phase 4 Review: Run live automated tests against deployed API"])
      ])
    ]),
    makeMonth(5, "Phase 5 — SQL & PostgreSQL", "SQL & PostgreSQL", [
      makeWeek(17, "SQL Basics", [
        makeDay(113, "SELECT", ["Relational database concepts: Tables, Rows, Columns, Primary Keys","SELECT statement syntax: selecting specific columns vs SELECT *","Column aliases using AS keyword","DISTINCT keyword for unique value retrieval"]),
        makeDay(114, "WHERE", ["Filtering records with WHERE clause and comparison operators (=, !=, <, >, <=, >=)","Logical operators: AND, OR, NOT and operator precedence","Pattern matching with LIKE and ILIKE (% and _ wildcards)","Range checking with BETWEEN and set membership with IN / NOT IN"]),
        makeDay(115, "ORDER BY", ["Sorting query results with ORDER BY clause (ASC vs DESC)","Sorting by multiple columns and column positions","Handling NULL values in sorting (NULLS FIRST, NULLS LAST)","Limiting result sets with LIMIT and OFFSET for pagination"]),
        makeDay(116, "GROUP BY", ["Grouping rows into summary rows with GROUP BY clause","Filtering grouped data using HAVING clause (HAVING vs WHERE)","Grouping by multiple columns and understanding aggregated dimensions","Common GROUP BY mistakes and non-aggregated column errors"]),
        makeDay(117, "Aggregate Functions", ["COUNT(), SUM(), AVG(), MIN(), MAX() functions","Handling NULLs in aggregate functions (COUNT(*) vs COUNT(column))","Combining aggregates with CASE WHEN conditional expressions","Calculating business metrics: total revenue, average order value, conversion rate"]),
        makeDay(118, "Subqueries", ["Single-row subqueries vs multi-row subqueries","Subqueries in WHERE clause (IN, ANY, ALL, EXISTS, NOT EXISTS)","Subqueries in SELECT clause and FROM clause (derived tables)","Correlated subqueries and performance considerations"]),
        makeDay(119, "SQL Practice", ["Solve 20 SQL query problems on LeetCode / HackerRank","Practice complex multi-condition filtering and conditional aggregations","Optimize subqueries into efficient statements","Review SQL execution order: FROM -> WHERE -> GROUP BY -> HAVING -> SELECT -> ORDER BY -> LIMIT"])
      ]),
      makeWeek(18, "SQL Joins", [
        makeDay(120, "INNER JOIN", ["Relational foreign keys and join condition concept (ON clause)","INNER JOIN syntax and matching records semantics","Joining two tables with column aliases to resolve ambiguity","Practice 10 INNER JOIN queries across Users, Orders, and Products tables"]),
        makeDay(121, "LEFT JOIN", ["LEFT OUTER JOIN syntax and semantics: preserving all left rows","Identifying missing relations with LEFT JOIN ... WHERE right.id IS NULL","Difference between filters in ON clause vs WHERE clause in LEFT JOIN","Solve 8 real-world reporting queries using LEFT JOIN"]),
        makeDay(122, "RIGHT JOIN", ["RIGHT OUTER JOIN syntax and comparison with LEFT JOIN","When to use RIGHT JOIN and why LEFT JOIN is conventionally preferred","Rewriting RIGHT JOIN queries into clean LEFT JOIN equivalents","Practice 5 RIGHT JOIN queries and verify matching sets"]),
        makeDay(123, "FULL JOIN", ["FULL OUTER JOIN syntax and combining both sides with NULL fill","Use cases: reconciling two datasets and finding discrepancies","FULL JOIN with WHERE condition to find disjoint sets","Solve 5 data reconciliation exercises using FULL OUTER JOIN"]),
        makeDay(124, "Self Join", ["Self Join concept: joining a table with itself using aliases","Hierarchical data querying: Employee-Manager reporting structures","Finding consecutive events or duplicate records using Self Joins","Practice 5 challenging Self Join problem sets"]),
        makeDay(125, "Multiple Joins", ["Joining 3 or more tables in a single SQL query","Combining INNER JOIN and LEFT JOIN in the same query","Designing clean join order and verifying result cardinality","Build a complete Customer Order Invoice query joining 5 tables"]),
        makeDay(126, "Join Practice", ["Solve 15 SQL Join interview problems (StrataScratch / LeetCode SQL 50)","Analyze query execution plans for joins","Avoid Cartesian products (accidental CROSS JOINs)","Weekly Review: Document join cheat sheet with Venn diagrams"])
      ]),
      makeWeek(19, "Advanced SQL", [
        makeDay(127, "CTEs", ["Common Table Expressions (WITH clause) syntax and readability benefits","Chaining multiple CTEs in a single query","Recursive CTEs for hierarchical tree traversal and series generation","Refactor complex nested subqueries into clean modular CTEs"]),
        makeDay(128, "Window Functions", ["Window function concept: OVER (PARTITION BY ... ORDER BY ...)","Ranking functions: ROW_NUMBER(), RANK(), DENSE_RANK()","Value functions: LAG(), LEAD(), FIRST_VALUE()","Running totals and moving averages with SUM() OVER (...)"]),
        makeDay(129, "Views", ["Creating views (CREATE VIEW) for query simplification and security","Materialized Views (CREATE MATERIALIZED VIEW) for performance caching","Refreshing materialized views (REFRESH MATERIALIZED VIEW CONCURRENTLY)","Updating data through views and security permission rules"]),
        makeDay(130, "Indexes", ["B-Tree index structure and how indexing speeds up lookups","Single column indexes vs composite multi-column indexes (leftmost prefix rule)","Unique indexes and partial indexes (WHERE condition)","Index trade-offs: read speed vs write/insert performance"]),
        makeDay(131, "Transactions", ["ACID properties: Atomicity, Consistency, Isolation, Durability","Transaction control commands: BEGIN, COMMIT, ROLLBACK, SAVEPOINT","Transaction isolation levels (Read Uncommitted, Read Committed, Repeatable Read, Serializable)","Preventing dirty reads, non-repeatable reads, and phantom reads"]),
        makeDay(132, "Query Optimization", ["Using EXPLAIN and EXPLAIN ANALYZE to inspect query execution plans","Identifying Sequential Scans vs Index Scans vs Bitmap Index Scans","Fixing slow queries: eliminating N+1 queries, optimizing joins and WHERE clauses","Benchmarking query execution times before and after indexing"]),
        makeDay(133, "SQL Interview Practice", ["Solve Top 10 SQL interview questions asked by FAANG / tier-1 companies","Top 3 salaries per department using DENSE_RANK()","Consecutive active user days using LAG() / LEAD()","Weekly Review: Summarize advanced SQL patterns and window function templates"])
      ]),
      makeWeek(20, "PostgreSQL & Database Design", [
        makeDay(134, "PostgreSQL", ["Installing PostgreSQL and pgAdmin / TablePlus GUI","psql command-line interface commands (\\l, \\dt, \\d table, \\c db)","PostgreSQL data types: UUID, JSONB, ARRAY, TIMESTAMP WITH TIME ZONE","PostgreSQL configuration and client connection limits"]),
        makeDay(135, "Schema Design", ["Database schema planning and entity identification","Primary keys: Auto-increment BIGINT vs UUID v4 vs ULID trade-offs","Column data type selection for storage efficiency and data integrity","Writing clean DDL scripts (CREATE TABLE, ALTER TABLE, DROP TABLE)"]),
        makeDay(136, "Relationships", ["One-to-One relationships (1:1) and shared primary keys","One-to-Many relationships (1:N) and foreign key constraints","Many-to-Many relationships (M:N) with junction/pivot tables","Referential actions: ON DELETE CASCADE, ON DELETE SET NULL, ON DELETE RESTRICT"]),
        makeDay(137, "Normalization", ["Database normalization theory: eliminating data redundancy","First Normal Form (1NF): Atomic values, unique rows","Second Normal Form (2NF): No partial dependencies on composite keys","Third Normal Form (3NF) & BCNF: No transitive dependencies; when to denormalize"]),
        makeDay(138, "Constraints", ["NOT NULL and DEFAULT constraints","UNIQUE and PRIMARY KEY constraints","CHECK constraints for business rule enforcement (e.g. price > 0)","FOREIGN KEY constraints and cascading behaviors"]),
        makeDay(139, "Database Integration", ["Connecting Node.js / Express to PostgreSQL using pg (node-postgres) pool","Preventing SQL Injection using parameterized queries ($1, $2)","Implementing database transaction wrapper for multi-query operations","Introduction to ORM / Query Builders: Prisma or Kysely / Drizzle"]),
        makeDay(140, "Database Project", ["Build a Complete PostgreSQL Database for a Scalable SaaS Platform","Write complete DDL migrations with tables, foreign keys, and CHECK constraints","Create composite indexes, materialized views, and audit triggers","Phase 5 Review: Connect backend API to PostgreSQL and verify end-to-end performance"])
      ])
    ]),
    makeMonth(6, "Phase 6 — Security, Redis & Background Jobs", "Security, Redis & Background Jobs", [
      makeWeek(21, "Authentication", [
        makeDay(141, "Password Hashing", ["Why plain text passwords are a vulnerability; rainbow tables and dictionary attacks","Cryptographic hashing algorithms: bcrypt, argon2, scrypt","Salting and work factors (rounds) to prevent brute-force attacks","Implementing password hashing and verification with argon2 or bcrypt"]),
        makeDay(142, "JWT", ["JSON Web Token anatomy: Header, Payload, Signature","Signing algorithms: HMAC SHA256 (symmetric) vs RSA/ECDSA (asymmetric)","JWT payload security: what never to store in a token (passwords, sensitive data)","Verifying and decoding JWT tokens in request headers"]),
        makeDay(143, "Sessions", ["Stateful session-based authentication vs Stateless JWT comparison","Session store mechanics: storing session data in Redis vs database","Session fixation prevention, session rotation on login, and session invalidation","Configuring express-session with connect-redis"]),
        makeDay(144, "OAuth", ["OAuth 2.0 authorization framework and OpenID Connect (OIDC) protocol","Authorization Code Flow with PKCE (Proof Key for Code Exchange) step-by-step","Integrating \"Sign in with Google\" and \"Sign in with GitHub\"","Handling OAuth redirect callbacks, exchanging auth codes for user profiles"]),
        makeDay(145, "Refresh Tokens", ["Short-lived Access Tokens (15m) + Long-lived Refresh Tokens (7d) strategy","Storing refresh tokens securely in HttpOnly, Secure, SameSite cookies","Refresh token rotation pattern to detect token reuse and replay attacks","Implementing /auth/refresh and /auth/logout token revocation endpoints"]),
        makeDay(146, "Authentication Architecture", ["Designing enterprise authentication architecture with Multi-Factor Auth (MFA/TOTP)","Role-Based Access Control (RBAC) and Permission Matrices","Single Sign-On (SSO) concepts and session management across subdomains","Drafting an Auth Architecture sequence diagram"]),
        makeDay(147, "Auth Project", ["Build Production-Ready Auth Service with Node.js, Express & PostgreSQL","Implement Signup, Login, Password Reset with email token, MFA setup","Add Refresh Token rotation and session management stored in Redis","Achieve 100% test coverage on auth endpoints"])
      ]),
      makeWeek(22, "Web Security", [
        makeDay(148, "XSS", ["Cross-Site Scripting (XSS) types: Stored XSS, Reflected XSS, DOM-based XSS","Impact of XSS: cookie theft, session hijacking, defacement","Defense: Context-aware HTML sanitization (DOMPurify), encoding user output","Content Security Policy (CSP) headers to restrict script execution"]),
        makeDay(149, "CSRF", ["Cross-Site Request Forgery (CSRF) attack vector and mechanics","SameSite cookie attribute (Strict vs Lax vs None) as first-line defense","Anti-CSRF tokens (Synchronizer Token Pattern) in state-changing requests","Validating Origin and Referer headers on incoming requests"]),
        makeDay(150, "SQL Injection", ["SQL Injection (SQLi) mechanics and devastating data breach risks","Blind SQLi vs Error-based SQLi vs Union-based SQLi","Defense: Mandatory parameterized queries / prepared statements (never string concatenation)","Automated testing for SQLi vulnerabilities using security audit tools"]),
        makeDay(151, "CORS Security", ["CORS security misconfigurations: wildcard Access-Control-Allow-Origin: * with credentials","Allowing null origin risks and insecure regex matching of domains","Configuring strict CORS whitelist policy for production frontend domains","Handling preflight caching and exposed headers safely"]),
        makeDay(152, "Rate Limiting", ["Denial of Service (DoS) and brute force attack vectors","Rate limiting algorithms: Token Bucket, Leaky Bucket, Fixed Window, Sliding Window Log","Implementing distributed rate limiting with Redis and express-rate-limit","Returning 429 Too Many Requests with Retry-After headers"]),
        makeDay(153, "Secure Headers", ["Configuring security HTTP headers with helmet middleware","Strict-Transport-Security (HSTS) to enforce HTTPS","X-Frame-Options (DENY/SAMEORIGIN) to prevent Clickjacking","X-Content-Type-Options: nosniff and Referrer-Policy headers"]),
        makeDay(154, "Security Testing", ["OWASP Top 10 vulnerabilities overview and audit checklist","Running automated vulnerability scans using npm audit and Snyk","Performing security penetration testing on sample API routes","Weekly Review: Compile comprehensive Web Security audit report"])
      ]),
      makeWeek(23, "Redis", [
        makeDay(155, "Redis Basics", ["In-memory data store architecture and why Redis is blazingly fast (sub-millisecond)","Installing Redis locally and using redis-cli","Redis basic commands: SET, GET, DEL, EXISTS, EXPIRE, TTL","Redis persistence options: RDB snapshots vs AOF (Append-Only File)"]),
        makeDay(156, "Caching", ["Caching strategies: Cache-Aside (Lazy Loading), Write-Through, Write-Back","Cache expiration, TTL management, and avoiding stale data","Cache stampede / Thundering herd problem and mutex lock mitigation","Implement Cache-Aside pattern for expensive database queries in Node.js"]),
        makeDay(157, "Sessions with Redis", ["Why store user sessions in Redis instead of server memory or relational DB","Session serialization, expiration, and automatic cleanup","Connecting ioredis / redis client to Express session middleware","Benchmarking session read latency: Redis vs PostgreSQL"]),
        makeDay(158, "Rate Limiting", ["Building high-performance API rate limiting with Redis atomic commands (INCR, EXPIRE)","Implementing Sliding Window Rate Limiter using Redis Sorted Sets (ZSET)","Protecting public auth and search endpoints from abuse","Handling Redis rate limiting failover gracefully if Redis is temporarily offline"]),
        makeDay(159, "Pub/Sub", ["Redis Publish/Subscribe (Pub/Sub) messaging paradigm","Commands: PUBLISH channel message, SUBSCRIBE channel, PSUBSCRIBE pattern","Use cases: Real-time chat, live notifications, broadcasting events across nodes","Pub/Sub limitations (no message persistence / buffering) vs Redis Streams"]),
        makeDay(160, "Redis with Node.js", ["Using ioredis client in Node.js with connection pooling and retry strategies","Working with complex Redis data types: Hashes (HSET, HGETALL), Sets (SADD, SMEMBERS)","Executing atomic operations using Redis Multi/Exec and Lua scripts","Building a reusable Redis service module for backend apps"]),
        makeDay(161, "Redis Project", ["Build High-Performance Caching & Analytics Service with Redis & Express","Cache top e-commerce products with 5-minute TTL and automatic invalidation on updates","Implement real-time page view counters using Redis HyperLogLog / Hashes","Benchmark API response times with and without Redis caching (10x+ improvement)"])
      ]),
      makeWeek(24, "Queues & Background Jobs", [
        makeDay(162, "Job Queues", ["Why background queues are essential for web scale (decoupling slow tasks from HTTP requests)","Queue concepts: Producers, Consumers, Message Brokers, FIFO processing","Synchronous vs asynchronous request-response lifecycle","Designing asynchronous task architectures for emails, reports, and media processing"]),
        makeDay(163, "Workers", ["Worker process architecture: separate processes processing queued tasks","Concurrency control and scaling worker processes independently from API servers","Graceful shutdown for workers: finishing active jobs before exit","Monitoring worker health, CPU usage, and queue depth"]),
        makeDay(164, "BullMQ", ["BullMQ setup: Redis-backed modern NodeJS job queue library","Creating Queues, Workers, and QueueEvents in TypeScript","Adding jobs with priority, delay, and custom metadata","Monitoring BullMQ jobs using Bull-Board dashboard UI"]),
        makeDay(165, "Scheduled Jobs", ["Cron jobs vs Queue-based scheduled delayed jobs","Configuring repeatable cron jobs with BullMQ repeat options","Database cleanup and daily summary report generation jobs","Handling timezone offsets and daylight savings in scheduled jobs"]),
        makeDay(166, "Email Jobs", ["Offloading email sending to background queues for sub-50ms API responses","Integrating transactional email service (Resend / SendGrid / Nodemailer)","Queueing welcome emails, invoice receipts, and password reset links","Designing responsive HTML email templates with React Email"]),
        makeDay(167, "Retry & Failure Handling", ["Exponential backoff retry strategies for transient network failures","Dead Letter Queues (DLQ) for permanently failed jobs","Alerting and notifying engineers when critical jobs fail","Idempotent worker execution to prevent duplicate processing on retries"]),
        makeDay(168, "Background Job Project", ["Build Distributed Document Processing & Email Notification Pipeline","API receives PDF/Image upload, queues background resize & watermark job","Worker processes media, stores in cloud storage, and queues notification email","Phase 6 Milestone Review: Demonstrate queue resilience and retry handling under load"])
      ])
    ]),
    makeMonth(7, "Phase 7 — Testing, Linux & Docker", "Testing, Linux & Docker", [
      makeWeek(25, "Testing", [
        makeDay(169, "Unit Testing", ["Testing pyramid: Unit tests vs Integration tests vs End-to-End (E2E) tests","AAA Pattern: Arrange, Act, Assert testing structure","Writing pure function unit tests with high boundary coverage","Test-Driven Development (TDD) cycle: Red, Green, Refactor"]),
        makeDay(170, "Jest", ["Jest / Vitest runner configuration and assertion library (expect)","Matchers: toEqual, toBe, toContain, toThrow, toBeCloseTo","Asynchronous testing: testing Promises, async/await, and rejections","Setup and Teardown hooks: beforeEach, afterEach, beforeAll, afterAll"]),
        makeDay(171, "Integration Testing", ["Integration testing principles: testing how modules collaborate","Testing Express routes with live test database (isolated transactions)","Database seeding and cleanup before/after integration test runs","Testing authentication headers and protected endpoints"]),
        makeDay(172, "API Testing", ["End-to-end API testing using Supertest library","Testing complete user flows: Register -> Login -> Create Post -> Read Post -> Delete","Validating response headers, status codes, and JSON body schemas","Automating API regression test runs in CI"]),
        makeDay(173, "Mocking", ["Why and when to mock: external APIs, email services, payment gateways","Mocking functions with vi.fn() / jest.fn() and inspecting call counts / args","Mocking entire modules using vi.mock() / jest.mock()","Mocking timers with vi.useFakeTimers() for testing delayed tasks"]),
        makeDay(174, "Test Coverage", ["Understanding code coverage metrics: Statement, Branch, Function, Line coverage","Generating HTML test coverage reports with c8 / istanbul","Identifying uncovered critical edge cases and failure paths","Setting minimum test coverage thresholds (80%+) in CI configurations"]),
        makeDay(175, "Testing Project", ["Build a Fully Tested Authentication & Payment Webhook Microservice","Write 25+ comprehensive unit, integration, and mocked external service tests","Achieve 90%+ code coverage across controllers and services","Verify all tests run and pass in headless CI pipeline"])
      ]),
      makeWeek(26, "Linux", [
        makeDay(176, "Linux Basics", ["Linux OS architecture: Kernel, Shell, File System hierarchy","Navigating directories: pwd, ls -la, cd, tree","File operations: touch, cp, mv, rm -rf, mkdir -p","Viewing files: cat, less, head, tail, tail -f for live logs"]),
        makeDay(177, "File System", ["Standard Linux directory structure: /etc, /var/log, /home, /opt, /bin","Hard links vs Symbolic links (ln -s)","Disk usage monitoring: df -h, du -sh *","Searching for files with find and locate"]),
        makeDay(178, "Permissions", ["User, Group, Other permission model (rwx)","Numeric permission values (755, 644, 600) and chmod command","Changing ownership with chown and chgrp","Sudo privileges, /etc/sudoers, and root security best practices"]),
        makeDay(179, "Processes", ["Process management commands: ps aux, top, htop","Background and foreground jobs (Ctrl+Z, bg, fg, jobs)","Killing processes: kill, kill -9, pkill, killall","Managing system services with systemctl (start, stop, restart, status, enable)"]),
        makeDay(180, "Networking Commands", ["Checking network interfaces and IP addresses: ip a, ifconfig","Testing connectivity: ping, traceroute, mtr","Inspecting active listening ports and connections: netstat, ss -tulpn","Transferring files and API calls: curl, wget, scp, rsync"]),
        makeDay(181, "Shell Commands", ["Pipes (|) and I/O redirection (>, >>, 2>&1)","Text processing power tools: grep, awk, sed, cut, sort, uniq","Writing bash automation scripts with variables, loops, and conditions","Configuring environment in ~/.bashrc and ~/.zshrc"]),
        makeDay(182, "Linux Practice", ["Spin up an Ubuntu Linux VM (WSL2 or cloud VPS)","Write a bash script that parses web server access logs and outputs top 10 visitor IPs","Configure SSH keys for secure passwordless authentication","Weekly Review: Compile essential Linux sysadmin cheat sheet"])
      ]),
      makeWeek(27, "Docker", [
        makeDay(183, "Docker Basics", ["Virtual Machines vs Containers: understanding containerization benefits","Docker architecture: Docker Daemon, Docker Client, Images, Containers, Registries","Installing Docker Desktop and verifying docker version / docker run hello-world","Core Docker CLI commands: docker ps, docker run, docker stop, docker rm"]),
        makeDay(184, "Images", ["Docker images layer architecture and union file system","Searching and pulling official images from Docker Hub (docker pull node:20-alpine)","Inspecting image layers with docker history and docker inspect","Cleaning unused images and cache: docker rmi, docker image prune -a"]),
        makeDay(185, "Containers", ["Running containers interactively (docker run -it) and detached (docker run -d)","Port mapping (-p 3000:3000) and environment variables (-e KEY=VAL)","Container logs and debugging: docker logs -f, docker exec -it container_id sh","Container resource limits (--cpus, --memory)"]),
        makeDay(186, "Dockerfile", ["Dockerfile instructions: FROM, WORKDIR, COPY, RUN, ENV, EXPOSE, CMD, ENTRYPOINT","Optimizing Docker cache by copying package.json before source files","Multi-stage Docker builds to reduce image size (from 1GB to 80MB)","Writing .dockerignore to exclude node_modules and secrets"]),
        makeDay(187, "Docker Compose", ["Why Docker Compose: defining multi-container applications in docker-compose.yml","Services, ports, environment, volumes, depends_on configurations","Running applications with docker compose up -d and docker compose down","Managing multi-container environments: Node.js API + PostgreSQL + Redis"]),
        makeDay(188, "Volumes & Networks", ["Data persistence with Docker Volumes (named volumes vs bind mounts for hot reloading)","Docker Bridge networks: container-to-container DNS resolution by service name","Connecting multiple services securely on isolated internal networks","Backing up and restoring Docker volume data"]),
        makeDay(189, "Docker Project", ["Dockerize full-stack application: Next.js frontend + Express API + PostgreSQL + Redis","Write optimized multi-stage Dockerfiles for both services","Create unified docker-compose.yml with health checks and persistent volumes","Verify entire stack boots with a single command (docker compose up) with zero manual setup"])
      ]),
      makeWeek(28, "CI/CD", [
        makeDay(190, "CI/CD Basics", ["Continuous Integration (CI) and Continuous Delivery/Deployment (CD) principles","Automated build, test, and release pipeline stages","Benefits of CI/CD: early bug detection, deployment velocity, reduced human error","Overview of modern CI/CD platforms (GitHub Actions, GitLab CI, CircleCI)"]),
        makeDay(191, "GitHub Actions", ["GitHub Actions core concepts: Workflows, Events, Jobs, Steps, Runners, Actions","Workflow YAML syntax in .github/workflows/ci.yml","Triggering on push and pull_request to main branch","Using official marketplace actions: actions/checkout, actions/setup-node"]),
        makeDay(192, "Automated Testing", ["Setting up automated linting (ESLint), formatting (Prettier), and TypeScript type checking in CI","Running unit and integration test suites automatically on every pull request","Setting up matrix testing across multiple Node.js versions (Node 18, 20, 22)","Blocking pull request merging if tests or linters fail"]),
        makeDay(193, "Build Pipelines", ["Building production frontend bundles and backend binaries inside CI runner","Caching dependencies (actions/cache for npm cache / node_modules) for 3x faster CI runs","Uploading and downloading build artifacts between workflow jobs","Generating build metadata and release changelogs"]),
        makeDay(194, "Deployment Pipelines", ["Automated deployment to staging and production upon merging to main","Configuring repository secrets in GitHub for cloud credentials and API keys","Deploying Next.js frontend to Vercel via CLI / GitHub integration","Deploying Docker containers to cloud registry and triggering cloud service redeploy"]),
        makeDay(195, "Environment Management", ["Managing multiple deployment environments: Development, Staging, Production","Branch-based environment workflows (develop -> staging -> main)","Environment protection rules and required manual approval before production deployment","Database migration execution strategy in automated deployments"]),
        makeDay(196, "CI/CD Project", ["Build Complete End-to-End Production CI/CD Pipeline on GitHub Actions","Lint, typecheck, run full Vitest test suite with coverage upload","Build Docker images, push to GitHub Container Registry (GHCR), deploy to cloud","Phase 7 Milestone Review: Create a PR, watch CI run, merge, and observe zero-downtime deployment"])
      ])
    ]),
    makeMonth(8, "Phase 8 — Cloud & AWS", "Cloud & AWS", [
      makeWeek(29, "Cloud Fundamentals", [
        makeDay(197, "Cloud Computing", ["On-premise servers vs Cloud infrastructure economics and agility","Cloud service models: IaaS (Infrastructure), PaaS (Platform), SaaS (Software)","Cloud deployment models: Public, Private, Hybrid, Multi-cloud","Major cloud providers overview: AWS vs Google Cloud (GCP) vs Microsoft Azure"]),
        makeDay(198, "IaaS/PaaS/SaaS", ["Deep dive comparison: EC2 (IaaS) vs Heroku/Render/App Runner (PaaS) vs Supabase/Firebase","Shared Responsibility Model: who is responsible for OS, runtime, and application security","Choosing the right abstraction level for developer productivity vs cost efficiency","Evaluating cost models: Pay-as-you-go, reserved instances, serverless pricing"]),
        makeDay(199, "Virtual Machines", ["Hypervisors (Type 1 bare-metal vs Type 2 hosted) and virtualization mechanics","Provisioning virtual machines in the cloud","Configuring storage (Block storage vs Object storage vs File storage)","SSH access, key pairs, and baseline OS hardening for production VMs"]),
        makeDay(200, "Networking", ["Virtual Private Cloud (VPC) architecture: IP subnets, CIDR notation (/16, /24)","Public subnets vs Private subnets","Internet Gateways (IGW), NAT Gateways for outbound internet in private subnets","Security Groups (stateful firewall) vs Network ACLs (stateless)"]),
        makeDay(201, "Load Balancers", ["Why Load Balancers: High availability, traffic distribution, SSL termination","Application Load Balancer (ALB / Layer 7) vs Network Load Balancer (NLB / Layer 4)","Health check endpoints (/health) and automatic unhealthy target removal","Load balancing algorithms: Round Robin, Least Outstanding Requests, IP Hash"]),
        makeDay(202, "Scalability", ["Vertical scaling (Scale Up - bigger RAM/CPU) vs Horizontal scaling (Scale Out - more instances)","Stateless application design for seamless horizontal scaling","Auto Scaling Groups (ASG): Dynamic scaling policies based on CPU / Request count","Handling sudden traffic spikes without service degradation"]),
        makeDay(203, "Cloud Review", ["Comprehensive cloud architecture review: Design a High-Availability 3-Tier Web App","Draft architecture diagram: ALB -> ASG Public Subnet -> DB Private Subnet","Review cloud security, cost estimation tools, and disaster recovery strategies","Complete Cloud Fundamentals quiz"])
      ]),
      makeWeek(30, "AWS Fundamentals", [
        makeDay(204, "AWS", ["AWS Global Infrastructure: Regions, Availability Zones (AZs), Edge Locations","AWS Management Console navigation and AWS CLI setup (aws configure)","AWS billing alerts and Free Tier usage monitoring","Setting up Multi-Factor Authentication (MFA) on AWS root account"]),
        makeDay(205, "EC2", ["Amazon Elastic Compute Cloud (EC2) instance types (t3.micro, compute/memory optimized)","Launching an Ubuntu EC2 instance, creating and attaching key pairs","Configuring EC2 Security Groups (Inbound rules for SSH 22, HTTP 80, HTTPS 443)","Connecting via SSH and installing Node.js, Git, and Docker on EC2"]),
        makeDay(206, "S3", ["Amazon Simple Storage Service (S3) buckets, objects, and storage classes","Bucket permissions, Block Public Access settings, and Bucket Policies","Uploading/downloading files using AWS SDK in Node.js (@aws-sdk/client-s3)","Generating S3 Pre-signed URLs for secure direct browser file uploads"]),
        makeDay(207, "RDS", ["Amazon Relational Database Service (RDS) managed database benefits (automated backups, multi-AZ)","Launching PostgreSQL RDS instance inside a private subnet","Connecting EC2 to RDS securely using Security Group rules (Port 5432)","Automated snapshots, maintenance windows, and read replica scaling"]),
        makeDay(208, "IAM", ["AWS Identity and Access Management (IAM): Users, User Groups, Roles, Policies","Principle of Least Privilege (PoLP) and avoiding root account usage","IAM Roles for EC2 instances to access S3 without hardcoded credentials","Writing JSON IAM policy documents with Action, Resource, Effect"]),
        makeDay(209, "CloudWatch", ["Amazon CloudWatch metrics (CPUUtilization, NetworkIn, DiskReadBytes)","Streaming application logs to CloudWatch Logs with AWS CloudWatch Agent","Setting up CloudWatch Alarms for high CPU / memory with SNS email alerts","Creating CloudWatch operational monitoring dashboards"]),
        makeDay(210, "AWS Project", ["Deploy a Production Node.js App on AWS EC2 connected to AWS RDS PostgreSQL","Configure IAM Role for EC2 to upload user media directly to AWS S3","Attach Elastic IP, configure Security Groups, and verify CloudWatch metrics","Write deployment runbook documentation for the AWS environment"])
      ]),
      makeWeek(31, "Production Deployment", [
        makeDay(211, "Domain & DNS", ["Domain registration and DNS management (Route 53 / Cloudflare / Namecheap)","Configuring DNS records: A records, CNAME records, TXT verification","Understanding DNS propagation and TTL settings","Point custom domain name to your deployed cloud web server"]),
        makeDay(212, "HTTPS/SSL", ["Securing web traffic with free SSL/TLS certificates via Let’s Encrypt and Certbot","Automating certificate renewal with Certbot cron jobs","Configuring Nginx reverse proxy with SSL termination and HTTP->HTTPS redirect","Verifying SSL A+ grade using Qualys SSL Labs audit tool"]),
        makeDay(213, "Server Deployment", ["Production process management with PM2: cluster mode, auto-restart on crash, boot startup","Configuring Nginx as reverse proxy to PM2 Node.js application (Port 80/443 -> 3000)","Zero-downtime reloads with pm2 reload ecosystem.config.js","Setting up log rotation to prevent disk exhaustion"]),
        makeDay(214, "Database Deployment", ["Production database hardening: disabling public access, enforcing SSL connections","Setting up automated daily PostgreSQL database backups to S3 using pg_dump","Database migration strategy during production releases with zero data loss","Testing point-in-time disaster recovery restore from backup"]),
        makeDay(215, "Monitoring", ["Application Performance Monitoring (APM): Sentry setup for real-time error tracking","Uptime monitoring and alerting using UptimeRobot / BetterStack (Ping every 60s)","Server health check API endpoint design (/api/health with DB & Redis ping)","Setting up incident alert notifications via Discord / Slack webhook"]),
        makeDay(216, "Logging", ["Structured JSON logging in production using Winston / Pino","Log levels hierarchy (error, warn, info, http, debug)","Centralized log aggregation (Logtail / Datadog / CloudWatch)","Querying and searching logs to diagnose live production incidents"]),
        makeDay(217, "Production Optimization", ["Enabling Gzip / Brotli compression in Nginx reverse proxy","Configuring browser cache headers (Cache-Control) for static assets","Fine-tuning Linux kernel network settings (sysctl) and file limits (ulimit)","Benchmarking server throughput under concurrent load using autocannon / k6"])
      ]),
      makeWeek(32, "Full-Stack SaaS Deployment", [
        makeDay(218, "Architecture", ["Finalize production architecture for Full-Stack SaaS application","Draft complete infrastructure diagram: Vercel (Frontend) -> AWS EC2 (Backend) -> RDS -> S3 -> Redis","Establish deployment checklist and verification milestones","Verify all production environment variables and secrets"]),
        makeDay(219, "Frontend Deployment", ["Deploy production Next.js frontend to Vercel connected to custom domain","Configure production API base URLs and environment variables in Vercel project settings","Verify Edge network caching and build output","Test responsive rendering and client-side error tracking"]),
        makeDay(220, "Backend Deployment", ["Deploy Express backend with Docker / PM2 on AWS EC2 with Nginx reverse proxy","Configure SSL certificates with Certbot for api.yourdomain.com","Configure CORS headers to accept requests strictly from frontend production domain","Verify live API endpoints and Swagger documentation in production"]),
        makeDay(221, "Database", ["Execute production database migrations on AWS RDS PostgreSQL","Seed baseline production lookup tables and categories","Verify automated daily backup snapshots and connection pool limits","Test database query latency under realistic traffic"]),
        makeDay(222, "Authentication", ["Test user registration, login, and token refresh in live production environment","Verify secure HttpOnly cookies across frontend and backend domains","Verify password reset emails arrive via transactional email provider","Conduct security smoke test against common vulnerabilities"]),
        makeDay(223, "Testing", ["Run automated Playwright / Cypress E2E smoke tests against live production URLs","Verify user signup -> create project -> edit note -> upload file -> logout flow","Test payment / webhook flows in sandbox/production mode","Verify error tracking captures deliberate test exceptions in Sentry"]),
        makeDay(224, "Production Launch", ["Public release: Launch Full-Stack SaaS application to the world","Publish professional GitHub repository with live demo links, architecture diagram, and documentation","Share launch post on LinkedIn, Twitter/X, and developer communities","Phase 8 Milestone Review: Celebrate 8-month full-stack milestone!"])
      ])
    ]),
    makeMonth(9, "Phase 9 — Python & FastAPI", "Python & FastAPI", [
      makeWeek(33, "Python Fundamentals", [
        makeDay(225, "Python Basics", ["Python 3 installation, python interactive shell, and running python scripts","Syntax conventions: Indentation, PEP 8 styling, dynamic typing","Variables, comments, and print statement formatting (f-strings)","Built-in functions: len(), type(), id(), range(), input()"]),
        makeDay(226, "Data Types", ["Numeric types: int, float, complex and math operations","Strings: Slicing, immutability, methods (split, join, strip, replace)","Booleans and truthy/falsy evaluation in Python","Type conversion functions: int(), str(), float(), bool()"]),
        makeDay(227, "Conditions & Loops", ["Conditional branching: if, elif, else and comparison operators","for loops over sequences and while loops with condition checks","break, continue, and the unique else clause on loops","Writing clean list comprehensions to replace procedural loops"]),
        makeDay(228, "Functions", ["Defining functions with def, parameters, and return statements","Positional arguments, keyword arguments, and default parameters","*args (variable positional) and **kwargs (variable keyword arguments)","Docstrings, type hints (PEP 484), and lambda anonymous functions"]),
        makeDay(229, "Lists & Dictionaries", ["Lists: append, pop, sort, slicing, and nested lists","Dictionaries: key-value pairs, get(), items(), keys(), dict comprehensions","Tuples: immutable sequences, packing, and unpacking","Sets: unique collections and set operations (union, intersection, difference)"]),
        makeDay(230, "Modules", ["Importing modules: import, from ... import, and aliasing with as","Built-in standard library gems: math, random, datetime, collections, os, sys","Creating custom multi-file Python modules and packages with __init__.py","Understanding if __name__ == \"__main__\" execution guard"]),
        makeDay(231, "Python Project", ["Build a Python CLI Task & Study Time Tracker tool","Store tasks, log study duration with timestamps, and calculate weekly statistics","Format tables in terminal using rich / tabulate library","Package as an executable Python CLI utility"])
      ]),
      makeWeek(34, "Intermediate Python", [
        makeDay(232, "OOP", ["Object-Oriented Programming in Python: Classes, Objects, and __init__ constructor","Instance attributes, class attributes, and methods (self parameter)","Inheritance (super()), method overriding, and polymorphism","Special magic/dunder methods: __str__, __repr__, __len__, __eq__"]),
        makeDay(233, "Exceptions", ["try, except, else, finally blocks execution semantics","Catching specific exceptions (ValueError, KeyError, FileNotFoundError)","Raising exceptions (raise) and defining custom Exception subclasses","Context managers with the with statement (__enter__, __exit__)"]),
        makeDay(234, "File Handling", ["Reading and writing text files using with open() as f:","Working with JSON files using the json module (load, loads, dump, dumps)","Processing CSV files using the csv module and DictReader","File paths management using the modern pathlib Path module"]),
        makeDay(235, "Virtual Environments", ["Why virtual environments are crucial (dependency isolation across projects)","Creating environments with venv: python -m venv .venv","Activating/deactivating environments and managing pip packages","requirements.txt vs modern package managers (Poetry / UV)"]),
        makeDay(236, "APIs", ["Making HTTP requests in Python using the requests library","Handling GET, POST, headers, query params, and JSON responses","Handling timeouts, status codes, and HTTP errors with raise_for_status()","Consuming external public APIs and parsing nested payloads"]),
        makeDay(237, "Async Python", ["Asynchronous programming in Python with asyncio","async def coroutines and the await keyword","Running concurrent tasks with asyncio.gather()","Asynchronous HTTP requests using the httpx / aiohttp library"]),
        makeDay(238, "Python Project", ["Build an Async Multi-Source Web Scraper & Data Aggregator in Python","Fetch articles/data concurrently from 5 web endpoints using httpx and asyncio","Parse HTML content using BeautifulSoup4 and clean data structures","Export structured results to JSON and CSV files"])
      ]),
      makeWeek(35, "FastAPI", [
        makeDay(239, "FastAPI Basics", ["FastAPI introduction: high performance, automatic OpenAPI / Swagger docs, async-native","Installing fastapi and uvicorn ASGI server","Creating basic endpoints with @app.get(\"/\") and @app.post(\"/\")","Running dev server with auto-reload (uvicorn main:app --reload)"]),
        makeDay(240, "Routing", ["Organizing routes with APIRouter for modular architecture","Path parameters with type annotations (/items/{item_id}: int)","Query parameters with optional defaults (/items?skip=0&limit=10)","Setting response status codes, tags, and summary for automatic docs"]),
        makeDay(241, "Pydantic", ["Data modeling and validation with Pydantic BaseModel","Field types, default values, and Field validation constraints (gt, le, regex)","Pydantic EmailStr, HttpUrl, and custom validator functions (@field_validator)","Request body validation and typed response models (response_model=ItemResponse)"]),
        makeDay(242, "Authentication", ["FastAPI dependency injection system (Depends)","Implementing OAuth2 with Password (and hashing) using OAuth2PasswordBearer","Generating and verifying JWT access tokens in Python (python-jose / pyjwt)","Creating get_current_user dependency to protect private API routes"]),
        makeDay(243, "Database Integration", ["Connecting FastAPI to PostgreSQL using SQLAlchemy 2.0 (async session)","Defining ORM models and mapping Pydantic schemas","Database session dependency generator (yield db) for clean connection pooling","Database migrations using Alembic (alembic revision --autogenerate, upgrade head)"]),
        makeDay(244, "Async APIs", ["Writing asynchronous endpoints with async def and non-blocking I/O","FastAPI BackgroundTasks for asynchronous post-request processing","Streaming responses with StreamingResponse for real-time data output","Error handling with HTTPException and custom exception handlers"]),
        makeDay(245, "FastAPI Project", ["Build a Production-Ready REST API in FastAPI with PostgreSQL & Pydantic","Implement Users and Items CRUD with JWT authentication and RBAC","Include Alembic migrations, interactive Swagger docs, and Pytest test suite","Containerize with Dockerfile and test locally"])
      ]),
      makeWeek(36, "Python for AI", [
        makeDay(246, "NumPy", ["NumPy arrays (ndarray) vs Python lists: memory layout and performance benefits","Creating arrays, multidimensional matrices, shape, and dtype","Array indexing, slicing, broadcasting rules, and vectorized operations","Math operations: dot product, matrix multiplication, mean, sum, std"]),
        makeDay(247, "Data Processing", ["Pandas fundamentals: Series and DataFrame structures","Loading datasets from CSV, JSON, and Parquet","Data cleaning: handling missing values (dropna, fillna), filtering, and grouping","Text preprocessing: normalization, tokenization, and regex cleaning for AI models"]),
        makeDay(248, "JSON", ["Working with deeply nested JSON structures in Python for AI payloads","Serializing and deserializing complex objects, dates, and Pydantic models","JSON Schema generation and validation","Handling malformed or truncated JSON from LLM outputs"]),
        makeDay(249, "AI APIs", ["Overview of AI model providers: OpenAI API, Anthropic Claude API, Google Gemini API, Groq","API authentication, base URLs, model selection (GPT-4o, Claude 3.5 Sonnet, Gemini 1.5 Pro)","Installing official SDKs (openai, anthropic, google-generativeai)","Making your first API call and parsing completion responses"]),
        makeDay(250, "API Integration", ["Configuring API keys securely via environment variables (.env)","Handling rate limits, retries with exponential backoff (tenacity library)","Calculating and tracking token costs and latency across API calls","Building a unified LLM client interface supporting multiple providers"]),
        makeDay(251, "AI Backend", ["Building an AI Backend Service in FastAPI","Exposing endpoints that receive user queries, call LLM APIs, and return answers","Adding Pydantic input sanitization and output validation","Logging AI requests, response tokens, and processing time to database"]),
        makeDay(252, "AI Project", ["Build an AI Code Reviewer & Explainer Microservice in FastAPI","Endpoint accepts source code snippets and returns review, bugs, and optimizations","Format responses with syntax-highlighted markdown and categorized severity tags","Phase 9 Milestone Review: Test with Python, JavaScript, and SQL code samples"])
      ])
    ]),
    makeMonth(10, "Phase 10 — LLM Application Development", "LLM Application Development", [
      makeWeek(37, "LLM Fundamentals", [
        makeDay(253, "LLM Concepts", ["How Large Language Models work: Transformer architecture, autoregressive next-token prediction","Pre-training, Supervised Fine-Tuning (SFT), and RLHF / DPO alignment","Key model parameters: temperature (creativity vs determinism), top_p, max_tokens","Capabilities, limitations, and hallucination risks of modern LLMs"]),
        makeDay(254, "Tokens", ["What is a token: Byte-Pair Encoding (BPE) tokenization mechanics","Inspecting token counts with tiktoken library in Python","Token-to-word ratios across English, code, and non-English languages","Calculating token pricing and cost modeling for production apps"]),
        makeDay(255, "Context Windows", ["Context window limits (8k, 32k, 128k, 1M+ tokens) and memory retention","Needle in a Haystack evaluation: how models retrieve information across long context","Context management strategies: truncation, rolling buffer, summarization","Optimizing context windows to keep costs low and latency fast"]),
        makeDay(256, "LLM APIs", ["OpenAI Chat Completions API format: system, user, assistant messages","Configuring parameters: temperature, presence_penalty, frequency_penalty, seed for reproducibility","Managing multi-turn conversation arrays in API payloads","Writing a robust wrapper around OpenAI / Anthropic APIs"]),
        makeDay(257, "API Streaming", ["Server-Sent Events (SSE) protocol for streaming token-by-token responses","Consuming streaming LLM responses in Python with stream=True","Streaming chunks to frontend clients using FastAPI StreamingResponse","Handling network disconnections and stream termination cleanly"]),
        makeDay(258, "Structured Output", ["Why unstructured text fails in production code; need for guaranteed JSON schemas","OpenAI Structured Outputs (response_format with strict json_schema)","Validating and parsing LLM outputs directly into Pydantic models","Building reliable data extraction pipelines from unstructured text"]),
        makeDay(259, "LLM Project", ["Build a Structured AI Resume & Job Description Analyzer","Accepts resume text and job description, extracts candidate skills and match score","Returns guaranteed strict JSON matching Pydantic schema with missing qualifications","Stream analysis summary directly to user interface"])
      ]),
      makeWeek(38, "Prompt Engineering", [
        makeDay(260, "Prompt Basics", ["Principles of effective prompt design: Clarity, Specificity, Context, and Constraints","Anatomy of a production prompt: Role, Goal, Instructions, Constraints, Examples, Output Format","Avoiding negative constraints (\"don't do X\") vs positive directives (\"do Y\")","Prompt versioning and prompt registry strategies"]),
        makeDay(261, "System Prompts", ["Crafting authoritative System Prompts to establish persona, domain expertise, and tone","Defining behavioral guardrails: handling out-of-scope questions and refusal rules","Preventing prompt leakage (protecting system prompt confidentiality)","Testing system prompt adherence across different model temperatures"]),
        makeDay(262, "Few-Shot Prompting", ["Zero-Shot vs One-Shot vs Few-Shot prompting techniques","Selecting representative, diverse examples to teach desired behavior","Formatting few-shot input-output pairs consistently in prompts","Benchmarking accuracy improvements of few-shot vs zero-shot on complex classification"]),
        makeDay(263, "Chain of Thought Concepts", ["Chain of Thought (CoT) prompting: \"Think step by step\" to improve reasoning","Zero-shot CoT vs Few-shot CoT for multi-step math and logic puzzles","Internal monologue / hidden scratchpad pattern before providing final answer","Trade-offs: reasoning accuracy vs increased token latency and cost"]),
        makeDay(264, "Structured Prompts", ["Designing structured prompt templates with XML tags (<context>, <instructions>, <input>)","Dynamic prompt templating using Jinja2 or LangChain prompt templates","Injecting variables, user metadata, and historical context cleanly","Preventing delimiter collision and prompt injection attacks"]),
        makeDay(265, "Prompt Evaluation", ["Evaluating prompt quality systematically instead of manual eyeballing","Building evaluation datasets with gold-standard ground truth answers","LLM-as-a-Judge pattern: using a stronger model (GPT-4o) to grade outputs on criteria","Measuring accuracy, hallucination rate, and format compliance across prompt revisions"]),
        makeDay(266, "Prompt Project", ["Build an Automated Customer Support Email Classifier & Auto-Responder","Classify incoming emails into categories (Billing, Technical, Account, Refund)","Extract customer sentiment, urgency level, and key issue into structured JSON","Generate personalized draft responses following brand voice guidelines"])
      ]),
      makeWeek(39, "Tool Calling", [
        makeDay(267, "Function Calling", ["Function calling / Tool use fundamentals: bridging LLMs with external code and APIs","Model outputting function name and JSON arguments instead of prose text","The function calling cycle: User prompt -> Model calls tool -> App executes tool -> Model answers","Inspecting tool_calls array in OpenAI / Claude API responses"]),
        makeDay(268, "Tools", ["Designing modular tool functions in Python (e.g. get_weather, search_database, send_email)","Defining clean function signatures with typed parameters and detailed docstrings","Handling tool execution errors and returning informative error messages to the model","Executing multiple parallel tool calls returned in a single turn"]),
        makeDay(269, "Tool Schemas", ["Defining JSON Schema for tools according to OpenAI / Anthropic function specs","Generating tool schemas automatically from Python function signatures or Pydantic models","Writing clear parameter descriptions that guide the LLM on when and how to invoke tools","Configuring tool_choice: auto vs required vs specific tool"]),
        makeDay(270, "API Tools", ["Integrating external REST APIs as LLM tools (e.g. GitHub API, Weather API, Stock API)","Transforming API responses into concise context to avoid blowing context windows","Handling API authentication, rate limits, and timeouts inside tool functions","Building an interactive Stock Market Research Assistant with live API tools"]),
        makeDay(271, "Database Tools", ["Giving LLMs read-only SQL query tools to answer questions from databases (Text-to-SQL)","Providing schema context and table definitions in tool system prompt","Restricting execution to read-only SELECT queries (blocking DROP, DELETE, UPDATE)","Query execution timeout limits and result formatting"]),
        makeDay(272, "Tool Security", ["Security risks of tool calling: Indirect Prompt Injection, unauthorized tool execution","Human-in-the-Loop (HITL) approval patterns for destructive or sensitive actions (payments, delete)","Validating tool arguments strictly with Pydantic before executing Python code","Sandboxing arbitrary code execution tools in isolated Docker containers"]),
        makeDay(273, "Tool-Calling Project", ["Build an AI Database Analyst Assistant with Function Calling in FastAPI","User asks business questions in plain English (\"What was our revenue last month by category?\")","LLM generates safe SQL, executes tool against PostgreSQL, and formats answer with charts","Phase 10 Review: Test with 10 complex analytical questions and verify safe execution"])
      ]),
      makeWeek(40, "AI Application Engineering", [
        makeDay(274, "AI UI", ["UX design patterns for AI applications: Chat, Copilot, Inline Assist, Canvas","Designing streaming chat interfaces with auto-scrolling and typing indicators","Markdown rendering for AI responses with syntax-highlighted code blocks and copy buttons","Handling empty states, suggestions chips, and feedback buttons (Thumbs up/down)"]),
        makeDay(275, "Streaming Chat", ["Implementing end-to-end streaming chat from FastAPI backend to React/Next.js frontend","Using the Vercel AI SDK (useChat, streamText) in Next.js App Router","Managing streaming state, abort controllers for stopping generation mid-stream","Handling rendering of stream interruptions and network reconnects"]),
        makeDay(276, "Conversation Memory", ["Chat history management strategies: Full history vs Windowed buffer vs Summarization","Storing conversation threads and messages in PostgreSQL database","Persisting user and assistant messages with unique session IDs","Pruning old messages dynamically when approaching context window limits"]),
        makeDay(277, "AI Error Handling", ["Handling model rate limits (429) with exponential backoff and friendly user messaging","Fallback strategies: switching to a secondary model provider (OpenAI -> Anthropic) if down","Handling content moderation filters and safety refusals gracefully","Detecting and re-prompting on malformed structured output JSON"]),
        makeDay(278, "AI Evaluation", ["Building continuous evaluation pipelines for AI responses in production","Tracking key quality metrics: Response relevance, groundedness, latency, token usage","Logging user interactions, ratings, and corrections for iterative improvements","Running automated regression tests against synthetic evaluation test suites"]),
        makeDay(279, "AI Cost Optimization", ["Strategies to cut AI operational costs by 50-80%","Semantic caching: caching LLM responses for similar user queries with vector similarity","Model routing: routing simple tasks to cheap fast models (GPT-4o-mini / Haiku) and hard tasks to flagship models","Compressing prompts and pruning unnecessary context tokens"]),
        makeDay(280, "AI Assistant Project", ["Build a Production-Ready AI Code & Learning Assistant with Next.js & FastAPI","Full streaming chat interface with conversation history stored in database","Multi-model selector, prompt templates, and semantic response caching","Deploy frontend to Vercel and backend to cloud with live monitoring"])
      ])
    ]),
    makeMonth(11, "Phase 11 — Embeddings & RAG", "Embeddings & RAG", [
      makeWeek(41, "Embeddings", [
        makeDay(281, "Embeddings", ["What are text embeddings: dense vector representations capturing semantic meaning","Vector dimensions (1536 dims for text-embedding-3-small, 3072 for large)","Comparing keyword lexical search (BM25) vs semantic vector search","Visualizing embedding spaces with dimensionality reduction (t-SNE / UMAP)"]),
        makeDay(282, "Semantic Similarity", ["Measuring similarity between vector embeddings: Cosine Similarity, Dot Product, Euclidean Distance","Implementing cosine similarity function in Python using NumPy","Why normalized embeddings make dot product equivalent to cosine similarity","Experimenting with semantic similarity between words, phrases, and contradictory statements"]),
        makeDay(283, "Vector Representations", ["How transformer encoders generate sentence and passage representations","Embedding models landscape: OpenAI text-embedding-3, Cohere Embed v3, BGE / E5 open source","Multi-lingual embeddings and domain-specific embeddings (code, medical, legal)","Evaluating embedding quality using MTEB (Massive Text Embedding Benchmark)"]),
        makeDay(284, "Embedding APIs", ["Generating embeddings in Python using OpenAI / Cohere / HuggingFace APIs","Batching embedding generation requests for high throughput and lower cost","Handling text length limits (8191 tokens) and truncation strategies","Writing an asynchronous embedding utility service with caching"]),
        makeDay(285, "Chunking", ["Why chunking is vital: matching search granularity and staying within model context limits","Fixed-size chunking with overlap (e.g. 500 characters with 100 character overlap)","Recursive character chunking (splitting on paragraphs -> sentences -> words)","Document-specific chunking for Markdown, HTML, and Python source code"]),
        makeDay(286, "Metadata", ["Attaching rich metadata to chunks: document_id, title, page_number, creation_date, section_heading","Why metadata is critical for citation generation and access control filtering","Structuring metadata JSON schemas for fast indexed filtering","Preserving structural document context within chunk metadata"]),
        makeDay(287, "Embedding Project", ["Build a Semantic Search Engine for a Knowledge Base in Python","Ingest 50+ technical articles, chunk with recursive splitting, and generate embeddings","Accept user search queries, generate query embedding, and rank top 5 most relevant articles","Benchmark semantic search results vs traditional keyword matching"])
      ]),
      makeWeek(42, "Vector Databases", [
        makeDay(288, "Vector Databases", ["Why traditional relational databases struggle with high-dimensional vector search","Vector Database landscape: Dedicated (Pinecone, Qdrant, Chroma, Milvus) vs Integrated (PostgreSQL pgvector)","Architecture of vector indexing: In-memory vs disk storage, persistence, and replication","Choosing between managed cloud vector databases vs self-hosted pgvector"]),
        makeDay(289, "Similarity Search", ["Exact k-Nearest Neighbors (k-NN) search vs Approximate Nearest Neighbors (ANN)","The curse of dimensionality and why ANN is necessary for millions of vectors","Measuring search recall and query latency trade-offs","Executing similarity queries with top_k limits"]),
        makeDay(290, "Indexing", ["ANN Indexing algorithms: HNSW (Hierarchical Navigable Small World) graphs","IVF (Inverted File Index) and vector quantization (IVFFlat vs IVFPQ)","Index construction parameters (m, ef_construction in HNSW) and search tuning (ef_search)","Benchmarking index build time vs query latency across index types"]),
        makeDay(291, "Metadata Filtering", ["Filtering search results by metadata (e.g. user_id, category, date range)","Pre-filtering (filter metadata before ANN) vs Post-filtering (filter after ANN)","Single-stage filtered vector search in modern vector databases","Building compound query filters (AND, OR, IN) combined with vector similarity"]),
        makeDay(292, "PostgreSQL + pgvector", ["Installing and enabling pgvector extension (CREATE EXTENSION vector;)","Defining vector columns: embedding vector(1536)","Creating HNSW index on vector column using cosine distance ops (vector_cosine_ops)","Querying top matches using cosine distance operator (<=>) in SQL"]),
        makeDay(293, "Vector Optimization", ["Optimizing pgvector query performance: work_mem settings and index tuning","Handling vector updates, deletions, and vacuum maintenance in PostgreSQL","Partitioning large vector tables by tenant or date for sub-10ms queries","Evaluating vector storage footprint and memory requirements"]),
        makeDay(294, "Vector DB Project", ["Build a Multi-Tenant Vector Database Storage Layer with PostgreSQL & pgvector","Create database schema for documents, chunks, and embeddings with tenant_id isolation","Implement high-speed batch ingestion pipeline with HNSW index","Write benchmark script testing search latency under concurrent queries"])
      ]),
      makeWeek(43, "RAG Fundamentals", [
        makeDay(295, "RAG Architecture", ["Retrieval-Augmented Generation (RAG) architecture: Ingestion, Retrieval, Synthesis","Why RAG is the gold standard for enterprise LLM apps: prevents hallucinations, enables private data access","The RAG lifecycle: User question -> Embed query -> Retrieve chunks -> Augment prompt -> Generate grounded response","Drafting an end-to-end RAG architecture diagram"]),
        makeDay(296, "Document Loading", ["Ingesting documents from various formats: PDF (pypdf, pdfplumber), DOCX, Markdown, Text","Extracting clean text, tables, and handling scanned documents / OCR","Preserving document structure (headers, bullet points, code blocks)","Building an automated document ingestion pipeline in Python"]),
        makeDay(297, "Chunking", ["Advanced chunking strategies: Semantic Chunking (splitting on embedding distance shifts)","Parent-Document Retriever chunking (retrieving small chunks for search, passing large parent context to LLM)","Sentence-window chunking (injecting surrounding sentences for context)","Benchmarking RAG answer quality across different chunking sizes (256 vs 512 vs 1024 tokens)"]),
        makeDay(298, "Retrieval", ["Configuring retrieval parameters: top_k chunks, similarity score thresholds","Eliminating redundant chunks with Maximal Marginal Relevance (MMR) for diversity","Handling queries with zero relevant documents: defining safe fallback answers","Logging retrieved chunks and similarity scores for inspection"]),
        makeDay(299, "Context Injection", ["Structuring context injection into the prompt template cleanly","Instructing the LLM to answer strictly using the provided context (\"If unsure, state you don't know\")","Adding source citations into the generated response ([Doc 1], [Doc 2])","Handling context window limits when retrieved chunks are large"]),
        makeDay(300, "RAG Evaluation", ["Evaluating RAG systems with the RAG Triad: Context Relevance, Groundedness (Faithfulness), Answer Relevance","Using evaluation frameworks (Ragas / TruLens) to grade RAG pipelines automatically","Detecting and quantifying hallucinations in generated answers","Building automated regression evaluation suites for RAG systems"]),
        makeDay(301, "RAG Project", ["Build an End-to-End RAG System for Technical Documentation in FastAPI","Ingest comprehensive library documentation (e.g. Next.js or FastAPI docs)","Provide streaming answers with clickable source citations and similarity scores","Achieve 90%+ faithfulness score on evaluation benchmark"])
      ]),
      makeWeek(44, "Advanced RAG", [
        makeDay(302, "Hybrid Search", ["Combining Dense Vector Retrieval (semantic) + Sparse Lexical Retrieval (BM25 keyword search)","Why Hybrid Search outperforms vector-only: excels at exact keywords, IDs, acronyms, and semantic concepts","Reciprocal Rank Fusion (RRF) algorithm for merging dense and sparse ranked lists","Implementing Hybrid Search with pgvector and PostgreSQL Full-Text Search (tsvector)"]),
        makeDay(303, "Reranking", ["Two-stage retrieval architecture: Fast retrieve top 25 -> Cross-Encoder rerank top 5","How Cross-Encoder reranker models work (e.g. Cohere Rerank, BGE-Reranker)","Why Reranking dramatically improves context precision and eliminates noise","Integrating Cohere Rerank API into the RAG pipeline"]),
        makeDay(304, "Query Expansion", ["Query transformation techniques: Multi-Query Generation (generating 3 query variations)","Hypothetical Document Embeddings (HyDE): Generating a hypothetical answer, then embedding it to search","Step-Back Prompting: Generating higher-level conceptual search queries","Implementing query expansion pipeline to boost recall on ambiguous queries"]),
        makeDay(305, "Metadata Filtering", ["Self-Querying Retriever: LLM extracts query filters from natural language input","Example: \"Show me Python tutorials from 2024\" -> filter: { language: \"python\", year: { $gte: 2024 } }","Converting extracted filters into SQL / pgvector WHERE clauses","Benchmarking search precision with dynamic metadata filtering"]),
        makeDay(306, "Citation Generation", ["Generating verifiable inline citations linked directly to document source page numbers","Extracting exact quote snippets matching retrieved chunks to highlight in UI","Building interactive PDF viewer that highlights source sentences when citation is clicked","Ensuring zero hallucinated citations in critical medical/financial/legal domains"]),
        makeDay(307, "RAG Optimization", ["Optimizing latency: parallelizing retrieval, embedding generation, and reranking","Context compression: removing irrelevant sentences before sending to LLM context","Prompt caching: using provider prompt caching (Anthropic / OpenAI) to reduce cost by 50%+","Monitoring RAG cache hit rates and end-to-end latency"]),
        makeDay(308, "AI Document Assistant", ["Build Production \"AI Document Assistant & PDF Research Copilot\"","Upload multi-page PDFs, process with Hybrid Search + Reranking + Citations","Full Next.js frontend with split PDF viewer and interactive streaming chat","Phase 11 Review: Demonstrate accurate citation jumping and answer quality on complex research papers"])
      ])
    ]),
    makeMonth(12, "Phase 12 — AI Agents & System Design", "AI Agents & System Design", [
      makeWeek(45, "AI Workflows", [
        makeDay(309, "AI Workflows", ["Prompt Chaining vs Routing vs Parallelization vs Evaluator-Optimizer workflows","Deterministic workflow state vs autonomous agent loops","Building modular workflow graphs with LangGraph / custom state machine in Python","Tracing and visualizing workflow execution steps with LangSmith / OpenTelemetry"]),
        makeDay(310, "Tool-Based Workflows", ["Chaining multiple specialized tools sequentially to achieve business objectives","Passing state and intermediate artifacts across workflow steps","Handling tool failures, retries, and conditional fallback branches","Build an automated Customer Onboarding workflow with email, database, and CRM tools"]),
        makeDay(311, "Multi-Step Tasks", ["Decomposing complex goals into atomic, executable sub-tasks","Tracking task status: pending, in-progress, completed, failed","Dynamic replanning when a sub-task produces unexpected results","Visualizing multi-step execution progress in the user interface"]),
        makeDay(312, "Workflow State", ["Defining persistent workflow state schemas (TypedDict / Pydantic models)","State checkpointing and resuming interrupted workflows from database","Managing concurrent state mutations and race conditions","Implementing workflow timeouts and cancellation tokens"]),
        makeDay(313, "Human-in-the-Loop", ["Human-in-the-Loop (HITL) architecture: pausing execution at critical checkpoints","Approval workflows for actions with financial, legal, or data deletion impact","Resuming workflow execution upon human approval or handling rejections with feedback","Building a Human Approval dashboard UI"]),
        makeDay(314, "Workflow Evaluation", ["Evaluating multi-step workflow reliability and end-to-end completion rates","Benchmarking cost and latency across workflow architectures","Identifying workflow bottlenecks and loop failures","Writing regression integration tests for multi-step workflow graphs"]),
        makeDay(315, "AI Workflow Project", ["Build an Automated AI Research & Blog Publishing Workflow Engine","Takes a topic, searches web for sources, outlines post, drafts sections, reviews quality, and publishes","Include Human-in-the-Loop review before publishing to blog CMS","Demonstrate end-to-end execution with full step telemetry"])
      ]),
      makeWeek(46, "AI Agents", [
        makeDay(316, "Agent Architecture", ["Autonomous Agent loop architecture: Perceive -> Plan -> Act -> Reflect","ReAct (Reasoning + Acting) pattern step-by-step","Difference between rigid workflows and dynamic autonomous reasoning loops","Preventing infinite loops: setting recursion limits and budget caps"]),
        makeDay(317, "Agent Tools", ["Equipping agents with a comprehensive toolset: Web Search, Code Execution, File I/O, API client","Tool documentation design to maximize autonomous selection accuracy","Validating tool arguments and sandboxing execution environments","Dynamic tool discovery and filtering for specialized sub-tasks"]),
        makeDay(318, "Agent Memory", ["Agent Memory hierarchy: Short-term (conversation working memory) vs Long-term memory (vector store / DB)","Episodic memory: retrieving past task experiences and lessons learned","Semantic memory: storing facts and user preferences","Implementing memory persistence and recall in Python"]),
        makeDay(319, "Planning", ["Planning strategies: Plan-and-Solve, Tree of Thoughts (ToT), Reflexion","Generating initial plans, executing steps, and re-evaluating plan based on environmental feedback","Self-correction: detecting errors in intermediate code/tool output and fixing them automatically","Benchmarking planning agents on multi-step reasoning benchmarks"]),
        makeDay(320, "Multi-Agent Systems", ["Multi-Agent collaboration architectures: Supervisor/Worker, Hierarchical Teams, Peer Collaboration","Agent role specializations (Researcher, Coder, Reviewer, Project Manager)","Inter-agent communication protocols and message passing","Building a multi-agent software engineering team simulation in Python"]),
        makeDay(321, "Agent Security", ["Security vulnerabilities in autonomous agents: Prompt injection hijacking, unintended actions, data exfiltration","Implementing strict permission boundaries and sandboxed execution environments","Rate limiting and spending quotas on agent tool calls and LLM tokens","Auditing agent decision logs for safety and compliance"]),
        makeDay(322, "AI Agent Project", ["Build an Autonomous AI Full-Stack Developer Agent","Agent receives a feature request, inspects repository files, plans changes, writes code, runs tests, and fixes bugs","Include sandboxed terminal execution and git commit capabilities","Test agent by having it implement and pass unit tests for a new feature"])
      ]),
      makeWeek(47, "System Design", [
        makeDay(323, "System Design Basics", ["System design fundamentals: High availability, Reliability, Fault tolerance, Maintainability","CAP Theorem (Consistency, Availability, Partition Tolerance) and PACELC theorem trade-offs","Latency vs Throughput, Bandwidth, and Response time percentiles (p50, p95, p99)","Back-of-the-envelope calculations: QPS, storage, memory, and bandwidth requirements"]),
        makeDay(324, "Scalability", ["Horizontal scaling vs Vertical scaling strategies across all system layers","Stateless application servers and externalizing state to distributed stores","Database scaling: Read replicas, Vertical partitioning, Horizontal partitioning (Sharding)","Consistent Hashing algorithm for distributed caching and database sharding"]),
        makeDay(325, "Load Balancing", ["Layer 4 (Transport) vs Layer 7 (Application) load balancing","Load balancing algorithms: Round Robin, Weighted Round Robin, Least Connections, IP Hash","Health check monitoring and automatic failover mechanics","Nginx and AWS Application Load Balancer configuration"]),
        makeDay(326, "Caching", ["Multi-tier caching architecture: Browser -> CDN -> Reverse Proxy -> Application -> Database","Cache eviction policies: LRU (Least Recently Used), LFU, FIFO","Cache invalidation challenges: Cache-Aside, Write-Through, Write-Behind","Mitigating Cache Penetration, Cache Breakdown, and Cache Avalanche"]),
        makeDay(327, "Databases & Replication", ["Relational (SQL) vs Non-Relational (NoSQL) database selection criteria","Database replication: Single-Leader (Master-Slave), Multi-Leader, Leaderless (Dynamo style)","Synchronous vs Asynchronous replication and replication lag","Database connection pooling (PgBouncer) under high concurrent connection load"]),
        makeDay(328, "Queues & Distributed Systems", ["Message brokers and event-driven architecture: RabbitMQ vs Apache Kafka vs Redis Streams","Publish/Subscribe messaging, consumer groups, and partitioned logs","Idempotency in distributed systems and handling network partitions","Distributed transactions: Two-Phase Commit (2PC) vs Saga Pattern"]),
        makeDay(329, "System Design Practice", ["System Design Interview Mocks: Design a Scalable URL Shortener (TinyURL)","System Design Mock 2: Design Twitter / Social Media Feed System with real-time fanout","System Design Mock 3: Design Real-Time AI Chatbot System for 1 Million Daily Active Users","Weekly Review: Compile comprehensive System Design interview cheat sheet"])
      ]),
      makeWeek(48, "Final AI Full-Stack Project", [
        makeDay(330, "Architecture", ["Architect Flagship \"AI STUDY OS\" Full-Stack Production System","Define architecture diagram: Next.js 14 Frontend -> FastAPI Backend -> PostgreSQL (pgvector) -> Redis -> BullMQ -> LLM / RAG / AI Agents","Design database schemas, API contracts, and multi-tenant security specifications","Set up GitHub monorepo with automated CI/CD and linting"]),
        makeDay(331, "Frontend", ["Build responsive Next.js 14 App Router UI with modern aesthetics, dark mode, and animations","Implement Interactive Study Tracker dashboard with analog clock, progress rings, and streak tracking","Build RAG Document Chat interface with split PDF viewer and source citation cards","Build AI Agent Kanban task management board with real-time updates"]),
        makeDay(332, "Backend", ["Build high-performance asynchronous FastAPI & Express backend services","Implement authentication with JWT, refresh token rotation, and RBAC","Build REST endpoints for Study Plans, Tasks, Study Hours analytics, and user settings","Add rate limiting, request validation with Pydantic, and centralized error logging"]),
        makeDay(333, "Database", ["Deploy PostgreSQL database with pgvector extension enabled","Execute complete DDL migrations with relational foreign keys, CHECK constraints, and HNSW vector index","Configure Redis cache for session storage, query caching, and rate limiting","Optimize database connection pooling with PgBouncer"]),
        makeDay(334, "RAG", ["Integrate Advanced RAG Engine: PDF upload -> Chunking -> pgvector HNSW search -> Cohere Rerank","Generate streaming answers with clickable inline citations jumping to exact document page/sentence","Implement Hybrid Search combining BM25 keyword matching and dense vector search","Achieve 95%+ context precision and verify zero hallucinated citations"]),
        makeDay(335, "AI Agents", ["Integrate Autonomous AI Study Planner & Research Agent with Function Calling","Agent automatically evaluates study goals, available hours, and auto-generates customized 336-day roadmaps","Provide interactive streaming tool feedback during execution","Add Human-in-the-Loop review and approval step before plan commitment"]),
        makeDay(336, "Deployment & Portfolio", ["Deploy frontend to Vercel and backend services to AWS cloud infrastructure","Configure custom domain, SSL certificates, CloudWatch monitoring, and automated backups","Write flagship portfolio README.md with live demo link, architecture diagrams, and system design breakdown","Record professional video walkthrough demo presenting 12-month engineering journey"])
      ])
    ])
  ];

  const plan = {
    id: 'ai-web-dev-main-id',
    name: 'ai web dev (main)',
    description: '12-Month Job-Ready AI Full-Stack Roadmap | JavaScript, TypeScript, React, Next.js, Node/Express, SQL, Security, Docker, Cloud, Python, LLMs, RAG, AI Agents & System Design',
    category: 'ai-web-dev',
    color: '#3b82f6',
    icon: 'Sparkles',
    startDate: now,
    targetEndDate: '',
    pinned: true,
    archived: false,
    notes: 'AI WEB DEV (MAIN) — 12-Month Job-Ready Engineering Roadmap (336 Days)',
    studyHours: [],
    activities: [{ id: uid(), type: 'create', message: 'Plan "ai web dev (main)" created', timestamp: now }],
    createdAt: now,
    updatedAt: now,
    months: assignDates(rawMonths)
  };

  try {
    const plansKey = 'studyflow_plans';
    let plans = JSON.parse(localStorage.getItem(plansKey) || '[]');
    const existingIdx = plans.findIndex(p => p.id === 'ai-web-dev-main-id' || p.name === 'ai web dev (main)');
    if (existingIdx >= 0) {
      plans[existingIdx] = plan;
      console.log('✅ Updated existing plan "ai web dev (main)"');
    } else {
      plans.push(plan);
      console.log('✅ Added new plan "ai web dev (main)"');
    }
    localStorage.setItem(plansKey, JSON.stringify(plans));

    // Also update UI activePlanId
    const uiKey = 'studyflow_ui';
    let ui = JSON.parse(localStorage.getItem(uiKey) || '{}');
    ui.activePlanId = 'ai-web-dev-main-id';
    localStorage.setItem(uiKey, JSON.stringify(ui));

    console.log('🎉 Successfully seeded "ai web dev (main)" with 336 days! Refreshing page...');
    window.location.reload();
  } catch (err) {
    console.error('Error seeding plan:', err);
  }
})();
