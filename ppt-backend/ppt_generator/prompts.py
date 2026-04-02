from __future__ import annotations

try:
    from .syllabus_loader import build_syllabus_injection
except ImportError:
    try:
        from syllabus_loader import build_syllabus_injection
    except ImportError:
        def build_syllabus_injection(subject, topics, subtopics):
            return ""

# ==================================================
# SUBJECT CATEGORY MAP — COMPLETE (all 24 subjects)
# ==================================================
SUBJECT_CATEGORY_MAP: dict[str, str] = {
    # Programming subjects
    "programming principles and practice with c and c++":   "programming",
    "frontend developer (html, css, js)":                   "programming",
    "object oriented programming using java":               "programming_oop",
    "javascript web developer (advance js)":                "programming",
    "java web developer (spring boot)":                     "programming_springboot",
    "frontend developer (react js)":                        "programming_react",
    "backend development (nodejs & expressjs)":             "programming",
    "fullstack development (mern)":                         "programming",
    "advance backend development (golang)":                 "programming_golang",
    "mobile developer (android)":                           "programming_android",

    "database management system":                           "database",

    "computer organization and architecture":               "theory",
    "operating system":                                     "theory",
    "computer networks":                                    "theory",
    "network security":                                     "theory",

    "formal language and automata theory (flat)":           "flat",
    "formal language and automata theory":                  "flat",

    "python for data science":                              "ml_data",
    "fundamental of machine learning":                      "ml_data",
    "introduction to artificial intelligence":              "ml_data",
    "machine learning engineer":                            "ml_data",

    "data visualization using excel and powerbi":           "data_viz",

    "cloud computing and devops":                           "cloud_devops",

    "tech-product development":                             "tech_product",

    "software quality assurance":                           "sqa",

    "digital presence & strategic networking":              "non_technical",
    "essentials of digital marketing":                      "non_technical",
}

def get_subject_category(subject: str) -> str:
    return SUBJECT_CATEGORY_MAP.get(subject.lower().strip(), "theory")

# ===========================================================
# TOPIC NATURE SNIFFER
# Detects whether the current lecture topics/subtopics are
# theoretical, practical, or mixed — so content rules adapt
# dynamically rather than blindly forcing code onto every slide.
# ===========================================================

# Keywords that strongly signal a THEORETICAL / conceptual slide
_THEORY_SIGNALS = {
    "introduction", "intro", "overview", "history", "evolution", "motivation",
    "need for", "what is", "why", "importance", "significance", "background",
    "fundamentals", "basics", "concepts", "principles", "paradigm", "paradigms",
    "theory", "theoretical", "definition", "definitions", "terminology",
    "classification", "types of", "categories", "taxonomy", "architecture overview",
    "model", "models", "abstraction", "layers", "characteristics",
    "features", "advantages", "disadvantages", "limitations", "challenges",
    "comparison", "vs", "versus", "difference between", "differences",
    "lifecycle", "life cycle", "phases", "stages", "generations",
    "memory management", "scheduling", "process", "thread", "concurrency",
    "networking basics", "protocols", "osi", "tcp/ip", "layers",
    "cryptography", "security", "threats", "attacks", "vulnerabilities",
    "automata", "grammar", "language", "chomsky", "turing", "finite",
    "regular", "context free", "pushdown", "decidability", "complexity",
    "product thinking", "agile", "scrum", "kanban", "lean", "mvp",
    "testing methodology", "test plan", "sdlc", "stlc", "quality",
    "digital marketing", "seo", "branding", "networking", "linkedin",
    "cloud concepts", "virtualization", "containers", "devops culture",
    "data types", "variables", "operators", "expressions",          # early programming theory
    "logic gates", "boolean algebra", "combinational", "sequential",
    "flip flop", "registers", "memory", "cache", "pipeline",
    "normalization", "er diagram", "relational model", "keys",
    "sql basics", "nosql overview", "cap theorem", "acid",
}

# Keywords that strongly signal a PRACTICAL / hands-on slide
_PRACTICAL_SIGNALS = {
    "implementation", "implement", "coding", "program", "programming",
    "code", "syntax", "write a", "build", "create", "develop",
    "functions", "methods", "classes", "objects", "inheritance",
    "loops", "arrays", "pointers", "recursion", "sorting", "searching",
    "data structures", "linked list", "stack", "queue", "tree", "graph",
    "algorithm", "algorithms", "dynamic programming", "greedy",
    "query", "queries", "sql query", "joins", "crud", "transactions",
    "api", "rest", "endpoints", "routes", "controllers", "middleware",
    "hooks", "components", "state", "props", "redux",
    "goroutines", "channels", "concurrency", "async",
    "unit test", "test cases", "automation", "selenium", "pytest",
    "docker", "kubernetes", "yaml", "pipeline", "ci/cd", "deploy",
    "pandas", "numpy", "matplotlib", "sklearn", "model training",
    "neural network", "backpropagation", "gradient descent",
    "formula", "dax", "pivot", "charts", "dashboard",
    "android", "kotlin", "activity", "fragment", "layout",
    "spring boot", "annotations", "@restcontroller", "@getmapping",
}

def _sniff_topic_nature(topics: str, subtopics: str) -> str:
    """
    Returns 'theoretical', 'practical', or 'mixed' based on
    keyword analysis of the topics + subtopics strings.
    """
    combined = (topics + " " + subtopics).lower()

    theory_score   = sum(1 for kw in _THEORY_SIGNALS   if kw in combined)
    practical_score= sum(1 for kw in _PRACTICAL_SIGNALS if kw in combined)

    if theory_score == 0 and practical_score == 0:
        return "mixed"           # no strong signal → let LLM decide
    if practical_score == 0:
        return "theoretical"
    if theory_score == 0:
        return "practical"
    # Both present — whichever dominates by a margin
    if theory_score >= practical_score * 1.8:
        return "theoretical"
    if practical_score >= theory_score * 1.8:
        return "practical"
    return "mixed"

def _build_code_policy(topic_nature: str, category: str) -> str:
    """
    Generates a dynamic code/content policy block based on
    what the topic actually needs, not just the subject category.
    """
    no_code_categories = {"flat", "theory", "data_viz", "non_technical", "tech_product"}

    if category in no_code_categories:
        return ""   # these categories have their own hard rules, don't override

    if topic_nature == "theoretical":
        return """
        CODE POLICY FOR THIS LECTURE (topic-driven override):
        ⚠️  The topics/subtopics for THIS lecture are THEORETICAL / CONCEPTUAL in nature.
        - DO NOT force a code slide if it would feel artificial or out of place.
        - Instead of code, use: Definition: → Example: → Diagram (image object) → Real-world analogy.
        - If the topic NATURALLY leads to a short illustrative snippet (e.g. showing a syntax
          example to reinforce a concept), ONE brief code block is acceptable — but keep it
          to 5–10 lines maximum and label it as "Illustration:".
        - Prioritise diagrams and concept-explanation depth over code quantity.
        """
    elif topic_nature == "practical":
        return """
        CODE POLICY FOR THIS LECTURE (topic-driven override):
        ✅  The topics/subtopics for THIS lecture are PRACTICAL / HANDS-ON in nature.
        - EVERY topic slide MUST contain a real, compilable, well-commented code block.
        - Code must be complete enough to run — no stubs, no "// your code here".
        - Include expected output as a comment at the end of the code block.
        - After the code, add a "Common Mistake:" or "Exam Tip:" line.
        """
    else:  # mixed
        return """
        CODE POLICY FOR THIS LECTURE (topic-driven override):
        ↔️  This lecture mixes theory and practice.
        - On conceptual/introductory slides: use Definition + Example + Diagram (no forced code).
        - On implementation/syntax slides: include a full, compilable code block with comments.
        - Use your judgement per slide — code should appear ONLY when it genuinely illustrates
          the concept better than prose would. Aim for roughly 50% code slides, 50% concept slides.
        """

