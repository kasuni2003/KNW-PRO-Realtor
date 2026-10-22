import shutil
import time
import os

source = "Industrial_Training_Report_KNW_PRO_Realtor_Updated_With_Test_Cases.docx"
target = "Industrial_Training_Report_KNW_PRO_Realtor_Updated.docx"

if not os.path.exists(source):
    print(f"Error: {source} does not exist.")
    exit(1)

try:
    shutil.copyfile(source, target)
    print(f"Success: Updated {target} with contents from {source}!")
except PermissionError:
    print(f"Notice: {target} is currently open in Microsoft Word. Please close Word and run this script again.")
