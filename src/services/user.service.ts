import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { sanitizeUser } from '@/utils/helpers';

// --Create a new user--

export async function CreateUser(data: {
  id: string;
  name: string;
  email: string;
  password: string;
}) {
  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(data.password, saltRounds);

    const user = await prisma.user.create({
      data: {
        id: data.id,
        name: data.name,
        email: data.email,
        password: hashedPassword,
        emailVerified: new Date(),
      },
    });

    // --Remove password before returning user object--
    return sanitizeUser(user);
  } catch (error) {
    console.error('❌ Create user error:', error);
    throw error;
  }
}
