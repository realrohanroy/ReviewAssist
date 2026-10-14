# Client Review Assistant — Product Specification

> **Document type:** Product definition / source of truth  
> **Version:** 1.0  
> **Status:** Draft for product and engineering review  
> **Primary use:** Internal company tool for requesting authentic client reviews on Google  
> **Working company name:** SME Experts (configurable)  
> **Last updated:** 2026-10-13

---

## 1. Product Summary

Client Review Assistant is an internal web application that helps company employees create and share a client-specific review link after delivering a service. The employee selects the service delivered and optionally identifies the employee or team involved. The application creates a unique link for the client.

When the client opens the link, they can choose a star rating and receive optional AI-assisted writing suggestions that help them describe their **own genuine experience**. The client can edit a suggestion or write their own review. They are then directed to the company's Google review page to submit the review themselves.

The app does **not** post reviews to Google on a client's behalf, guarantee publication, or claim that a review has been submitted merely because the client clicked the Google link.

### 1.1 Product objective

Reduce the effort required to request and write useful client reviews while preserving the client's independence and complying with Google review policies.

### 1.2 Intended users

- **Internal employee:** Creates a review request for a client after service delivery.
- **Client/reviewer:** Opens the link, chooses a rating, optionally uses writing assistance, and submits a review through Google.
- **Administrator:** Maintains company settings, services, employee accounts, Google review destination, and audit/reporting access.

### 1.3 Product principles

1. **Authenticity over rating:** Never pressure clients to give a particular rating.
2. **No review gating:** All rating values (1–5 stars) must have a fair path to the Google review destination.
3. **Client control:** AI suggestions are optional, editable, and never submitted automatically.
4. **Truthfulness:** Suggestions must not invent outcomes, facts, project details, or praise.
5. **Minimal data collection:** Collect only the information needed to create and manage a request.
6. **Operational simplicity:** The employee workflow should be quick enough to use immediately after a client interaction.

---

## 2. Problem Statement

Employees need a consistent way to ask clients for Google reviews across multiple company services. A generic review link does not help clients remember which service they received or how to describe their experience. Employees also need a lightweight internal record of which requests were created and which clients may need a follow-up.

The product should make the request process easier without controlling, filtering, or manufacturing client feedback.

## 3. Goals and Non-Goals

### 3.1 Goals

- Provide an authenticated internal dashboard.
- Let employees select one or more services delivered.
- Let employees optionally select their name or the relevant team member.
- Generate a unique, shareable client review link.
- Provide a mobile-friendly client landing page.
- Allow clients to choose any rating from 1 to 5 stars.
- Offer up to three AI-generated writing suggestions, based on the selected service and optional employee context, while avoiding fabricated claims.
- Let clients edit, copy, or ignore suggestions and write their own text.
- Open the official Google review destination so the client can independently submit the review.
- Track request lifecycle events without falsely claiming that Google publication was verified.
- Give administrators control over service options, employees, Google review URL, AI settings, and access.

### 3.2 Non-goals for the initial release

- Automatically publishing reviews to Google.
- Reading or scraping individual Google reviews to infer which request generated them.
- Guaranteeing that Google accepts, displays, or retains a review.
- Incentivizing reviews with money, discounts, gifts, or service benefits.
- Sending only high-rating clients to Google.
- Requiring a client to leave a review.
- Building a public review marketplace or a customer relationship management (CRM) system.
- Complex campaign automation, multi-location support, or billing unless added in a later phase.

---

## 4. Policy and Platform Constraints

These are product requirements, not optional enhancements.

### 4.1 Google review authenticity

Google's Maps user-contributed content policy requires reviews to reflect genuine experiences and prohibits rating manipulation. It prohibits businesses from discouraging negative reviews or selectively soliciting positive reviews. It also cautions businesses against pressuring customers to leave reviews or requesting specific content, including content identifying a staff member.

Official policy: https://support.google.com/contributionpolicy/answer/7400114

Therefore:

