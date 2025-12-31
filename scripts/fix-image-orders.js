const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function fixImageOrders() {
  console.log('Fixing image order values...')

  // Get all categories
  const categories = await prisma.category.findMany({
    include: {
      images: {
        include: { image: true },
        orderBy: { createdAt: 'asc' }
      }
    }
  })

  for (const category of categories) {
    // Update each image's order based on its position
    for (let i = 0; i < category.images.length; i++) {
      const categoryImage = category.images[i]
      if (categoryImage.order !== i) {
        await prisma.categoryImage.update({
          where: { id: categoryImage.id },
          data: { order: i }
        })
        console.log(`Updated ${categoryImage.image.alt} in ${category.name} to order ${i}`)
      }
    }
  }

  console.log('Done!')
}

fixImageOrders()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  })
