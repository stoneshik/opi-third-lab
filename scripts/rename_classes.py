#!/usr/bin/env python3
import os
import re
import sys

# Скрипт принимает путь к каталогу с Java-исходниками в качестве первого аргумента командной строки
if len(sys.argv) < 2:
    print("Usage: python3 rename_classes.py <source_dir>")
    sys.exit(1)
# Корневая директория с .java файлами
src_dir = sys.argv[1]
# Рекурсивно обходим все подкаталоги, начиная с src_dir
for root, dirs, files in os.walk(src_dir):
    for file in files:
        # Обрабатываем только Java-файлы
        if file.endswith(".java"):
            file_path = os.path.join(root, file)
            # Читаем содержимое Java-файла
            with open(file_path, encoding="utf-8") as f:
                content = f.read()
            # Ищем объявление public class <ClassName>
            match = re.search(r'public\s+class\s+(\w+)', content)
            if match:
                # Имя класса, найденное в исходном коде
                class_name = match.group(1)
                # Новый путь к файлу: имя класса + .java
                new_file_path = os.path.join(root, f"{class_name}.java")
                # Переименовываем файл, только если имя отличается
                if file_path != new_file_path:
                    os.rename(file_path, new_file_path)
                    print(f"Renamed: {file_path} -> {new_file_path}")
