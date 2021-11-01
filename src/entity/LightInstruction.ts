// address, color, version, platform, memory, x, y, sleep, last_updated, config;

import {Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn} from "typeorm";
import { Light } from "./Light";

@Entity()
export class LightInstruction {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    color: string;

    @Column()
    easing: string;

    @Column()
    delay: number;

    @Column()
    time: number;

    @OneToOne(() => Light)
    @JoinColumn()
    light: Light;
}