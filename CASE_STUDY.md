# Lookout Case Study & Lightweight PRD 📑

This document details the product design thinking, target demographics, scope choices, instrumentation plans, and AI-specific technical trade-offs behind the development of Lookout.

---

## 1. Problem & Who Has It
Every day, humans interact with complex, unfamiliar, or poorly documented physical and digital artifacts. This causes friction, loss of time, and anxiety:
- **Foreign travelers** get blocked by local danger signs, traffic restrictions, or regulatory signage written in languages they cannot read.
- **Homeowners and tenants** waste hours trying to decode obscure appliance control panels, laundry pictograms, or industrial utility dial symbols.
- **Everyday computer users** panic when encountering cryptic crash logs, Linux kernel panics, or Windows Blue Screens (BSOD) because standard online troubleshooting suggests hundreds of irrelevant fixes.
- **Elderly or visually impaired individuals** struggle to identify loose medications or pills and run risks of dosing errors.

These users need an immediate, trustworthy system that translates visual friction into clear, direct, and safe actionable instructions.

---

## 2. Jobs-To-Be-Done (JTBD)
We frame Lookout’s core functionality around three primary Jobs-to-be-Done:
1. **"When I am** navigating a foreign context, **I want to** translate and understand visual signs, **so that I can** comply with local regulations and stay out of physical danger."
2. **"When I am** operating a confusing household appliance or mixer board, **I want to** quickly decode symbols, **so that I can** perform my task successfully without reading an instruction manual."
3. **"When I am** confronted by a critical system crash or legal clause, **I want to** extract a high-level summary and next steps, **so that I can** decide whether to troubleshoot it myself or call an expert."

---

## 3. Target User Personas
Lookout addresses three core archetypes:
- **The Independent Traveler (Alex, 29)**: Frequently travels off the beaten path, values self-sufficiency, but feels anxious about missing warning flags or parking violations due to translation barriers.
- **The First-Time Renter (Elena, 23)**: Just moved into an apartment with older appliances (with faint, symbolic dials). Elena wants to wash delicate fabrics correctly without flooding or ruining clothes.
- **The Home Fixer (Marcus, 42)**: Practical, willing to troubleshoot small computer failures or read simple leases, but wants to know immediately when a task is too dangerous to touch (e.g., electrical sparks, chemical warning labels).

---

## 4. What We Deliberately CUT and Why (Scope Decisions)
To maintain high visual quality, performance, and immediate deployment value, we enforced a strict ceiling of functional scope:
- **No Multi-Screen Navigation Sidebar**: Rather than cluttering the app with dashboards, settings views, user profile pages, and notification centers, we restricted the UI to a single, high-density split-pane layout. This ensures users get immediate scanning speed on mobile.
- **No In-App Theme Selector**: We bypassed building multiple theme palettes (e.g., solarized, cyberpunk) and instead spent that complexity on a high-contrast, beautiful slate dark theme optimized for outdoor/indoor camera usage.
- **No Persistent Cloud Server Database**: We deliberately excluded multi-user auth setups and SQL storage layers, opting for a clean local state and built-in SVG mock assets. This avoids unneeded database overhead and keeps the app's startup incredibly fast.
- **No Free-Text Explanatory Chat**: Adding an open-ended chatbot creates infinite pathways for hallucination and safety bypasses. By restricting the output to three fixed, structured categories ("What this is", "What to do next", "Confidence Reason"), we enforce consistent guardrails.

---

## 5. Success Metrics & Instrumentation

### The North Star Metric
- **Task Success Rate with High Aligned Trust**: Measured as the % of scans where the user receives an identification, executes the next steps, and indicates they successfully completed their task without encountering safety failures or hallucinations.

### The Activation Funnel
1. **Landed**: User opens the Lookout applet.
2. **Captured**: User engages the camera stream or uploads/drags an image file.
3. **Analyzed**: The server successfully processes the image through the Gemini proxy.
4. **Actioned**: User spends >10 seconds digesting the results card or clicking through the actionable steps.
5. **Retained / Re-engaged**: User returns to scan another item or navigates to the Evals tab to verify model stability.

### Metric Instrumentation Strategy
To track this in production, we would log:
- `image_ingestion_latency_ms`: Total time from client capture to Gemini API JSON return.
- `safety_triggered_ratio`: Percentage of overall scans that trigger the high-stakes warning banner.
- `evals_pass_percentage`: The automated pass rate across the 18-case test matrix during CI/CD checks.

---

## 6. AI-Specific Trade-offs & Decisions

### Latency vs. Quality
We selected `gemini-3.5-flash` rather than a larger `pro` model. Multimodal scans are latency-sensitive; travellers standing in front of a traffic sign cannot wait 12 seconds for a response. `gemini-3.5-flash` returns structured JSON responses in 1.2–2.5 seconds while retaining full visual OCR capabilities.

### Hallucination Handling
To prevent dangerous hallucinations:
- We instructed the model to assign `Low` confidence immediately if the image is blurry, dark, or contains digital static.
- The model must explicitly say "I am not sure what this is" if visual cues are missing, rather than attempting a confident guess.

### Building User Trust
By exposing the model’s **Confidence Rating** and **Confidence Reason** alongside raw outcomes, we establish a transparent relationship. Users are far more willing to trust an AI system that openly says: *"My confidence is Low because this remote control is extremely out of focus"* than one that confidently guesses the wrong brand.

---

## 7. Future Product Roadmap (Team & 6 Months)
If given a complete engineering team and a six-month window, we would focus on:
1. **On-Device Offline Edge Running**: Port model inference locally to mobile hardware (using Gemini Nano or optimized ONNX models) so explorers can scan signs in deep wilderness or underground subway stations without cellular reception.
2. **AR Overlay View**: Replace flat-image uploads with a continuous web-based AR viewport (using WebGL/Three.js), placing spatial "What this is" and "Confidence" pins directly onto objects in real-time.
3. **Continuous Evaluation Pipeline**: Integrate our Evals Lab directly into GitHub Actions. On every pull request, the test runner executes the 18-case assertion suite and blocks deployments if safety thresholds fall below 100%.
4. **Voice-Guided Read-Aloud**: Add text-to-speech functionality to read out next steps for visually impaired users operating household controls.
