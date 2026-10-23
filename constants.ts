import { CharacterAttributes, CharacterPreset, VoiceRegion, VoiceGender, VoiceTone } from './types';

export const DEFAULT_ATTRIBUTES: CharacterAttributes = {
  gender: 'female',
  age: 23,
  ethnicity: 'Người Việt Nam',
  bodyType: 'Thon gọn, cân đối thể thao',
  skinTone: 'Da trắng mịn màng với kết cấu tự nhiên',
  hairStyle: 'Tóc xoăn sóng nước mềm mại bồng bềnh mái bay',
  hairColor: 'Nâu sô-cô-la ấm áp ánh khói nhẹ',
  eyeColor: 'Mắt bồ câu nâu sẫm long lanh ấm áp',
  facialFeatures: 'Sống mũi thon gọn, đường viền hàm thanh tú, làn da căng bóng rạng rỡ',
  makeupStyle: 'Phong cách Clean-Girl, da ngậm nước dewy glow, son bóng nude, chân mày phẩy sợi',
  professionOrVibe: 'Nhà sáng tạo nội dung thời trang & sắc đẹp (KOC UGC)',
  outfit: 'Áo len dệt kim dáng rộng màu kem thanh lịch phối dây chuyền vàng mảnh tinh tế',
  accessories: 'Khuyên tai vàng tối giản và nhẫn nhỏ tinh xảo',
  expression: 'Nụ cười tự tin rạng rỡ, ánh mắt duyên dáng tương tác trực diện ống kính',
  setting: 'Góc quán cà phê phong cách tối giản đón nắng ấm với tông gỗ và cây xanh',
  lighting: 'Ánh sáng cửa sổ buổi sáng khuếch tán dịu nhẹ, viền sáng tự nhiên mềm mại',
  cameraLens: 'Ống kính chân dung 85mm f/1.4 xóa phông kem mịn màng, chuẩn thương mại 8K',
  aspectRatio: '9:16',
  otherFeatures: 'Lỗ chân lông chân thực, điểm bắt sáng lấp lánh trong mắt, thần thái KOC tự nhiên'
};

export const ETHNICITY_OPTIONS = [
  'Người Việt Nam',
  'Đông Á (Hàn Quốc aesthetic)',
  'Đông Á (Nhật Bản trong trẻo)',
  'Đông Nam Á hiện đại',
  'Âu Mỹ (Parisian thanh lịch)',
  'Bắc Âu (Scandinavian hiện đại)',
  'Mỹ Latin rạng rỡ',
  'Địa Trung Hải cổ điển',
  'Trung Đông quyến rũ',
  'Nam Á cuốn hút'
];

export const BODY_TYPE_OPTIONS = [
  'Thon gọn, cân đối thể thao',
  'Mảnh mai, nhỏ nhắn yêu kiều',
  'Đồng hồ cát quyến rũ nữ tính',
  'Người mẫu sàn diễn cao gầy thanh mảnh',
  'Đầy đặn sang trọng quý phái',
  'Cơ thể săn chắc tập gym'
];

export const SKIN_TONE_OPTIONS = [
  'Da trắng mịn màng với kết cấu tự nhiên',
  'Da ấm tông vàng rạng rỡ tự nhiên',
  'Da căng bóng như gương (Glass Skin)',
  'Làn da nâu bánh mật rực rỡ đón nắng',
  'Da ô-liu Địa Trung Hải khỏe khoắn',
  'Da ngăm sáng bóng bẩy cuốn hút'
];

export const HAIR_STYLE_OPTIONS = [
  'Tóc xoăn sóng nước mềm mại bồng bềnh mái bay',
  'Tóc bob ngắn cắt bằng hiện đại cá tính',
  'Tóc dài thẳng mượt rẽ ngôi giữa thanh lịch',
  'Búi cao đánh rối tự nhiên vài lọn tóc buông lơi',
  'Tóc đuôi ngựa thấp thanh lịch hiện đại',
  'Tóc uốn phồng bồng bềnh phong cách thập niên 90',
  'Tóc wolf cut tỉa layer thời thượng'
];

export const HAIR_COLOR_OPTIONS = [
  'Nâu sô-cô-la ấm áp ánh khói nhẹ',
  'Đen tuyền bóng mượt tự nhiên',
  'Nâu tây balayage thời thượng',
  'Nâu caramel mật ong ngọt ngào',
  'Bạch kim ánh bạc cá tính',
  'Nâu đỏ gỗ gụ sang trọng',
  'Vàng hồng pastel thời thượng'
];

