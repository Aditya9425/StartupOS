import glob
import re
import os

files = glob.glob("/home/aditya-bathla/Projects/StartupOS/frontend/src/app/*/page.tsx")

aside_pattern = re.compile(r'<aside.*?</aside>', re.DOTALL)
navitem_pattern = re.compile(r'^\s*return \(\s*<Link href=\{href\}>\s*<div\s*className=\{`flex items-center.*?</Link>\s*\);\s*}\s*', re.DOTALL | re.MULTILINE)

for file in files:
    with open(file, 'r') as f:
        content = f.read()

    # If it's onboarding, skip it
    if "onboarding" in file or "blueprint" in file:
        continue
    
    # 1. Replace the aside block with the Sidebar component
    # We want to match the exact page name to pass to activeRoute
    page_name = os.path.basename(os.path.dirname(file))
    
    sidebar_component = f'<Sidebar activeRoute="{page_name}" />'
    content = aside_pattern.sub(sidebar_component, content)
    
    # 2. Remove the broken NavItem body
    content = navitem_pattern.sub('', content)
    
    # 3. Add Sidebar import if not exists
    if 'import Sidebar from "@/components/Sidebar";' not in content:
        content = content.replace('"use client";\n', '"use client";\nimport Sidebar from "@/components/Sidebar";\n')
        
    with open(file, 'w') as f:
        f.write(content)
        
print("Fixed files.")
