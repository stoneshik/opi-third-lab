#!/usr/bin/env python3
import subprocess
import sys
import fnmatch
import os

# Список разрешенных файлов/шаблонов берется из переменной окружения
allowed = os.environ.get("DIFF_ALLOWED_FILES", "")
# Разбиваем строку по запятым и убираем лишние пробелы
allowed_globs = [a.strip() for a in allowed.split(",") if a.strip()]
# Выполняем команду `git diff --name-only`, которая выводит список файлов, измененных в рабочем дереве
result = subprocess.run(
    ["git", "diff", "--name-only"],
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE,
    text=True
)
# Преобразуем вывод команды в список имен файлов
files = [f.strip() for f in result.stdout.splitlines() if f.strip()]
# Если изменений нет - считаем проверку успешной
if not files:
    print("No changes detected")
    sys.exit(0)
# Проверяем каждый измененный файл
for f in files:
    # Файл считается допустимым, если он совпадает хотя бы с одним разрешенным шаблоном
    if not any(fnmatch.fnmatch(f, g) for g in allowed_globs):
        # Если найден файл, не попадающий ни под один шаблон - это запрещенное изменение
        print(f"Forbidden change detected: {f}")
        sys.exit(1)
# Если все измененные файлы допустимы
print("All changes allowed")
sys.exit(0)