- The rating choice must not determine whether the client is allowed to access Google.
- A 1-star client must not be redirected to a private feedback form instead of Google while a 5-star client is directed to Google.
- Do not tell clients which rating to select.
- Do not require the client to mention a named employee.
- Employee name may be used as internal context for the writing assistant, but the UI must make it optional for the client to include it and must not pressure them to do so.
- Do not offer incentives or benefits in exchange for a review.
- Do not generate fake first-person experiences or unsupported claims.
- The client must remain free to leave, edit, or discard a suggestion and to decline to post.

### 4.2 Google submission boundary

The application must use a configured Google review URL (for example, the business's official Google review link). After the client chooses to continue, open that destination so the client can review and submit within Google.

The application must not represent that it can submit a review directly through the Google Business Profile API or post as the client. The MVP should treat a click on the Google destination as **redirected**, not as **review published**.

### 4.3 AI writing safeguards

- Generated content is a draft, not a factual record.
- Suggestions must be grounded in known context and must not invent project outcomes, metrics, speed, savings, satisfaction, or specific interactions.
- If there is insufficient detail to write a specific review, produce neutral, general drafts or ask the client for optional details.
- Do not fabricate claims such as “increased revenue by 40%,” “delivered ahead of schedule,” or “best service in India.”
- The client must be able to edit all generated text before copying it.
- The app should display a brief notice: “These are optional writing suggestions. Please use only wording that accurately reflects your experience.”

---

## 5. Core User Journeys

### 5.1 Employee creates a request

1. Employee signs in.
2. Employee selects **Create review request**.
3. Employee selects the service or services delivered.
4. Employee selects the relevant employee/team member if appropriate; this field is optional and may default to the signed-in employee.
5. Employee optionally enters a client reference/name for internal identification. Client name should not be required.
6. Employee submits the form.
7. System creates a unique, hard-to-guess token and a review request record.
8. Employee copies or shares the generated URL through the company's existing communication channel (WhatsApp, email, or another channel). The MVP does not need to send messages automatically.
9. Employee can see the request status and creation date in the dashboard.

### 5.2 Client opens the link and prepares a review

1. Client opens the unique link on a phone or desktop.
2. The page displays the company identity, a concise request for honest feedback, and the relevant service context.
3. Client selects a rating from 1 to 5 stars. The page must not preselect a rating.
4. The app offers optional writing assistance. It may generate three alternative drafts based on the service context and optional employee context, but must not imply that a positive rating is expected.
5. Client can select a draft, edit it, copy it, or write their own review from scratch.
6. The client chooses **Continue to Google**.
7. The app records that the Google destination was opened (best-effort event tracking), then opens the configured Google review URL.
8. Google handles sign-in, review editing, and final submission.
9. The app may show a final reminder that the review must be submitted on Google. It must not claim that submission has been verified.

**Important UX note:** If the star rating is used to change the wording of writing suggestions, it must not change access to Google or suppress negative feedback. Consider making the rating an optional context signal rather than using it to infer praise.

### 5.3 Administrator configures the system

1. Admin signs in with an authorized role.
2. Admin configures company display name and logo.
3. Admin configures the official Google review URL.
4. Admin adds, edits, disables, or reorders services.
5. Admin manages employee accounts and roles.
6. Admin configures the AI provider/model and usage limits through server-side settings.
7. Admin views request activity and basic reporting.

---

## 6. Functional Requirements

Priority definitions: **P0** = required for MVP; **P1** = useful after MVP; **P2** = later enhancement.

### 6.1 Authentication and roles

- **FR-001 (P0):** Internal dashboard requires authentication.
- **FR-002 (P0):** Support at least `admin` and `employee` roles.
- **FR-003 (P0):** Employees can create and view requests according to the selected access policy. Default MVP policy: employees can view their own requests; admins can view all.
- **FR-004 (P0):** Admins can deactivate employee accounts.
- **FR-005 (P1):** Support password reset or company SSO if available.

### 6.2 Service and employee selection

- **FR-010 (P0):** Employee can select one or more active services.
- **FR-011 (P0):** Employee can select an associated employee/team member, optional unless company policy requires it for internal attribution.
- **FR-012 (P0):** Service labels and employee names shown to clients must be configurable.
- **FR-013 (P0):** Inactive services and employees cannot be selected for new requests.
- **FR-014 (P1):** Support service categories and service-specific writing guidance.

### 6.3 Review request management

- **FR-020 (P0):** Create a unique, cryptographically random, unguessable public token per request.
- **FR-021 (P0):** The public URL must not expose internal database IDs, client contact information, or employee account details.
- **FR-022 (P0):** Employee can copy the link and see a clear success state.
- **FR-023 (P0):** Employee can view request creation date and status.
- **FR-024 (P0):** Admin can revoke a link.
- **FR-025 (P1):** Support expiration dates and resend reminders.
- **FR-026 (P0):** Do not require a client's email address or phone number to open the link.
- **FR-027 (P0):** Do not automatically send messages in the MVP.

### 6.4 Client rating and review drafting

- **FR-030 (P0):** Public page must be responsive and usable on common mobile screen sizes.
- **FR-031 (P0):** Client can select 1, 2, 3, 4, or 5 stars.
- **FR-032 (P0):** No star rating is preselected.
- **FR-033 (P0):** Client can continue to Google regardless of selected rating.
- **FR-034 (P0):** Client can skip AI assistance and proceed with their own wording.
- **FR-035 (P0):** AI can generate up to three distinct optional draft suggestions.
- **FR-036 (P0):** Drafts must be grounded in service metadata and optional client-provided details; never invent facts.
- **FR-037 (P0):** Client can edit the selected draft in a text field.
- **FR-038 (P0):** Client can write their own review without selecting a suggestion.
- **FR-039 (P0):** Client can copy draft text to the clipboard.
- **FR-040 (P0):** Client explicitly chooses to open Google; no automatic redirect after generating text.
- **FR-041 (P0):** Show a clear disclaimer that the draft should be used only if it accurately reflects the client's experience.
- **FR-042 (P0):** Employee name must not be inserted as a mandatory phrase. If included in a draft, it must be phrased naturally and remain editable.
- **FR-043 (P1):** Support multiple languages, starting with languages selected by the company.
- **FR-044 (P1):** Offer optional prompts for the client to add specifics, such as what went well or what could be improved, without forcing positive answers.

### 6.5 Google destination and status tracking

- **FR-050 (P0):** Admin can configure the Google review URL.
- **FR-051 (P0):** Validate the configured URL format and restrict it to an allowed HTTPS Google destination pattern where practical.
- **FR-052 (P0):** Record `google_link_opened` when the client explicitly clicks the Google action.
- **FR-053 (P0):** Never label `google_link_opened` as “review posted” or “review published.”
- **FR-054 (P0):** If no reliable Google submission confirmation exists, show the request as “Google link opened” or “submission unverified.”
- **FR-055 (P1):** Provide an optional employee-entered follow-up outcome, clearly labeled as manually reported and not verified by Google.

### 6.6 Reporting

- **FR-060 (P0):** Dashboard shows total requests created and counts by lifecycle status.
- **FR-061 (P0):** Report by service, employee, creation date, and request status.
- **FR-062 (P0):** Do not present rating distribution as company satisfaction unless ratings are collected and interpreted appropriately.
- **FR-063 (P0):** Do not claim review conversion or published-review counts from link clicks alone.
- **FR-064 (P1):** Export authorized request metadata as CSV, excluding unnecessary personal information.

### 6.7 Admin settings

- **FR-070 (P0):** Configure company name, logo, and optional short client-facing message.
- **FR-071 (P0):** Configure Google review URL.
- **FR-072 (P0):** CRUD services and employee accounts.
- **FR-073 (P0):** Configure AI provider/model using server-side environment variables or secrets management.
- **FR-074 (P0):** Provide a way to disable AI drafting while keeping manual review-link functionality available.
- **FR-075 (P1):** Configure request expiration, retention periods, and supported languages.

---

## 7. Suggested UI / Pages

### Internal application

1. **Sign in**
   - Company branding
   - Email/password or selected authentication method
2. **Dashboard**
   - Requests created
   - Links opened
   - Recent requests
   - Filters by date, service, employee, and status
3. **Create Request**
   - Service multi-select
   - Employee/team member selector
   - Optional internal client reference
   - Create link action
   - Copy/share URL action
4. **Request Details**
   - Created by, service(s), employee attribution, created date, public link status
   - Revoke link action
5. **Services Management** (admin)
6. **Employees & Roles** (admin)
7. **Settings** (admin)
   - Company branding
   - Google review URL
   - AI settings/status
   - Data retention

### Public client page

1. Company logo/name and service context
2. Neutral request for honest feedback
3. Optional 1–5 star selection
4. Optional AI writing assistance
5. Three alternative drafts, when available
6. Editable review text area
7. Copy text action
8. **Continue to Google** action
9. Policy/accuracy notice and basic privacy notice

The client page should avoid dark patterns, countdowns, guilt-inducing language, preselected ratings, or language that suggests the client is expected to leave five stars.

---

## 8. Core Data Model

The final database and naming conventions may be decided by the implementation agent, but the following concepts and relationships must be preserved.

### 8.1 `User`

| Field | Type | Notes |
|---|---|---|
| `id` | UUID/string | Primary key |
| `name` | string | Display name |
| `email` | string | Unique login identifier |
| `role` | enum | `admin`, `employee` |
| `isActive` | boolean | Prevents login/use when disabled |
| `createdAt` | timestamp | UTC |
| `updatedAt` | timestamp | UTC |

### 8.2 `Service`

| Field | Type | Notes |
|---|---|---|
| `id` | UUID/string | Primary key |
| `name` | string | Internal and client-facing label |
| `description` | string, optional | Plain factual description |
| `reviewContext` | string, optional | Safe, factual AI context; no marketing claims |
| `isActive` | boolean | Active services available for new requests |
| `sortOrder` | integer | Display ordering |
| `createdAt` | timestamp | UTC |
| `updatedAt` | timestamp | UTC |

### 8.3 `ReviewRequest`

| Field | Type | Notes |
|---|---|---|
| `id` | UUID/string | Internal primary key |
| `publicTokenHash` | string | Store a hash of the public token where practical |
| `createdByUserId` | UUID/string | Employee who created the request |
| `attributedEmployeeId` | UUID/string, nullable | Optional person/team attribution |
| `serviceIds` | array or relation table | One or more services delivered |
| `clientReference` | string, nullable | Internal label only; avoid sensitive details |
| `status` | enum | See lifecycle below |
| `createdAt` | timestamp | UTC |
| `expiresAt` | timestamp, nullable | Optional expiry |
| `revokedAt` | timestamp, nullable | Set when revoked |
| `googleLinkOpenedAt` | timestamp, nullable | Not proof of review submission |
| `updatedAt` | timestamp | UTC |

Recommended status values:
- `created`
- `opened`
- `drafting_started` (optional event-derived status)
- `google_link_opened`
- `expired`
- `revoked`

Keep event history separate if multiple events per request need to be recorded. Do not use a single status field as a substitute for an audit/event log.

### 8.4 `ReviewRequestEvent`

| Field | Type | Notes |
|---|---|---|
| `id` | UUID/string | Primary key |
| `reviewRequestId` | UUID/string | Related request |
| `eventType` | enum/string | e.g. `request_opened`, `draft_generated`, `text_copied`, `google_link_opened`, `link_revoked` |
| `occurredAt` | timestamp | UTC |
| `metadata` | JSON, optional | Minimal, non-sensitive event metadata |

Do not store full IP addresses or invasive device fingerprints by default. If abuse prevention requires request metadata, define a short retention period and document the purpose.

### 8.5 `AppSettings`

Contains company display name, logo URL, Google review URL, client-facing message, AI feature enabled flag, default language, and retention configuration. Secrets and API keys must **not** be stored as readable database settings; use environment variables or a secrets manager.

### 8.6 Optional `DraftGenerationLog`

Store only what is needed for reliability, abuse prevention, and cost tracking. Avoid retaining the client's full draft or free-text feedback by default. If prompts or outputs are logged for debugging, redact personal data and apply a defined retention period.

---

## 9. AI Draft Generation Specification

### 9.1 Inputs

- Selected service name(s) and factual descriptions
- Optional associated employee name
- Selected rating, if the product team decides to use it as writing context
- Optional details voluntarily supplied by the client
- Selected language
- Company-approved style constraints

Do not send client contact details, authentication data, or unrelated internal notes to the AI provider.

### 9.2 Output

Return up to three distinct short review drafts. Each draft should:
- Sound natural and distinct from the others.
- Use only supplied factual context.
- Avoid unsupported superlatives, metrics, guarantees, or claims.
- Avoid forcing a staff member's name into the text.
- Be editable and clearly labeled as a suggestion.
- Match the selected language.
- Avoid repetitive, template-like phrasing where possible.

### 9.3 Suggested prompt contract

The implementation agent should create a versioned server-side prompt similar in intent to:

> You help a customer express their own genuine experience with a service provider. Produce up to three concise, distinct, optional review drafts using only the factual context provided. Do not invent events, results, metrics, promises, or emotions. Do not tell the customer what rating to give and do not pressure them toward a positive review. Do not require the employee's name to appear. If context is insufficient, keep the wording general or ask for optional specifics. The customer must be free to edit or ignore every draft. Return structured JSON matching the application's schema.

This is a prompt-design starting point, not a substitute for server-side validation and policy testing.

### 9.4 Rating handling

The product must not use a rating to decide whether a client can continue to Google. If rating-specific wording is used, it must remain neutral and must not convert a low rating into a positive review. A safer MVP choice is to generate drafts from service context and client-provided details, while allowing the client to describe their experience freely.

### 9.5 Validation and failure handling

- Validate AI output against a strict schema.
- Reject empty, malformed, excessively long, or unsupported output.
- If generation fails, show a retry option and preserve manual text entry and Google navigation.
- Apply rate limits to public tokens and generation endpoints.
- Do not expose AI API keys to the browser.
- Do not trust client-submitted service IDs or employee names; resolve them server-side from the request token.

---

## 10. API Surface (Proposed)

The implementation agent may adjust endpoint names to the chosen framework, but behavior and access control must remain equivalent.

### Internal, authenticated endpoints

- `POST /api/review-requests` — create a request.
- `GET /api/review-requests` — list requests visible to the signed-in user.
- `GET /api/review-requests/:id` — get authorized request details.
- `POST /api/review-requests/:id/revoke` — revoke a link.
- `GET /api/services` — list active services for employee selection.
- `POST /api/admin/services` — create a service.
- `PATCH /api/admin/services/:id` — update or deactivate a service.
- `GET /api/admin/users` — list users for admin management.
- `PATCH /api/admin/users/:id` — update role or active state.
- `GET /api/admin/settings` — get non-secret settings.
- `PATCH /api/admin/settings` — update allowed settings.

### Public endpoints

- `GET /api/public/review-requests/:token` — validate token and return safe client-facing context.
- `POST /api/public/review-requests/:token/drafts` — generate optional draft suggestions, subject to rate limits.
- `POST /api/public/review-requests/:token/events` — record an allowlisted event such as `text_copied` or `google_link_opened`.

Public responses must never return internal user IDs, email addresses, private notes, raw token hashes, or other internal-only fields. Public endpoints must validate token status and expiration on every request.

The Google destination should be delivered only from trusted server-side configuration or a validated, authorized configuration value.

---

## 11. Security, Privacy, and Reliability

### Security requirements

- Enforce authentication and role-based authorization on every internal API route.
- Use secure session handling or a well-configured authentication provider.
- Hash public tokens at rest where practical; tokens must be high entropy and unguessable.
- Apply rate limiting to public endpoints, particularly AI generation.
- Validate and sanitize all inputs; encode output appropriately.
- Keep secrets server-side and out of source control.
- Protect state-changing requests against CSRF when applicable.
- Use HTTPS in production.
- Maintain an audit trail for admin changes, link revocation, and permission changes.
- Avoid open redirects. The client must not be able to supply an arbitrary redirect destination.
- Apply dependency updates and basic security checks before production deployment.

### Privacy requirements

- Do not require client contact information in the MVP.
- Do not ask clients to provide sensitive personal or confidential business information.
- Show a concise privacy notice explaining the purpose of the request and any analytics/AI processing.
- Collect only necessary events and define retention/deletion behavior.
- Restrict internal reporting to authorized employees and admins.
- Do not log AI API keys, authentication tokens, or unnecessary review text.
- Establish an appropriate privacy and retention policy before production launch.

### Reliability requirements

- If AI is unavailable, manual review drafting and the Google review link must continue to work.
- If analytics event recording fails, do not block the client from opening Google.
- Prevent duplicate request creation from accidental double-clicks where practical.
- Display clear loading, empty, expired-link, revoked-link, and error states.

---

## 12. Non-Functional Requirements

- **Responsive UI:** Support current mobile and desktop browsers.
- **Accessibility:** Keyboard-accessible controls, readable contrast, visible focus states, accessible star-rating labels, and screen-reader-friendly form errors.
- **Performance:** Common internal pages should feel responsive; AI generation should show progress and have a bounded timeout.
- **Maintainability:** Separate UI, business logic, data access, and AI provider integration.
- **Observability:** Log errors and operational metrics without exposing secrets or unnecessary personal data.
- **Localization readiness:** Avoid hard-coded UI text where practical.
- **Configuration:** Company identity, service catalogue, and Google review URL must not be hard-coded in components.
- **Testing:** Unit tests for business rules, integration tests for API authorization and token lifecycle, and end-to-end tests for employee and client journeys.

No specific technology stack is mandated by this product document. A separate technical design document should recommend the stack based on the company's existing environment and operational constraints.

---

## 13. Acceptance Criteria

The MVP is not complete until all P0 criteria below pass.

1. An unauthenticated user cannot access internal dashboard data or admin APIs.
2. An employee can create a request by selecting at least one active service.
3. The request receives a unique public link that does not reveal internal identifiers or personal data.
4. An authorized employee can copy the link and see its creation status.
5. A client can open a valid link on a mobile device and see the correct service context.
6. A client can choose any rating from 1 to 5 stars; no rating is preselected.
7. Every rating has the same ability to continue to the Google review destination.
8. The client can skip AI, write their own text, and proceed to Google.
9. AI suggestions are optional, editable, and grounded in provided facts.
10. The interface makes clear that AI text must accurately reflect the client's actual experience.
11. Clicking **Continue to Google** opens the configured Google review URL.
12. The app records a link-open event without claiming that a review was posted.
13. Expired and revoked links cannot generate drafts or access the review flow.
14. AI failure does not block manual text entry or Google navigation.
15. Admin can configure the Google review URL and manage services and employees.
16. Public endpoints are rate-limited and do not reveal private employee or client data.
17. No incentive, rating gate, or mandatory employee-name inclusion is present.
18. Tests cover authorization, invalid tokens, expired/revoked tokens, all five ratings, AI failure, and Google-link navigation.

---

## 14. Analytics and Success Metrics

Track operational activity, not unverifiable outcomes.

### MVP metrics

- Number of review requests created.
- Number and percentage of links opened.
- Number of draft-generation attempts and failures.
- Number of text-copy actions.
- Number of clicks to the Google review destination.
- Request counts by service, employee, and time period.
- AI generation latency and estimated cost.

### Metric definitions and limitations

- **Link-open rate:** Unique request links opened / requests created. Define a time window before calculating.
- **Google destination click rate:** Requests with a recorded Google-link click / requests opened.
- **Verified review conversion:** Not available in the MVP unless a compliant, reliable verification mechanism is later established. Do not infer it from link clicks.
- **Rating distribution:** If rating selections are stored, treat them as optional interaction data—not as a verified Google rating or a representative satisfaction survey. Consider not retaining the selected rating at all unless there is a clear product need.

---

## 15. Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Review gating or perceived pressure | Same Google path for all ratings; neutral language; no incentives |
| AI fabricates claims | Strict prompt, structured output validation, editable drafts, tests for unsupported claims |
| Clients think the review is posted automatically | Clear handoff to Google and accurate status labels |
| Token is guessed or shared unintentionally | High-entropy tokens, hashing, expiry/revocation, minimal public data |
| AI costs or abuse increase | Rate limits, quotas, timeouts, usage monitoring |
| Staff attribution appears coercive | Make name optional in client wording and never require it in a review |
| False analytics imply success | Distinguish link clicks from actual Google publication |
| Google changes its policies or link behavior | Review official policy and destination behavior before launch and periodically thereafter |

---

## 16. MVP Scope and Delivery Phases

### Phase 1 — MVP

- Internal login and roles.
- Admin-managed services and employees.
- Create and copy a unique review request link.
- Public client page with service context.
- Optional star selection from 1 to 5.
- Up to three optional AI draft suggestions, plus manual text entry.
- Copy text and open the official Google review destination.
- Basic request/event dashboard.
- Token revocation and basic rate limiting.
- Tests for policy-critical behavior and core flows.

### Phase 2 — Operational improvements

- Optional email/WhatsApp sharing integration, subject to provider and consent requirements.
- Expiring links and configurable retention.
- More languages and service-specific writing guidance.
- CSV reporting and richer internal analytics.
- SSO and stronger organization-level access controls if needed.

### Phase 3 — Only if justified

- Multi-location or multi-brand support.
- Integrations with CRM/helpdesk tools.
- More advanced operational reporting.
- Review outcome reconciliation only if a reliable, policy-compliant method is identified.

Do not add Phase 2 or Phase 3 features to the MVP without a specific business need.

---

## 17. Open Decisions

The product owner should resolve these before implementation is considered production-ready:

1. **Company identity:** Confirm the company display name, logo, and brand styling.
2. **Google destination:** Provide the official Google review URL for the correct business profile.
3. **Service catalogue:** Confirm the exact list of services employees can select.
4. **Employee attribution:** Decide whether the employee selector defaults to the signed-in employee or remains optional.
5. **Access policy:** Confirm whether employees may view only their own requests or all requests.
6. **AI provider:** Select the provider/model, data-processing terms, budget, and supported languages.
7. **Hosting and stack:** Choose the stack and deployment environment in a separate technical design.
8. **Retention:** Set retention periods for request events and any optional client references.
9. **Rating storage:** Decide whether to store the selected rating. Default recommendation: do not retain it unless there is a defined, legitimate use.
10. **Google review link format:** Verify the exact link behavior for the target business profile before launch.

---

## 18. Supporting Documents to Generate from This Specification

Future AI agents should use this file as the canonical product source. They should not silently change the product scope or relax policy-critical requirements.

Recommended supporting documents:

1. `docs/technical-architecture.md` — stack decision, deployment topology, component boundaries, and trade-offs.
2. `docs/database-schema.md` — database tables/collections, indexes, constraints, migrations, and retention.
3. `docs/api-specification.md` — endpoint contracts, request/response schemas, authorization, error codes, and rate limits.
4. `docs/ui-ux-specification.md` — screen inventory, wireframe descriptions, responsive behavior, states, and accessibility.
5. `docs/ai-prompt-specification.md` — versioned prompt templates, schemas, examples, refusal/fallback behavior, and evaluation cases.
6. `docs/security-and-privacy.md` — threat model, access control, token handling, logging, retention, and privacy notice.
7. `docs/test-plan.md` — unit, integration, end-to-end, security, accessibility, and policy-compliance tests.
8. `docs/deployment-runbook.md` — environment variables, secret management, CI/CD, monitoring, backups, and rollback.
9. `docs/implementation-plan.md` — milestones, task breakdown, dependencies, and definition of done.

### Instructions for future AI agents

- Read this document before creating any supporting document or implementing a feature.
- Treat Sections 4, 6.3, 6.4, 6.5, 9, 11, and 13 as policy- and behavior-critical.
- If a technical choice conflicts with this product specification, explain the conflict and propose a change rather than silently changing requirements.
- Do not claim a feature is implemented unless code and tests verify it.
- Mark assumptions as assumptions and list unresolved decisions.
- Keep terminology, entity names, lifecycle statuses, and endpoint behavior consistent across generated documents.
- Prefer the smallest viable MVP. Do not invent features just to make the product appear more complete.

---

## 19. Reference

- Google Maps user-contributed content policy: https://support.google.com/contributionpolicy/answer/7400114
- This document is a product specification, not legal advice. Re-check the official policy and relevant platform requirements before launch.
