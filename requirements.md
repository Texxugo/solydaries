# Requirements

## Functional Requirements

### Accounts and Access

- People can create accounts using email and password.
- A person must accept the terms and privacy policy before account creation.
- A deactivated account cannot access the platform or perform new actions.
- Visitors can browse public published campaigns and published organization pages.
- Visitors cannot register support, react to posts, or create reports.

### People and Organizations

- A person has the donor role by default.
- A person can request person validation to become a campaign creator in their own name.
- Any authenticated person can create an internal organization and become its initial organization representative.
- A person can be a member of multiple organizations.
- An organization is operated by organization members, not by an organization login.
- An organization must pass organization validation before its page becomes public or it can own campaigns.
- A deactivated organization cannot create campaigns or organization posts.

### Validation

- Person validation and organization validation are separate flows.
- Validation requests can be pending, approved, rejected, or later revoked.
- Rejected validation requests can be resubmitted with corrections.
- Validation documents are private files and visible only to administrators.
- Moderators cannot access validation documents.
- Document consent is required before validation documents are submitted.
- A validation badge can be shown for approved people and organizations.

### Campaigns

- A campaign is a specific, non-recurring initiative.
- A campaign has exactly one campaign owner: either a validated person or a validated organization.
- A person cannot create a campaign in an organization's name using only person validation.
- Organization-owned campaigns require approved organization validation.
- A campaign can have one or more campaign managers.
- A campaign can list informational campaign partners.
- A campaign can accept one or more support types.
- A campaign submitted for review must include title, description, category, owner, locality, accepted support types, deadline or no-deadline indication, need or goal description, and support instructions.
- A campaign creator selects the campaign map pin manually.
- Public campaign map pins use approximate campaign location by default.
- Exact logistics details are shown only when needed to coordinate support.
- A campaign must pass campaign review before publication.
- Material changes to a published campaign require campaign change review.
- Campaign goals do not automatically close a campaign.
- Closed campaigns may have result reports.
- Campaign result reports require approval before public visibility.

### Campaign Discovery

- Visitors and donors can discover published campaigns by locality, support type, category, status, and owner.
- Published campaigns can be shown on a Leaflet/OpenStreetMap map.
- Campaigns can display aggregate confirmed support progress.

### Support

- Donors can register support offers for published campaigns.
- Support types include item donation and volunteer support. Financial donations are outside the MVP scope.
- Item donation details include item, quantity, condition note, coordination preference, and contact information.
- Volunteer support details include availability, type of help, note, and contact information.
- Solydaries does not process or handle financial donations in the MVP.
- Support offers do not require moderation before becoming visible to campaign owners and managers.
- Donors can create, change, or cancel their own pending support offers.
- Campaign owners and managers can confirm or decline support offers.
- Donors cannot confirm their own support offers.
- Campaign progress is based on confirmed support.
- Donors can choose public anonymity while remaining internally traceable.

### Organization Pages and Posts

- A validated organization has a public organization page.
- Organization pages can show identity, contacts, history, campaigns, and posts.
- Organization posts communicate actions, progress, or results and are distinct from campaigns.
- Organization posts can include text, images, and external video links.
- Organization posts can be published, hidden, or suspended.
- Organization posts do not require approval before publication in the MVP.
- Donors can add one reaction per published organization post.
- Public pages show aggregate reaction counts, not reacting donor lists.
- Comments are outside the MVP.

### Reports and Moderation

- Donors can report published campaigns and organization posts.
- Campaign owners or managers can report abusive support offers received by their campaigns.
- Reports are always linked to a specific content item or support offer.
- Moderators review campaign reviews, material campaign changes, result reports, and reports.
- Administrators review validation requests and can also perform moderation.
- Rejections, suspensions, validation revocations, and report resolutions require a moderation decision with a reason.
- Audit records are kept for sensitive actions.

### Notifications and Metrics

- In-app notifications inform relevant people about validation decisions, campaign decisions, support activity, report outcomes, and result-report decisions.
- Public transparency metrics can include published campaigns, closed campaigns, confirmed support, validated organizations, and campaigns by category or locality.
- Transparency metrics do not expose private support details.

## Non-Functional Requirements

- The product interface and user-facing messages use Brazilian Portuguese.
- Private files must not be served from public paths.
- Public and private files must be handled separately.
- Passwords must be stored using a secure hash.
- Administrative and moderation access must enforce role boundaries.
- Sensitive actions must be auditable.
- The MVP must remain implementable as a TCC web application without native mobile apps or external payment processing.