# ========================
# SUBJECT-SPECIFIC RULES
# ========================
def get_subject_specific_rules(subject: str, topic_nature: str = "mixed") -> str:
    category = get_subject_category(subject)

    # ── Universal comparison-table policy ──────────────────────────────────────
    COMPARISON_POLICY = """
        COMPARISON TABLE POLICY (applies to ALL subjects, ALL slides):
        Generate a Comparison: table ONLY when genuinely warranted:
            ✅ Slide title explicitly contains: "vs", "versus", "difference between",
               "compare", "types of", "when to use"
            ✅ The topic is inherently about choosing between two or more alternatives
            ✅ Special Requirements says "comparison tables"
        DO NOT generate a Comparison: table:
            ❌ Introduction, overview, history, motivation, or "what is X" slides
            ❌ Single-concept definition slides
            ❌ Slides that already have code, a diagram, or a dataset table
            ❌ Just because a comparison is theoretically possible
        TRUTH TABLES: generate whenever the topic involves logic gates, boolean algebra,
        combinational/sequential circuits, K-maps, or FSM input/output tabulation.
    """

    # ── Per-category rules ─────────────────────────────────────────────────────

    programming_rules = f"""
        PROGRAMMING / TECHNICAL SUBJECTS (C, C++, JS, Node.js, Express, MERN, Fullstack)

        {_build_code_policy(topic_nature, category)}

        GENERAL SLIDE PRINCIPLES:
        - Introduction / "what is X" / history slides → Definition + real-world analogy + diagram.
          No code required.
        - Syntax / implementation / algorithm slides → Full compilable code with inline comments
          + expected output as a comment.
        - Architecture / design slides → Diagram (image object) + brief prose explanation.
        - Every code block must use the correct language for this subject (see LANGUAGE RULE).
        - Comparison table: ONLY on slides that directly contrast two approaches
          (e.g. "Callbacks vs Promises", "for vs forEach", "var vs let vs const").
        """

    programming_oop_rules = f"""
        OOP — JAVA / C++

        {_build_code_policy(topic_nature, category)}

        GENERAL SLIDE PRINCIPLES:
        - "What is OOP / Paradigm / History" → Definition + 4-pillar overview + NO code.
        - Concept slides (Encapsulation, Abstraction, etc.) → Definition + analogy + short
          illustrative snippet (max 15 lines) showing ONLY that principle.
        - Design pattern / UML slides → UML diagram (image object) + explanation. Code optional.
        - Comparison slides only → "Abstract Class vs Interface", "Overloading vs Overriding" etc.
        UML image prompt template:
          "Clean UML Class Diagram on white background. Show [ClassName] box with sections for
           attributes (–name: Type) and methods (+method(): ReturnType). Draw inheritance arrow
           (solid line + hollow triangle) to [Parent]. Use standard UML notation."
        """

    programming_springboot_rules = f"""
        JAVA WEB — SPRING BOOT

        {_build_code_policy(topic_nature, category)}

        GENERAL SLIDE PRINCIPLES:
        - "What is Spring / MVC overview" slides → architecture diagram + prose, minimal code.
        - Annotation / endpoint / service slides → full Spring Boot code with ALL relevant
          annotations shown (@RestController, @GetMapping, @Service, @Autowired, etc.).
        - Request lifecycle slides → request-flow diagram (image object) + explanation.
        - Comparison: ONLY "Spring vs Spring Boot", "REST vs SOAP", "JPA vs JDBC" type slides.
        """

    programming_react_rules = f"""
        FRONTEND — REACT JS

        {_build_code_policy(topic_nature, category)}

        GENERAL SLIDE PRINCIPLES:
        - "What is React / Virtual DOM / JSX intro" → concept explanation + diagram, light code.
        - Hook / state / component slides → full JSX code with hooks shown correctly.
        - Component tree / data-flow slides → component hierarchy diagram (image object).
        - Comparison: ONLY "Class vs Functional", "useState vs useReducer", "REST vs GraphQL" etc.
        """

    programming_golang_rules = f"""
        ADVANCED BACKEND — GOLANG

        {_build_code_policy(topic_nature, category)}

        GENERAL SLIDE PRINCIPLES:
        - "Go history / philosophy / toolchain" → prose + comparison with other languages. No code.
        - Goroutine / channel / concurrency slides → full idiomatic Go code + goroutine diagram.
        - Error handling slides → demonstrate errors-as-values pattern explicitly.
        - Comparison: ONLY "Goroutines vs OS Threads", "Go vs Node.js" type slides.
        """

    programming_android_rules = f"""
        MOBILE — ANDROID

        {_build_code_policy(topic_nature, category)}

        GENERAL SLIDE PRINCIPLES:
        - "Android ecosystem / history / architecture overview" → diagram + prose. No code.
        - Activity / Fragment lifecycle slides → lifecycle diagram (image object) + lifecycle code.
        - UI slides → XML layout (prefix "XML-Layout:") PLUS corresponding Kotlin code.
        - Comparison: ONLY "Activity vs Fragment", "Kotlin vs Java", "ViewModel vs Activity" etc.
        """

    database_rules = f"""
        DATABASE (SQL + NoSQL)

        {_build_code_policy(topic_nature, category)}

        SLIDE PRINCIPLES BY TOPIC TYPE:
        - "What is DBMS / Relational model / Keys / Normalization theory" slides →
          Definition + ER diagram (image object) + tabular example. SQL query optional.
        - Query / CRUD / JOIN / Aggregation slides → Real SQL with sample table shown first,
          then the query, then the result. Prefix "SQL:".
        - NoSQL / MongoDB slides → BSON document (prefix "Document:") + query (prefix "MongoDB:").
        - Schema design / ER slides → ER diagram as image object.
        - Comparison: "SQL vs NoSQL", "Normalised vs Denormalised", "JOIN vs Embedding" ONLY.
        """

    theory_rules = f"""
        THEORY / SYSTEM SUBJECTS (OS, Computer Networks, Network Security, COA)
        (No code for these subjects — use diagrams, notation, and detailed prose.)

        SLIDE PRINCIPLES:
        - Write each slide like a professor explaining to a student — flowing prose, not a form
        - DO NOT mechanically stamp Definition:/Example:/Tip: on every slide
        - Open with WHY this concept matters or a concrete hook — not a labelled definition
        - Explain the concept clearly in 2-3 natural sentences
        - Follow with a real-world analogy or concrete example — no prefix label needed
        - Include a diagram (image object) whenever the topic has a visual structure:
            OS       → process state diagram, scheduling Gantt chart, memory map, page table
            CN       → OSI/TCP-IP layer stack, packet encapsulation, protocol handshake
            COA      → CPU datapath, pipeline stages, cache hierarchy, logic gate symbols
            NetSec   → encryption flow, TLS handshake, attack/defence diagram
        - Comparison table: ONLY for "Process vs Thread", "TCP vs UDP",
        "Symmetric vs Asymmetric", "RISC vs CISC", "Paging vs Segmentation" etc.
        - Each slide's last item should naturally bridge to the next slide's topic
        - If EXPLICIT SLIDE SCRIPTS are provided, follow them EXACTLY — they override everything
        """

    flat_rules = """
        FORMAL LANGUAGE AND AUTOMATA THEORY (FLAT)
        (Zero code slides — only formal mathematical notation.)

        REQUIRED NOTATION FORMATS (use EXACTLY these prefixes):
        FSM:
          FSM: States(q0,q1,q2) | Alphabet(0,1) | Start(q0) | Accept(q2)
               | Transitions: q0--0-->q0, q0--1-->q1, q1--0-->q2, q1--1-->q0

        Grammar:
          Grammar: S → aS | bA | ε,  A → bA | b   [Type: Regular / CFL / CSL / Unrestricted]

        PDA:
          PDA: (state, input_symbol, stack_top) → (next_state, push_string)
               | (q0,a,Z)→(q0,AZ), (q0,b,A)→(q1,ε), (q1,ε,Z)→(q2,Z)

        TM:
          TM: (state, read) → (new_state, write, direction)
              | (q0,a)→(q1,X,R), (q1,b)→(q2,Y,R), (q2,B)→(qf,B,R)

        Trace (MANDATORY on every automaton slide):
          Trace: Input="aabb" | q0 -a→ q1 | q1 -a→ q1 | q1 -b→ q2 | q2 -b→ q3
                 | Result: ACCEPTED ✓  (or REJECTED ✗ with reason)

        DIAGRAM: Include an FSM state-transition diagram (image object) on EVERY automata slide.
        Image prompt: "State transition diagram for DFA/NFA: circles for states, double-circle
        for accept state, arrow for start state, labelled directed edges for transitions.
        Clean white background, black ink, standard automata diagram style."

        COMPARISON TABLE: ONLY on "DFA vs NFA", "Regular vs CFL",
        "Mealy vs Moore", "Decidable vs Undecidable" slides.
        """

    ml_data_rules = f"""
        ML / AI / DATA SCIENCE

        {_build_code_policy(topic_nature, category)}

        SLIDE PRINCIPLES BY TOPIC TYPE:
        - "What is ML / AI / types of ML" → Definition + taxonomy diagram + NO code.
        - Algorithm concept slides (decision tree, SVM, k-means) → concept explanation +
          diagram (image object) + short Python code showing sklearn usage.
        - Model training / evaluation slides → Python code (full pipeline) + Eval: table.
        - Dataset exploration slides → Dataset: table (5–8 rows max) + brief code.
        - Math-heavy slides (gradient descent, loss functions) → formula in LaTeX-like notation
          inside the string, diagram, then optional code.
        DIAGRAM AUTO-TRIGGERS:
          Classification      → confusion matrix image
          Decision tree       → tree structure diagram
          Neural network      → layered architecture (input/hidden/output nodes)
          Clustering          → scatter plot with cluster boundaries
          ML pipeline         → end-to-end flowchart
          Bias-variance       → bias-variance tradeoff curve
        Comparison table: ONLY on "Supervised vs Unsupervised", "Precision vs Recall",
        "Overfitting vs Underfitting", "CNN vs RNN" type slides.
        """

    data_viz_rules = """
        DATA VISUALIZATION (Excel, Power BI)
        (No general-purpose code — Excel formulas and Power BI DAX only.)

        SLIDE PRINCIPLES:
        - Chart-type slides MUST include:
            a) When to use this chart (use case)
            b) When NOT to use this chart (anti-pattern)
            c) A chart diagram (image object) showing a sample of the chart
            d) Excel formula (prefix "Formula:") OR Power BI DAX (prefix "DAX:")
        - Dataset slides → Dataset: table (5–8 rows) + step-by-step instructions.
        - "What is Power BI / Excel / Data Viz" → Definition + real dashboard screenshot
          description + diagram. No formula needed.
        - Comparison: ONLY "Bar vs Column", "Power BI vs Tableau", "Pie vs Donut" etc.
        """

    cloud_devops_rules = f"""
        CLOUD COMPUTING & DEVOPS

        {_build_code_policy(topic_nature, category)}

        SLIDE PRINCIPLES BY TOPIC TYPE:
        - "What is Cloud / DevOps / Virtualization / Benefits" → Definition + diagram + prose.
          No YAML/CLI required on conceptual-only slides.
        - Service / deployment slides → real YAML config (prefix "YAML:") or CLI commands
          (prefix "CLI:"). No placeholder values — use realistic names and ports.
        - Cost / pricing slides → comparison table + real pricing examples.
        DIAGRAM AUTO-TRIGGERS:
          CI/CD pipeline      → Code → Build → Test → Deploy flow
          Docker              → container vs VM side-by-side architecture
          Kubernetes          → cluster: Master + Worker nodes + Pods + Services
          Cloud architecture  → service block diagram (VPC, EC2, RDS, S3 etc.)
          DevOps loop         → Plan → Code → Build → Test → Release → Deploy → Operate → Monitor
        Comparison: ONLY "Docker vs VM", "Jenkins vs GitHub Actions", "AWS vs Azure vs GCP" etc.
        """

    tech_product_rules = """
        TECH-PRODUCT DEVELOPMENT
        (No heavy code. Focus: product thinking, design, user research, MVP, agile.)

        SLIDE PRINCIPLES:
        - EVERY slide must connect theory to a REAL product (Slack, Figma, Uber, Notion, etc.)
        - Framework slides → Framework: Name|Step1|Step2|Step3|Outcome table
        - Case study slides → Case: Product|Problem|Solution|Metric|Takeaway table
        - User story slides → plain text: "As a [user], I want [action] so that [benefit]"
        - Sprint / roadmap slides → Table: Sprint|Goal|Stories|Deliverable
        - Wireframe / UI slides → describe the layout as structured text + image for mockup
        DIAGRAM AUTO-TRIGGERS:
          Product lifecycle   → lifecycle stages diagram
          User journey        → journey map (Awareness → Consideration → Decision → Retention)
          MVP loop            → Build → Measure → Learn cycle
          Agile sprint        → Kanban / Scrum board diagram
          Architecture        → system architecture block diagram
        Comparison: ONLY "Waterfall vs Agile", "MVP vs MLP", "Lean vs Design Thinking" etc.
        """

    sqa_rules = f"""
        SOFTWARE QUALITY ASSURANCE

        {_build_code_policy(topic_nature, category)}

        SLIDE PRINCIPLES BY TOPIC TYPE:
        - "What is QA / Testing / SDLC / STLC" → Definition + lifecycle diagram. No code.
        - Testing technique slides → Definition + REAL example test case + When to use.
        - Automation slides → real Selenium / Pytest / Cypress code (prefix "Code:").
        TABLE FORMATS (use whichever fits the slide):
          Test case     → Table: Test ID | Description | Input | Expected Output | Status
          Defect report → Table: Bug ID | Severity | Priority | Description | Steps
          Traceability  → Table: Requirement | Test Case | Status
          Metrics       → Metrics: Metric|Value||Coverage|85%||Defect Density|0.5/KLOC
        DIAGRAM AUTO-TRIGGERS:
          Testing levels    → V-Model or Testing Pyramid
          Bug lifecycle     → state transition: New→Open→Fixed→Verified→Closed
          Test lifecycle    → STLC phases diagram
          CI/CD testing     → pipeline diagram with test gate stages
        Comparison: ONLY "Black Box vs White Box", "Manual vs Automation",
        "Smoke vs Sanity", "Verification vs Validation" etc.
        """

    non_technical_rules = """
        NON-TECHNICAL / DIGITAL / MARKETING SUBJECTS
        (No code slides at all.)

        SLIDE PRINCIPLES:
        - EVERY slide must include ONE real statistic or industry data point (with source).
        - Strategy slides → Framework: table
        - Campaign / brand slides → Case: table
        - Performance / KPI slides → Metrics: table
        DIAGRAM AUTO-TRIGGERS:
          Marketing funnel    → funnel diagram (Awareness → Interest → Desire → Action)
          SEO flow            → content → crawl → index → rank diagram
          Social media        → platform reach/engagement comparison chart
          Customer journey    → journey map
        Comparison: ONLY "Organic vs Paid", "SEO vs SEM", "B2B vs B2C" etc.
        """

    rules_map: dict[str, str] = {
        "programming":            programming_rules,
        "programming_oop":        programming_oop_rules,
        "programming_springboot": programming_springboot_rules,
        "programming_react":      programming_react_rules,
        "programming_golang":     programming_golang_rules,
        "programming_android":    programming_android_rules,
        "database":               database_rules,
        "theory":                 theory_rules,
        "flat":                   flat_rules,
        "ml_data":                ml_data_rules,
        "data_viz":               data_viz_rules,
        "cloud_devops":           cloud_devops_rules,
        "tech_product":           tech_product_rules,
        "sqa":                    sqa_rules,
        "non_technical":          non_technical_rules,
    }
    return COMPARISON_POLICY + rules_map.get(category, theory_rules)

