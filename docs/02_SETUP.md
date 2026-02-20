# {{PROJECT_NAME}} — Setup Guide

> **Development Environment Setup**
> Owner: CTO

---

## Prerequisites

| Tool | Version | Required |
|------|---------|----------|
| Python | >=3.11, <3.14 | ✅ |
| Node.js | >=20.x | ✅ (if FE) |
| pnpm | >=8.x | ✅ (if FE) |
| Docker | Latest | Optional |
| Git | Latest | ✅ |

### ⚠️ Python Version Gate (CRITICAL)

**Required:** Python 3.11, 3.12, or 3.13. Python 3.14+ is **NOT supported**.

```bash
# Verify your Python version BEFORE any work
python --version
# Must output: Python 3.11.x, 3.12.x, or 3.13.x

# If using pyenv:
pyenv install 3.12.4
pyenv local 3.12.4

# If using conda:
conda create -n {{PROJECT_NAME}} python=3.12
conda activate {{PROJECT_NAME}}
```

**Why this matters:** Python 3.14 has breaking changes that cause test noise and compatibility issues. The project will NOT work correctly on 3.14+.

---

## Quick Setup

```bash
# 1. Clone repository
git clone {{REPO_URL}}
cd {{PROJECT_NAME}}

# 2. Install dependencies
{{INSTALL_COMMAND}}

# 3. Environment setup
cp .env.example .env
# Edit .env with your values

# 4. Database setup
{{DB_SETUP_COMMAND}}

# 5. Verify installation
{{VERIFY_COMMAND}}
```

---

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | Database connection | ✅ | - |
| `SECRET_KEY` | App secret | ✅ | - |
| `DEBUG` | Debug mode | ❌ | `false` |
| `LOG_LEVEL` | Logging level | ❌ | `INFO` |

---

## Running the Application

### Development Mode
```bash
{{DEV_RUN_COMMAND}}
```

### Production Mode
```bash
{{PROD_RUN_COMMAND}}
```

### With Docker
```bash
docker-compose up -d
```

---

## Running Tests

```bash
# All tests
{{TEST_ALL_COMMAND}}

# Unit tests only
{{TEST_UNIT_COMMAND}}

# With coverage
{{TEST_COVERAGE_COMMAND}}
```

---

## IDE Setup

### VS Code
Recommended extensions:
- {{EXTENSION_1}}
- {{EXTENSION_2}}
- {{EXTENSION_3}}

### Windsurf
See `AGENTS.md` files for agent-specific configurations.

---

## Troubleshooting

### Common Issues

**Issue:** {{COMMON_ISSUE_1}}
```bash
# Solution
{{SOLUTION_1}}
```

**Issue:** {{COMMON_ISSUE_2}}
```bash
# Solution
{{SOLUTION_2}}
```

---

## Vibe Cost

| Setup Task | Vibes |
|------------|-------|
| Fresh setup | 2–3 V |
| Dependency update | 1–2 V |
| Environment debug | 3–5 V |

---

*Last updated: {{DATE}}*
