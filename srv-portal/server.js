var express = require('express');
const xsenv = require('@sap/xsenv');
var { middleware } = require("@sap/hdbext");
const session = require('express-session')
const compression = require('compression')
const helmet = require('helmet')
const { rateLimit } = require('express-rate-limit')
const xXssProtection = require("x-xss-protection");

var app = express();

xsenv.loadEnv("./default-env.json"); // load default-env.json file
const config = require ("./config.json");
const services = xsenv.getServices({ // get services from xsuaa tag
    hana: { tag: 'hana' }
});


const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
	standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
})

app.use(limiter)

const publicRoutes = require("./routes/public-routes");
const portalRoutes = require("./routes/portal-routes.js");
const { validateUser } = require("./middleware/validate-user.js");

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({
    limit: '50mb',
    extended: true
}));
app.use('/', express.static('images'));
app.use(session({
    secret: config.SESSION_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: { 
        secure: true, 
        sameSite: 'strict' 
    }
}))
app.use(compression())
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.message.indexOf('JSON') !== -1) {
        console.log("Invalid JSON passed as request body.")
        return res.json({
            status: 400,
            message: 'Invalid JSON'
        });
    }
    next();
});

app.set('trust proxy', 1);
app.use(middleware(services.hana));
app.use((req, res, next) => {
    res.setHeader('Permissions-Policy', 'fullscreen=*');
    res.setHeader("X-XSS-Protection", "1; mode=block");
    next();
});
app.use(helmet({
    referrerPolicy: {
      policy: ["no-referrer"],
    },
    xFrameOptions: { action: "sameorigin" },
    // xssFilter: true,
    // xContentTypeOptions: "nosniff",
    strictTransportSecurity: {
        maxAge: 31536000,
        preload: true,
    },
    contentSecurityPolicy: {
        directives: {
          "script-src": ["'self'"],
          "style-src": "'self'",
        },
    }
  }))
  
app.use("/api/public/v1", publicRoutes);
app.use("/api/portal/v1", validateUser, portalRoutes);

const port = process.env.PORT || 4006;

app.listen(port, function () {
    console.log(`listening on port ${port}`);
});