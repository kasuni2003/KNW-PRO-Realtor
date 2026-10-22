import re

with open("generate_report.py", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update Table of Contents
old_toc = '''        ("  2.6 Third-Party Payment, Storage & Notification Integrations", "17"),
        ("CHAPTER 3: TRAINING EXPERIENCE", "19"),'''

new_toc = '''        ("  2.6 Third-Party Payment, Storage & Notification Integrations", "17"),
        ("  2.7 Software Requirements Specification & Functional Requirements", "18"),
        ("CHAPTER 3: TRAINING EXPERIENCE", "20"),'''

content = content.replace(old_toc, new_toc)

# 2. Update Figures in TOC
old_figures = '''        ("Figure C.1", "Entity-Relationship (ER) Diagram of the KNW PRO Realtor Relational Database", "59"),
        ("Figure C.2", "State Transition Diagram for Seller Identity & Property Draft Lifecycle", "60"),'''

new_figures = '''        ("Figure C.1", "Unified System Use Case Architecture Diagram", "59"),
        ("Figure C.2", "Property Buyer Use Case Diagram", "60"),
        ("Figure C.3", "Property Seller Use Case Diagram", "61"),
        ("Figure C.4", "Real Estate Lawyer & Legal Conveyancing Use Case Diagram", "62"),
        ("Figure C.5", "System Administrator & Governance Use Case Diagram", "63"),
        ("Figure C.6", "Relational Database Entity-Relationship Diagram (ERD)", "64"),
        ("Figure C.7", "Object-Oriented Domain Model & UML Class Diagram", "65"),'''

content = content.replace(old_figures, new_figures)

# 3. Update Tables in TOC
old_tables = '''        ("Table 2.1", "Technology Stack Specification Summary", "14"),
        ("Table 3.1", "Comparison Between Legacy Role Model and Unified Role Switching Model", "22"),'''

new_tables = '''        ("Table 2.1", "Technology Stack Specification Summary", "14"),
        ("Table 2.2", "Functional Requirements Specification Matrix by User Role", "18"),
        ("Table 3.1", "Comparison Between Legacy Role Model and Unified Role Switching Model", "23"),'''

content = content.replace(old_tables, new_tables)

# 4. Insert Section 2.7 in Chapter 2
sec_2_7_code = '''
    add_sub1("2.7", "Software Requirements Specification & Functional Requirements (FR)")
    add_p("The functional requirements of the KNW PRO Realtor platform were formulated through exhaustive domain analysis of real estate conveyancing and property brokerage practices in Sri Lanka. The core business objective is eliminating prevalent systemic market vulnerabilities-such as land registry title deed fraud, unauthorized middlemen, and opaque buyer-lawyer coordination-by establishing four dedicated stakeholder subsystems: Property Buyers, Property Sellers, Real Estate Lawyers, and System Administrators, unified by an overarching identity and role-switching engine. Table 2.2 delineates the exhaustive Functional Requirements Specification (FRS) matrix governing platform engineering.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)

    tbl_fr = doc.add_table(rows=21, cols=6)
    tbl_fr.alignment = WD_TABLE_ALIGNMENT.CENTER
    fr_data = [
        ("Req ID", "Role", "Functional Title", "Preconditions", "Functional Description & System Behavior", "Acceptance Criteria"),
        ("FR-01", "Buyer", "Property Search & Filter", "Published listings", "Multi-parameter filter by district, property type, price bounds, and keywords with real-time results.", "Marketplace returns matching active properties in < 300ms."),
        ("FR-02", "Buyer", "Deed Verification & Dossier", "Listing published", "Displays property dossier, cadastral metrics, and official 'KNW Certified Deed Verified' badge if cleared.", "Badge visible only if cleared by licensed attorney."),
        ("FR-03", "Buyer", "Financial & Mortgage Tools", "None", "Calculates monthly amortizations, interest breakdowns, and Sri Lankan stamp duties based on property valuation.", "Calculations match Central Bank of Sri Lanka stamp duty rates."),
        ("FR-04", "Buyer", "Saved Property Shortlist", "Authenticated Buyer", "Allows bookmarking properties to private shortlist with personalized notes for future evaluation.", "Persisted in saved_properties table and editable on Buyer dashboard."),
        ("FR-05", "Buyer", "Site Inspection Visit Booking", "Authenticated Buyer", "Buyer selects preferred date and time slot for on-site physical property inspection.", "Generates inquiry record and sends automated email/notification to seller."),
        ("FR-06", "Buyer", "Legal Consultation Booking", "Authenticated Buyer", "Buyer selects registered attorney, picks open calendar slot, enters legal topic, and pays fee via PayHere.", "Generates .ics calendar invite and confirmed appointment record."),
        ("FR-07", "Seller", "In-Place Identity Verification", "Authenticated User", "User submits Phone, Address, NIC/Passport number and uploads identity document without re-registering.", "Updates seller_status to 'pending' and routes document to private storage."),
        ("FR-08", "Seller", "Dynamic Role Mode Switcher", "Active Seller", "Allows 1-click toggling between Buyer Mode, Seller Mode, and Lawyer Mode directly from navigation bar.", "Navbar dynamically renders role-specific links without page reload."),
        ("FR-09", "Seller", "Property Draft Intake", "Approved Seller", "Multi-step form capturing property type, district, expected price, visit dates, and geolocation coordinates.", "Saves listing in seller_property_drafts with status 'draft'."),
        ("FR-10", "Seller", "Legal Document Conduit", "Draft created", "Secure multipart upload for title deeds, registered survey plans, and local council clearance certificates.", "Files stored securely and linked to deed review pipeline."),
        ("FR-11", "Seller", "Listing Monetization Tiers", "Draft completed", "Seller selects Basic, Verified, or Featured tier and completes payment via PayHere or bank slip upload.", "Payment verified; draft transitions to 'pending_review'."),
        ("FR-12", "Seller", "Inquiry & Inspection Manager", "Listing published", "Seller reviews buyer inspection requests, confirms dates, or proposes alternative visit slots.", "Status transitions to 'confirmed'; buyer receives notification."),
        ("FR-13", "Lawyer", "Attorney Profile & Fees", "Approved Lawyer", "Lawyer manages legal specialization, bar credentials, consultation fees, bio, and spoken languages.", "Profile displayed publicly in lawyer directory with active booking."),
        ("FR-14", "Lawyer", "Weekly Calendar & Slots", "Approved Lawyer", "Lawyer defines weekly recurring availability slots and blocks holiday or court appearance dates.", "Blocked dates automatically unavailable during buyer checkout."),
        ("FR-15", "Lawyer", "Deed Verification Audit", "Assigned Draft", "Lawyer reviews seller title deeds and cadastral surveys against Land Registry standards.", "Lawyer records legal findings and submits clearance recommendation."),
        ("FR-16", "Lawyer", "Video Legal Advisory", "Confirmed Booking", "Lawyer conducts video consultation with buyer via generated secure video meeting URL.", "Appointment status marked 'completed' and earnings logged."),
        ("FR-17", "Lawyer", "Legal Blog Publication", "Approved Lawyer", "Lawyer authors educational articles on property law, stamp duty reforms, and title conveyancing.", "Submitted to administrative queue for review before public index."),
        ("FR-18", "Admin", "Seller Identity Moderation", "Admin Role", "Admin reviews pending seller NIC documents from private vault; approves or rejects with reason.", "Updates seller_status to 'active' or 'rejected' with notification."),
        ("FR-19", "Admin", "Listing & Deed Verification", "Admin Role", "Admin reviews property drafts, validates payment slips, and toggles official Deed Verified badge.", "Listing published to marketplace; deed verification badge awarded."),
        ("FR-20", "Admin", "Financial Audit & Analytics", "Admin Role", "Real-time summary analytics: active listings, registered users, platform revenue, and dispute logs.", "Dashboard metrics update dynamically via optimized SQL aggregations.")
    ]
    for r_idx, row_vals in enumerate(fr_data):
        for c_idx, val in enumerate(row_vals):
            cell = tbl_fr.cell(r_idx, c_idx)
            cell.text = val
            cell.paragraphs[0].runs[0].font.name = 'Times New Roman'
            if r_idx == 0:
                cell.paragraphs[0].runs[0].font.size = Pt(9.5)
                cell.paragraphs[0].runs[0].bold = True
                set_cell_background(cell, "E2E8F0")
            else:
                cell.paragraphs[0].runs[0].font.size = Pt(8.5)
            cell.paragraphs[0].paragraph_format.line_spacing = 1.15
            set_cell_margins(cell, 20, 20, 30, 30)

    add_p("", space_after=12)
'''

target_ch2_end = '''    add_p("The platform interfaces with external services to facilitate real-world commercial operations:\\n"
          "• PayHere Payment Gateway: Checkout API integration enabling automated card payments for listing tiers and legal consultation bookings.\\n"
          "• iCalendar ICS Protocol: Automated generation of downloadable `.ics` calendar invitation files for site inspections and video consultations.\\n"
          "• Notification Engine: Real-time user notification dispatcher updating buyers on visit approvals and sellers on new lead inquiries.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)'''

content = content.replace(target_ch2_end, target_ch2_end + "\n" + sec_2_7_code)

# 5. Insert Appendix C after Appendix B
appendix_c_code = '''
    # ═════════════════════════════════════════════════════════════════════════
    # APPENDIX C: SYSTEM ARCHITECTURAL & USE CASE DIAGRAMS
    # ═════════════════════════════════════════════════════════════════════════
    doc.add_page_break()
    add_p("APPENDIX C: SYSTEM ARCHITECTURAL & USE CASE DIAGRAMS", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=14, space_before=10, space_after=18)

    diagram_items = [
        ("C.1", "Unified System Use Case Architecture Diagram", "diagrams/uc_unified.png", "Figure C.1: Unified System Use Case Architecture Diagram", 5.5),
        ("C.2", "Property Buyer Use Case Diagram", "diagrams/uc_buyer.png", "Figure C.2: Property Buyer Use Case Diagram", 5.2),
        ("C.3", "Property Seller Use Case Diagram", "diagrams/uc_seller.png", "Figure C.3: Property Seller Use Case Diagram", 5.2),
        ("C.4", "Real Estate Lawyer & Legal Conveyancing Use Case Diagram", "diagrams/uc_lawyer.png", "Figure C.4: Real Estate Lawyer & Legal Conveyancing Use Case Diagram", 5.2),
        ("C.5", "System Administrator & Governance Use Case Diagram", "diagrams/uc_admin.png", "Figure C.5: System Administrator & Governance Use Case Diagram", 5.2),
        ("C.6", "Relational Database Entity-Relationship Diagram (ERD)", "diagrams/er_diagram.png", "Figure C.6: Relational Database Entity-Relationship Diagram (ERD)", 6.2),
        ("C.7", "Object-Oriented Domain Model & UML Class Diagram", "diagrams/class_diagram.png", "Figure C.7: Object-Oriented Domain Model & UML Class Diagram", 5.8),
    ]

    for sub_num, sub_title, img_path, caption, img_width in diagram_items:
        add_sub1(sub_num, sub_title)
        if os.path.exists(img_path):
            doc.add_picture(img_path, width=Inches(img_width))
            p_cap = doc.add_paragraph()
            p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
            r_cap = p_cap.add_run(caption)
            r_cap.font.name = 'Times New Roman'
            r_cap.font.size = Pt(10)
            r_cap.italic = True
            p_cap.paragraph_format.space_after = Pt(14)
        else:
            add_p(f"[{caption} - Image not found]", align=WD_ALIGN_PARAGRAPH.CENTER, italic=True)
'''

target_app_b_end = '''            set_cell_margins(cell, 25, 25, 35, 35)'''

content = content.replace(target_app_b_end, target_app_b_end + "\n" + appendix_c_code)

with open("generate_report.py", "w", encoding="utf-8") as f:
    f.write(content)

print("Successfully updated generate_report.py!")
