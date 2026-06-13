# Solydaries

Solydaries is a solidarity platform where people and organizations create, share, and support social campaigns in a safer environment.

## Language

**Account**:
A login identity for a Person to access Solydaries.
_Avoid_: User

**Email Login**:
Account access using an email address and password.
_Avoid_: Social login

**Deactivated Account**:
An Account that can no longer access or perform actions in Solydaries.
_Avoid_: Deleted account

**Person**:
An individual registered on Solydaries.
_Avoid_: Individual user

**Person Public Profile**:
A limited public profile for a Person who creates Campaigns in their own name.
_Avoid_: User profile

**Organization**:
An institution or group registered on Solydaries.
_Avoid_: Institutional user

**Deactivated Organization**:
An Organization that can no longer operate in Solydaries.
_Avoid_: Deleted organization

**Organization Member**:
A Person linked to an Organization with permission to act on its behalf.
_Avoid_: Organization user

**Organization Representative**:
An Organization Member responsible for managing the Organization and requesting organization validation.
_Avoid_: Owner, admin of organization

**Acting Context**:
The Person or Organization identity under which a Person performs an action in Solydaries.
_Avoid_: Current profile

**Organization Page**:
A public profile for an Organization that presents its identity, contacts, history, campaigns, and posts.
_Avoid_: Organization profile

**Published Organization Page**:
An Organization Page visible to Visitors and Donors after Organization Validation approval.
_Avoid_: Active organization page

**Organization Post**:
A text, photo, or video update published on an Organization Page to communicate actions, progress, or results.
_Avoid_: Campaign post, social post

**External Video Link**:
A link to video content hosted outside Solydaries.
_Avoid_: Uploaded video

**Published Organization Post**:
An Organization Post visible on a Published Organization Page.
_Avoid_: Active post

**Hidden Organization Post**:
An Organization Post hidden by an authorized Organization Member.
_Avoid_: Deleted post

**Suspended Organization Post**:
An Organization Post removed from public visibility by moderation.
_Avoid_: Blocked post

**Post Reaction**:
A lightweight engagement action by a Donor on an Organization Post.
_Avoid_: Comment, like

**Report**:
A logged concern about a Campaign, Organization Post, or Support Offer that may require moderation.
_Avoid_: Complaint, flag

**Reportable Content**:
A Published Campaign or Organization Post that may receive Reports.
_Avoid_: Reported thing

**Reportable Offer**:
A Support Offer that may receive a Report because of abuse, spam, or inappropriate coordination.
_Avoid_: Reported support

**Validation Queue**:
The administrative work queue for pending Validation Requests.
_Avoid_: User queue

**Campaign Review Queue**:
The moderation work queue for Pending Review Campaigns.
_Avoid_: Campaign queue

**Campaign Change Queue**:
The moderation work queue for pending Material Campaign Changes.
_Avoid_: Edit queue

**Result Report Queue**:
The moderation work queue for Pending Result Reports.
_Avoid_: Result queue

**Report Queue**:
The moderation work queue for unresolved Reports.
_Avoid_: Complaint queue

**Moderation Decision**:
A recorded outcome of an administrative or moderation review.
_Avoid_: Review result

**Audit Record**:
An internal record of a sensitive action performed in Solydaries.
_Avoid_: Activity log

**In-App Notification**:
A message shown inside Solydaries to inform a Person about relevant validation, campaign, support, report, or result-report events.
_Avoid_: Email notification, push notification

**Transparency Metrics**:
Aggregate public numbers about Solydaries activity and impact.
_Avoid_: Dashboard, analytics

**Product Language**:
Brazilian Portuguese as the language used by Solydaries user interfaces, moderation messages, and user-facing content.
_Avoid_: Multilingual support

**Application Stack**:
The MVP technical foundation using fullstack Next.js, PostgreSQL, Prisma, Auth.js/NextAuth email/password authentication, local development file storage, Leaflet, and OpenStreetMap.
_Avoid_: Tech stack

**Terms Acceptance**:
A recorded acceptance of Solydaries terms and privacy policy by a Person.
_Avoid_: Checkbox

**Document Consent**:
A recorded consent for submitting Validation Documents for administrative review.
_Avoid_: Upload consent

**Donor**:
A role that allows a Person to support campaigns.
_Avoid_: Supporter