export const EYE_COLOR_OPTIONS = [
  'Mắt bồ câu nâu sẫm long lanh ấm áp',
  'Mắt nâu hổ phách ánh vàng lung linh',
  'Mắt xanh lam sapphire trong veo sâu thfl',
  'Mắt xanh ngọc bích huyền bí',
  'Mắt xám khói ánh xanh cuốn hút'
];

export const MAKEUP_STYLE_OPTIONS = [
  'Phong cách Clean-Girl, da ngậm nước dewy glow, son bóng nude, chân mày phẩy sợi',
  'Soft glam quyến rũ, mắt khói kẻ đuôi sắc sảo, son hồng đất satin',
  'Phong cách Hàn Quốc glass skin, môi ombre đào căng mọng, bọng mắt cười aegyo sal',
  'Trang điểm trong veo như không, tôn nét mộc tự nhiên và tàn nhang nhẹ',
  'Phong cách thời trang cao cấp, son đỏ nhung lì quyền lực và khối gò má điêu khắc',
  'Trang điểm tông đồng ấm áp rực rỡ với phấn bắt sáng ngọc trai'
];

export const PROFESSION_OPTIONS = [
  'Nhà sáng tạo nội dung thời trang & sắc đẹp (KOC UGC)',
  'Blogger du lịch và phong cách sống cao cấp',
  'Người mẫu thời trang sàn diễn Haute Couture',
  'Nữ doanh nhân công nghệ & sáng tạo trẻ trung',
  'Huấn luyện viên sức khỏe & phong cách sống năng động',
  'Chuyên gia review quán cà phê & ẩm thực',
  'Influencer thời trang đường phố đậm chất điện ảnh'
];

export const OUTFIT_OPTIONS = [
  'Áo len dệt kim dáng rộng màu kem thanh lịch phối dây chuyền vàng mảnh tinh tế',
  'Áo blazer xám than tối giản phối áo hai dây lụa bên trong',
  'Váy lụa hai dây satin quyến rũ màu sâm-panh',
  'Áo croptop đường phố năng động phối quần túi hộp và giày thể thao',
  'Bộ đồ tập gym thể thao gân sọc ôm dáng khỏe khoắn',
  'Áo khoác dạ dáng dài thiết kế thời trang cao cấp',
  'Áo sơ mi linen trắng tinh khôi gài nút hờ hững phong cách phóng khoáng'
];

export const EXPRESSION_OPTIONS = [
  'Nụ cười tự tin rạng rỡ, ánh mắt duyên dáng tương tác trực diện ống kính',
  'Ánh nhìn cuốn hút đầy mê hoặc, khóe môi hé mở tự nhiên',
  'Tiếng cười giòn tan tự nhiên, tâm trạng vui tươi rạng rỡ',
  'Phong thái điềm đạm thanh tao, tĩnh lặng thư thái',
  'Nét mặt kiêu kỳ sắc sảo chuẩn người mẫu thời trang quốc tế'
];

export const SETTING_OPTIONS = [
  'Góc quán cà phê phong cách tối giản đón nắng ấm với tông gỗ và cây xanh',
  'Căn hộ cao cấp hiện đại cửa kính chạm sàn ngắm toàn cảnh thành phố',
  'Khu phố cổ phong cách châu Âu lãng mạn giờ hoàng hôn với quán xá vỉa hè',
  'Sảnh chờ khách sạn 5 sao sang trọng lát đá cẩm thạch ấm áp',
  'Showroom thời trang boutique cao cấp với gương lớn và kệ trưng bày',
  'Khu nghỉ dưỡng ven biển nhiệt đới lúc hoàng hôn với gió biển rì rào',
  'Studio chụp ảnh thương mại chuyên nghiệp với phông nền màu trung tính'
];

export const LIGHTING_OPTIONS = [
  'Ánh sáng cửa sổ buổi sáng khuếch tán dịu nhẹ, viền sáng tự nhiên mềm mại',
  'Ánh nắng giờ vàng điện ảnh với vệt sáng hổ phách ấm áp và bóng đổ êm dịu',
  'Ánh sáng softbox studio thời trang cao cấp với điểm sáng tương phát sắc nét',
  'Ánh sáng ngược viền tóc kịch tính với nền mờ ảo lung linh',
  'Ánh sáng tự nhiên ban ngày trong trẻo, sắc nét chuẩn thương mại',
  'Ánh đèn vonfram vàng ấm phối cùng ánh sáng xanh huyền ảo buổi chiều tà'
];

export const CAMERA_LENS_OPTIONS = [
  'Ống kính chân dung 85mm f/1.4 xóa phông kem mịn màng, chuẩn thương mại 8K',
  'Ống kính 50mm f/1.2 góc nhìn quay điện thoại tự nhiên chân thực (UGC)',
  'Ống kính 35mm phong cách điện ảnh đường phố, màu phim Kodak Portra 400',
  'Ống kính macro 105mm siêu nét từng sợi lông mi và kết cấu da tự nhiên'
];

