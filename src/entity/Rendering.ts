import {Entity, PrimaryGeneratedColumn, Column, OneToMany, JoinColumn} from "typeorm";
import { LightInstruction } from "./LightInstruction";

@Entity()
export class Rendering {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    complete: boolean;

    @Column()
    lastUpdated: Date;

    @OneToMany(() => LightInstruction, instruction => instruction.rendering, {
        cascade: true
    })
    @JoinColumn()
    instructions: LightInstruction[];
}