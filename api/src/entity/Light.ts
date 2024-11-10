import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";

@Entity({ name: 'light' })
export class Light {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    address: string;

    @Column()
    color: string;

    @Column({"type": "float"})
    x: number = 0.0;

    @Column()
    lastUpdated: Date;

}