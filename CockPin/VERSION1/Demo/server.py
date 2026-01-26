from flask import Flask, request, jsonify
import os
import json

app = Flask(__name__)

# 경로 설정
IMAGE_PATH = "/Users/apple/Desktop/Python/2nd_Grade/WinterSchool/image"
DATA_PATH = "/Users/apple/Desktop/Python/2nd_Grade/WinterSchool/data/pin_state.json"

# 디렉토리 확인 및 생성
os.makedirs(IMAGE_PATH, exist_ok=True)
os.makedirs(os.path.dirname(DATA_PATH), exist_ok=True)

# 데이터 로드
if os.path.exists(DATA_PATH):
    with open(DATA_PATH, 'r', encoding='utf-8') as f:
        shared_locations = json.load(f)
else:
    shared_locations = []

# 이미지 업로드 API
@app.route('/input_image', methods=['POST'])
def input_image():
    data = request.json
    if not data or 'photo' not in data:
        return jsonify({'error': 'No image data provided.'}), 400

    image_data = data['photo']
    image_name = f"image_{len(shared_locations) + 1}.png"
    image_path = os.path.join(IMAGE_PATH, image_name)

    with open(image_path, 'wb') as f:
        f.write(image_data.split(',')[1].encode('utf-8'))

    return jsonify({'message': 'Image saved.', 'path': image_path}), 200

# 주소 및 데이터 저장 API
@app.route('/input_adress', methods=['POST'])
def input_address():
    data = request.json
    if not data or 'lat' not in data or 'lng' not in data or 'address' not in data or 'photo' not in data:
        return jsonify({'error': 'Invalid data format.'}), 400

    shared_locations.append(data)

    with open(DATA_PATH, 'w', encoding='utf-8') as f:
        json.dump(shared_locations, f, ensure_ascii=False, indent=4)

    return jsonify({'message': 'Location saved.'}), 200

if __name__ == '__main__':
    app.run(port=5001, debug=True)
