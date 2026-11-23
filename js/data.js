/* Vietnam4trip — tour catalogue (VI/EN, prices in VND) */
window.VV_DATA = {
  usdRate: 26000,

  destinations: [
    {
      key: "halong", region: "north", img: "assets/img/halong.jpg",
      name: { vi: "Vịnh Hạ Long", en: "Ha Long Bay" },
      tag: { vi: "Di sản thiên nhiên thế giới", en: "A UNESCO natural wonder" }
    },
    {
      key: "sapa", region: "north", img: "assets/img/sapa.jpg",
      name: { vi: "Sa Pa", en: "Sapa" },
      tag: { vi: "Ruộng bậc thang & bản làng", en: "Rice terraces & hill villages" }
    },
    {
      key: "ninhbinh", region: "north", img: "assets/img/ninhbinh.jpg",
      name: { vi: "Ninh Bình", en: "Ninh Binh" },
      tag: { vi: "Non nước Tràng An", en: "Trang An karst landscapes" }
    },
    {
      key: "hagiang", region: "north", img: "assets/img/hagiang.jpg",
      name: { vi: "Hà Giang", en: "Ha Giang" },
      tag: { vi: "Cung đường đèo huyền thoại", en: "Legendary mountain passes" }
    },
    {
      key: "hoian", region: "central", img: "assets/img/hoian.jpg",
      name: { vi: "Hội An", en: "Hoi An" },
      tag: { vi: "Phố cổ đèn lồng", en: "The lantern town" }
    },
    {
      key: "hue", region: "central", img: "assets/img/hue.jpg",
      name: { vi: "Huế", en: "Hue" },
      tag: { vi: "Cố đô trầm mặc", en: "The imperial city" }
    },
    {
      key: "danang", region: "central", img: "assets/img/danang.jpg",
      name: { vi: "Đà Nẵng", en: "Da Nang" },
      tag: { vi: "Cầu Vàng & biển xanh", en: "Golden Bridge & beaches" }
    },
    {
      key: "nhatrang", region: "central", img: "assets/img/nhatrang.jpg",
      name: { vi: "Nha Trang", en: "Nha Trang" },
      tag: { vi: "Vịnh biển nắng vàng", en: "Sunny bays & islands" }
    },
    {
      key: "dalat", region: "central", img: "assets/img/dalat.jpg",
      name: { vi: "Đà Lạt", en: "Da Lat" },
      tag: { vi: "Thành phố ngàn hoa", en: "Highland of pines & flowers" }
    },
    {
      key: "phuquoc", region: "south", img: "assets/img/phuquoc.jpg",
      name: { vi: "Phú Quốc", en: "Phu Quoc" },
      tag: { vi: "Đảo ngọc miền Nam", en: "Vietnam's island paradise" }
    },
    {
      key: "mekong", region: "south", img: "assets/img/mekong.jpg",
      name: { vi: "Miền Tây sông nước", en: "Mekong Delta" },
      tag: { vi: "Chợ nổi & miệt vườn", en: "Floating markets & orchards" }
    }
  ],

  tours: [
    {
      id: "halong-cruise-2n1d",
      dest: "halong", region: "north", type: ["nature", "luxury"], duration: 2,
      title: { vi: "Du thuyền Hạ Long 2N1Đ: Ngủ giữa di sản", en: "Ha Long Overnight Cruise — 2D1N" },
      tagline: { vi: "Ngủ giữa vịnh di sản trên du thuyền 5 sao", en: "Sleep among limestone giants on a 5-star cruise" },
      price: 2890000, oldPrice: null, rating: 4.9, reviews: 1284, badge: "bestseller",
      img: "assets/img/halong.jpg", gallery: ["assets/img/halong.jpg", "assets/img/hero.jpg", "assets/img/ninhbinh.jpg"],
      departure: { vi: "Hà Nội", en: "Hanoi" },
      group: { vi: "Tối đa 16 khách", en: "Max 16 guests" },
      highlights: [
        { vi: "Du thuyền 5 sao đưa đón từ Hà Nội", en: "5-star cruise with Hanoi transfers" },
        { vi: "Kayak & khám phá hang Luồn", en: "Kayaking and Luon Cave discovery" },
        { vi: "Lớp nấu ăn hải sản trên boong", en: "Seafood cooking class on deck" },
        { vi: "Bình minh tập Thái Cực giữa vịnh", en: "Sunrise tai chi over the bay" }
      ],
      itinerary: [
        {
          day: 1,
          title: { vi: "Hà Nội – Tuần Châu – Vịnh Hạ Long", en: "Hanoi – Tuan Chau – Ha Long Bay" },
          desc: { vi: "Đón tại khách sạn, di chuyển tới cảng, lên du thuyền. Ăn trưa hải sản, kayak hang Luồn, ngắm hoàng hôn trên vịnh. Tối: câu mực và ngủ đêm trên vịnh.", en: "Hotel pickup, drive to the harbour and board the cruise. Seafood lunch, kayaking at Luon Cave, sunset over the bay. Evening squid fishing and an overnight stay on the water." }
        },
        {
          day: 2,
          title: { vi: "Hang Sửng Sốt – Hà Nội", en: "Sung Sot Cave – Hanoi" },
          desc: { vi: "Tập Thái Cực trên boong lúc bình minh, tham quan hang Sửng Sốt, ăn trưa trên tàu rồi trở về Hà Nội.", en: "Tai chi on deck at sunrise, explore Sung Sot Cave, lunch on board, then return to Hanoi." }
        }
      ]
    },
    {
      id: "sapa-valley-3n2d",
      dest: "sapa", region: "north", type: ["nature", "adventure"], duration: 3,
      title: { vi: "Sa Pa & thung lũng Mường Hoa 3N2Đ", en: "Sapa & Muong Hoa Valley — 3D2N" },
      tagline: { vi: "Rừng mây, ruộng bậc thang và những bản làng mờ sương", en: "Cloud forests, rice terraces and misty villages" },
      price: 3590000, oldPrice: 3990000, rating: 4.8, reviews: 862, badge: "sale",
      img: "assets/img/sapa.jpg", gallery: ["assets/img/sapa.jpg", "assets/img/hagiang.jpg", "assets/img/dalat.jpg"],
      departure: { vi: "Hà Nội", en: "Hanoi" },
      group: { vi: "Tối đa 12 khách", en: "Max 12 guests" },
      highlights: [
        { vi: "Trek bản Tả Van – Giàng Tả Chải", en: "Trek Ta Van and Giang Ta Chai villages" },
        { vi: "Cáp treo chinh phục Fansipan", en: "Fansipan cable car ascent" },
        { vi: "Homestay ấm cúng của người Dao", en: "Cozy homestay with a Dao family" },
        { vi: "Chợ đêm và ẩm thực Sa Pa", en: "Sapa night market and local food" }
      ],
      itinerary: [
        {
          day: 1,
          title: { vi: "Hà Nội – Sa Pa – Bản Cát Cát", en: "Hanoi – Sapa – Cat Cat Village" },
          desc: { vi: "Di chuyển theo cao tốc, ăn trưa tại Sa Pa, chiều tham quan bản Cát Cát, tối tự do khám phá chợ đêm.", en: "Highway transfer, lunch in Sapa, afternoon visit to Cat Cat village, evening free to wander the night market." }
        },
        {
          day: 2,
          title: { vi: "Trek Mường Hoa – Tả Van", en: "Muong Hoa Valley – Ta Van Trek" },
          desc: { vi: "Trek xuyên thung lũng Mường Hoa, thăm bản Tả Van, ăn trưa cùng gia đình người Dao, tối nghỉ homestay.", en: "Trek through Muong Hoa valley, visit Ta Van village, lunch with a Dao family and a night at a homestay." }
        },
        {
          day: 3,
          title: { vi: "Fansipan – Hà Nội", en: "Fansipan – Hanoi" },
          desc: { vi: "Sáng cáp treo Fansipan, trưa mua sắm đặc sản, chiều về Hà Nội.", en: "Morning cable car to Fansipan, local produce shopping at noon, afternoon return to Hanoi." }
        }
      ]
    },
    {
      id: "hoian-lanterns-4n3d",
      dest: "hoian", region: "central", type: ["culture", "beach"], duration: 4,
      title: { vi: "Hội An – Đèn lồng & làng nghề 4N3Đ", en: "Hoi An Lanterns & Craft Villages — 4D3N" },
      tagline: { vi: "Đèn lồng, làng nghề và nhịp sống chậm bên sông Hoài", en: "Lanterns, craft villages and slow riverside living" },
      price: 4990000, oldPrice: null, rating: 4.9, reviews: 1105, badge: "bestseller",
      img: "assets/img/hoian.jpg", gallery: ["assets/img/hoian.jpg", "assets/img/hoian-rain.jpg", "assets/img/hue.jpg"],
      departure: { vi: "Đà Nẵng", en: "Da Nang" },
      group: { vi: "Tối đa 14 khách", en: "Max 14 guests" },
      highlights: [
        { vi: "Làm đèn lồng cùng nghệ nhân", en: "Lantern-making with local artisans" },
        { vi: "Phố cổ lúc hoàng hôn", en: "Old town at golden hour" },
        { vi: "Rừng dừa Bảy Mẫu", en: "Bay Mau coconut forest" },
        { vi: "Lớp nấu ăn Cao Lầu", en: "Cao Lau cooking class" }
      ],
      itinerary: [
        {
          day: 1,
          title: { vi: "Đà Nẵng – Hội An", en: "Da Nang – Hoi An" },
          desc: { vi: "Đón sân bay Đà Nẵng, nhận phòng, chiều đi bộ phố cổ, thả đèn hoa đăng trên sông Hoài.", en: "Airport pickup in Da Nang, check-in, afternoon walk through the old town, float lanterns on the Hoai River." }
        },
        {
          day: 2,
          title: { vi: "Lớp làm đèn lồng & làng nghề", en: "Lantern Workshop & Craft Villages" },
          desc: { vi: "Học làm đèn lồng cùng nghệ nhân, thăm làng mộc Kim Bồng, chiều thư giãn bên hồ.", en: "Learn lantern making with artisans, visit Kim Bong carpentry village, a relaxed afternoon by the river." }
        },
        {
          day: 3,
          title: { vi: "Rừng dừa Bảy Mẫu – An Bàng", en: "Bay Mau Forest – An Bang Beach" },
          desc: { vi: "Đi thuyền thúng rừng dừa, chiều tắm biển An Bàng, ăn tối hải sản.", en: "Basket boat ride in the coconut forest, afternoon swim at An Bang beach, seafood dinner." }
        },
        {
          day: 4,
          title: { vi: "Hội An – Đà Nẵng", en: "Hoi An – Da Nang" },
          desc: { vi: "Sáng tự do, thử nấu Cao Lầu, chiều đưa ra sân bay.", en: "Free morning, a Cao Lau cooking session, afternoon airport transfer." }
        }
      ]
    },
    {
      id: "hue-heritage-2n1d",
      dest: "hue", region: "central", type: ["culture"], duration: 2,
      title: { vi: "Di sản cố đô Huế 2N1Đ", en: "Imperial Hue Heritage — 2D1N" },
      tagline: { vi: "Một chuyến trở về triều Nguyễn giữa lòng cố đô", en: "A journey back to the Nguyen dynasty" },
      price: 2190000, oldPrice: null, rating: 4.7, reviews: 486, badge: "new",
      img: "assets/img/hue.jpg", gallery: ["assets/img/hue.jpg", "assets/img/hoian.jpg", "assets/img/danang.jpg"],
      departure: { vi: "Huế", en: "Hue" },
      group: { vi: "Tối đa 15 khách", en: "Max 15 guests" },
      highlights: [
        { vi: "Đại Nội & Ngọ Môn", en: "The Imperial City and Meridian Gate" },
        { vi: "Chùa Thiên Mụ", en: "Thien Mu Pagoda" },
        { vi: "Cơm cung đình", en: "Royal court cuisine" },
        { vi: "Ca Huế trên sông Hương", en: "Hue folk music on the Perfume River" }
      ],
      itinerary: [
        {
          day: 1,
          title: { vi: "Đại Nội – Chùa Thiên Mụ", en: "Imperial City – Thien Mu Pagoda" },
          desc: { vi: "Thăm Đại Nội, Ngọ Môn, điện Thái Hòa; chiều chùa Thiên Mụ, tối nghe ca Huế trên sông Hương.", en: "Explore the Imperial City, Meridian Gate and Thai Hoa Palace; afternoon at Thien Mu Pagoda; evening Hue folk music on the Perfume River." }
        },
        {
          day: 2,
          title: { vi: "Lăng Tự Đức – Cơm cung đình", en: "Tu Duc Tomb – Royal Cuisine" },
          desc: { vi: "Tham quan lăng Tự Đức, thưởng thức cơm cung đình, chiều kết thúc hành trình.", en: "Visit Tu Duc's tomb, enjoy a royal-style lunch, afternoon at leisure before departure." }
        }
      ]
    },
    {
      id: "danang-bana-3n2d",
      dest: "danang", region: "central", type: ["beach", "culture"], duration: 3,
      title: { vi: "Đà Nẵng – Bà Nà & biển Mỹ Khê 3N2Đ", en: "Da Nang – Ba Na Hills & My Khe — 3D2N" },
      tagline: { vi: "Cầu Vàng, bán đảo xanh và biển Mỹ Khê trong veo", en: "Golden Bridge, green peninsulas and My Khe beach" },
      price: 3290000, oldPrice: 3690000, rating: 4.8, reviews: 932, badge: "sale",
      img: "assets/img/danang.jpg", gallery: ["assets/img/danang.jpg", "assets/img/hue.jpg", "assets/img/hoian.jpg"],
      departure: { vi: "Đà Nẵng", en: "Da Nang" },
      group: { vi: "Tối đa 20 khách", en: "Max 20 guests" },
      highlights: [
        { vi: "Cầu Vàng trên đỉnh Bà Nà", en: "Golden Bridge atop Ba Na Hills" },
        { vi: "Bán đảo Sơn Trà", en: "Son Tra Peninsula" },
        { vi: "Biển Mỹ Khê", en: "My Khe Beach" },
        { vi: "Cầu Rồng phun lửa", en: "Dragon Bridge fire show" }
      ],
      itinerary: [
        {
          day: 1,
          title: { vi: "Đón – Biển Mỹ Khê", en: "Arrival – My Khe Beach" },
          desc: { vi: "Nhận phòng gần biển, chiều tự do tắm biển Mỹ Khê, tối ngắm cầu Rồng.", en: "Check in near the beach, afternoon swim at My Khe, evening at the Dragon Bridge." }
        },
        {
          day: 2,
          title: { vi: "Bà Nà Hills – Cầu Vàng", en: "Ba Na Hills – Golden Bridge" },
          desc: { vi: "Cáp treo lên Bà Nà, chụp ảnh Cầu Vàng, dạo vườn hoa Le Jardin, tối về phố.", en: "Cable car to Ba Na Hills, photos at the Golden Bridge, Le Jardin gardens, evening back in town." }
        },
        {
          day: 3,
          title: { vi: "Sơn Trà – Chợ Hàn", en: "Son Tra – Han Market" },
          desc: { vi: "Sáng bán đảo Sơn Trà, chùa Linh Ứng, chiều mua sắm chợ Hàn và ra sân bay.", en: "Morning on Son Tra Peninsula and Linh Ung Pagoda, afternoon shopping at Han Market and airport transfer." }
        }
      ]
    },
    {
      id: "phuquoc-island-4n3d",
      dest: "phuquoc", region: "south", type: ["beach", "luxury"], duration: 4,
      title: { vi: "Phú Quốc: Biển xanh & hoàng hôn 4N3Đ", en: "Phu Quoc Island Escape — 4D3N" },
      tagline: { vi: "Bãi cát trắng, san hô và hoàng hôn không vội vã", en: "White sand, coral reefs and unhurried sunsets" },
      price: 6490000, oldPrice: null, rating: 4.9, reviews: 743, badge: "private",
      img: "assets/img/phuquoc.jpg", gallery: ["assets/img/phuquoc.jpg", "assets/img/nhatrang.jpg", "assets/img/dalat.jpg"],
      departure: { vi: "Phú Quốc", en: "Phu Quoc" },
      group: { vi: "Tối đa 10 khách", en: "Max 10 guests" },
      highlights: [
        { vi: "Resort ven biển 5 sao", en: "Beachfront 5-star resort" },
        { vi: "Lặn ngắm san hô", en: "Coral reef snorkelling" },
        { vi: "Cáp treo Hòn Thơm", en: "Hon Thom cable car" },
        { vi: "Hoàng hôn bãi Sao", en: "Sunset at Sao Beach" }
      ],
      itinerary: [
        {
          day: 1,
          title: { vi: "Đón – Bãi Sao", en: "Arrival – Sao Beach" },
          desc: { vi: "Đón sân bay, nhận phòng resort, chiều tắm biển Bãi Sao, ngắm hoàng hôn.", en: "Airport pickup, resort check-in, afternoon swim at Sao Beach and sunset." }
        },
        {
          day: 2,
          title: { vi: "Lặn ngắm san hô 4 đảo", en: "Four-Island Snorkelling" },
          desc: { vi: "Tour thuyền 4 đảo, lặn ngắm san hô, ăn trưa trên đảo, chiều câu cá.", en: "Four-island boat tour, snorkelling, island lunch and afternoon fishing." }
        },
        {
          day: 3,
          title: { vi: "Cáp treo Hòn Thơm – Chợ đêm", en: "Hon Thom Cable Car – Night Market" },
          desc: { vi: "Trải nghiệm cáp treo vượt biển, công viên nước, tối chợ đêm Dinh Cậu.", en: "Cross-sea cable car, water park, evening at Dinh Cau night market." }
        },
        {
          day: 4,
          title: { vi: "Tự do – Tiễn sân bay", en: "Free Day – Departure" },
          desc: { vi: "Sáng tự do tại resort, trả phòng và ra sân bay.", en: "Free morning at the resort, check out and airport transfer." }
        }
      ]
    },
    {
      id: "nhatrang-bay-3n2d",
      dest: "nhatrang", region: "central", type: ["beach"], duration: 3,
      title: { vi: "Nha Trang – Vịnh Ninh Vân 3N2Đ", en: "Nha Trang Bay & Islands — 3D2N" },
      tagline: { vi: "Vịnh biển yên tĩnh và hải sản tươi rói", en: "Quiet bays and the freshest seafood" },
      price: 3890000, oldPrice: null, rating: 4.7, reviews: 615, badge: null,
      img: "assets/img/nhatrang.jpg", gallery: ["assets/img/nhatrang.jpg", "assets/img/phuquoc.jpg", "assets/img/danang.jpg"],
      departure: { vi: "Nha Trang", en: "Nha Trang" },
      group: { vi: "Tối đa 18 khách", en: "Max 18 guests" },
      highlights: [
        { vi: "Vịnh Ninh Vân yên tĩnh", en: "Tranquil Ninh Van Bay" },
        { vi: "Lặn biển tại Hòn Mun", en: "Snorkelling at Hon Mun" },
        { vi: "Tắm bùn khoáng", en: "Mineral mud bath" },
        { vi: "Hải sản tươi giá phải chăng", en: "Fresh, affordable seafood" }
      ],
      itinerary: [
        {
          day: 1,
          title: { vi: "Đón – Biển Nha Trang", en: "Arrival – Nha Trang Beach" },
          desc: { vi: "Nhận phòng, chiều tắm biển, tối dạo phố và ăn hải sản.", en: "Check in, afternoon swim, evening stroll and seafood dinner." }
        },
        {
          day: 2,
          title: { vi: "Vịnh Ninh Vân – Lặn biển", en: "Ninh Van Bay – Snorkelling" },
          desc: { vi: "Du thuyền vịnh Ninh Vân, lặn ngắm san hô Hòn Mun, chiều tắm bùn khoáng.", en: "Cruise through Ninh Van Bay, snorkel at Hon Mun, mineral mud bath in the afternoon." }
        },
        {
          day: 3,
          title: { vi: "Tháp Bà – Tiễn", en: "Po Nagar – Departure" },
          desc: { vi: "Thăm Tháp Bà Ponagar, chợ Đầm, chiều ra sân bay.", en: "Visit Po Nagar Cham Towers and Dam Market, afternoon airport transfer." }
        }
      ]
    },
    {
      id: "ninhbinh-day-1d",
      dest: "ninhbinh", region: "north", type: ["nature", "culture"], duration: 1,
      title: { vi: "Ninh Bình: Tràng An – Hang Múa 1 ngày", en: "Ninh Binh Day Trip — Trang An & Mua Cave" },
      tagline: { vi: "Non nước hữu tình chỉ cách Hà Nội hai giờ", en: "Postcard landscapes, two hours from Hanoi" },
      price: 890000, oldPrice: null, rating: 4.8, reviews: 1520, badge: "bestseller",
      img: "assets/img/ninhbinh.jpg", gallery: ["assets/img/ninhbinh.jpg", "assets/img/halong.jpg", "assets/img/hagiang.jpg"],
      departure: { vi: "Hà Nội", en: "Hanoi" },
      group: { vi: "Tối đa 20 khách", en: "Max 20 guests" },
      highlights: [
        { vi: "Thuyền nan xuyên Tràng An", en: "Bamboo boat through Trang An" },
        { vi: "Chinh phục 500 bậc Hang Múa", en: "Climb 500 steps at Mua Cave" },
        { vi: "Cố đô Hoa Lư", en: "Ancient Hoa Lu capital" },
        { vi: "Đạp xe làng quê", en: "Countryside cycling" }
      ],
      itinerary: [
        {
          day: 1,
          title: { vi: "Hà Nội – Tràng An – Hang Múa", en: "Hanoi – Trang An – Mua Cave" },
          desc: { vi: "Khởi hành sớm, thuyền nan Tràng An, ăn trưa đặc sản dê núi, chiều leo Hang Múa, về Hà Nội.", en: "Early departure, bamboo boat in Trang An, mountain goat lunch, afternoon climb at Mua Cave, return to Hanoi." }
        }
      ]
    },
    {
      id: "hagiang-loop-3n2d",
      dest: "hagiang", region: "north", type: ["adventure", "nature"], duration: 3,
      title: { vi: "Hà Giang Loop: Mã Pí Lèng huyền thoại 3N2Đ", en: "Ha Giang Loop — Legendary Ma Pi Leng 3D2N" },
      tagline: { vi: "Cung đường đẹp nhất Việt Nam, dành cho người ưa khám phá", en: "Vietnam's most spectacular road, for the curious" },
      price: 2990000, oldPrice: null, rating: 4.9, reviews: 389, badge: "new",
      img: "assets/img/hagiang.jpg", gallery: ["assets/img/hagiang.jpg", "assets/img/sapa.jpg", "assets/img/ninhbinh.jpg"],
      departure: { vi: "Hà Nội", en: "Hanoi" },
      group: { vi: "Tối đa 12 khách", en: "Max 12 guests" },
      highlights: [
        { vi: "Đèo Mã Pí Lèng", en: "Ma Pi Leng Pass" },
        { vi: "Thuyền sông Nho Quế", en: "Nho Que River boat ride" },
        { vi: "Homestay Lô Lô Chải", en: "Lo Lo Chai homestay" },
        { vi: "Cột cờ Lũng Cú", en: "Lung Cu Flag Tower" }
      ],
      itinerary: [
        {
          day: 1,
          title: { vi: "Hà Nội – Quản Bạ – Yên Minh", en: "Hanoi – Quan Ba – Yen Minh" },
          desc: { vi: "Xe limousine tới Hà Giang, thăm Cổng trời Quản Bạ, tối nghỉ tại Yên Minh.", en: "Limousine to Ha Giang, visit Quan Ba Heaven's Gate, overnight in Yen Minh." }
        },
        {
          day: 2,
          title: { vi: "Đồng Văn – Mã Pí Lèng", en: "Dong Van – Ma Pi Leng" },
          desc: { vi: "Khám phá cao nguyên đá, cột cờ Lũng Cú, đèo Mã Pí Lèng, thuyền sông Nho Quế, homestay Lô Lô Chải.", en: "Explore the karst plateau, Lung Cu Flag Tower, Ma Pi Leng Pass, Nho Que River boat ride and Lo Lo Chai homestay." }
        },
        {
          day: 3,
          title: { vi: "Mèo Vạc – Hà Nội", en: "Meo Vac – Hanoi" },
          desc: { vi: "Ghé chợ Mèo Vạc, về Hà Giang, chiều xe về Hà Nội.", en: "Visit Meo Vac market, return to Ha Giang, afternoon transfer to Hanoi." }
        }
      ]
    },
    {
      id: "mekong-delta-2n1d",
      dest: "mekong", region: "south", type: ["culture", "nature"], duration: 2,
      title: { vi: "Đồng bằng sông Cửu Long 2N1Đ", en: "Mekong Delta — Floating Markets 2D1N" },
      tagline: { vi: "Chợ nổi, miệt vườn và văn hóa miền sông nước", en: "Floating markets, orchards and river culture" },
      price: 1990000, oldPrice: 2390000, rating: 4.7, reviews: 274, badge: "sale",
      img: "assets/img/mekong.jpg", gallery: ["assets/img/mekong.jpg", "assets/img/dalat.jpg", "assets/img/hoian-rain.jpg"],
      departure: { vi: "TP. Hồ Chí Minh", en: "Ho Chi Minh City" },
      group: { vi: "Tối đa 16 khách", en: "Max 16 guests" },
      highlights: [
        { vi: "Chợ nổi Cái Răng", en: "Cai Rang floating market" },
        { vi: "Lò kẹo dừa & vườn trái cây", en: "Coconut candy workshop & orchards" },
        { vi: "Đờn ca tài tử", en: "Southern folk music" },
        { vi: "Xuồng ba lá rạch nhỏ", en: "Small-canal sampan rides" }
      ],
      itinerary: [
        {
          day: 1,
          title: { vi: "TP.HCM – Cần Thơ", en: "Ho Chi Minh City – Can Tho" },
          desc: { vi: "Xe tới Cần Thơ, thăm nhà cổ Bình Thủy, tối đờn ca tài tử trên sông.", en: "Drive to Can Tho, visit Binh Thuy ancient house, evening folk music on the river." }
        },
        {
          day: 2,
          title: { vi: "Chợ nổi Cái Răng – Miệt vườn", en: "Cai Rang Market – Orchards" },
          desc: { vi: "Sáng sớm thuyền chợ nổi, ghé lò kẹo dừa, vườn trái cây, chiều về TP.HCM.", en: "Early boat ride to the floating market, coconut candy workshop, fruit orchards, afternoon return to Saigon." }
        }
      ]
    },
    {
      id: "dalat-highlands-3n2d",
      dest: "dalat", region: "central", type: ["nature"], duration: 3,
      title: { vi: "Đà Lạt: Săn mây & thông reo 3N2Đ", en: "Da Lat Highlands — Cloud Hunting 3D2N" },
      tagline: { vi: "Săn mây, thông reo và những đồi cà phê", en: "Cloud hunting, pine forests and coffee hills" },
      price: 2790000, oldPrice: null, rating: 4.8, reviews: 528, badge: "new",
      img: "assets/img/dalat.jpg", gallery: ["assets/img/dalat.jpg", "assets/img/sapa.jpg", "assets/img/mekong.jpg"],
      departure: { vi: "TP. Hồ Chí Minh", en: "Ho Chi Minh City" },
      group: { vi: "Tối đa 14 khách", en: "Max 14 guests" },
      highlights: [
        { vi: "Săn mây đèo Mimosa", en: "Cloud hunting on Mimosa Pass" },
        { vi: "Hồ Tuyền Lâm", en: "Tuyen Lam Lake" },
        { vi: "Vườn hoa & cà phê", en: "Flower gardens and coffee farms" },
        { vi: "Chợ đêm Đà Lạt", en: "Da Lat night market" }
      ],
      itinerary: [
        {
          day: 1,
          title: { vi: "TP.HCM – Đà Lạt", en: "Ho Chi Minh City – Da Lat" },
          desc: { vi: "Di chuyển tới Đà Lạt, chiều tham quan hồ Xuân Hương, chợ đêm.", en: "Transfer to Da Lat, afternoon at Xuan Huong Lake, evening night market." }
        },
        {
          day: 2,
          title: { vi: "Săn mây – Hồ Tuyền Lâm", en: "Cloud Hunting – Tuyen Lam Lake" },
          desc: { vi: "Sáng sớm săn mây đèo Mimosa, tham quan thiền viện Trúc Lâm, chiều đạp xe quanh hồ.", en: "Early cloud hunt on Mimosa Pass, Truc Lam Zen Monastery, afternoon cycling around the lake." }
        },
        {
          day: 3,
          title: { vi: "Vườn hoa – Tiễn", en: "Flower Gardens – Departure" },
          desc: { vi: "Thăm vườn hoa thành phố, thưởng thức cà phê, chiều về lại TP.HCM.", en: "Visit the city flower gardens, local coffee tasting, afternoon return to Saigon." }
        }
      ]
    }
  ],

  testimonialList: [
    {
      name: "Sarah Mitchell", initials: "SM", color: "#dfe9df",
      role: { vi: "Du khách Úc · Tour Hà Giang", en: "Australia · Ha Giang Loop" },
      quote: { vi: "Hướng dẫn viên khiến chúng tôi cảm thấy như bạn bè. Bữa tối homestay là bữa ăn ngon nhất chuyến đi.", en: "Our guide made us feel like friends. The homestay dinner was the best meal of our trip." },
      rating: 5
    },
    {
      name: "Nguyễn Minh Anh", initials: "MA", color: "#f4e3d8",
      role: { vi: "Hà Nội · Tour Hội An", en: "Hanoi · Hoi An Lanterns" },
      quote: { vi: "Con gái mình vẫn nhắc mãi lớp làm đèn lồng. Chuyến đi riêng tư, rất nhẹ nhàng và chu đáo.", en: "My daughter still talks about the lantern-making class. A private, gentle and thoughtful trip." },
      rating: 5
    },
    {
      name: "Kenji Tanaka", initials: "KT", color: "#e3e0f0",
      role: { vi: "Nhật Bản · Tour Hạ Long", en: "Japan · Ha Long Bay" },
      quote: { vi: "Du thuyền riêng, không vội vã, cảnh đẹp khó tin. Liên lạc bằng tiếng Anh rất dễ dàng.", en: "Private cruise, no rush, unbelievable scenery. Communication in English was effortless." },
      rating: 5
    }
  ],

  includes: {
    vi: [
      "Xe đưa đón tận nơi theo lịch trình",
      "Hướng dẫn viên bản địa (Anh/Việt)",
      "Vé tham quan & hoạt động trong chương trình",
      "Bữa ăn theo chương trình",
      "Bảo hiểm du lịch & nước uống"
    ],
    en: [
      "Door-to-door transfers as per itinerary",
      "Local guide (English/Vietnamese)",
      "Entrance tickets and listed activities",
      "Meals as described in the itinerary",
      "Travel insurance and drinking water"
    ]
  },

  excludes: {
    vi: [
      "Vé máy bay/tàu (trừ khi có ghi chú)",
      "Chi phí cá nhân & đồ uống có cồn",
      "Tiền tip cho hướng dẫn viên và tài xế",
      "Phụ thu phòng đơn",
      "Hoạt động tự chọn ngoài chương trình"
    ],
    en: [
      "Flights or train tickets (unless stated)",
      "Personal expenses and alcoholic drinks",
      "Tips for guide and driver",
      "Single room supplement",
      "Optional activities not listed"
    ]
  },

  policies: {
    vi: [
      "Trẻ em dưới 5 tuổi đi cùng bố mẹ miễn phí; trẻ 5–10 tuổi tính 60% giá người lớn.",
      "Hủy trước 48 giờ: hoàn 100%. Hủy trong 24–48 giờ: hoàn 50%.",
      "Lịch trình có thể điều chỉnh linh hoạt vì lý do thời tiết để đảm bảo an toàn."
    ],
    en: [
      "Children under 5 travel free with parents; ages 5–10 pay 60% of the adult price.",
      "Cancel more than 48h ahead: full refund. 24–48h: 50% refund.",
      "Itineraries may be adjusted for weather and safety reasons."
    ]
  }
};
