# home-finances-backend

Home Finances backend using NestJS

This project is the backend of the Home Finances project
This project uses the Javascript programming language, with the framework NestJS
For the database, this project uses MySQL

You can use this project locally, using a locally MySQL Workbench, or you can use with an AWS ECS for the server, and use an AWS Relational Database Service (RDS) for connection, but this is optional

After cloning, you need to create a .env file in the project root, with the following info:

```bash
PORT=<port number where the application will connect to the server>
DB_HOST=<database host>
DB_PORT=<database port>
DB_DATABASE=<database name>
DB_USERNAME=<database username>
DB_PASSWORD=<database password (if used)>
NODE_ENV=development
```

After this step do the next in the terminal (in the project root): 
```bash
$ npm install
```

And finally, you can run the server:
```bash
$ npm start
```

