import dotenv from "dotenv";
import express from "express";

dotenv.config();
const port = process.env.SERVER_PORT;
import * as routes from "./routes";


interface User {
  name: string;
  id: number
};

class UserAccount {
  name: string;
  id: number;
  cheese: string;

  constructor(name: string, id: number) {
    this.name = name;
    this.id = id;
    this.cheese = "Gouder";
  }
}

const user1: User = new UserAccount("James", 5);

const user2: User ={
  name: "James",
  id: 3,
};

const app = express();

routes.register( app );

app.listen( port, () => {
  // tslint:disable-next-line:no-console
  console.log( `server started at http://localhost:${ port }` );
} );