export const POPULAR_PRESETS: CharacterPreset[] = [
  {
    id: 'viet_ugc_girl',
    name: 'KOC Mỹ Phẩm & Chăm Sóc Da Việt Nam',
    badge: 'Chuyển Đổi Cao',
    description: 'Người mẫu sáng tạo nội dung mỹ phẩm, làn da căng bóng ngậm nước, phong cách gần gũi tự nhiên.',
    attributes: {
      ethnicity: 'Người Việt Nam',
      age: 22,
      bodyType: 'Thon gọn, cân đối thể thao',
      skinTone: 'Da căng bóng như gương (Glass Skin)',
      hairStyle: 'Tóc xoăn sóng nước mềm mại bồng bềnh mái bay',
      hairColor: 'Nâu sô-cô-la ấm áp ánh khói nhẹ',
      makeupStyle: 'Phong cách Clean-Girl, da ngậm nước dewy glow, son bóng nude, chân mày phẩy sợi',
      professionOrVibe: 'Nhà sáng tạo nội dung thời trang & sắc đẹp (KOC UGC)',
      outfit: 'Áo len dệt kim dáng rộng màu kem thanh lịch phối dây chuyền vàng mảnh tinh tế',
      setting: 'Góc quán cà phê phong cách tối giản đón nắng ấm với tông gỗ và cây xanh',
      lighting: 'Ánh sáng cửa sổ buổi sáng khuếch tán dịu nhẹ, viền sáng tự nhiên mềm mại',
      expression: 'Nụ cười tự tin rạng rỡ, ánh mắt duyên dáng tương tác trực diện ống kính'
    }
  },
  {
    id: 'korean_fashionista',
    name: 'KOC Thời Trang Phong Cách Hàn Quốc',
    badge: 'Thịnh Hành TikTok',
    description: 'Phong cách thời trang Seoul thời thượng, tóc ép thẳng tỉa layer, gu ăn mặc tối giản sang trọng.',
    attributes: {
      ethnicity: 'Đông Á (Hàn Quốc aesthetic)',
      age: 24,
      bodyType: 'Người mẫu sàn diễn cao gầy thanh mảnh',
      skinTone: 'Da trắng mịn màng với kết cấu tự nhiên',
      hairStyle: 'Tóc dài thẳng mượt rẽ ngôi giữa thanh lịch',
      hairColor: 'Đen tuyền bóng mượt tự nhiên',
      makeupStyle: 'Phong cách Hàn Quốc glass skin, môi ombre đào căng mọng, bọng mắt cười aegyo sal',
      professionOrVibe: 'Nhà sáng tạo nội dung thời trang & sắc đẹp (KOC UGC)',
      outfit: 'Áo blazer xám than tối giản phối áo hai dây lụa bên trong',
      setting: 'Căn hộ cao cấp hiện đại cửa kính chạm sàn ngắm toàn cảnh thành phố',
      lighting: 'Ánh sáng cửa sổ buổi sáng khuếch tán dịu nhẹ, viền sáng tự nhiên mềm mại',
      expression: 'Ánh nhìn cuốn hút đầy mê hoặc, khóe môi hé mở tự nhiên'
    }
  },
  {
    id: 'parisian_luxury',
    name: 'Quý Cô Thời Trang Paris Quý Phái',
    badge: 'Sang Trọng Đẳng Cấp',
    description: 'Quý cô Paris thần thái thanh lịch, tóc bob lượn sóng tự nhiên, thời trang Haute Couture.',
    attributes: {
      ethnicity: 'Âu Mỹ (Parisian thanh lịch)',
      age: 26,
      bodyType: 'Thon gọn, cân đối thể thao',
      skinTone: 'Da trắng mịn màng với kết cấu tự nhiên',
      hairStyle: 'Tóc bob ngắn cắt bằng hiện đại cá tính',
      hairColor: 'Nâu caramel mật ong ngọt ngào',
      makeupStyle: 'Phong cách thời trang cao cấp, son đỏ nhung lì quyền lực và khối gò má điêu khắc',
      professionOrVibe: 'Người mẫu thời trang sàn diễn Haute Couture',
      outfit: 'Váy lụa hai dây satin quyến rũ màu sâm-panh',
      setting: 'Khu phố cổ phong cách châu Âu lãng mạn giờ hoàng hôn với quán xá vỉa hè',
      lighting: 'Ánh nắng giờ vàng điện ảnh với vệt sáng hổ phách ấm áp và bóng đổ êm dịu',
      expression: 'Phong thái điềm đạm thanh tao, tĩnh lặng thư thái'
    }
  },
  {
    id: 'fitness_wellness',
    name: 'Huấn Luyện Viên Thể Thao & Sức Khỏe',
    badge: 'Năng Động Tràn Trề',
    description: 'Huấn luyện viên sức khỏe, cơ thể săn chắc, làn da rám nắng rạng rỡ và nụ cười tràn đầy năng lượng.',
    attributes: {
      ethnicity: 'Người Việt Nam',
      age: 25,
      bodyType: 'Cơ thể săn chắc tập gym',
      skinTone: 'Làn da nâu bánh mật rực rỡ đón nắng',
      hairStyle: 'Tóc đuôi ngựa thấp thanh lịch hiện đại',
      hairColor: 'Nâu sô-cô-la ấm áp ánh khói nhẹ',
      makeupStyle: 'Trang điểm trong veo như không, tôn nét mộc tự nhiên và tàn nhang nhẹ',
      professionOrVibe: 'Huấn luyện viên sức khỏe & phong cách sống năng động',
      outfit: 'Bộ đồ tập gym thể thao gân sọc ôm dáng khỏe khoắn',
      setting: 'Sảnh chờ khách sạn 5 sao sang trọng lát đá cẩm thạch ấm áp',
      lighting: 'Ánh sáng tự nhiên ban ngày trong trẻo, sắc nét chuẩn thương mại',
      expression: 'Tiếng cười giòn tan tự nhiên, tâm trạng vui tươi rạng rỡ'
    }
  }
];

