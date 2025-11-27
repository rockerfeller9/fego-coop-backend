import User from '../models/models.js';

export default async function admin(req, res, next) {
  try {
    console.log('🔐 Admin middleware - checking user:', req.user?.id);
    
    const user = await User.findById(req.user.id).select('isAdmin');
    
    console.log('👤 User found:', user ? 'Yes' : 'No');
    console.log('🛡️ Is admin:', user?.isAdmin);
    
    if (!user || !user.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    next();
  } catch (err) {
    console.error('❌ Admin middleware error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}