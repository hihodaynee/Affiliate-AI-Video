# Affiliate AI Video

Bộ công cụ tạo KOC, kịch bản review và video trên Google Flow. Phiên bản 1.2 thêm **ASMR Review** độc lập: bắt đầu từ một ảnh, AI tự thiết kế kịch bản và thời lượng, tùy chọn giọng review xen kẽ với tiếng thao tác. Các sửa lỗi độ ổn định của phiên bản 1.1 được giữ lại.

- [Phân tích clip mẫu, đầu vào và hướng dẫn ASMR](docs/asmr-review.md).
- Trong tab **ASMR Review**, thêm ảnh → chọn có/không lời review → AI viết kịch bản → sửa nếu cần → tạo clip → nghe kiểm tra → ghép giữ tiếng.
- Không mặc định tổng thời lượng hoặc số cảnh. AI chọn theo sản phẩm trong giới hạn của model tạo video. Chất liệu, thao tác thực tế và ảnh góc khác là đầu vào tùy chọn để tăng độ chính xác.
- ASMR có model, IndexedDB và JSON riêng; không đọc giọng/KOC/kịch bản của Review Bán Hàng.

- [Mở công cụ gốc trên Google Flow](https://flow.google.com/project/a2a91d8d-800e-4980-bb48-8987eccf39d8/tool/ed2a429c-065e-4aa9-907b-130f9f478b41?fromViewSource=tools&mode=EDIT).
- Bản xuất gốc gồm 29 tệp, được lưu tại commit [`4870e02`](https://github.com/hihodaynee/Affiliate-AI-Video/commit/4870e02c4bd3b7c29e8cea39c11aae31425fea66).
- [Danh sách tệp và SHA-256 gốc](docs/source-manifest.json) áp dụng cho commit gốc, trước các thay đổi ở phiên bản 1.1.
- [Các thay đổi và giới hạn kiểm chứng](docs/reliability-update.md).

## Môi trường chạy

Đây là mã công cụ chạy trong Google Flow. Các tệp sử dụng React, Zod và các lớp giao diện Tailwind CSS. Các chức năng tạo nội dung, chọn media và tải xuống gọi `flow-sdk` do môi trường Flow cung cấp. Dịch vụ ghép video tải FFmpeg core 0.12.6 từ CDN.

Repository có `package.json`, lockfile và cấu hình kiểm tra TypeScript/test. Phần triển khai `flow-sdk` và môi trường giao diện vẫn do Flow cung cấp; repository chưa có máy chủ chạy độc lập. `declarations/flow-sdk.d.ts` chỉ mô tả các lời gọi đang dùng, không phải SDK thực tế. Bộ mock SDK chỉ được ánh xạ trong Vitest.

Với Node.js 24, chạy:

```sh
npm ci
npm run typecheck
npm test
```

Khi tích hợp trở lại Flow, cần cung cấp các dependency trong `package.json`, stylesheet Tailwind và font Material Symbols của ứng dụng gốc. Việc upload âm thanh còn phụ thuộc khả năng của SDK tại thời điểm chạy; nếu Flow từ chối tệp, giao diện báo lỗi và không đánh dấu voice là đã nạp.

Dự án review được lưu tự động vào IndexedDB trên trình duyệt sau khoảng 1 giây không chỉnh sửa. Xuất JSON để giữ bản sao đầy đủ cấu hình, tư liệu đầu vào và media của các cảnh. Không dùng Blob URL tạm để khôi phục preview. Lịch sử toàn cục, trạng thái KOC và bảng Motion Cloner chưa được đưa vào bản lưu review.

## Tài liệu workflow hiện có

Phần bên dưới là báo cáo workflow đi kèm bản xuất gốc. Những mô tả về fallback và mức độ bảo đảm kết quả cần đọc cùng ghi chú phiên bản 1.1 ở trên.

Báo cáo này được cấu trúc theo luồng vận hành thực tế từ đầu vào đến sản phẩm hoàn chỉnh, giúp bạn nắm rõ quy trình kỹ thuật, logic đồng bộ và cách từng module phối hợp với nhau.

📑 BÁO CÁO WORKFLOW VẬN HÀNH HỆ THỐNG: AFFILIATE AI VIDEO v1.0
Hệ thống được thiết kế theo mô hình All-in-One Studio chuyên phục vụ sản xuất video Affiliate / TikTok Shop / Facebook Reels / Shorts, bao gồm 3 phân hệ cốt lõi liên kết chặt chẽ qua cơ chế truyền tài nguyên (MediaId pipeline):

Module 1: Tạo Nhân Vật KOC AI (Character Studio & AI Vision)
Module 2: Kịch Bản Review Bán Hàng 5 Phân Cảnh (Product Script Studio)
Module 3: Sao Chép Chuyển Động Video (Motion Cloner Auto)
Hệ thống hỗ trợ: Đồng bộ âm học vùng miền, Trình ghép nối Timeline FFmpeg và Bộ tối ưu SEO bài đăng.
🧭 SƠ ĐỒ LUỒNG DỮ LIỆU TỔNG QUAN (END-TO-END FLOW)
[BƯỚC 1: KHỞI TẠO NHÂN VẬT KOC]
   ├── Tùy chọn Preset (KOC Việt Nam, Hàn Quốc, Parisian...)
   ├── Hoặc phân tích ảnh mẫu bằng AI Vision (Gemini Text/Vision)
   └── Sinh chân dung 8K qua `🍌 Nano Banana Pro` 
         │
         ├──> [Chuyển thẳng sang Review Bán Hàng] ─────────┐
         └──> [Chuyển sang Sao Chép Chuyển Động] ─────┐    │
                                                     │    │
[BƯỚC 2: SẢN XUẤT VIDEO REVIEW BÁN HÀNG]            │    │
   ├── Nạp 3 tài nguyên bắt buộc:                     │    │
   │    1. Ảnh Sản Phẩm (Bao bì, nhãn)               │    │
   │    2. Ảnh Người Mẫu KOC (Từ Bước 1) <───────────┼────┘
   │    3. Ảnh Bối Cảnh (Phòng studio, góc review)   │
   │    (Tùy chọn: Đồng nhất trang phục, Voice MP3)  │
   │                                                 │
   ├── AI phân tích điểm nổi bật & khóa bao bì       │
   ├── Thiết lập Giọng Đọc Vùng Miền & Khóa Âm Sắc   │
   │    (Hà Nội / TP.HCM / Miền Trung • Nam / Nữ)    │
   │                                                 │
   ├── Sinh kịch bản 5 cảnh chuẩn tâm lý bán hàng:   │
   │    Cảnh 1: Hook giữ chân (6s)                   │
   │    Cảnh 2: Khơi gợi nỗi đau & bất tiện (8s)     │
   │    Cảnh 3: Sản phẩm xuất hiện cứu tinh (8s)     │
   │    Cảnh 4: Trải nghiệm & công năng (6s)         │
   │    Cảnh 5: Kêu gọi hành động CTA (6s)           │
   │                                                 │
   ├── Thuật toán đo nhịp nói tiếng Việt & Khớp giây │
   ├── Tạo Full Ảnh 5 cảnh (Nano Banana Pro)         │
   ├── Render Video từng đợt (Omni 1.1 Flash)        │
   │    (Áp dụng bộ lọc Anti-Stutter chống lặp từ)   │
   │                                                 │
   ├── Ghép nối Timeline FFmpeg WASM ──> Video Full │
   └── Sinh Caption & Bộ thẻ Hashtag Viral SEO       │
                                                     │
[BƯỚC 3: SAO CHÉP CHUYỂN ĐỘNG (MOTION CLONER)]      │
   ├── Nạp Video mẫu (Catwalk, đạp xe, nhảy <10s)    │
   ├── Nhận diện cử chỉ AI Vision                    │
   ├── Ghép trang phục mới (nếu có)                  │
   └── Render nhân vật KOC thực hiện lại động tác <──┘
🔍 CHI TIẾT TỪNG PHÂN HỆ VÀ TÍNH NĂNG
PHÂN HỆ 1: TẠO NHÂN VẬT KOC AI (Character Studio)
Mục tiêu: Tạo ra một đại diện hình ảnh (KOC Virtual Influencer) có gương mặt, sắc tộc và phong thái nhất quán, có thể đại diện cho thương hiệu lâu dài.

1. Thư viện Preset thịnh hành:
Cung cấp sẵn các mẫu chuyển đổi cao: KOC Mỹ Phẩm Việt Nam (Glass skin), KOC Thời Trang Hàn Quốc, Quý cô Paris, Huấn luyện viên sức khỏe.
Tự động điền đầy đủ cấu hình thuộc tính chỉ với 1 cú click.
2. Bộ thuộc tính giải phẫu & phong cách chi tiết (AttributesForm):
Nhân khẩu học: Giới tính, độ tuổi (18–60), sắc tộc (chuẩn nét Việt Nam, Đông Á, Âu Mỹ...), vóc dáng, màu da.
Khuôn mặt & Trang điểm: Kiểu tóc, màu tóc, dáng mắt, phong cách trang điểm (Clean Girl, Glass skin, Soft glam), biểu cảm.
Phong cách & Bối cảnh: Nghề nghiệp, trang phục, địa điểm chụp, ánh sáng studio, ống kính máy ảnh (85mm f/1.4, 50mm UGC...).
Other Features: Trường tùy biến tự do các chi tiết nhận diện (nốt ruồi, phụ kiện, vết tàn nhang...).
3. AI Vision Phân tích ảnh mẫu (ImageAnalyzerModal):
Người dùng có thể chọn bất kỳ ảnh mẫu nào từ thư viện Flow hoặc máy tính.
Hệ thống dùng AI phân tích tự động trích xuất toàn bộ đặc tính khuôn mặt, kiểu tóc, trang phục và điền ngược lại form.
4. Bộ sinh Prompt tiếng Anh & Render ảnh:
Tự động dịch và biên soạn cấu trúc prompt chuẩn thương mại 8K tối ưu cho mô hình 🍌 Nano Banana Pro.
Hỗ trợ lưu cấu hình ra file JSON và khôi phục bất cứ lúc nào.
Cơ chế chuyển tiếp 1-chạm: Sau khi có ảnh nhân vật ưng ý, người dùng bấm "Đưa Vào Review Bán Hàng" hoặc "Sao Chép Chuyển Động" để nạp trực tiếp mediaId sang các bước sau mà không cần tải lại thủ công.
PHÂN HỆ 2: KỊCH BẢN REVIEW BÁN HÀNG 5 PHÂN CẢNH (ProductScriptStudio)
Mục tiêu: Tự động hóa từ khâu lên kịch bản, lời thoại, căn chỉnh thời lượng cho đến render video thương mại và ghép thành video hoàn chỉnh.

1. Hệ thống quản lý tài nguyên đầu vào (Resource Pipeline)
Quy tắc 3/3 bắt buộc:
Ảnh Sản Phẩm: Mặt trước bao bì, nhãn mác rõ nét.
Ảnh Người Mẫu / KOC: Giữ cố định khuôn mặt lấy từ Module 1 hoặc ảnh có sẵn.
Ảnh Bối Cảnh: Khung cảnh quay (studio, phòng trang điểm, cửa hàng...).
2 tài nguyên tùy chọn nâng cao:
Đồng nhất trang phục: Nếu nạp ảnh trang phục riêng, hệ thống sẽ ép nhân vật mặc cố định bộ đồ này xuyên suốt 5 cảnh.
Giọng Voice FLOW: Hỗ trợ tải tệp MP3, WAV hoặc video có tiếng để mô hình đồng bộ khẩu hình theo giọng mẫu.
2. AI Tự Động Phân Tích Thông Tin Sản Phẩm
Chỉ cần nhập Tên Sản Phẩm, bấm nút "AI Tự Động Phân Tích 2 Ô Này":
Điểm nổi bật / Công dụng: Tự động trích xuất các giá trị cốt lõi giải quyết vấn đề cho khách hàng mục tiêu.
Đặc điểm nhận diện bao bì: Khóa chặt màu sắc vỏ chai, nắp lọ, logo để khi render video bao bì không bị biến dạng.
3. Cấu hình Giọng Đọc Vùng Miền & Khóa Đồng Nhất Âm Sắc (VoiceConfigPanel)
Vùng miền (Accents):
Giọng Miền Bắc (Chuẩn Hà Nội): Phát âm tròn vành rõ chữ, chuẩn 6 thanh, nhã nhặn, sắc sảo.
Giọng Miền Nam (TP.HCM): Ngọt ngào, vui tươi, tốc độ nảy nở sinh động, phù hợp livestream chốt đơn.
Giọng Miền Trung (Đà Nẵng / Huế): Trầm lắng, chân phương, giàu độ tin cậy.
Giới tính & Tông giọng: Nữ (Mezzo-soprano) hoặc Nam (Baritone), kết hợp các sắc thái (Sôi nổi TikTok, Ấm áp chân thành, Sang trọng, Giục giã Flash Sale...).
Acoustic Lock & Anti-Stutter (Chống lặp từ):
Hệ thống tự động biên soạn đoạn mô tả âm học chi tiết chèn vào prompt video, đồng thời áp đặt chỉ thị: Nói một mạch liên tục, phát âm từng từ đúng 1 lần, tuyệt đối không lặp cụm từ (no stuttering, no word repetition).
4. Thuật toán Căn Chỉnh Thời Lượng Video Theo Tiếng Việt (durationCalculator)
Mô hình sinh video Omni 1.1 Flash hỗ trợ các mốc thời lượng: 4s, 6s, 8s, 10s.
Hệ thống tính toán dựa trên tốc độ đọc tiếng Việt tự nhiên (~2.6 - 2.8 từ/giây, cộng khoảng trễ mở/hạ khẩu hình):
≤ 12 từ: 4 giây.
13 - 18 từ: Tối thiểu 6 giây (ví dụ các câu Hook dài).
19 - 25 từ: 8 giây (cảnh khơi gợi nỗi đau, giải pháp).
26 - 32 từ: 10 giây.
Cảnh báo rủi ro & Nút 1-chạm: Nếu người dùng sửa lời thoại dài quá số từ an toàn, thẻ phân cảnh sẽ báo đỏ và cung cấp nút "Khớp Xs" để nâng thời lượng ngay lập tức, ngăn ngừa lỗi nhân vật bị ngắt lời giữa chừng.
5. Quy trình Render Phân Cảnh (Storyboard Grid)
Tạo Full Ảnh (Batch 5 cảnh): Sinh 5 ảnh phân cảnh đồng bộ nhân vật, sản phẩm và bối cảnh bằng 🍌 Nano Banana Pro.
Render Video (Batch đợt 2 clip/lần): Gọi Omni 1.1 Flash tạo chuyển động camera, cử chỉ tay cầm sản phẩm và đồng bộ khẩu hình.
Làm lại có kiểm soát (Feedback Modal): Nếu cảnh nào chưa ưng ý (lệch mặt, logo chưa nét, góc máy chưa đẹp), người dùng có thể chọn lý do cụ thể và nhập góp ý để AI tự động tinh chỉnh prompt trước khi render lại.
6. Timeline Biên Tập & Ghép Nối Video (VideoConcatenatorTimeline)
Sử dụng FFmpeg WASM chạy trực tiếp trong browser:
Cho phép đảo thứ tự các phân cảnh (nút < >).
Chuẩn hóa tự động toàn bộ video về chuẩn 720p 24fps để tránh lỗi lệch luồng stream.
Hỗ trợ 2 chế độ: Có âm thanh (hòa âm AAC) hoặc Không tiếng (Video-only fallback an toàn 100%).
Xuất ra 1 video duy nhất (tổng thời lượng 30 - 36s) hoàn chỉnh để đăng tải.
7. Bộ Tối Ưu Hóa Bài Đăng MXH (VideoPostCaptionSection)
AI tự động phân tích kịch bản và sản phẩm để tạo ngay:
Tiêu đề giật tít (Hook Title): Kèm emoji nổi bật.
Mô tả chi tiết (Caption): Nêu bật công dụng và giải pháp.
Lời kêu gọi hành động (CTA): Thúc đẩy bấm giỏ hàng góc trái.
Bộ thẻ Hashtags Viral: 8–12 hashtags xu hướng (#fyp, #tiktokshop, #review...).
Nút sao chép 1-chạm hoặc tải về định dạng .txt.
PHÂN HỆ 3: SAO CHÉP CHUYỂN ĐỘNG (Motion Cloner Auto)
Mục tiêu: Dành cho ngành hàng thời trang, phong cách sống hoặc các video cần sao chép lại dáng điệu (Catwalk, vũ đạo, đạp xe, quay người) từ một video mẫu có sẵn sang nhân vật KOC mới.

1. Phân tích cử chỉ AI Vision:
Tự động quét khung hình video mẫu (fps=1) để nhận diện chuyển động cơ học (dáng đi, góc quay camera, nhịp bước).
2. Ghép trang phục mới (Virtual Fitting):
Nếu người dùng nạp thêm ảnh trang phục mới, hệ thống sẽ gọi Nano Banana Pro ghép bộ đồ mới vào nhân vật KOC trước, giữ nguyên 100% gương mặt và vóc dáng.
3. Tái tạo chuyển động (Video Reenactment):
Sử dụng chế độ V2V Edit hoặc R2V Motion Tracking trên Omni 1.1 Flash để áp đặt nhân vật mới thực hiện trọn vẹn cử chỉ của video gốc.
Tự động lưu video kết quả vào Media Gallery và cung cấp nút tải trực tiếp file MP4.
PHÂN HỆ 4: CÀI ĐẶT MODEL AI TOÀN CỤC (GlobalModelSettingsModal)
Đặt gọn gàng tại icon bánh răng ⚙️ trên thanh tiêu đề:
Model Ảnh: 🍌 Nano Banana Pro (Mặc định nét cao), 🍌 Nano Banana 2 Lite (Nhanh, tiết kiệm hạn mức/tránh quota), 🍌 Nano Banana 2.1.
Model Video: Omni 1.1 Flash (Mặc định hỗ trợ linh hoạt 4s–10s, 360p/720p), Veo 3.1 - Lite, Veo 3.1 - Fast, Veo 3.1 - Quality.
Khi thay đổi tại đây, cả 3 phân hệ sẽ lập tức áp dụng đồng bộ.
📊 BẢNG TỔNG HỢP VAI TRÒ CÁC TỆP TRONG DỰ ÁN
Tệp tin	Vai trò chính trong hệ thống
App.tsx	Điều phối trạng thái toàn cục, chuyển đổi 3 tab, quản lý bộ nhớ media chuyển giao giữa các module.
types.ts	Khai báo cấu trúc dữ liệu: Nhân vật, Storyboard phân cảnh, Giọng đọc, Phân tích SEO và Asset.
constants.ts	Danh mục Preset KOC, 5 phong cách review, hệ thống giọng đọc 3 miền và hàm tạo Acoustic Prompt.
ProductScriptStudio.tsx	Trung tâm điều khiển kịch bản review bán hàng, quản lý 5 phân cảnh và điều phối render.
SceneCardItem.tsx	Giao diện từng thẻ phân cảnh, đo số từ lời thoại, hiển thị trạng thái sinh ảnh/video và các nút hành động.
SceneDetailModal.tsx	Trình biên tập chi tiết góc quay, lời thoại, căn chỉnh thời lượng 4s–10s và tinh chỉnh prompt từng cảnh.
VoiceConfigPanel.tsx	Bảng điều khiển chọn giọng Hà Nội / Sài Gòn / Miền Trung và khóa đồng nhất âm sắc.
VideoConcatenatorTimeline.tsx	Trình biên tập timeline và ghép 5 video thành 1 video dài bằng FFmpeg WASM.
VideoPostCaptionSection.tsx	Bộ sinh tiêu đề, caption bài đăng và hashtags bán hàng cho TikTok/Reels.
MotionClonerAuto.tsx	Pipeline tự động hóa sao chép chuyển động video (phân tích cử chỉ -> ghép đồ -> render video).
AttributesForm.tsx & PromptDisplay.tsx	Biểu mẫu tùy biến nhân vật KOC và bộ sinh prompt tiếng Anh chất lượng cao.
ffmpegService.ts	Lõi xử lý video FFmpeg WASM chạy qua classic Web Worker tuân thủ sandbox bảo mật của Google Flow.
durationCalculator.ts	Thuật toán tính toán số từ an toàn và đề xuất số giây phù hợp cho tiếng Việt.
promptEnhancer.ts	Bộ lọc vệ sinh prompt: loại bỏ từ khóa nhạy cảm, chống lặp từ và chuẩn hóa câu lệnh an toàn.
Bản báo cáo này bao quát toàn diện quy trình vận hành và kiến trúc của công cụ. Bạn có muốn điều chỉnh thêm tính năng nào (ví dụ: bổ sung thêm phong cách review, tinh chỉnh giao diện hay tích hợp thêm tùy chọn ghép nhạc nền)?
