const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
require('dotenv').config()

const prisma = new PrismaClient()

async function main() {
  console.log('开始种子数据初始化...')

  // 创建默认管理员
  console.log('创建默认管理员账户...')
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@alens.com' },
    update: {},
    create: {
      email: 'admin@alens.com',
      name: 'Admin',
      passwordHash: await bcrypt.hash('admin123', 10),
      role: 'SUPER_ADMIN'
    }
  })
  console.log(`管理员账户创建成功: ${adminUser.email}`)

  // 创建导航结构
  console.log('创建导航结构...')

  // 创建顶级导航项
  const homeNav = await prisma.navigation.upsert({
    where: { slug: 'home' },
    update: {},
    create: {
      title: 'HOME',
      slug: 'home',
      type: 'CATEGORY',
      order: 0
    }
  })

  const portfolioNav = await prisma.navigation.upsert({
    where: { slug: 'portfolio' },
    update: {},
    create: {
      title: 'PORTFOLIO',
      slug: 'portfolio',
      type: 'PARENT',
      order: 1
    }
  })

  const worksNav = await prisma.navigation.upsert({
    where: { slug: 'works' },
    update: {},
    create: {
      title: 'WORKS',
      slug: 'works',
      type: 'PARENT',
      order: 2
    }
  })

  const aboutNav = await prisma.navigation.upsert({
    where: { slug: 'about' },
    update: {},
    create: {
      title: 'ABOUT',
      slug: 'about',
      type: 'LINK',
      order: 3
    }
  })

  const contactNav = await prisma.navigation.upsert({
    where: { slug: 'contact' },
    update: {},
    create: {
      title: 'CONTACT',
      slug: 'contact',
      type: 'LINK',
      order: 4
    }
  })

  // 创建分类并关联导航
  console.log('创建分类...')

  const categories = [
    {
      name: 'Home',
      slug: 'home',
      navId: homeNav.id,
      order: 0
    },
    {
      name: 'Architecture',
      slug: 'portfolio-architecture',
      navTitle: 'ARCHITECTURE',
      parentNavId: portfolioNav.id,
      order: 0
    },
    {
      name: 'Landscape',
      slug: 'portfolio-landscape',
      navTitle: 'LANDSCAPE',
      parentNavId: portfolioNav.id,
      order: 1
    },
    {
      name: 'Portrait',
      slug: 'portfolio-portrait',
      navTitle: 'PORTRAIT',
      parentNavId: portfolioNav.id,
      order: 2
    },
    {
      name: 'Street Photography',
      slug: 'portfolio-street',
      navTitle: 'STREET PHOTOGRAPHY',
      parentNavId: portfolioNav.id,
      order: 3
    },
    {
      name: 'Urban Perspectives',
      slug: 'works-urban',
      navTitle: 'URBAN PERSPECTIVES',
      parentNavId: worksNav.id,
      order: 0
    },
    {
      name: "Nature's Light",
      slug: 'works-nature',
      navTitle: "NATURE'S LIGHT",
      parentNavId: worksNav.id,
      order: 1
    },
    {
      name: 'Human Stories',
      slug: 'works-human',
      navTitle: 'HUMAN STORIES',
      parentNavId: worksNav.id,
      order: 2
    }
  ]

  for (const categoryData of categories) {
    const category = await prisma.category.upsert({
      where: { slug: categoryData.slug },
      update: {},
      create: {
        name: categoryData.name,
        slug: categoryData.slug,
        order: categoryData.order
      }
    })

    // 创建对应的导航项
    if ('navId' in categoryData) {
      await prisma.navigation.update({
        where: { id: categoryData.navId },
        data: { categoryId: category.id }
      })
    } else if ('parentNavId' in categoryData) {
      await prisma.navigation.create({
        data: {
          title: categoryData.navTitle,
          slug: categoryData.slug,
          type: 'CATEGORY',
          parentId: categoryData.parentNavId,
          categoryId: category.id,
          order: categoryData.order
        }
      })
    }
  }

  // 导入图片数据
  console.log('导入图片数据...')

  const imageData = {
    'home': [
      { src: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=2000&q=85', alt: 'Featured Work 1' },
      { src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=2000&q=85', alt: 'Featured Work 2' },
      { src: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=2000&q=85', alt: 'Featured Work 3' },
      { src: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=2000&q=85', alt: 'Featured Work 4' },
      { src: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=2000&q=85', alt: 'Featured Work 5' }
    ],
    'portfolio-architecture': [
      { src: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=2000&q=85', alt: 'Urban Architecture Photography' },
      { src: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=2000&q=85', alt: 'Modern Building Architecture' },
      { src: 'https://images.unsplash.com/photo-1479839672679-a46483c0e7c8?w=2000&q=85', alt: 'Architectural Detail' },
      { src: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=2000&q=85', alt: 'Building Structure' }
    ],
    'portfolio-landscape': [
      { src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=2000&q=85', alt: 'Mountain Landscape' },
      { src: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=2000&q=85', alt: 'Ocean Sunset' },
      { src: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=2000&q=85', alt: 'Valley View' },
      { src: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=2000&q=85', alt: 'Nature Scenery' }
    ],
    'portfolio-portrait': [
      { src: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=2000&q=85', alt: 'Portrait Photography 1' },
      { src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=2000&q=85', alt: 'Portrait Photography 2' },
      { src: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=2000&q=85', alt: 'Portrait Photography 3' }
    ],
    'portfolio-street': [
      { src: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=2000&q=85', alt: 'Street Photography 1' },
      { src: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=2000&q=85', alt: 'Street Photography 2' },
      { src: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=2000&q=85', alt: 'Street Photography 3' }
    ],
    'works-urban': [
      { src: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=2000&q=85', alt: 'Urban Perspectives 1' },
      { src: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=2000&q=85', alt: 'Urban Perspectives 2' },
      { src: 'https://images.unsplash.com/photo-1479839672679-a46483c0e7c8?w=2000&q=85', alt: 'Urban Perspectives 3' }
    ],
    'works-nature': [
      { src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=2000&q=85', alt: "Nature's Light 1" },
      { src: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=2000&q=85', alt: "Nature's Light 2" },
      { src: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=2000&q=85', alt: "Nature's Light 3" }
    ],
    'works-human': [
      { src: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=2000&q=85', alt: 'Human Stories 1' },
      { src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=2000&q=85', alt: 'Human Stories 2' },
      { src: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=2000&q=85', alt: 'Human Stories 3' }
    ]
  }

  // 为每个分类导入图片
  // 首先收集所有唯一的图片，避免重复创建
  const allImagesMap = new Map()

  for (const [slug, images] of Object.entries(imageData)) {
    for (const img of images) {
      const key = `${img.src}-${img.alt}`
      if (!allImagesMap.has(key)) {
        allImagesMap.set(key, img)
      }
    }
  }

  // 创建所有唯一的图片
  console.log('创建图片记录...')
  const createdImages = []
  for (const [key, img] of allImagesMap) {
    const image = await prisma.image.create({
      data: {
        alt: img.alt,
        originalUrl: img.src
      }
    })
    createdImages.push({ key, image, alt: img.alt, src: img.src })
  }
  console.log(`创建了 ${createdImages.length} 张唯一图片`)

  // 为每个分类创建图片关联
  for (const [slug, images] of Object.entries(imageData)) {
    const category = await prisma.category.findUnique({
      where: { slug }
    })

    if (category) {
      let carouselIndex = 0
      for (let i = 0; i < images.length; i++) {
        const img = images[i]
        const key = `${img.src}-${img.alt}`

        // 找到对应的图片记录
        const imageRecord = createdImages.find(item => item.key === key)
        if (imageRecord) {
          await prisma.categoryImage.create({
            data: {
              imageId: imageRecord.image.id,
              categoryId: category.id,
              order: i,
              isCarousel: slug === 'home', // 只有首页分类的图片设为轮播图
              carouselOrder: slug === 'home' ? carouselIndex++ : null
            }
          })
        }
      }
      console.log(`分类 ${slug} 关联了 ${images.length} 张图片`)
    }
  }

  console.log('✅ 种子数据初始化完成!')
  console.log('默认管理员账户:')
  console.log('  邮箱: admin@alens.com')
  console.log('  密码: admin123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
