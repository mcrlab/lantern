import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";

@Entity()
export class MQTTUser {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    username: string;

    @Column()
    password: string;

    @Column()
    isActive: boolean;

    @Column()
    isAdmin: boolean;

}
