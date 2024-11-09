import { DataSource } from "typeorm"
import { Light } from "./entity/Light";
import { Color } from "./entity/Color";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT),
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    entities: [
        Light, Color
    ],
})