export const AVAILABLE_IMAGE_MODELS = [
  { id: '🍌 Nano Banana Pro', name: '🍌 Nano Banana Pro (Mặc định nét cao)' },
  { id: '🍌 Nano Banana 2 Lite', name: '🍌 Nano Banana 2 Lite (Nhanh)' },
  { id: '🍌 Nano Banana 2.1', name: '🍌 Nano Banana 2.1 (Bản mới)' }
];

export const AVAILABLE_VIDEO_MODELS = [
  { id: 'Omni 1.1 Flash', name: 'Omni 1.1 Flash (Hỗ trợ 4s, 6s, 8s, 10s)' },
  { id: 'Veo 3.1 - Lite', name: 'Veo 3.1 - Lite (8s 720p)' },
  { id: 'Veo 3.1 - Fast', name: 'Veo 3.1 - Fast (8s 720p)' },
  { id: 'Veo 3.1 - Quality', name: 'Veo 3.1 - Quality (Chất lượng cao)' }
];

export const MOTION_PRESETS = [
  {
    id: 'catwalk',
    title: 'Catwalk Sàn Diễn Thời Trang',
    icon: 'styler',
    promptAddon: 'Bước đi catwalk chuyên nghiệp sàn diễn thời trang, sải chân tự tin, nhịp điệu chuyển động uyển chuyển thanh lịch.'
  },
  {
    id: 'cycling',
    title: 'Đạp Xe Dạo Phố Thảnh Thơi',
    icon: 'pedal_bike',
    promptAddon: 'Đạp xe nhẹ nhàng trên phố, dáng người thanh thoát, gió thổi nhẹ làn tóc bay bổng tự nhiên.'
  },
  {
    id: 'dance',
    title: 'Khiêu Vũ Nghệ Thuật Uyển Chuyển',
    icon: 'nightlife',
    promptAddon: 'Điệu nhảy nghệ thuật duyên dáng theo nhịp điệu, động tác tay chuyển động mềm mại xoay người quý phái.'
  },
  {
    id: 'talking_ugc',
    title: 'KOC Trò Chuyện Tự Nhiên Trước Ống Kính',
    icon: 'record_voice_over',
    promptAddon: 'Nhà sáng tạo nội dung nói chuyện chân thành trước ống kính máy ảnh, biểu cảm mắt và nụ cười tự nhiên, tay minh họa linh hoạt.'
  }
];

