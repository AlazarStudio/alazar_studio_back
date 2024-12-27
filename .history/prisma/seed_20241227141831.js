import { PrismaClient } from '@prisma/client';
import { hash } from 'argon2';

const prisma = new PrismaClient();

async function main() {
  // Хэширование паролей
  const hashedPasswordAdmin = await hash('admin'); // Используем argon2 для хэширования
  const hashedPasswordUser = await hash('noAdmin');

  // Создание администратора
  await prisma.user.create({
    data: {
      name: 'admin',
      email: 'admin@admin.com',
      password: hashedPasswordAdmin, // Сохраняем хэшированный пароль
      login: 'admin',
      role: 'ADMIN',
    },
  });

  // Создание обычного пользователя
  await prisma.user.create({
    data: {
      name: 'noAdmin',
      email: 'noAdmin@noAdmin.com',
      password: hashedPasswordUser, // Сохраняем хэшированный пароль
      login: 'noAdmin',
      role: 'USER',
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
