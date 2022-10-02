import {Entity, PrimaryGeneratedColumn, Column, OneToMany, JoinColumn} from "typeorm";
import { LightInstruction } from "./LightInstruction";

@Entity()
export class Frame {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    wait: number;

    @Column()
    complete: boolean;

    @Column()
    created: Date;

    @Column()
    start_time: number;
    
    @OneToMany(() => LightInstruction, instruction => instruction.frame, {
        cascade: true
    })
    @JoinColumn()
    instructions: LightInstruction[];
}