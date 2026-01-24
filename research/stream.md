# Tổng hợp STREAMING cho Backend Engineer

> Tài liệu này tổng hợp **toàn bộ kiến thức cốt lõi về streaming**: bản chất, OSI, các loại stream phổ biến (SSE, HTTP stream, WebSocket, WebRTC, gRPC…), ưu nhược điểm, và cách chọn đúng trong system design.

---

## 1. Stream là gì? (BẢN CHẤT)

**Stream không phải là 1 giao thức riêng.**
Stream là **cách sử dụng connection**: giữ kết nối mở và **gửi dữ liệu dần dần (incremental)** thay vì gửi 1 response hoàn chỉnh.

```text
Request
→ Connection được mở
→ Dữ liệu được gửi từng phần (chunk / event / frame)
→ Connection đóng khi hoàn tất
```

👉 Điểm mấu chốt:

* Không đợi xử lý xong mới trả
* Có dữ liệu là gửi ngay

---

## 2. Stream nằm ở tầng nào trong mô hình OSI?

```
7. Application   ← HTTP / SSE / WebSocket / WebRTC / gRPC
6. Presentation
5. Session
4. Transport     ← TCP / UDP
3. Network       ← IP
2. Data Link
1. Physical
```

### Kết luận quan trọng

* **Stream = hành vi ở tầng Application**
* **Chạy trên TCP hoặc UDP ở Transport layer**
* TCP: đảm bảo thứ tự, không mất gói
* UDP: ưu tiên latency, chấp nhận mất gói

---

## 3. Dấu hiệu nào khiến response trở thành stream?

❌ Không phải vì header
❌ Không phải vì NestJS decorator

✅ **DUY NHẤT**:

```ts
res.write(...)   // gọi nhiều lần
res.end()        // bị trì hoãn
```

> Header chỉ giúp **client hiểu cách parse**, không bật stream.

---

## 4. 1 chiều và 2 chiều là gì?

### 4.1 Stream 1 chiều (Unidirectional)

```text
Server ─────────▶ Client
```

* Chỉ **1 phía chủ động push data liên tục**
* Client chỉ subscribe và receive

Ví dụ:

* SSE
* HTTP video streaming (HLS)
* AI text streaming

---

### 4.2 Stream 2 chiều (Bidirectional)

```text
Client ◀────────▶ Server
```

* Cả 2 phía đều có thể push data bất kỳ lúc nào

Ví dụ:

* WebSocket (chat)
* WebRTC (video call)
* gRPC bidirectional streaming

---

## 5. Các loại stream phổ biến

### 5.1 Raw HTTP Streaming (Chunked)

**Giao thức**: HTTP/1.1 + TCP

```ts
res.write('chunk1');
res.write('chunk2');
```

**Dùng khi**:

* Download / export file lớn
* Proxy stream

**Ưu**:

* Đơn giản
* Không overhead

**Nhược**:

* Không protocol
* FE phải tự parse

---

### 5.2 SSE – Server-Sent Events ⭐

**Giao thức**: SSE over HTTP + TCP

```text
data: {...}\n\n
event: end
data: done
```

**Đặc điểm**:

* 1 chiều (BE → FE)
* Event-based
* Dễ debug

**Dùng khi**:

* AI / LLM streaming
* Log realtime
* Progress update

**Nhược**:

* Không hỗ trợ 2 chiều
* EventSource chỉ hỗ trợ GET

---

### 5.3 WebSocket

**Giao thức**: WS over TCP

**Đặc điểm**:

* Full-duplex (2 chiều)
* Connection lâu dài

**Dùng khi**:

* Chat
* Collaboration
* Realtime interaction

**Nhược**:

* Quản lý connection phức tạp
* Scale khó (sticky session)

---

### 5.4 gRPC Streaming

**Giao thức**: gRPC over HTTP/2 + TCP

**Đặc điểm**:

* Typed (Protobuf)
* Unary / Server stream / Client stream / Bi-di

**Dùng khi**:

* Microservices
* Backend ↔ Backend

---

### 5.5 Media / Video Streaming (YouTube, Netflix)

**Giao thức**:

* HLS / MPEG-DASH
* HTTP + TCP

**Cách hoạt động**:

* Video bị cắt thành segment (2–10s)
* Client tải từng file nhỏ

**Đặc điểm**:

* 1 chiều
* Không real-time
* Scale cực tốt qua CDN

---

### 5.6 Video Call / Game Streaming

**Giao thức**:

* WebRTC
* RTP / SRTP
* UDP / QUIC

**Đặc điểm**:

* 2 chiều
* Latency cực thấp
* Chấp nhận mất frame

---

## 6. Vì sao YouTube stream là 1 chiều?

YouTube Live **tách thành 2 pipeline khác nhau**:

### A. Ingest (Streamer → YouTube)

```
Client ─▶ Server
```

* RTMP / WebRTC
* 1 chiều

### B. Playback (YouTube → Viewer)

```
Server ─▶ Client
```

* HLS / DASH
* 1 chiều

> **1 chiều / 2 chiều luôn xét trên 1 connection cụ thể, không xét toàn hệ thống**

---

## 7. So sánh nhanh (rất quan trọng)

| Use case        | Công nghệ   | Chiều | Transport |
| --------------- | ----------- | ----- | --------- |
| AI text         | SSE         | 1     | TCP       |
| Log realtime    | SSE         | 1     | TCP       |
| Chat            | WebSocket   | 2     | TCP       |
| Video on-demand | HLS         | 1     | TCP       |
| Live stream     | RTMP/HLS    | 1     | TCP       |
| Video call      | WebRTC      | 2     | UDP       |
| Game streaming  | WebRTC/QUIC | 2     | UDP       |

---

## 8. Tư duy chọn stream trong system design

Hỏi 3 câu:

1. **Latency yêu cầu bao nhiêu?**
2. **1 chiều hay 2 chiều?**
3. **Chịu mất gói không?**

→ Trả lời xong là chọn được công nghệ.

---

## 9. Một câu chốt để nhớ lâu

> **Stream là hành vi ở tầng Application,
> chạy trên TCP hoặc UDP,
> khác nhau ở protocol semantic (SSE / WS / WebRTC / gRPC).**

---

*End of note.*
