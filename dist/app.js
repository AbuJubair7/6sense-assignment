import express from "express";
const app = express();
app.get("/", (req, res) => {
    res.send("Hello, 6sense!");
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
//# sourceMappingURL=app.js.map