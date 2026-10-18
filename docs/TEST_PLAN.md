# Shlanu — Test Plan

## Testing Strategy

### Test Types
1. **Unit Tests** — Individual functions, utilities, components
2. **Integration Tests** — API endpoints, database operations
3. **End-to-End Tests** — Complete user workflows
4. **Security Tests** — Permission boundaries, input validation

## Unit Tests

### Frontend
- Validation utilities
- Currency calculations
- Date/time handling
- Recurrence rules
- Permission helpers
- Component rendering
- Form validation

### Backend
- Service layer logic
- Validation schemas
- Authentication helpers
- Authorization checks
- Business rule enforcement

## Integration Tests

### Authentication
- Register with valid data
- Register with invalid data (duplicate email, weak password)
- Login with correct credentials
- Login with incorrect credentials
- Logout
- Session restoration
- Password reset flow

### Family Workspace
- Create family
- Get family details
- Update family settings
- Invite member
- Accept invitation
- Revoke invitation
- Remove member
- Change roles
- Transfer ownership

### Tasks
- Create task
- Read task
- Update task
- Complete/reopen task
- Delete task
- Filter and search

### Calendar
- Create event
- Read events by date range
- Update event
- Delete event
- All-day events
- Timezone handling

### Baby Tracker
- Create feeding log
- Create sleep log
- Create diaper log
- Update logs
- Delete logs
- Daily summaries
- Invalid time range validation

### Budget
- Create budget
- Create expense
- Monthly summaries
- Category totals
- Budget vs actual calculations
- Currency validation

### Documents
- Request upload authorization
- Finalize upload
- Request download
- Update metadata
- Delete document
- Unauthorized access rejection

### Notifications
- Create notification
- Mark as read
- Mark all as read
- Unread count
- Duplicate prevention

## Security Tests

### Critical Security Tests
1. User A cannot access User B's private family data
2. A member removed from a family immediately loses access
3. An invitation cannot be accepted twice
4. Expired or revoked invitations are rejected
5. A non-owner cannot perform owner-only actions
6. The last owner cannot leave without ownership transfer
7. A user cannot download another family's document
8. Invalid inputs are rejected by the server
9. Unauthorized requests do not leak record existence
10. Cookie/session protections are tested

### Permission Boundary Tests
- Non-member cannot access family data
- Member cannot access other family's data
- Owner-only actions blocked for members
- Family deletion requires owner confirmation

## End-to-End Tests

### Core Workflows
1. Register → Login → Create family → Onboarding complete
2. Create task → Complete task → Verify on dashboard
3. Create calendar event → View in calendar
4. Record baby log → View in timeline
5. Add expense → View in budget
6. Upload document → Download document
7. Receive notification → Mark as read
8. Change language → Verify RTL/LTR
9. Mobile responsive navigation

### Browser Testing
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Mobile Safari
- Chrome Mobile

## Test Data
- Isolated test database
- Deterministic seed data
- No production data in tests
- Clean state between tests

## Test Execution
- Unit tests: Every commit
- Integration tests: Every PR
- E2E tests: Before release
- Security tests: Every PR
- Full suite: Before release
