Entities and Attributes
Setting (Core Settings Management)
id (Primary Key)

category

key

label

color

sortOrder

active (boolean)

createdAt (datetime)

updatedAt (datetime)

Organization
id (Primary Key)

name

priorityId (Foreign Key → Setting)

segmentId (Foreign Key → Setting)

distributorId (Foreign Key → Setting)

accountManager

address

city

state

zipCode

phone

website

notes (text)

createdAt (datetime)

updatedAt (datetime)

createdBy

Contact
id (Primary Key)

organizationId (Foreign Key → Organization)

firstName

lastName

email

phone

roleId (Foreign Key → Setting)

influenceLevelId (Foreign Key → Setting)

decisionRoleId (Foreign Key → Setting)

linkedInUrl

isPrimary (boolean)

notes (text)

createdAt (datetime)

updatedAt (datetime)

createdBy

Product
id (Primary Key)

name

principalId (Foreign Key → Setting)

category

description (text)

price (decimal)

sku

active (boolean)

createdAt (datetime)

updatedAt (datetime)

createdBy

Opportunity
id (Primary Key)

organizationId (Foreign Key → Organization)

contactId (Foreign Key → Contact)

productId (Foreign Key → Product)

stageId (Foreign Key → Setting)

status

probability (int)

estimatedValue (decimal)

expectedCloseDate (datetime)

notes (text)

createdAt (datetime)

updatedAt (datetime)

createdBy

Interaction
id (Primary Key)

organizationId (Foreign Key → Organization)

contactId (Foreign Key → Contact)

opportunityId (Foreign Key → Opportunity)

typeId (Foreign Key → Setting)

subject

notes (text)

scheduledDate (datetime)

completedDate (datetime)

isCompleted (boolean)

createdAt (datetime)

updatedAt (datetime)

createdBy

User
id (Primary Key)

email

firstName

lastName

role

active (boolean)

createdAt (datetime)

updatedAt (datetime)

AuditLog
id (Primary Key)

entityType

entityId

action

oldValues (JSON)

newValues (JSON)

userId (Foreign Key → User)

createdAt (datetime)

Relationships (Described Verbally)
Organization has many Contacts, Interactions, and Opportunities

Contact has many Interactions and Opportunities

Product is featured in many Opportunities

Opportunity generates many Interactions

Settings define:

Organization’s priority, segment, and distributor

Contact’s role, influence level, and decision role

Product’s principal

Opportunity’s pipeline stage

Interaction’s type

User:

Manages Organizations

Creates Interactions

Owns Opportunities

Generates AuditLogs

Key Notes (Domain Context)
Priorities: A–D (Color-coded: Green, Yellow, Orange, Red)

Segments: Fine Dining, Fast Food, Healthcare, Catering, Institutional

Distributors: Sysco, USF, PFG, Direct, Other

Principals: 11 Food Service Brands

Interaction Types: Email, Call, In Person, Demo/Sampled, Quoted Price, Follow-up

Pipeline Stages: Lead Discovery, Contacted, Sampled/Visited, Follow-up, Close
