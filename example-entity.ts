import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  PrimaryColumn,
} from 'typeorm';
import { Product } from './product.entity';
import { ProductLine } from './product.line.entity';
import { RegisteredProduct } from './registered.product.entity';
import { ObjectType, ID, Field } from 'type-graphql';
import { Status } from '../../common/inputs/default.where.condition.input';
import { Args } from '@nestjs/graphql';
import { CreateDateColumn } from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { UserDTO } from '../../auth/dto/user.dto';

// Adding comments
@Entity()
@ObjectType()
export class ProductStyle extends BaseEntity {
  @PrimaryGeneratedColumn()
  // This decorator helps to retrieve the data in a nested relationship
  // e.g. productLines -> productStyles -> products
  @PrimaryColumn()
  @Field(type => ID)
  id: number;

  @Column()
  @Field()
  name: string;

  @Column()
  @Field()
  description: string;

  @Column({
    nullable: true,
  })
  @Field({ nullable: true })
  image?: string;

  @Field()
  @CreateDateColumn({
    type: 'timestamp with time zone',
  })
  createdAt: Date;

  @ManyToOne(
    type => User,
    user => user.productStylesCreated,
    {
      eager: lazy,
    },
  )
  @Field(type => UserDTO)
  createdBy: User;

  @Field(type => Status)
  @Column({
    type: 'enum',
    enum: Status,
    default: Status.ACTIVE,
  })
  status: Status;

  @ManyToOne(
    type => ProductLine,
    productLine => productLine.productStyles,
    // * Lazy relations (as mentioned in the official documentation) are:
    // "Promises: when you call them they return promise which resolve
    // relation result then. If your property's type is Promise then
    // this relation is set to lazy automatically.
    {
      // ! the relation option must be lazy instead of eager because of
      // ! the nested relationships of the flow mentioned above
      lazy: true,
    },
  )
  @Field(type => ProductLine)
  productLine: ProductLine;

  @OneToMany(
    type => Product,
    product => product.productStyle,
  )
  productRelation: Product[];

  @Field(type => [Product], { nullable: true })
  products(
    @Args({
      name: 'status',
      description: `This argument helps to retrieve the relations filtered by
      logical deletion - by default, the relation retrieves only active records`,
      nullable: true,
      type: () => Status,
    })
    status: Status,
  ): Product[] {
    if (status != null) {
      return this.productRelation.filter(product => product.status === status);
    }
    return this.productRelation.filter(
      product => product.status === Status.ACTIVE,
    );
  }

  @OneToMany(
    type => RegisteredProduct,
    registeredProduct => registeredProduct.productStyle,
  )
  @Field(type => [RegisteredProduct], { nullable: true })
  registeredProducts: RegisteredProduct[];
}
