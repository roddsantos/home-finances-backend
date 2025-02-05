# home-finances-backend

Home Finances backend using NestJS

This project is the backend of the Home Finances project
This project uses the Javascript programming language, with the framework NestJS
For the database, this project uses MySQL

You can use this project locally, using a locally MySQL Workbench, use it with Docker, or you can use with an AWS ECS for the server, and use an AWS Relational Database Service (RDS) for connection

After cloning, you need to create a .env file in the project root, with the following info (if you're using AWS for the database and serving, use the RDS URL in DB_HOST):

```bash
PORT=<port number where the application will connect to the server>
DB_HOST=<database host>
DB_PORT=<database port>
DB_DATABASE=<database name>
DB_USERNAME=<database username>
DB_PASSWORD=<database password (if used)>
NODE_ENV=development
```

If you're using a Docker container, change the flag 'synchronize' to true in the file src/application/database/database.config.ts, use this command:

```bash
docker-compose up
```

...and after that, change again to false (and you can ignore all the steps ahead).

For developing purposes, do the following commands (in the project root):

```bash
$ npm install
```

And run the server:

```bash
$ npm start
```

Database (if you are using npm command)

To create the database, be sure to install the docker desktop app. After that, run the following command (outside the project root folder):

```bash
$ docker run --name home-finances-db -e MYSQL_ROOT_PASSWORD=homefinances -p 3306:3306 -v /etc/docker/home-finances-db:/etc/mysql/conf.d -v home-finances-db-data:/var/lib/mysql -d mysql
```

Then, change the flag synchronize to true in the file src/application/database/database.config.ts, and run the app. After that, change again to false.
