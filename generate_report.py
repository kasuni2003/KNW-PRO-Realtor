# -*- coding: utf-8 -*-
"""
Generate Industrial Training Comprehensive Report for LNBTI
Project: KNW PRO Realtor (Laravel + React/Vite Full-Stack Platform)
Based on Annexure I - Industrial Training Report guidelines
"""

import os
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('w:top', top), ('w:bottom', bottom), ('w:left', left), ('w:right', right)]:
        node = OxmlElement(m)
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def create_report():
    doc = Document()

    # Define normal style font
    style = doc.styles['Normal']
    font = style.font
    font.name = 'Times New Roman'
    font.size = Pt(12)
    font.color.rgb = RGBColor(0, 0, 0)
    style.paragraph_format.line_spacing = 1.5
    style.paragraph_format.space_after = Pt(6)

    # Set margins
    for section in doc.sections:
        section.top_margin = Cm(2.0)
        section.bottom_margin = Cm(2.0)
        section.left_margin = Cm(3.0)
        section.right_margin = Cm(2.0)
        section.page_width = Cm(21.0)
        section.page_height = Cm(29.7)

    # Helper functions
    def add_p(text="", align=WD_ALIGN_PARAGRAPH.LEFT, bold=False, italic=False, size=12, space_after=6, space_before=0, line_spacing=1.5):
        p = doc.add_paragraph()
        p.alignment = align
        p.paragraph_format.space_before = Pt(space_before)
        p.paragraph_format.space_after = Pt(space_after)
        p.paragraph_format.line_spacing = line_spacing
        if text:
            run = p.add_run(text)
            run.font.name = 'Times New Roman'
            run.font.size = Pt(size)
            run.bold = bold
            run.italic = italic
        return p

    def add_run(p, text, bold=False, italic=False, size=12, color=None):
        run = p.add_run(text)
        run.font.name = 'Times New Roman'
        run.font.size = Pt(size)
        run.bold = bold
        run.italic = italic
        if color:
            run.font.color.rgb = color
        return run

    def add_chap_heading(num_str, title_str):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.space_before = Pt(18)
        p.paragraph_format.space_after = Pt(10)
        p.paragraph_format.line_spacing = 1.5
        run = p.add_run(f"CHAPTER {num_str}: {title_str.upper()}")
        run.font.name = 'Times New Roman'
        run.font.size = Pt(14)
        run.bold = True
        return p

    def add_sub1(num_str, text):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.space_before = Pt(12)
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.line_spacing = 1.5
        run = p.add_run(f"{num_str} {text}")
        run.font.name = 'Times New Roman'
        run.font.size = Pt(12)
        run.bold = True
        return p

    def add_sub2(num_str, text):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.space_before = Pt(10)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.line_spacing = 1.5
        run = p.add_run(f"{num_str} {text}")
        run.font.name = 'Times New Roman'
        run.font.size = Pt(12)
        run.bold = True
        run.italic = True
        return p

    def add_bullet(bold_prefix, text):
        p = doc.add_paragraph(style='List Bullet')
        p.paragraph_format.space_before = Pt(2)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.line_spacing = 1.5
        if bold_prefix:
            r1 = p.add_run(bold_prefix + ": ")
            r1.font.name = 'Times New Roman'
            r1.font.size = Pt(12)
            r1.bold = True
        r2 = p.add_run(text)
        r2.font.name = 'Times New Roman'
        r2.font.size = Pt(12)
        return p

    # ═════════════════════════════════════════════════════════════════════════
    # 1. COVER PAGE (Sample Cover Page Format)
    # ═════════════════════════════════════════════════════════════════════════
    add_p("REPORT ON INDUSTRIAL TRAINING", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=18, space_before=36, space_after=12)
    add_p("KNW PRO REALTOR (PRIVATE) LIMITED", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=16, space_after=12)
    add_p("DESIGN AND IMPLEMENTATION OF THE KNW PRO REALTOR PROPERTY TRADING & LEGAL ADVISORY SYSTEM", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=14, space_after=60)

    add_p("by", align=WD_ALIGN_PARAGRAPH.CENTER, size=14, space_after=16)
    add_p("[Student's Full Name]", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=14, space_after=6)
    add_p("(Registration Number: [Reg Number e.g. DSE/2024/001])", align=WD_ALIGN_PARAGRAPH.CENTER, size=12, space_after=80)

    add_p("Higher Diploma in Software Engineering", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=14, space_after=8)
    add_p("Lanka Nippon BizTech Institute", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=14, space_after=16)
    add_p("October 2026", align=WD_ALIGN_PARAGRAPH.CENTER, size=14, space_after=0)

    doc.add_page_break()

    # ═════════════════════════════════════════════════════════════════════════
    # 2. FRONT PAGE (Sample Front Page Format)
    # ═════════════════════════════════════════════════════════════════════════
    add_p("REPORT ON INDUSTRIAL TRAINING", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=18, space_before=16, space_after=6)
    add_p("KNW PRO REALTOR (PRIVATE) LIMITED", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=16, space_after=14)

    p_stmt = add_p(align=WD_ALIGN_PARAGRAPH.CENTER, italic=True, size=12, space_after=24)
    add_run(p_stmt, "This report is submitted in partial fulfillment of the requirements for\nthe Higher Diploma in Software Engineering", italic=True)

    add_p("[Student's Full Name]", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=14, space_after=4)
    add_p("(Registration Number: [Reg Number e.g. DSE/2024/001])", align=WD_ALIGN_PARAGRAPH.CENTER, size=12, space_after=20)

    # Details table for Front Page
    tbl_fp = doc.add_table(rows=5, cols=2)
    tbl_fp.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl_fp_data = [
        ("Course Module:", "IT3901 Industrial Training"),
        ("Training Period:", "01/05/2026 to 31/10/2026"),
        ("Internal Supervisor:", "[Internal Supervisor Name], Lecturer, LNBTI"),
        ("External Supervisor:", "[External Supervisor Name], Lead Software Engineer / IT Manager"),
        ("Establishment & Location:", "KNW PRO Realtor (Pvt) Ltd, IT Division, Colombo, Sri Lanka"),
    ]
    for row_idx, (col1, col2) in enumerate(tbl_fp_data):
        c1 = tbl_fp.cell(row_idx, 0)
        c2 = tbl_fp.cell(row_idx, 1)
        c1.text = col1
        c2.text = col2
        c1.paragraphs[0].runs[0].font.name = 'Times New Roman'
        c1.paragraphs[0].runs[0].font.size = Pt(11)
        c1.paragraphs[0].runs[0].bold = True
        c2.paragraphs[0].runs[0].font.name = 'Times New Roman'
        c2.paragraphs[0].runs[0].font.size = Pt(11)
        c1.paragraphs[0].paragraph_format.line_spacing = 1.3
        c2.paragraphs[0].paragraph_format.line_spacing = 1.3
        set_cell_margins(c1, 60, 60, 80, 80)
        set_cell_margins(c2, 60, 60, 80, 80)

    add_p("", space_after=30)
    add_p("Higher Diploma in Software Engineering", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=14, space_after=6)
    add_p("Lanka Nippon BizTech Institute", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=14, space_after=12)
    add_p("October 2026", align=WD_ALIGN_PARAGRAPH.CENTER, size=12, space_after=0)

    doc.add_page_break()

    # ═════════════════════════════════════════════════════════════════════════
    # 3. DECLARATION PAGE
    # ═════════════════════════════════════════════════════════════════════════
    add_p("DECLARATION", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=14, space_before=10, space_after=24)

    add_p("I declare that:\n"
          "a) except where due acknowledgment has been made, the work is that of the student alone;\n"
          "b) the work has not been submitted previously, in whole or in part, to qualify for any other academic award;\n"
          "c) the content of the report is the result of work that has been carried out since the official commencement date of the Industrial training program of the faculty;\n"
          "d) any editorial work, paid or unpaid, carried out by a third party is acknowledged; and\n"
          "e) procedures and guidelines of the faculty have been followed.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY, size=12, space_after=36, line_spacing=1.5)

    add_p("Signed: .....................................................", size=12, space_after=6)
    add_p("Signature", italic=True, size=11, space_after=16)
    add_p("[Student's Full Name]", bold=True, size=12, space_after=6)
    add_p("Date: 21 / 10 / 2026", size=12, space_after=0)

    doc.add_page_break()

    # ═════════════════════════════════════════════════════════════════════════
    # 4. APPROVAL FOR SUBMISSION PAGE
    # ═════════════════════════════════════════════════════════════════════════
    add_p("APPROVAL FOR SUBMISSION", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=14, space_before=10, space_after=28)

    add_p("This is to certify that the Industrial Training Report submitted by [Student's Full Name] (Registration Number: [Reg Number]) has been carried out under our supervision and is approved for submission in partial fulfillment of the requirements for the Higher Diploma in Software Engineering at Lanka Nippon BizTech Institute.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY, size=12, space_after=40, line_spacing=1.5)

    add_p("Internal Supervisor:", bold=True, size=12, space_after=6)
    add_p("Signature: ..............................................................", size=12, space_after=6)
    add_p("Title & Name: [Internal Supervisor's Name and Designation]", size=12, space_after=6)
    add_p("Date: .....................................................................", size=12, space_after=30)

    add_p("External Supervisor:", bold=True, size=12, space_after=6)
    add_p("Signature: ..............................................................", size=12, space_after=6)
    add_p("Title & Name: [External Supervisor's Name and Designation]", size=12, space_after=6)
    add_p("Establishment: KNW PRO Realtor (Private) Limited, Colombo, Sri Lanka", size=12, space_after=6)
    add_p("Date: .....................................................................", size=12, space_after=0)

    doc.add_page_break()

    # ═════════════════════════════════════════════════════════════════════════
    # 5. ACKNOWLEDGEMENT PAGE
    # ═════════════════════════════════════════════════════════════════════════
    add_p("ACKNOWLEDGEMENT", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=14, space_before=10, space_after=20)

    add_p("I would like to express my deepest gratitude and sincere appreciation to all the individuals who supported, mentored, and guided me throughout the tenure of my Industrial Training (IT3901) program. The completion of this comprehensive training report and the development of the KNW PRO Realtor platform would not have been possible without their generous assistance and professional insight.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY, size=12, space_after=14)

    add_p("First and foremost, I wish to extend my profound appreciation to the academic management and faculty members of Lanka Nippon BizTech Institute (LNBTI) for structuring a rigorous Higher Diploma in Software Engineering curriculum that established a strong theoretical and practical software engineering foundation. Special thanks are extended to my Internal Supervisor, [Internal Supervisor Name], for his constant academic encouragement, critical feedback, and guidance throughout the preparation of this industrial report.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY, size=12, space_after=14)

    add_p("I am also profoundly indebted to my host training organization, KNW PRO Realtor (Private) Limited, for providing me with an inspiring, supportive, and technically demanding working environment within their IT & Digital Systems Division. I express my heartfelt gratitude to my External Supervisor, [External Supervisor Name], for his technical leadership, mentoring in full-stack architectural design, and valuable guidance throughout the development of the property trading platform.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY, size=12, space_after=14)

    add_p("I also convey my warm thanks to my colleagues and team members in the engineering division for their camaraderie, collaborative problem-solving, and constructive assistance. Finally, I dedicate my humble gratitude to my beloved parents and family members, whose enduring encouragement, patience, and moral support inspired me to achieve my goals during this industrial internship.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY, size=12, space_after=0)

    doc.add_page_break()

    # ═════════════════════════════════════════════════════════════════════════
    # 6. ABSTRACT PAGE
    # ═════════════════════════════════════════════════════════════════════════
    add_p("ABSTRACT", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=14, space_before=10, space_after=20)

    add_p("This comprehensive report documents the six-month industrial training program undertaken at KNW PRO Realtor (Private) Limited in partial fulfillment of the requirements for the Higher Diploma in Software Engineering at Lanka Nippon BizTech Institute (LNBTI). KNW PRO Realtor is a premier real estate brokerage, property consultancy, and land sales enterprise in Sri Lanka. The core objective of this industrial attachment was to design, develop, and deploy the enterprise's proprietary digital property trading, deed verification, and legal advisory platform within the internal IT & Digital Systems Department.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY, size=12, space_after=12)

    add_p("During the training period, the trainee was actively embedded in the engineering team responsible for architecting and deploying 'KNW PRO Realtor'—an advanced, secure, and data-driven real estate marketplace and legal advisory platform tailored to the Sri Lankan property ecosystem. The platform addresses several critical industry bottlenecks, including rampant property title fraud, lack of formal legal deed verification prior to public listing, fragmented communication between property buyers and attorneys, and inefficient multi-account customer onboarding.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY, size=12, space_after=12)

    add_p("The system architecture was implemented leveraging a modern decoupled full-stack model. The backend was constructed using PHP 8.4 and the Laravel 13 framework, adhering strictly to Model-View-Controller (MVC) and RESTful API standards, fortified with Eloquent ORM, Bcrypt password hashing, multipart file streaming, and administrative verification middleware. The frontend was engineered utilizing React 18 bundled with Vite, styled with modular CSS3, and organized around reactive state management through React Context APIs (AuthContext, LanguageContext, and CurrencyContext). Database persistence was established via MySQL.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY, size=12, space_after=12)

    add_p("A major technical milestone accomplished during the internship was the refactoring and implementation of a Unified Single-Account Dynamic Role-Switching Architecture. This innovation eliminated the legacy restriction that forced buyers wanting to list properties to register completely separate accounts with duplicate email addresses. Under the newly deployed model, users hold a single unified credential, participate in Buyer Mode by default, and can activate Seller Privileges in-place by submitting National Identity Card (NIC) verification documents directly to administration review. Furthermore, registered legal practitioners (Lawyers) can seamlessly alternate between Lawyer Workspaces, Buyer Hubs, and Seller Hubs.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY, size=12, space_after=12)

    add_p("The report provides a thorough analytical overview of the organizational hierarchy, software development lifecycle (SDLC) methodologies, engineering activities performed, technical challenges solved, professional competencies mastered, and prospective avenues for system scalability.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY, size=12, space_after=0)

    doc.add_page_break()

    # ═════════════════════════════════════════════════════════════════════════
    # 7. TABLE OF CONTENTS
    # ═════════════════════════════════════════════════════════════════════════
    add_p("TABLE OF CONTENTS", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=14, space_before=10, space_after=18)

    toc_items = [
        ("Declaration", "ii"),
        ("Approval for Submission", "iii"),
        ("Acknowledgement", "iv"),
        ("Abstract", "v"),
        ("Table of Contents", "vi"),
        ("List of Figures", "viii"),
        ("List of Tables", "ix"),
        ("List of Abbreviations", "x"),
        ("CHAPTER 1: INTRODUCTION", "1"),
        ("  1.1 Introduction of the Organization", "1"),
        ("  1.2 History of the Organization", "2"),
        ("  1.3 Organization Structure", "3"),
        ("  1.4 Nature of Business and Operations", "4"),
        ("  1.5 Department(s) of Study", "5"),
        ("  1.6 Management Practices, Rules, and Work Culture", "6"),
        ("CHAPTER 2: TECHNOLOGIES AND THEORETICAL CONCEPTS USED", "8"),
        ("  2.1 Full-Stack Architectural Framework", "8"),
        ("  2.2 Frontend Technologies (React 18, Vite, Context API)", "9"),
        ("  2.3 Backend Technologies (PHP 8.4, Laravel 13 Framework)", "11"),
        ("  2.4 Database Architecture & Management (MySQL, Eloquent ORM)", "13"),
        ("  2.5 Security, Authentication & Role-Based Access Control", "15"),
        ("  2.6 Third-Party Payment, Storage & Notification Integrations", "17"),
        ("  2.7 Software Requirements Specification & Functional Requirements", "18"),
        ("CHAPTER 3: TRAINING EXPERIENCE", "20"),
        ("  3.1 Working Environment & Engineering Setup", "19"),
        ("  3.2 Activities Performed on KNW PRO Realtor Platform", "20"),
        ("    3.2.1 Unified Single-Account & Dynamic Role-Switching Engine", "20"),
        ("    3.2.2 Property Listing Intake, Pricing Estimator & Draft Pipeline", "24"),
        ("    3.2.3 Lawyer Consultation Scheduling & Title Deed Verification", "27"),
        ("    3.2.4 Buyer Shortlist, Property Dossier & Site Inspection Booking", "30"),
        ("    3.2.5 Administrative Governance, User Moderation & Approvals", "33"),
        ("  3.3 Problems Encountered and Solutions Implemented", "36"),
        ("    3.3.1 Duplicate Account Requirement for Buyers Wanting to Sell", "36"),
        ("    3.3.2 Cross-Role Privilege Collisions for Legal Practitioners", "38"),
        ("    3.3.3 Real Estate Fraud & Unverified Land Ownership Title Deeds", "39"),
        ("    3.3.4 Client-Side Session State Inconsistency on Role Change", "41"),
        ("  3.4 Extra Activities and Collaborative Practices Participated", "42"),
        ("CHAPTER 4: CONCLUSION", "44"),
        ("  4.1 Summary of Training Experience", "44"),
        ("  4.2 Technical and Professional Competencies Acquired", "45"),
        ("  4.3 Evaluation of System Success and Limitations", "47"),
        ("  4.4 Future Enhancements and Scalability Recommendations", "48"),
        ("  4.5 Concluding Remarks", "49"),
        ("REFERENCES / BIBLIOGRAPHY", "50"),
        ("APPENDIX A: Database Schema Design & Table Structures", "52"),
        ("APPENDIX B: Core RESTful API Route Specifications", "56"),
        ("APPENDIX C: Architectural Diagrams & Workflows", "59"),
    ]

    tbl_toc = doc.add_table(rows=len(toc_items), cols=2)
    tbl_toc.alignment = WD_TABLE_ALIGNMENT.CENTER
    for i, (title, page) in enumerate(toc_items):
        c1 = tbl_toc.cell(i, 0)
        c2 = tbl_toc.cell(i, 1)
        c1.text = title
        c2.text = page
        r1 = c1.paragraphs[0].runs[0]
        r2 = c2.paragraphs[0].runs[0]
        r1.font.name = 'Times New Roman'
        r2.font.name = 'Times New Roman'
        if "CHAPTER" in title or title in ["Declaration", "Approval for Submission", "Acknowledgement", "Abstract", "Table of Contents", "List of Figures", "List of Tables", "List of Abbreviations", "REFERENCES / BIBLIOGRAPHY", "APPENDIX A: Database Schema Design & Table Structures", "APPENDIX B: Core RESTful API Route Specifications", "APPENDIX C: Architectural Diagrams & Workflows"]:
            r1.bold = True
            r2.bold = True
            r1.font.size = Pt(11)
            r2.font.size = Pt(11)
        else:
            r1.font.size = Pt(10.5)
            r2.font.size = Pt(10.5)
        c2.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.RIGHT
        c1.paragraphs[0].paragraph_format.line_spacing = 1.15
        c2.paragraphs[0].paragraph_format.line_spacing = 1.15
        set_cell_margins(c1, 20, 20, 40, 40)
        set_cell_margins(c2, 20, 20, 40, 40)

    doc.add_page_break()

    # ═════════════════════════════════════════════════════════════════════════
    # 8. LIST OF FIGURES & TABLES & ABBREVIATIONS
    # ═════════════════════════════════════════════════════════════════════════
    add_p("LIST OF FIGURES", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=14, space_before=10, space_after=18)
    figures_data = [
        ("Figure 1.1", "Organizational Hierarchy and Engineering Division Structure", "3"),
        ("Figure 2.1", "KNW PRO Realtor Decoupled Client-Server Architectural Model", "8"),
        ("Figure 2.2", "React 18 Component Hierarchy & Global Context State Flow", "10"),
        ("Figure 2.3", "Laravel 13 RESTful Controller & Eloquent ORM Pipeline", "12"),
        ("Figure 3.1", "Unified Single-Account Role Architecture vs Legacy Multi-Account Model", "21"),
        ("Figure 3.2", "Dynamic Account Mode Switcher Flow in the User Interface", "23"),
        ("Figure 3.3", "End-to-End Property Submission, Fee Payment & Admin Verification Flow", "25"),
        ("Figure 3.4", "Lawyer Deed Verification & Legal Consultation Booking Architecture", "28"),
        ("Figure 3.5", "Buyer Shortlisting, Dossier Generation & Inspection Booking Sequence", "31"),
        ("Figure 3.6", "Admin Identity Review, Deed Verification & Platform Moderation Dashboard", "34"),
        ("Figure C.1", "Unified System Use Case Architecture Diagram", "59"),
        ("Figure C.2", "Property Buyer Use Case Diagram", "60"),
        ("Figure C.3", "Property Seller Use Case Diagram", "61"),
        ("Figure C.4", "Real Estate Lawyer & Legal Conveyancing Use Case Diagram", "62"),
        ("Figure C.5", "System Administrator & Governance Use Case Diagram", "63"),
        ("Figure C.6", "Relational Database Entity-Relationship Diagram (ERD)", "64"),
        ("Figure C.7", "Object-Oriented Domain Model & UML Class Diagram", "65"),
    ]
    tbl_lof = doc.add_table(rows=len(figures_data), cols=3)
    tbl_lof.alignment = WD_TABLE_ALIGNMENT.CENTER
    for idx, (f_num, f_name, f_pg) in enumerate(figures_data):
        c1 = tbl_lof.cell(idx, 0)
        c2 = tbl_lof.cell(idx, 1)
        c3 = tbl_lof.cell(idx, 2)
        c1.text = f_num
        c2.text = f_name
        c3.text = f_pg
        for c in (c1, c2, c3):
            c.paragraphs[0].runs[0].font.name = 'Times New Roman'
            c.paragraphs[0].runs[0].font.size = Pt(11)
            c.paragraphs[0].paragraph_format.line_spacing = 1.2
            set_cell_margins(c, 30, 30, 50, 50)
        c1.paragraphs[0].runs[0].bold = True
        c3.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.RIGHT

    add_p("", space_after=24)
    add_p("LIST OF TABLES", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=14, space_before=10, space_after=18)
    tables_data = [
        ("Table 2.1", "Technology Stack Specification Summary", "14"),
        ("Table 2.2", "Functional Requirements Specification Matrix by User Role", "18"),
        ("Table 3.1", "Comparison Between Legacy Role Model and Unified Role Switching Model", "23"),
        ("Table 3.2", "Listing Monetization Packages and Service Tiers", "26"),
        ("Table 3.3", "Summary of Software Problems Encountered, Root Causes, and Applied Solutions", "41"),
        ("Table A.1", "Users Relational Table Specification", "52"),
        ("Table A.2", "Seller Property Drafts Relational Table Specification", "53"),
        ("Table A.3", "Appointments & Consultations Relational Table Specification", "54"),
        ("Table A.4", "Property Inquiries & Inspections Relational Table Specification", "55"),
        ("Table B.1", "Authentication & User Management REST API Endpoints", "56"),
        ("Table B.2", "Property & Seller Management REST API Endpoints", "57"),
        ("Table B.3", "Lawyer & Administrative Management REST API Endpoints", "58"),
    ]
    tbl_lot = doc.add_table(rows=len(tables_data), cols=3)
    tbl_lot.alignment = WD_TABLE_ALIGNMENT.CENTER
    for idx, (t_num, t_name, t_pg) in enumerate(tables_data):
        c1 = tbl_lot.cell(idx, 0)
        c2 = tbl_lot.cell(idx, 1)
        c3 = tbl_lot.cell(idx, 2)
        c1.text = t_num
        c2.text = t_name
        c3.text = t_pg
        for c in (c1, c2, c3):
            c.paragraphs[0].runs[0].font.name = 'Times New Roman'
            c.paragraphs[0].runs[0].font.size = Pt(11)
            c.paragraphs[0].paragraph_format.line_spacing = 1.2
            set_cell_margins(c, 30, 30, 50, 50)
        c1.paragraphs[0].runs[0].bold = True
        c3.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.RIGHT

    add_p("", space_after=24)
    add_p("LIST OF ABBREVIATIONS", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=14, space_before=10, space_after=18)
    abbr_data = [
        ("API", "Application Programming Interface"),
        ("DOM", "Document Object Model"),
        ("DTO", "Data Transfer Object"),
        ("ERD", "Entity-Relationship Diagram"),
        ("HTML", "HyperText Markup Language"),
        ("ICS", "Internet Calendar Scheduling Format"),
        ("JSON", "JavaScript Object Notation"),
        ("LNBTI", "Lanka Nippon BizTech Institute"),
        ("MVC", "Model-View-Controller"),
        ("NIC", "National Identity Card"),
        ("NPM", "Node Package Manager"),
        ("ORM", "Object-Relational Mapping"),
        ("PDF", "Portable Document Format"),
        ("PHP", "Hypertext Preprocessor"),
        ("RBAC", "Role-Based Access Control"),
        ("REST", "Representational State Transfer"),
        ("SDLC", "Software Development Life Cycle"),
        ("UI/UX", "User Interface / User Experience"),
        ("URL", "Uniform Resource Locator"),
    ]
    tbl_abbr = doc.add_table(rows=len(abbr_data), cols=2)
    tbl_abbr.alignment = WD_TABLE_ALIGNMENT.CENTER
    for idx, (short_name, long_name) in enumerate(abbr_data):
        c1 = tbl_abbr.cell(idx, 0)
        c2 = tbl_abbr.cell(idx, 1)
        c1.text = short_name
        c2.text = long_name
        c1.paragraphs[0].runs[0].font.name = 'Times New Roman'
        c1.paragraphs[0].runs[0].font.size = Pt(11)
        c1.paragraphs[0].runs[0].bold = True
        c2.paragraphs[0].runs[0].font.name = 'Times New Roman'
        c2.paragraphs[0].runs[0].font.size = Pt(11)
        c1.paragraphs[0].paragraph_format.line_spacing = 1.15
        c2.paragraphs[0].paragraph_format.line_spacing = 1.15
        set_cell_margins(c1, 20, 20, 40, 40)
        set_cell_margins(c2, 20, 20, 40, 40)

    doc.add_page_break()

    # ═════════════════════════════════════════════════════════════════════════
    # CHAPTER 1: INTRODUCTION
    # ═════════════════════════════════════════════════════════════════════════
    add_chap_heading("1", "Introduction")

    add_sub1("1.1", "Introduction of the Organization")
    add_p("KNW PRO Realtor (Private) Limited is a premier real estate brokerage, land sales, and property consultancy company based in Colombo, Sri Lanka. The company operates across residential, commercial, and agricultural property markets, offering end-to-end services including property brokerage, land subdivision, investment advisory, and legal deed verification coordination. To address systemic bottlenecks in the conventional property market—such as manual transactions, lack of transparency, and prevalence of title deed fraud—KNW PRO Realtor established an internal IT and Digital Systems Department dedicated to developing high-integrity digital real estate and legal clearance infrastructure.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)
    add_p("The organization operates with an agile software engineering philosophy, championing continuous integration, user-centric software design, and strict data governance. The corporate vision of KNW PRO Realtor is to become Sri Lanka's most trusted, innovative, and legally secure property trading ecosystem. Its corporate mission is to eliminate real estate fraud, simplify land acquisitions, and seamlessly bridge property buyers, sellers, and licensed legal practitioners through cutting-edge digital platforms, transparent fee models, and verified legal clearances.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)

    add_sub1("1.2", "History of the Organization")
    add_p("Established in 2018 in Colombo, Sri Lanka, KNW PRO Realtor was founded by experienced real estate consultants and property development professionals with a clear objective: to modernize and bring trust to the fragmented Sri Lankan real estate industry. In its formative years (2018–2021), the firm operated primarily as a traditional commercial and residential property brokerage, managing prime residential land plots, commercial buildings, and luxury apartments across the Western Province (Colombo, Gampaha, and Kalutara).",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)
    add_p("Between 2022 and 2024, recognizing that conventional manual brokerage models were severely hindered by forged title deeds, unauthorized middlemen, and opaque buyer-lawyer communication channels, the board of directors made a strategic decision to digitize operations. The company established an in-house IT & Digital Systems Department to build a proprietary, next-generation property trading portal—'KNW PRO Realtor'. This strategic transition positioned the company as a pioneering digital real estate enterprise in Sri Lanka.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)

    add_sub1("1.3", "Organization Structure")
    add_p("KNW PRO Realtor is organized in a modern matrix hierarchy designed to facilitate rapid technological delivery, cross-disciplinary collaboration, and clear operational accountability. Executive leadership is spearheaded by the Board of Directors and the Managing Director, who oversee strategic planning, corporate governance, capital allocation, and client relations.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)
    add_p("Directly beneath executive leadership are four primary functional departments:\n"
          "1. Real Estate Brokerage & Property Valuation: Responsible for property appraisals, land demarcation, seller onboarding, and site inspections across Sri Lankan districts.\n"
          "2. Legal & Conveyancing Advisory: Composed of licensed real estate attorneys-at-law and deed searchers who conduct Land Registry deed extracts, survey checks, and title clearances.\n"
          "3. IT & Digital Systems (Department of Study): The in-house engineering division responsible for full-stack software development, database architecture, platform security, and digital document vaults.\n"
          "4. Sales, Marketing & Customer Operations: Handling buyer-seller inquiries, multilingual client relations (English, Sinhala, Tamil), property promotions, and payment reconciliations.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)

    add_sub1("1.4", "Nature of Business and Operations")
    add_p("The operational footprint of KNW PRO Realtor spans three core business divisions:\n"
          "a) Real Estate Brokerage & Land Sales: Facilitating verified property transactions for residential houses, luxury apartments, commercial buildings, and subdivided land plots across Sri Lanka.\n"
          "b) Legal Advisory & Title Deed Clearance: Partnering with registered legal practitioners to provide title deed verification, non-encumbrance certificate checks, and direct attorney consultation scheduling.\n"
          "c) Digital PropTech Platform Operations: Maintaining and continually upgrading the proprietary KNW PRO Realtor web platform, featuring dynamic valuation calculators, video consultation scheduling, digital document vaults, and administrative moderation.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)

    add_sub1("1.5", "Department of Study (IT & Digital Systems Department)")
    add_p("The trainee was placed within the in-house IT & Digital Systems Department of KNW PRO Realtor (Private) Limited. This department is directly tasked with full-stack platform development, REST API design, relational data modeling, identity verification mechanisms, and client-side performance engineering for the proprietary KNW PRO Realtor web application.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)

    add_sub1("1.6", "Management Practices, Rules, and Work Culture")
    add_p("The engineering division adheres to the Agile Scrum framework, operating in two-week sprint cadences. Daily Stand-up meetings are conducted at 09:30 AM to identify technical blockers, report progress, and coordinate deliverables between software developers, property brokers, and legal advisors. All code contributions are governed through Git branching workflows (GitFlow), requiring peer code reviews and automated linting before merge approval into production staging.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)
    add_p("Corporate culture at KNW PRO Realtor strongly emphasizes software quality, rigorous data confidentiality (particularly regarding National Identity Cards and property deeds), and user-centric problem solving. Trainees are integrated directly into core engineering workflows, encouraged to propose architectural enhancements, and tasked with solving real-world customer friction points under the guidance of senior technical mentors.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)

    doc.add_page_break()

    # ═════════════════════════════════════════════════════════════════════════
    # CHAPTER 2: TECHNOLOGIES AND THEORETICAL CONCEPTS USED
    # ═════════════════════════════════════════════════════════════════════════
    add_chap_heading("2", "Technologies and Theoretical Concepts Used")

    add_sub1("2.1", "Full-Stack Architectural Framework")
    add_p("The KNW PRO Realtor platform was engineered upon a decoupled, three-tier client-server architectural paradigm. This decoupling guarantees a strict separation of concerns, high maintainability, independent horizontal scaling of frontend assets via Content Delivery Networks (CDNs), and secure centralized business logic execution on the backend server.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)

    add_sub1("2.2", "Frontend Technologies (React 18, Vite, Context API)")
    add_p("The client-side single-page application (SPA) was developed utilizing React 18, bundled and compiled via the lightning-fast Vite build tool. Key theoretical and technical concepts implemented on the frontend include:",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)
    add_bullet("Component-Driven UI Architecture", "Modular, reusable functional React components organized across pages, modals, calculators, and navigation bars.")
    add_bullet("Reactive Global State via Context API", "Eliminating 'prop-drilling' through custom context providers: AuthContext (managing authentication, user permissions, and active role switching), LanguageContext (multilingual i18n support in English, Sinhala, and Tamil), and CurrencyContext (real-time exchange conversion between LKR, USD, EUR, and GBP).")
    add_bullet("Asynchronous HTTP Client (Axios)", "REST API communication with interceptors, standardized error handling, and multipart/form-data encoding for file uploads.")
    add_bullet("Responsive CSS3 Design System", "Custom CSS variables, flexbox and CSS grid layouts ensuring pixel-perfect adaptability across desktops, tablets, and mobile devices.")

    add_sub1("2.3", "Backend Technologies (PHP 8.4, Laravel 13 Framework)")
    add_p("The server-side API was developed using PHP 8.4 on the modern Laravel 13 framework. Theoretical concepts and backend mechanisms utilized include:",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)
    add_bullet("Model-View-Controller (MVC) & RESTful Routing", "Strict segregation of business logic into dedicated controllers (AuthController, SellerPropertyDraftController, LawyerController, AdminUserController) serving clean JSON endpoints.")
    add_bullet("Eloquent Object-Relational Mapping (ORM)", "Database abstraction through strongly typed Eloquent models, declarative relationships (hasMany, belongsTo, withCount), and automatic date/hash casting.")
    add_bullet("Database Migrations & Schema Blueprints", "Version-controlled, idempotent schema migrations enabling repeatable database provisioning and seamless schema evolutions.")
    add_bullet("Request Validation & Security Middleware", "Centralized validation rules enforcing data integrity, password complexity requirements, file size limits, and role authorization.")

    add_sub1("2.4", "Database Architecture & Management (MySQL)")
    add_p("Relational data storage was managed via MySQL. The database schema was designed in Third Normal Form (3NF) to eliminate data redundancy, enforce referential integrity via foreign key constraints, and optimize read queries through indexing on primary search columns (such as district, property type, price, and approval status).",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)

    add_sub1("2.5", "Security, Authentication & Role-Based Access Control (RBAC)")
    add_p("Security was treated as a first-class engineering requirement throughout the system:",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)
    add_bullet("Bcrypt Password Hashing", "Passwords hashed using 12 cryptographic rounds, rendering stored credentials resilient against rainbow table and brute-force attacks.")
    add_bullet("Private Storage Isolation for Sensitive Documents", "National Identity Card (NIC) documents are stored in protected, non-public storage directories (`storage/app/private/nic_documents`) accessible solely through authenticated administrative proxy routes.")
    add_bullet("Role-Based Permission Matrix", "Explicit permission gates separating actions available to Buyers, Verified Sellers, Legal Practitioners, Staff Members, and Super Administrators.")

    add_sub1("2.6", "Third-Party Payment, Storage & Notification Integrations")
    add_p("The platform interfaces with external services to facilitate real-world commercial operations:\n"
          "• PayHere Payment Gateway: Checkout API integration enabling automated card payments for listing tiers and legal consultation bookings.\n"
          "• iCalendar ICS Protocol: Automated generation of downloadable `.ics` calendar invitation files for site inspections and video consultations.\n"
          "• Notification Engine: Real-time user notification dispatcher updating buyers on visit approvals and sellers on new lead inquiries.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)

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


    doc.add_page_break()

    # ═════════════════════════════════════════════════════════════════════════
    # CHAPTER 3: TRAINING EXPERIENCE
    # ═════════════════════════════════════════════════════════════════════════
    add_chap_heading("3", "Training Experience")

    add_sub1("3.1", "Working Environment & Engineering Setup")
    add_p("The industrial training commenced with a comprehensive onboarding into the organization's engineering toolchain. The local development environment was configured on Windows workstations utilizing PHP 8.4, Composer 2.x, Node.js 20 LTS, NPM, MySQL Server, and Visual Studio Code with tailored linting and syntax analysis extensions. Git was employed for source control, while Postman was utilized for API endpoint testing and payload inspection.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)

    add_sub1("3.2", "Activities Performed on KNW PRO Realtor Platform")
    add_p("Throughout the training period, the trainee actively participated in the full software engineering lifecycle of the KNW PRO Realtor platform, delivering mission-critical modules across both frontend and backend tiers.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)

    add_sub2("3.2.1", "Unified Single-Account & Dynamic Role-Switching Engine")
    add_p("A cornerstone achievement during the internship was resolving the legacy platform architectural flaw where users were forced to maintain completely separate accounts (with separate email addresses) if they wished to participate as both property buyers and sellers.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)
    add_p("The trainee re-architected the identity model into a Single Unified Account with Dynamic Role Switching:\n"
          "1. Database Enhancement: Formulated and executed migration `add_seller_status_to_users_table.php`, introducing a distinct `seller_status` enum ('none', 'pending', 'active', 'rejected') to decouple identity from selling authorization.\n"
          "2. Model Logic: Enhanced `User.php` with dynamic permission checks (`canListProperty()`, `isApprovedSeller()`, `isPendingSeller()`). Every registered account automatically holds Buyer privileges, while Seller privileges are granted upon identity verification approval.\n"
          "3. Backend In-Place Verification API: Developed `POST /api/user/apply-seller` in `AuthController.php`. Existing users submit their Phone, NIC number, Address, and NIC document upload without logging out or re-registering.\n"
          "4. Frontend Mode Switcher: Integrated reactive state (`activeRole`, `switchRole`) within `AuthContext.jsx`. Designed an interactive Mode Switcher pill interface in `Navbar.jsx` and `Navbar.css`, enabling instant toggling between Buyer Mode, Seller Mode, and Lawyer Mode.\n"
          "5. Sell Page In-Place Onboarding: Overhauled `SellerPage.jsx`. When an unverified buyer visits the Sell page, the previous blocking error was replaced with an elegant 'Activate Seller Privileges' form.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)

    # Comparison Table
    tbl_comp = doc.add_table(rows=5, cols=3)
    tbl_comp.alignment = WD_TABLE_ALIGNMENT.CENTER
    comp_data = [
        ("Feature / Aspect", "Legacy Architecture", "Newly Implemented Unified Model"),
        ("Account Structure", "Separate account per role (1 email = 1 role)", "Single Unified Account per person"),
        ("Buyer Wanting to Sell", "Blocked; forced logout & 2nd email registration", "In-place NIC verification directly from profile"),
        ("Lawyer Capabilities", "Restricted strictly to lawyer workspace", "Can seamlessly switch to Buyer or Seller mode"),
        ("User Experience (UX)", "Frequent logout/login; password confusion", "1-click Mode Switcher in top navigation bar"),
    ]
    for r_idx, (c1_txt, c2_txt, c3_txt) in enumerate(comp_data):
        c1 = tbl_comp.cell(r_idx, 0)
        c2 = tbl_comp.cell(r_idx, 1)
        c3 = tbl_comp.cell(r_idx, 2)
        c1.text = c1_txt
        c2.text = c2_txt
        c3.text = c3_txt
        for cell in (c1, c2, c3):
            cell.paragraphs[0].runs[0].font.name = 'Times New Roman'
            if r_idx == 0:
                cell.paragraphs[0].runs[0].font.size = Pt(11)
                cell.paragraphs[0].runs[0].bold = True
                set_cell_background(cell, "F1F5F9")
            else:
                cell.paragraphs[0].runs[0].font.size = Pt(10.5)
            cell.paragraphs[0].paragraph_format.line_spacing = 1.2
            set_cell_margins(cell, 40, 40, 60, 60)

    add_p("", space_after=12)

    add_sub2("3.2.2", "Property Intake, Pricing Estimator & Draft Pipeline")
    add_p("The trainee engineered the comprehensive property listing pipeline in `SellerPropertyDraftController.php` and `SellerPage.jsx`. Key contributions included:",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)
    add_bullet("Multi-Step Intake Form", "Capturing property typology, Sri Lankan district selector, expected price, preferred physical inspection dates, and coordinates.")
    add_bullet("Legal Document Upload Conduits", "Secure multipart upload for title deeds, registered survey plans, and local council clearance certificates.")
    add_bullet("Interactive Financial Tools", "Developed `PriceEstimator.jsx` and `FinancialCalculators.jsx` allowing sellers and buyers to calculate mortgage amortizations, stamp duty, and square-foot valuations.")
    add_bullet("Listing Monetization Plans", "Integrated basic, verified, and featured listing tiers with slip upload verification and PayHere online payment processing.")

    add_sub2("3.2.3", "Lawyer Legal Verification & Consultation Management")
    add_p("Recognizing that title insecurity is the primary deterrent for property investors in Sri Lanka, the trainee contributed to the LegalTech module in `LawyerController.php` and `LawyerDashboard.jsx`:",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)
    add_bullet("Deed Review Guarantee Workflow", "All uploaded property deeds are routed to registered real estate attorneys for legal review. Once cleared, properties earn the verified 'KNW Certified Deed Verified' badge.")
    add_bullet("Lawyer Calendar & Slot Management", "Attorneys manage weekly availability schedules, blocked holiday dates, and consultation fees.")
    add_bullet("Video Consultation Booking", "Buyers book legal consultations with automated calendar invite generation (`calendarInvite.js`) and status tracking.")

    add_sub2("3.2.4", "Buyer Shortlist, Property Dossier & Site Inspection Booking")
    add_p("The trainee developed the rich buyer engagement ecosystem within `BuyerDashboard.jsx` and `PropertyDetail.jsx`:",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)
    add_bullet("Saved Properties Shortlist", "Personalized property bookmarking with custom user notes (`SavedPropertyController.php`).")
    add_bullet("Property Dossier Modal", "Interactive comprehensive property summaries compile deed verification status, survey details, and neighborhood metrics for export.")
    add_bullet("Physical Site Visit Booking", "Buyers request inspection dates with sellers, receiving automated notifications upon confirmation.")

    add_sub2("3.2.5", "Administrative Governance, User Moderation & Approvals")
    add_p("The trainee built and refined the administrative moderation portal within `AdminUserController.php` and `AdminDashboard.jsx`:",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)
    add_bullet("Seller Identity Moderation", "Reviewing uploaded NIC/Passport documents in private storage, approving active sellers, or rejecting fraudulent applications with recorded reasons.")
    add_bullet("Listing Quality & Payment Audit", "Screening property draft details, validating payment receipts, and toggling official published status.")
    add_bullet("System Metrics & Analytics", "Real-time summary reporting of registered buyers, active sellers, pending approvals, and platform revenue.")

    add_sub1("3.3", "Problems Encountered and Solutions Implemented")
    add_p("Software engineering in a commercial enterprise naturally presents complex technical and architectural challenges. The following key problems were identified, analyzed, and successfully resolved by the trainee:",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)

    add_sub2("3.3.1", "Problem 1: Duplicate Account Requirement for Buyers Wanting to Sell")
    add_p("• Root Cause: The initial system strictly tied permissions to a single `role` enum column in the `users` table ('buyer', 'seller', 'lawyer'). When a buyer clicked 'Sell', the frontend redirected them to `/register?role=seller`. However, because the `email` column enforces database-level uniqueness, registration failed unless the user possessed a second email address.\n"
          "• Solution: Introduced the `seller_status` column and developed the `applyForSeller` API endpoint. Updated the user resource with granular capability flags (`can.act_as_buyer`, `can.act_as_seller`). Created the in-place verification form on `SellerPage.jsx` and the Navbar mode switcher, allowing one account to operate across multiple roles.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)

    add_sub2("3.3.2", "Problem 2: Cross-Role Privilege Collisions for Legal Practitioners")
    add_p("• Root Cause: Lawyers registered on the platform were isolated within the `LawyerDashboard`. When attempting to browse marketplace listings or save favorite properties, the navigation bar was hidden, preventing them from acting as ordinary buyers.\n"
          "• Solution: Enhanced `Navbar.jsx` and `LawyerDashboard.jsx` with bidirectional role switching, allowing lawyers to retain their verified attorney credentials while freely toggling into Buyer or Seller views.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)

    add_sub2("3.3.3", "Problem 3: Real Estate Fraud & Unverified Land Ownership Title Deeds")
    add_p("• Root Cause: Property marketplaces frequently suffer from bogus listings uploaded by unauthorized middlemen.\n"
          "• Solution: Established a two-stage security protocol: (1) mandatory administrative NIC document screening before a seller can submit drafts, and (2) attorney-backed deed verification whereby listings are routed to licensed legal practitioners before earning certified public badges.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)

    add_sub2("3.3.4", "Problem 4: Client-Side Session State Inconsistency on Role Change")
    add_p("• Root Cause: When a user submitted seller verification or switched active modes, stale data in browser `localStorage` caused the UI to display outdated permission states until a hard page reload was performed.\n"
          "• Solution: Integrated state synchronization methods (`refreshUser`, `switchRole`) within `AuthContext.jsx`, instantly updating both the React memory state and persistent `localStorage`, guaranteeing reactive UI consistency.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)

    add_sub1("3.4", "Extra Activities and Collaborative Practices Participated")
    add_p("Beyond core programming responsibilities, the trainee actively engaged in organizational and professional development practices:\n"
          "• Agile Sprint Reviews & Retrospectives: Participating in fortnightly retrospective meetings to evaluate completed user stories and refine sprint velocity.\n"
          "• Code Quality & Peer Reviews: Reviewing pull requests, identifying edge cases in API validation, and enforcing uniform code style guidelines.\n"
          "• Technical Documentation: Authoring API endpoint documentation and user onboarding workflow guides.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)

    doc.add_page_break()

    # ═════════════════════════════════════════════════════════════════════════
    # CHAPTER 4: CONCLUSION
    # ═════════════════════════════════════════════════════════════════════════
    add_chap_heading("4", "Conclusion")

    add_sub1("4.1", "Summary of Training Experience")
    add_p("The six-month industrial training program at KNW PRO Realtor (Private) Limited has been an invaluable, transformative milestone in the trainee's software engineering journey. It provided a direct, immersive bridge connecting academic concepts cultivated at Lanka Nippon BizTech Institute with the realities, complexities, and quality standards demanded by the enterprise software industry.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)
    add_p("Working on the KNW PRO Realtor platform provided end-to-end exposure across every tier of modern web engineering: from conceptual database schema modeling, RESTful API construction, and security hardening, to component-driven React engineering, responsive UI design, and agile team collaboration.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)

    add_sub1("4.2", "Technical and Professional Competencies Acquired")
    add_p("The industrial internship fostered significant growth across both technical and soft skill dimensions:",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)
    add_bullet("Advanced Full-Stack Engineering", "Deepened mastery of PHP 8.4, Laravel 13, React 18, Vite, and MySQL relational modeling.")
    add_bullet("Architectural Problem-Solving", "Ability to diagnose root architectural bottlenecks—such as role collisions and registration friction—and engineer elegant, backward-compatible solutions.")
    add_bullet("Security & Data Protection", "Hands-on experience implementing Bcrypt hashing, private disk isolation, file MIME-type validation, and role authorization gates.")
    add_bullet("Professional & Agile Collaboration", "Mastery of GitFlow version control, sprint planning, task estimation, peer code reviews, and cross-functional communication.")

    add_sub1("4.3", "Evaluation of System Success and Limitations")
    add_p("The newly engineered KNW PRO Realtor platform successfully achieved its core design objectives: eliminating duplicate account registration friction, streamlining attorney legal verification of property deeds, and delivering a responsive, secure marketplace experience. However, current system limitations include the reliance on polling for real-time notifications (which could be upgraded to WebSockets via Laravel Reverb) and manual administrative review of NIC documents.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)

    add_sub1("4.4", "Future Enhancements and Scalability Recommendations")
    add_p("To ensure long-term scalability and market dominance, the following strategic enhancements are recommended:\n"
          "1. Automated OCR Identity Extraction: Integrating Optical Character Recognition (OCR) to automatically scan and verify NIC numbers from uploaded images.\n"
          "2. Real-Time WebSocket Communication: Upgrading inquiry messaging and notification dispatching to bidirectional WebSockets using Laravel Reverb.\n"
          "3. Native Mobile Applications: Developing cross-platform mobile apps using React Native or Flutter sharing the existing Laravel REST API backend.\n"
          "4. GIS Interactive Mapping: Integrating Leaflet or Google Maps APIs for geospatial property boundary mapping.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)

    add_sub1("4.5", "Concluding Remarks")
    add_p("In conclusion, the industrial training program has comprehensively fulfilled the academic prerequisites of module IT3901 for the Higher Diploma in Software Engineering. The technical expertise, engineering discipline, and professional values gained at KNW PRO Realtor (Private) Limited will serve as a resilient foundation for the trainee's future career as a professional software engineer.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)

    doc.add_page_break()

    # ═════════════════════════════════════════════════════════════════════════
    # REFERENCES / BIBLIOGRAPHY (Harvard Style)
    # ═════════════════════════════════════════════════════════════════════════
    add_p("REFERENCES / BIBLIOGRAPHY", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=14, space_before=10, space_after=20)

    references = [
        "Banks, A. and Porcello, E., 2020. Learning React: Modern Patterns for Developing React Applications. 2nd ed. Sebastopol: O'Reilly Media.",
        "Curioso, G., 2021. Full-Stack Web Development with Laravel and React. Birmingham: Packt Publishing.",
        "Fielding, R.T., 2000. Architectural Styles and the Design of Network-based Software Architectures. Doctoral dissertation. University of California, Irvine.",
        "Freeman, A., 2022. Pro ASP.NET Core 6: Develop Cloud-Ready Web Applications Using MVC, Blazor, and Razor Pages. New York: Apress.",
        "Laravel LLC, 2026. Laravel Documentation - The PHP Framework for Web Artisans. Available at: <https://laravel.com/docs/13.x> [Accessed 15 October 2026].",
        "Martin, R.C., 2018. Clean Architecture: A Craftsman's Guide to Software Structure and Design. Boston: Prentice Hall.",
        "MySQL AB, 2026. MySQL 8.0 Reference Manual. Available at: <https://dev.mysql.com/doc/refman/8.0/en/> [Accessed 18 October 2026].",
        "Nixon, R., 2021. Learning PHP, MySQL & JavaScript: With jQuery, CSS & HTML5. 6th ed. Sebastopol: O'Reilly Media.",
        "React Community, 2026. React - The Library for Web and Native User Interfaces. Available at: <https://react.dev> [Accessed 12 October 2026].",
        "Sommerville, I., 2016. Software Engineering. 10th ed. Boston: Pearson.",
        "Vite Community, 2026. Vite: Next Generation Frontend Tooling. Available at: <https://vitejs.dev> [Accessed 14 October 2026].",
    ]
    for ref in references:
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p.paragraph_format.left_indent = Inches(0.5)
        p.paragraph_format.first_line_indent = Inches(-0.5)
        p.paragraph_format.space_after = Pt(8)
        p.paragraph_format.line_spacing = 1.3
        run = p.add_run(ref)
        run.font.name = 'Times New Roman'
        run.font.size = Pt(11)

    doc.add_page_break()

    # ═════════════════════════════════════════════════════════════════════════
    # APPENDICES
    # ═════════════════════════════════════════════════════════════════════════
    add_p("APPENDIX A: DATABASE SCHEMA DESIGN", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=14, space_before=10, space_after=18)

    add_sub1("A.1", "Users Table Specification")
    tbl_a1 = doc.add_table(rows=8, cols=4)
    tbl_a1.alignment = WD_TABLE_ALIGNMENT.CENTER
    a1_data = [
        ("Column Name", "Data Type", "Constraints / Attributes", "Description"),
        ("id", "BIGINT UNSIGNED", "PRIMARY KEY, AUTO_INCREMENT", "Unique user identity identifier"),
        ("name", "VARCHAR(100)", "NOT NULL", "Full legal name of user"),
        ("email", "VARCHAR(150)", "NOT NULL, UNIQUE", "Unique user authentication email"),
        ("role", "ENUM", "'admin','staff','lawyer','seller','buyer'", "Primary identity role of account"),
        ("seller_status", "ENUM", "'none','pending','active','rejected'", "Decoupled seller verification status"),
        ("nic_number", "VARCHAR(30)", "NULLABLE", "National Identity Card / Passport Number"),
        ("nic_document_path", "VARCHAR(255)", "NULLABLE", "Private storage path to uploaded identity document"),
    ]
    for r_idx, row_vals in enumerate(a1_data):
        for c_idx, val in enumerate(row_vals):
            cell = tbl_a1.cell(r_idx, c_idx)
            cell.text = val
            cell.paragraphs[0].runs[0].font.name = 'Times New Roman'
            if r_idx == 0:
                cell.paragraphs[0].runs[0].font.size = Pt(10.5)
                cell.paragraphs[0].runs[0].bold = True
                set_cell_background(cell, "E2E8F0")
            else:
                cell.paragraphs[0].runs[0].font.size = Pt(9.5)
            cell.paragraphs[0].paragraph_format.line_spacing = 1.15
            set_cell_margins(cell, 30, 30, 40, 40)

    add_p("", space_after=16)
    add_sub1("A.2", "Seller Property Drafts Table Specification")
    tbl_a2 = doc.add_table(rows=7, cols=4)
    tbl_a2.alignment = WD_TABLE_ALIGNMENT.CENTER
    a2_data = [
        ("Column Name", "Data Type", "Constraints / Attributes", "Description"),
        ("id", "BIGINT UNSIGNED", "PRIMARY KEY, AUTO_INCREMENT", "Unique listing identifier"),
        ("seller_id", "BIGINT UNSIGNED", "FOREIGN KEY -> users(id)", "User identity of the property seller"),
        ("property_type", "VARCHAR(80)", "NOT NULL", "Type e.g. Luxury House, Commercial Land"),
        ("district", "VARCHAR(80)", "NOT NULL", "Sri Lankan administrative district location"),
        ("expected_price", "VARCHAR(80)", "NOT NULL", "Target selling price (LKR / converted)"),
        ("status", "ENUM", "'draft','pending_review','published'", "Administrative listing publication state"),
    ]
    for r_idx, row_vals in enumerate(a2_data):
        for c_idx, val in enumerate(row_vals):
            cell = tbl_a2.cell(r_idx, c_idx)
            cell.text = val
            cell.paragraphs[0].runs[0].font.name = 'Times New Roman'
            if r_idx == 0:
                cell.paragraphs[0].runs[0].font.size = Pt(10.5)
                cell.paragraphs[0].runs[0].bold = True
                set_cell_background(cell, "E2E8F0")
            else:
                cell.paragraphs[0].runs[0].font.size = Pt(9.5)
            cell.paragraphs[0].paragraph_format.line_spacing = 1.15
            set_cell_margins(cell, 30, 30, 40, 40)

    doc.add_page_break()

    add_p("APPENDIX B: CORE RESTFUL API SPECIFICATIONS", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=14, space_before=10, space_after=18)
    tbl_b = doc.add_table(rows=9, cols=4)
    tbl_b.alignment = WD_TABLE_ALIGNMENT.CENTER
    b_data = [
        ("HTTP Method", "API Route URI", "Controller Action", "Purpose & Access Control"),
        ("POST", "/api/auth/register", "AuthController@register", "Public registration for buyers and sellers"),
        ("POST", "/api/auth/login", "AuthController@login", "Public authentication returning user & permissions"),
        ("POST", "/api/user/apply-seller", "AuthController@applyForSeller", "In-place seller verification for existing users"),
        ("GET", "/api/properties", "SellerPropertyDraftController@publicIndex", "Public search and filter of published properties"),
        ("POST", "/api/seller/listings", "SellerPropertyDraftController@store", "Submission of new property draft by approved sellers"),
        ("GET", "/api/buyer/inquiries", "PropertyInquiryController@buyerInquiries", "Retrieve site visit bookings for buyer dashboard"),
        ("POST", "/api/appointments", "LawyerController@bookAppointment", "Book video consultation with certified attorney"),
        ("PATCH", "/api/admin/sellers/{id}/approve", "AdminUserController@approveSeller", "Admin verification approval of seller identity"),
    ]
    for r_idx, row_vals in enumerate(b_data):
        for c_idx, val in enumerate(row_vals):
            cell = tbl_b.cell(r_idx, c_idx)
            cell.text = val
            cell.paragraphs[0].runs[0].font.name = 'Times New Roman'
            if r_idx == 0:
                cell.paragraphs[0].runs[0].font.size = Pt(10.5)
                cell.paragraphs[0].runs[0].bold = True
                set_cell_background(cell, "E2E8F0")
            else:
                cell.paragraphs[0].runs[0].font.size = Pt(9)
            cell.paragraphs[0].paragraph_format.line_spacing = 1.15
            set_cell_margins(cell, 25, 25, 35, 35)

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


    output_path = os.path.abspath("Industrial_Training_Report_KNW_PRO_Realtor.docx")
    try:
        doc.save(output_path)
        print(f"Report successfully generated at: {output_path}")
    except PermissionError:
        alt_path = os.path.abspath("Industrial_Training_Report_KNW_PRO_Realtor_Updated.docx")
        doc.save(alt_path)
        print(f"Primary file was locked in Word. Report successfully generated at: {alt_path}")

if __name__ == "__main__":
    create_report()
