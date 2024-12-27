import { PrismaClient } from '@prisma/client';
import { hash } from 'argon2';

const prisma = new PrismaClient();

async function main() {
  // Хэширование паролей
  const hashedPasswordAdmin = await hash('admin'); // Используем argon2 для хэширования


  // Создание администратора
  await prisma.user.create({
    data: {
      name: 'admin',
      email: 'admin@admin.com',
      password: hashedPasswordAdmin, // Сохраняем хэшированный пароль
      login: 'admin',
    },
  });

  console.log('Users created!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
