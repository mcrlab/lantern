// address, color, version, platform, memory, x, y, sleep, last_updated, config;

import {Entity, PrimaryGeneratedColumn, Column, OneToMany} from "typeorm";
import { LightInstruction } from "./LightInstruction";

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

    @OneToMany(() => LightInstruction, instruction => instruction.light,{
        onDelete: "CASCADE"
    })
    instructions: LightInstruction[];


}