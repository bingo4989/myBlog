const express = require('express');
const router = express.Router();
const adminLayout = "../views/layouts/admin";
const adminLayout2 = "../views/layouts/admin-nologout";
const asyncHandler = require("express-async-handler"); // try/catch 대신 사용
const bcrypt = require("bcrypt");
const User = require("../models/User");
// jwt 추가
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;
// model
const Post = require("../models/Post");


/*
 GET /admin
 Admin page
*/
router.get("/admin", (req, res) => {
    //res.send("Admin Page");
    const locals = {
        title: "관리자 페이지",
    };

    // adminLayout을 사용해서 admin/index.ejs 렌더링하기
    res.render("admin/index", {locals, layout: adminLayout2});
});

/*
 POST /admin
 admin login
 */
router.post (
    "/admin",
    asyncHandler(async (req, res) => {
        const { username, password } = req.body;

        // if ( username === "admin" && password === "admin" ) {
        //     res.send("Success");
        // } else {
        //     res.send("Failure");
        // }

        // 사용자 이름으로 사용자 찾기
        const user = await User.findOne({ username });

        // 일치하는 사용자가 없으면 401 오류 표시
        if ( !user ) {
            return res.status(401).json({ message: "일치하는 사용자가 없습니다."});
        }

        // 비번 비교
        const isValidPassword = await bcrypt.compare(password, user.password);

        if ( !isValidPassword ) {
            return res.status(401).json({message: "비밀번호가 일치하지 않습니다."});
        }
        // 토큰 생성
        const token = jwt.sign({id:user._id}, jwtSecret);
        // 토큰을 쿠기에 저장
        res.cookie("token", token, { httpOnly: true });

        // 로그인이 성공하면 전체 게시물에 목록 페이지로 이동
        res.redirect("/allPosts");
    })
);

/*
GET : /register
Register administrator
 */
router.get (
    "/register", asyncHandler(async (req, res) => {
        res.render("admin/index", {layout: adminLayout2});
    })
);

/*
    check Login
 */
const checkLogin = (req, res, next) => {
    const token = req.cookies.token;  // 쿠키정보

    if (!token) {
        res.redirect("/admin");
    }

    try {
        const decoded = jwt.verify(token, jwtSecret);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.redirect("/admin");
    }
};

/* GET /allPosts
   GET all posts
 */
router.get (
    "/allPosts",
    checkLogin,
    asyncHandler(async (req, res) => {
        const locals = {
            title:"Posts",
        };
        //const data = await Post.find();
        const data = await Post.find().sort({updatedAt:"desc", createdAt:"desc"});
        res.render("admin/allPosts", {
            locals,
            data,
            layout: adminLayout,
        });
    })
);


/*
    GET /logout
    Admin logout
 */
router.get("/logout", (req, res) => {
    res.clearCookie("token");
    res.redirect("/");
})

/*
    GET /add
    Admin - Add Post
 */
router.get(
    "/add",
    checkLogin,
    asyncHandler(async (req, res) => {
        const locals = {
            title: "게시글 작성",
        };
        res.render("admin/add", {
            locals,
            layout: adminLayout,
        });
    })
);

/*
    POST /add
    Admin - Add Post
 */
router.post(
    "/add",
    checkLogin,
    asyncHandler(async (req, res) => {
        const { title, body } = req.body;

        const newPost = new Post ( {
            title:title,
            body:body,
        });

        await Post.create(newPost);

        res.redirect("/allPosts");
    })
);

/*
    GET /edit/:id
    Admin - Edit Post
 */
router.get (
    "/edit/:id",
    checkLogin,
    asyncHandler(async (req, res) => {
        const locals = {
            title: "게시물 편집",
        };

        // id값으로 계시물 가져오기
        const data = await Post.findOne({ _id: req.params.id });
        res.render("admin/edit", {
            locals,
            data,
            layout: adminLayout,
        });
    })
);

/*
    PUT /edit/:id
    Admin - Edit Post
 */
router.put (
    "/edit/:id",
    checkLogin,
    asyncHandler(async (req, res) => {
        await Post.findByIdAndUpdate(req.params.id, {
            title: req.body.title,
            body: req.body.body,
            createdAt: new Date(),
        });

        // 수정한후 전체목록 페이지로 이동
        res.redirect("/allPosts");
    })
);

/*
    DELETE /delete/:id
    Admin - Delete Post
 */
router.delete (
    "/delete/:id",
    checkLogin,
    asyncHandler(async (req, res) => {
        await Post.deleteOne({_id: req.params.id});
        res.redirect("/allPosts");
    })
);

module.exports = router;