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

// ==========================================
// PASSWORD OPERATIONS
// ==========================================

// --Verify user password--
export async function VerifyPassword(
  email: string,
  password: string
): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { password: true },
    });

    if (!user || !user.password) {
      return false;
    }

    const isValid = await bcrypt.compare(password, user.password);
    return isValid;
  } catch (error) {
    console.error('❌ Verify password error:', error);
    return false;
  }
}

// ==========================================
// UPDATE OPERATIONS
// ==========================================

// --Mark user's email as verified--
export async function VerifyUserEmail(email: string) {
  try {
    const user = await prisma.user.update({
      where: { email },
      data: { emailVerified: new Date() },
    });

    return sanitizeUser(user);
  } catch (error) {
    console.error('❌ Verify user email error:', error);
    return null;
  }
}

// --Update user information--
export async function UpdateUser(
  id: string,
  data: Partial<{
    name: string;
    email: string;
    image: string;
    bio: string;
  }>
) {
  try {
    const user = await prisma.user.update({
      where: { id },
      data,
    });

    return sanitizeUser(user);
  } catch (error) {
    console.error('❌ Update user error:', error);
    return null;
  }
}
