// address, color, version, platform, memory, x, y, sleep, last_updated, config;

import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";

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

    @Column()
    memory: string;

    @Column({nullable: true})
    voltage: string;

    @Column()
    x: number;

    @Column()
    y: number;

    @Column()
    sleep: number;

    @Column()
    lastUpdated: Date;

    @Column("json")
    config: {};



}