export const REVIEW_STYLES = [
  {
    id: 'tiktok_ugc',
    title: 'TikTok UGC Đời Thường',
    badge: 'Chuyển Đổi Cao',
    icon: 'smartphone',
    toneColor: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    distinction: 'Góc máy cầm tay rung nhẹ tự nhiên (Handheld POV), bối cảnh phòng ngủ/bàn trang điểm, KOC xưng hô "mình - mấy bà", nhịp cắt nhanh 2-3s/shot.',
    cinematography: 'Cầm tay di động, góc quay POV cận mặt, ánh sáng tự nhiên từ cửa sổ, phông nền đời thường gần gũi.',
    speechPacing: 'Nhanh, tự nhiên, nhịp điệu đời thường ~2.6 - 2.8 từ/giây, dùng từ lóng xu hướng TikTok.'
  },
  {
    id: 'luxury_commercial',
    title: 'TVC Điện Ảnh Sang Trọng',
    badge: 'Đẳng Cấp',
    icon: 'diamond',
    toneColor: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
    distinction: 'Chuyển động dolly ray trượt mượt mà, chuyển cảnh chậm rãi, ánh sáng studio nghệ thuật viền vàng, âm nhạc giao hưởng trầm ấm quý phái.',
    cinematography: 'Dolly ray trượt chậm, ống kính anamorphic xóa phông sâu, tia sáng rim-light viền tóc, phản chiếu kính tinh xảo.',
    speechPacing: 'Trầm ấm, quý phái, nhả chữ tròn vành, nhịp nói chậm rãi ~2.2 - 2.5 từ/giây, từ ngữ thanh lịch tôn vinh thương hiệu.'
  },
  {
    id: 'problem_solution',
    title: 'Nỗi Đau & Cứu Tinh (Before/After)',
    badge: 'Viral Mạnh',
    icon: 'psychology',
    toneColor: 'text-rose-400 border-rose-500/30 bg-rose-500/10',
    distinction: 'Đầu video nhấn mạnh cảm giác bế tắc, mặt mộc mệt mỏi với tone lạnh. Sau đó bừng sáng tone vàng ấm khi sản phẩm xuất hiện giải quyết triệt để.',
    cinematography: 'Cảnh 1-2 góc máy cận mặt bối rối, tone màu lạnh khử bão hòa. Cảnh 3-5 chuyển sang ánh sáng rạng rỡ đón nắng.',
    speechPacing: 'Đồng cảm sâu sắc ở phần đầu rồi chuyển sang hào hứng, dứt khoát ~2.6 từ/giây.'
  },
  {
    id: 'unboxing_asmr',
    title: 'Đập Hộp & Trải Nghiệm ASMR',
    badge: 'Thư Giãn Thẩm Mỹ',
    icon: 'inventory_2',
    toneColor: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
    distinction: 'Góc máy quay từ trên xuống (Top-down Flatlay) và Macro cận cảnh 105mm. Tập trung vào âm thanh tách seal, kết cấu chất kem/chất liệu sờ chạm mịn màng.',
    cinematography: 'Góc nhìn từ trên xuống (Top-Down Flatlay), Macro 105mm cận cảnh từng nếp vân vỏ hộp, giọt tinh chất nhỏ giọt.',
    speechPacing: 'Thì thầm nhẹ nhàng, êm dịu, nhịp thư thái ~2.0 - 2.4 từ/giây, tôn vinh tiếng động cơ học thực tế.'
  },
  {
    id: 'expert_medical',
    title: 'Bác Sĩ & Chuyên Gia Uy Tín',
    badge: 'Tin Cậy 100%',
    icon: 'verified',
    toneColor: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    distinction: 'Trang phục áo blouse hoặc vest công sở tối giản, phòng khám/phòng thí nghiệm hiện đại, dẫn chứng bảng thành phần khoa học, biểu đồ minh họa.',
    cinematography: 'Góc máy ngang tầm mắt tĩnh lặng, vững vàng, ánh sáng trắng y khoa chuẩn xác, không dùng hiệu ứng ảo hóa.',
    speechPacing: 'Dõng dạc, mạch lạc, phát âm chuẩn xác thuật ngữ khoa học, nhịp ~2.5 từ/giây toát lên sự kiểm chứng uy tín.'
  }
];

export const VOICE_REGIONS: Array<{
  id: VoiceRegion;
  label: string;
  badge: string;
  icon: string;
  accentTitle: string;
  description: string;
  features: string;
}> = [
  {
    id: 'north_hanoi',
    label: 'Giọng Miền Bắc (Chuẩn Hà Nội)',
    badge: 'Thanh lịch & Chuẩn âm',
    icon: 'location_city',
    accentTitle: 'Hanoi Standard Northern Accent',
    description: 'Phát âm tròn vành rõ chữ, thanh điệu chuẩn 6 thanh, âm sắc sắc sảo, tự nhiên, nhã nhặn và rất thu hút trên livestream.',
    features: 'Phát âm chính xác các dấu hỏi/ngã, âm vực trong sáng, tốc độ linh hoạt từ 2.6 - 3.0 từ/giây.'
  },
  {
    id: 'south_hcm',
    label: 'Giọng Miền Nam (TP. Hồ Chí Minh)',
    badge: 'Gần gũi & Dễ thương',
    icon: 'apartment',
    accentTitle: 'Ho Chi Minh Southern Accent',
    description: 'Tông giọng ngọt ngào, ấm áp, nhịp điệu sinh động, mang đậm phong cách KOC TikTok Shop miền Nam cực kỳ chốt đơn.',
    features: 'Độ nảy vui tươi, âm sắc thân thiện, biểu cảm khẩu hình linh hoạt, xưng hô duyên dáng "mình - mấy bạn".'
  },
  {
    id: 'central_hue_danang',
    label: 'Giọng Miền Trung (Đà Nẵng / Huế)',
    badge: 'Truyền cảm & Trầm ấm',
    icon: 'temple_buddhist',
    accentTitle: 'Central Vietnam Accent (Da Nang / Hue)',
    description: 'Tông trầm lắng, mộc mạc chân phương, tạo cảm giác đáng tin cậy tuyệt đối, phù hợp sản phẩm sức khỏe, thảo mộc.',
    features: 'Âm vực sâu lắng, từ ngữ chân phương, phát âm ấm áp tạo sự đồng cảm sâu rộng.'
  }
];

