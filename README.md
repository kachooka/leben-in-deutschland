# 🇩🇪 Leben in Deutschland — Einbürgerungstest

Web-App zur Vorbereitung auf den deutschen Einbürgerungstest.

---

## Cấu trúc file

```
leben-in-deutschland/
├── index.html          ← Trang chính
├── style.css           ← Giao diện
├── app.js              ← Logic ứng dụng
├── data/
│   └── questions.json  ← Câu hỏi + đáp án + giải thích
└── README.md
```

---

## Hướng dẫn deploy lên GitHub Pages

### Bước 1 — Tạo repository
- Vào github.com → New repository
- Tên: `leben-in-deutschland`
- Chọn Public → Create

### Bước 2 — Upload file
- Nhấn "Add file" → "Upload files"
- Kéo thả tất cả file vào (giữ nguyên cấu trúc thư mục)
- Commit changes

### Bước 3 — Bật GitHub Pages
- Settings → Pages
- Source: Deploy from branch → main → / (root)
- Save

### Bước 4 — Truy cập website
```
https://[username].github.io/leben-in-deutschland
```

---

## Thêm câu hỏi mới

Mở file `data/questions.json` và thêm vào mảng `questions`:

```json
{
  "id": 99,
  "categoryId": "demokratie",
  "question": "Câu hỏi tiếng Đức...",
  "options": ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"],
  "correct": 0,
  "explanation_vi": "Giải thích bằng tiếng Việt..."
}
```

**Lưu ý:** `"correct"` là chỉ số (0=A, 1=B, 2=C, 3=D)

### Các categoryId hợp lệ:
- `demokratie`
- `geschichte`
- `gesellschaft`
- `familie`
- `geschlechter`
- `religion`
- `rechtsstaat`
- `wirtschaft`
- `rechte`
- `bundeslaender`

---

## Điểm vượt qua (Bestehensschwelle)
- Prüfung: 33 câu hỏi
- Cần đúng ít nhất: **17/33** để đậu

---

## Phân phối câu hỏi theo đề thi

| Chủ đề | Câu trong đề |
|---|---|
| Leben in der Demokratie | 5 |
| Geschichte & Verantwortung | 3 |
| Mensch & Gesellschaft | 4 |
| Kinder & Familie | 3 |
| Frauen & Männer | 3 |
| Religionsfreiheit | 3 |
| Rechtsstaat | 4 |
| Wirtschaft & Arbeit | 3 |
| Rechte & Pflichten | 4 |
| Bundesländer | 1 |
| **Gesamt** | **33** |
