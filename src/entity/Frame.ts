import {Entity, PrimaryGeneratedColumn, Column, OneToMany, JoinColumn} from "typeorm";
import { LightInstruction } from "./LightInstruction";

@Entity()
export class Frame {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    complete: boolean;

    @Column()
    created: Date;

    @OneToMany(() => LightInstruction, instruction => instruction.frame, {
        cascade: true
    })
    @JoinColumn()
    instructions: LightInstruction[];
}