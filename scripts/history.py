#!/usr/bin/env python3
import subprocess
import sys
import shutil
import os
from pathlib import Path

# URL SVN-репозитория (передаётся из Ant через переменную окружения)
REPO_URL = os.environ.get("SVN_REPO_URL")
# Временная рабочая копия, в которую поочередно чекаутятся ревизии
WORKDIR = Path(".history-wc")
# Ant-цель, которую проверяем на успешную сборку
ANT_TARGET = "compile"
# Файл, в который будет записан diff плохой ревизии
DIFF_FILE = "history.diff"


def run_command(cmd, cwd=None, check=True):
    """
    Запуск внешней команды
    cmd: список аргументов (например ["svn", "checkout", ...])
    cwd: рабочая директория для команды
    check: если True, при ошибке будет выброшено исключение
    """
    return subprocess.run(
        cmd,
        cwd=cwd,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        check=check
    )


def svn_head():
    """
    Получить номер HEAD-ревизии SVN-репозитория
    Используется для определения, с какой ревизии начинать поиск
    """
    r = run_command(
        ["svn", "info", REPO_URL, "--show-item", "revision"],
        check=True
    )
    return int(r.stdout.strip())


def clean_workdir():
    """
    Полностью удалить временную рабочую копию,
    чтобы каждый checkout выполнялся с нуля
    """
    if WORKDIR.exists():
        shutil.rmtree(WORKDIR)


def svn_checkout(rev):
    """
    Выполнить checkout конкретной ревизии SVN
    в временную директорию WORKDIR
    """
    clean_workdir()
    run_command(
        ["svn", "checkout", "-r", str(rev), REPO_URL, str(WORKDIR)],
        check=True
    )


def ant_compile():
    """
    Запустить ant с целевой задачей ANT_TARGET (compile)
    Возвращает True, если сборка прошла успешно,
    и False, если ant завершился с ошибкой
    """
    r = run_command(["ant", ANT_TARGET], cwd=WORKDIR)
    return r.returncode == 0


def svn_diff(rev):
    """
    Сгенерировать diff для указанной ревизии
    и сохранить его в файл DIFF_FILE
    """
    r = run_command(
        ["svn", "diff", "-c", str(rev), REPO_URL],
        check=True
    )
    with open(DIFF_FILE, "w") as f:
        f.write(r.stdout)


def main():
    # Получаем номер HEAD-ревизии
    head = svn_head()
    print(f"HEAD revision: {head}")
    # Последняя успешно собираемая ревизия
    last_working = None
    # Перебираем ревизии от HEAD к более старым
    for rev in range(head, 0, -1):
        print(f"\n=== Trying revision {rev} ===")
        try:
            # Чекаут текущей ревизии
            svn_checkout(rev)
        except subprocess.CalledProcessError:
            # Если checkout не удался - пробуем более старую ревизию
            print(f"SVN checkout failed at revision {rev}")
            continue
        # Пытаемся собрать проект
        if ant_compile():
            print(f"Build succeeded at revision {rev}")
            last_working = rev
            break
        else:
            print(f"Build failed at revision {rev}")
    # Если ни одна ревизия не собралась - ошибка
    if last_working is None:
        print("ERROR: No working revision found")
        sys.exit(1)
    # Плохая ревизия - следующая после последней рабочей
    bad_rev = last_working + 1
    if bad_rev <= head:
        print(f"Generating diff for revision {bad_rev}")
        svn_diff(bad_rev)
        print(f"Diff written to {DIFF_FILE}")
    sys.exit(0)


if __name__ == "__main__":
    main()
