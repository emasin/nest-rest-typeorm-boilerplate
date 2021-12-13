import { Exclude } from 'class-transformer';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Roles } from '../app/roles.entity';

/**
 * Profile Entity Class
 */
@Entity({
  name: 'activity_reward',
})
export class ActivityReward {
  /**
   * UUID column
   */
  @PrimaryGeneratedColumn()
  id: number;


  /**
   *   reward_date: string; column
   */
  @Column({length:10})
      // tslint:disable-next-line:variable-name
  reward_date: string;

  /**
   *   hashkey: string; column
   */
  @Column()
      // tslint:disable-next-line:variable-name
  hash_key: string;

  /**
   * datetime column
   */
  @Column()
  datetime: string;

  /**
   * Username column
   */
  @Column()
  username: string;

  /**
   * groupid column
   */
  @Column()
      // tslint:disable-next-line:variable-name
  group_id: string;

  /**
   * contenttype column
   */
  @Column({nullable:true})
      // tslint:disable-next-line:variable-name
  content_type: string;

  /**
   * contentid column (gravatar url)
   */
  @Column({nullable:true})
      // tslint:disable-next-line:variable-name
  content_id: string;

  /**
   * userid column (gravatar url)
   */
  @Column()
      // tslint:disable-next-line:variable-name
  user_id: string;

  /**
   * userid column (gravatar url)
   */
  @Column()
      // tslint:disable-next-line:variable-name
  action: string;


}