# ===================================================
# CODE LANGUAGE RULES — Complete for all 24 subjects
# ===================================================
def get_code_language_rule(subject: str) -> str:
    lang_map: dict[str, str] = {
        "python for data science":                            "Python (pandas, numpy, matplotlib, scikit-learn)",
        "fundamental of machine learning":                    "Python (scikit-learn, numpy, pandas)",
        "machine learning engineer":                          "Python (scikit-learn, tensorflow, or pytorch)",
        "introduction to artificial intelligence":            "Python (relevant AI/ML libraries)",
        "java web developer (spring boot)":                   "Java (Spring Boot framework)",
        "object oriented programming using java":             "Java",
        "advance backend development (golang)":               "Go (Golang)",
        "mobile developer (android)":                         "Kotlin (preferred) or Java for Android",
        "frontend developer (react js)":                      "JavaScript / JSX (React)",
        "frontend developer (html, css, js)":                 "HTML, CSS, and JavaScript",
        "javascript web developer (advance js)":              "JavaScript (ES6+)",
        "backend development (nodejs & expressjs)":           "JavaScript (Node.js + Express)",
        "fullstack development (mern)":                       "JavaScript (React frontend, Node.js/Express backend, MongoDB queries)",
        "programming principles and practice with c and c++": "C and C++",
        "database management system":                         "SQL (MySQL/PostgreSQL) for relational; MongoDB syntax for NoSQL",
        "cloud computing and devops":                         "YAML (Docker/K8s/GitHub Actions) and Bash/CLI commands",
        "computer networks":                                  "No code — use diagrams and protocol descriptions",
        "network security":                                   "No code — use diagrams and encryption/protocol flow descriptions",
        "operating system":                                   "No code — use diagrams and concept explanations",
        "computer organization and architecture":             "No code — use diagrams and register-level descriptions",
        "formal language and automata theory (flat)":         "No code — use FSM/Grammar/PDA/TM formal notation",
        "formal language and automata theory":                "No code — use FSM/Grammar/PDA/TM formal notation",
        "digital presence & strategic networking":            "No code — use case studies and strategy frameworks",
        "essentials of digital marketing":                    "No code — use case studies and metrics tables",
        "data visualization using excel and powerbi":         "Excel Formulas (prefix Formula:) and Power BI DAX (prefix DAX:) — no general-purpose code",
        "tech-product development":                           "No code — use product frameworks, case studies, user stories, wireframe descriptions",
        "software quality assurance":                         "Test code in Python (pytest) or Java (JUnit) or JavaScript (Jest/Cypress) as appropriate",
    }
    lang = lang_map.get(subject.lower().strip(), "the most appropriate language for this subject")
    return f"\n    MANDATORY LANGUAGE RULE: Always use {lang}. Do NOT switch languages mid-lecture.\n"

