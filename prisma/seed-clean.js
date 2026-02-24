const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
require('dotenv').config()

const prisma = new PrismaClient()

async function main() {
  console.log('开始种子数据初始化（无图片数据）...')

  // 创建默认管理员
  console.log('创建默认管理员账户...')
  const adminUser = await prisma.user.upsert({
    where: { email: 'alens_china@126.com' },
    update: {},
    create: {
      email: 'alens_china@126.com',
      name: 'Admin',
      passwordHash: await bcrypt.hash('admin20220705', 10),
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
      title: '首  页',
      slug: 'home',
      type: 'CATEGORY',
      order: 0
    }
  })

  const portfolioNav = await prisma.navigation.upsert({
    where: { slug: 'category' },
    update: {},
    create: {
      title: '分  类',
      slug: 'category',
      type: 'PARENT',
      order: 1
    }
  })

  const worksNav = await prisma.navigation.upsert({
    where: { slug: 'works' },
    update: {},
    create: {
      title: '作品集',
      slug: 'works',
      type: 'PARENT',
      order: 2
    }
  })

  const aboutNav = await prisma.navigation.upsert({
    where: { slug: 'about' },
    update: {},
    create: {
      title: '关  于',
      slug: 'about',
      type: 'LINK',
      order: 3
    }
  })

  const contactNav = await prisma.navigation.upsert({
    where: { slug: 'contact' },
    update: {},
    create: {
      title: '联  系',
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
  console.log('  邮箱: alens_china@126.com')
  console.log('  密码: admin20220705')
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
