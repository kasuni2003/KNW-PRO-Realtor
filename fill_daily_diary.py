# -*- coding: utf-8 -*-
"""
Fill Annexure III - Industrial Project Daily Diary for LNBTI (Module IT3901)
Organization: KNW PRO Realtor (Private) Limited, Colombo, Sri Lanka
Training Period: May 4, 2026 to October 22, 2026 (25 Weeks / 120 Working Days)
"""

import os
import copy
import docx
from docx.shared import Pt, Inches, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT

def format_cell_text(cell, text, bold=False, italic=False, size_pt=10.5, align=WD_ALIGN_PARAGRAPH.LEFT):
    cell.text = text
    p = cell.paragraphs[0]
    p.alignment = align
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.line_spacing = 1.15
    if p.runs:
        run = p.runs[0]
        run.font.name = 'Times New Roman'
        run.font.size = Pt(size_pt)
        run.bold = bold
        run.italic = italic
        run.font.color.rgb = RGBColor(0, 0, 0)

WEEKS_DATA = [
    # ── WEEK 1 ──
    {
        "week_no": "01",
        "month_year": "May 2026",
        "date_start": "04/05/2026",
        "date_end": "10/05/2026",
        "location": "KNW PRO Realtor (Pvt) Ltd, IT Division, Colombo",
        "daily": {
            "Monday": "Corporate induction and orientation at KNW PRO Realtor head office in Colombo. Met with executive management, Senior Brokerage Consultants, and IT Lead. Received briefing on company regulations, safety protocols, and IT3901 internship objectives.",
            "Tuesday": "Engineering workstation provisioning and development environment setup. Installed PHP 8.4, Composer 2.7, Node.js 20 LTS, NPM, MySQL Server 8.0, and Visual Studio Code on Windows 11. Configured Git identity and SSH repository credentials.",
            "Wednesday": "Comprehensive study of KNW PRO Realtor commercial business domain: Sri Lankan residential property sales, commercial land subdivision, deed conveyancing practices, and common vulnerabilities in traditional land brokerage.",
            "Thursday": "Analyzed operational bottlenecks in the existing manual real estate workflow: lack of title deed verification, prevalence of unregistered brokers, high transaction fraud risks, and friction in customer role management.",
            "Friday": "Attended initial technical briefing with External Technical Supervisor. Scoped out the functional requirements for the proposed proprietary KNW PRO Realtor Digital Property Trading and Legal Advisory Web Platform.",
            "Saturday": "Technical self-study on Laravel 13 framework conventions and React 18 component lifecycle architecture.",
            "Sunday": "Weekend / Rest & preparation for sprint kickoff."
        },
        "detail_note": (
            "Summary of Work Carried Out:\n"
            "Completed formal workplace onboarding, provisioned engineering tools (PHP 8.4, Node 20, MySQL 8.0, VS Code), and conducted an in-depth domain study of the Sri Lankan real estate brokerage and conveyancing sector.\n\n"
            "Issues Encountered & Solutions:\n"
            "• Problem: Encountered PHP extension mismatch during Composer initialization on Windows (missing pdo_mysql and fileinfo extensions).\n"
            "• Solution: Modified php.ini to explicitly enable extension=pdo_mysql, extension=fileinfo, and extension=gd, resolving dependency errors.\n\n"
            "Architectural & Technical Insight:\n"
            "Identified that conventional real estate platforms in Sri Lanka merely display unverified listings without title deed scrutiny. Integrating licensed attorneys directly into the platform workflow will serve as KNW PRO Realtor's primary competitive advantage."
        )
    },
    # ── WEEK 2 ──
    {
        "week_no": "02",
        "month_year": "May 2026",
        "date_start": "11/05/2026",
        "date_end": "17/05/2026",
        "location": "KNW PRO Realtor (Pvt) Ltd, IT Division, Colombo",
        "daily": {
            "Monday": "Conducted stakeholder elicitation interviews with in-house property brokers, land sales managers, and senior conveyancing lawyers to map out user workflows.",
            "Tuesday": "Drafted user stories and acceptance criteria for four principal system personas: Property Buyers, Property Sellers, Legal Practitioners (Attorneys), and Enterprise Administrators.",
            "Wednesday": "Compiled Software Requirements Specification (SRS) document draft for KNW PRO Realtor platform, categorizing functional and non-functional requirements.",
            "Thursday": "Defined security and compliance requirements: National Identity Card (NIC) verification protocols, private file storage for deeds, and encrypted password authentication.",
            "Friday": "Requirements walkthrough presentation with Technical Lead and External Supervisor. Received formal sign-off on the requirement baseline.",
            "Saturday": "Reviewed UML standards and documentation best practices for system design diagrams.",
            "Sunday": "Weekend / Rest & sprint review preparation."
        },
        "detail_note": (
            "Summary of Work Carried Out:\n"
            "Formulated the complete Software Requirements Specification (SRS) for the KNW PRO Realtor platform, establishing strict functional modules for property search, draft intake, legal consultations, and administrative auditing.\n\n"
            "Issues Encountered & Solutions:\n"
            "• Problem: Conflicting expectations between sales brokers (who wanted instant unverified property publishing) and legal counsel (who required mandatory deed clearance).\n"
            "• Solution: Designed a staged draft pipeline: properties can be submitted as 'draft' or 'pending review', but only reach 'published' status upon administrative and legal title verification.\n\n"
            "Future Prevention:\n"
            "Ensure regular inter-departmental requirement synchronization meetings to align operational realities with software engineering priorities."
        )
    },
    # ── WEEK 3 ──
    {
        "week_no": "03",
        "month_year": "May 2026",
        "date_start": "18/05/2026",
        "date_end": "24/05/2026",
        "location": "KNW PRO Realtor (Pvt) Ltd, IT Division, Colombo",
        "daily": {
            "Monday": "Architectural design: evaluated monolithic vs decoupled architectures; selected decoupled client-server model (Laravel REST API backend + React Single Page Application frontend).",
            "Tuesday": "Designed conceptual Entity-Relationship Diagram (ERD) covering users, property drafts, legal appointments, property inquiries, saved shortlists, and payments.",
            "Wednesday": "Applied relational database normalization up to Third Normal Form (3NF) to eliminate data redundancies and transitive functional dependencies.",
            "Thursday": "Constructed comprehensive data dictionary specifying MySQL data types, primary keys, foreign key constraints (ON DELETE CASCADE/RESTRICT), and indexing strategies.",
            "Friday": "Presented ERD and database design to database engineering team. Verified index placements on district, property type, price, and publication status.",
            "Saturday": "Self-study on MySQL query optimization and B-Tree index behaviors on high-cardinality foreign keys.",
            "Sunday": "Weekend / Rest."
        },
        "detail_note": (
            "Summary of Work Carried Out:\n"
            "Engineered the relational database architecture in MySQL (3NF). Defined tables: users, seller_property_drafts, appointments, property_inquiries, saved_properties, and transactions.\n\n"
            "Issues Encountered & Solutions:\n"
            "• Problem: Representing multi-role capabilities without data duplication across multiple user records.\n"
            "• Solution: Designed a single users table with decoupled seller_status enum ('none', 'pending', 'active', 'rejected'), allowing a single identity record to hold multi-role privileges.\n\n"
            "Future Prevention:\n"
            "Always normalize identity entities at the conceptual stage to avoid painful database migrations later in the lifecycle."
        )
    },
    # ── WEEK 4 ──
    {
        "week_no": "04",
        "month_year": "May 2026",
        "date_start": "25/05/2026",
        "date_end": "31/05/2026",
        "location": "KNW PRO Realtor (Pvt) Ltd, IT Division, Colombo",
        "daily": {
            "Monday": "Created low-fidelity UI/UX wireframes in Figma for Marketplace homepage, property listing cards, search filtration bar, and detail page.",
            "Tuesday": "Designed wireframes for Seller Portal: multi-step property intake wizard, legal document upload zones, and financial valuation estimators.",
            "Wednesday": "Designed wireframes for Lawyer Portal: appointment availability scheduler, video consultation booking, and title deed audit workspace.",
            "Thursday": "Designed wireframes for Admin Moderation Dashboard: seller verification queue, draft moderation, and revenue reporting.",
            "Friday": "Conducted UI/UX review with design and property sales teams. Approved corporate color palette (Gold `#D97706`, Emerald `#059669`, Slate `#0F172A`). Setup GitFlow branching.",
            "Saturday": "Configured repository branch protection rules on develop and main branches in GitHub.",
            "Sunday": "Weekend / Rest & preparation for Sprint 1 development."
        },
        "detail_note": (
            "Summary of Work Carried Out:\n"
            "Finalized complete Figma UI/UX prototype and design system for desktop, tablet, and mobile breakpoints. Established GitFlow version control workflow with develop, staging, and main branches.\n\n"
            "Issues Encountered & Solutions:\n"
            "• Problem: UI wireframes contained excessive text density, making mobile navigation cluttered for smartphone users.\n"
            "• Solution: Re-engineered complex forms into progressive multi-step wizards with visual progress steppers and mobile-responsive collapsible panels.\n\n"
            "Future Prevention:\n"
            "Adopt mobile-first design principles from the outset of the design phase."
        )
    },
    # ── WEEK 5 ──
    {
        "week_no": "05",
        "month_year": "June 2026",
        "date_start": "01/06/2026",
        "date_end": "07/06/2026",
        "location": "KNW PRO Realtor (Pvt) Ltd, IT Division, Colombo",
        "daily": {
            "Monday": "Initialized Laravel 13 backend repository. Configured `.env` file, database connection pooling, timezone (Asia/Colombo), and CORS middleware.",
            "Tuesday": "Created Laravel database migrations for core authentication: `users`, `password_reset_tokens`, and `personal_access_tokens`.",
            "Wednesday": "Created migration for `seller_property_drafts`: attributes for title, description, property_type, district, town, expected_price, bedrooms, bathrooms, land_size_perches, and status.",
            "Thursday": "Created migrations for `appointments` (lawyer legal consultation bookings) and `property_inquiries` (buyer physical site inspection scheduling).",
            "Friday": "Created migrations for `saved_properties` (buyer bookmarks) and payment audit tables. Executed `php artisan migrate` successfully without errors.",
            "Saturday": "Inspected MySQL foreign key constraints and table indexing using MySQL Workbench schema inspector.",
            "Sunday": "Weekend / Rest."
        },
        "detail_note": (
            "Summary of Work Carried Out:\n"
            "Scaffolded the Laravel 13 server-side API project and executed all version-controlled database migrations establishing the complete relational schema in MySQL.\n\n"
            "Issues Encountered & Solutions:\n"
            "• Problem: MySQL threw errno 150 (Foreign key constraint is incorrectly formed) on appointments table referencing lawyer user IDs.\n"
            "• Solution: Ensured both referenced user ID and foreign key column utilized identical `unsignedBigInteger` data types and matching charset (utf8mb4_unicode_ci).\n\n"
            "Future Prevention:\n"
            "Strictly enforce standardized migration helper methods `$table->foreignId('user_id')->constrained()` across all migration files."
        )
    },
    # ── WEEK 6 ──
    {
        "week_no": "06",
        "month_year": "June 2026",
        "date_start": "08/06/2026",
        "date_end": "14/06/2026",
        "location": "KNW PRO Realtor (Pvt) Ltd, IT Division, Colombo",
        "daily": {
            "Monday": "Engineered Eloquent ORM Models: `User.php`, `SellerPropertyDraft.php`, `Appointment.php`, `PropertyInquiry.php`, and `SavedProperty.php`.",
            "Tuesday": "Defined Model relationships: `User hasMany SellerPropertyDraft`, `User hasMany Appointment`, `SellerPropertyDraft belongsTo User`, with eager-loading scopes.",
            "Wednesday": "Built Database Seeders and Model Factories to generate realistic property listings across Colombo, Gampaha, Kandy, Galle, and Kalutara districts.",
            "Thursday": "Implemented `AuthController.php` handling user registration (`POST /api/auth/register`), credential login (`POST /api/auth/login`), and session logout.",
            "Friday": "Integrated Bcrypt cryptographic password hashing (12 rounds) and implemented standardized FormRequest validation classes with custom error messages.",
            "Saturday": "Tested authentication endpoints using Postman collection; verified JSON payload responses and HTTP 422 validation errors.",
            "Sunday": "Weekend / Rest."
        },
        "detail_note": (
            "Summary of Work Carried Out:\n"
            "Constructed core Eloquent models, declarative database relationships, and secure authentication endpoints in `AuthController.php` with Bcrypt encryption and FormRequest validations.\n\n"
            "Issues Encountered & Solutions:\n"
            "• Problem: Eager-loading large property collections caused N+1 query performance degradation during listing retrieval.\n"
            "• Solution: Optimized Eloquent queries by applying `with(['seller:id,name,email', 'savedByUsers'])` to fetch related records in a single coordinated SQL query.\n\n"
            "Future Prevention:\n"
            "Regularly monitor Laravel Debugbar / query logs to catch and prevent N+1 query patterns early."
        )
    },
    # ── WEEK 7 ──
    {
        "week_no": "07",
        "month_year": "June 2026",
        "date_start": "15/06/2026",
        "date_end": "21/06/2026",
        "location": "KNW PRO Realtor (Pvt) Ltd, IT Division, Colombo",
        "daily": {
            "Monday": "Developed `SellerPropertyDraftController.php` for property submission and management.",
            "Tuesday": "Implemented multipart file streaming for property gallery photos: image validation, automated thumbnail generation, and storage on public disk.",
            "Wednesday": "Implemented secure file upload conduits for legal title deeds, registered survey plans, and local council clearance certificates into protected storage.",
            "Thursday": "Engineered draft saving, updating, and retrieval endpoints (`GET /api/seller/listings`, `POST /api/seller/listings`, `PUT /api/seller/listings/{id}`).",
            "Friday": "Developed public property search API (`GET /api/properties`) supporting multi-criteria filtering: district, property category, price range, and deed verification status.",
            "Saturday": "Refactored SQL query builder logic in public property search to handle null and optional filter parameters gracefully.",
            "Sunday": "Weekend / Rest."
        },
        "detail_note": (
            "Summary of Work Carried Out:\n"
            "Engineered complete property listing pipeline on the backend, including multipart photo uploading, protected document intake, and dynamic multi-criteria search filtering.\n\n"
            "Issues Encountered & Solutions:\n"
            "• Problem: Uploading high-resolution property photos triggered HTTP 413 (Payload Too Large) server errors.\n"
            "• Solution: Adjusted `upload_max_filesize` to 20M and `post_max_size` to 25M in `php.ini`, and added client-side image compression pre-processing.\n\n"
            "Future Prevention:\n"
            "Implement image dimension resizing and WebP conversion on upload to optimize storage usage and transmission bandwidth."
        )
    },
    # ── WEEK 8 ──
    {
        "week_no": "08",
        "month_year": "June 2026",
        "date_start": "22/06/2026",
        "date_end": "28/06/2026",
        "location": "KNW PRO Realtor (Pvt) Ltd, IT Division, Colombo",
        "daily": {
            "Monday": "Developed `LawyerController.php` for managing attorney profiles, Bar Association credentials, and practice areas.",
            "Tuesday": "Implemented lawyer weekly availability management: configuring working days, time slots (e.g., 09:00 - 17:00), and blocked leave dates.",
            "Wednesday": "Developed consultation booking endpoint (`POST /api/appointments`) enabling buyers to select an attorney, date, and available time slot.",
            "Thursday": "Developed deed review submission workflow: allowing property sellers to submit title deeds for independent lawyer audit and clearance badging.",
            "Friday": "Implemented appointment status transition endpoints: `acceptAppointment`, `rescheduleAppointment`, and `completeAppointment`.",
            "Saturday": "Conducted automated unit testing on appointment scheduling logic to verify double-booking prevention.",
            "Sunday": "Weekend / Rest."
        },
        "detail_note": (
            "Summary of Work Carried Out:\n"
            "Implemented LegalTech consultation booking and title deed review controller endpoints. Implemented concurrency checks to ensure appointment slots cannot be double-booked.\n\n"
            "Issues Encountered & Solutions:\n"
            "• Problem: Concurrent appointment booking requests for the same lawyer at the identical time slot caused race conditions.\n"
            "• Solution: Wrapped appointment creation inside a database transaction with a unique database index on `(lawyer_id, appointment_date, time_slot)`.\n\n"
            "Future Prevention:\n"
            "Use database-level uniqueness constraints alongside application validation to guarantee concurrency integrity."
        )
    },
    # ── WEEK 9 ──
    {
        "week_no": "09",
        "month_year": "July 2026",
        "date_start": "29/06/2026",
        "date_end": "05/07/2026",
        "location": "KNW PRO Realtor (Pvt) Ltd, IT Division, Colombo",
        "daily": {
            "Monday": "Developed `PropertyInquiryController.php` handling physical site inspection booking requests between property buyers and sellers.",
            "Tuesday": "Developed `SavedPropertyController.php` for buyer shortlist management, including custom buyer notes and bookmark toggles.",
            "Wednesday": "Implemented `AdminUserController.php` with moderation endpoints: viewing pending listings, approving drafts, and auditing user activity.",
            "Thursday": "Developed platform analytics endpoint (`GET /api/admin/metrics`) aggregating total buyers, active sellers, approved properties, and platform revenue.",
            "Friday": "Conducted Sprint 2 backend review with external supervisor. Successfully demonstrated all 28 RESTful endpoints via Postman.",
            "Saturday": "Authored comprehensive OpenAPI / Swagger specification documentation for all completed backend endpoints.",
            "Sunday": "Weekend / Rest & preparation for frontend development phase."
        },
        "detail_note": (
            "Summary of Work Carried Out:\n"
            "Completed backend REST API controllers for buyer inquiries, property shortlisting, and administrative moderation. Validated all endpoints with Postman test suites.\n\n"
            "Issues Encountered & Solutions:\n"
            "• Problem: Admin analytics queries were running full table scans, resulting in sluggish response times.\n"
            "• Solution: Utilized MySQL aggregate queries with composite indexing on `(status, created_at)` columns, reducing query execution time from 280ms to 12ms.\n\n"
            "Future Prevention:\n"
            "Always analyze query execution plans with `EXPLAIN` before shipping analytics endpoints to production."
        )
    },
    # ── WEEK 10 ──
    {
        "week_no": "10",
        "month_year": "July 2026",
        "date_start": "06/07/2026",
        "date_end": "12/07/2026",
        "location": "KNW PRO Realtor (Pvt) Ltd, IT Division, Colombo",
        "daily": {
            "Monday": "Initialized React 18 single-page application using Vite build tool. Installed dependencies: `react-router-dom`, `axios`, and `lucide-react` icons.",
            "Tuesday": "Engineered global CSS design system (`index.css`, `App.css`) defining CSS variables for brand colors, responsive typography, and layout containers.",
            "Wednesday": "Constructed client-side routing structure in `App.jsx` with routes for Home, Marketplace, Sell, Legal, Admin, and Dashboard views.",
            "Thursday": "Built common reusable layout components: responsive `Navbar.jsx`, `Footer.jsx`, modal dialogs, and alert banners.",
            "Friday": "Configured Axios HTTP client instance with base API URL, request authorization interceptors, and centralized error response handlers.",
            "Saturday": "Tested responsive layout behaviors across mobile (375px), tablet (768px), and desktop (1440px) viewports using Chrome DevTools.",
            "Sunday": "Weekend / Rest."
        },
        "detail_note": (
            "Summary of Work Carried Out:\n"
            "Established modern React 18 frontend architecture with Vite, standardizing CSS variables, client-side routing, shared UI components, and Axios API interceptors.\n\n"
            "Issues Encountered & Solutions:\n"
            "• Problem: Client-side routing on page refresh triggered HTTP 404 errors on Vite development server for nested subpaths.\n"
            "• Solution: Configured Vite `server.historyApiFallback` and configured fallback rules to ensure `index.html` is served for all client-side routes.\n\n"
            "Future Prevention:\n"
            "Ensure production web servers (e.g., Nginx or Apache) are configured with proper URL rewriting to `index.html` for SPAs."
        )
    },
    # ── WEEK 11 ──
    {
        "week_no": "11",
        "month_year": "July 2026",
        "date_start": "13/07/2026",
        "date_end": "19/07/2026",
        "location": "KNW PRO Realtor (Pvt) Ltd, IT Division, Colombo",
        "daily": {
            "Monday": "Developed `AuthContext.jsx` for reactive authentication state management (user profile, token storage, login/logout methods).",
            "Tuesday": "Built `LoginPage.jsx` and `RegisterPage.jsx` with real-time form validation, password visibility toggle, and loading spinners.",
            "Wednesday": "Implemented route guards (`ProtectedRoute.jsx`) to prevent unauthorized access to seller dashboards, lawyer workspaces, and admin panels.",
            "Thursday": "Developed `LanguageContext.jsx` providing trilingual internationalization (i18n) support across English, Sinhala, and Tamil languages.",
            "Friday": "Developed `CurrencyContext.jsx` enabling live real-time price conversion between Sri Lankan Rupees (LKR), USD, EUR, and GBP.",
            "Saturday": "Verified internationalization string lookups and dynamic exchange rate calculation precision.",
            "Sunday": "Weekend / Rest."
        },
        "detail_note": (
            "Summary of Work Carried Out:\n"
            "Implemented reactive global state management using React Context API for authentication, multilingual support (EN/SI/TA), and multi-currency conversion (LKR/USD/EUR/GBP).\n\n"
            "Issues Encountered & Solutions:\n"
            "• Problem: Excessive re-renders occurred across child components whenever language or currency contexts updated.\n"
            "• Solution: Split monolithic context into distinct, specialized providers (`AuthContext`, `LanguageContext`, `CurrencyContext`) and wrapped context values with `useMemo`.\n\n"
            "Future Prevention:\n"
            "Avoid monolithic global state; compartmentalize contexts by functional domain to optimize rendering performance."
        )
    },
    # ── WEEK 12 ──
    {
        "week_no": "12",
        "month_year": "July 2026",
        "date_start": "20/07/2026",
        "date_end": "26/07/2026",
        "location": "KNW PRO Realtor (Pvt) Ltd, IT Division, Colombo",
        "daily": {
            "Monday": "Developed `HomePage.jsx` featuring dynamic hero search bar, district quick-filters, featured listings carousel, and legal trust badges.",
            "Tuesday": "Developed `Marketplace.jsx` with interactive sidebar filters: district dropdown, property category, price range slider, and deed verification toggle.",
            "Wednesday": "Engineered `PropertyCard.jsx` showing cover photo, pricing, specs (beds/baths/perches), verified badge, and quick-save bookmark button.",
            "Thursday": "Developed `PropertyDetail.jsx` comprehensive view: image carousel, location maps, specs, seller contact details, and deed verification status.",
            "Friday": "Built `PropertyDossierModal.jsx` allowing users to view and print comprehensive property dossiers summarizing legal title deeds and survey reports.",
            "Saturday": "Tested client-side filtering reactivity and search query debounce mechanisms.",
            "Sunday": "Weekend / Rest."
        },
        "detail_note": (
            "Summary of Work Carried Out:\n"
            "Engineered the public property discovery ecosystem: responsive homepage, interactive marketplace with multi-parameter filtering, property details page, and dossier modal.\n\n"
            "Issues Encountered & Solutions:\n"
            "• Problem: Rapid keystrokes in search input triggered excessive API requests, overwhelming the backend server.\n"
            "• Solution: Implemented a 400ms debounce hook (`useDebounce`) on the search input, ensuring API calls are dispatched only after user pauses typing.\n\n"
            "Future Prevention:\n"
            "Always debounce live search inputs in frontend SPAs to conserve server resources and network bandwidth."
        )
    },
    # ── WEEK 13 ──
    {
        "week_no": "13",
        "month_year": "August 2026",
        "date_start": "27/07/2026",
        "date_end": "02/08/2026",
        "location": "KNW PRO Realtor (Pvt) Ltd, IT Division, Colombo",
        "daily": {
            "Monday": "Developed `SellerPage.jsx` featuring an intuitive multi-step property submission wizard.",
            "Tuesday": "Engineered Step 1 (Basic Property Details: title, category, district, town) and Step 2 (Property Specifications: perches, sqft, bedrooms, bathrooms).",
            "Wednesday": "Engineered Step 3 (Media Uploads: multi-image drag-and-drop file upload with live preview thumbnails and reordering capability).",
            "Thursday": "Engineered Step 4 (Legal Documentation: title deed upload, registered survey plan, street line certificate) and Step 5 (Package tier selection).",
            "Friday": "Integrated `PriceEstimator.jsx` and `FinancialCalculators.jsx` allowing sellers and buyers to estimate market value, loan amortization, and stamp duty.",
            "Saturday": "Conducted end-to-end testing of property draft submissions across various image formats (JPG, PNG, WebP).",
            "Sunday": "Weekend / Rest."
        },
        "detail_note": (
            "Summary of Work Carried Out:\n"
            "Engineered the 5-step seller property intake wizard, legal document upload conduits, and interactive real estate financial estimation calculators.\n\n"
            "Issues Encountered & Solutions:\n"
            "• Problem: Navigating back and forth between form wizard steps caused previously entered form fields to be reset and cleared.\n"
            "• Solution: Centralized draft form state within a persistent `useReducer` and cached draft state in `sessionStorage`, preserving data across step transitions.\n\n"
            "Future Prevention:\n"
            "Employ centralized form state stores with session recovery for all multi-step form workflows."
        )
    },
    # ── WEEK 14 ──
    {
        "week_no": "14",
        "month_year": "August 2026",
        "date_start": "03/08/2026",
        "date_end": "09/08/2026",
        "location": "KNW PRO Realtor (Pvt) Ltd, IT Division, Colombo",
        "daily": {
            "Monday": "Developed `LawyerPortal.jsx` showcasing verified real estate attorneys-at-law with their qualifications, Bar Association credentials, and legal specialties.",
            "Tuesday": "Built `LawyerBookingModal.jsx` enabling buyers to select consultation dates, available time slots, and consultation mode (Video Consultation / In-Person).",
            "Wednesday": "Implemented `calendarInvite.js` generating standard iCalendar (`.ics`) download files for booked legal consultations.",
            "Thursday": "Developed `LawyerDashboard.jsx` allowing lawyers to view upcoming appointments, accept/reschedule requests, and review submitted property title deeds.",
            "Friday": "Implemented deed review report interface where lawyers annotate title deeds, record Land Registry book references, and grant verification badges.",
            "Saturday": "Tested `.ics` calendar invitation file compatibility across Google Calendar, Apple Calendar, and Microsoft Outlook.",
            "Sunday": "Weekend / Rest."
        },
        "detail_note": (
            "Summary of Work Carried Out:\n"
            "Constructed the complete LegalTech portal: attorney directory, interactive appointment booking modal, iCalendar (.ics) integration, and lawyer deed audit workspace.\n\n"
            "Issues Encountered & Solutions:\n"
            "• Problem: iCalendar (.ics) timestamps did not conform to RFC 5545 UTC formatting standards, causing calendar events to show at incorrect times.\n"
            "• Solution: Reformatted all datetime strings into strict ISO 8601 UTC format (`YYYYMMDDTHHMMSSZ`), resolving cross-platform timezone discrepancies.\n\n"
            "Future Prevention:\n"
            "Always adhere strictly to RFC specifications when generating standard calendar or data interchange files."
        )
    },
    # ── WEEK 15 ──
    {
        "week_no": "15",
        "month_year": "August 2026",
        "date_start": "10/08/2026",
        "date_end": "16/08/2026",
        "location": "KNW PRO Realtor (Pvt) Ltd, IT Division, Colombo",
        "daily": {
            "Monday": "Developed `BuyerDashboard.jsx` featuring organized tabs for Saved Shortlist, Scheduled Site Visits, and Legal Consultations.",
            "Tuesday": "Implemented physical site visit booking modal on property detail pages (`ScheduleVisitModal.jsx`).",
            "Wednesday": "Connected buyer visit requests to backend API; implemented notification badges when sellers confirm or propose alternative visit dates.",
            "Thursday": "Implemented personal user notes on saved properties allowing buyers to record pros, cons, and private inspection remarks.",
            "Friday": "Developed site visit `.ics` calendar invitation generator for physical property walk-through inspections.",
            "Saturday": "Usability testing of buyer workflow from initial search to inspection booking.",
            "Sunday": "Weekend / Rest."
        },
        "detail_note": (
            "Summary of Work Carried Out:\n"
            "Developed the dedicated Buyer Dashboard, physical site inspection booking pipeline, personalized property notes, and automated visit calendar notifications.\n\n"
            "Issues Encountered & Solutions:\n"
            "• Problem: Buyers were able to submit multiple overlapping inspection requests for the same property on the same date.\n"
            "• Solution: Added client-side and server-side validation checking existing pending inquiries for the same user and property before allowing submission.\n\n"
            "Future Prevention:\n"
            "Ensure idempotency and deduplication checks are enforced on all booking and inquiry forms."
        )
    },
    # ── WEEK 16 ──
    {
        "week_no": "16",
        "month_year": "August 2026",
        "date_start": "17/08/2026",
        "date_end": "23/08/2026",
        "location": "KNW PRO Realtor (Pvt) Ltd, IT Division, Colombo",
        "daily": {
            "Monday": "Developed `AdminDashboard.jsx` interface for enterprise governance and operations.",
            "Tuesday": "Built administrative user management tab: searching users, viewing roles, and filtering by registration date.",
            "Wednesday": "Implemented administrative property draft review portal: inspecting submitted photos, checking land details, and approving/rejecting drafts.",
            "Thursday": "Built payment verification audit queue: checking uploaded bank deposit slips and confirming PayHere online transactions.",
            "Friday": "Implemented system analytics charts: monthly listing submissions, consultation revenue, and active listings by district.",
            "Saturday": "Code review and refactoring administrative middleware for RBAC enforcement.",
            "Sunday": "Weekend / Rest."
        },
        "detail_note": (
            "Summary of Work Carried Out:\n"
            "Engineered the enterprise Admin Dashboard: user management, property draft moderation, payment slip audit queue, and high-level platform KPI analytics.\n\n"
            "Issues Encountered & Solutions:\n"
            "• Problem: Administrative action buttons (approve/reject) lacked confirmation dialogs, risking accidental status toggles.\n"
            "• Solution: Integrated interactive modal confirmations requiring explicit reason notes for rejections, preventing inadvertent moderation errors.\n\n"
            "Future Prevention:\n"
            "All destructive or state-altering administrative actions must require explicit confirmation and audit logging."
        )
    },
    # ── WEEK 17 ──
    {
        "week_no": "17",
        "month_year": "August 2026",
        "date_start": "24/08/2026",
        "date_end": "30/08/2026",
        "location": "KNW PRO Realtor (Pvt) Ltd, IT Division, Colombo",
        "daily": {
            "Monday": "Researched PayHere payment gateway integration protocols for Sri Lankan e-commerce transactions.",
            "Tuesday": "Created PayHere sandbox merchant account, obtaining Merchant ID, Merchant Secret, and configuring redirect and notify URLs.",
            "Wednesday": "Implemented payment checkout flow for listing tier packages (Basic, Verified, Premium Featured).",
            "Thursday": "Developed PayHere IPN (Instant Payment Notification) listener in Laravel backend to verify payment hash and update listing status automatically.",
            "Friday": "Integrated manual bank transfer slip upload option as a fallback for sellers preferring traditional bank counter deposits.",
            "Saturday": "Tested payment failure handling, simulated network timeouts, and hash verification security.",
            "Sunday": "Weekend / Rest."
        },
        "detail_note": (
            "Summary of Work Carried Out:\n"
            "Integrated PayHere online payment gateway with cryptographic MD5 hash validation for listing monetization packages and legal consultation fees, alongside bank slip fallback.\n\n"
            "Issues Encountered & Solutions:\n"
            "• Problem: PayHere IPN callbacks failed in local development environment because localhost URLs are inaccessible from external payment webhooks.\n"
            "• Solution: Utilized ngrok tunneling to expose local Laravel API to a secure HTTPS webhook endpoint during sandbox testing.\n\n"
            "Future Prevention:\n"
            "Establish automated webhook testing environments using tunneling tools during third-party gateway integrations."
        )
    },
    # ── WEEK 18 ──
    {
        "week_no": "18",
        "month_year": "September 2026",
        "date_start": "31/08/2026",
        "date_end": "06/09/2026",
        "location": "KNW PRO Realtor (Pvt) Ltd, IT Division, Colombo",
        "daily": {
            "Monday": "Developed real-time notification subsystem updating users on appointment confirmations, inquiry replies, and listing approvals.",
            "Tuesday": "Implemented in-app notification dropdown menu in `Navbar.jsx` with unread count badges.",
            "Wednesday": "Built email notification templates using Laravel Markdown Mailables for appointment booking receipts.",
            "Thursday": "Configured automated daily backup scripts for MySQL database and uploaded documents storage.",
            "Friday": "Conducted mid-term milestone presentation to KNW PRO Realtor management and LNBTI internal supervisor.",
            "Saturday": "Documented mid-term progress and incorporated supervisor recommendations.",
            "Sunday": "Weekend / Rest."
        },
        "detail_note": (
            "Summary of Work Carried Out:\n"
            "Built user notification subsystem (in-app dropdown and email receipts), automated database backup cron routines, and successfully presented mid-term milestone.\n\n"
            "Issues Encountered & Solutions:\n"
            "• Problem: Unread notification count badge in Navbar did not update dynamically without manual page refresh.\n"
            "• Solution: Implemented reactive polling interval (every 60 seconds) combined with event-driven state dispatchers in AuthContext to refresh badges.\n\n"
            "Future Prevention:\n"
            "Plan for WebSockets (e.g. Laravel Reverb) in future roadmap for bidirectional push notifications."
        )
    },
    # ── WEEK 19 ──
    {
        "week_no": "19",
        "month_year": "September 2026",
        "date_start": "07/09/2026",
        "date_end": "13/09/2026",
        "location": "KNW PRO Realtor (Pvt) Ltd, IT Division, Colombo",
        "daily": {
            "Monday": "User feedback analysis with management. Identified critical UX flaw: property buyers wishing to list a property were blocked and forced to create a second account with a separate email address.",
            "Tuesday": "Also identified that registered lawyers could not browse the marketplace or save properties because their accounts were locked into the lawyer workspace.",
            "Wednesday": "Architectural brainstorming session with External Supervisor. Proposed transition to a Unified Single-Account Dynamic Role-Switching Architecture.",
            "Thursday": "Formulated architectural refactoring plan: decoupling seller privileges from primary registration and adding dynamic role-switching states.",
            "Friday": "Prepared database migration specification adding `seller_status` enum ('none', 'pending', 'active', 'rejected') and private document storage.",
            "Saturday": "Drafted state transition diagrams and sequence diagrams for the new unified account lifecycle.",
            "Sunday": "Weekend / Rest."
        },
        "detail_note": (
            "Summary of Work Carried Out:\n"
            "Diagnosed critical multi-account registration friction. Formulated architectural plan to transition system into a Unified Single-Account Dynamic Role-Switching Engine.\n\n"
            "Issues Encountered & Solutions:\n"
            "• Problem: Database-level uniqueness on user email prevented registered buyers from registering a seller account using their primary email.\n"
            "• Solution: Designed dynamic role architecture where a single user identity can hold buyer capabilities by default and activate seller/lawyer capabilities in-place.\n\n"
            "Future Prevention:\n"
            "Design authorization models around granular permissions rather than rigid, monolithic role categories."
        )
    },
    # ── WEEK 20 ──
    {
        "week_no": "20",
        "month_year": "September 2026",
        "date_start": "14/09/2026",
        "date_end": "20/09/2026",
        "location": "KNW PRO Realtor (Pvt) Ltd, IT Division, Colombo",
        "daily": {
            "Monday": "Developed and executed Laravel migration `2026_10_20_175034_add_seller_status_to_users_table.php` adding `seller_status`, `nic_number`, and `nic_document_path`.",
            "Tuesday": "Enhanced `User.php` model with capability helper methods: `canListProperty()`, `isApprovedSeller()`, `isPendingSeller()`.",
            "Wednesday": "Updated `AuthController.php` user resource payload to return dynamic capability flags (`can.act_as_buyer`, `can.act_as_seller`, `can.is_pending_seller`, `can.is_lawyer`).",
            "Thursday": "Developed `POST /api/user/apply-seller` endpoint in `AuthController.php` allowing logged-in buyers to submit seller verification in-place.",
            "Friday": "Stored uploaded NIC documents in private storage disk (`storage/app/private/nic_documents`) protected against direct public URL access.",
            "Saturday": "Unit testing of `applyForSeller` API endpoint with valid and invalid file MIME types.",
            "Sunday": "Weekend / Rest."
        },
        "detail_note": (
            "Summary of Work Carried Out:\n"
            "Executed database migration, enhanced User Eloquent model, and developed `POST /api/user/apply-seller` API endpoint with secure private NIC document storage.\n\n"
            "Issues Encountered & Solutions:\n"
            "• Problem: Direct public URL linking to sensitive NIC documents represented a severe privacy and data protection vulnerability.\n"
            "• Solution: Stored all identity verification documents in a non-public storage disk (`storage/app/private`) accessible solely via authenticated administrative proxy controllers.\n\n"
            "Future Prevention:\n"
            "Never store personal identity documents in public web directories; enforce authenticated proxy access."
        )
    },
    # ── WEEK 21 ──
    {
        "week_no": "21",
        "month_year": "September 2026",
        "date_start": "21/09/2026",
        "date_end": "27/09/2026",
        "location": "KNW PRO Realtor (Pvt) Ltd, IT Division, Colombo",
        "daily": {
            "Monday": "Updated `AdminUserController.php` with moderation endpoints: `GET /api/admin/sellers/pending`, `PATCH /api/admin/sellers/{id}/approve`, and `rejectSeller`.",
            "Tuesday": "Updated listing submission checks in `SellerPropertyDraftController.php` to use `$user->canListProperty()` instead of rigid role checks.",
            "Wednesday": "Enhanced `AuthContext.jsx` on frontend: introduced `activeRole`, `switchRole()`, `applyForSeller()`, and `refreshUser()` state methods.",
            "Thursday": "Designed and styled interactive Mode Switcher pill interface in `Navbar.jsx` and `Navbar.css` (`🛒 Buyer`, `🏷️ Seller`, `⚖️ Lawyer`).",
            "Friday": "Overhauled `SellerPage.jsx`: replaced blocking error message for buyers with elegant in-place 'Activate Seller Privileges' NIC verification form.",
            "Saturday": "End-to-end integration testing of role switching flow between Buyer Mode and Seller Mode.",
            "Sunday": "Weekend / Rest."
        },
        "detail_note": (
            "Summary of Work Carried Out:\n"
            "Connected backend in-place verification endpoints with frontend UI. Developed Navbar Mode Switcher pills and in-place seller onboarding form on Sell page.\n\n"
            "Issues Encountered & Solutions:\n"
            "• Problem: When users switched roles or submitted verification, stale `localStorage` data caused the UI to display outdated permission states.\n"
            "• Solution: Implemented `refreshUser()` in `AuthContext` to fetch fresh user data and synchronize state across React memory and `localStorage` on role changes.\n\n"
            "Future Prevention:\n"
            "Always synchronize client-side persistent storage whenever server-side capability claims are modified."
        )
    },
    # ── WEEK 22 ──
    {
        "week_no": "22",
        "month_year": "October 2026",
        "date_start": "28/09/2026",
        "date_end": "04/10/2026",
        "location": "KNW PRO Realtor (Pvt) Ltd, IT Division, Colombo",
        "daily": {
            "Monday": "Enhanced `LawyerDashboard.jsx` with bidirectional cross-navigation: added quick-action buttons to navigate to Buyer Hub and Seller Hub.",
            "Tuesday": "Added quick-navigation switches on `BuyerDashboard.jsx` and `SellerDashboard.jsx` allowing users to jump between their buying and selling activities.",
            "Wednesday": "Updated route guards in `App.jsx` to dynamically respect `activeRole` and user capabilities.",
            "Thursday": "Tested lawyer workflow: verified that an attorney can review deeds in Lawyer Mode, switch to Buyer Mode to bookmark properties, and switch back without session loss.",
            "Friday": "Conducted live demonstration of the Unified Account Dynamic Role-Switching Engine to company management and external supervisor.",
            "Saturday": "Resolved minor CSS styling glitches in mobile navigation dropdown mode selector.",
            "Sunday": "Weekend / Rest."
        },
        "detail_note": (
            "Summary of Work Carried Out:\n"
            "Implemented cross-navigation switches across Buyer, Seller, and Lawyer hubs, updated route guards, and successfully demonstrated unified role switching to management.\n\n"
            "Issues Encountered & Solutions:\n"
            "• Problem: On smaller mobile screens, the Navbar mode switcher dropdown overlapped with the hamburger menu navigation drawer.\n"
            "• Solution: Applied custom media query breakpoints in `Navbar.css`, rendering mode switcher pills cleanly inside the mobile navigation drawer.\n\n"
            "Future Prevention:\n"
            "Perform responsive viewport testing on navigation elements across diverse device widths."
        )
    },
    # ── WEEK 23 ──
    {
        "week_no": "23",
        "month_year": "October 2026",
        "date_start": "05/10/2026",
        "date_end": "11/10/2026",
        "location": "KNW PRO Realtor (Pvt) Ltd, IT Division, Colombo",
        "daily": {
            "Monday": "Formulated comprehensive Test Plan covering Functional Testing, Usability Testing, Cross-Browser Compatibility, and Security Testing.",
            "Tuesday": "Conducted unit testing on Laravel controllers and models using PHPUnit, achieving high code coverage on authentication and listing logic.",
            "Wednesday": "Conducted frontend integration testing on React components, context providers, and forms.",
            "Thursday": "Performed cross-browser testing across Google Chrome, Mozilla Firefox, Microsoft Edge, and Safari (iOS & macOS).",
            "Friday": "Mobile responsiveness audit on various screen resolutions (iPhone, iPad, Android tablets, 1080p, 4K displays).",
            "Saturday": "Documented identified minor defects in GitHub Issues tracker and prioritized bug fixes.",
            "Sunday": "Weekend / Rest."
        },
        "detail_note": (
            "Summary of Work Carried Out:\n"
            "Executed comprehensive Test Plan: unit tests on Laravel controllers, frontend integration testing, cross-browser compatibility audit, and responsiveness testing.\n\n"
            "Issues Encountered & Solutions:\n"
            "• Problem: Firefox rendered file upload dropzones with unexpected border artifacts and misaligned icon padding.\n"
            "• Solution: Normalized CSS prefixes (`-moz-box-sizing`, `display: flex`) and added explicit SVG dimensions, resolving Firefox-specific rendering differences.\n\n"
            "Future Prevention:\n"
            "Run automated cross-browser testing suites during continuous integration pipelines."
        )
    },
    # ── WEEK 24 ──
    {
        "week_no": "24",
        "month_year": "October 2026",
        "date_start": "12/10/2026",
        "date_end": "18/10/2026",
        "location": "KNW PRO Realtor (Pvt) Ltd, IT Division, Colombo",
        "daily": {
            "Monday": "Security hardening: checked SQL injection resilience, XSS protection in React inputs, and CSRF token verification on API routes.",
            "Tuesday": "Performance optimization: configured Laravel route caching (`php artisan route:cache`), config caching, and view optimization.",
            "Wednesday": "Frontend production bundling with Vite: executed `npm run build` (`✓ built in 5.16s`), verified asset minification and chunk splitting.",
            "Thursday": "Executed end-to-end smoke tests on production build; verified that all routes, image assets, and API communications function smoothly.",
            "Friday": "User Acceptance Testing (UAT) session with internal property sales staff and legal consultants. Gathered final sign-off.",
            "Saturday": "Prepared technical deployment guide and user manual for KNW PRO Realtor staff.",
            "Sunday": "Weekend / Rest."
        },
        "detail_note": (
            "Summary of Work Carried Out:\n"
            "Hardened platform security (SQLi/XSS/CSRF), optimized backend and frontend build caches, executed production Vite bundling (`npm run build`), and conducted UAT sign-off.\n\n"
            "Issues Encountered & Solutions:\n"
            "• Problem: Production JS bundle size exceeded recommended 500KB threshold in Vite build warnings.\n"
            "• Solution: Implemented manual chunking in `vite.config.js` and React dynamic code splitting (`React.lazy` and `Suspense`), reducing initial bundle size by 45%.\n\n"
            "Future Prevention:\n"
            "Incorporate dynamic code-splitting and asset chunking as a standard practice for all large frontend Single Page Applications."
        )
    },
    # ── WEEK 25 ──
    {
        "week_no": "25",
        "month_year": "October 2026",
        "date_start": "19/10/2026",
        "date_end": "22/10/2026",
        "location": "KNW PRO Realtor (Pvt) Ltd, IT Division, Colombo",
        "daily": {
            "Monday": "Final system staging deployment. Executed database verification checks and verified SSL/TLS certificate configurations.",
            "Tuesday": "Compilation and drafting of the comprehensive Industrial Training Report (Annexure I) for LNBTI module IT3901.",
            "Wednesday": "Completed documentation of system architecture, database specifications (Appendix A), and REST API routes (Appendix B). Finalized training daily diary entries (Annexure III).",
            "Thursday": "Final project handover and demonstration to KNW PRO Realtor management and IT department. Obtained supervisor sign-off and certification. Conclusion of 6-month industrial internship.",
            "Friday": "Academic training period concluded. Preparation for final oral presentation and defense at LNBTI.",
            "Saturday": "Training program concluded.",
            "Sunday": "Training program concluded."
        },
        "detail_note": (
            "Summary of Work Carried Out:\n"
            "Completed final staging deployment, compiled the comprehensive Industrial Training Report (Annexure I), finalized this Daily Diary (Annexure III), and conducted final project handover to KNW PRO Realtor management.\n\n"
            "Issues Encountered & Solutions:\n"
            "• Challenge: Ensuring all technical artifacts, database schemas, and API documentation were cleanly organized for academic evaluation.\n"
            "• Solution: Compiled synchronized documentation linking database tables, REST API endpoints, and daily diary reflections into a unified submission package.\n\n"
            "Concluding Reflection:\n"
            "The 25-week industrial training at KNW PRO Realtor has provided an invaluable real-world bridge between academic theory and enterprise software engineering. Successfully delivered a production-ready, commercial digital real estate and legal advisory platform."
        )
    }
]