# ============================
# BLOOM'S TAXONOMY QUIZ RULES
# ============================
def get_bloom_quiz_rule() -> str:
    return """
    QUIZ — BLOOM'S TAXONOMY (STRICT — EXACTLY 5 questions):
    Q1 → Remember    (recall a fact, definition, or term from this lecture)
    Q2 → Understand  (explain the concept in your own words / give an example)
    Q3 → Apply       (use the concept to solve a concrete scenario)
    Q4 → Analyze     (compare, trace, break down, find the error)
    Q5 → Evaluate/Create (judge the best approach, design a solution, critique a decision)

    FORMAT (one string per question, pipe-separated):
    "Q: [question text] | Options: (A) opt1; (B) opt2; (C) opt3; (D) opt4 | Answer: [A/B/C/D] | Explanation: [why correct AND why others are wrong]"

    QUALITY RULES:
    - Questions test ONLY concepts covered in THIS lecture
    - Every distractor (wrong option) must be a plausible mistake a student would make
    - Explanation must state WHY the correct answer is right AND briefly why others are wrong
    - No trivially obvious or trick questions
    - Q4 and Q5 must require genuine analysis — not just recall with extra words
    """

# ===============================
# DURATION → SLIDE COUNT MAPPING
# ===============================
def _duration_to_slide_guidance(duration: int) -> str:
    if duration <= 30:
        min_topics, max_topics = 3, 5
        depth = "concise — 2-3 content items per slide, direct and focused"
    elif duration <= 45:
        min_topics, max_topics = 4, 7
        depth = "moderate — 3-4 content items per slide with one worked example"
    elif duration <= 60:
        min_topics, max_topics = 5, 10
        depth = "thorough — 4-5 content items per slide, full examples, real-world context"
    elif duration <= 90:
        min_topics, max_topics = 7, 14
        depth = "comprehensive — 5-6 items per slide, multiple examples, diagrams encouraged"
    else:
        min_topics, max_topics = 10, 20
        depth = "highly detailed — deep explanations, several examples, connect to broader course"

    return f"""
        SLIDE COUNT GUIDANCE (based on {duration}-minute lecture):
        - Generate {min_topics}–{max_topics} topic slides
        - Each subtopic / concept gets its OWN dedicated slide (do not merge unrelated concepts)
        - Content depth per slide: {depth}
        - Aim for roughly {min_topics + 4}–{max_topics + 6} total slides
          (cover + recap + agenda + topics + quiz + summary)
        - Do NOT pad with filler — every slide must earn its place
    """

