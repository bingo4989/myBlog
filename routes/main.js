const express = require('express');
const router = express.Router();
const mainLayout = "../views/layouts/main.ejs";
const Post = require("../models/Post");
const asynchandler = require("express-async-handler");

// index.ejs 를 랜더링 할때 mainLayout 레이아웃으로 감싸기
const asyncHandler = require("express-async-handler");

router.get(["/", "/home"],
    asyncHandler(async (req, res) => {
        const locals = {
            title: "Home",
        };

        const data = await Post.find({});
        res.render("index", { locals, data, layout: mainLayout });
    })
);

// GET post/:id
// 게시물 상세보기
router.get (
    "/post/:id",
    asyncHandler(async (req, res) => {
        // 데이터 1개만 가져옴
        const data = await Post.findOne({ _id:req.params.id });
        res.render("post", { data , layout: mainLayout });
    })
);



// about.ejs 를 랜더링 할때 mainLayout 레이아웃으로 감싸기
router.get("/about", (req, res) => {
    res.render("about", { layout: mainLayout });
});

module.exports = router;