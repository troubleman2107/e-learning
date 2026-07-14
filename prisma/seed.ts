import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("🌱 Seeding categories and courses...\n");

  /* ─── Categories ─────────────────────────────────────────── */

  const categories = [
    { name: "Thu nhập thụ động", slug: "thu-nhap-thu-dong" },
    { name: "Kinh Doanh & Marketing thực chiến", slug: "kinh-doanh-marketing" },
    { name: "Ứng dụng AI", slug: "ung-dung-ai" },
    { name: "Thể hình", slug: "the-hinh" },
  ];

  const categoryRecords: Record<string, string> = {};

  for (const cat of categories) {
    const record = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name },
      create: { name: cat.name, slug: cat.slug },
    });
    categoryRecords[cat.slug] = record.id;
    console.log(`  ✅ Category: ${cat.name} (${record.id})`);
  }

  /* ─── Authors ────────────────────────────────────────────── */

  const authorsData = [
    {
      slug: "ung-dung-ai",
      name: "Dr. Hoàng Minh",
      title: "AI Specialist & Researcher",
      bio: "Tiến sĩ Khoa học Máy tính chuyên ngành Trí tuệ Nhân tạo. Anh có hơn 10 năm kinh nghiệm nghiên cứu và phát triển các hệ thống AI tại Singapore và Việt Nam. Hiện tại anh là cố vấn công nghệ cho nhiều start-up công nghệ lớn.",
      details: "Hoàng Minh là một trong những chuyên gia đi đầu trong việc phổ cập ứng dụng AI vào công việc hàng ngày tại Việt Nam. Các khóa học của anh luôn hướng đến tính ứng dụng cao, giúp học viên giải quyết trực tiếp các bài toán thực tế mà không cần kiến thức code chuyên sâu.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      rating: "4.9",
    },
    {
      slug: "kinh-doanh-marketing",
      name: "Nguyễn Duy Linh",
      title: "Marketing Director @ Retail Chain",
      bio: "Chuyên gia Marketing với 12 năm thực chiến tại các tập đoàn bán lẻ lớn tại Việt Nam. Anh từng trực tiếp tối ưu ngân sách quảng cáo hàng triệu USD và xây dựng hệ thống bán hàng đa kênh hiệu suất cao.",
      details: "Nguyễn Duy Linh nổi tiếng với phong cách giảng dạy trực diện, lấy số liệu làm thước đo hiệu quả. Anh tập trung hướng dẫn học viên các bước thực hiện chi tiết (step-by-step) để đạt được mục tiêu doanh số nhanh nhất.",
      image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
      rating: "4.8",
    },
    {
      slug: "the-hinh",
      name: "Coach Lê Nam",
      title: "Expert Fitness Coach & Nutritionist",
      bio: "Huấn luyện viên thể hình cá nhân được chứng nhận quốc tế (NASM-CPT) với hơn 8 năm kinh nghiệm thay đổi vóc dáng cho hàng nghìn học viên. Anh cũng là một Content Creator nổi tiếng trong lĩnh vực sức khỏe.",
      details: "Lê Nam tin vào phương pháp tập luyện và dinh dưỡng dựa trên khoa học (Evidence-Based). Khóa học của anh không chỉ hướng dẫn động tác mà còn giúp học viên hiểu rõ nguyên lý hoạt động của cơ thể để tự làm chủ lộ trình tập luyện của mình.",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      rating: "4.9",
    },
    {
      slug: "thu-nhap-thu-dong",
      name: "Trần Minh Nam",
      title: "Full-Stack Engineer & Solopreneur",
      bio: "Kỹ sư phần mềm và nhà sáng lập doanh nghiệp 1 người. Anh đã xây dựng thành công 3 sản phẩm SaaS có doanh thu ổn định và có nhiều năm kinh nghiệm tự do tài chính, làm việc từ xa.",
      details: "Trần Minh Nam hướng dẫn học viên cách tận dụng công nghệ để giải phóng sức lao động, tự xây dựng hệ thống kinh doanh tự động hóa. Anh chú trọng chia sẻ các case-study thực tế từ chính hành trình xây dựng sự nghiệp của mình.",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
      rating: "4.9",
    },
  ];

  const authorRecords: Record<string, string> = {};

  for (const author of authorsData) {
    const existingAuthor = await prisma.author.findFirst({
      where: { name: author.name },
    });
    if (existingAuthor) {
      authorRecords[author.slug] = existingAuthor.id;
      console.log(`  ⏭️ Author already exists: ${author.name}`);
    } else {
      const record = await prisma.author.create({
        data: {
          name: author.name,
          title: author.title,
          bio: author.bio,
          details: author.details,
          image: author.image,
          rating: author.rating,
        },
      });
      authorRecords[author.slug] = record.id;
      console.log(`  ✅ Author: ${author.name} (${record.id})`);
    }
  }

  /* ─── Courses ────────────────────────────────────────────── */

  const coursesData = [
    // ── Thu nhập thụ động ──
    {
      title: "Khóa Học Google Omni Hải Nghiệm – Coaching Online K06.2026",
      description:
        "Bứt phá quy trình dẫn đầu làn sóng AI với Google Omni. Hệ thống coaching online toàn diện giúp bạn xây dựng thu nhập thụ động bền vững từ nền tảng Google.",
      price: 100000,
      trailerUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      categorySlug: "thu-nhap-thu-dong",
    },
    {
      title: "Khóa Học Xây Dựng Thương Hiệu Cá Nhân Bán Hàng Affiliate Hiệu Quả 2026",
      description:
        "Học cách xây dựng thương hiệu cá nhân mạnh mẽ để bán hàng Affiliate hiệu quả. Từ chiến lược nội dung đến tối ưu chuyển đổi, tất cả đều được hướng dẫn chi tiết.",
      price: 100000,
      trailerUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      categorySlug: "thu-nhap-thu-dong",
    },
    {
      title: "Khóa Học Biến Video Thành Tài Sản Cùng Minhtanacademy",
      description:
        "Biến mỗi video bạn tạo ra thành một tài sản sinh lời. Học cách tối ưu nội dung video để tạo thu nhập thụ động từ YouTube, TikTok và các nền tảng khác.",
      price: 99000,
      trailerUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      categorySlug: "thu-nhap-thu-dong",
    },
    {
      title: "Khóa Học Thực Chiến Solopreneur Doanh Nghiệp 1 Người Cùng Tuấn Hà Vinalink",
      description:
        "Xây dựng doanh nghiệp 1 người với doanh thu hàng tỷ. Học từ chuyên gia Tuấn Hà Vinalink cách vận hành, marketing và scale business hiệu quả mà không cần nhân sự.",
      price: 199000,
      trailerUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      categorySlug: "thu-nhap-thu-dong",
    },
    {
      title: "Khóa Học Dropshipping A-Z: Bán Hàng Không Cần Vốn",
      description:
        "Khởi nghiệp dropshipping từ con số 0. Tìm sản phẩm winning, setup store Shopify/TikTok Shop, chạy ads và scale lên 6 con số chỉ trong 90 ngày.",
      price: 149000,
      trailerUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      categorySlug: "thu-nhap-thu-dong",
    },

    // ── Kinh Doanh & Marketing thực chiến ──
    {
      title: "Khóa Học Xây Dựng Chuỗi Bán Lẻ Vận Hành Trơn Tru, Hiệu Suất Cao Cùng Nguyễn Duy Linh",
      description:
        "Bí quyết xây dựng và vận hành chuỗi bán lẻ đạt hiệu suất cao nhất. Từ quản lý kho, nhân sự đến chiến lược mở rộng chuỗi bài bản và bền vững.",
      price: 299000,
      trailerUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      categorySlug: "kinh-doanh-marketing",
    },
    {
      title: "Khóa Học AI Google Marketing Thực Chiến Tại Guru",
      description:
        "Ứng dụng AI vào Google Ads từ A-Z. Tối ưu chiến dịch quảng cáo, nghiên cứu từ khóa bằng AI và tăng trưởng doanh thu thực sự với Google Marketing.",
      price: 299000,
      trailerUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      categorySlug: "kinh-doanh-marketing",
    },
    {
      title: "Khóa Học AI Facebook Marketing Cùng Guru.edu.vn",
      description:
        "Làm chủ Facebook Ads từ A-Z với công nghệ AI. Tăng đơn hàng bằng AI targeting, tự động hóa chiến dịch quảng cáo và scale doanh thu lên 128%.",
      price: 299000,
      trailerUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      categorySlug: "kinh-doanh-marketing",
    },
    {
      title: "Khóa Học Content Marketing: Viết Bài Bán Hàng Triệu View",
      description:
        "Học cách viết content marketing thu hút hàng triệu lượt xem và chuyển đổi thành doanh thu thực tế. Áp dụng công thức AIDA, storytelling và SEO content.",
      price: 199000,
      trailerUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      categorySlug: "kinh-doanh-marketing",
    },
    {
      title: "Khóa Học TikTok Shop: Từ 0 Đến Triệu Đơn",
      description:
        "Chiến lược bán hàng trên TikTok Shop hiệu quả nhất 2026. Từ setup shop, tạo video viral, livestream bán hàng đến tối ưu vận đơn và chăm sóc khách hàng.",
      price: 249000,
      trailerUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      categorySlug: "kinh-doanh-marketing",
    },

    // ── Ứng dụng AI ──
    {
      title: "Khóa Học ChatGPT & AI Toàn Diện Cho Người Đi Làm",
      description:
        "Tăng năng suất làm việc gấp 10 lần với ChatGPT và các công cụ AI. Từ viết email, phân tích dữ liệu, tạo báo cáo đến tự động hóa quy trình công việc.",
      price: 199000,
      trailerUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      categorySlug: "ung-dung-ai",
    },
    {
      title: "Khóa Học Tạo Video AI Chuyên Nghiệp Với Runway & Sora",
      description:
        "Làm chủ công nghệ tạo video bằng AI. Sử dụng Runway ML, Sora và các công cụ AI tiên tiến để sản xuất video chuyên nghiệp mà không cần kỹ năng dựng phim.",
      price: 249000,
      trailerUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      categorySlug: "ung-dung-ai",
    },
    {
      title: "Khóa Học Thiết Kế Đồ Họa AI Với Midjourney & Canva",
      description:
        "Tạo thiết kế đồ họa chuyên nghiệp bằng AI. Học cách sử dụng Midjourney để tạo hình ảnh và Canva AI để thiết kế marketing material chất lượng cao.",
      price: 149000,
      trailerUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      categorySlug: "ung-dung-ai",
    },
    {
      title: "Khóa Học Xây Dựng Chatbot AI Cho Doanh Nghiệp",
      description:
        "Tự xây dựng chatbot AI thông minh cho doanh nghiệp mà không cần biết code. Tích hợp ChatGPT, tự động hóa chăm sóc khách hàng và tăng chuyển đổi.",
      price: 349000,
      trailerUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      categorySlug: "ung-dung-ai",
    },

    // ── Thể hình ──
    {
      title: "Khóa Học Progressive Overload: Tập Gym Khoa Học",
      description:
        "Nắm vững nguyên tắc Progressive Overload để tối ưu kết quả tập gym. Lộ trình periodization chi tiết từ người mới đến nâng cao với phương pháp khoa học.",
      price: 199000,
      trailerUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      categorySlug: "the-hinh",
    },
    {
      title: "Khóa Học Dinh Dưỡng Thể Hình: Ăn Đúng Tập Hiệu Quả",
      description:
        "Hệ thống dinh dưỡng thể hình hoàn chỉnh. Cách tính macro, lập meal plan, chọn supplement và tối ưu chế độ ăn theo mục tiêu tăng cơ hoặc giảm mỡ.",
      price: 149000,
      trailerUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      categorySlug: "the-hinh",
    },
    {
      title: "Khóa Học Home Workout: Tập Thể Hình Tại Nhà Không Cần Dụng Cụ",
      description:
        "Chương trình tập thể hình tại nhà hiệu quả không cần gym hay dụng cụ. 12 tuần lộ trình bài bản giúp bạn giảm mỡ, tăng cơ và cải thiện sức khỏe.",
      price: 99000,
      trailerUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      categorySlug: "the-hinh",
    },
    {
      title: "Khóa Học Calisthenics: Làm Chủ Cơ Thể Với Bodyweight",
      description:
        "Từ cơ bản đến nâng cao với Calisthenics. Học pull-up, muscle-up, handstand và các kỹ thuật bodyweight nâng cao. Xây dựng sức mạnh và sự linh hoạt.",
      price: 179000,
      trailerUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      categorySlug: "the-hinh",
    },
  ];

  let createdCount = 0;

  for (const courseData of coursesData) {
    const categoryId = categoryRecords[courseData.categorySlug];
    if (!categoryId) {
      console.warn(`  ⚠️ Category not found: ${courseData.categorySlug}, skipping ${courseData.title}`);
      continue;
    }

    // Check if course already exists by title
    const existing = await prisma.course.findFirst({
      where: { title: courseData.title },
    });

    const authorId = authorRecords[courseData.categorySlug];

    if (existing) {
      await prisma.course.update({
        where: { id: existing.id },
        data: { authorId },
      });
      console.log(`  ⏭️ Already exists (updated author): ${courseData.title}`);
      continue;
    }

    await prisma.course.create({
      data: {
        title: courseData.title,
        description: courseData.description,
        price: courseData.price,
        trailerUrl: courseData.trailerUrl,
        categoryId,
        authorId,
      },
    });

    createdCount++;
    console.log(`  ✅ Course: ${courseData.title}`);
  }

  console.log(`\n🎉 Done! Created ${createdCount} courses across ${categories.length} categories.`);
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
