# Deployment Checklist

## Pre-Deployment

### Code Quality
- [ ] All unit tests passing locally (`npm run test`)
- [ ] QA tests passing locally (`npm run qa`)
- [ ] No linting errors (`npm run lint`)
- [ ] Code reviewed and approved
- [ ] No console.logs or debug code

### Testing
- [ ] Manual testing completed
- [ ] Pack generation verified across all sets (SOR, SHD, TWI, JTL, LOF, SEC)
- [ ] Draft functionality tested
- [ ] Stats page working
- [ ] Mobile responsive checked

### Database
- [ ] Migrations tested locally
- [ ] Migration files are idempotent
- [ ] No destructive changes without backup plan
- [ ] Database connection strings verified in Vercel

### Environment Variables
- [ ] All required env vars set in Vercel
- [ ] `POSTGRES_URL` configured
- [ ] `POSTGRES_PRISMA_URL` configured (if using Prisma)
- [ ] Any new env vars documented

## During Deployment

### Automated Checks (Vercel)
- [ ] Pre-build tests run successfully
- [ ] Migrations applied without errors
- [ ] Build completed successfully
- [ ] Post-build artifact generation completed
- [ ] Deployment preview URL generated (for PRs)

### GitHub Actions (if configured)
- [ ] CI workflow completed
- [ ] All test jobs passed
- [ ] QA artifacts uploaded
- [ ] Lint checks passed

## Post-Deployment

### Immediate Verification
- [ ] Site is accessible at production URL
- [ ] No 500 errors on main pages
- [ ] QA results accessible: `/qa-results.json`
- [ ] Database connection working
- [ ] API routes responding correctly

### Functional Testing
- [ ] Generate a sealed pod (6 packs)
- [ ] Verify pack contains:
  - [ ] 16 cards total
  - [ ] 1 leader, 1 base, 1 foil
  - [ ] 9 commons, 2-3 uncommons, 1-2 rares
- [ ] Start a draft
- [ ] Make picks and verify state saves
- [ ] Check stats page loads
- [ ] Test on mobile device

### QA Results Review
- [ ] Check `/qa-results.json` for:
  - [ ] Recent timestamp
  - [ ] All sets tested (6 sets)
  - [ ] Test summary shows pass rate > 95%
  - [ ] No unexpected failures

### Database
- [ ] Verify migrations table updated
- [ ] Check for migration errors in logs
- [ ] Test data queries working
- [ ] Connection pool healthy

### Performance
- [ ] Page load times acceptable (< 3s)
- [ ] Pack generation responsive (< 1s)
- [ ] API endpoints responding quickly
- [ ] No memory leaks in logs

## Rollback Plan

If issues are detected:

1. **Immediate Issues**
   - Use Vercel's instant rollback to previous deployment
   - Go to Vercel dashboard → Deployments → Select previous → Promote to Production

2. **Database Issues**
   - Database migrations are tracked and can be rolled back manually
   - Check `migrations` table for applied migrations
   - Have rollback SQL ready for recent migrations

3. **Code Issues**
   - Revert the problematic commit
   - Push to trigger new deployment
   - Or use Vercel rollback for instant fix

## Monitoring (First 24 Hours)

- [ ] Check error rates in Vercel Analytics
- [ ] Monitor function execution times
- [ ] Review user feedback/reports
- [ ] Check for database connection issues
- [ ] Verify QA results remain consistent

## Weekly Follow-up

- [ ] Review accumulated error logs
- [ ] Check QA test trends
- [ ] Verify no performance degradation
- [ ] Plan fixes for any new issues

## Emergency Contacts

- **Vercel Support**: support@vercel.com
- **Database Provider**: [Your DB provider support]
- **Project Owner**: [Your contact info]

## Useful Commands

```bash
# Local testing
npm run test              # All unit tests
npm run qa                # QA pack generation tests
npm run build             # Full production build
npm run lint              # Code quality check

# Deployment
git push origin main      # Triggers production deploy
git push origin feature   # Triggers preview deploy

# Database
npm run migrate:status    # Check migration status
npm run migrate:prod      # Manual production migration (not usually needed)

# Debug
vercel logs               # View production logs
vercel env pull           # Pull environment variables locally
```

## Notes

- Deployments typically take 2-5 minutes
- Tests add ~1-2 minutes to build time
- Preview deployments use separate database
- QA results are regenerated on every build
- Failed tests won't block deployment but will show warnings

## Version History

- **v1.0** - Initial deployment checklist
- **v1.1** - Added QA test verification steps
- **v1.2** - Added post-build artifact checks