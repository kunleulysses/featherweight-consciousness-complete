with open('src/components/dashboard/SigilIdentityMetrics.tsx', 'r') as f:
    content = f.read()

# Replace the problematic template literal with a simpler approach
content = content.replace(
    "animationDelay: `${index * 0.1}s`",
    "animationDelay: (index * 0.1) + 's'"
)

with open('src/components/dashboard/SigilIdentityMetrics.tsx', 'w') as f:
    f.write(content)

print("Fixed animation delay syntax")
