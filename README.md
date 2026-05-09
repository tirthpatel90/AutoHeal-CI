# 🚀 AutoHeal: The Autonomous Pipeline Healing Platform

AutoHeal is an industry-grade, autonomous CI/CD intelligence engine designed to detect, analyze, and repair pipeline failures before code even leaves the developer's machine. By providing a "pre-push" intelligence layer, it ensures that only healthy code enters the integration stage.

---

## 💡 The Problem
Modern CI/CD pipelines are often "black boxes" that fail for predictable reasons—dependency drifts, configuration errors, or subtle code conflicts. Developers shouldn't have to wait 20 minutes for a pipeline to fail just to see a common error log.

## ✨ The Solution
AutoHeal acts as an **Autonomous Healing Layer**. Currently, the platform allows developers to perform deep scans of repository structures and dependencies. It predicts potential failures in the **Working Phase**—identifying issues before a push is even initiated.

---

## 🧠 Autonomous Architecture

AutoHeal isn't just an API wrapper; it's built on a specialized **Agentic Framework**:

1.  **Diagnostic Agent**: Recursively scans thousands of files in milliseconds using the GitHub Git Trees API to build a complete mental model of the repository.
2.  **Intelligence Engine**: Leverages **Gemini 2.5 Flash** with highly specialized DevOps prompts to identify anti-patterns in `.github/workflows`, `package.json`, and environment configs.
3.  **Healing Service**: Automatically generates code-level patches for identified risks, providing developers with ready-to-apply fixes.

---

## 🚀 Key Features

### 🛠️ Pre-Push Failure Detection
Analyze your repository context and CI configurations (`.github/workflows`, `Jenkinsfile`, etc.) to calculate a failure probability score before you initiate a deployment.

### 💨 Lightning-Fast Repository Scanning
Utilizes high-performance recursive tree mapping to analyze entire repository structures in seconds, ensuring complete coverage of even the largest monorepos.

### 📊 Real-Time Pipeline Intelligence
A comprehensive dashboard provides a unified view of your build history, success metrics, and average durations, allowing project leads to monitor health levels at a glance.

### 🔦 Deep Log Analysis
Fetch and analyze live GitHub Actions logs. The system identifies specific job failures and provides autonomous repair suggestions to keep the development cycle fluid.

### 🌀 Multi-Context Management
Maintain a connected set of repositories and switch between them instantly to monitor the health of your entire portfolio from a single interface.

---

## 🛠️ Technology Stack

| Platform Layer | Technology |
|---|---|
| **Intelligence Engine** | High-performance Python backend with Pydantic-Settings |
| **Agent Logic** | Custom Autonomous Diagnostic Agent |
| **Logic Framework** | FastAPI (Asynchronous stream handling) |
| **Interface** | Next.js 16 with "Studio Zen" design system (Fluid animations) |
| **AI Model** | Google Generative AI (Gemini 2.5 Flash) |

---

## 🚀 Setup Guide

### 1. Prerequisites
- **Node.js 22+** (matches our CI/CD environment)
- **Python 3.13+**
- **GitHub Personal Access Token**
- **Google AI API Key**

### 2. Engine Setup (Backend)
```bash
cd autoheal-backend
python -m venv venv
source venv/bin/activate  # Windows: .\venv\Scripts\activate
pip install -r requirements.txt
```
Create a `.env` file in `autoheal-backend/`:
```env
GITHUB_ACCESS_TOKEN=your_token
GEMINI_API_KEY=your_key
JWT_SECRET_KEY=your_secret
```
Run the server: `python main.py`

### 3. Interface Setup (Frontend)
```bash
cd autoheal-ci
npm install
npm run dev
```

---

## 🤝 Open Source & Contributing
AutoHeal is an open-source project and we welcome contributions from the community! Whether you are fixing a bug, suggesting a new feature, or improving the healing logic:
- **Feel free to contribute!** 
- Fork the repository, create your feature branch, and submit a PR.
- Let's build the future of autonomous DevOps together.

---
*Built for the next generation of DevOps Engineers.*
