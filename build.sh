#!/usr/bin/env bash
set -e

echo "=== Installing Frontend Dependencies ==="
cd frontend
npm install

echo "=== Building Frontend ==="
npm run build

echo "=== Installing Backend Dependencies ==="
cd ../backend
pip install -r requirements.txt

echo "=== Build Complete ==="
