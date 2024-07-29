import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from "../../../db";
import bcrypt from 'bcrypt'
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method not allowed' });
    }
  
    const { name, email, password } = req.body;
  
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }
  
    try {
      const existingUser = await db.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already exists' });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await db.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      });
  
      res.status(201).json({ message: 'User created successfully', userId: user.id });
    } catch (error) {
      res.status(500).json({ message: 'An error occurred during sign up' });
    }
  }
  
  