import sys

def count_chinese_words(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            chinese_chars = sum(1 for char in content if '\u4e00' <= char <= '\u9fff')
            total_chars = len(content)
            return chinese_chars, total_chars
    except Exception as e:
        return str(e)

if __name__ == "__main__":
    file_path = 'AI短剧平台用户操作使用说明书_Final.md'
    chinese, total = count_chinese_words(file_path)
    print(f"Chinese characters: {chinese}")
    print(f"Total characters: {total}")
