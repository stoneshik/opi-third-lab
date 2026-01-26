#!/bin/bash
set -e

BASE_DIR="$HOME/svn_demo"
REPO_DIR="$BASE_DIR/repo"
WORK_TRUNK="$BASE_DIR/work_trunk"
WORK_SECOND="$BASE_DIR/work_second"
PROJECT_DIR="$HOME/Desktop/university/opi/third/third-lab-web-master"

echo "=== Очистка старых данных ==="
rm -rf "$BASE_DIR"
mkdir -p "$BASE_DIR"

echo "=== Создание SVN репозитория ==="
svnadmin create "$REPO_DIR"
REPO_URL="file://$REPO_DIR"

svn mkdir "$REPO_URL/trunk" "$REPO_URL/branches" "$REPO_URL/tags" -m "Initial structure"

echo "=== Чекаут trunk ==="
svn checkout "$REPO_URL/trunk" "$WORK_TRUNK"

# r0: initial commit
cp -r "$PROJECT_DIR/"* "$WORK_TRUNK/"
cd "$WORK_TRUNK"
svn add * --force
svn commit -m "r0: Initial commit"

# r1: небольшое изменение
echo "// demo change r1" >> src/main/java/lab/third/util/TransactionExecutor.java
svn commit -m "r1: Demo update in trunk"

# r2: создаем ветку second
svn copy "$REPO_URL/trunk" "$REPO_URL/branches/second" -m "r2: Create branch second"

# r3: изменение в ветке second
svn checkout "$REPO_URL/branches/second" "$WORK_SECOND"
cd "$WORK_SECOND"
echo "// demo change r3 in second" >> src/main/java/lab/third/beans/DotManagedBean.java
svn commit -m "r3: Demo update in branch second"

echo "=== Локальный SVN репозиторий готов для демонстрации ==="
echo "Репозиторий: $REPO_DIR"
echo "Рабочие копии: trunk=$WORK_TRUNK, second=$WORK_SECOND"
echo "URL репозитория: $REPO_URL"
