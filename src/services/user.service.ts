import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { sanitizeUser } from '@/utils/helpers';

// ==========================================
// CREATE USER
// ==========================================

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

// ==========================================
// FIND USERS
// ==========================================

// --Find user by email--
export async function FindUserByEmail(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email: email },
    });

    return user;
  } catch (error) {
    console.error('❌ Find user by email error:', error);
    return null;
  }
}

// --Find user by ID--
export async function FindUserId(id: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    return user ? sanitizeUser(user) : null;
  } catch (error) {
    console.error('❌ Find user by ID error:', error);
    return null;
  }
}

// --Check if user exists by email--
export async function UserExists(email: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    return !!user;
  } catch (error) {
    console.error('❌ Check user exists error:', error);
    return false;
  }
}
