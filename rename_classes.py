#!/usr/bin/env python3
import os
import re
import sys

# Папка с исходниками передается как первый аргумент
if len(sys.argv) < 2:
    print("Usage: python3 rename_classes.py <source_dir>")
    sys.exit(1)

src_dir = sys.argv[1]

# Рекурсивно обходим все .java файлы
for root, dirs, files in os.walk(src_dir):
    for file in files:
        if file.endswith(".java"):
            file_path = os.path.join(root, file)
            with open(file_path, encoding="utf-8") as f:
                content = f.read()
            # Ищем имя public class
            match = re.search(r'public\s+class\s+(\w+)', content)
            if match:
                class_name = match.group(1)
                new_file_path = os.path.join(root, f"{class_name}.java")
                if file_path != new_file_path:
                    os.rename(file_path, new_file_path)
                    print(f"Renamed: {file_path} -> {new_file_path}")