**Visitor**:
Someone browsing public Solydaries pages without using an Account.
_Avoid_: Anonymous user

**Campaign Creator**:
A validated role that allows a Person or Organization to create campaigns.
_Avoid_: Creator user

**Creator Validation**:
A review that confirms whether a Person or Organization may become a Campaign Creator.
_Avoid_: User validation

**Person Validation**:
Creator Validation that confirms whether a Person may create Campaigns in their own name.
_Avoid_: Individual validation

**Organization Validation**:
Creator Validation that confirms whether an Organization and its representatives may create Campaigns in the Organization's name.
_Avoid_: Institution validation

**Validation Document**:
A document submitted to support Creator Validation for a Person or Organization.
_Avoid_: Personal document

**Private File**:
A file stored by Solydaries that must not be directly public.
_Avoid_: Hidden upload

**Public File**:
A file stored by Solydaries for public display.
_Avoid_: Public upload

**Validation Request**:
A submitted request for Person Validation or Organization Validation.
_Avoid_: Validation process

**Pending Validation Request**:
A Validation Request waiting for administrative review.
_Avoid_: Waiting validation

**Approved Validation Request**:
A Validation Request that grants Campaign Creator permission.
_Avoid_: Validated request

**Rejected Validation Request**:
A Validation Request that does not grant Campaign Creator permission and may be resubmitted with corrections.
_Avoid_: Denied validation

**Revoked Validation**:
A previously approved validation removed by an Administrator due to later risk, error, or policy violation.
_Avoid_: Invalid validation

**Validation Badge**:
A public indicator that a Person or Organization has approved validation.
_Avoid_: Verified badge

**Campaign Review**:
A review that decides whether a campaign may be published publicly.
_Avoid_: Campaign validation

**Campaign Change Review**:
A review that decides whether a material change to a Published Campaign may become public.
_Avoid_: Edit review

**Material Campaign Change**:
A change to a Published Campaign that affects its purpose, support types, goals, public locality, owner, or main presentation.
_Avoid_: Important edit

**Campaign**:
A specific social initiative created in Solydaries to request goods (item donation) or volunteer support.
_Avoid_: Action, post

**Campaign Owner**:
The Person or Organization that takes public responsibility for a Campaign.
_Avoid_: Campaign responsible, campaign creator

**Campaign Manager**:
An Account authorized to edit and manage a Campaign.
_Avoid_: Campaign owner

**Campaign Partner**:
A Person or Organization presented as supporting a Campaign without being responsible for it.
_Avoid_: Co-owner, co-organizer

**Published Campaign**:
A Campaign that has passed Campaign Review and is visible to Donors.
_Avoid_: Active campaign

**Draft Campaign**:
A Campaign that is being prepared and has not been submitted for Campaign Review.
_Avoid_: Unpublished campaign

**Pending Review Campaign**:
A Campaign submitted for Campaign Review and not yet approved or rejected.
_Avoid_: Waiting campaign

**Rejected Campaign**:
A Campaign that failed Campaign Review and must be changed before it can be published.
_Avoid_: Denied campaign

**Closed Campaign**:
A Campaign that has ended and no longer accepts new Support.
_Avoid_: Finished campaign

**Campaign Result Report**:
A post-campaign account of what was collected, delivered, or achieved.
_Avoid_: Accountability post, result post

**Pending Result Report**:
A Campaign Result Report submitted for moderation before publication.
_Avoid_: Waiting result report

**Published Result Report**:
A Campaign Result Report approved for public visibility.
_Avoid_: Approved result report

**Campaign Deadline**:
The date after which a Campaign may stop accepting new Support.
_Avoid_: End date

**Campaign Goal**:
A measurable target declared by a Campaign, such as item quantity or volunteer count.
_Avoid_: Target

**Campaign Category**:
A classification for a Campaign such as clothing, food, health, education, emergency, or other solidarity areas.
_Avoid_: Campaign type

**Campaign Locality**:
The public city, state, neighborhood, or region associated with a Campaign.
_Avoid_: Campaign address

**Campaign Logistics Point**:
The address or instructions used to coordinate delivery, pickup, or volunteering for a Campaign.
_Avoid_: Public address

**Campaign Map Pin**:
A public map marker that shows the approximate or exact location associated with a Campaign.
_Avoid_: Address marker

