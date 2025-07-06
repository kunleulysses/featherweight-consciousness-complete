with open('src/components/dashboard/SigilIdentityMetrics.tsx', 'r') as f:
    content = f.read()

# Simply replace generateSigilColor with a direct color calculation
content = content.replace(
    "color: generateSigilColor(data.data.strength || 0.8),",
    "color: 'hsl(' + ((data.data.strength || 0.8) * 360) + ', 70%, 50%)',"
)

with open('src/components/dashboard/SigilIdentityMetrics.tsx', 'w') as f:
    f.write(content)

print("Fixed color generation")
