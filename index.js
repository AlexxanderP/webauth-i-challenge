const server = require("./api/server.js");

// server.use(helmet());
// server.use(express.json());
// server.use(cors());

const port = process.env.PORT || 6500;
server.listen(port, () => console.log(`\n** Running on port ${port} **\n`));
