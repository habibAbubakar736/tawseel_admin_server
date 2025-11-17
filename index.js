require("dotenv").config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require('path');
app.use(bodyParser.json());

app.use(express.raw({ limit: '100mb' }));
app.use(express.json({ limit: '100mb', verify: (req, res, buf) => { req.rawBody = buf; } }));
app.use(express.urlencoded({ limit: '100mb', extended: true, parameterLimit: 50000 }));
app.use(bodyParser.json({ limit: '100mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));

// app.use(cors());
app.use(cors({ origin: '*' }));

app.use('/public', express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;

const MastersRouter = require("./Router/MastersRouter");
const UserRouter = require("./Router/UserRouter");
const OrderRouter = require("./Router/OrderRouter");

app.use("/Masters", MastersRouter);
app.use("/Users", UserRouter);
app.use("/Orders", OrderRouter);


app.listen(PORT, (error) => {
    if (error) {
        console.error(error);
    } else {
        console.log(`Server is running on port ${PORT}`);
    }
});
