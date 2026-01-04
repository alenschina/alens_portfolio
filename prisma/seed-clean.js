const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
require('dotenv').config()

const prisma = new PrismaClient()

async function main() {
  console.log('开始种子数据初始化（无图片数据）...')

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

  console.log('✅ 种子数据初始化完成（无图片）!')
  console.log('默认管理员账户:')
  console.log('  邮箱: admin@alens.com')
  console.log('  密码: admin123')
  console.log('\n注意: 图片数据需要通过后台管理界面上传或自行添加')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
