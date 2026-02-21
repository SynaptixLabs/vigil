filepath = r'C:\Synaptix-Labs\projects\project-refiner\docs\01_ARCHITECTURE.md'
content = open(filepath, 'rb').read()

# Fix 14a: Background entry point - the first occurrence of "index.ts" with "Service worker entry point"
old = b'index.ts                    # Service worker entry point'
new = b'service-worker.ts           # Service worker entry point'
if old in content:
    content = content.replace(old, new, 1)  # Only first occurrence
    print('Fix 14a: background entry point fixed')
else:
    print('Fix 14a: NOT FOUND')

open(filepath, 'wb').write(content)
print('DONE')
