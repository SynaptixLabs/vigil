# {{PROJECT_NAME}} — Deployment

> **Deployment Process & Infrastructure**  
> Owner: CTO

---

## Environments

| Environment | URL | Branch | Auto-Deploy |
|-------------|-----|--------|-------------|
| Development | `dev.{{domain}}` | `dev` | ✅ |
| Staging | `staging.{{domain}}` | `dev` (tagged) | ❌ |
| Production | `{{domain}}` | `main` | ❌ |

---

## Deployment Flow

```
Feature Branch → dev → Staging → Production
       │          │        │          │
       │          │        │          └── Manual (CTO approval)
       │          │        └── Manual (QA sign-off)
       │          └── Auto on PR merge
       └── PR required
```

---

## Pre-Deployment Checklist

### All Environments
- [ ] All tests passing
- [ ] Coverage target met
- [ ] Linting passes
- [ ] No security vulnerabilities

### Staging
- [ ] All above +
- [ ] E2E tests pass
- [ ] Manual QA completed
- [ ] Performance acceptable

### Production
- [ ] All above +
- [ ] Rollback plan documented
- [ ] Monitoring configured
- [ ] CTO approval

---

## Deploy Commands

### Development
```bash
# Auto-deployed on merge to dev
git push origin dev
```

### Staging
```bash
# Tag and deploy
git tag -a staging-$(date +%Y%m%d) -m "Staging deploy"
git push origin --tags
{{STAGING_DEPLOY_COMMAND}}
```

### Production
```bash
#### Merge to main and deploy
git checkout main
git merge dev
git push origin main
{{PROD_DEPLOY_COMMAND}}
```

---

## Rollback Procedure

### Quick Rollback (< 5 min)
```bash
#### Revert to previous deployment
{{ROLLBACK_COMMAND}}
```

### Database Rollback
```bash
#### Only if migrations were run
{{DB_ROLLBACK_COMMAND}}
```

---

## Infrastructure

### Services
| Service | Provider | Config |
|---------|----------|--------|
| Backend | {{BACKEND_HOST}} | `{{config_location}}` |
| Frontend | {{FRONTEND_HOST}} | `{{config_location}}` |
| Database | {{DB_HOST}} | `{{config_location}}` |
| Cache | {{CACHE_HOST}} | `{{config_location}}` |

### Environment Variables
Managed via: {{ENV_MANAGEMENT}}

---

## Monitoring

### Health Checks
| Endpoint | Expected | Alert If |
|----------|----------|----------|
| `/health` | 200 | Non-200 for 1 min |
| `/api/health` | 200 | Non-200 for 1 min |

### Alerts
- Error rate > {{X}}%
- Response time > {{Y}}ms
- Memory usage > {{Z}}%

---

## Secrets Management

| Secret | Location | Rotation |
|--------|----------|----------|
| DB credentials | {{LOCATION}} | {{FREQUENCY}} |
| API keys | {{LOCATION}} | {{FREQUENCY}} |
| JWT secret | {{LOCATION}} | {{FREQUENCY}} |

---

## Vibe Cost Reference

| Deploy Task | Vibes |
|-------------|-------|
| Standard deploy | 1–2 V |
| Deploy with migration | 2–4 V |
| Rollback | 1–2 V |
| Incident response | 5–15 V |

---

*Last updated: {{DATE}}*