export const VOICE_GENDERS: Array<{
  id: VoiceGender;
  label: string;
  icon: string;
  timbreDescription: string;
}> = [
  {
    id: 'female',
    label: 'Giới tính Nữ (Female Voice)',
    icon: 'female',
    timbreDescription: 'Âm sắc nữ tính, cao độ soprano/mezzo trong trẻo, phát âm mềm mại ngậm nước, biểu cảm duyên dáng rạng rỡ.'
  },
  {
    id: 'male',
    label: 'Giới tính Nam (Male Voice)',
    icon: 'male',
    timbreDescription: 'Âm sắc nam tính, âm vực baritone trầm ấm, nội lực dứt khoát, phong thái điềm đạm, toát lên sự tin cậy cao.'
  }
];

export const VOICE_TONES = [
  {
    id: 'tiktok_energetic',
    label: 'Sôi Nổi Hào Hứng (TikTok Shop)',
    tag: 'Sôi nổi năng động, nhịp nói ~2.8 từ/giây',
    desc: 'Tiết tấu nhanh, cuốn hút, tràn đầy năng lượng giữ chân người xem ngay từ giây đầu.'
  },
  {
    id: 'warm_natural',
    label: 'Ấm Áp & Chân Thành',
    tag: 'Ấm áp tự nhiên, nhịp nói ~2.5 từ/giây',
    desc: 'Tông giọng tâm sự nhẹ nhàng, không phô trương, tạo sự tin cậy tuyệt đối.'
  },
  {
    id: 'luxury_calm',
    label: 'Điềm Tĩnh & Sang Trọng',
    tag: 'Trầm tĩnh tinh tế, nhịp nói ~2.2 từ/giây',
    desc: 'Phong thái điềm đạm, nhấn nhá chữ tròn vành, thích hợp phân khúc cao cấp.'
  },
  {
    id: 'urgent_sale',
    label: 'Kêu Gọi Chốt Đơn Gấp (Flash Sale)',
    tag: 'Khẩn trương chốt đơn, nhịp nói ~2.8 từ/giây',
    desc: 'Kích thích tâm lý quyết định nhanh, ưu đãi giới hạn thời gian hấp dẫn.'
  },
  {
    id: 'expert_trusted',
    label: 'Chuyên Gia Tự Tin',
    tag: 'Uy tín chuyên nghiệp, nhịp nói ~2.5 từ/giây',
    desc: 'Giọng điệu dõng dạc, mạch lạc, toát lên kinh nghiệm chuyên sâu trong ngành.'
  }
];

/**
 * Xây dựng đoạn mô tả âm học chi tiết (Detailed Acoustic Prompt)
 * Bổ sung quy tắc chống lặp từ: "No word repetition, no stuttering, each word must be spoken exactly once fluently".
 */
