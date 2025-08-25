import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from './userModel.js';


const generateToken = (user: any): string => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET environment variable is not defined');
  }

  return jwt.sign(
    { 
      userId: user._id,
      email: user.email,
      role: user.role
    },
    jwtSecret,
    { expiresIn: '30d' }
  );
};


export const registerStudent = async (req: Request, res: Response) => {
  try {



    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(req.body.email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Password strength validation
    if (req.body.password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

    // Create new user
    const newUser = new User({
      ...req.body, email: req.body.email.toLowerCase(), password: hashedPassword, role: 'student'
      
    });

    // Save user to database
    const savedUser = await newUser.save();

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET environment variable is not defined');
    }

    const token = jwt.sign(
      { 
        userId: savedUser._id,
        email: savedUser.email,
        role: savedUser.role
      },
      jwtSecret,
      { 
        expiresIn: '30d',
      }
    );


    const { password, ...userWithoutPassword } = newUser.toObject();
    

    // Send successful response
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: userWithoutPassword,
        token
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle specific MongoDB errors
    if (error instanceof Error) {
      if (error.message.includes('E11000')) {
        return res.status(409).json({
          success: false,
          message: 'User with this email already exists'
        });
      }
    }

    // Generic error response
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.'
    });
  }
};



export const registerTeacher = async (req: Request, res: Response) => { 
    try { 
        const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

    // Create new user
    const newUser = new User({
      ...req.body, email: req.body.email.toLowerCase(), password: hashedPassword, role: 'teacher'
      
    });

    // Save user to database
    const savedUser = await newUser.save();

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET environment variable is not defined');
    }

    const token = jwt.sign(
      { 
        userId: savedUser._id,
        email: savedUser.email,
        role: savedUser.role
      },
      jwtSecret,
      { 
        expiresIn: '30d',
      }
    );


    const { password, ...userWithoutPassword } = newUser.toObject();
    

    // Send successful response
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: userWithoutPassword,
        token
      }
    });
    } catch (error) {
    console.error('Registration error:', error);
    
    // Handle specific MongoDB errors
    if (error instanceof Error) {
      if (error.message.includes('E11000')) {
        return res.status(409).json({
          success: false,
          message: 'User with this email already exists'
        });
      }
    }

    // Generic error response
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.'
    });
  }
};


export const registerAdmin = async (req: Request, res: Response) => { 
    try { 
        const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

    // Create new user
    const newUser = new User({
      ...req.body, email: req.body.email.toLowerCase(), password: hashedPassword, role: 'admin'
      
    });

    // Save user to database
    const savedUser = await newUser.save();

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET environment variable is not defined');
    }

    const token = jwt.sign(
      { 
        userId: savedUser._id,
        email: savedUser.email,
        role: savedUser.role
      },
      jwtSecret,
      { 
        expiresIn: '30d',
      }
    );


    const { password, ...userWithoutPassword } = newUser.toObject();
    

    // Send successful response
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: userWithoutPassword,
        token
      }
    });
    } catch (error) {
    console.error('Registration error:', error);
    
    // Handle specific MongoDB errors
    if (error instanceof Error) {
      if (error.message.includes('E11000')) {
        return res.status(409).json({
          success: false,
          message: 'User with this email already exists'
        });
      }
    }

    // Generic error response
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.'
    });
  }
};


export const loginStudent = async (req: Request, res: Response) => {
  try {
   const user = await User.findOne({ 
      email: req.body.email.toLowerCase(),
      role: 'student'
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email'
      });
    }

    const isPasswordValid = await bcrypt.compare(req.body.password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid  password'
      });
    }

    const token = generateToken(user);


    const { password, ...userWithoutPassword } = user.toObject();

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: userWithoutPassword,
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
};

// Login functions for other roles
export const loginTeacher = async (req: Request, res: Response) => {
  try {
    const user = await User.findOne({ 
      email: req.body.email.toLowerCase(),
      role: 'teacher'
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email'
      });
    }

    const isPasswordValid = await bcrypt.compare(req.body.password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid  password'
      });
    }

    const token = generateToken(user);


    const { password, ...userWithoutPassword } = user.toObject();

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: userWithoutPassword,
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
};

export const loginAdmin = async (req: Request, res: Response) => {
  try {
    const user = await User.findOne({ 
      email: req.body.email.toLowerCase(),
      role: 'admin'
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email '
      });
    }

    const isPasswordValid = await bcrypt.compare(req.body.password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }

   const token = generateToken(user);


    const { password, ...userWithoutPassword } = user.toObject();

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: userWithoutPassword,
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
};

// Universal login function (alternative approach)
export const loginUser = async (req: Request, res: Response) => {
  try {
    const query: any = { email: req.body.email.toLowerCase() };
    
    // If role is provided, filter by role
    if (req.body.role) {
      query.role = req.body.role;
    }

    const user = await User.findOne(query);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const isPasswordValid = await bcrypt.compare(req.body.password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = generateToken(user);
    const { password, ...userWithoutPassword } = user.toObject();

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: userWithoutPassword,
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
};