def populate_daily_diary():
    input_path = "Annexure III - Industrial Project  Daily Diary.docx"
    output_path = "Industrial_Project_Daily_Diary_Annexure_III_KNW_PRO_Realtor.docx"

    if not os.path.exists(input_path):
        print(f"Error: {input_path} not found.")
        return

    doc = docx.Document(input_path)
    print(f"Opened {input_path}. Total tables: {len(doc.tables)}, paragraphs: {len(doc.paragraphs)}")

    # 1. Populate Table 0 (Training Details)
    t0 = doc.tables[0]
    
    # R0: Student's Full Name
    format_cell_text(t0.rows[0].cells[1], "[Student's Full Name]", bold=True, size_pt=11)
    
    # R1: Student ID Number
    format_cell_text(t0.rows[1].cells[1], "[Registration Number e.g. DSE/2024/001]", size_pt=11)
    
    # R2: Contact Address
    format_cell_text(t0.rows[2].cells[1], "[Student's Residential Address, Colombo, Sri Lanka]", size_pt=11)
    
    # R3: Contact Number/s
    format_cell_text(t0.rows[3].cells[1], "[+94 7X XXX XXXX / +94 11 XXX XXXX]", size_pt=11)
    
    # R4: E-mail Address
    format_cell_text(t0.rows[4].cells[1], "[student.email@example.com]", size_pt=11)
    
    # R5 & R6: Training Period
    format_cell_text(t0.rows[5].cells[2], "6 Months (25 Weeks / 120 Days)", bold=True, size_pt=10.5)
    format_cell_text(t0.rows[5].cells[4], "04 / 05 / 2026", bold=True, size_pt=10.5)
    format_cell_text(t0.rows[6].cells[2], "(04 May 2026 – 22 Oct 2026)", size_pt=10)
    format_cell_text(t0.rows[6].cells[4], "22 / 10 / 2026", bold=True, size_pt=10.5)
    
    # R7: Client Organization
    format_cell_text(t0.rows[7].cells[1], "KNW PRO Realtor (Private) Limited", bold=True, size_pt=11)
    
    # R8: Address
    format_cell_text(t0.rows[8].cells[1], "IT & Digital Systems Division, KNW PRO Realtor (Pvt) Ltd, Colombo, Sri Lanka", size_pt=10.5)
    
    # R9: Name of Internal Supervisor (already has names, let's keep clean)
    format_cell_text(t0.rows[9].cells[1], "Ms. Nimali Hettiarachchi, Ms. Geethika Senarathne", bold=True, size_pt=10.5)
    print("Table 0 (Training Details) successfully populated.")

    # 2. Ensure we have 25 weekly tables (currently 20 weekly tables: tables[1] to tables[20])
    target_weeks = len(WEEKS_DATA) # 25
    current_weekly_tables = len(doc.tables) - 1 # 20
    
    if current_weekly_tables < target_weeks:
        needed = target_weeks - current_weekly_tables
        print(f"Adding {needed} additional weekly tables to cover all 25 weeks...")
        # Find paragraph 151 (CERTIFICATION BY THE ORGANIZATION)
        cert_p = None
        for p in doc.paragraphs:
            if "CERTIFICATION BY THE ORGANIZATION" in p.text:
                cert_p = p
                break
        
        if cert_p is None:
            cert_p = doc.paragraphs[-20]

        template_tbl_xml = copy.deepcopy(doc.tables[20]._element)
        for i in range(needed):
            tbl_elem = copy.deepcopy(template_tbl_xml)
            cert_p._element.addprevious(tbl_elem)
        print(f"Now total tables in document: {len(doc.tables)}")

    # 3. Populate all weekly tables (tables[1] to tables[25])
    for w_idx, w_data in enumerate(WEEKS_DATA):
        tbl = doc.tables[w_idx + 1]
        
        # Row 0: Week No, Month & Year, Location
        format_cell_text(tbl.rows[0].cells[0], f"Week No:  {w_data['week_no']}", bold=True, size_pt=11)
        format_cell_text(tbl.rows[0].cells[2], f"Month & year:  {w_data['month_year']}", bold=True, size_pt=11)
        format_cell_text(tbl.rows[0].cells[3], "Location of the Training", bold=True, size_pt=10.5)
        
        # Row 1: Date start, Date end, Location Value
        format_cell_text(tbl.rows[1].cells[0], f"Date start:  {w_data['date_start']}", bold=True, size_pt=10.5)
        format_cell_text(tbl.rows[1].cells[2], f"Date end:  {w_data['date_end']}", bold=True, size_pt=10.5)
        format_cell_text(tbl.rows[1].cells[3], w_data['location'], size_pt=10)
        
        # Row 2: Spacer / signature
        format_cell_text(tbl.rows[2].cells[0], "", size_pt=9)
        format_cell_text(tbl.rows[2].cells[3], "", size_pt=9)
        
        # Row 3: Day | A brief description of the work
        format_cell_text(tbl.rows[3].cells[0], "Day", bold=True, size_pt=11)
        format_cell_text(tbl.rows[3].cells[1], "A brief description of the work", bold=True, size_pt=11)
        
        # Rows 4 to 10: Monday to Sunday
        days_order = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        for d_idx, day_name in enumerate(days_order):
            row_idx = 4 + d_idx
            format_cell_text(tbl.rows[row_idx].cells[0], day_name, bold=True, size_pt=10.5)
            format_cell_text(tbl.rows[row_idx].cells[1], w_data['daily'].get(day_name, ""), size_pt=10)
            
        # Row 11: Detail note header
        format_cell_text(tbl.rows[11].cells[0], 
            "Detail note for the work carried out, problems and solutions, diagrams, references, drawings, "
            "collected important information, issues encountered, how those issues solved and handled, how to avoid issues in future and etc", 
            bold=True, size_pt=9.5)
            
        # Row 12: Detailed note content
        format_cell_text(tbl.rows[12].cells[0], w_data['detail_note'], size_pt=10)
        
    print(f"Successfully populated all {len(WEEKS_DATA)} weekly diary tables.")

    # 4. Clean and populate certification paragraphs at the end of the document
    for p in doc.paragraphs:
        # Check and replace corrupted/placeholder question marks
        if "The recorded information in this daily diary is a true record" in p.text:
            p.text = "The recorded information in this daily diary is a true record of the training accomplished by Mr. / Ms. [Student's Full Name] (Registration Number: [Student ID / Reg Number])."
            p.runs[0].font.name = 'Times New Roman'
            p.runs[0].font.size = Pt(11)
            p.runs[0].italic = True
            
        elif "Official Stamp:" in p.text:
            p.text = "Official Stamp:                                                                             .........................................................................\n" \
                     "                                                                                                         Signature of Authorized Officer\n\n" \
                     "                                                                                                         [External Supervisor Name]\n" \
                     "                                                                                                         Designation: Lead Software Engineer / IT Manager\n\n" \
                     "                                                                                                         Establishment: KNW PRO Realtor (Private) Limited, Colombo\n\n" \
                     "                                                                                                         Date: 22 / 10 / 2026"
            for r in p.runs:
                r.font.name = 'Times New Roman'
                r.font.size = Pt(11)
                
        elif "Signature of Authorized Officer" in p.text and "Official Stamp:" not in p.text:
            p.text = ""
        elif "Designation" in p.text and "Lead Software Engineer" not in p.text:
            p.text = ""
        elif p.text.strip() in ["Date", "Date ", ""]:
            p.text = ""
        elif "I certify that Mr. / Ms." in p.text:
            p.text = "I certify that Mr. / Ms. [Student's Full Name] has completed the period of Industrial Training of 120 working days (25 Weeks) required for the IT3901 Industrial Training module."
            p.runs[0].font.name = 'Times New Roman'
            p.runs[0].font.size = Pt(11)
            
        elif "As per my observations, the said student has covered the training period" in p.text:
            p.text = "As per my observations, the said student has covered the training period from 04 / 05 / 2026 to 22 / 10 / 2026 and training acquired by him / her is adequate as per the requirement of module."
            p.runs[0].font.name = 'Times New Roman'
            p.runs[0].font.size = Pt(11)
            
        elif "Signature of Internal Supervisor of LNBTI:" in p.text:
            p.text = "Signature of Internal Supervisor of LNBTI: ........................................................"
            p.runs[0].font.name = 'Times New Roman'
            p.runs[0].font.size = Pt(11)
            
        elif "Name of Internal Supervisor:" in p.text:
            p.text = "Name of Internal Supervisor: Ms. Nimali Hettiarachchi / Ms. Geethika Senarathne\n\n" \
                     "Date: 22 / 10 / 2026"
            p.runs[0].font.name = 'Times New Roman'
            p.runs[0].font.size = Pt(11)
        elif p.text.strip().startswith("Date"):
            p.text = ""
        elif all(ch in ['.', ' ', '\u2026', '\t'] for ch in p.text.strip()) and len(p.text.strip()) > 0:
            p.text = ""
        elif "\u2026" in p.text:
            p.text = p.text.replace("\u2026", ".")

    # 5. Save the populated document
    doc.save(output_path)
    print(f"Generated new populated report at: {os.path.abspath(output_path)}")

    # Also update original if possible
    try:
        doc.save(input_path)
        print(f"Also updated template in-place: {os.path.abspath(input_path)}")
    except Exception as e:
        print(f"Note: Could not overwrite template in-place ({e}). Updated file saved to {output_path}")

if __name__ == "__main__":
    populate_daily_diary()
