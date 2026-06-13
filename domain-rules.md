# Domain Rules

## Identity and Access

- Every account belongs to exactly one person.
- Organizations do not have their own login.
- Organizations are operated by organization members.
- A person can act in their own context or in an organization context when authorized.
- A person has the donor role by default.
- A person or organization becomes a campaign creator only after approved validation.

## Validation

- Person validation authorizes campaigns in the person's own name only.
- Organization validation authorizes organization-owned campaigns.
- A person cannot create a campaign in an organization's name using only person validation.
- Groups without acceptable institutional documentation cannot act as organizations.
- A person cannot be the representative of more than 2 active organizations that are still unvalidated (anti-abuse limit for the admin validation queue).
- Validation documents are private and visible only to administrators.
- Rejected validation requests may be resubmitted.
- Revoked validation removes campaign creator permission but does not automatically remove existing published campaigns.
- Validation badges indicate document-based validation, not a guarantee of future conduct.

## Campaign Ownership and Lifecycle

- A campaign has exactly one campaign owner.
- A campaign owner can be a validated person or a validated organization.
- Campaign managers can manage campaigns without being their owner.
- Campaign partners are informational and do not carry responsibility unless they are also the campaign owner.
- Campaign statuses are draft, pending review, rejected, published, closed, and suspended.
- A campaign must pass review before publication.
- Material changes to a published campaign require campaign change review.
- Reaching a campaign goal does not automatically close the campaign.
- A campaign can be closed by deadline or manual action.
- The system never closes campaigns automatically for inactivity.
- Campaigns without activity for 30 days generate an inactivity notification to the campaign owner (or organization representatives), once per inactive period.
- Moderators can see a list of campaigns without recent activity.
- Suspended campaigns are removed from public visibility by moderation.

## Campaign Location

- Campaign locality is public and supports discovery.
- Campaign logistics points are shown only when needed to coordinate support.
- Public map pins should use approximate campaign location by default.
- Campaign creators manually select campaign map pins.

## Support

- Only authenticated donors can register support.
- Visitors can view public campaigns and organization pages but cannot register support.
- A support offer is an intention, not confirmed receipt.
- Confirmed support is marked by the campaign owner or manager.
- Donors cannot confirm their own support.
- Campaign progress is based on confirmed support.
- Support offers can be pending, confirmed, donor-cancelled, or manager-declined.
- Manager-declined support offers require a reason.
- Support details are private between the donor and campaign managers/owner.
- Publicly anonymous support hides donor identity publicly while remaining traceable internally.
- Financial donations are outside the MVP scope; supported support types are item donation and volunteer support only.

## Organization Pages and Posts

- Organization pages become public only after organization validation.
- Organization posts communicate activity or results; campaigns request measurable support.
- Organization posts can be published directly by authorized organization members.
- Organization posts can be hidden by authorized organization members or suspended by moderation.
- Donors can react once per organization post.
- Public reaction display is aggregate only.
- Comments are not part of the MVP.

## Reports, Moderation, and Audit

- Reports must target a concrete published campaign, organization post, or support offer.
- Donors can report public campaigns and organization posts.
- Campaign owners and managers can report support offers received by their campaigns.
- Moderators review campaigns, campaign changes, result reports, and reports.
- Administrators process validation requests and can access validation documents.
- Moderators cannot access validation documents.
- Negative moderation outcomes require a reason.
- Sensitive actions create audit records.

## Files and Media

- Validation documents are private files.
- Campaign images, organization post images, and result report images can become public files after approval or publication rules.
- Direct video upload is outside the MVP.
- Videos are represented by external video links.

## Scope Boundaries

- Solydaries does not process payments and does not handle financial donations (including external ones) in the MVP.
- Solydaries does not provide chat, comments, automatic recurring campaigns, algorithmic recommendations, or native mobile apps in the MVP.
- Notifications are in-app only in the MVP.