export function buildDetailedVoicePrompt(region: VoiceRegion, gender: VoiceGender, tone: VoiceTone): string {
  const regObj = VOICE_REGIONS.find(r => r.id === region) || VOICE_REGIONS[0];
  const genObj = VOICE_GENDERS.find(g => g.id === gender) || VOICE_GENDERS[0];
  const tonObj = VOICE_TONES.find(t => t.id === tone) || VOICE_TONES[0];

  const regionSpec = region === 'north_hanoi'
    ? 'Authentic Standard Hanoi Northern Vietnamese Accent (Giọng Hà Nội chuẩn). Articulate, crisp tone, perfectly enunciating all 6 Vietnamese tones without regional phonetic slips. Natural, sharp yet elegant resonance.'
    : region === 'south_hcm'
    ? 'Authentic Ho Chi Minh City Southern Vietnamese Accent (Giọng Sài Gòn/TP.HCM). Sweet, cheerful, warm, bouncy cadence, highly engaging and relatable TikTok Shop sales delivery.'
    : 'Authentic Central Vietnamese Accent (Đà Nẵng / Huế). Sincere, grounded, soothing deep resonance, trustworthy and heartfelt delivery.';

  const genderSpec = gender === 'female'
    ? 'Female speaker: Crisp, clear, vibrant, melodic mezzo-soprano timbre, smooth articulation, expressive lip movements.'
    : 'Male speaker: Deep, warm, resonant baritone timbre, authoritative yet friendly cadence, steady articulate delivery.';

  const pacingSpec = tone === 'tiktok_energetic' || tone === 'urgent_sale'
    ? 'Upbeat conversational pacing (~2.8 words/second), energetic vocal dynamics with clean sentence conclusion.'
    : tone === 'luxury_calm'
    ? 'Gentle, refined, composed pacing (~2.2 - 2.4 words/second), resonant velvety pauses, polished cadence.'
    : 'Natural, authentic everyday pacing (~2.5 - 2.7 words/second), warm, conversational and believable.';

  return `VOICE PROFILE SPECIFICATION: ${regionSpec} ${genderSpec} Mood & Pacing: ${tonObj.label} (${pacingSpec}). ANTI-STUTTER CONSTRAINT: Speak smoothly in a single continuous fluent take. Absolutely NO stuttering, NO word repetition, and NO phrase looping (speak each word exactly once from start to finish without repeating phrases). Consistency Lock: Every scene must strictly preserve identical vocal pitch, timbre, accent region, and mouth articulation dynamics across all sequential video clips without pitch drift or voice shifting.`;
}