# ===================================================
# SLIDE STRUCTURE GUIDANCE — DYNAMIC BY TOPIC NATURE
# ===================================================
def _build_slide_structure_guidance(topic_nature: str) -> str:
    """
    Returns dynamic slide structure instructions based on topic nature.
    Instead of a rigid 7-position template applied to every slide,
    Gemini gets TYPE-SPECIFIC instructions so each slide tells its
    own story in the most effective way for that concept.
    """

    # ── Title rules apply universally ──────────────────────────────────────
    title_rules = """
        TITLE QUALITY RULES (apply to every slide):
        - Titles must be SPECIFIC: "Compiler — Batch Translation Process" not "Compiler"
        - Use " — " for sub-specification: "Translators — Compiler vs Interpreter"
        - Never repeat the same title on two slides
        - Do NOT use generic titles like "Introduction", "Overview", "Details"
    """

    # ── Slide count enforcement ─────────────────────────────────────────────
    slide_count_rule = """
        ONE SLIDE PER CONCEPT — MANDATORY:
        - Every distinct concept, tool, or subtopic listed gets its OWN dedicated slide
        - NEVER merge two different concepts onto one slide
        - Example: "Assembler", "Compiler", "Interpreter" = 3 separate slides, NOT 1
        - Example: "MLL", "ALL", "HLL" = 3 separate slides, NOT 1
        - Example: "Unstructured", "Structured", "OOP" paradigms = 3 separate slides
    """

    # ── Per-type dynamic structure ──────────────────────────────────────────
    if topic_nature == "theoretical":
        structure = """
        SLIDE CONTENT STRUCTURE — THEORETICAL LECTURE:
        Each slide is a JSON array. Build it like a mini-lesson, NOT a template:

        CONCEPT / DEFINITION SLIDES (e.g. "What is a Compiler"):
          ["Slide Title",
           "Hook sentence — why this matters or a surprising fact about it",
           "Definition: [precise 1-line formal definition]",
           "How it works — step by step in plain English (2-3 sentences)",
           {"image": ...} OR "Analogy: [real-world comparison that clicks instantly]",
           "Real-world use case: [specific product/company/technology that uses this]",
           "Exam Tip: OR Common Mistake: [most common confusion students have]"]

        COMPARISON / CONTRAST SLIDES (e.g. "Compiler vs Interpreter"):
          ["Slide Title",
           "Why this comparison matters — what decision it helps make",
           "Definition: [define both sides briefly]",
           "Key difference in ONE sentence",
           "Comparison: [table with meaningful rows, not just names]",
           "Real-world use case: [one example for each side]",
           "Exam Tip: [most tested aspect of this comparison]"]

        PROCESS / FLOW SLIDES (e.g. "How a Compiler Works"):
          ["Slide Title",
           "What problem this process solves",
           "The stages/steps listed clearly",
           {"image": {"type": "diagram", "prompt": "detailed flowchart/pipeline description"}},
           "What each stage produces (input → output for each step)",
           "Real-world use case: [GCC, Python interpreter, JVM etc.]",
           "Common Mistake: [most misunderstood step]"]

        CLASSIFICATION SLIDES (e.g. "Types of Programming Languages"):
          ["Slide Title",
           "Why classification exists — what problem it solves",
           "The categories with ONE defining characteristic each",
           "Comparison: [table comparing the categories on key dimensions]",
           "Example for each category with a real language name",
           "Real-world use case: [when you'd choose each type]",
           "Exam Tip: [key fact students always get wrong]"]

        ❌ DO NOT apply the same structure to every slide.
        ❌ DO NOT add a code block on concept/definition slides.
        ✅ Match the structure type to what the slide is actually teaching.
        """

    elif topic_nature == "practical":
        structure = """
        SLIDE CONTENT STRUCTURE — PRACTICAL LECTURE:
        Each slide is a JSON array. Build it like a hands-on tutorial, NOT a template:

        SYNTAX / FEATURE SLIDES (e.g. "for loop syntax"):
          ["Slide Title",
           "What problem this syntax solves in 1-2 sentences",
           "Definition: [syntax pattern with placeholder names]",
           "Code: [complete, compilable, well-commented example with output]",
           "Step-by-step walkthrough of what each line does",
           "Real-world use case: [where this appears in real software]",
           "Common Mistake: [the bug beginners always write]"]

        ALGORITHM / PROBLEM-SOLVING SLIDES:
          ["Slide Title",
           "Problem statement — what we are trying to solve",
           "Approach / logic before showing code",
           "Code: [full solution with inline comments explaining each step]",
           "Trace: [walk through the code with a specific input showing each step]",
           "Real-world use case: [where this algorithm appears in practice]",
           "Common Mistake: [off-by-one, edge case, or logic error to avoid]"]

        COMPARISON SLIDES (e.g. "Pass by Value vs Pass by Address"):
          ["Slide Title",
           "Why this distinction matters — what goes wrong if confused",
           "Comparison: [table contrasting both on key dimensions]",
           "Code: [side-by-side example showing both with output]",
           "Memory diagram description or image object",
           "Real-world use case: [when to use each]",
           "Common Mistake: [the exact mistake beginners make]"]

        ❌ DO NOT omit the code block on practical slides.
        ✅ Every code block must have expected output as a comment.
        """

    else:  # mixed
        structure = """
        SLIDE CONTENT STRUCTURE — MIXED LECTURE:
        Each slide should be structured based on what IT is teaching, not a universal template.

        For CONCEPTUAL slides in this lecture:
          → Use the theoretical structure: hook → definition → how-it-works → diagram/analogy
          → No forced code on concept-only slides

        For PRACTICAL slides in this lecture:
          → Use the practical structure: problem → code → trace → mistake
          → Full compilable code with output comments

        For COMPARISON slides:
          → Lead with WHY the comparison matters → Comparison: table → example for each

        GENERAL RULES:
        - Ask yourself: "What is the BEST way to teach THIS specific concept?"
        - A slide about what a pointer IS → theoretical structure
        - A slide about HOW TO USE a pointer → practical structure
        - A slide about pointer vs array → comparison structure
        - Mix structures freely across slides in the same lecture
        """

    return title_rules + slide_count_rule + structure

