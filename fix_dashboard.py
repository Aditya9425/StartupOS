with open("frontend/src/app/dashboard/page.tsx", "r") as f:
    content = f.read()

content = content.replace("      </main>\n    </div>\n  );\n}", "    </div>\n  );\n}")

with open("frontend/src/app/dashboard/page.tsx", "w") as f:
    f.write(content)