export const DEFAULT_STORYBOARD_STAGES: Array<{
  stageName: string;
  title: string;
  durationSeconds: 4 | 6 | 8 | 10;
  cameraAngle: string;
  moodTag: string;
  visualKeypoints: string;
  productVisualDetails: string;
  dialogue: string;
  actingGuide: string;
  imagePrompt: string;
  videoPrompt: string;
  voiceGuidance: string;
}> = [
  {
    stageName: 'Mở đầu (Hook)',
    title: 'Cảnh 1: Cú Hook Giữ Chân Khán Giả',
    durationSeconds: 6,
    cameraAngle: 'Góc cận cảnh POV đẩy nhẹ về phía trước',
    moodTag: 'Ngạc nhiên, tò mò tột độ',
    visualKeypoints: 'Gương mặt KOC bất ngờ thích thú, tay nâng sản phẩm nổi bật trước ống kính',
    productVisualDetails: 'Bao bì sản phẩm hiển thị góc chính diện sắc nét, nhãn mác rõ ràng ở trung tâm',
    dialogue: 'Da sạm xỉn, thiếu ẩm mà thử bao loại serum dưỡng sáng vẫn không căng bóng chuẩn Hàn?',
    actingGuide: 'Nhìn thẳng vào ống kính với ánh mắt bất ngờ thú vị, chỉ nhẹ lên gò má rồi giơ sản phẩm lên ngang cằm',
    imagePrompt: 'Close-up commercial portrait of the creator holding the exact reference product directly in front of camera with an intrigued captivating expression, identical packaging color and typography from reference, clean studio lighting',
    videoPrompt: 'Camera micro push-in on creator speaking directly to camera while holding the reference product steadily, expressive authentic facial gestures, clear lip sync',
    voiceGuidance: 'Sôi nổi, ngạc nhiên giữ chân người xem (17-18 từ, hoàn thành trọn vẹn trong 6 giây)'
  },
  {
    stageName: 'Vấn đề & Nỗi đau',
    title: 'Cảnh 2: Khơi Gợi Nỗi Đau & Điểm Bất Tiện',
    durationSeconds: 8,
    cameraAngle: 'Góc trung cận với ánh sáng tự nhiên dịu nhẹ',
    moodTag: 'Đồng cảm, thấu hiểu chân thành',
    visualKeypoints: 'Nhân vật nhớ lại trải nghiệm bất tiện trước đây khi chưa tìm ra giải pháp',
    productVisualDetails: 'Sản phẩm đặt gọn gàng trên bàn bên cạnh nhân vật, nhận diện đồng nhất',
    dialogue: 'Cứ mỗi mùa hanh khô là mặt mũi mình lại khô ráp mốc meo, đổ bao nhiêu tiền thử kem đắt đỏ mà đâu lại vào đấy.',
    actingGuide: 'Ánh mắt suy tư đồng cảm, động tác tay giải thích tự nhiên, hơi nghiêng đầu',
    imagePrompt: 'Medium shot of creator talking authentically with empathetic sincere expression, identical face to reference model, natural window ambient lighting, reference product placed beside',
    videoPrompt: 'Creator naturally explaining past struggles with relatable facial expressions and natural hand gestures, completing speech before camera pauses',
    voiceGuidance: 'Tông giọng chân thành, đồng cảm sâu sắc (24 từ, hoàn thành trong 7.5 giây)'
  },
  {
    stageName: 'Giải pháp / Ra mắt',
    title: 'Cảnh 3: Sản Phẩm Xuất Hiện Cứu Tinh',
    durationSeconds: 8,
    cameraAngle: 'Góc quay trượt Dolly chuyển động mượt mà quanh sản phẩm',
    moodTag: 'Hào hứng, rạng rỡ bất ngờ',
    visualKeypoints: 'Bao bì thiết kế tinh xảo, ánh sáng phản chiếu sang trọng, gương mặt rạng rỡ',
    productVisualDetails: 'Cận cảnh thân vỏ, nhãn hiệu và chi tiết nắp hộp chính xác 100% như ảnh mẫu',
    dialogue: 'Nhưng từ lúc kết thân với em này thì đúng là chân ái cuộc đời, bảng thành phần siêu lành tính mà cấp ẩm bóng mượt ngay tức thì.',
    actingGuide: 'Nâng sản phẩm với sự tự hào, mỉm cười rạng rỡ, tay chỉ nhẹ vào điểm nhấn',
    imagePrompt: 'Hero commercial presentation, creator smiling radiantly holding the pristine reference product with exact packaging design, luxury softbox highlights, 8k crisp details',
    videoPrompt: 'Smooth camera dolly around the product while creator introduces it with a delighted confident smile, showing off the packaging details',
    voiceGuidance: 'Hào hứng, tươi vui, điểm nhấn bất ngờ (25 từ, hoàn thành trong 7.5 giây)'
  },
  {
    stageName: 'Trải nghiệm & Điểm mạnh',
    title: 'Cảnh 4: Thao Tác Trải Nghiệm & Công Năng',
    durationSeconds: 6,
    cameraAngle: 'Góc quay qua vai cận cảnh chi tiết thao tác',
    moodTag: 'Hài lòng, thán phục công năng',
    visualKeypoints: 'Cận cảnh chất liệu mịn màng, cách sử dụng thực tế dễ dàng, hiệu quả thấy rõ',
    productVisualDetails: 'Chất kem/kết cấu và logo sản phẩm trùng khớp với hình mẫu tham chiếu',
    dialogue: 'Chất kem thoa lên mỏng nhẹ tênh, thấm trong ba giây mà không hề bết rít hay nặng mặt tí nào luôn á.',
    actingGuide: 'Đôi tay nhẹ nhàng thao tác với sản phẩm, ánh mắt chăm chú chiêm ngưỡng hiệu quả',
    imagePrompt: 'Macro commercial detail of creator demonstrating the exact product features, pristine focus on product texture, creamy background bokeh, identical product packaging',
    videoPrompt: 'Over-the-shoulder shot showing smooth usage of product with authentic satisfying reactions, speech ending neatly before scene cut',
    voiceGuidance: 'Tự tin, thuyết phục, dứt khoát (20 từ, hoàn thành trong 5.5 giây)'
  },
  {
    stageName: 'Lời kêu gọi (CTA)',
    title: 'Cảnh 5: Kêu Gọi Hành Động Chốt Đơn Gấp',
    durationSeconds: 6,
    cameraAngle: 'Góc máy ngang tầm mắt năng động',
    moodTag: 'Quyết đoán, thúc giục thân thiện',
    visualKeypoints: 'Ngón tay chỉ rõ về phía góc giỏ hàng, nụ cười khuyến khích người xem nhận quà',
    productVisualDetails: 'Nhân vật cầm chắc sản phẩm bên tay phải, mặt nhãn hướng thẳng vào người xem',
    dialogue: 'Deal hời đang có sẵn ở giỏ hàng góc trái, mấy bà chốt lẹ kẻo hết mã giảm giá nha!',
    actingGuide: 'Chỉ tay dứt khoát về phía góc dưới màn hình, nháy mắt duyên dáng mời gọi',
    imagePrompt: 'Creator gesturing toward bottom corner holding the exact reference product with charming smile and inviting posture, vibrant commercial backdrop',
    videoPrompt: 'Creator energetically gesturing toward bottom-left cart icon holding the product, enthusiastically closing the video with full dialogue complete',
    voiceGuidance: 'Thúc giục, thân thiện, rõ ràng (18 từ, hoàn thành trong 5.5 giây)'
  }
];