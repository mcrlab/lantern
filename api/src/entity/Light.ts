import {Entity, PrimaryGeneratedColumn, Column, OneToMany} from "typeorm";

@Entity()
export class Light {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    address: string;

    @Column()
    name: string;

    @Column()
    color: string;

    @Column()
    version: string;

    @Column()
    platform: string;

    @Column({"type": "float"})
    x: number = 0.0;

    @Column()
    sleep: number;

    @Column()
    lastUpdated: Date;

    @Column("json")
    config: {};

}