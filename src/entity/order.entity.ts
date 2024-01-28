import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { OrderItem } from "./order-item.entity";
import { Link } from "./link.entity";

@Entity('orders')
export class Order {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: true })
    transaction_id: string;

    @Column()
    user_id: string;

    @Column()
    code: string;

    @Column()
    ambassador_email: string;

    @Column()
    fullName: string;

    @Column()
    email: string;

    @Column({ nullable: true })
    address: string;

    @Column({ nullable: true })
    country: string;

    @Column({ nullable: true })
    city: string;

    @Column({ nullable: true })
    zip: string;

    @Column({ default: false })
    complete: boolean;

    @CreateDateColumn()
    created_at: Date;

    @OneToMany(() => OrderItem, orderItem => orderItem.order)
    order_items: OrderItem[];

    @ManyToOne(() => Link, link => link.orders, {
        createForeignKeyConstraints: false
    })
    @JoinColumn({
        referencedColumnName: 'code',
        name: 'code'
    })
    links: Link;

    get total(): number {
        return this.order_items.reduce((sum, i) => sum + i.admin_revenue, 0);
    }

    get ambassador_revenue(): number {
        return this.order_items.reduce((sum, i) => sum + i.ambassador_revenue, 0);
    }
    /* 
    *    get name(): string{
    *        return this.first_name + ' ' + this.last_name;
    *    }
    */
}