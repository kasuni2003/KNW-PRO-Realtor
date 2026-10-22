import os
import requests
import base64
from PIL import Image
import io

os.makedirs('diagrams', exist_ok=True)

# Replace any '&' with 'and' to ensure valid Mermaid labels
diagrams = {
    'uc_unified': '''flowchart LR
    Buyer["Property Buyer"]
    Seller["Property Seller"]
    Lawyer["Real Estate Lawyer"]
    Admin["System Administrator"]

    subgraph PlatformBoundary ["KNW PRO REALTOR SYSTEM BOUNDARY"]
        UC_Auth(["Single Account Registration and Role Mode Switching"])
        UC_Verify(["In-Place Seller NIC Verification"])
        UC_Draft(["Submit Property Listing and Upload Deeds"])
        UC_Pay(["Pay Listing Tier Fee via PayHere"])
        UC_Search(["Search Properties and View Deed Verified Badge"])
        UC_Inquiry(["Submit Inquiry and Book Site Visit"])
        UC_DeedAudit(["Audit Title Deeds and Survey Plans"])
        UC_Clearance(["Issue Legal Clearance and Certification"])
        UC_Slots(["Configure Calendar Slots and Blocked Dates"])
        UC_Video(["Book and Conduct Video Legal Consultation"])
        UC_AdminApprove(["Approve Listings and Seller Applications"])
        UC_Dashboard(["Monitor KPI Metrics and Platform Revenue"])
    end

    Buyer --> UC_Auth
    Buyer --> UC_Search
    Buyer --> UC_Inquiry
    Buyer --> UC_Video

    Seller --> UC_Auth
    Seller --> UC_Verify
    Seller --> UC_Draft
    Seller --> UC_Pay
    Seller --> UC_Inquiry

    Lawyer --> UC_Auth
    Lawyer --> UC_DeedAudit
    Lawyer --> UC_Clearance
    Lawyer --> UC_Slots
    Lawyer --> UC_Video

    Admin --> UC_Auth
    Admin --> UC_Verify
    Admin --> UC_AdminApprove
    Admin --> UC_Dashboard
''',
    'uc_buyer': '''flowchart LR
    Buyer["Property Buyer"]
    subgraph BuyerSubsystem ["Buyer Subsystem"]
        UC_B1(["Search and Filter Marketplace"])
        UC_B2(["View Property Dossier and Location"])
        UC_B3(["Verify Certified Deed Status"])
        UC_B4(["Save Favorite Listings with Notes"])
        UC_B5(["Run Mortgage and Stamp Duty Calculators"])
        UC_B6(["Send Property Inquiries"])
        UC_B7(["Schedule Physical Site Inspection"])
        UC_B8(["Browse Real Estate Attorneys"])
        UC_B9(["Book Video Legal Consultation"])
        UC_B10(["Pay Consultation Fee via PayHere"])
    end
    Buyer --> UC_B1
    Buyer --> UC_B2
    Buyer --> UC_B4
    Buyer --> UC_B5
    Buyer --> UC_B6
    Buyer --> UC_B7
    Buyer --> UC_B8
    Buyer --> UC_B9
    UC_B2 -. "<<extend>>" .-> UC_B3
    UC_B7 -. "<<include>>" .-> UC_B6
    UC_B9 -. "<<include>>" .-> UC_B10
''',
    'uc_seller': '''flowchart LR
    Seller["Property Seller"]
    subgraph SellerSubsystem ["Seller Subsystem"]
        UC_S1(["Apply for Seller Privileges via NIC Upload"])
        UC_S2(["Switch Active Mode to Seller"])
        UC_S3(["Create Property Listing Draft"])
        UC_S4(["Upload Title Deeds and Survey Plans"])
        UC_S5(["Run Property Price Estimator"])
        UC_S6(["Select Listing Monetization Tier"])
        UC_S7(["Process Listing Payment via PayHere / Slip"])
        UC_S8(["Manage Buyer Inquiries and Messages"])
        UC_S9(["Confirm and Reschedule Site Visits"])
        UC_S10(["Track Listing Performance and Views"])
    end
    Seller --> UC_S1
    Seller --> UC_S2
    Seller --> UC_S3
    Seller --> UC_S5
    Seller --> UC_S8
    Seller --> UC_S9
    Seller --> UC_S10
    UC_S3 -. "<<include>>" .-> UC_S2
    UC_S3 -. "<<include>>" .-> UC_S4
    UC_S3 -. "<<include>>" .-> UC_S6
    UC_S6 -. "<<include>>" .-> UC_S7
''',
    'uc_lawyer': '''flowchart LR
    Lawyer["Real Estate Lawyer"]
    subgraph LawyerSubsystem ["Legal Conveyancing Subsystem"]
        UC_L1(["Manage Profile, Bio and Consultation Fee"])
        UC_L2(["Configure Weekly Available Time Slots"])
        UC_L3(["Block Dates and Vacation Periods"])
        UC_L4(["Access Property Deed Verification Queue"])
        UC_L5(["Audit Title Deeds, Surveys and Registry Extracts"])
        UC_L6(["Issue Legal Clearance and Deed Notes"])
        UC_L7(["View Consultation Appointments Calendar"])
        UC_L8(["Conduct Secure Video Advisory Sessions"])
        UC_L9(["Author and Publish Legal Blog Posts"])
    end
    Lawyer --> UC_L1
    Lawyer --> UC_L2
    Lawyer --> UC_L3
    Lawyer --> UC_L4
    Lawyer --> UC_L7
    Lawyer --> UC_L8
    Lawyer --> UC_L9
    UC_L4 -. "<<include>>" .-> UC_L5
    UC_L5 -. "<<include>>" .-> UC_L6
''',
    'uc_admin': '''flowchart LR
    Admin["System Administrator"]
    subgraph AdminSubsystem ["Governance and Administration"]
        UC_A1(["View KPI Analytics and Revenue Metrics"])
        UC_A2(["Manage User Accounts and RBAC Permissions"])
        UC_A3(["Review Pending Seller NIC Submissions"])
        UC_A4(["Approve or Reject Seller Applications"])
        UC_A5(["Screen Property Drafts and Legal Uploads"])
        UC_A6(["Approve, Publish or Reject Listings"])
        UC_A7(["Toggle Official 'Deed Verified' Badge"])
        UC_A8(["Audit Lawyer Consultation Payments"])
        UC_A9(["Moderate Property Inquiries and Disputes"])
        UC_A10(["Approve or Reject Legal Blog Posts"])
        UC_A11(["Moderate and Publish Customer Reviews"])
    end
    Admin --> UC_A1
    Admin --> UC_A2
    Admin --> UC_A3
    Admin --> UC_A5
    Admin --> UC_A8
    Admin --> UC_A9
    Admin --> UC_A10
    Admin --> UC_A11
    UC_A3 -. "<<include>>" .-> UC_A4
    UC_A5 -. "<<include>>" .-> UC_A6
    UC_A6 -. "<<extend>>" .-> UC_A7
''',
    'er_diagram': '''erDiagram
    USERS ||--o{ SELLER_PROPERTY_DRAFTS : "publishes"
    USERS ||--o| LAWYER_PROFILES : "maintains"
    USERS ||--o{ LAWYER_AVAILABILITY : "configures"
    USERS ||--o{ APPOINTMENTS : "attends / hosts"
    USERS ||--o{ PROPERTY_INQUIRIES : "sends / receives"
    USERS ||--o{ SAVED_PROPERTIES : "bookmarks"
    USERS ||--o{ PAYMENTS : "executes"
    USERS ||--o{ REVIEWS : "writes"
    USERS ||--o{ BLOG_POSTS : "authors"
    USERS ||--o{ NOTIFICATIONS : "receives"

    SELLER_PROPERTY_DRAFTS ||--o{ PROPERTY_INQUIRIES : "inquiries"
    SELLER_PROPERTY_DRAFTS ||--o{ SAVED_PROPERTIES : "saved in"
    SELLER_PROPERTY_DRAFTS ||--o{ PAYMENTS : "monetized by"
    SELLER_PROPERTY_DRAFTS ||--o{ REVIEWS : "reviews"

    APPOINTMENTS ||--o| PAYMENTS : "settled via"

    USERS {
        bigint id PK
        string name
        string email UK
        string role
        string status
        string seller_status
        string phone
        string nic_number
        string nic_document_path
        text address
        bigint approved_by FK
    }

    SELLER_PROPERTY_DRAFTS {
        bigint id PK
        bigint seller_id FK
        string property_type
        string district
        string expected_price
        string deed_document_path
        string survey_plan_path
        string listing_plan
        decimal listing_fee
        string payment_status
        string status
        string legal_status
        boolean is_deed_verified
    }

    LAWYER_PROFILES {
        bigint id PK
        bigint user_id FK
        string specialization
        decimal consultation_fee
        boolean is_available
    }

    APPOINTMENTS {
        bigint id PK
        bigint lawyer_id FK
        bigint user_id FK
        date appointment_date
        time start_time
        time end_time
        string topic
        decimal fee_amount
        string status
        string video_meeting_url
    }

    PROPERTY_INQUIRIES {
        bigint id PK
        bigint seller_property_draft_id FK
        bigint seller_id FK
        bigint buyer_id FK
        text message
        boolean is_site_visit
        date visit_date
        string visit_status
    }

    PAYMENTS {
        bigint id PK
        bigint user_id FK
        string provider
        string order_id UK
        decimal amount
        string status
        datetime paid_at
    }
''',
    'class_diagram': '''classDiagram
    direction TB
    class User {
        +bigint id
        +string name
        +string email
        +string role
        +string seller_status
        +string status
        +isAdmin() bool
        +isSeller() bool
        +isLawyer() bool
        +canListProperty() bool
        +isApprovedSeller() bool
    }

    class SellerPropertyDraft {
        +bigint id
        +bigint seller_id
        +string property_type
        +string district
        +string expected_price
        +string deed_document_path
        +string survey_plan_path
        +string listing_plan
        +string status
        +boolean is_deed_verified
        +seller() BelongsTo
        +inquiries() HasMany
    }

    class LawyerProfile {
        +bigint id
        +bigint user_id
        +string specialization
        +decimal consultation_fee
        +boolean is_available
    }

    class Appointment {
        +bigint id
        +bigint lawyer_id
        +bigint user_id
        +date appointment_date
        +decimal fee_amount
        +string status
        +string video_meeting_url
    }

    class PropertyInquiry {
        +bigint id
        +bigint seller_property_draft_id
        +bigint seller_id
        +bigint buyer_id
        +text message
        +boolean is_site_visit
    }

    class Payment {
        +bigint id
        +bigint user_id
        +string provider
        +decimal amount
        +string status
    }

    User "1" -- "0..1" LawyerProfile : maintains
    User "1" -- "*" SellerPropertyDraft : creates
    User "1" -- "*" Appointment : schedules
    User "1" -- "*" PropertyInquiry : sends/receives
    SellerPropertyDraft "1" -- "*" PropertyInquiry : receives
    Appointment "1" -- "0..1" Payment : requires
    SellerPropertyDraft "1" -- "*" Payment : monetized_by
'''
}

for name, code in diagrams.items():
    enc = base64.b64encode(code.encode('utf-8')).decode('ascii')
    url = f'https://mermaid.ink/img/{enc}?bgColor=white'
    try:
        r = requests.get(url, timeout=30)
        if r.status_code == 200:
            path = f'diagrams/{name}.png'
            with open(path, 'wb') as f:
                f.write(r.content)
            im = Image.open(io.BytesIO(r.content))
            print(f'Saved {path} -> Dimensions: {im.size} (W x H), Size: {len(r.content)} bytes')
        else:
            print(f'Failed {name}: status {r.status_code}')
    except Exception as e:
        print(f'Error downloading {name}: {e}')
