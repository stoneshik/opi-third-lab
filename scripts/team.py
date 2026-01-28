#!/usr/bin/env python3
import subprocess
import shutil
import os
from pathlib import Path
import sys

# URL SVN-репозитория (передаётся из Ant через переменную окружения)
REPO_URL = os.environ["SVN_REPO_URL"]
# Сколько предыдущих ревизий нужно взять (по заданию 2)
REVISIONS = int(os.environ.get("TEAM_REVISIONS", "2"))
# Рабочая директория, куда будут выкачиваться ревизии
BUILD_DIR = Path("build/team")
# Итоговый zip-архив с jar-файлами
ZIP_OUT = Path(os.environ.get("TEAM_ZIP", "dist/team-revisions.zip"))


def run_command(cmd, cwd=None, check=True):
    """
    Запуск внешней команды
    cmd: список аргументов (например ["svn", "checkout", ...])
    cwd: рабочая директория для команды
    check: если True, при ошибке будет выброшено исключение
    """
    subprocess.run(cmd, cwd=cwd, check=check)


def svn_head():
    """
    Получить номер HEAD-ревизии репозитория
    Используется svn info, чтобы узнать текущую максимальную ревизию
    """
    return int(
        subprocess.check_output(
            ["svn", "info", REPO_URL, "--show-item", "revision"],
            text=True
        ).strip()
    )


def main():
    # Узнаем HEAD-ревизию SVN
    head = svn_head()
    print(f"SVN HEAD = {head}")
    # Создаем базовую рабочую директорию
    BUILD_DIR.mkdir(parents=True, exist_ok=True)
    # Временная директория для jar-файлов, которые потом будут упакованы в zip
    temp_zip_dir = BUILD_DIR / "zip"
    temp_zip_dir.mkdir(exist_ok=True)
    # список jar-файлов для упаковки
    jars = []
    # Перебираем предыдущие ревизии: HEAD-1, HEAD-2, ...
    for i in range(1, REVISIONS + 1):
        rev = head - i
        workdir = BUILD_DIR / f"rev-{rev}"
        print(f"\n=== Processing revision {rev} ===")
        # Удаляем директорию, если она осталась от прошлого запуска
        if workdir.exists():
            shutil.rmtree(workdir)
        # Чекаутим конкретную ревизию проекта
        run_command(["svn", "checkout", "-r", str(rev), REPO_URL, str(workdir)])
        # Запускаем сборку проекта через цель build
        run_command(["ant", "build"], cwd=workdir)
        # Ожидаем, что результатом сборки будет jar в dist/
        jar = workdir / "dist" / "third-app.jar"
        if not jar.exists():
            print(f"No jar produced in revision {rev}")
            sys.exit(1)
        # Копируем jar во временную папку, переименовывая его с указанием ревизии
        renamed = temp_zip_dir / f"third-app-r{rev}.jar"
        shutil.copy(jar, renamed)
        jars.append(renamed)
    # Создаём директорию для итогового архива
    ZIP_OUT.parent.mkdir(parents=True, exist_ok=True)
    # Упаковываем все jar-файлы в один zip-архив
    run_command(["zip", str(ZIP_OUT)] + [str(j) for j in jars])
    print(f"\nTeam archive created: {ZIP_OUT}")


if __name__ == "__main__":
    main()