# ==================================
# SPECIAL REQUIREMENTS INTERPRETER
# ==================================
def _build_special_req_guidance(special_requirements: str) -> str:
    if not special_requirements or not special_requirements.strip():
        return ""

    sr = special_requirements.lower().strip()
    lines = ["        --------------------------------------------------",
             "        SPECIAL REQUIREMENTS (HIGHEST PRIORITY — override subject rules):",
             "        --------------------------------------------------"]

    if any(kw in sr for kw in ["more example", "extra example", "examples"]):
        lines.append("        ✅ EXAMPLES: Add 2–3 real-world examples per slide. Use 'Example:' prefix.")
    if any(kw in sr for kw in ["comparison", "compare", "contrast"]):
        lines.append("        ✅ COMPARISONS: Add a Comparison: table on EVERY slide where contrast is meaningful.")
    if any(kw in sr for kw in ["detail", "in depth", "deep", "elaborate"]):
        lines.append("        ✅ DEPTH: Expand every concept with deeper coverage. Add theory behind the concept.")
    if any(kw in sr for kw in ["diagram", "visual", "chart", "image"]):
        lines.append("        ✅ DIAGRAMS: Include an image object on every slide that has a visual structure.")
    if any(kw in sr for kw in ["simple", "easy", "beginner", "basic"]):
        lines.append("        ✅ SIMPLICITY: Use plain English. Define all technical terms inline. Avoid jargon.")
    if any(kw in sr for kw in ["industry", "real world", "practical application"]):
        lines.append("        ✅ INDUSTRY FOCUS: Every slide must include a real company/product use case.")
    if any(kw in sr for kw in ["exam", "viva", "interview", "mcq"]):
        lines.append("        ✅ EXAM FOCUS: Add 'Exam Tip:' on every slide. Make quiz questions exam-pattern ready.")
    if any(kw in sr for kw in ["code", "implementation", "programming"]):
        lines.append("        ✅ CODE FOCUS: Every non-introductory slide MUST have a full code block.")

    # Always pass through the raw text too, so LLM gets full context
    lines.append(f"        Raw faculty instruction (follow literally): \"{special_requirements.strip()}\"")
    lines.append("        --------------------------------------------------")
    return "\n".join(lines)

