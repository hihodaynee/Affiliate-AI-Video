# ASMR Review — v1.2

## Phân tích clip tham chiếu

Nguồn do người dùng cung cấp: `viesnap.vn_tiktok_7694324491215768852.mp4`. FFprobe xác nhận 15,811 giây, video H.264 576×1024 (9:16), 30 fps; AAC stereo 44,1 kHz. Không đưa video tham chiếu vào repository.

Khung hình lấy mẫu mỗi giây cho thấy giá đỡ điện thoại/máy tính bảng trên bàn: bàn tay mở/gập, chỉnh góc, đặt thiết bị, thao tác với máy tính bảng và cất sản phẩm gọn. Phông bàn làm việc ấm, ánh sáng dịu, cận sản phẩm, không tập trung vào mặt người. Các mốc dưới đây là mô tả hình ảnh gần đúng, không phải danh sách điểm cắt chính xác:

| Khoảng thời gian | Quan sát hình ảnh |
| --- | --- |
| 0–3 giây | Giá đỡ trên bàn, đặt điện thoại/máy tính bảng, cầm sản phẩm gập |
| 3–9 giây | Cận cấu tạo, mở chân, chỉnh khớp và góc mặt đỡ |
| 9–14 giây | Đặt điện thoại, nhìn nghiêng, dùng máy tính bảng |
| 14–15,8 giây | Gập/cất gọn vào túi |

Phiên phân tích xác nhận có track âm thanh nhưng công cụ không hỗ trợ nghe trực tiếp. Tiếng tiếp xúc/click trong thiết kế mới là chỉ đạo tạo âm thanh phù hợp hành động, **không phải kết luận đã nghe được từng tiếng đó trong clip gốc**.

Người dùng yêu cầu lấy phong cách làm tham chiếu, không mặc định 16 giây, không sao chép một khuôn kịch bản. AI phải tự quyết định câu chuyện, số cảnh, hành động và nhịp theo sản phẩm thực tế.

## Đầu vào

**Bắt buộc:** một ảnh sản phẩm rõ hình dáng, chi tiết và nhãn nếu có. Không cần KOC hoặc ảnh bối cảnh. Các thông tin còn lại đều có thể để trống.

**Tùy chọn:** tên, chất liệu/thông tin thật, những thao tác sản phẩm thực sự làm được, thêm một ảnh góc khác của cùng sản phẩm, bối cảnh và tỷ lệ khung hình. Nếu chưa biết cơ cấu, AI được yêu cầu dùng chi tiết ngoại hình, tiếp xúc nhẹ và xoay nguyên vật; không tự mở/gập/bấm/đổ chất hoặc thêm phụ kiện. Ảnh đơn không xác nhận được mặt sau, cơ cấu chuyển động, chất liệu hay âm thanh thật.

**Có giọng review xen kẽ:** AI chọn cảnh có lời review tiếng Việt, xen giữa bằng cảnh ASMR thuần. Có ô mô tả chất giọng; không yêu cầu file voice. Lời thoại chỉ dựa trên thông tin nhìn thấy hoặc người dùng cung cấp. Model tạo lời và tiếng ngay trong video; đây không phải TTS riêng hoặc nhân bản giọng. Sự đồng nhất giọng qua các clip vẫn cần nghe kiểm tra.

## Luồng thực hiện

