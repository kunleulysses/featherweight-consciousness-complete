import re

with open('src/components/dashboard/SigilIdentityMetrics.tsx', 'r') as f:
    lines = f.readlines()

# Check around line 339
start = max(0, 339 - 20)
end = min(len(lines), 339 + 5)

print("Lines around the error:")
for i in range(start, end):
    print(f"{i+1}: {lines[i]}", end='')
    
# Check for unclosed braces or brackets before line 339
content = ''.join(lines[:339])
open_braces = content.count('{') - content.count('}')
open_brackets = content.count('[') - content.count(']')
open_parens = content.count('(') - content.count(')')

print(f"\nBrace balance up to line 339: {open_braces}")
print(f"Bracket balance up to line 339: {open_brackets}")
print(f"Paren balance up to line 339: {open_parens}")