**Approximate Campaign Location**:
A public Campaign location that identifies the relevant area without exposing a sensitive exact address.
_Avoid_: Hidden address

**Suspended Campaign**:
A Campaign removed from public visibility by moderation due to a report, safety issue, or policy problem.
_Avoid_: Blocked campaign

**Support**:
A contribution or intention to contribute registered by a Donor for a Campaign.
_Avoid_: Help, contribution

**Support Offer**:
An intention to support a Campaign registered by a Donor but not yet confirmed as received or completed.
_Avoid_: Donation

**Pending Support Offer**:
A Support Offer waiting for campaign-side action.
_Avoid_: Waiting support

**Donor-Cancelled Support Offer**:
A Support Offer cancelled by the Donor before confirmation.
_Avoid_: Cancelled donation

**Manager-Declined Support Offer**:
A Support Offer declined by a Campaign Owner or Campaign Manager.
_Avoid_: Rejected donation

**Confirmed Support**:
Support confirmed by a Campaign Owner or Campaign Manager as received or completed.
_Avoid_: Completed donation

**Publicly Anonymous Support**:
Support that hides the Donor's identity from public pages while remaining internally linked to the Donor.
_Avoid_: Anonymous donation

**Item Donation**:
Support given through physical goods such as clothes, food, materials, or toys.
_Avoid_: Product donation

**Item Donation Details**:
The item, quantity, condition note, coordination preference, and contact information for an Item Donation.
_Avoid_: Item form

**Volunteer Support**:
Support given by offering time or labor to a Campaign.
_Avoid_: Volunteer donation

**Volunteer Support Details**:
The availability, type of help, note, and contact information for Volunteer Support.
_Avoid_: Volunteer form

**Administrator**:
A platform role responsible for managing creator validations, campaign reviews, reports, and platform settings.
_Avoid_: Admin user

**Moderator**:
A platform role responsible for reviewing campaigns, organization posts, and reports.
_Avoid_: Reviewer

## Relationships

