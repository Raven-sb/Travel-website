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
    },
    {
      id: "central-vietnam-experience-6d",
      dest: "danang", region: "central", type: ["culture", "food"], duration: 6,
      title: { vi: "Trải nghiệm miền trung Việt Nam 6 ngày", en: "Central Vietnam Experience — 6 Days" },
      tagline: { vi: "Huế cố đô – Hải Vân – Ngũ Hành Sơn – Hội An đèn lồng, đón tiễn sân bay trọn gói", en: "Imperial Hue, Hai Van Pass, Marble Mountains and lantern-lit Hoi An, with private airport transfers" },
      price: 6900000, oldPrice: 7500000, rating: 4.9, reviews: 96, badge: "new",
      img: "assets/img/hue.jpg", gallery: ["assets/img/hue.jpg", "assets/img/danang.jpg", "assets/img/hoian.jpg"],
      departure: { vi: "Đón/tiễn sân bay Đà Nẵng hoặc Phú Bài (Huế)", en: "Pick-up & drop-off at Da Nang or Phu Bai (Hue) airport" },
      group: { vi: "Tour riêng 2–12 khách", en: "Private tour, 2–12 guests" },
      highlights: [
        { vi: "Xe riêng đón và tiễn sân bay theo giờ bay", en: "Private airport pick-up and drop-off timed to your flight" },
        { vi: "Đại Nội, chùa Thiên Mụ và lăng Tự Đức", en: "Imperial City, Thien Mu Pagoda and Tu Duc Tomb" },
        { vi: "Vượt Hải Vân Quan, ghé Ngũ Hành Sơn", en: "Cross Hai Van Pass and visit the Marble Mountains" },
        { vi: "Phố cổ Hội An & lớp nấu ăn rừng dừa Bảy Mẫu", en: "Hoi An old town and a cooking class in Bay Mau coconut forest" }
      ],
      itinerary: [
        {
          day: 1,
          title: { vi: "Đón sân bay – Về Huế", en: "Airport Pick-up – Hue" },
          desc: { vi: "Xe riêng đón tại sân bay Đà Nẵng hoặc Phú Bài, đưa về khách sạn ở Huế nhận phòng. Tối tự do dạo phố đêm, thử bún bò và chè Huế.", en: "Private pick-up at Da Nang or Phu Bai airport and transfer to your Hue hotel. Evening at leisure to explore the night market and try local bun bo and sweets." }
        },
        {
          day: 2,
          title: { vi: "Huế: Đại Nội – Thiên Mụ – Tự Đức", en: "Hue: Imperial City – Thien Mu – Tu Duc" },
          desc: { vi: "Tham quan Đại Nội, Ngọ Môn và điện Thái Hòa; ghé chùa Thiên Mụ bên sông Hương; chiều viếng lăng Tự Đức. Tối thưởng thức cơm cung đình hoặc ca Huế.", en: "Explore the Imperial City, Meridian Gate and Thai Hoa Palace; visit Thien Mu Pagoda by the Perfume River; afternoon at Tu Duc's tomb. Evening with royal cuisine or Hue folk music." }
        },
        {
          day: 3,
          title: { vi: "Huế – Hải Vân Quan – Ngũ Hành Sơn – Hội An", en: "Hue – Hai Van Gate – Marble Mountains – Hoi An" },
          desc: { vi: "Xe riêng vượt đèo Hải Vân, dừng chụp ảnh cổng trời Hải Vân Quan, ghé Ngũ Hành Sơn khám phá động Huyền Không. Chiều về Hội An nhận phòng, tối thả đèn hoa đăng.", en: "Private transfer over Hai Van Pass with a stop at Hai Van Gate, then explore the caves of Marble Mountains. Arrive in Hoi An in the afternoon; float lanterns on the Hoai River at night." }
        },
        {
          day: 4,
          title: { vi: "Phố cổ Hội An – Rừng dừa Bảy Mẫu", en: "Hoi An Old Town – Bay Mau Coconut Forest" },
          desc: { vi: "Sáng đi bộ phố cổ, chùa Cầu và nhà cổ Phùng Hưng. Chiều đi thuyền thúng rừng dừa Bảy Mẫu và học nấu ăn cùng đầu bếp bản địa, thưởng thức chính món mình làm.", en: "Morning walk through the old town, Japanese Covered Bridge and Phung Hung old house. Afternoon basket-boat ride in Bay Mau coconut forest and a hands-on cooking class with a local chef." }
        },
        {
          day: 5,
          title: { vi: "Ngày tự do tại Hội An", en: "Free Day in Hoi An" },
          desc: { vi: "Tự do tắm biển An Bàng, đạp xe về làng mộc Kim Bồng, học làm đèn lồng hoặc thư giãn bên sông Hoài.", en: "Free day to swim at An Bang beach, cycle to Kim Bong carpentry village, try lantern making or simply relax by the Hoai River." }
        },
        {
          day: 6,
          title: { vi: "Hội An – Tiễn sân bay", en: "Hoi An – Airport Drop-off" },
          desc: { vi: "Trả phòng, xe riêng đưa ra sân bay Đà Nẵng hoặc Phú Bài theo giờ bay. Kết thúc hành trình.", en: "Check out and private transfer to Da Nang or Phu Bai airport according to your flight time. End of trip." }
        }
      ]
    },
    {
      id: "hue-imperial-day-1d",
      dest: "hue", region: "central", type: ["culture"], duration: 1,
      title: { vi: "Huế 1 ngày: Đại Nội – Thiên Mụ – Lăng Tự Đức", en: "Hue in a Day: Imperial City – Thien Mu – Tu Duc" },
      tagline: { vi: "Ba di sản triều Nguyễn trong một ngày trọn vẹn", en: "Three Nguyen-dynasty treasures in one complete day" },
      price: 790000, oldPrice: null, rating: 4.9, reviews: 214, badge: "bestseller",
      img: "assets/img/hue.jpg", gallery: ["assets/img/hue.jpg", "assets/img/hoian.jpg", "assets/img/danang.jpg"],
      departure: { vi: "Huế (đón tại khách sạn)", en: "Hue (hotel pick-up)" },
      group: { vi: "Tối đa 12 khách", en: "Max 12 guests" },
      highlights: [
        { vi: "Đại Nội & Ngọ Môn", en: "Imperial City and Meridian Gate" },
        { vi: "Chùa Thiên Mụ bên sông Hương", en: "Thien Mu Pagoda on the Perfume River" },
        { vi: "Lăng Tự Đức", en: "Tu Duc Royal Tomb" },
        { vi: "Tùy chọn cơm cung đình", en: "Optional royal court lunch" }
      ],
      itinerary: [
        {
          day: 1,
          title: { vi: "Huế: Đại Nội – Thiên Mụ – Tự Đức", en: "Hue: Imperial City – Thien Mu – Tu Duc" },
          desc: { vi: "08:00 đón tại khách sạn, tham quan Đại Nội, chùa Thiên Mụ, ăn trưa cơm âm phủ hoặc cơm cung đình, chiều viếng lăng Tự Đức, 17:00 kết thúc tại Huế.", en: "08:00 hotel pick-up, visit the Imperial City and Thien Mu Pagoda, royal-style lunch, afternoon at Tu Duc's tomb, finishing in Hue around 17:00." }
        }
      ]
    },
    {
      id: "hue-phubai-transfer",
      dest: "hue", region: "central", type: ["transfer"], duration: 1,
      title: { vi: "Đón/tiễn sân bay Phú Bài – Huế", en: "Phu Bai Airport Transfer – Hue" },
      tagline: { vi: "Xe riêng đúng giờ, tài xế đón có biển tên", en: "On-time private car with a name-sign pick-up" },
      price: 350000, oldPrice: null, rating: 4.8, reviews: 168, badge: null,
      img: "assets/img/hue.jpg", gallery: ["assets/img/hue.jpg", "assets/img/hoian.jpg"],
      departure: { vi: "Sân bay Phú Bài / khách sạn Huế", en: "Phu Bai Airport / Hue hotel" },
      group: { vi: "Tối đa 4 khách", en: "Max 4 guests" },
      highlights: [
        { vi: "Đón chuyến bay thực tế, chờ 60 phút", en: "Flight tracking with 60 minutes of waiting time" },
        { vi: "Xe riêng đời mới, hành lý thoải mái", en: "Modern private car with ample luggage space" },
        { vi: "Tài xế hỗ trợ tiếng Anh cơ bản", en: "Driver with basic English support" },
        { vi: "Đặt nhanh, xác nhận ngay", en: "Quick booking, instant confirmation" }
      ],
      itinerary: [
        {
          day: 1,
          title: { vi: "Sân bay Phú Bài – Huế", en: "Phu Bai Airport – Hue" },
          desc: { vi: "Tài xế đón tại sân bay Phú Bài hoặc khách sạn, đưa trực tiếp về Huế (khoảng 30 phút). Có thể đặt chiều ngược lại hoặc ghé Đại Nội trên đường.", en: "Pick-up at Phu Bai airport or your hotel, direct transfer to Hue (about 30 minutes). Also available in reverse, with an optional stop at the Imperial City." }
        }
      ]
    },
    {
      id: "hue-royal-dinner",
      dest: "hue", region: "central", type: ["food", "culture"], duration: 1,
      title: { vi: "Tối Huế: Cơm cung đình & Ca Huế sông Hương", en: "Hue Evening: Royal Dinner & Perfume River Music" },
      tagline: { vi: "Hương vị triều Nguyễn và âm văn cổ trên dòng sông Hương", en: "Nguyen-dynasty flavours and ancient music on the Perfume River" },
      price: 690000, oldPrice: null, rating: 4.8, reviews: 132, badge: "new",
      img: "assets/img/hue.jpg", gallery: ["assets/img/hue.jpg", "assets/img/hoian-rain.jpg"],
      departure: { vi: "Huế", en: "Hue" },
      group: { vi: "Tối đa 10 khách", en: "Max 10 guests" },
      highlights: [
        { vi: "Thực đơn cơm cung đình Huế", en: "Hue royal court dinner menu" },
        { vi: "Nghe ca Huế trên sông Hương", en: "Hue folk music on the Perfume River" },
        { vi: "Ngắm chùa Thiên Mụ lúc hoàng hôn", en: "Thien Mu Pagoda at sunset" },
        { vi: "Đón trả tại khách sạn trung tâm Huế", en: "Pick-up and drop-off at central Hue hotels" }
      ],
      itinerary: [
        {
          day: 1,
          title: { vi: "Cơm cung đình – Ca Huế", en: "Royal Dinner – Hue Folk Music" },
          desc: { vi: "17:30 đón tại khách sạn, ăn tối cơm cung đình, 19:30 lên thuyền nghe ca Huế trên sông Hương, ngắm Thiên Mụ về đêm, 21:00 tiễn về khách sạn.", en: "17:30 hotel pick-up, royal court dinner, 19:30 board a boat for Hue folk music on the Perfume River and views of Thien Mu by night, back at your hotel by 21:00." }
        }
      ]
    },
    {
      id: "danang-golden-bridge-day-1d",
      dest: "danang", region: "central", type: ["culture", "nature"], duration: 1,
      title: { vi: "Bà Nà Hills & Cầu Vàng 1 ngày", en: "Ba Na Hills & Golden Bridge Day Tour" },
      tagline: { vi: "Cầu Vàng, làng Pháp và cáp treo đỉnh Chúa", en: "Golden Bridge, a French village and a cable car to the summit" },
      price: 1350000, oldPrice: 1550000, rating: 4.9, reviews: 1420, badge: "bestseller",
      img: "assets/img/danang.jpg", gallery: ["assets/img/danang.jpg", "assets/img/hue.jpg", "assets/img/hero.jpg"],
      departure: { vi: "Đà Nẵng", en: "Da Nang" },
      group: { vi: "Tối đa 20 khách", en: "Max 20 guests" },
      highlights: [
        { vi: "Cáp treo Bà Nà kỷ lục Guinness", en: "Guinness-recorded Ba Na cable car" },
        { vi: "Check-in Cầu Vàng", en: "Photos at the iconic Golden Bridge" },
        { vi: "Làng Pháp & vườn hoa Le Jardin", en: "French Village and Le Jardin gardens" },
        { vi: "Buffet trưa tại chân núi", en: "Lunch buffet at the mountain base" }
      ],
      itinerary: [
        {
          day: 1,
          title: { vi: "Đà Nẵng – Bà Nà Hills – Đà Nẵng", en: "Da Nang – Ba Na Hills – Da Nang" },
          desc: { vi: "07:30 đón tại khách sạn, cáp treo lên Bà Nà, chụp Cầu Vàng, dạo Làng Pháp và vườn hoa, ăn trưa buffet, 16:30 về lại Đà Nẵng.", en: "07:30 hotel pick-up, cable car to Ba Na Hills, Golden Bridge photos, French Village and gardens, lunch buffet, back in Da Nang by 16:30." }
        }
      ]
    },
    {
      id: "danang-airport-transfer",
      dest: "danang", region: "central", type: ["transfer"], duration: 1,
      title: { vi: "Đón/tiễn sân bay Đà Nẵng", en: "Da Nang Airport Transfer" },
      tagline: { vi: "Từ sân bay đến Mỹ Khê chỉ 15 phút, không phải chờ", en: "From the airport to My Khe in 15 minutes, no waiting" },
      price: 320000, oldPrice: null, rating: 4.9, reviews: 356, badge: null,
      img: "assets/img/danang.jpg", gallery: ["assets/img/danang.jpg", "assets/img/hoian.jpg"],
      departure: { vi: "Sân bay Đà Nẵng / khách sạn", en: "Da Nang Airport / hotel" },
      group: { vi: "Tối đa 4 khách", en: "Max 4 guests" },
      highlights: [
        { vi: "Tài xế chờ sẵn có biển tên", en: "Driver waiting with a name sign" },
        { vi: "Theo dõi chuyến bay, chờ 60 phút", en: "Flight tracking, 60 minutes of free waiting" },
        { vi: "Xe riêng, không ghép đoàn", en: "Private car, no sharing" },
        { vi: "Đặt cho cả chiều đi lẫn chiều về", en: "Book one way or round trip" }
      ],
      itinerary: [
        {
          day: 1,
          title: { vi: "Sân bay Đà Nẵng – Mỹ Khê", en: "Da Nang Airport – My Khe" },
          desc: { vi: "Đón tại cổng A1/A2 sân bay Đà Nẵng, đưa về khách sạn ven biển Mỹ Khê hoặc trung tâm thành phố. Nhận xe tiễn sân bay theo giờ bay.", en: "Meet at Da Nang airport Gate A1/A2 and transfer to a My Khe beach hotel or the city centre. Departure transfers are timed to your flight." }
        }
      ]
    },
    {
      id: "central-private-transfer",
      dest: "danang", region: "central", type: ["transfer", "culture"], duration: 1,
      title: { vi: "Transfer Huế – Hội An qua Hải Vân & Ngũ Hành Sơn", en: "Hue – Hoi An Private Transfer via Hai Van & Marble Mountains" },
      tagline: { vi: "Đi lại là một phần của chuyến đi: đèo Hải Vân, động Huyền Không, biển Đà Nẵng", en: "The journey is part of the trip: Hai Van Pass, Marble Mountains and Da Nang beaches" },
      price: 1150000, oldPrice: null, rating: 4.9, reviews: 203, badge: "new",
      img: "assets/img/danang.jpg", gallery: ["assets/img/danang.jpg", "assets/img/hue.jpg", "assets/img/hoian.jpg"],
      departure: { vi: "Huế / Đà Nẵng / Hội An", en: "Hue / Da Nang / Hoi An" },
      group: { vi: "Tối đa 4 khách (xe riêng)", en: "Max 4 guests (private car)" },
      highlights: [
        { vi: "Đèo Hải Vân – một trong những cung đường đẹp nhất thế giới", en: "Hai Van Pass, one of the world's most scenic roads" },
        { vi: "Dừng chụp cổng trời Hải Vân Quan", en: "Photo stop at Hai Van Gate" },
        { vi: "Ngũ Hành Sơn & động Huyền Không", en: "Marble Mountains and Huyen Khong Cave" },
        { vi: "Tùy chọn ghé bán đảo Sơn Trà hoặc biển Mỹ Khê", en: "Optional stop at Son Tra Peninsula or My Khe Beach" }
      ],
      itinerary: [
        {
          day: 1,
          title: { vi: "Huế – Hải Vân – Ngũ Hành Sơn – Hội An", en: "Hue – Hai Van – Marble Mountains – Hoi An" },
          desc: { vi: "08:00 đón tại Huế, vượt đèo Hải Vân với các điểm dừng chụp ảnh, ghé Ngũ Hành Sơn, ăn trưa tại Đà Nẵng, chiều đến Hội An. Nhận xe ngược chiều nếu cần.", en: "08:00 pick-up in Hue, cross Hai Van Pass with photo stops, visit Marble Mountains, lunch in Da Nang and arrive in Hoi An in the afternoon. Reverse direction available." }
        }
      ]
    },
    {
      id: "danang-seafood-dinner",
      dest: "danang", region: "central", type: ["food"], duration: 1,
      title: { vi: "Tối Đà Nẵng: Hải sản Mỹ Khê & Cầu Rồng", en: "Da Nang Evening: My Khe Seafood & Dragon Bridge" },
      tagline: { vi: "Hải sản tươi rói, biển đêm và cầu Rồng phun lửa", en: "Fresh seafood, a night beach and the fire-breathing Dragon Bridge" },
      price: 590000, oldPrice: null, rating: 4.8, reviews: 287, badge: "new",
      img: "assets/img/danang.jpg", gallery: ["assets/img/danang.jpg", "assets/img/hero.jpg"],
      departure: { vi: "Đà Nẵng", en: "Da Nang" },
      group: { vi: "Tối đa 10 khách", en: "Max 10 guests" },
      highlights: [
        { vi: "Nhà hàng hải sản ven biển Mỹ Khê", en: "Seafood restaurant by My Khe Beach" },
        { vi: "Tùy chọn món theo khẩu vị, có hướng dẫn viên", en: "Dishes chosen to your taste with a guide" },
        { vi: "Dạo biển đêm Mỹ Khê", en: "Evening walk on My Khe beach" },
        { vi: "Xem Cầu Rồng phun lửa cuối tuần", en: "Watch the Dragon Bridge fire show on weekends" }
      ],
      itinerary: [
        {
          day: 1,
          title: { vi: "Mỹ Khê – Cầu Rồng", en: "My Khe – Dragon Bridge" },
          desc: { vi: "18:00 đón tại khách sạn, ăn tối hải sản ven biển Mỹ Khê, dạo biển đêm, 20:00 đi xem Cầu Rồng phun lửa (tối Thứ 7–CN), tiễn về khách sạn.", en: "18:00 hotel pick-up, seafood dinner by My Khe Beach, an evening beach walk, then the Dragon Bridge fire show on Saturday and Sunday nights, and drop-off at your hotel." }
        }
      ]
    },
    {
      id: "hoian-ancient-cooking-day-1d",
      dest: "hoian", region: "central", type: ["culture", "food"], duration: 1,
      title: { vi: "Hội An 1 ngày: Phố cổ & Nấu ăn rừng dừa Bảy Mẫu", en: "Hoi An in a Day: Old Town & Bay Mau Cooking Class" },
      tagline: { vi: "Đi bộ phố cổ, đi thuyền thúng và tự tay nấu món Hội An", en: "Old town walks, basket boats and cooking Hoi An dishes yourself" },
      price: 990000, oldPrice: 1150000, rating: 4.9, reviews: 864, badge: "bestseller",
      img: "assets/img/hoian.jpg", gallery: ["assets/img/hoian.jpg", "assets/img/hoian-rain.jpg", "assets/img/danang.jpg"],
      departure: { vi: "Hội An", en: "Hoi An" },
      group: { vi: "Tối đa 12 khách", en: "Max 12 guests" },
      highlights: [
        { vi: "Phố cổ, chùa Cầu, nhà cổ Phùng Hưng", en: "Old town, Japanese Covered Bridge and Phung Hung House" },
        { vi: "Thuyền thúng rừng dừa Bảy Mẫu", en: "Basket-boat ride in Bay Mau coconut forest" },
        { vi: "Lớp nấu ăn cùng đầu bếp bản địa", en: "Hands-on class with a local chef" },
        { vi: "Thưởng thức Cao Lầu & bánh xèo tự làm", en: "Eat the Cao Lau and banh xeo you make" }
      ],
      itinerary: [
        {
          day: 1,
          title: { vi: "Phố cổ – Rừng dừa – Lớp nấu ăn", en: "Old Town – Coconut Forest – Cooking Class" },
          desc: { vi: "08:30 đón tại khách sạn, đi bộ phố cổ và chùa Cầu; 10:30 đi thuyền thúng rừng dừa Bảy Mẫu; 11:30 học nấu Cao Lầu, bánh xèo và gỏi cuốn, ăn trưa chính món mình làm; chiều tự do, thả đèn sông Hoài.", en: "08:30 hotel pick-up and old town walk with the Japanese Covered Bridge; 10:30 basket boats in Bay Mau coconut forest; 11:30 cooking class for Cao Lau, banh xeo and fresh rolls, followed by lunch; free afternoon and lantern floating on the Hoai River." }
        }
      ]
    },
    {
      id: "hoian-airport-transfer",
      dest: "hoian", region: "central", type: ["transfer"], duration: 1,
      title: { vi: "Đón/tiễn sân bay Đà Nẵng – Hội An", en: "Da Nang Airport – Hoi An Transfer" },
      tagline: { vi: "Xe riêng đưa bạn thẳng đến phố cổ, dừng nghỉ ngắm biển nếu muốn", en: "A private ride straight to the old town, with an optional beach stop" },
      price: 480000, oldPrice: null, rating: 4.9, reviews: 612, badge: null,
      img: "assets/img/hoian.jpg", gallery: ["assets/img/hoian.jpg", "assets/img/danang.jpg"],
      departure: { vi: "Sân bay Đà Nẵng / Hội An", en: "Da Nang Airport / Hoi An" },
      group: { vi: "Tối đa 4 khách", en: "Max 4 guests" },
      highlights: [
        { vi: "Hành trình ~45 phút qua biển Mỹ Khê", en: "Around 45 minutes via My Khe Beach" },
        { vi: "Đón chuyến bay, chờ 60 phút miễn phí", en: "Flight tracking with 60 minutes of free waiting" },
        { vi: "Tùy chọn ghé Ngũ Hành Sơn hoặc chợ Hàn", en: "Optional stop at Marble Mountains or Han Market" },
        { vi: "Tiễn sân bay theo giờ bay", en: "Airport drop-off timed to your flight" }
      ],
      itinerary: [
        {
          day: 1,
          title: { vi: "Sân bay Đà Nẵng – Hội An", en: "Da Nang Airport – Hoi An" },
          desc: { vi: "Tài xế đón tại sân bay, đi theo cung đường ven biển về Hội An (~45 phút), có thể dừng chụp ảnh biển Mỹ Khê hoặc ghé Ngũ Hành Sơn. Chiều về đón tại khách sạn tiễn ra sân bay.", en: "Meet at the airport and take the coastal route to Hoi An (about 45 minutes), with an optional stop at My Khe Beach or Marble Mountains. Return transfer available from your hotel." }
        }
      ]
    },
    {
      id: "hoian-lantern-dinner",
      dest: "hoian", region: "central", type: ["food", "culture"], duration: 1,
      title: { vi: "Tối Hội An: Ẩm thực phố cổ & Thả đèn sông Hoài", en: "Hoi An Evening: Old Town Flavours & Lantern Floating" },
      tagline: { vi: "Cao Lầu, đèn lồng và phố cổ lên đèn", en: "Cao Lau, lanterns and an old town glowing at night" },
      price: 550000, oldPrice: null, rating: 4.9, reviews: 508, badge: "new",
      img: "assets/img/hoian-rain.jpg", gallery: ["assets/img/hoian-rain.jpg", "assets/img/hoian.jpg"],
      departure: { vi: "Hội An", en: "Hoi An" },
      group: { vi: "Tối đa 10 khách", en: "Max 10 guests" },
      highlights: [
        { vi: "Ăn tối Cao Lầu, bánh bao bánh vạc tại phố cổ", en: "Dinner on Cao Lau and local specialities in the old town" },
        { vi: "Dạo phố đèn lồng, chùa Cầu về đêm", en: "Walk the lantern-lit streets and Japanese Covered Bridge" },
        { vi: "Thả đèn hoa đăng trên sông Hoài", en: "Float a lantern on the Hoai River" },
        { vi: "Tùy chọn xem Hội An Memories Show", en: "Optional Hoi An Memories Show tickets" }
      ],
      itinerary: [
        {
          day: 1,
          title: { vi: "Ăn tối phố cổ – Thả đèn sông Hoài", en: "Old Town Dinner – Lantern Floating" },
          desc: { vi: "18:00 đón tại khách sạn, ăn tối các món đặc sản Hội An, dạo phố cổ lên đèn, chụp ảnh chùa Cầu, 20:00 thả đèn hoa đăng trên sông Hoài, 21:00 tiễn về khách sạn.", en: "18:00 hotel pick-up, dinner on Hoi An specialities, a walk through the lantern-lit old town and photos at the Japanese Covered Bridge, 20:00 lantern floating on the Hoai River, back at your hotel by 21:00." }
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