1. `planAsmr` gửi ảnh và thông tin sản phẩm cho AI đa phương thức. Kết quả gồm mô tả nhận diện, điều chưa biết, lý do dựng ngắn gọn và danh sách cảnh có mục đích, thời lượng, nhịp hành động/góc máy/âm thanh. Không dùng kịch bản dự phòng viết sẵn.
2. AI tự chọn 1–8 cảnh mỗi lượt, mỗi cảnh 1–5 nhịp. Đây là giới hạn một lượt tạo để kiểm soát số yêu cầu, không phải số cảnh mặc định. Thời lượng mỗi clip theo lựa chọn model đã có trong công cụ: Omni 4/6/8/10 giây, Veo 8 giây. Tổng thời lượng được cộng từ đề xuất AI, không áp tổng cố định.
3. Kiểm tra JSON, nhịp liên tục và vừa thời lượng. Chế độ thuần không được có lời; chế độ xen kẽ phải có cả hai loại, không hai cảnh có lời liên tiếp. Lời review phải vừa thời gian theo giới hạn đọc bảo thủ.
4. Người dùng có thể sửa hành động/góc máy/âm thanh và lời review trước render. Đổi đầu vào yêu cầu lập lại kịch bản; clip cũ vẫn tải được. Sửa nội dung một cảnh làm mất hiệu lực video và duyệt tiếng của riêng cảnh đó.
5. Render tuần tự, luôn gửi ảnh gốc, tùy chọn góc thứ hai, thời lượng AI chọn và prompt âm thanh. Không dùng voice/KOC của module cũ. Khóa yêu cầu trùng; lỗi dừng lượt tạo và giữ clip đã hoàn tất. Nút dừng chờ clip hiện tại hoàn thành, không giả vờ hủy job từ xa.
6. Người dùng nghe và đánh dấu âm thanh phù hợp cho từng clip. Chỉ bật ghép khi tất cả clip có video và đã duyệt tiếng. FFmpeg giữ audio bắt buộc cho ASMR, không cung cấp cách ghép bỏ tiếng; thiếu audio phải sửa/tạo lại clip. Giữ thứ tự AI đã dựng để bảo toàn nhịp review xen kẽ. Kịch bản chỉ một cảnh hoàn tất trực tiếp bằng clip đã tạo, không cần chạy FFmpeg. Có thể tải từng clip hoặc video hoàn chỉnh.

## Tách biệt dữ liệu

- Tab `asmr_review`, component và state riêng, giữ state khi chuyển tab.
- IndexedDB `affiliate-ai-video-asmr`, key `current`; không đổi kho review cũ.
- JSON có `kind: "asmr_review"`, `version: 1`; từ chối nhập nhầm định dạng review cũ.
- Lưu input, kịch bản, nhịp, voice setting, clip, trạng thái duyệt tiếng và video ghép. Khi khôi phục, trạng thái đang tạo trở về idle; preview dựng lại từ dữ liệu media.
- Tự lưu sau khoảng một giây. Nếu kho không đọc được thì không ghi đè bản lưu cũ. Nên xuất JSON để có bản sao khi trình duyệt hết dung lượng.
- Khi xóa ảnh để thay tư liệu mới, vẫn khôi phục được bản nháp và clip cũ. Cần thêm ảnh và lập lại kịch bản trước lượt tạo mới.

## Kiểm chứng và giới hạn

TypeScript và test bao phủ số cảnh/thời lượng AI thay đổi, thuần ASMR/xen lời, lỗi JSON, lời quá dài, nhịp hở/chồng, tham chiếu ảnh, đầu vào thay đổi, khóa trùng, dừng lượt tạo, giữ clip sau lỗi, duyệt tiếng và tách kho dữ liệu. Kiểm tra giao diện trong trình duyệt dùng SDK giả lập được gắn nhãn rõ; không phải video đã tạo thật.

Runtime vẫn là `flow-sdk` do Google Flow cung cấp. Chưa kiểm chứng trực tiếp lượt tạo video trả phí, native audio, chất lượng cơ cấu/bàn tay/nhãn, sự đồng nhất voice, thời lượng xuất thực tế hoặc ghép audio trên Flow. Promise timeout chỉ dừng chờ phía ứng dụng; tác vụ phía máy chủ có thể vẫn chạy. Không có phép kiểm tra chất lượng âm thanh tự động ở phiên bản này.

Đã đối chiếu [tài liệu video chính thức của Google](https://ai.google.dev/gemini-api/docs/video) ngày 2026-10-23: Gemini API hiện hướng dẫn dùng Gemini Omni Flash, còn Veo 3.1 Preview trên Gemini API đã ngừng ngày 2026-10-22. Điều đó **không chứng minh** danh sách model của `flow-sdk` giống Gemini API. Giữ tên model đang có trong source Flow, không tự thêm API hoặc cờ âm thanh chưa xác minh; lỗi từ model được hiển thị nguyên nhân để người dùng chọn lại.
