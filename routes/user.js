const {Router}=require("express");
const jwt = require("jsonwebtoken");
const User=require('../models/user')
const router=Router();
const { uploadAvatar } = require('../config/cloudinary');

function requireAuth(req, res, next) {
    if (!req.user) return res.redirect('/user/signin');
    next();
}

function buildUserPayload(user) {
    const normalizedAvatar = user.profileImageURL?.startsWith('/public/')
        ? user.profileImageURL.replace('/public/', '/')
        : user.profileImageURL || '/default.jpg';

    return {
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
        profileImageURL: normalizedAvatar,
        bio: user.bio || '',
        role: user.role,
    };
}



router.get('/signup',(req,res)=>{
    return res.render("signup");
})

router.get('/signin',(req,res)=>{
    return res.render("signin");
})

router.post('/signin', async (req,res)=>{
    const {email,password}=req.body;
    try{
        const token = await User.matchPasswordAndGenerateToken(email,password);
        res.cookie('token', token);
        return res.redirect("/");
    }
    catch(error){
        return res.render('signin',{
            error: "Incorrect Email or Password"
        })
    }
})

router.get('/profile', requireAuth, async (req, res) => {
    const dbUser = await User.findById(req.user._id);
    if (!dbUser) return res.redirect('/user/logout');

    const payload = buildUserPayload(dbUser);
    return res.render('profile', {
        user: payload,
        success: req.query.success,
        error: null,
    });
});

router.post('/profile', requireAuth, uploadAvatar.single('avatar'), async (req, res) => {
    try {
        const updates = {
            bio: req.body.bio || '',
        };

        if (req.file) {
            updates.profileImageURL = req.file.path;
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            updates,
            { new: true }
        );

        if (!updatedUser) return res.redirect('/user/logout');

        const payload = buildUserPayload(updatedUser);
        const token = jwt.sign(payload, "secret-key");
        res.cookie('token', token);

        return res.redirect('/user/profile?success=1');
    } catch (error) {
        const fallbackUser = req.user || {};
        return res.render('profile', {
            user: fallbackUser,
            success: null,
            error: 'Unable to update profile. Please try again.',
        });
    }
});

router.get('/logout',(req,res)=>{
    res.clearCookie('token').redirect("/")
})




router.post('/signup',async (req,res)=>{
    const {fullName,email,password}=req.body;
    await User.create({
        fullName,
        email,
        password
    })
    return res.redirect("/")
})

module.exports = router;