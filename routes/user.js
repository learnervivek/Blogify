const {Router}=require("express");
const jwt = require("jsonwebtoken");
const User=require('../models/user')
const router=Router();
const { uploadAvatar } = require('../config/cloudinary');
const util = require('util');

function formatError(err) {
    if (!err) return 'Unable to update profile. Please try again.';
    if (typeof err === 'string') return err;
    // Common Cloudinary / multer shapes
    if (err?.message && typeof err.message === 'string' && err.message !== '[object Object]') return err.message;
    if (err?.error?.message) return err.error.message;
    if (err?.response?.body?.error?.message) return err.response.body.error.message;
    if (err?.http_code && err?.message) return `${err.http_code}: ${err.message}`;
    try {
        const json = JSON.stringify(err);
        if (json && json !== '{}') return json;
    } catch (_) {}
    try {
        const inspected = util.inspect(err, { depth: 2 });
        if (inspected) return inspected;
    } catch (_) {}
    return 'Unable to update profile. Please try again.';
}

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

function withUploadSingle(upload, fieldName) {
    return (req, res, next) => {
        upload.single(fieldName)(req, res, (err) => {
            if (err) return next(err);
            next();
        });
    };
}

router.post('/profile', requireAuth, withUploadSingle(uploadAvatar, 'avatar'), async (req, res) => {
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
        console.error('Avatar/profile update failed:', util.inspect(error, { depth: 4 }));
        const fallbackUser = req.user || {};
        return res.render('profile', {
            user: fallbackUser,
            success: null,
            error: formatError(error),
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