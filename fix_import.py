with open("frontend/src/app/dashboard/page.tsx", "r") as f:
    content = f.read()

content = content.replace("import { Copy, Check } from \"lucide-react\";", "import { Copy } from \"lucide-react\";")

with open("frontend/src/app/dashboard/page.tsx", "w") as f:
    f.write(content)