# ======================
# MAIN PROMPT BUILDER
# ======================
def build_prompt(subject: str, topics: str, subtopics: str,
                 previousLecture: str, duration: int, specialRequirements: str) -> str:
 
    # ── Sniff what kind of lecture this actually is ────
    topic_nature = _sniff_topic_nature(topics, subtopics)
 
    subject_rules      = get_subject_specific_rules(subject, topic_nature)
    code_language_rule = get_code_language_rule(subject)
    bloom_quiz_rule    = get_bloom_quiz_rule()
    slide_guidance     = _duration_to_slide_guidance(duration)
    slide_structure    = _build_slide_structure_guidance(topic_nature)
    special_req_block  = _build_special_req_guidance(specialRequirements)
 
    # ── Syllabus-specific injection (highest priority content rules) ─────────
    syllabus_block = build_syllabus_injection(subject, topics, subtopics)
 
    # ── Recap logic ─────
    skip_recap_keywords = ["first lecture", "no recap", "first class", "none", "n/a", "na"]
    prev_lower = (previousLecture or "").lower().strip()
    if not prev_lower or any(kw in prev_lower for kw in skip_recap_keywords):
        recap_instruction = 'RECAP: This is the FIRST lecture. OMIT the "recap" key entirely from JSON.'
    else:
        recap_instruction = (
            f'RECAP: Generate 5–7 concise bullet points summarising key concepts from '
            f'"{previousLecture}". Each point must also draw a bridge/connection to today\'s topic.'
        )
 
    # Pick flowing example based on topic nature
    if topic_nature == "theoretical":
        _slide_example = (
            '"Translators — Compiler: The Batch Translation Engine",'
            '"Every C program you write cannot run until a translator converts it to binary. '
            'The Compiler is the heavyweight translator — it reads your ENTIRE source file before producing a single byte of output.",'
            '"How it works in stages: .c file → Preprocessor (expands #include/#define) → '
            'Compiler (converts to assembly .s) → Assembler (.o object code) → Linker (combines with libraries) → .exe executable. '
            'Each stage catches different errors. One syntax error means zero output produced.",'
            '{"image": {"type": "diagram", "prompt": "Compilation pipeline left-to-right: '
            'Source Code (.c) → [Preprocessor] → Expanded Code (.i) → [Compiler] → Assembly (.s) → '
            '[Assembler] → Object Code (.o) → [Linker + Library Files] → Executable (.exe). '
            'Rectangular boxes connected by arrows, each arrow labeled with file extension. '
            'Clean white background, blue boxes, black arrows.", "placement": "right"}},'
            '"The payoff: once compiled, the .exe runs at full hardware speed — no translator present at runtime. '
            'GCC compiles the Linux kernel, Windows NT, and every major game engine. '
            'This is why C remains the language of performance-critical systems 50 years after its creation.",'
            '"This batch approach is the opposite of how an Interpreter works. '
            'Where a Compiler translates everything upfront, the Interpreter makes the trade-off of translating at runtime — which we cover next."'
        )
    else:
        _slide_example = (
            '"Loops in C — The for Loop",'
            '"When you need to repeat an action a known number of times, the for loop packs initialization, condition, and update into one clean line.",'
            '"Syntax: for (init; condition; update) {{ body }}. Order of execution: init once → check condition → body → update → check again. Stops when condition is false.",'
            '"Code: #include <stdio.h>\\nint main() {{\\n    for (int i = 1; i <= 5; i++) {{\\n        printf(\\"%d \\", i);\\n    }}\\n    printf(\\"\\\\n\\");\\n    return 0;\\n}}\\n// Output: 1 2 3 4 5",'
            '"Common Mistake: i <= 5 prints 1-5, i < 5 prints 1-4. Off-by-one errors are the most frequent loop bug in C. Always trace through the boundary condition manually.",'
            '"The for loop handles known iteration counts. When the count is unknown — like reading until the user types quit — the while loop is the better tool. That is covered next."'
        )
 
    json_example = f"""
    EXAMPLE showing EXPECTED CONTENT STYLE — flowing narrative, no rigid label-stamping:
    {{{{
      "agenda": ["Understand how translators convert HLL to machine code", "Distinguish compiler vs interpreter trade-offs"],
      "topics": [
        [{_slide_example}]
      ],
      "quiz": [
        "Q: What does a compiler produce that an interpreter does not? | Options: (A) Source code; (B) Bytecode; (C) Standalone executable; (D) Assembly mnemonics | Answer: C | Explanation: A compiler produces a .exe that runs without the compiler present. An interpreter produces no output file — it translates and executes simultaneously. Options A, B, D are wrong because source code is the input, bytecode is Java-specific, and assembly is an intermediate stage. | Bloom: Understand"
      ],
      "summary": ["Compilers trade upfront translation time for fast runtime execution.", "The right translator choice depends on whether you need performance (compiler) or flexibility (interpreter).", "These fundamentals determine every language decision in professional software engineering."]
    }}}}
 
    WHAT MAKES THIS STYLE CORRECT:
    ✅ EXACTLY 5-6 content strings per topic array (never more — prevents overflow)
    ✅ No Definition:/Example:/Tip:/Use Case: labels stamped mechanically on every slide
    ✅ Each string flows into the next — reads like a teacher explaining, not filling a form
    ✅ The LAST string bridges to the next slide: "...which we cover next"
    ✅ Content type drives structure — a process slide walks stages, a comparison slide contrasts
    ✅ Labels like "Common Mistake:" appear ONLY when they genuinely add value for that slide
    ✅ Each content string is SPECIFIC with concrete details — not generic one-liners
    """
 
    return f"""
        ABSOLUTE OUTPUT RULES — READ BEFORE ANYTHING ELSE:
        1. Output ONLY a raw JSON object — no markdown fences (```), no preamble, no explanation
        2. No trailing commas anywhere | No unescaped double-quotes inside string values
        3. Use \\n for line breaks inside strings (never literal newlines inside JSON strings)
        4. First character of your response MUST be {{ and last MUST be }}
        5. All keys must be present: "agenda", "topics", "quiz", "summary"
        (include "recap" only if this is NOT the first lecture)
        
        ═════════════════
        ROLE & CONTEXT
        ═════════════════
        You are a senior B.Tech professor, curriculum designer, and industry mentor at an
        accredited Indian engineering college (NIT/IIT equivalent standard).
        
        This content will be rendered directly into a professional lecture PowerPoint for
        students. Quality bar: every slide must be worth 3–5 minutes of classroom discussion.
        
        ════════════════════
        LECTURE PARAMETERS
        ════════════════════
        Subject:              {subject}
        Topics:               {topics}
        Subtopics:            {subtopics}
        Previous Lecture:     {previousLecture}
        Duration:             {duration} minutes
        Special Requirements: {specialRequirements}
        
        Detected lecture nature: {topic_nature.upper()}
        (This detection drives code/diagram/table decisions — see CODE POLICY below)
        
        {slide_guidance}
        
        {code_language_rule}
        
        {recap_instruction}
 
        ══════════════════════════════════════════════
        STRICT TOPIC BOUNDARY — HIGHEST PRIORITY RULE
        ══════════════════════════════════════════════
        Generate slides ONLY for what is explicitly listed in Subtopics above.
        This is non-negotiable. Every slide must map directly to a listed subtopic.
 
        ALLOWED: slides whose title directly corresponds to a listed subtopic.
        FORBIDDEN: slides on topics NOT in the Subtopics list — even if they are
        from the same chapter, seem logically related, or are covered in the syllabus block.
 
        CONCRETE VIOLATIONS TO AVOID:
        - User passes "Requirements Analysis, Conceptual Design, Logical Design, Physical Design"
          WRONG: generating slides on Schemas, DDL/DML, Codd Rules (not in subtopics list)
          RIGHT: generate exactly 4 slides — one per listed subtopic, nothing else
        - User passes "AND Gate, OR Gate, NOT Gate"
          WRONG: generating slides on XOR, Boolean Algebra, NAND Universality
          RIGHT: generate exactly 3 slides — one per listed subtopic, nothing else
 
        IF SUBTOPICS IS EMPTY: use Topics field only to determine content scope.
        IF EXPLICIT SLIDE SCRIPTS are provided below: follow them exactly, no additions.
        Agenda must list ONLY the subtopics being covered in this specific lecture.
        ═══════════════════════════════════════════════════════════
 
        SLIDE CONTENT FREEDOM — CRITICAL
        ═════════════════════════════════
        DO NOT apply a uniform template to every slide.
        BANNED on every slide unless the topic genuinely needs it:
        ❌ Do NOT start every slide with "Definition:" as a labelled prefix
        ❌ Do NOT end every slide with "Tip:" or "Exam Tip:" as a labelled suffix
        ❌ Do NOT add "Use Case:" as a mandatory section on every slide
        ❌ Do NOT add "Common Mistake:" on every slide — only where truly relevant
 
        INSTEAD — write each slide like an expert teacher explaining that specific concept:
        ✅ Use NATURAL PROSE that flows from one point to the next
        ✅ Use the labels (Definition:, Example:, Tip:) ONLY when that label genuinely
           adds value for that specific slide
        ✅ Let the CONTENT TYPE determine the slide structure, not a fixed template
        ✅ A process/flow slide should walk through stages — not force a Definition first
        ✅ A comparison slide should lead with WHY the comparison matters — not a label
 
        If EXPLICIT SLIDE SCRIPTS are provided below, follow them EXACTLY.
        The scripts override ALL other structure instructions.
        ═══════════════════════════════════════════════════════════
 
        SLIDE CONTENT BUDGET — MANDATORY (prevents overflow):
        ═══════════════════════════════════════════════════════════
        Each topic array (after the title) must have EXACTLY 4 to 6 content items.
        NEVER put more than 6 items in a single topic array.
        Each content item must be ONE of:
          - A single sentence or 2 sentences MAX (prose)
          - A code block (Code: prefix)
          - An image object
          - A table (Comparison:/Table: prefix)
        If you have more to say, split it into a SECOND topic slide with a different angle,
        not a continuation. Example: Split "Compiler — How It Works" and "Compiler — Why It Matters"
        rather than putting 9 bullets in one slide that overflows.
 
        CONTENT DEPTH REQUIREMENT — each item must be SPECIFIC not generic:
        ❌ "The compiler translates source code" — too vague, student learns nothing new
        ✅ "GCC takes hello.c through 4 stages: preprocessor → compiler → assembler → linker, 
            each producing .i → .s → .o → a.out files"
        ❌ "OOP uses encapsulation" — every textbook says this
        ✅ "Encapsulation means a BankAccount class owns its balance variable — no outside 
            function can change it without calling deposit() or withdraw()"
        Make every sentence teach something the student can use or remember.
        ═══════════════════════════════════════════════════════════
 
        {special_req_block}
        
        {syllabus_block}
        
        ════════════════════════════════
        SUBJECT-SPECIFIC CONTENT RULES
        ════════════════════════════════
        {subject_rules}

        ═══════════════════════════════════════════════════════════
        IMAGE / DIAGRAM GENERATION POLICY — STRICTLY ENFORCED
        ═══════════════════════════════════════════════════════════

        STEP 1 — SHOULD THIS SLIDE HAVE AN IMAGE AT ALL?
        Generate an image ONLY when ALL three conditions are true:
        ✅ The concept has a genuine visual structure (flowchart, architecture, cycle, diagram)
        ✅ A diagram would teach something that prose or a table CANNOT explain as effectively
        ✅ The slide does NOT already have a Code: block or Comparison: table

        If any condition is false → skip the image entirely. Use prose or a table instead.

        ───────────────────────────────────────────────────────────
        STEP 2 — PRE-GENERATION CHECKLIST (run before writing image prompt)
        ───────────────────────────────────────────────────────────
        Answer these questions. If ANY answer is YES → do NOT generate image:

        Q1. Will this image show real people, real places, real objects, or real equipment?
        Q2. Is this a photo, artistic illustration, 3D render, or cinematic visual?
        Q3. Does this slide already have a Code: block or Comparison: table?
        Q4. Is this an introduction, definition, or concept-only slide where prose is enough?
        Q5. Does my image prompt contain any of these words:
            glowing / neon / dramatic / cinematic / futuristic / realistic / sleek /
            professional / modern / high-tech / illuminated / dark background / sci-fi

        If ALL five answers are NO → proceed to Step 3.
        If ANY answer is YES → DELETE the image object. Do not generate it.

        ─────────────────────────────────────────────
        STEP 3 — WHAT A VALID DIAGRAM MUST LOOK LIKE
        ─────────────────────────────────────────────
        ONLY these diagram styles are acceptable:
        ✅ White or light grey background — always
        ✅ Simple geometric shapes only: rectangles, circles, cylinders, diamonds, arrows
        ✅ Each shape has a short black text label
        ✅ Shapes connected by plain lines or arrows with direction labels
        ✅ Looks like a textbook or engineering diagram — clean, minimal, academic

        THESE ARE BANNED — if your prompt describes any of these, delete the image:
        ❌ Glowing lights, neon effects, halos, or dramatic lighting
        ❌ Dark or black backgrounds
        ❌ Sci-fi, cinematic, or futuristic visuals
        ❌ Real-world photos (offices, people, servers, buildings, equipment)
        ❌ Artistic illustrations or 3D renders of any kind
        ❌ Abstract decorative art (gears, circuits, glowing network nodes)
        ❌ Organizational chart photos taken from whiteboards, screens, or posters
        ❌ Any image that looks like a poster, advertisement, or product visual

        ───────────────────────────────
        STEP 4 — ALLOWED DIAGRAM TYPES
        ───────────────────────────────
        Only generate images for these concept types:
        ✅ Architecture diagrams — Client-Server, OSI layers, CPU pipeline, memory hierarchy
        ✅ Process/flow diagrams — compilation pipeline, request-response, event loop, boot sequence
        ✅ Data structure diagrams — linked list, tree, graph, stack, queue, heap
        ✅ State/transition diagrams — FSM, process lifecycle, TCP handshake timeline
        ✅ Network/topology diagrams — star, mesh, bus, ring drawn with circles and lines
        ✅ Mathematical/logical diagrams — logic gate circuits, K-map, truth table layout

        ────────────────────────────────────────────────
        STEP 5 — THE ONLY ACCEPTABLE IMAGE PROMPT FORMAT
        ────────────────────────────────────────────────
        Every image prompt MUST follow this template exactly:

        "Clean technical diagram on plain white background. [Describe shapes: rectangles/
        circles/arrows]. Each shape labeled with [specific names]. Connected by [plain lines/
        arrows with labels]. No gradients, no shadows, no glow effects, no decorative elements,
        no real-world objects, no dark background."

        EXAMPLE of a correct prompt:
        "Clean technical diagram on plain white background. Five circles labeled Bus, Ring,
        Star, Mesh, Tree arranged in a row. Each circle contains a small node-and-line
        topology sketch inside it. Plain black labels below each circle. No gradients,
        no shadows, no glow effects, no decorative elements."

        EXAMPLE of a WRONG prompt (delete this type):
        "A futuristic mesh network with glowing interconnected nodes on a dark background,
        showing high-tech connectivity between 5 devices with neon light trails."

        ─────────────────────────────
        FINAL RULES — NON-NEGOTIABLE
        ─────────────────────────────
        - One image per slide maximum
        - If slide has Code: block → no image, even if syllabus requires one
        - If slide has Comparison: table → no image
        - Image prompt containing banned words → delete the entire image object
        - When in doubt → skip the image, use a Comparison: table instead
        ═══════════════════════════════════════════════════════════

        ═════════════════════════
        CONTENT FORMAT REFERENCE
        ═════════════════════════
        
        CODE / NOTATION BLOCKS (use prefix, \\n for newlines, NO markdown fences):
        Code:      → general code (C, Java, Python, JS, Go, Kotlin etc.)
        SQL:       → SQL queries
        YAML:      → YAML configs (Docker, Kubernetes, CI/CD)
        CLI:       → terminal/bash commands
        Document:  → MongoDB BSON document
        MongoDB:   → MongoDB queries/aggregations
        Formula:   → Excel formulas
        DAX:       → Power BI DAX expressions
        FSM:       → finite state machine notation
        Grammar:   → formal grammar production rules
        Trace:     → step-by-step execution trace
        PDA:       → pushdown automaton transitions
        TM:        → Turing machine transitions
        XML-Layout:→ Android XML layout

        CRITICAL CODE RULE — STRICTLY ENFORCED:
        Any code snippet MUST use one of the prefixes above. NEVER write code as plain bullet text.
        BANNED: Illustration: function add(a,b) {{ return a+b; }}
        BANNED: Example: for(let i=0; i<n; i++) {{ ... }}
        BANNED: Writing raw code lines as a string without any prefix
        CORRECT: Code: function add(a, b) {{\\n    return a + b;\\n}}
        The word Illustration: is COMPLETELY BANNED from the output.
        If you want to show an example of code, use Code: prefix — always.
        

        TABLE BLOCKS (|| separates rows, | separates cells):
        Comparison: Feature | Option A | Option B || Row1 | val | val
        Dataset:    Col1 | Col2 | Label || v1 | v2 | class
        Eval:       Metric | Value || Accuracy | 0.94 || F1 | 0.89
        Table:      H1 | H2 | H3 || r1c1 | r1c2 | r1c3
        Case:       Product | Problem | Solution | Metric || ...
        Framework:  Name | Step1 | Step2 | Step3 || ...
        Metrics:    Metric | Definition | Benchmark || ...
        
        IMAGE / DIAGRAM (standalone JSON object inside the topic array):
        {{
            "image": {{
            "type": "diagram",
            "prompt": "VERY DETAILED description: what to draw, exact labels, layout, style, colours",
            "placement": "right"
            }}
        }}
        ⚠️  Image prompts must be detailed enough to generate without ambiguity.
            Include: shape types, labels, arrow directions, colours, background.
        
        {slide_structure}
        
        ══════════════
        QUIZ RULES
        ══════════════
        {bloom_quiz_rule}
        
        ═══════════════
        SUMMARY RULES
        ═══════════════
        - 4–5 bullet takeaways
        - Each takeaway = one sentence max
        - Last takeaway MUST connect this topic to industry / career relevance
        
        ══════════════════════════════
        JSON SCHEMA (match EXACTLY):
        ══════════════════════════════
        {{
        "recap": ["point1", ...],                          ← omit entirely if first lecture
        "agenda": ["objective1", "objective2", ...],       ← 4–5 learning goals
        "topics": [
            ["Slide Title", "content_item_1", "content_item_2", "content_item_3", ...],
            ← Each topic array = title + any number of content strings
            ← NO fixed positions after title — you decide structure per slide
            ← DO NOT label every string with Definition:/Example:/Tip: — only when genuinely needed
            ← CONNECT slides: last string should bridge to the next slide topic
            ...
        ],
        "quiz": [
            "Q: ... | Options: (A) ...; (B) ...; (C) ...; (D) ... | Answer: X | Explanation: ...",
            ...
        ],
        "summary": ["takeaway1", ..., "career relevance point"]
        }}
        
        {json_example}
        
        FINAL REMINDER: Output ONLY the JSON object. First char = {{  Last char = }}
        """
