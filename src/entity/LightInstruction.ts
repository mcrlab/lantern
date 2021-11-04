// address, color, version, platform, memory, x, y, sleep, last_updated, config;

import {Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, ManyToOne} from "typeorm";
import { Light } from "./Light";
import { Frame } from "./Frame";

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

    @ManyToOne(() => Light, light => light.instructions, {
        cascade: true
    })
    @JoinColumn()
    light: Light;

    @ManyToOne(() => Frame, frame => frame.instructions)
    frame: Frame
}