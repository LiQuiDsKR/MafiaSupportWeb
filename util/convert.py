def process_file(file_path):
    output = []

    with open(file_path, 'r', encoding='utf-8') as file:
        lines = file.readlines()

    for i in range(0, len(lines), 8):
        item_name = lines[i].strip()
        probability = lines[i + 6].strip()
        output.append(f"{item_name}:{probability}:true")

    result = "\n".join(output)
    return result

input_file_path = 'input.txt'

result = process_file(input_file_path)
print(result)
