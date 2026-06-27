# Lookout 👁️

**Lookout** is a production-quality, multimodal "point-and-understand" assistant that helps users identify, interpret, and resolve unfamiliar objects, appliance control panels, foreign-language road signs, and computer software crashes with high precision and absolute confidence alignment.

It is built with **React**, **Vite**, **Tailwind CSS**, and **Express**, using the latest **@google/genai SDK** powered by the highly optimized `gemini-3.5-flash` vision model.

---

## 🔗 Deep-Dive Documentation
To fully grasp the product management, testing rigor, and engineering decisions behind Lookout, please read:
- 📑 **[Product Case Study & PRD](CASE_STUDY.md)** — Problem statements, user definitions, metrics tracking, and roadmap.
- 🧪 **[Evaluations Philosophy](EVALS.md)** — Why AI testing is crucial, the assertion matrix of our 18 test cases, and shipping guidelines.

---

## 🔄 The Core Loop
Lookout does one thing incredibly well. It executes a single tight, high-reliability point-and-understand loop:
1. **Multimodal Capture**: The user snaps a photo using their device camera or drops/uploads an image of something confusing (e.g., an unmarked pill bottle, exposed wiring, a complex industrial valve, or foreign characters).
2. **Sever-Side Guardrail Proxies**: The image is securely processed on the backend (preventing API key exposure) and dispatched to `gemini-3.5-flash` under strict instructions to enforce uncertainty checks and safety bans.
3. **Aligned Response**: The screen displays a clear, highly scannable card featuring exactly three sections:
   - **"What this is"**: A crisp, single-line identification of the subject.
   - **"What to do next"**: One to three concrete, highly actionable, safe instructions.
   - **"Confidence Assessment"**: A clean colored chip indicating High (green), Medium (amber), or Low (red) confidence, combined with a one-line explanation of why that level was selected.
   - **"Safety Banner"**: An immediate, high-visibility red warning banner showing up when physical hazards, medical dosage, or medication identification is scanned.

---

## 🎯 Why This Exists (PM Framing)

### The Problem
Human environments are increasingly complex. Whether navigating a foreign country with confusing local traffic restrictions, managing dense lease clauses, troubleshooting operating system crashes (BSOD), or operating obscure home appliance symbols, people constantly face friction from things they do not recognize or understand. 

### The Target User
- **The Global Explorer**: Travelers who need immediate, context-aware translations of visual warnings, signage, and transit restrictions.
- **The Self-Sufficing Household Operator**: Tenants or homeowners attempting to troubleshoot household machinery or appliance symbol dials without scrolling through lengthy PDFs.
- **The Daily Troubleshooter**: Non-technical users confronted by chaotic visual systems (e.g., sound mixers, computer terminal crashes, confusing tax sheets).

### Key Product Decisions (CEILING OF SCOPE)
1. **Uncertainty Honesty**: Traditional AI products try to guess even when given a blurry, dark image of a blob. Lookout is programmed to prioritize user trust: if an image is ambiguous or blurry, it must honestly drop confidence to Low and explain why, rather than fabricating.
2. **Hard-Stopped Safety Scoping**: Instead of trying to identify unidentified medications/pills or providing electrical troubleshooting advice (which carries severe liability and physical danger), Lookout explicitly refuses high-stakes instruction. It immediately flags the case, warns the user, and directs them to a human specialist (e.g., a pharmacist or licensed electrician).
3. **In-App Evaluation Suite**: Lookout features a built-in automated Evals tab running live test cases to guarantee that system safety guardrails do not degrade during continuous code updates.

---

## 🛠️ Tech Stack
- **Frontend**: React 19, Tailwind CSS, Lucide Icons, and Motion for fluid screen-state transitions.
- **Backend**: Express v4 server acting as a secure proxy to the Gemini API.
- **AI Engine**: `@google/genai` TypeScript SDK, querying `gemini-3.5-flash` under structured JSON schemas for 100% robust payload responses.
- **Build / Tooling**: Vite, `tsx` for high-speed local dev, and `esbuild` for bundling into a single, high-performance production CJS server.

---

## 🚀 How to Run Locally

### 1. Prerequisites
- Node.js (v18+)
- A Gemini API Key (obtained from [Google AI Studio](https://aistudio.google.com/))

### 2. Installation
Clone your repository or download the ZIP, then install all base dependencies:
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file in the project root (matching `.env.example`):
```env
GEMINI_API_KEY="your-actual-api-key"
```

### 4. Running the App
Start the full-stack development environment:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 🖼️ User Interface
Below is a conceptual preview of Lookout's minimalist, high-density dashboard layouts..

### 1. Point-and-Understand Assistant
```
+--------------------------------------------------------+
| Lookout                                     [Assistant] [Evals]  |
+--------------------------------------------------------+
|                                                        |
|   [ CAPTURE / FILE DROPMOUNT ]  ->  [ ANALYSIS RESULT] |
|   - Tap to open camera or file      - What this is:    |
|   - Carousel of examples:            "Washing symbols" |
|     * Pill Bottle (Unsafe)          - Next Steps:      |
|     * Japanese Parking sign          1. Select wool... |
|                                     - Confidence: High |
+--------------------------------------------------------+
```

### 2. In-App Evals Matrix
```
+--------------------------------------------------------+
| Lookout Evals Lab        [Passed: 16/18]  [RUN ALL]    |
+--------------------------------------------------------+
| ID      | CATEGORY            | EXPECTATION   | STATUS |
+---------+---------------------+---------------+--------+
| case_1  | Uncertainty & Blur  | Low Conf      | Passed |
| case_3  | High-Stakes         | Refuse/Banner | Passed |
| case_7  | Foreign Sign        | Translate     | Passed |
+--------------------------------------------------------+
```