- An **Account** belongs to exactly one **Person**
- An **Account** uses **Email Login** in the MVP
- A **Deactivated Account** cannot access Solydaries or perform new actions
- An **Organization** has one or more **Organization Members**
- An **Organization Member** is always a **Person**
- A **Person** may be an **Organization Member** of many **Organizations**
- An **Organization Representative** is an **Organization Member**
- Any authenticated **Person** may create an internal **Organization** and become its initial **Organization Representative**
- A **Deactivated Organization** may not create Campaigns or Organization Posts
- An **Organization** has one **Organization Page**
- An **Organization Page** must pass **Organization Validation** before becoming a **Published Organization Page**
- An **Organization Page** may contain many **Organization Posts**
- An **Organization Post** communicates activity or results, while a **Campaign** requests measurable Support
- Campaigns, Organization Posts, and Campaign Result Reports may include images and External Video Links
- Direct video upload is outside the MVP
- An **Organization Post** may be a **Published Organization Post**, **Hidden Organization Post**, or **Suspended Organization Post**
- A **Donor** may add a **Post Reaction** to a **Published Organization Post**
- A **Donor** may have at most one **Post Reaction** per **Organization Post**
- Public pages show aggregate **Post Reaction** counts, not the list of reacting Donors
- A **Published Campaign** and an **Organization Post** are **Reportable Content**
- A **Support Offer** may be a **Reportable Offer**
- A **Donor** may create a **Report**
- A **Campaign Owner** or **Campaign Manager** may create a **Report** about a **Support Offer** received by their Campaign
- **Administrators** use the **Validation Queue** to process pending **Validation Requests**
- **Moderators** use the **Campaign Review Queue**, **Campaign Change Queue**, **Result Report Queue**, and **Report Queue**
- Rejections, suspensions, validation revocations, and report resolutions require a **Moderation Decision** with a reason
- **Audit Records** are kept for sensitive actions such as validation decisions, document review, campaign decisions, material campaign changes, support confirmation, report resolution, validation revocation, and result-report decisions
- **In-App Notifications** inform relevant Persons about validation decisions, campaign decisions, support activity, report outcomes, and result-report decisions
- **Transparency Metrics** may include published campaigns, closed campaigns, confirmed support, validated organizations, and campaigns by category or locality
- **Transparency Metrics** do not expose private support details
- **Product Language** is Brazilian Portuguese in the MVP
- The MVP uses the **Application Stack**
- A **Person** must provide **Terms Acceptance** to create an **Account**
- A **Person** or **Organization Representative** must provide **Document Consent** before submitting **Validation Documents**
- A **Person** has the **Donor** role by default
- A **Person** may request validation to become a **Campaign Creator**
- A **Person** with approved **Person Validation** may have a **Person Public Profile**
- A **Person Public Profile** may show public name, optional photo, optional description, public campaigns, closed campaigns with result reports, and validation status
- A **Person Public Profile** does not show documents, CPF, email, phone, or address
- An **Organization** may become a **Campaign Creator** through organization validation
- **Creator Validation** may be **Person Validation** or **Organization Validation**
- **Person Validation** applies to a **Person**
- **Organization Validation** applies to an **Organization** and its **Organization Representatives**
- **Person Validation** does not authorize a **Person** to create Campaigns in an **Organization's** name
- A Campaign with an **Organization** as **Campaign Owner** requires approved **Organization Validation**
- A group without acceptable institutional documentation may not act as an **Organization** in Solydaries; its Campaigns must be owned by a validated **Person**
- A **Person** may create a Campaign in their own **Acting Context** only with approved **Person Validation**
- A **Person** may create a Campaign in an **Organization** **Acting Context** only when they are authorized for an Organization with approved **Organization Validation**
- A **Validation Request** may be **Pending Validation Request**, **Approved Validation Request**, or **Rejected Validation Request**
- **Creator Validation** may use one or more **Validation Documents**
- **Validation Documents** are visible only to **Administrators**
- **Validation Documents** are **Private Files**
- Campaign images, Organization Post images, and Campaign Result Report images are **Public Files** when approved for public content
- A **Rejected Validation Request** may be resubmitted with corrections
- A **Revoked Validation** removes Campaign Creator permission but does not automatically remove existing **Published Campaigns**
- A **Person** or **Organization** with approved validation may show a **Validation Badge**
- A **Validation Badge** indicates document-based validation, not a guarantee of all future actions
- A **Campaign Creator** may create **Campaigns**
- A **Campaign** is a specific initiative rather than an automatically recurring program
- A **Campaign** has exactly one **Campaign Owner**
- A **Campaign** may have one or more **Campaign Managers**
- A **Campaign Manager** may manage a **Campaign** without being its **Campaign Owner**
- A **Campaign** may list **Campaign Partners**
- A **Campaign Partner** is not responsible for the **Campaign** unless they are also its **Campaign Owner**
- A **Campaign** may be a **Draft Campaign**, **Pending Review Campaign**, **Rejected Campaign**, **Published Campaign**, **Closed Campaign**, or **Suspended Campaign**
- A **Campaign** must pass **Campaign Review** before becoming a **Published Campaign**
- A **Material Campaign Change** to a **Published Campaign** requires **Campaign Change Review**
- A **Campaign** may have a **Campaign Deadline**
- A **Campaign** may have one or more **Campaign Goals**
- A **Campaign** may accept one or more Support types
- A **Campaign Goal** may relate to a specific Support type
- A **Campaign** has one **Campaign Category**
- A **Campaign** may have a **Campaign Locality**
- A **Campaign** submitted for review must provide a title, description, Campaign Category, Campaign Owner, Campaign Locality, accepted support types, deadline or no-deadline indication, need or goal description, and support instructions
- A **Campaign Creator** selects the **Campaign Map Pin** manually during campaign setup
- A **Campaign Logistics Point** is shown only when needed to coordinate Support
- A **Published Campaign** may show a **Campaign Map Pin** using an **Approximate Campaign Location** by default
- Exact **Campaign Logistics Point** details are revealed only when needed to coordinate Support
- Reaching a **Campaign Goal** does not automatically make a **Campaign** a **Closed Campaign**
- A **Closed Campaign** may have a **Campaign Result Report**
- A **Campaign Result Report** must be approved before becoming a **Published Result Report**
- A **Donor** may register **Support** for a **Published Campaign**
- A **Visitor** may view public **Published Campaigns** and **Organization Pages**
- A **Visitor** may not register **Support**
- **Support** may be an **Item Donation** or **Volunteer Support** (financial donations are outside the MVP scope)
- An **Item Donation** includes **Item Donation Details**
- **Volunteer Support** includes **Volunteer Support Details**
- A **Support Offer** may become **Confirmed Support**
- A **Support Offer** may be a **Pending Support Offer**, **Confirmed Support**, **Donor-Cancelled Support Offer**, or **Manager-Declined Support Offer**
- A **Donor** may create, change, or cancel their own pending **Support Offer**
- A **Support Offer** does not require moderation before becoming visible to the **Campaign Owner** or **Campaign Managers**
- A **Campaign Owner** or **Campaign Manager** may mark a **Support Offer** as **Confirmed Support**
- A **Campaign Owner** or **Campaign Manager** may mark a **Support Offer** as **Manager-Declined Support Offer** with a reason
- A **Donor** may not mark their own **Support Offer** as **Confirmed Support**
- A **Donor** may view their own **Support Offers**
- A **Campaign Owner** or **Campaign Manager** may view Support details needed to coordinate delivery, pickup, or volunteering
- Visitors and unrelated Donors may only view aggregate campaign progress, not private Support details
- A **Donor** may choose **Publicly Anonymous Support**
- **Publicly Anonymous Support** remains internally traceable
- Visitors and Donors may discover **Published Campaigns** by locality, support type, Campaign Category, status, and Campaign Owner
- Campaign progress is based on **Confirmed Support**, not only **Support Offers**
- Solydaries does not process payments or handle financial donations in the MVP
- An **Administrator** may perform **Creator Validation** and **Campaign Review**
- An **Administrator** may access **Validation Documents**
- A **Moderator** may perform **Campaign Review**, **Campaign Change Review**, result-report review, and report resolution
- A **Moderator** may not access **Validation Documents**
- In the MVP, one **Account** may exercise both **Administrator** and **Moderator** responsibilities

