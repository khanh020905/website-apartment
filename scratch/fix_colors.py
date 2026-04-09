import os
import re

def replace_in_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Define replacements
    replacements = [
        (r'bg-amber-400\s+text-slate-900', 'bg-brand-primary text-white'),
        (r'bg-amber-400\s+hover:bg-amber-500\s+text-slate-900', 'bg-brand-primary hover:bg-brand-dark text-white'),
        (r'text-slate-900\s+bg-amber-400\s+hover:bg-amber-500', 'text-white bg-brand-primary hover:bg-brand-dark'),
        (r'bg-amber-400', 'bg-brand-primary'),
        (r'hover:bg-amber-500', 'hover:bg-brand-dark'),
        (r'text-amber-500', 'text-brand-primary'),
        (r'text-amber-600', 'text-brand-dark'),
        (r'text-amber-700', 'text-brand-ink'),
        (r'bg-amber-50', 'bg-brand-bg'),
        (r'border-amber-400', 'border-brand-primary'),
        (r'shadow-amber-200/50', 'shadow-brand-primary/20'),
        (r'shadow-amber-400/20', 'shadow-brand-primary/20'),
        (r'focus:border-amber-400', 'focus:border-brand-primary'),
        (r'bg-\[#fcd34d\]', 'bg-brand-primary'),
        # Fix cases where I might have mapped bg-amber-400 but left text-slate-900 separately
        (r'bg-brand-primary\s+text-slate-900', 'bg-brand-primary text-white')
    ]

    new_content = content
    for pattern, replacement in replacements:
        new_content = re.sub(pattern, replacement, new_content)

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return True
    return False

def main():
    base_dir = r'c:\Users\Admin\Documents\GitHub\website-apartment\client\src'
    count = 0
    for root, dirs, files in os.walk(base_dir):
        for file in files:
            if file.endswith(('.tsx', '.ts', '.css')):
                if replace_in_file(os.path.join(root, file)):
                    count += 1
                    print(f"Updated: {file}")
    print(f"Total files updated: {count}")

if __name__ == '__main__':
    main()
