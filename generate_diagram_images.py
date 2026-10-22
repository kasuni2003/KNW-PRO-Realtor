import os
import requests
import base64

os.makedirs('diagrams', exist_ok=True)

diagrams = {
    'uc_unified': '''flowchart TB
    Buyer["Property Buyer"]
    Seller["Property Seller"]
    Lawyer["Real Estate Lawyer"]
    Admin["Administrator"]

    subgraph KNW_System ["KNW PRO REALTOR PLATFORM"]
        subgraph Mod_Auth ["Identity and Unified Role Engine"]
            UC1(["Register / Login Single Account"])
            UC2(["In-Place Seller NIC Verification"])
            UC3(["Dynamic Role Mode Switcher"])
        end
        subgraph Mod_Prop ["Property Marketplace Engine"]
            UC4(["Draft and Submit Property"])
            UC5(["Upload Legal Deeds and Surveys"])
            UC6(["Pay Listing Monetization Fee"])
            UC7(["Search and Filter Properties"])
            UC8(["Save Favorites and View Dossier"])
        end
        subgraph Mod_Legal ["LegalTech and Deed Verification"]
            UC9(["Audit Title Deeds and Extracts"])
            UC10(["Issue Legal Clearance Report"])
            UC11(["Award Deed Verified Badge"])
            UC12(["Manage Availability Slots"])
            UC13(["Book and Conduct Video Consultation"])
        end
        subgraph Mod_Admin ["Administrative Governance"]
            UC14(["Audit Seller NIC Documents"])
            UC15(["Approve and Publish Properties"])
            UC16(["Platform Analytics and Revenue"])
        end
    end

    Buyer --> UC1
    Buyer --> UC3
    Buyer --> UC7
    Buyer --> UC8
    Buyer --> UC13

    Seller --> UC1
    Seller --> UC2
    Seller --> UC3
    Seller --> UC4
    Seller --> UC5
    Seller --> UC6

    Lawyer --> UC1
    Lawyer --> UC3
    Lawyer --> UC9
    Lawyer --> UC10
    Lawyer --> UC12
    Lawyer --> UC13

    Admin --> UC1
    Admin --> UC14
    Admin --> UC15
    Admin --> UC16
    Admin --> UC11
''',
    'uc_buyer': '''flowchart LR
    Buyer["Property Buyer"]
    subgraph BoundaryBuyer ["Buyer Subsystem"]
        UC_B1(["Search and Filter Properties"])
        UC_B2(["View Details and Dossier"])
        UC_B3(["Check Deed Verified Badge"])
        UC_B4(["Bookmark Saved Favorites"])
        UC_B5(["Run Financial Calculators"])
        UC_B6(["Submit Property Inquiry"])
        UC_B7(["Book Site Inspection Visit"])
        UC_B8(["Browse Real Estate Lawyers"])
        UC_B9(["Book Video Legal Consultation"])
        UC_B10(["Process Fee via PayHere"])
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
    subgraph BoundarySeller ["Seller Subsystem"]
        UC_S1(["Apply for Seller Privileges"])
        UC_S2(["Switch Mode to Seller"])
        UC_S3(["Create Property Listing Draft"])
        UC_S4(["Upload Title Deeds and Surveys"])
        UC_S5(["Select Monetization Tier"])
        UC_S6(["Pay Listing Fee via PayHere"])
        UC_S7(["Manage Buyer Inquiries"])
        UC_S8(["Confirm Site Visit Requests"])
        UC_S9(["Track Listing Performance"])
    end
    Seller --> UC_S1
    Seller --> UC_S2
    Seller --> UC_S3
    Seller --> UC_S7
    Seller --> UC_S8
    Seller --> UC_S9
    UC_S3 -. "<<include>>" .-> UC_S2
    UC_S3 -. "<<include>>" .-> UC_S4
    UC_S3 -. "<<include>>" .-> UC_S5
    UC_S5 -. "<<include>>" .-> UC_S6
''',
    'uc_lawyer': '''flowchart LR
    Lawyer["Real Estate Lawyer"]
    subgraph BoundaryLawyer ["Legal Practitioner Subsystem"]
        UC_L1(["Manage Lawyer Profile and Fees"])
        UC_L2(["Configure Weekly Time Slots"])
        UC_L3(["Block Dates and Holidays"])
        UC_L4(["Access Deed Verification Queue"])
        UC_L5(["Audit Title Deeds and Survey Plans"])
        UC_L6(["Issue Legal Clearance Report"])
        UC_L7(["View Consultation Calendar"])
        UC_L8(["Conduct Video Consultation"])
        UC_L9(["Publish Legal Advisory Blog"])
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
    subgraph BoundaryAdmin ["Platform Administration Subsystem"]
        UC_A1(["View KPI Analytics Dashboard"])
        UC_A2(["Manage User Accounts and RBAC"])
        UC_A3(["Review Pending Seller NICs"])
        UC_A4(["Approve or Reject Sellers"])
        UC_A5(["Screen Property Listing Drafts"])
        UC_A6(["Approve and Publish Properties"])
        UC_A7(["Toggle Deed Verified Badge"])
        UC_A8(["Audit Payment Transactions"])
        UC_A9(["Moderate Inquiries and Reviews"])
    end
    Admin --> UC_A1
    Admin --> UC_A2
    Admin --> UC_A3
    Admin --> UC_A5
    Admin --> UC_A8
    Admin --> UC_A9
    UC_A3 -. "<<include>>" .-> UC_A4
    UC_A5 -. "<<include>>" .-> UC_A6
    UC_A6 -. "<<extend>>" .-> UC_A7
''',
    'er_diagram': '''erDiagram
    USERS ||--o{ SELLER_PROPERTY_DRAFTS : "publishes (seller_id)"
    USERS ||--o| LAWYER_PROFILES : "maintains"
    USERS ||--o{ LAWYER_AVAILABILITY : "configures"
    USERS ||--o{ LAWYER_UNAVAILABLE_DATES : "blocks"
    USERS ||--o{ APPOINTMENTS : "attends / hosts"
    USERS ||--o{ PROPERTY_INQUIRIES : "sends / receives"
    USERS ||--o{ SAVED_PROPERTIES : "bookmarks"
    USERS ||--o{ PAYMENTS : "executes"
    USERS ||--o{ REVIEWS : "writes"
    USERS ||--o{ BLOG_POSTS : "authors"
    USERS ||--o{ NOTIFICATIONS : "receives"

    SELLER_PROPERTY_DRAFTS ||--o{ PROPERTY_INQUIRIES : "receives inquiries"
    SELLER_PROPERTY_DRAFTS ||--o{ SAVED_PROPERTIES : "saved in"
    SELLER_PROPERTY_DRAFTS ||--o{ PAYMENTS : "monetized by"
    SELLER_PROPERTY_DRAFTS ||--o{ REVIEWS : "evaluated in"

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
        text bio
        string office_location
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
        bigint seller_property_draft_id FK
        bigint appointment_id FK
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
        +payments() HasMany
    }

    class LawyerProfile {
        +bigint id
        +bigint user_id
        +string specialization
        +decimal consultation_fee
        +boolean is_available
        +user() BelongsTo
    }

    class Appointment {
        +bigint id
        +bigint lawyer_id
        +bigint user_id
        +date appointment_date
        +decimal fee_amount
        +string status
        +string video_meeting_url
        +lawyer() BelongsTo
        +customer() BelongsTo
    }

    class PropertyInquiry {
        +bigint id
        +bigint seller_property_draft_id
        +bigint seller_id
        +bigint buyer_id
        +text message
        +boolean is_site_visit
        +property() BelongsTo
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
        r = requests.get(url, timeout=20)
        if r.status_code == 200:
            path = f'diagrams/{name}.png'
            with open(path, 'wb') as f:
                f.write(r.content)
            print(f'Successfully saved {path} ({len(r.content)} bytes)')
        else:
            print(f'Failed {name}: status {r.status_code}')
    except Exception as e:
        print(f'Error downloading {name}: {e}')