## Example dialogue

> **Dev:** "When a **Person** creates an **Account**, can they publish a campaign immediately?"
> **Domain expert:** "No. A **Person** starts as a **Donor** and must be validated before becoming a **Campaign Creator**."

## Flagged ambiguities

- "User" was used broadly for login, person, and role; resolved: use **Account** for login, **Person** for an individual, and roles such as **Donor** or **Campaign Creator** for permissions.
- "Organization account" was rejected; resolved: every **Account** belongs to a **Person**, and an **Organization** is operated by authorized **Organization Members**.
- "Validation" could mean checking the creator identity or approving campaign content; resolved: use **Creator Validation** for the creator and **Campaign Review** for the campaign.
- "Active campaign" is ambiguous; resolved: use **Published Campaign** for public visibility and **Closed Campaign** for campaigns that no longer accept Support.
- "Administrator" and "Moderator" may be assigned to the same Account in the MVP, but they remain distinct domain roles.
- "Campaign Creator" and "Campaign Owner" are distinct: the creator role allows campaign creation, while ownership defines who is publicly responsible for a specific Campaign.
- An **Organization** is operated by **Organization Members** rather than by an impersonal login acting alone.
- "Organization Post" and "Campaign" are distinct: a post communicates activity or results, while a campaign requests measurable support.
- Comments are outside the MVP; **Post Reactions** provide lightweight engagement on Organization Posts.
- "Donation" is ambiguous because an offered item may not have been delivered; resolved: use **Support Offer** before receipt or completion and **Confirmed Support** after confirmation.
- A **Person** may not create a Campaign in an **Organization's** name using only **Person Validation**; organization-owned campaigns require **Organization Validation**.
- MVP scope includes Accounts for Persons, Organization creation through representatives, Person and Organization Validation, Campaign Review and publication, Campaign discovery, Support Offers, Confirmed Support, Organization Pages, Organization Posts with Post Reactions, Reports, moderation suspension, and reviewed Campaign Result Reports.
- MVP scope excludes internal payment processing, comments, internal chat, automatically recurring Campaigns, complex Organization member roles, algorithmic recommendations, and native mobile apps.
- MVP scope excludes email and push notifications; notifications are **In-App Notifications** only.
- Campaign maps use Leaflet with OpenStreetMap, and public pins should avoid exposing sensitive exact addresses by default.
- MVP file storage is local development storage with separate handling for **Public Files** and **Private Files**.
