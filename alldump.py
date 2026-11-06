import os

# Папки, кэш и артефакты, которые не нужно сканировать
IGNORE_DIRS = {
    'node_modules', '.git', 'dist', 'build', 
    'coverage', '.cache', '__pycache__', 
    '.vscode', '.idea'
}

# Тяжелые лок-файлы и системные файлы
IGNORE_FILES = {
    'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 
    'bun.lockb', '.DS_Store', 'Thumbs.db'
}

# Бинарные файлы, БД, изображения и шрифты
IGNORE_EXTENSIONS = {
    '.sqlite', '.db', '.png', '.jpg', '.jpeg', '.gif', 
    '.svg', '.ico', '.webp', '.woff', '.woff2', '.ttf', 
    '.eot', '.otf', '.zip', '.tar', '.gz', '.7z', '.rar', 
    '.pdf', '.exe', '.dll'
}

def export_full_project(root_dir='.', output_file='full_project_dump.txt'):
    with open(output_file, 'w', encoding='utf-8') as out:
        out.write("=== ПОЛНАЯ СТРУКТУРА ПРОЕКТА (SERVER + CLIENT) ===\n\n")

        # 1. Формирование дерева проекта
        for root, dirs, files in os.walk(root_dir):
            dirs[:] = sorted([d for d in dirs if d not in IGNORE_DIRS and not d.startswith('.')])
            
            rel_root = os.path.relpath(root, root_dir)
            level = 0 if rel_root == '.' else rel_root.count(os.sep) + 1
            indent = '  ' * (level - 1) if level > 0 else ''

            if rel_root != '.':
                out.write(f"{indent}📁 {os.path.basename(root)}/\n")

            file_indent = '  ' * level
            for file in sorted(files):
                ext = os.path.splitext(file)[1].lower()
                if file not in IGNORE_FILES and ext not in IGNORE_EXTENSIONS and file != output_file:
                    out.write(f"{file_indent}📄 {file}\n")

        out.write("\n" + "=" * 60 + "\n")
        out.write("=== СОДЕРЖИМОЕ ФАЙЛОВ ===\n")
        out.write("=" * 60 + "\n\n")

        # 2. Дамп текстового содержимого файлов
        for root, dirs, files in os.walk(root_dir):
            dirs[:] = [d for d in dirs if d not in IGNORE_DIRS and not d.startswith('.')]

            for file in sorted(files):
                ext = os.path.splitext(file)[1].lower()
                if file in IGNORE_FILES or ext in IGNORE_EXTENSIONS or file == output_file or file.endswith('.py'):
                    continue

                filepath = os.path.join(root, file)
                rel_path = os.path.relpath(filepath, root_dir)

                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        content = f.read()

                    out.write(f"\n{'─' * 50}\n")
                    out.write(f"ФАЙЛ: {rel_path}\n")
                    out.write(f"{'─' * 50}\n\n")
                    out.write(content.rstrip())
                    out.write("\n")
                except (UnicodeDecodeError, PermissionError):
                    continue

    print(f"Готово. Полный дамп сохранен в файл: {output_file}")

if __name__ == '__main__':
    # Запускать из корня проекта (D:\WebGoryachk\Project5_final\Project5)
    export_full_project()